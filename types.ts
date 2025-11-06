export interface INote {
  id?: number;
  title: string;
  content: string;
  createdAt: Date;
}

export interface IFlashcard {
  id?: number;
  noteId: number;
  front: string;
  back: string;
  createdAt: Date;
}
