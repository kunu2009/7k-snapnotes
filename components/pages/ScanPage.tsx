import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
// FIX: Replaced useHistory with useNavigate for react-router-dom v6 compatibility.
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/db';
import { recognizeText } from '../../services/ocrService';
import { UploadIcon, CopyIcon, CheckIcon } from '../icons/Icons';

// Expanded language options using the fast models
const ocrLanguages = [
  { code: 'eng', name: 'English' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
  { code: 'chi_sim', name: 'Chinese (Simplified)' },
  { code: 'jpn', name: 'Japanese' },
  { code: 'kor', name: 'Korean' },
  { code: 'rus', name: 'Russian' },
  { code: 'ita', name: 'Italian' },
  { code: 'por', name: 'Portuguese' },
  { code: 'nld', name: 'Dutch' },
  { code: 'pol', name: 'Polish' },
  { code: 'swe', name: 'Swedish' },
  { code: 'tur', name: 'Turkish' },
];


const ScanPage: React.FC = () => {
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [mode, setMode] = useState<'idle' | 'camera' | 'result'>('idle');
  const [selectedLang, setSelectedLang] = useState('eng'); // State for selected language
  const [isHighAccuracy, setIsHighAccuracy] = useState(false); // State for accuracy mode
  const [isCopied, setIsCopied] = useState(false);
  // FIX: Replaced useHistory with useNavigate.
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImage = async (imgSrc: string | File) => {
    setIsProcessing(true);
    setOcrResult(null);
    setProgress(0);
    setMode('result');
    if (typeof imgSrc === 'string') {
        setImageSrc(imgSrc);
    }

    try {
      // Pass selected language and accuracy mode to the OCR service
      const text = await recognizeText(imgSrc, setProgress, selectedLang, isHighAccuracy);
      setOcrResult(text);
    } catch (error) {
      console.error(error);
      setOcrResult('Failed to process image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
        handleImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const capture = useCallback(() => {
    const image = webcamRef.current?.getScreenshot();
    if (image) {
      handleImage(image);
    }
  }, [webcamRef, selectedLang, isHighAccuracy]);

  const saveNote = async () => {
    if (!ocrResult) return;
    try {
      const title = ocrResult.split('\n')[0] || 'Untitled Note';
      const id = await db.notes.add({
        title: title.substring(0, 50),
        content: ocrResult,
        createdAt: new Date(),
      });
      // FIX: Used navigate for navigation in v6.
      navigate(`/notes/${id}`);
    } catch (error) {
      console.error('Failed to save note: ', error);
    }
  };
  
  const resetState = () => {
    setOcrResult(null);
    setIsProcessing(false);
    setProgress(0);
    setImageSrc(null);
    setMode('idle');
  };

  const handleCopyToClipboard = () => {
    if (!ocrResult) return;
    navigator.clipboard.writeText(ocrResult).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Could not copy text: ', err);
      alert('Failed to copy text to clipboard.');
    });
  };

  const renderIdle = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <h1 className="text-4xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-brand-teal to-brand-purple mb-4">7K SnapNotes</h1>
        <p className="text-brand-light/80 mb-6">Capture text from anywhere.</p>

        {/* Language Selection Dropdown */}
        <div className="w-full max-w-sm mb-4">
            <label htmlFor="lang-select" className="block text-sm font-medium text-brand-light/70 mb-2 text-left">Recognition Language</label>
            <div className="relative">
              <select
                  id="lang-select"
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none appearance-none pr-10"
              >
                  {ocrLanguages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
        </div>
        
        {/* High Accuracy Toggle */}
        <div className="w-full max-w-sm mb-6">
            <div className="flex items-center justify-between">
                <label htmlFor="accuracy-toggle" className="block text-sm font-medium text-brand-light/70">High Accuracy Mode</label>
                <button
                    id="accuracy-toggle"
                    onClick={() => setIsHighAccuracy(!isHighAccuracy)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-purple ${isHighAccuracy ? 'bg-brand-purple' : 'bg-gray-600'}`}
                >
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isHighAccuracy ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-left">Slower, larger download, but better for complex documents.</p>
        </div>


        <div className="w-full max-w-sm space-y-4">
            <button
                onClick={() => setMode('camera')}
                className="w-full text-white font-bold py-4 px-4 rounded-xl bg-gradient-to-r from-brand-teal to-brand-purple hover:opacity-90 transition-opacity duration-300 transform hover:scale-105"
            >
                Use Camera
            </button>
            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gray-700 hover:bg-gray-600 text-brand-light font-bold py-4 px-4 rounded-xl transition-colors duration-300 flex items-center justify-center gap-3"
            >
                <UploadIcon className="w-6 h-6" />
                Upload Image
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        </div>
    </div>
  );

  const renderCamera = () => (
    <div className="relative h-full w-full flex flex-col items-center justify-center bg-black">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: "environment" }}
        className="object-cover h-full w-full"
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 flex justify-center">
        <button onClick={capture} className="w-20 h-20 rounded-full bg-white flex items-center justify-center ring-4 ring-white/50 ring-offset-4 ring-offset-black">
            <div className="w-16 h-16 rounded-full bg-white border-4 border-black"></div>
        </button>
      </div>
       <button onClick={resetState} className="absolute top-4 left-4 text-white bg-black/50 p-2 rounded-full">
         Back
      </button>
    </div>
  );

  const renderResult = () => (
    <div className="p-4 space-y-4">
        {imageSrc && <img src={imageSrc} alt="Captured" className="rounded-lg max-h-60 w-full object-contain" />}
        <div className="relative">
            <textarea
                value={ocrResult ?? ''}
                onChange={(e) => setOcrResult(e.target.value)}
                className="w-full h-64 p-2 border border-gray-600 bg-gray-800 rounded-md text-brand-light"
                placeholder="Recognized text will appear here..."
            />
            {!isProcessing && ocrResult && (
                <button
                    onClick={handleCopyToClipboard}
                    className="absolute top-3 right-3 p-2 bg-gray-700/80 backdrop-blur-sm rounded-full hover:bg-gray-600/80 transition-all duration-200 text-brand-light"
                    aria-label={isCopied ? "Copied" : "Copy text"}
                    title={isCopied ? "Copied" : "Copy text"}
                >
                    {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                </button>
            )}
            {isProcessing && (
                <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center rounded-md">
                    <div className="w-24 h-24">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="35" cx="50" cy="50" />
                            <circle
                                className="text-brand-purple"
                                strokeWidth="10"
                                strokeDasharray={2 * Math.PI * 35}
                                strokeDashoffset={(2 * Math.PI * 35) * (1 - progress / 100)}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="35"
                                cx="50"
                                cy="50"
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                            />
                        </svg>
                    </div>
                    <p className="mt-4 text-lg">Processing... {progress}%</p>
                </div>
            )}
        </div>
        <div className="flex gap-4">
            <button onClick={resetState} className="w-full bg-gray-700 hover:bg-gray-600 text-brand-light font-bold py-3 px-4 rounded-xl transition-colors">
                Scan New
            </button>
            <button
                onClick={saveNote}
                disabled={isProcessing || !ocrResult}
                className="w-full text-white font-bold py-3 px-4 rounded-xl bg-gradient-to-r from-brand-teal to-brand-purple disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
                Save Note
            </button>
        </div>
    </div>
  );

  switch (mode) {
    case 'camera':
      return renderCamera();
    case 'result':
      return renderResult();
    default:
      return renderIdle();
  }
};

export default ScanPage;