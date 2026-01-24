/*
 * Đường dẫn file: D:\QLDT-app\client\src\hooks\usePageLogger.js
 * Thời gian cập nhật: 24/10/2025
 * Tóm tắt những nội dung cập nhật:
 * - SỬA LỖI: Thay đổi key dữ liệu gửi đến API từ viết thường
 * ('cuaso', 'congviec', 'ghichu') sang viết hoa chữ cái đầu
 * ('Cuaso', 'Congviec', 'Ghichu') để khớp với backend ('/log-action').
 */

import { useEffect } from 'react';
import axiosInstance from '../api/axios';

export const usePageLogger = (pageName) => {
  useEffect(() => {
    const logPageView = async () => {
      try {
        // Cập nhật: Sửa key dữ liệu
        await axiosInstance.post('/log-action', {
          Cuaso: pageName,     // Sửa từ 'cuaso'
          Congviec: 'Mở trang', // Sửa từ 'congviec'
          Ghichu: 'Thành công', // Sửa từ 'ghichu'
        });
      } catch (error) {
        console.error('Lỗi khi ghi log mở trang:', error.response?.data?.message || error.message);
      }
    };

    if (pageName) {
      logPageView();
    }
    
  }, [pageName]); 
};

