import React from 'react';
// FIX: Updated imports and routing structure for react-router-dom v6 compatibility.
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import ScanPage from './components/pages/ScanPage';
import NotesListPage from './components/pages/NotesListPage';
import NoteDetailPage from './components/pages/NoteDetailPage';
import FlashcardsPage from './components/pages/FlashcardsPage';
import FlashcardDecksPage from './components/pages/FlashcardDecksPage';
import Onboarding from './components/Onboarding';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    // Do not show bottom nav on the flashcard study page for a more immersive experience
    const showNav = !location.pathname.startsWith('/flashcards/');

    return (
        <div className="h-screen w-screen bg-brand-dark flex flex-col">
            <Onboarding />
            <main className="flex-grow overflow-y-auto pb-20">
                {/* FIX: Using children prop to render routes within the layout. */}
                {children}
            </main>
            {showNav && <BottomNav />}
        </div>
    );
};

function App() {
  return (
    <HashRouter>
      {/* FIX: AppLayout now wraps Routes to provide layout for all pages */}
      <AppLayout>
        <Routes>
          <Route path="/" element={<ScanPage />} />
          <Route path="/notes/:id" element={<NoteDetailPage />} />
          <Route path="/notes" element={<NotesListPage />} />
          <Route path="/flashcards/:noteId" element={<FlashcardsPage />} />
          <Route path="/flashcards" element={<FlashcardDecksPage />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  );
}

export default App;