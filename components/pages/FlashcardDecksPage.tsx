import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { Link } from 'react-router-dom';
import type { INote } from '../../types';
import { OptionsIcon } from '../icons/Icons';

interface NoteWithCardCount extends INote {
    cardCount: number;
}

const FlashcardDecksPage: React.FC = () => {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

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
            return notesWithCount.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        });
        return notesWithFlashcards;
    }, []);

    const handleToggleMenu = (e: React.MouseEvent, deckId: number) => {
        e.stopPropagation();
        e.preventDefault();
        setOpenMenuId(openMenuId === deckId ? null : deckId);
    };

    const handleRename = async (deckId: number, currentTitle: string) => {
        const newTitle = prompt('Enter new deck name:', currentTitle);
        if (newTitle && newTitle.trim() !== '') {
            await db.notes.update(deckId, { title: newTitle.trim() });
        }
        setOpenMenuId(null);
    };

    const handleDelete = async (deckId: number, title: string) => {
        if (confirm(`Are you sure you want to delete the deck "${title}" and all its flashcards? This will also delete the original note.`)) {
            try {
                await db.flashcards.where('noteId').equals(deckId).delete();
                await db.notes.delete(deckId);
            } catch (error) {
                console.error('Failed to delete deck:', error);
                alert('An error occurred while deleting the deck.');
            }
        }
        setOpenMenuId(null);
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold font-display mb-6">Study Decks</h1>
            {decks && decks.length > 0 ? (
                <div className="space-y-4">
                    {decks.map(deck => (
                        <div key={deck.id} className="relative">
                            <Link
                                to={`/flashcards/${deck.id}`}
                                className="flex items-center justify-between p-4 bg-gray-800 dark:bg-gray-900 rounded-lg shadow-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors duration-300"
                                onClick={() => setOpenMenuId(null)}
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-brand-light dark:text-white">{deck.title}</h2>
                                    <p className="text-sm text-gray-400">{deck.cardCount} cards</p>
                                </div>
                                <div className="text-brand-purple flex items-center gap-2">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>

                            <button
                                onClick={(e) => handleToggleMenu(e, deck.id!)}
                                className="absolute top-1/2 right-12 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white"
                                aria-label="Deck options"
                            >
                                <OptionsIcon className="w-5 h-5" />
                            </button>

                            {openMenuId === deck.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-900 dark:bg-black border border-gray-700 dark:border-gray-800 rounded-md shadow-lg z-10">
                                    <button
                                        onClick={() => handleRename(deck.id!, deck.title)}
                                        className="block w-full text-left px-4 py-2 text-sm text-brand-light dark:text-white hover:bg-gray-700 dark:hover:bg-gray-800"
                                    >
                                        Rename
                                    </button>
                                    <button
                                        onClick={() => handleDelete(deck.id!, deck.title)}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/50 hover:text-red-300"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
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