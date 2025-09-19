import { Book, Student, BorrowRecord, DashboardStats, OverdueRecordDetail } from '../types';

let books: Book[] = [
  { id: 1, title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', coverImage: 'https://picsum.photos/id/10/300/400', isAvailable: false },
  { id: 2, title: 'Pride and Prejudice', author: 'Jane Austen', coverImage: 'https://picsum.photos/id/20/300/400', isAvailable: true },
  { id: 3, title: 'The Hitchhiker\'s Guide to the Galaxy', author: 'Douglas Adams', coverImage: 'https://picsum.photos/id/30/300/400', isAvailable: true },
  { id: 4, title: 'To Kill a Mockingbird', author: 'Harper Lee', coverImage: 'https://picsum.photos/id/40/300/400', isAvailable: false },
  { id: 5, title: '1984', author: 'George Orwell', coverImage: 'https://picsum.photos/id/50/300/400', isAvailable: true },
  { id: 6, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverImage: 'https://picsum.photos/id/60/300/400', isAvailable: false },
  { id: 7, title: 'Moby Dick', author: 'Herman Melville', coverImage: 'https://picsum.photos/id/70/300/400', isAvailable: true },
  { id: 8, title: 'War and Peace', author: 'Leo Tolstoy', coverImage: 'https://picsum.photos/id/80/300/400', isAvailable: false },
];

let students: Student[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
  { id: 4, name: 'Diana' },
];

let borrowRecords: BorrowRecord[] = [
  { id: 1, studentId: 1, bookId: 1, borrowDate: '2024-05-01', dueDate: '2024-05-15', returnDate: null },
  { id: 2, studentId: 2, bookId: 4, borrowDate: '2024-04-20', dueDate: '2024-05-04', returnDate: null }, // Overdue
  { id: 3, studentId: 3, bookId: 6, borrowDate: '2024-05-10', dueDate: '2024-05-24', returnDate: null },
  { id: 4, studentId: 1, bookId: 8, borrowDate: '2024-05-12', dueDate: '2024-05-26', returnDate: null },
  { id: 5, studentId: 2, bookId: 1, borrowDate: '2024-04-15', dueDate: '2024-04-29', returnDate: '2024-04-28' },
  { id: 6, studentId: 4, bookId: 4, borrowDate: '2024-03-01', dueDate: '2024-03-15', returnDate: '2024-03-14' },
  { id: 7, studentId: 1, bookId: 6, borrowDate: '2024-04-01', dueDate: '2024-04-15', returnDate: '2024-04-14' },
];

let nextBookId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
let nextStudentId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
let nextBorrowRecordId = borrowRecords.length > 0 ? Math.max(...borrowRecords.map(r => r.id)) + 1 : 1;

const api = {
  getBooks: async (): Promise<Book[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...books]), 200));
  },
  getStudents: async (): Promise<Student[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...students]), 200));
  },
  getBorrowRecords: async (): Promise<BorrowRecord[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...borrowRecords]), 200));
  },
    addBook: async (bookData: { title: string; author: string; coverImage: string }): Promise<Book> => {
        return new Promise(resolve => {
            const newBook: Book = {
                ...bookData,
                id: nextBookId++,
                isAvailable: true,
            };
            books.unshift(newBook);
            resolve(newBook);
        });
    },
    deleteBook: async (bookId: number): Promise<{ success: boolean; message: string }> => {
        return new Promise(resolve => {
            const isBorrowed = borrowRecords.some(r => r.bookId === bookId && r.returnDate === null);
            if (isBorrowed) {
                return resolve({ success: false, message: "Không thể xóa sách đang được mượn." });
            }
            books = books.filter(b => b.id !== bookId);
            resolve({ success: true, message: "Xóa sách thành công." });
        });
    },
    addMultipleBooks: async (newBooks: { title: string; author: string; coverImage: string }[]): Promise<Book[]> => {
        const addedBooks: Book[] = [];
        for (const bookData of newBooks) {
            const newBook: Book = {
                ...bookData,
                id: nextBookId++,
                isAvailable: true,
            };
            books.unshift(newBook);
            addedBooks.push(newBook);
        }
        return Promise.resolve(addedBooks);
    },
    addStudent: async (name: string): Promise<Student> => {
        return new Promise(resolve => {
            const newStudent: Student = {
                id: nextStudentId++,
                name,
            };
            students.unshift(newStudent);
            resolve(newStudent);
        });
    },
    deleteStudent: async (studentId: number): Promise<{ success: boolean; message: string }> => {
        return new Promise(resolve => {
            const hasActiveBorrows = borrowRecords.some(r => r.studentId === studentId && r.returnDate === null);
            if (hasActiveBorrows) {
                return resolve({ success: false, message: "Không thể xóa học sinh đang mượn sách." });
            }
            students = students.filter(s => s.id !== studentId);
            resolve({ success: true, message: "Xóa học sinh thành công." });
        });
    },
    addMultipleStudents: async (newStudents: { name: string }[]): Promise<Student[]> => {
        const addedStudents: Student[] = [];
        for (const studentData of newStudents) {
            const newStudent: Student = {
                id: nextStudentId++,
                name: studentData.name,
            };
            students.unshift(newStudent);
            addedStudents.push(newStudent);
        }
        return Promise.resolve(addedStudents);
    },
  getDashboardStats: async (): Promise<DashboardStats> => {
    const today = new Date();
    const overdueCount = borrowRecords.filter(r => !r.returnDate && new Date(r.dueDate) < today).length;
    const borrowedCount = borrowRecords.filter(r => !r.returnDate).length;

    const studentBorrowCounts = borrowRecords.reduce((acc, record) => {
        const student = students.find(s => s.id === record.studentId);
        if(student) {
            acc[student.name] = (acc[student.name] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const topStudents = Object.entries(studentBorrowCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));

    const bookBorrowCounts = borrowRecords.reduce((acc, record) => {
        const book = books.find(b => b.id === record.bookId);
        if (book) {
            acc[book.title] = (acc[book.title] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);
    
    const topBooks = Object.entries(bookBorrowCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([title, count]) => ({ title, count }));

    return new Promise(resolve => setTimeout(() => resolve({
        totalBooks: books.length,
        overdueCount,
        borrowedCount,
        totalStudents: students.length,
        topStudents,
        topBooks,
    }), 200));
  },
  borrowBook: async (bookId: number, studentId: number, borrowDate: string, dueDate: string): Promise<{ success: boolean; message: string }> => {
    return new Promise(resolve => {
        const book = books.find(b => b.id === bookId);
        if (!book || !book.isAvailable) {
            return resolve({ success: false, message: "Sách không có sẵn hoặc không tồn tại." });
        }

        const student = students.find(s => s.id === studentId);
        if (!student) {
             return resolve({ success: false, message: "Học sinh không tồn tại." });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const studentOverdueCount = borrowRecords.filter(
            r => r.studentId === studentId && !r.returnDate && new Date(r.dueDate) < today
        ).length;

        if (studentOverdueCount >= 5) {
            return resolve({ success: false, message: `Học sinh này đã có ${studentOverdueCount} sách mượn quá hạn và không thể mượn thêm.` });
        }

        const newRecord: BorrowRecord = {
            id: nextBorrowRecordId++,
            bookId,
            studentId: student.id,
            borrowDate,
            dueDate,
            returnDate: null,
        };

        borrowRecords.push(newRecord);
        book.isAvailable = false;
        
        resolve({ success: true, message: `Mượn sách "${book.title}" thành công. Hạn trả vào ngày ${newRecord.dueDate}.` });
    });
  },
  returnBook: async (bookId: number, studentId: number): Promise<{ success: boolean; message: string }> => {
    return new Promise(resolve => {
        const student = students.find(s => s.id === studentId);
        if (!student) {
            return resolve({ success: false, message: "Không tìm thấy học sinh." });
        }

        const record = borrowRecords.find(r => r.bookId === bookId && r.studentId === student.id && !r.returnDate);
        if (!record) {
            return resolve({ success: false, message: "Không tìm thấy lịch sử mượn sách này của học sinh." });
        }

        const book = books.find(b => b.id === bookId);
        if (book) {
            book.isAvailable = true;
        }

        record.returnDate = new Date().toISOString().split('T')[0];

        resolve({ success: true, message: `Trả sách "${book?.title}" thành công.` });
    });
  },
  getOverdueRecords: async (): Promise<OverdueRecordDetail[]> => {
     return new Promise(resolve => {
        const today = new Date();
        const overdue = borrowRecords
            .filter(r => !r.returnDate && new Date(r.dueDate) < today)
            .map(record => {
                const book = books.find(b => b.id === record.bookId);
                const student = students.find(s => s.id === record.studentId);
                return {
                    recordId: record.id,
                    bookTitle: book?.title || 'Sách không xác định',
                    studentName: student?.name || 'Học sinh không xác định',
                    dueDate: record.dueDate,
                };
            })
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        
        setTimeout(() => resolve(overdue), 300);
     });
  }
};

export default api;