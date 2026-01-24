/*
 * D:\QLDT-app\client\src\pages\AuthCallbackPage.jsx
 * Phiên bản cập nhật: 13/09/2025
 * Tóm tắt những nội dung cập nhật:
 * - Giữ nguyên logic. File này được thiết kế tốt để nhận token từ URL,
 * giải mã và lưu trạng thái đăng nhập.
 * - Đảm bảo component được render đúng đường dẫn (ví dụ /auth/callback)
 * trong file cấu hình Router của bạn (thường là App.jsx).
 */
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { toast } from 'react-hot-toast';
import { Loader } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const AuthCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            try {
                // Dùng jwt-decode để giải mã token lấy thông tin user
                const user = jwtDecode(token);

                // Lưu thông tin user và token vào global state (Zustand)
                login(user, token);
                toast.success(`Chào mừng trở lại, ${user.hoTen || 'người dùng'}!`);

                // Chuyển hướng về trang chủ
                navigate('/', { replace: true });

            } catch (error) {
                console.error("Lỗi giải mã token:", error);
                toast.error('Token xác thực không hợp lệ. Vui lòng đăng nhập lại.');
                navigate('/login', { replace: true });
            }
        } else {
            // Nếu không có token, báo lỗi và chuyển về trang đăng nhập
            toast.error('Xác thực Google thất bại. Không nhận được token.');
            navigate('/login', { replace: true });
        }
    }, [searchParams, login, navigate]);

    // Giao diện loading trong lúc xử lý
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Loader className="w-12 h-12 animate-spin text-blue-600" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Đang xác thực, vui lòng chờ...</p>
        </div>
    );
};

export default AuthCallbackPage;
