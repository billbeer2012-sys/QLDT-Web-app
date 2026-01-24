/*
* * Đường dẫn file: client/src/components/layout/MainLayout.jsx
* Phiên bản cập nhật: 16/09/2025
* Tóm tắt những nội dung cập nhật:
* - GỠ BỎ: 
* + Di chuyển logic ghi nhận lượt truy cập VÀ Kiểm tra phiên bản sang component
* `VersionChecker.jsx` để đảm bảo nó được gọi ngay khi ứng dụng tải.
*/
import React, { useMemo, useEffect } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import useTabStore from '../../store/tabStore.jsx';
import { X, Loader } from 'lucide-react';
import BackToTopButton from './BackToTopButton';
import { Toaster } from 'react-hot-toast';
import useDarkMode from '../../hooks/useDarkMode';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import axiosInstance from '../../api/axios';
import useAuthStore from '../../store/authStore';


const PageLoader = () => (
    <div className="flex items-center justify-center h-full w-full p-10">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
    </div>
);

const MainLayout = () => {
    useDarkMode();
    const scrollDirection = useScrollDirection();
    const { tabs, activeTabId, setActiveTab, closeTab, getComponent } = useTabStore();
	const { isLoggedIn } = useAuthStore();
    
    // Bỏ: Ghi nhận lượt truy cập mỗi khi ứng dụng được tải
    //useEffect(() => {
        // Gọi API để ghi nhận lượt truy cập mỗi khi component được tải.
        // Logic sessionStorage đã được loại bỏ để đảm bảo mỗi lần tải/làm mới trang đều được đếm.
    //    axiosInstance.post('/dashboard/record-visit').catch(err => {
    //        console.error("Failed to record visit:", err);
    //    });
    //}, []); // Mảng rỗng [] đảm bảo nó chỉ chạy một lần mỗi khi component được mount.

    // Gửi heartbeat định kỳ khi đã đăng nhập
    useEffect(() => {
        let heartbeatInterval;
        if (isLoggedIn) {
            const sendHeartbeat = () => {
                axiosInstance.post('/activity/heartbeat').catch(err => console.error("Heartbeat failed:", err));
            };
            sendHeartbeat();
            heartbeatInterval = setInterval(sendHeartbeat, 60000); // Gửi lại mỗi phút
        }
        return () => {
            if (heartbeatInterval) clearInterval(heartbeatInterval);
        };
    }, [isLoggedIn]);

	return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
             {/* ĐÃ XÓA <VersionChecker /> KHỎI ĐÂY */}
            
            <Header className={`fixed top-0 left-0 right-0 transition-transform duration-300 z-40 ${
                scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
            }`} />

            <div className="pt-[76px] flex-grow flex flex-col">
                <Navbar className="sticky top-0 z-30" />

                <main className="flex-grow container mx-auto px-4 py-4 flex flex-col">
                    <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-t-lg border-b border-gray-300 dark:border-gray-700">
                        <div className="flex items-center overflow-x-auto">
                            {tabs.map(tab => (
                                <div
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
                                        activeTabId === tab.id
                                        ? 'border-blue-600 text-blue-600 font-semibold'
                                        : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <span>{tab.title}</span>
                                    {tab.id !== 'home' && (
                                        <button
                                            className="p-0.5 rounded-full hover:bg-red-500 hover:text-white"
                                            onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                                            title="Đóng tab"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-grow bg-white dark:bg-gray-800 rounded-b-lg shadow-md overflow-y-auto relative">
                        {tabs.map(tab => {
                            const Component = getComponent(tab.componentName);
                            return (
                                <div
                                    key={tab.id}
                                    className="h-full"
                                    style={{ display: activeTabId === tab.id ? 'block' : 'none' }}
                                >
                                    {Component ? <Component {...tab.props} /> : <PageLoader />}
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>

            <Footer />
            <BackToTopButton />
            <Toaster position="top-right" />
        </div>
    );
};


export default MainLayout;