/*
 * D:\QLDT-app\client\src\features\auth\UserProfile.jsx
 * Phiên bản cập nhật: 08/7/2025
*/

import React from 'react';
import useAuthStore from '../../store/authStore';
import { LogOut, UserCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UserProfile = () => {
    const { isLoggedIn, user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        toast.success('Bạn đã đăng xuất thành công.');
    };

    if (!isLoggedIn) {
        return (
            <div className="flex items-center space-x-2 sm:space-x-3">
                <UserCircle className="w-8 h-8 text-gray-400" />
                {/* THAY ĐỔI: Xóa class `hidden` để hiển thị trên mobile */}
                <div className="block">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Guest</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Vui lòng đăng nhập</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2 sm:space-x-3">
            <UserCircle className="w-8 h-8 text-gray-500 flex-shrink-0" />
            {/* THAY ĐỔI: Xóa class `hidden sm:block` để hiển thị trên mobile */}
            <div className="block overflow-hidden">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate" title={user?.hoTen}>
                    {user?.hoTen}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={`${user?.chucVu} - ${user?.donVi}`}>
                    {user?.chucVu} - {user?.donVi}
                </p>
            </div>
            <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400 flex-shrink-0"
                title="Đăng xuất"
            >
                <LogOut className="w-5 h-5" />
            </button>
        </div>
    );
};

export default UserProfile;
