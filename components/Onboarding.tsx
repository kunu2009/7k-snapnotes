import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanIcon, NotesIcon, CardsIcon } from './icons/Icons';

const ONBOARDING_KEY = '7k-snapnotes-onboarding-completed-v1';

const onboardingSteps = [
    {
        icon: '👋',
        title: 'Welcome to 7K SnapNotes!',
        description: 'The fastest way to capture, learn, and recall information. Let\'s walk you through the basics.',
    },
    {
        icon: <ScanIcon className="w-12 h-12" />,
        title: '1. Scan Anything',
        description: 'Use your camera or upload an image to instantly digitize text from books, whiteboards, or documents.',
    },
    {
        icon: <NotesIcon className="w-12 h-12" />,
        title: '2. Save Your Notes',
        description: 'The extracted text is saved as an editable note. Everything is stored securely on your device and works offline.',
    },
    {
        icon: <CardsIcon className="w-12 h-12" />,
        title: '3. Auto-Generate Flashcards',
        description: 'With a single tap, turn any note into a deck of flashcards, ready for you to study.',
    },
    {
        icon: '🚀',
        title: 'Ready to Go!',
        description: 'You\'re all set to start snapping notes. Happy studying!',
    },
];

const Onboarding: React.FC = () => {
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        const hasCompleted = localStorage.getItem(ONBOARDING_KEY);
        if (!hasCompleted) {
            setIsVisible(true);
        }
    }, []);

    const completeOnboarding = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setIsVisible(false);
    };

    const handleNext = () => {
        if (step < onboardingSteps.length - 1) {
            setDirection(1);
            setStep(step + 1);
        } else {
            completeOnboarding();
        }
    };
    
    const handlePrev = () => {
        if (step > 0) {
            setDirection(-1);
            setStep(step - 1);
        }
    };

    const contentVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.95,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.95,
        })
    };

    const buttonVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 },
    };

    const buttonTextVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    if (!isVisible) {
        return null;
    }

    const currentStep = onboardingSteps[step];
    const isLastStep = step === onboardingSteps.length - 1;
    
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="fixed inset-0 bg-brand-dark/90 backdrop-blur-md z-[100] flex flex-col justify-center items-center p-4"
                >
                    <div className="w-full max-w-sm h-[28rem] bg-gray-800 rounded-2xl shadow-2xl flex flex-col text-center overflow-hidden">
                        <div className="flex-grow flex flex-col items-center justify-center p-6 space-y-4 relative">
                           <AnimatePresence initial={false} custom={direction}>
                             <motion.div
                                key={step}
                                custom={direction}
                                variants={contentVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                                className="absolute w-full h-full flex flex-col items-center justify-center p-6 space-y-4"
                             >
                                <div className="text-6xl mb-4">{currentStep.icon}</div>
                                <h2 className="text-2xl font-bold font-display text-brand-light">{currentStep.title}</h2>
                                <p className="text-brand-light/80">{currentStep.description}</p>
                            </motion.div>
                           </AnimatePresence>
                        </div>

                        <div className="p-6 bg-gray-900/50">
                            <div className="flex justify-center gap-2 mb-6">
                                {onboardingSteps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${step === i ? 'bg-brand-purple w-4' : 'bg-gray-600'}`}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="w-16 h-6 flex items-center justify-start">
                                    <AnimatePresence mode="wait">
                                        {step === 0 ? (
                                            <motion.button
                                                key="skip"
                                                initial="hidden"
                                                animate="visible"
                                                exit="hidden"
                                                variants={buttonVariants}
                                                transition={{ duration: 0.2 }}
                                                onClick={completeOnboarding}
                                                className="font-semibold text-gray-400 hover:text-white transition-colors"
                                            >
                                                Skip
                                            </motion.button>
                                        ) : (
                                            <motion.button
                                                key="back"
                                                initial="hidden"
                                                animate="visible"
                                                exit="hidden"
                                                variants={buttonVariants}
                                                transition={{ duration: 0.2 }}
                                                onClick={handlePrev}
                                                className="font-semibold text-gray-400 hover:text-white transition-colors"
                                            >
                                                Back
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <button
                                    onClick={handleNext}
                                    className="px-6 py-3 text-white font-bold rounded-xl bg-gradient-to-r from-brand-teal to-brand-purple hover:opacity-90 transition-opacity"
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={isLastStep ? 'get-started' : 'next'}
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            variants={buttonTextVariants}
                                            transition={{ duration: 0.2, delay: 0.1 }}
                                            className="inline-block"
                                        >
                                            {isLastStep ? 'Get Started' : 'Next'}
                                        </motion.span>
                                    </AnimatePresence>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Onboarding;