import Tesseract, { PSM } from 'tesseract.js';
// FIX: Using a namespace import for 'jimp' to handle potential module resolution issues with its default export.
import * as jimp from 'jimp';
import { Buffer } from 'buffer';

// FIX: Manually access the default export from the namespace. This is a common workaround for bundler/TypeScript interop issues with some ESM packages.
const Jimp = (jimp as any).default || jimp;

// Helper to get a Buffer from either a File object or a base64 string
const getImageBuffer = async (image: string | File): Promise<Buffer> => {
    if (typeof image === 'string') {
        // Handle base64 string from webcam
        const base64Data = image.split(',')[1];
        return Buffer.from(base64Data, 'base64');
    }
    // Handle File object from upload
    const arrayBuffer = await image.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

// Pre-process the image for better OCR results
const preprocessImage = async (image: string | File): Promise<Buffer> => {
    const imageBuffer = await getImageBuffer(image);
    // FIX: The `Jimp.read` method is now correctly accessed from the resolved Jimp object.
    const jimpImage = await Jimp.read(imageBuffer);
    
    // Convert to greyscale, increase contrast, and normalize for clarity
    jimpImage
        .greyscale()
        .contrast(0.4)
        .normalize();

    // FIX: The `Jimp.MIME_PNG` property is now correctly accessed from the resolved Jimp object.
    return jimpImage.getBufferAsync(Jimp.MIME_PNG);
};


export const recognizeText = async (
  image: string | File,
  onProgress: (progress: number) => void,
  language: string,
  highAccuracy: boolean
): Promise<string> => {
  onProgress(0);

  let processedImageBuffer: Buffer;
  try {
    processedImageBuffer = await preprocessImage(image);
    onProgress(10); // Allocate first 10% to preprocessing
  } catch (error) {
    console.error('Image preprocessing failed:', error);
    onProgress(0);
    return 'Error: Could not preprocess image.';
  }

  const langPath = highAccuracy 
    ? 'https://tessdata.projectnaptha.com/4.0.0' 
    : 'https://tessdata.projectnaptha.com/4.0.0_fast';

  const worker = await Tesseract.createWorker(language, undefined, {
    langPath,
    logger: m => {
      let baseProgress = 0;
      switch (m.status) {
        case 'loading tesseract core':
          baseProgress = 5;
          break;
        case 'initialized tesseract':
          baseProgress = 10;
          break;
        case 'loading language traineddata':
          baseProgress = 15 + (m.progress || 0) * 30;
          break;
        case 'loaded language traineddata':
          baseProgress = 45;
          break;
        case 'initializing api':
          baseProgress = 50;
          break;
        case 'recognizing text':
          baseProgress = 50 + (m.progress || 0) * 45;
          break;
      }
      // Scale worker progress to fit within the 10-100% range
      const totalProgress = 10 + (baseProgress / 100) * 90;
      if (totalProgress < 100) {
        onProgress(Math.round(totalProgress));
      }
    },
  });

  try {
    // Set Page Segmentation Mode to Auto with Orientation/Script Detection for better accuracy
    // FIX: Use the PSM enum from tesseract.js for type safety instead of a string literal.
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO_OSD,
    });
    
    const { data: { text } } = await worker.recognize(processedImageBuffer);
    
    onProgress(100);
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    onProgress(0);
    return 'Error during text recognition.';
  } finally {
    await worker.terminate();
  }
};
