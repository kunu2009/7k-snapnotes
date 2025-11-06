import Tesseract, { PSM } from 'tesseract.js';

// Helper function to read a File/Blob and convert it to a Data URL
const readImageAsDataURL = (imageFile: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(imageFile);
    });
};

// Pre-process the image for better OCR results using the browser's native Canvas API
const preprocessImage = async (image: string | File): Promise<Blob> => {
    const imageUrl = typeof image === 'string' ? image : await readImageAsDataURL(image);

    return new Promise((resolve, reject) => {
        const img = new Image();
        // Allow loading images from other origins for processing
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Get pixel data from the canvas
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Define the contrast adjustment level (from -100 to 100)
            const contrast = 40; 
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

            // Iterate over each pixel and apply filters
            for (let i = 0; i < data.length; i += 4) {
                // 1. Convert to greyscale
                const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                
                // 2. Apply contrast
                const r = factor * (avg - 128) + 128;
                const g = factor * (avg - 128) + 128;
                const b = factor * (avg - 128) + 128;
                
                // Set the new pixel values, clamped between 0 and 255
                data[i] = Math.max(0, Math.min(255, r));     // Red
                data[i + 1] = Math.max(0, Math.min(255, g)); // Green
                data[i + 2] = Math.max(0, Math.min(255, b)); // Blue
            }
            
            // Put the modified pixel data back onto the canvas
            ctx.putImageData(imageData, 0, 0);

            // Export the canvas as a high-quality PNG blob
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Canvas to Blob conversion failed'));
                }
            }, 'image/png');
        };
        img.onerror = (error) => reject(new Error(`Image could not be loaded: ${error}`));
        img.src = imageUrl;
    });
};


export const recognizeText = async (
  image: string | File,
  onProgress: (progress: number) => void,
  language: string,
  highAccuracy: boolean
): Promise<string> => {
  onProgress(0);

  let processedImageBlob: Blob;
  try {
    processedImageBlob = await preprocessImage(image);
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
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO_OSD,
    });
    
    const { data: { text } } = await worker.recognize(processedImageBlob);
    
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