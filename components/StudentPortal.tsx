import React, { useState, useEffect, useMemo } from 'react';
import type { Book, Student } from '../types';
import libraryService from '../services/libraryService';

const StudentPortal: React.FC = () => {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [action, setAction] = useState<'borrow' | 'return'>('borrow');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [booksData, studentsData] = await Promise.all([
        libraryService.getBooks(),
        libraryService.getStudents()
      ]);
      setAllBooks(booksData);
      setStudents(studentsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setFeedback({ type: 'error', message: 'Không thể tải dữ liệu từ máy chủ.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (borrowDate) {
        const newDueDate = new Date(borrowDate);
        newDueDate.setDate(newDueDate.getDate() + 14);
        setDueDate(newDueDate.toISOString().split('T')[0]);
    }
  }, [borrowDate]);

  const filteredBooks = useMemo(() => {
    if (!searchTerm) {
      return action === 'borrow' ? allBooks.filter(b => b.isAvailable) : allBooks.filter(b => !b.isAvailable);
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    const targetBooks = action === 'borrow' ? allBooks.filter(b => b.isAvailable) : allBooks.filter(b => !b.isAvailable);
    return targetBooks.filter(book =>
      book.title.toLowerCase().includes(lowercasedTerm) ||
      book.author.toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm, allBooks, action]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !selectedStudentId) {
      setFeedback({ type: 'error', message: 'Vui lòng chọn học sinh và sách.' });
      return;
    }

    setFeedback(null);
    let result;
    const studentIdNum = parseInt(selectedStudentId, 10);

    if (action === 'borrow') {
        const borrowDateObj = new Date(borrowDate);
        const dueDateObj = new Date(dueDate);
        const diffTime = dueDateObj.getTime() - borrowDateObj.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            setFeedback({ type: 'error', message: 'Ngày trả phải sau ngày mượn.' });
            return;
        }

        if (diffDays > 730) {
            setFeedback({ type: 'error', message: 'Thời gian mượn không được quá 730 ngày.' });
            return;
        }

        result = await libraryService.borrowBook(selectedBookId, studentIdNum, borrowDate, dueDate);
    } else {
      result = await libraryService.returnBook(selectedBookId, studentIdNum);
    }

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setSelectedBookId(null);
      fetchData();
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };
  
  useEffect(() => {
      setSelectedBookId(null);
  }, [action, searchTerm]);

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col lg:flex-row gap-8">
      <div className="lg:w-2/3">
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {action === 'borrow' ? 'Tìm sách để mượn' : 'Tìm sách bạn đã mượn để trả'}
            </h2>
            <input 
                type="text"
                placeholder="Nhập tên sách hoặc tác giả..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
        </div>
        
        {loading ? <p>Đang tải sách...</p> :
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <div
                key={book.id}
                onClick={() => setSelectedBookId(book.id)}
                className={`cursor-pointer rounded-lg overflow-hidden shadow-md transition-all duration-300 ${selectedBookId === book.id ? 'ring-4 ring-primary-500 scale-105' : 'hover:shadow-xl'}`}
              >
                <img src={book.coverImage} alt={book.title} className="w-full h-48 sm:h-64 object-cover" />
                <div className="p-3 bg-white">
                  <h3 className="text-sm font-semibold truncate text-gray-800">{book.title}</h3>
                  <p className="text-xs text-gray-500">{book.author}</p>
                </div>
              </div>
            ))}
            {filteredBooks.length === 0 && !loading && (
                <p className="col-span-full text-center text-gray-500">Không tìm thấy sách phù hợp.</p>
            )}
          </div>
        }
      </div>
      <div className="lg:w-1/3">
        <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Mượn hoặc Trả sách</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Chọn tên của bạn</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">-- Chọn học sinh --</option>
                {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Hành động</label>
              <div className="flex space-x-4">
                <button type="button" onClick={() => setAction('borrow')} className={`w-full py-2 rounded-md ${action === 'borrow' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Mượn sách</button>
                <button type="button" onClick={() => setAction('return')} className={`w-full py-2 rounded-md ${action === 'return' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Trả sách</button>
              </div>
            </div>

            {action === 'borrow' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="borrowDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày mượn</label>
                        <input type="date" id="borrowDate" value={borrowDate} onChange={e => setBorrowDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày trả</label>
                        <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                    </div>
                </div>
            )}
            
            <div className="mb-4 text-sm text-gray-600 h-10 flex items-center">
              {selectedBookId ?
                <p>Sách đã chọn: <span className="font-semibold">{allBooks.find(b => b.id === selectedBookId)?.title}</span></p> :
                <p>Vui lòng chọn một cuốn sách từ danh sách.</p>
              }
            </div>
            <button
              type="submit"
              disabled={!selectedBookId || !selectedStudentId}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {action === 'borrow' ? 'Xác nhận Mượn' : 'Xác nhận Trả'}
            </button>
            {feedback && (
              <div className={`mt-4 p-3 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {feedback.message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;