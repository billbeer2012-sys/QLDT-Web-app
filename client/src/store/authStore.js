/*
* D:\QLDT-app\client\src\store\authStore.js
* Cập nhật: 20/08/2025
* Bổ sung người dùng isVC
*/
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,   
            token: null,   
            isLoggedIn: false,   
            isAdmin: false,
            isKetoan: false,
            isXepTKB: false,
            isKhaothi: false,
            isHssv: false,
            isTuyensinh: false,
			isVC: false,
			nhapDiem: false,
			
            login: (userData, token) => set({   
                user: userData, 
                token: token,   
                isLoggedIn: true,   
                isAdmin: userData.isAdmin === 1,
                isKetoan: userData.isKetoan === 1,
                isXepTKB: userData.isXepTKB === 1,
                isKhaothi: userData.isKhaothi === 1,
                isHssv: userData.isHssv === 1,
                isTuyensinh: userData.isTuyensinh === 1,
				isVC: userData.isVC === 1,
				nhapDiem: userData.nhapDiem === 1
				
            }),
            
            // SỬA LỖI: Bổ sung các dấu phẩy bị thiếu
            logout: () => set({   
                user: null,   
                token: null,   
                isLoggedIn: false,   
                isAdmin: false,
                isKetoan: false,
                isXepTKB: false,
                isKhaothi: false,
                isHssv: false,
                isTuyensinh: false,
				isVC: false,
				nhapDiem: false
            }),  
        }),  
        {   
            name: 'auth-storage',
        }  
    )  
);

export default useAuthStore;
