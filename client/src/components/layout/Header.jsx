/*
* Đường dẫn file: D:\QLDT-app\client\src\components\layout\Header.jsx
* Phiên bản cập nhật: 25/09/2025
* Tóm tắt những nội dung cập nhật:
* - BỔ SUNG: Thêm chức năng bật/tắt chế độ toàn màn hình (Fullscreen Mode).
* - BỔ SUNG: Thêm một nút icon (Maximize/Minimize) trên Header để người dùng
* có thể chủ động kích hoạt.
*/
import React, { useState, useEffect } from 'react';
import { Sun, Moon, Maximize, Minimize, User, LogOut } from 'lucide-react';
import useDarkMode from '../../hooks/useDarkMode';
import useAuthStore from '../../store/authStore';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const Header = ({ className }) => {
    const [theme, toggleTheme] = useDarkMode();
    const { user, logout } = useAuthStore();
    const [isFullscreen, setIsFullscreen] = useState(false);
	
	// BỔ SUNG: Logic xử lý chế độ toàn màn hình
    const handleFullscreenToggle = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                alert(`Lỗi khi bật chế độ toàn màn hình: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    // BỔ SUNG: Lắng nghe sự kiện thay đổi trạng thái toàn màn hình
    // (ví dụ: khi người dùng nhấn phím Esc)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);
	
    return (
        <header className={`bg-gradient-to-r from-blue-800 to-blue-600 dark:from-gray-900 dark:to-gray-800 text-white shadow-lg h-[76px] ${className}`}>
            <div className="container mx-auto px-4 py-3 h-full">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center space-x-4">
                        <img 
                            src="/Logo.jpg" 
                            alt="Logo CamauVKC" 
                            className="h-14 w-14 rounded-full border-2 border-yellow-400"
                        />
                        <div>
                            <h1 className="font-bold text-xs sm:text-sm md:text-base leading-tight text-yellow-300">
                                UBND TỈNH CÀ MAU
                            </h1>
                            <h2 className="font-bold text-sm sm:text-base md:text-xl leading-tight">
                                TRƯỜNG CAO ĐẲNG NGHỀ VIỆT NAM - HÀN QUỐC CÀ MAU
                            </h2>
                        </div>
					</div>
               
                    {/* Phần các nút chức năng */}
					<div className="flex items-center gap-2 sm:gap-4">
						{/* Nút Chuyển đổi Giao diện Sáng/Tối */}
						<button 
							onClick={toggleTheme}
							className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
							title="Chuyển đổi giao diện"
						>
							{theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
						</button>
						
						{/* BỔ SUNG: Nút Toàn màn hình */}
						<button
							onClick={handleFullscreenToggle}
							className="w-10 h-10 text-white-600 flex items-center justify-center rounded-full bg-white/20 hover:bg-gray-200 dark:hover:bg-gray-700 "
							title={isFullscreen ? "Thoát chế độ toàn màn hình" : "Chế độ toàn màn hình"}
						>
							{isFullscreen ? <Minimize className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <Maximize className="w-5 h-5 text-white-600 dark:text-gray-300" />}
						</button>

					</div>
				</div>
			</div>
        </header>
    );
};
export default Header;
