import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { Link } from 'react-router-dom';

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
      <h1 className="text-3xl font-bold font-display mb-4">My Notes</h1>
      <input
        type="text"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 mb-6 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none"
      />
      
      {notes && notes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(note => (
            <Link to={`/notes/${note.id}`} key={note.id} className="block p-4 bg-gray-800 rounded-lg shadow-lg hover:shadow-brand-purple/40 transition-shadow duration-300 transform hover:-translate-y-1">
              <h2 className="text-xl font-bold truncate text-brand-light">{note.title}</h2>
              <p className="text-gray-400 mt-2 h-24 overflow-hidden text-ellipsis">{note.content}</p>
              <p className="text-xs text-gray-500 mt-4">{note.createdAt.toLocaleDateString()}</p>
            </Link>
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
