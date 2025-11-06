import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { INote } from '../types';
import { db } from '../services/db';

interface NoteCardProps {
  note: INote;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasLongPress = useRef(false);
  const [isPressing, setIsPressing] = useState(false);

  const handlePressStart = () => {
    wasLongPress.current = false;
    setIsPressing(true);
    pressTimer.current = setTimeout(() => {
      wasLongPress.current = true;
      handleDelete();
    }, 700); // 700ms for a long press
  };

  const handlePressEnd = () => {
    setIsPressing(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent navigation if the action was a long press
    if (wasLongPress.current) {
      e.preventDefault();
    }
  };

  const handleDelete = async () => {
    // Ensure we handle the case where note.id might be undefined
    if (!note.id) return;
    
    if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
      try {
        await db.notes.delete(note.id);
        await db.flashcards.where('noteId').equals(note.id).delete();
      } catch (error) {
        console.error("Failed to delete note and associated flashcards:", error);
      }
    }
  };

  // Prevent the default context menu on long-press (especially for desktop)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <Link
      to={`/notes/${note.id}`}
      onClick={handleClick}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd} // Cancel press if the mouse leaves the element
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onContextMenu={handleContextMenu}
      className={`block p-4 bg-gray-800 rounded-lg shadow-lg hover:shadow-brand-purple/40 transform hover:-translate-y-1 transition-all duration-300 ${isPressing ? 'scale-95 shadow-brand-purple/60 -translate-y-0' : ''}`}
    >
      <h2 className="text-xl font-bold truncate text-brand-light">{note.title}</h2>
      <p className="text-gray-400 mt-2 h-24 overflow-hidden text-ellipsis">{note.content}</p>
      {note.createdAt && (
        <p className="text-xs text-gray-500 mt-4">{new Date(note.createdAt).toLocaleDateString()}</p>
      )}
    </Link>
  );
};

export default NoteCard;
