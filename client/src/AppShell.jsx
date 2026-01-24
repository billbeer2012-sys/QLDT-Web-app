/*
* Đường dẫn file: D:\QLDT-app\client\src\AppShell.jsx
* Phiên bản cập nhật: 22/09/2025
* Tóm tắt những nội dung cập nhật:
* - NÂNG CẤP: Biến AppShell thành một "người gác cổng" thông minh.
* - Sử dụng `useEffect` và `useNavigate` để "lắng nghe" sự thay đổi
* của `isLoggedIn`. Khi người dùng bị đăng xuất, nó sẽ chủ động
* điều hướng người dùng về trang /login một cách mượt mà.
*/
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/authStore';
import MainLayout from './components/layout/MainLayout';

const AppShell = () => {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Nếu người dùng chưa đăng nhập, điều hướng họ đến trang login.
        if (!isLoggedIn) {
            // Chúng ta lưu lại trang họ đang cố truy cập (location.pathname)
            // để có thể đưa họ trở lại sau khi đăng nhập thành công.
            navigate('/login', { state: { from: location.pathname } });
        }
    }, [isLoggedIn, navigate, location]);

    // Nếu isLoggedIn là false, effect ở trên sẽ xử lý điều hướng.
    // Component sẽ chỉ render MainLayout khi chắc chắn người dùng đã đăng nhập.
    return isLoggedIn ? <MainLayout /> : null;
};

export default AppShell;

