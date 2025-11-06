import React from 'react';
import { NavLink } from 'react-router-dom';
import { ScanIcon, NotesIcon, CardsIcon } from './icons/Icons';

const BottomNav: React.FC = () => {
  const commonClasses = "flex flex-col items-center justify-center gap-1 w-full h-full p-2 transition-all duration-300";
  const activeClass = "text-brand-light dark:text-white scale-110";
  const inactiveClass = "text-gray-400";

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-16 bg-gray-900/80 dark:bg-black/80 backdrop-blur-sm border-t border-gray-700 dark:border-gray-800 z-50">
      <nav className="flex justify-around items-center h-full">
        <NavLink to="/" className={({ isActive }) => `${commonClasses} ${isActive ? activeClass : inactiveClass}`}>
          <ScanIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Scan</span>
        </NavLink>
        <NavLink to="/notes" className={({ isActive }) => `${commonClasses} ${isActive ? activeClass : inactiveClass}`}>
          <NotesIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Notes</span>
        </NavLink>
        <NavLink to="/flashcards" className={({ isActive }) => `${commonClasses} ${isActive ? activeClass : inactiveClass}`}>
          <CardsIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Study</span>
        </NavLink>
      </nav>
    </footer>
  );
};

export default BottomNav;