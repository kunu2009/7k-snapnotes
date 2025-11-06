// Fix: Dexie is imported as a default export in modern versions of the library.
import Dexie, { type Table } from 'dexie';
import type { INote, IFlashcard } from '../types';

export class SnapNotesDB extends Dexie {
  notes!: Table<INote>;
  flashcards!: Table<IFlashcard>;

  constructor() {
    super('7kSnapNotesDB');
    this.version(1).stores({
      notes: '++id, title, content, createdAt',
      flashcards: '++id, noteId, front, back, createdAt',
    });
  }
}

export const db = new SnapNotesDB();