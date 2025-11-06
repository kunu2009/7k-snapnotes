import type { IFlashcard } from '../types';

export const generateFlashcardsFromText = (text: string, noteId: number): Omit<IFlashcard, 'id' | 'createdAt'>[] => {
  const cards: Omit<IFlashcard, 'id' | 'createdAt'>[] = [];
  const lines = text.split('\n').filter(line => line.trim() !== '');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Look for lines with a clear separator like ':', '-', or '=>'
    const separatorMatch = line.match(/(:|-|=>)/);
    
    if (separatorMatch) {
      const separator = separatorMatch[0];
      const parts = line.split(separator).map(p => p.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        cards.push({
          noteId,
          front: parts[0],
          back: parts.slice(1).join(separator),
        });
      }
    } 
    // If no separator, maybe the previous line was a heading? (simple heuristic)
    else if (i > 0) {
        const prevLine = lines[i - 1].trim();
        // A simple check if the previous line is short and doesn't end with punctuation
        if (prevLine.length < 50 && !/[.?!]$/.test(prevLine)) {
             // Avoid creating a duplicate if the previous line already formed a card
            if (!cards.some(c => c.front === prevLine)) {
                cards.push({
                    noteId,
                    front: prevLine,
                    back: line,
                });
            }
        }
    }
  }

  // If no cards were generated with heuristics, create one card per line.
  if (cards.length === 0) {
      lines.forEach(line => {
          cards.push({
              noteId,
              front: '...',
              back: line,
          });
      });
  }

  return cards;
};
