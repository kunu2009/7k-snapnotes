import React from 'react';
import { HashRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import ScanPage from './components/pages/ScanPage';
import NotesListPage from './components/pages/NotesListPage';
import NoteDetailPage from './components/pages/NoteDetailPage';
import FlashcardsPage from './components/pages/FlashcardsPage';
import FlashcardDecksPage from './components/pages/FlashcardDecksPage';
import Onboarding from './components/Onboarding';

const AppLayout: React.FC = () => {
    const location = useLocation();
    // Do not show bottom nav on the flashcard study page for a more immersive experience
    const showNav = !location.pathname.startsWith('/flashcards/');

    return (
        <div className="h-screen w-screen bg-brand-dark flex flex-col">
            <Onboarding />
            <main className="flex-grow overflow-y-auto pb-20">
                <Outlet />
            </main>
            {showNav && <BottomNav />}
        </div>
    );
};

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<ScanPage />} />
          <Route path="notes" element={<NotesListPage />} />
          <Route path="notes/:id" element={<NoteDetailPage />} />
          <Route path="flashcards" element={<FlashcardDecksPage />} />
          <Route path="flashcards/:noteId" element={<FlashcardsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;