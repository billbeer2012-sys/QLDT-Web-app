/*
* Đường dẫn file: D:\QLDT-app\client\src\App.jsx
* Phiên bản cập nhật: 22/09/2025
* Tóm tắt những nội dung cập nhật:
* - TÁI CẤU TRÚC: Cấu trúc lại các Route để logic được rõ ràng hơn.
* - `AppShell` giờ đây sẽ là "cổng bảo vệ" cho tất cả các route cần
* đăng nhập, thay vì tự render ra `LoginPage`.
*/
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './AppShell';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ErrorBoundary from './ErrorBoundary';
import VersionChecker from './components/layout/VersionChecker';

function App() {
    document.title = "Quản lý đào tạo - CamauVKC";
    return (
        <ErrorBoundary>
			<VersionChecker>  
				<Routes>
					{/* Route công khai cho trang Login */}
					<Route path="/login" element={<LoginPage />} />

					{/* Route công khai cho xử lý callback từ Google */}
					<Route path="/auth/callback" element={<AuthCallbackPage />} />

					{/* Route "bảo vệ" cho toàn bộ phần còn lại của ứng dụng.
                      Bất kỳ ai cố gắng truy cập vào đây mà chưa đăng nhập
                      sẽ bị AppShell chặn lại và điều hướng về /login.
                    */}
					<Route path="/*" element={<AppShell />} />
				</Routes>
			</VersionChecker> 
        </ErrorBoundary>
    );
}
export default App;

