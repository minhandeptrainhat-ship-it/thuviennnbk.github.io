import React, { useState, useEffect } from 'react';
import type { DashboardStats, OverdueRecordDetail } from '../types';
import libraryService from '../services/libraryService';
import { BookOpenIcon, UsersIcon, ClockIcon, CheckCircleIcon, TrophyIcon, ChartBarIcon, EyeIcon } from './icons';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  actionText?: string;
  onAction?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color, actionText, onAction }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between transition-transform duration-300 hover:scale-105">
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
    {/* Fix: Check if value is a number before comparing with > 0 */}
    {onAction && typeof value === 'number' && value > 0 && (
      <button onClick={onAction} className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-800 flex items-center justify-end">
        {actionText} <EyeIcon className="ml-1 h-4 w-4" />
      </button>
    )}
  </div>
);


const ListCard: React.FC<{ title: string, items: {name: string, count: number}[] | {title: string, count: number}[], icon: React.ReactNode }> = ({ title, items, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md col-span-1 md:col-span-2">
        <div className="flex items-center space-x-3 mb-4">
            {icon}
            <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        </div>
        <ul className="space-y-3">
            {items.map((item, index) => {
                const name = 'name' in item ? item.name : item.title;
                return (
                <li key={index} className="flex justify-between items-center text-sm text-gray-600">
                    <span>{index+1}. {name}</span>
                    <span className="font-bold bg-primary-100 text-primary-700 px-2 py-1 rounded-full">{item.count} lượt mượn</span>
                </li>
                );
            })}
             {items.length === 0 && <p className="text-center text-gray-400 py-4">Không có dữ liệu.</p>}
        </ul>
    </div>
)

const OverdueModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [records, setRecords] = useState<OverdueRecordDetail[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverdue = async () => {
            const data = await libraryService.getOverdueRecords();
            setRecords(data);
            setLoading(false);
        };
        fetchOverdue();
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Chi tiết Sách Mượn Quá Hạn</h3>
                <div className="max-h-96 overflow-y-auto">
                    {loading ? <p>Đang tải...</p> : (
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                                    <th className="px-5 py-3 border-b-2 border-gray-200">Học sinh</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200">Tên sách</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200">Ngày hết hạn</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(r => (
                                    <tr key={r.recordId} className="hover:bg-gray-50">
                                        <td className="px-5 py-4 border-b border-gray-200 text-sm">{r.studentName}</td>
                                        <td className="px-5 py-4 border-b border-gray-200 text-sm">{r.bookTitle}</td>
                                        <td className="px-5 py-4 border-b border-gray-200 text-sm text-red-600 font-semibold">{r.dueDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Đóng</button>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOverdueModalOpen, setOverdueModalOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await libraryService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, 2500);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div className="text-center p-10">Đang tải bảng điều khiển...</div>;
  }

  if (!stats) {
    return <div className="text-center p-10 text-red-500">Không thể tải dữ liệu bảng điều khiển.</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {isOverdueModalOpen && <OverdueModal onClose={() => setOverdueModalOpen(false)} />}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Bảng điều khiển Quản trị</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Tổng số sách" value={stats.totalBooks} icon={<BookOpenIcon className="h-6 w-6 text-white" />} color="bg-blue-500" />
        <DashboardCard title="Tổng số học sinh" value={stats.totalStudents} icon={<UsersIcon className="h-6 w-6 text-white" />} color="bg-green-500" />
        <DashboardCard title="Sách đang mượn" value={stats.borrowedCount} icon={<CheckCircleIcon className="h-6 w-6 text-white" />} color="bg-indigo-500" />
        <DashboardCard title="Sách quá hạn" value={stats.overdueCount} icon={<ClockIcon className="h-6 w-6 text-white" />} color="bg-red-500" onAction={() => setOverdueModalOpen(true)} actionText="Xem chi tiết"/>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <ListCard title="Học sinh mượn nhiều nhất" items={stats.topStudents} icon={<TrophyIcon className="h-6 w-6 text-yellow-500" />} />
            <ListCard title="Sách được mượn nhiều nhất" items={stats.topBooks} icon={<ChartBarIcon className="h-6 w-6 text-purple-500" />} />
        </div>
    </div>
  );
};

export default Dashboard;
