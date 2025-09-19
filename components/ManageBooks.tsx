import React, { useState, useEffect } from 'react';
import type { Book } from '../types';
import libraryService from '../services/libraryService';
import { parseBooksFromText } from '../services/aiService';
import { TrashIcon, PlusIcon, UploadIcon } from './icons';

const ManageBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await libraryService.getBooks();
      setBooks(data);
    } catch (error) {
      console.error("Failed to fetch books:", error);
      setError("Không thể tải danh sách sách.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (bookId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sách này?")) {
      const result = await libraryService.deleteBook(bookId);
      if (result.success) {
        alert(result.message);
        fetchBooks();
      } else {
        alert(`Lỗi: ${result.message}`);
      }
    }
  };

  const handleAddBook = async (bookData: { title: string; author: string; coverImage: string }) => {
    await libraryService.addBook(bookData);
    setAddModalOpen(false);
    fetchBooks();
  };

  const handleImportBooks = async (text: string) => {
    try {
      const newBooks = await parseBooksFromText(text);
      if (newBooks.length > 0) {
        await libraryService.addMultipleBooks(newBooks);
        alert(`Đã nhập thành công ${newBooks.length} sách.`);
        setImportModalOpen(false);
        fetchBooks();
      } else {
        alert("Không tìm thấy dữ liệu sách hợp lệ để nhập.");
      }
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Sách</h2>
        <div className="flex space-x-2">
          <button onClick={() => setAddModalOpen(true)} className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-primary-700">
            <PlusIcon className="h-5 w-5 mr-2" /> Thêm sách
          </button>
          <button onClick={() => setImportModalOpen(true)} className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-700">
            <UploadIcon className="h-5 w-5 mr-2" /> Nhập (AI)
          </button>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                <th className="px-5 py-3 border-b-2 border-gray-200">Bìa sách</th>
                <th className="px-5 py-3 border-b-2 border-gray-200">Tên sách</th>
                <th className="px-5 py-3 border-b-2 border-gray-200">Tác giả</th>
                <th className="px-5 py-3 border-b-2 border-gray-200">Trạng thái</th>
                <th className="px-5 py-3 border-b-2 border-gray-200">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10">Đang tải sách...</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="text-center py-10 text-red-500">{error}</td></tr>
              ) : (
                books.map(book => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                      <img src={book.coverImage} alt={book.title} className="w-12 h-16 object-cover rounded" />
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                      <p className="text-gray-900 whitespace-no-wrap font-semibold">{book.title}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                      <p className="text-gray-600 whitespace-no-wrap">{book.author}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                      {book.isAvailable ? (
                        <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                          <span aria-hidden className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                          <span className="relative">Có sẵn</span>
                        </span>
                      ) : (
                        <span className="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
                          <span aria-hidden className="absolute inset-0 bg-red-200 opacity-50 rounded-full"></span>
                          <span className="relative">Đã mượn</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                        <button onClick={() => handleDelete(book.id)} className="text-red-600 hover:text-red-900">
                           <TrashIcon className="h-5 w-5"/>
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isAddModalOpen && <AddBookModal onClose={() => setAddModalOpen(false)} onSave={handleAddBook} />}
      {isImportModalOpen && <ImportModal onClose={() => setImportModalOpen(false)} onImport={handleImportBooks} title="Nhập Sách từ Văn bản (AI)" placeholder="Dán dữ liệu sách từ Excel vào đây. Ví dụ: The Hobbit	J.R.R. Tolkien..." />}
    </div>
  );
};

const AddBookModal: React.FC<{ onClose: () => void, onSave: (data: { title: string, author: string, coverImage: string }) => void }> = ({ onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [coverImage, setCoverImage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, author, coverImage: coverImage || `https://picsum.photos/seed/${encodeURIComponent(title)}/300/400` });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Thêm Sách Mới</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sách</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
                        <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL ảnh bìa (tùy chọn)</label>
                        <input type="text" value={coverImage} onChange={e => setCoverImage(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Để trống để tự tạo"/>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ImportModal: React.FC<{ onClose: () => void, onImport: (text: string) => Promise<void>, title: string, placeholder: string }> = ({ onClose, onImport, title, placeholder }) => {
    const [text, setText] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    const handleImportClick = async () => {
        if (!text.trim()) {
            alert("Vui lòng dán dữ liệu vào.");
            return;
        }
        setIsImporting(true);
        await onImport(text);
        setIsImporting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 className="text-lg font-bold mb-4">{title}</h3>
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    className="w-full h-48 p-2 border border-gray-300 rounded-md"
                    placeholder={placeholder}
                />
                <div className="flex justify-end space-x-2 mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md" disabled={isImporting}>Hủy</button>
                    <button onClick={handleImportClick} className="px-4 py-2 bg-green-600 text-white rounded-md" disabled={isImporting}>
                        {isImporting ? 'Đang xử lý...' : 'Nhập'}
                    </button>
                </div>
            </div>
        </div>
    );
};


export default ManageBooks;