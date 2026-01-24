/*
* Đường dẫn file: D:\QLDT-app\client\src\api\axios.js
* Phiên bản cập nhật: 22/09/2025
* Tóm tắt những nội dung cập nhật:
* - GỠ BỎ: Loại bỏ dòng `window.location.href`. Nhiệm vụ của interceptor
* giờ đây chỉ là cập nhật trạng thái (gọi logout), còn việc điều hướng
* sẽ do các component của React đảm nhận.
*/
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { toast } from 'react-hot-toast';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:3000/api/qdt',
    withCredentials: true
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const { status } = error.response || {};
        const { isLoggedIn, logout } = useAuthStore.getState();

        if (isLoggedIn && (status === 401 || status === 403)) {
            if (useAuthStore.getState().isLoggedIn) {
                toast.error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.', {
                    id: 'session-expired-toast',
                });
                // Chỉ gọi logout để cập nhật state
                logout();
                // GỠ BỎ: window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

