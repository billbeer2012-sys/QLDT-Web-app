/*
* Đường dẫn file: D:\QLDT-app\client\src\components\layout\Navbar.jsx
* Phiên bản cập nhật: 12/09/2025
* Tóm tắt những nội dung cập nhật (SỬA LỖI):
* - Xóa bỏ import và logic liên quan đến `LoginModal` đã không còn được sử dụng.
* - Luồng xác thực mới được quản lý bởi `AppShell` và `LoginPage`, do đó Navbar
* không cần chịu trách nhiệm mở modal đăng nhập nữa.
*/
import React, { useState } from 'react';
import { Home, Menu, X } from 'lucide-react';
import MainMenu from './MainMenu.jsx';
import UserProfile from '../../features/auth/UserProfile';
// import LoginModal from '../../features/auth/LoginModal'; // <= ĐÃ XÓA
import ChangePasswordModal from '../../features/auth/ChangePasswordModal';
import useTabStore from '../../store/tabStore.jsx';

const Navbar = ({ className }) => {
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   // const [loginOpen, setLoginOpen] = useState(false); // <= ĐÃ XÓA
   const [changePassOpen, setChangePassOpen] = useState(false);
   const setActiveTab = useTabStore(state => state.setActiveTab);

   // const handleOpenLogin = () => setLoginOpen(true); // <= ĐÃ XÓA
   const handleOpenChangePass = () => setChangePassOpen(true);

   return (
       <>
           <nav className={`bg-white dark:bg-gray-800 shadow-md ${className}`}>
               <div className="container mx-auto px-4">
                   <div className="flex items-center justify-between h-10">
                       {/* Desktop Menu & Home Icon */}
                       <div className="hidden md:flex items-center gap-1">
                           <button
                               onClick={() => setActiveTab('home')}
                               className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                               aria-label="Trang chủ"
                               title="Trang chủ"
                           >
                               <Home className="w-5 h-5" />
                           </button>
                           <MainMenu
                               isMobile={false}
                               // onOpenLogin={handleOpenLogin} // <= ĐÃ XÓA
                               onOpenChangePass={handleOpenChangePass}
                           />
                       </div>

                       {/* Desktop User Profile */}
                       <div className="hidden md:flex">
                           <UserProfile />
                       </div>

                       {/* Mobile Menu Button */}
                       <div className="md:hidden flex-1">
                           <button onClick={() => setIsMobileMenuOpen(true)} aria-label="Mở menu">
                               <Menu className="w-6 h-6" />
                           </button>
                       </div>
                        
                       {/* Mobile User Profile */}
                       <div className="md:hidden">
                           <UserProfile />
                       </div>
                   </div>
               </div>

               {/* Mobile Menu Overlay */}
               {isMobileMenuOpen && (
                   <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
                       <div
                           className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white dark:bg-gray-800 shadow-xl p-6 z-50 animate-slide-in"
                           onClick={(e) => e.stopPropagation()}
                       >
                           <div className="flex justify-between items-center mb-8">
                               <h2 className="text-lg font-bold text-primary dark:text-white">Menu</h2>
                               <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Đóng menu">
                                   <X className="w-6 h-6" />
                               </button>
                           </div>
                           <MainMenu
                               isMobile={true}
                               onNavigate={() => setIsMobileMenuOpen(false)}
                               // onOpenLogin={handleOpenLogin} // <= ĐÃ XÓA
                               onOpenChangePass={handleOpenChangePass}
                           />
                       </div>
                   </div>
               )}
           </nav>
            
           {/* <LoginModal open={loginOpen} onOpenChange={setLoginOpen} /> */} {/* <= ĐÃ XÓA */}
           <ChangePasswordModal open={changePassOpen} onOpenChange={setChangePassOpen} />
       </>
   );
};

// Thêm animation cho mobile menu (giữ nguyên)
const style = document.createElement('style');
style.innerHTML = `
@keyframes slide-in {
 from { transform: translateX(-100%); }
 to { transform: translateX(0); }
}
.animate-slide-in {
 animation: slide-in 0.3s ease-out;
}
`;
document.head.appendChild(style);

export default Navbar;
