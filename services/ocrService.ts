import Tesseract from 'tesseract.js';

export const recognizeText = async (
  image: string | File,
  onProgress: (progress: number) => void
): Promise<string> => {
  onProgress(0);
  
  const worker = await Tesseract.createWorker({
    logger: m => {
      if (m.status === 'recognizing text') {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  try {
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(image);
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    return 'Error during text recognition.';
  } finally {
    await worker.terminate();
    onProgress(100);
  }
};
