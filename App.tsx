import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ManageBooks from './components/ManageBooks';
import ManageStudents from './components/ManageStudents';
import StudentPortal from './components/StudentPortal';
import { BookOpenIcon } from './components/icons';

type ViewMode = 'ADMIN' | 'STUDENT';
type AdminTab = 'DASHBOARD' | 'BOOKS' | 'STUDENTS';

const PasswordModal: React.FC<{ onSubmit: (password: string) => void, onClose: () => void }> = ({ onSubmit, onClose }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'loan123') {
            onSubmit(password);
        } else {
            setError('Mật khẩu không chính xác.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="text-xl font-bold mb-4 text-center">Yêu cầu xác thực</h3>
                <p className="text-center text-gray-600 mb-6">Vui lòng nhập mật khẩu quản trị viên để tiếp tục.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Mật khẩu"
                    />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <div className="flex justify-end space-x-2 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md font-semibold text-gray-700 hover:bg-gray-300">Hủy</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md font-semibold hover:bg-primary-700">Xác nhận</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('STUDENT');
  const [adminTab, setAdminTab] = useState<AdminTab>('DASHBOARD');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleViewChange = () => {
    if (viewMode === 'ADMIN') {
        setViewMode('STUDENT');
    } else {
        if (isAdminAuthenticated) {
            setViewMode('ADMIN');
        } else {
            setShowPasswordModal(true);
        }
    }
  };

  const handlePasswordSubmit = () => {
    setIsAdminAuthenticated(true);
    setViewMode('ADMIN');
    setShowPasswordModal(false);
  };


  const renderAdminContent = () => {
    switch (adminTab) {
      case 'DASHBOARD':
        return <Dashboard />;
      case 'BOOKS':
        return <ManageBooks />;
      case 'STUDENTS':
        return <ManageStudents />;
      default:
        return <Dashboard />;
    }
  };
  
  const AdminNav: React.FC = () => (
    <div className="w-full bg-white shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
            <div className="flex space-x-4">
                <AdminTabButton
                    label="Bảng điều khiển"
                    isActive={adminTab === 'DASHBOARD'}
                    onClick={() => setAdminTab('DASHBOARD')}
                />
                <AdminTabButton
                    label="Sách"
                    isActive={adminTab === 'BOOKS'}
                    onClick={() => setAdminTab('BOOKS')}
                />
                <AdminTabButton
                    label="Học sinh"
                    isActive={adminTab === 'STUDENTS'}
                    onClick={() => setAdminTab('STUDENTS')}
                />
            </div>
        </div>
      </nav>
    </div>
  );

  const AdminTabButton: React.FC<{ label: string, isActive: boolean, onClick: () => void}> = ({label, isActive, onClick}) => (
     <button
        onClick={onClick}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            isActive
            ? 'bg-primary-600 text-white'
            : 'text-gray-500 hover:bg-primary-100 hover:text-primary-700'
        }`}
        >
        {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {showPasswordModal && <PasswordModal onSubmit={handlePasswordSubmit} onClose={() => setShowPasswordModal(false)} />}
      <header className="bg-primary-800 text-white shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <BookOpenIcon className="h-8 w-8" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide">Hệ thống Quản lý Thư viện</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm hidden sm:inline">{viewMode === 'ADMIN' ? 'Chế độ Quản trị' : 'Chế độ Học sinh'}</span>
            <label htmlFor="view-toggle" className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="view-toggle" className="sr-only peer" checked={viewMode === 'STUDENT'} onChange={handleViewChange} />
              <div className="w-11 h-6 bg-primary-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </header>
      
      <main>
        {viewMode === 'ADMIN' ? (
          <>
            <AdminNav />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {renderAdminContent()}
            </div>
          </>
        ) : (
          <StudentPortal />
        )}
      </main>
    </div>
  );
};

export default App;