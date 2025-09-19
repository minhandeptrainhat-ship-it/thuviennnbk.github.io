import React, { useState, useEffect, useMemo } from 'react';
import type { Student } from '../types';
import libraryService from '../services/libraryService';
import { parseStudentsFromText } from '../services/aiService';
import { UsersIcon, TrashIcon, PlusIcon, UploadIcon } from './icons';

const ManageStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await libraryService.getStudents();
      setStudents(data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setError("Không thể tải danh sách học sinh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (studentId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa học sinh này?")) {
      const result = await libraryService.deleteStudent(studentId);
      if (result.success) {
        alert(result.message);
        fetchStudents();
      } else {
        alert(`Lỗi: ${result.message}`);
      }
    }
  };
  
  const handleAddStudent = async (name: string) => {
    await libraryService.addStudent(name);
    setAddModalOpen(false);
    fetchStudents();
  };

  const handleImportStudents = async (text: string) => {
    try {
      const newStudents = await parseStudentsFromText(text);
      if (newStudents.length > 0) {
        await libraryService.addMultipleStudents(newStudents);
        alert(`Đã nhập thành công ${newStudents.length} học sinh.`);
        setImportModalOpen(false);
        fetchStudents();
      } else {
        alert("Không tìm thấy dữ liệu học sinh hợp lệ để nhập.");
      }
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);


  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Học sinh</h2>
        <div className="flex space-x-2">
            <button onClick={() => setAddModalOpen(true)} className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-primary-700">
                <PlusIcon className="h-5 w-5 mr-2" /> Thêm học sinh
            </button>
            <button onClick={() => setImportModalOpen(true)} className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-700">
                <UploadIcon className="h-5 w-5 mr-2" /> Nhập (AI)
            </button>
        </div>
      </div>
       <div className="mb-4">
        <input
            type="text"
            placeholder="Tìm kiếm học sinh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
       </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                <th className="px-5 py-3 border-b-2 border-gray-200">Mã học sinh</th>
                <th className="px-5 py-3 border-b-2 border-gray-200">Tên</th>
                <th className="px-5 py-3 border-b-2 border-gray-200">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="text-center py-10">Đang tải danh sách học sinh...</td></tr>
              ) : error ? (
                <tr><td colSpan={3} className="text-center py-10 text-red-500">{error}</td></tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{student.id}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                            <UsersIcon className="h-5 w-5 text-primary-600"/>
                        </div>
                        <p className="text-gray-900 whitespace-no-wrap font-semibold">{student.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                        <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:text-red-900">
                           <TrashIcon className="h-5 w-5"/>
                        </button>
                    </td>
                  </tr>
                ))
              )}
               {filteredStudents.length === 0 && !loading && (
                 <tr><td colSpan={3} className="text-center py-10 text-gray-500">Không tìm thấy học sinh nào.</td></tr>
               )}
            </tbody>
          </table>
        </div>
      </div>
      {isAddModalOpen && <AddStudentModal onClose={() => setAddModalOpen(false)} onSave={handleAddStudent} />}
      {isImportModalOpen && <ImportModal onClose={() => setImportModalOpen(false)} onImport={handleImportStudents} title="Nhập Học sinh từ Văn bản (AI)" placeholder="Dán danh sách tên học sinh từ Excel vào đây. Mỗi tên trên một dòng." />}
    </div>
  );
};

const AddStudentModal: React.FC<{ onClose: () => void, onSave: (name: string) => void }> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(name);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Thêm Học Sinh Mới</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên học sinh</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
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

export default ManageStudents;