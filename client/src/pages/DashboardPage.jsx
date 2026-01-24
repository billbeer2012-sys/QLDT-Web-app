/*
* D:\QLDT-app\client\src\pages\DashboardPage.jsx
* Cập nhật: 22/01/2026
* Đổi tên
*/
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
// Bỏ import Server và Database
import { Loader, AlertCircle, Eye, Users, CalendarCheck, CalendarClock } from 'lucide-react';
import moment from 'moment-timezone';
import 'moment/locale/vi';

// Component Card thống kê (Không thay đổi)
const StatCard = ({ icon, title, value, color, loading }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            {loading ? (
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
            )}
        </div>
    </div>
);

const DashboardPage = () => {
    const [stats, setStats] = useState({ totalVisits: 0, todaysVisits: 0, yesterdaysVisits: 0, onlineUsers: { count: 0, users: [] } });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/dashboard/stats');
            setStats(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải dữ liệu dashboard.');
            toast.error("Lỗi khi tải dữ liệu dashboard.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        moment.locale('vi');
        fetchData(); 

        const interval = setInterval(() => {
            fetchData();
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-10 text-red-600">
                <AlertCircle className="w-12 h-12 mb-4" />
                <p className="font-semibold">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center uppercase">
                THỐNG KÊ TRUY CẬP
            </h1>

            {/* Cập nhật layout grid thành 4 cột trên màn hình lớn */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard 
                    icon={<Eye className="w-6 h-6 text-white"/>} 
                    title="Tổng lượt truy cập" 
                    value={stats.totalVisits.toLocaleString('vi-VN')}
                    color="bg-blue-500"
                    loading={loading && stats.totalVisits === 0}
                />
                <StatCard 
                    icon={<CalendarCheck className="w-6 h-6 text-white"/>} 
                    title="Truy cập hôm nay" 
                    value={stats.todaysVisits.toLocaleString('vi-VN')}
                    color="bg-yellow-500"
                    loading={loading && stats.todaysVisits === 0}
                />
                <StatCard 
                    icon={<CalendarClock className="w-6 h-6 text-white"/>} 
                    title="Truy cập hôm qua" 
                    value={stats.yesterdaysVisits.toLocaleString('vi-VN')}
                    color="bg-pink-500"
                    loading={loading && stats.yesterdaysVisits === 0}
                />
                <StatCard 
                    icon={<Users className="w-6 h-6 text-white"/>} 
                    title="Người dùng Online" 
                    value={stats.onlineUsers.count}
                    color="bg-green-500"
                    loading={loading && stats.onlineUsers.count === 0}
                />
                {/* ĐÃ LOẠI BỎ 2 CARD TRẠNG THÁI SERVER VÀ DATABASE */}
            </div>

            {/* Phần danh sách người dùng online (giữ nguyên) */}
            <div className="flex-grow bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 overflow-auto">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">
                    Danh sách người dùng đang hoạt động
                </h2>
                {loading && stats.onlineUsers.users.length === 0 ? (
                    <div className="flex items-center justify-center h-40"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div>
                ) : stats.onlineUsers.users.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Họ và tên</th>
                                    <th className="py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Tài khoản</th>
                                    <th className="py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Thiết bị</th>
                                    <th className="py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Địa chỉ IP</th>
                                    <th className="py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Hoạt động cuối</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.onlineUsers.users.map(user => (
                                    <tr key={user.MaUser} className="border-b border-gray-200 dark:border-gray-700">
                                        <td className="py-3 font-medium text-gray-800 dark:text-gray-200">{user.HoTen}</td>
                                        <td className="py-3 text-gray-600 dark:text-gray-300">{user.MaUser}</td>
                                        <td className="py-3 text-gray-600 dark:text-gray-300">{user.DeviceInfo}</td>
                                        <td className="py-3 text-gray-600 dark:text-gray-300">{user.IPAddress}</td>
                                        <td className="py-3 text-gray-600 dark:text-gray-300">{moment(user.LastSeen).fromNow()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-10">Không có người dùng nào đang hoạt động.</p>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
