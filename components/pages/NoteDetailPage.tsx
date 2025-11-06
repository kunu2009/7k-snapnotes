import React, { useState, useEffect } from 'react';
// FIX: Replaced useHistory with useNavigate for react-router-dom v6 compatibility.
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import type { INote } from '../../types';
import { generateFlashcardsFromText } from '../../lib/textUtils';
import { summarizeText, isGeminiConfigured } from '../../lib/gemini';

const NoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // FIX: Replaced useHistory with useNavigate.
  const navigate = useNavigate();
  const noteId = Number(id);

  const note = useLiveQuery(() => db.notes.get(noteId), [noteId]);

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const showAiFeatures = isGeminiConfigured();

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
      // FIX: Used navigate for navigation in v6.
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
        // FIX: Used navigate for navigation in v6.
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
  
  const handleSummarize = async () => {
      if (!content) return;
      setIsSummarizing(true);
      try {
          const summary = await summarizeText(content);
          const newContent = `✨ AI Summary:\n${summary}\n\n---\n\n${content}`;
          setContent(newContent);
      } catch (error) {
          console.error(error);
          alert('Failed to generate summary.');
      } finally {
          setIsSummarizing(false);
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
        className="w-full h-96 p-2 bg-gray-800 dark:bg-gray-900 border border-gray-700 dark:border-gray-800 rounded-md text-brand-light dark:text-white focus:ring-2 focus:ring-brand-purple focus:outline-none"
      />
      <div className="grid grid-cols-2 gap-4">
        <button onClick={handleSave} className="bg-brand-teal text-white font-bold py-3 px-4 rounded-xl">
          Save Changes
        </button>
        <button onClick={handleDelete} className="bg-red-600 text-white font-bold py-3 px-4 rounded-xl">
          Delete Note
        </button>
      </div>
      <div className="space-y-4">
        <button
          onClick={handleGenerateFlashcards}
          disabled={isGenerating || isSummarizing}
          className="w-full text-white font-bold py-3 px-4 rounded-xl bg-gradient-to-r from-brand-teal to-brand-purple disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {isGenerating ? 'Generating...' : 'Generate Flashcards'}
        </button>
        {showAiFeatures && (
            <button
                onClick={handleSummarize}
                disabled={isSummarizing || isGenerating}
                className="w-full text-white font-bold py-3 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-purple-700 disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
                {isSummarizing ? 'Summarizing...' : 'Summarize with AI'}
            </button>
        )}
      </div>
    </div>
  );
};

export default NoteDetailPage;