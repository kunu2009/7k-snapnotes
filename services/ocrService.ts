import Tesseract from 'tesseract.js';

export const recognizeText = async (
  image: string | File,
  onProgress: (progress: number) => void,
  language: string,
  highAccuracy: boolean
): Promise<string> => {
  onProgress(0);

  // Allow switching between the fast models and the higher-accuracy (but larger) models.
  const langPath = highAccuracy 
    ? 'https://tessdata.projectnaptha.com/4.0.0' 
    : 'https://tessdata.projectnaptha.com/4.0.0_fast';

  const worker = await Tesseract.createWorker(language, undefined, {
    langPath,
    logger: m => {
      let progress = 0;
      switch (m.status) {
        case 'loading tesseract core':
          progress = 5;
          break;
        case 'initialized tesseract':
          progress = 10;
          break;
        case 'loading language traineddata':
          // Scale download progress to 15-45% range
          progress = 15 + (m.progress || 0) * 30;
          break;
        case 'loaded language traineddata':
          progress = 45;
          break;
        case 'initializing api':
          progress = 50;
          break;
        case 'recognizing text':
          // Scale recognition progress to 50-95% range
          progress = 50 + (m.progress || 0) * 45;
          break;
      }
      // Only update progress if it's meaningful and not complete yet
      if (progress > 0 && progress < 100) {
        onProgress(Math.round(progress));
      }
    },
  });

  try {
    const { data: { text } } = await worker.recognize(image);
    
    onProgress(100); // Signal completion
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    onProgress(0); // Reset on error
    return 'Error during text recognition.';
  } finally {
    await worker.terminate();
  }
};