import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import NoteCard from '../NoteCard';

const NotesListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const notes = useLiveQuery(() => {
    if (searchTerm.trim() === '') {
      return db.notes.orderBy('createdAt').reverse().toArray();
    }
    return db.notes
      .where('title')
      .startsWithIgnoreCase(searchTerm)
      .or('content')
      .startsWithIgnoreCase(searchTerm)
      .reverse()
      .sortBy('createdAt');
  }, [searchTerm]);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold font-display mb-2">My Notes</h1>
      <p className="text-gray-400 mb-4 text-sm">Tip: Long-press a note to delete it.</p>
      <input
        type="text"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 mb-6 bg-gray-800 dark:bg-gray-900 border border-gray-700 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none"
      />
      
      {notes && notes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(note => (
            <NoteCard note={note} key={note.id} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400">No notes found.</p>
          <p className="text-gray-500">Use the 'Scan' tab to create your first note!</p>
        </div>
      )}
    </div>
  );
};

export default NotesListPage;