import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { motion, AnimatePresence } from 'framer-motion';

const FlashcardsPage: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const id = Number(noteId);

  const flashcards = useLiveQuery(() => db.flashcards.where('noteId').equals(id).toArray(), [id]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);

  const activeCard = useMemo(() => flashcards?.[currentIndex], [flashcards, currentIndex]);

  const paginate = (newDirection: number) => {
    setIsFlipped(false); // un-flip card on navigation
    setDirection(newDirection);
    setCurrentIndex(prevIndex => {
        if (!flashcards) return 0;
        const newIndex = prevIndex + newDirection;
        if (newIndex < 0) return flashcards.length - 1;
        if (newIndex >= flashcards.length) return 0;
        return newIndex;
    });
  };

  const cardVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  // FIX: Refactored flip animation to use variants to avoid potential issues with direct animate prop typing.
  const flipVariants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 },
  };

  const handlePerformance = (status: 'remembered' | 'forgot') => {
      console.log(`Card ${activeCard?.id} marked as '${status}'`);
      paginate(1); // Advance to the next card
  };

  if (!flashcards) return <div>Loading...</div>;
  if (flashcards.length === 0) return <div className="p-4 text-center">No flashcards in this deck.</div>;

  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-4 overflow-hidden">
        <div className="relative w-full max-w-lg aspect-[3/2] mb-4">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    // FIX: Changed onDragEnd handler to avoid destructuring in arguments, which can cause issues with some TypeScript versions.
                    onDragEnd={(e, info) => {
                        const swipe = Math.abs(info.offset.x) * info.velocity.x;
                        if (swipe < -10000) {
                            paginate(1);
                        } else if (swipe > 10000) {
                            paginate(-1);
                        }
                    }}
                    className="absolute w-full h-full"
                    style={{ perspective: '1000px' }}
                >
                    <motion.div
                        className="relative w-full h-full"
                        style={{ transformStyle: 'preserve-3d' }}
                        variants={flipVariants}
                        animate={isFlipped ? 'back' : 'front'}
                        transition={{ duration: 0.6 }}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        {/* Front of card */}
                        <div className="absolute w-full h-full p-6 flex items-center justify-center text-center bg-gray-200 text-brand-dark rounded-xl shadow-lg" style={{ backfaceVisibility: 'hidden' }}>
                            <p className="text-2xl md:text-3xl font-semibold">{activeCard?.front}</p>
                        </div>
                        {/* Back of card */}
                        <div className="absolute w-full h-full p-6 flex items-center justify-center text-center bg-gradient-to-br from-brand-teal to-brand-purple text-white rounded-xl shadow-lg" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                            <p className="text-xl md:text-2xl">{activeCard?.back}</p>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </div>

      <div className="text-center my-4">
        {currentIndex + 1} / {flashcards.length}
      </div>

      <div className="flex justify-center w-full max-w-md mt-4">
        {!isFlipped ? (
            <button 
                onClick={() => setIsFlipped(true)} 
                className="w-full font-bold py-4 px-6 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors"
            >
                Show Answer
            </button>
        ) : (
            <div className="flex justify-between w-full gap-4">
                <button 
                    onClick={() => handlePerformance('forgot')} 
                    className="w-full font-bold py-4 px-6 rounded-xl bg-red-800/80 hover:bg-red-700/80 transition-colors text-white"
                >
                    Forgot
                </button>
                <button 
                    onClick={() => handlePerformance('remembered')} 
                    className="w-full font-bold py-4 px-6 rounded-xl bg-brand-teal hover:opacity-90 transition-opacity text-white"
                >
                    Remembered
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsPage;
