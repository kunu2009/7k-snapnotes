import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { Link } from 'react-router-dom';
import type { INote } from '../../types';

interface NoteWithCardCount extends INote {
    cardCount: number;
}

const FlashcardDecksPage: React.FC = () => {
    const decks = useLiveQuery(async () => {
        const notesWithFlashcards = await db.transaction('r', db.notes, db.flashcards, async () => {
            const allNotes = await db.notes.toArray();
            const notesWithCount: NoteWithCardCount[] = [];

            for (const note of allNotes) {
                if(note.id) {
                    const count = await db.flashcards.where('noteId').equals(note.id).count();
                    if (count > 0) {
                        notesWithCount.push({ ...note, cardCount: count });
                    }
                }
            }
            return notesWithCount;
        });
        return notesWithFlashcards;
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold font-display mb-6">Study Decks</h1>
            {decks && decks.length > 0 ? (
                <div className="space-y-4">
                    {decks.map(deck => (
                        <Link
                            to={`/flashcards/${deck.id}`}
                            key={deck.id}
                            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-300"
                        >
                            <div>
                                <h2 className="text-xl font-bold text-brand-light">{deck.title}</h2>
                                <p className="text-sm text-gray-400">{deck.cardCount} cards</p>
                            </div>
                            <div className="text-brand-purple">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-400">No flashcard decks found.</p>
                    <p className="text-gray-500">Go to a note and click 'Generate Flashcards' to create a deck.</p>
                </div>
            )}
        </div>
    );
};

export default FlashcardDecksPage;
