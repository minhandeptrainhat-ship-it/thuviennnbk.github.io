
export interface Book {
  id: number;
  title: string;
  author: string;
  coverImage: string;
  isAvailable: boolean;
}

export interface Student {
  id: number;
  name: string;
}

export interface BorrowRecord {
  id: number;
  bookId: number;
  studentId: number;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
}

export interface DashboardStats {
  totalBooks: number;
  overdueCount: number;
  borrowedCount: number;
  totalStudents: number;
  topStudents: { name: string; count: number }[];
  topBooks: { title: string; count: number }[];
}

export interface OverdueRecordDetail {
  recordId: number;
  bookTitle: string;
  studentName: string;
  dueDate: string;
}
