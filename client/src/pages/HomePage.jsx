/*
* D:\QLDT-app\client\src\pages\HomePage.jsx
* Phiên bản cập nhật: 22/01/2026
* Tóm tắt:
* - BỔ SUNG: Tích hợp TrainingDashboard hiển thị tiến độ đào tạo
* - Di chuyển thông tin phiên bản sang góc dưới bên phải
*/
import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
// BỔ SUNG 22/01/2026: Import TrainingDashboard
import TrainingDashboard from '../features/dashboard/TrainingDashboard';

const HomePage = () => {
    // State để lưu trữ phiên bản
    const [version, setVersion] = useState('');

    // useEffect để gọi API lấy phiên bản khi component được tải
    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const response = await axiosInstance.get('/version');
                setVersion(response.data.version);
            } catch (error) {
                console.error("Không thể tải phiên bản:", error);
                setVersion('N/A');
            }
        };

        fetchVersion();
    }, []);

    return (
        <div className="relative min-h-[calc(100vh-120px)] p-4">
            {/* BỔ SUNG 22/01/2026: Dashboard tiến độ đào tạo */}
            <TrainingDashboard />

            {/* Thông tin phiên bản - di chuyển sang góc dưới bên phải */}
            <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-md px-4 py-2 border border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100 transition-opacity">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Quản lý đào tạo
                </p>
                {version && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Ver: {version}
                    </p>
                )}
            </div>
        </div>
    );
};

export default HomePage;
