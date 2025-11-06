import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import type { INote } from '../../types';
import { generateFlashcardsFromText } from '../../lib/textUtils';

const NoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const noteId = Number(id);

  const note = useLiveQuery(() => db.notes.get(noteId), [noteId]);

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setTitle(note.title);
    }
  }, [note]);

  const handleSave = async () => {
    if (note) {
      await db.notes.update(noteId, { content, title });
      alert('Note updated!');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this note?')) {
      await db.notes.delete(noteId);
      // also delete associated flashcards
      await db.flashcards.where('noteId').equals(noteId).delete();
      navigate('/notes');
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!note) return;
    setIsGenerating(true);
    try {
      // First, delete existing cards for this note to avoid duplicates
      await db.flashcards.where('noteId').equals(noteId).delete();
      
      const cardsToGenerate = generateFlashcardsFromText(note.content, noteId);
      if (cardsToGenerate.length > 0) {
        await db.flashcards.bulkAdd(
          cardsToGenerate.map(card => ({ ...card, createdAt: new Date() }))
        );
        alert(`${cardsToGenerate.length} flashcards generated!`);
        navigate(`/flashcards/${noteId}`);
      } else {
        alert('Could not generate any flashcards from this note.');
      }
    } catch (error) {
        console.error("Failed to generate flashcards", error);
        alert('An error occurred while generating flashcards.');
    } finally {
        setIsGenerating(false);
    }
  };

  if (!note) {
    return <div className="p-4 text-center">Loading note...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-3xl font-bold font-display p-2 bg-transparent border-b-2 border-gray-700 focus:outline-none focus:border-brand-teal transition-colors"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-96 p-2 bg-gray-800 border border-gray-700 rounded-md text-brand-light focus:ring-2 focus:ring-brand-purple focus:outline-none"
      />
      <div className="grid grid-cols-2 gap-4">
        <button onClick={handleSave} className="bg-brand-teal text-white font-bold py-3 px-4 rounded-xl">
          Save Changes
        </button>
        <button onClick={handleDelete} className="bg-red-600 text-white font-bold py-3 px-4 rounded-xl">
          Delete Note
        </button>
      </div>
      <button
        onClick={handleGenerateFlashcards}
        disabled={isGenerating}
        className="w-full text-white font-bold py-3 px-4 rounded-xl bg-gradient-to-r from-brand-teal to-brand-purple disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {isGenerating ? 'Generating...' : 'Generate Flashcards'}
      </button>
    </div>
  );
};

export default NoteDetailPage;
