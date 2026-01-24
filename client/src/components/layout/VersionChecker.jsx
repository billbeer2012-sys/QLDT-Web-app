/*
* Đường dẫn file: client/src/components/layout/VersionChecker.jsx
* Phiên bản cập nhật: 19/09/2025
* Tóm tắt những nội dung cập nhật:
* - CẢI TIẾN: Bổ sung cơ chế kiểm tra phiên bản mới mỗi khi người dùng
* quay lại tab ứng dụng (sự kiện 'visibilitychange').
* - TỐI ƯU HÓA: Giảm thời gian kiểm tra định kỳ xuống còn 3 phút và
* thực hiện kiểm tra ngay khi component được tải.
* - Logic này đảm bảo người dùng (đặc biệt là sau khi đăng nhập) sẽ nhanh chóng
* nhận được phiên bản mới nhất.
*/
import React, { useEffect, useState, useRef, useCallback } from 'react';
import axiosInstance from '../../api/axios';
import { toast } from 'react-hot-toast';

const CHECK_INTERVAL = 3 * 60 * 1000; // Giảm thời gian chờ xuống còn 3 phút

const VersionChecker = ({ children }) => {
    const [initialVersion, setInitialVersion] = useState(null);
    const hasAnnouncedUpdate = useRef(false);

    // Logic ghi nhận lượt truy cập (giữ nguyên)
    useEffect(() => {
        const hasVisited = sessionStorage.getItem('visit_recorded');
        if (!hasVisited) {
            axiosInstance.post('/dashboard/record-visit')
                .then(() => {
                    sessionStorage.setItem('visit_recorded', 'true');
                    console.log('Đã ghi nhận lượt truy cập.');
                })
                .catch(err => {
                    console.error("Lỗi khi ghi nhận lượt truy cập:", err.message);
                });
        }
    }, []);

    // Tách logic kiểm tra ra một hàm có thể tái sử dụng bằng useCallback
    const checkVersion = useCallback(async () => {
        if (hasAnnouncedUpdate.current) return;

        try {
            const response = await axiosInstance.get('/version');
            const serverVersion = response.data.version;

            // Nếu đây là lần kiểm tra đầu tiên, chỉ cần lưu lại phiên bản
            if (!initialVersion) {
                setInitialVersion(serverVersion);
                console.log(`Phiên bản ứng dụng hiện tại: ${serverVersion}`);
                return;
            }

            // Từ những lần kiểm tra sau, so sánh với phiên bản đã lưu lúc đầu
            if (initialVersion && serverVersion !== initialVersion) {
                hasAnnouncedUpdate.current = true;
                toast('Phát hiện phiên bản mới, ứng dụng sẽ được tải lại.', {
                    icon: '🚀',
                    duration: 5000,
                });
                setTimeout(() => window.location.reload(), 3000);
            }
        } catch (error) {
            // Âm thầm bỏ qua lỗi để không ảnh hưởng đến trải nghiệm người dùng
        }
    }, [initialVersion]); // Hàm này sẽ được tạo lại nếu initialVersion thay đổi

    // useEffect chính để quản lý các trình kích hoạt kiểm tra
    useEffect(() => {
        // 1. Chạy lần đầu ngay khi component được tải
        checkVersion();

        // 2. Chạy định kỳ
        const intervalId = setInterval(checkVersion, CHECK_INTERVAL);

        // 3. BỔ SUNG: Chạy mỗi khi người dùng quay lại tab ứng dụng
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('Tab is active, checking for new version...');
                checkVersion();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Dọn dẹp các listener và interval khi component unmount
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [checkVersion]); // useEffect này sẽ chạy lại nếu hàm checkVersion thay đổi

    return <>{children}</>;
};

export default VersionChecker;

