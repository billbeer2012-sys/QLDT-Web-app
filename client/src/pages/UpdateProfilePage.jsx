/*
* Đường dẫn file: D:\QLDT-app\client\src\pages\UpdateProfilePage.jsx
* Cập nhật: 25/10/2025
* Tóm tắt: Bổ sung log khi mở trang
*/

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import useAuthStore from '../store/authStore';
import { toast } from 'react-hot-toast';
import { User, Briefcase, Phone, Mail, Save, XCircle, Loader2 } from 'lucide-react';
//Bước 1: Bổ sung Import hook
import { usePageLogger } from '../hooks/usePageLogger';

// Component ảnh đại diện với logic fallback
const ProfilePicture = ({ maso }) => {
    const [imageSrc, setImageSrc] = useState(`https://camauvkc.edu.vn/Images/HinhGV/${maso}.jpg`);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Reset state khi maso thay đổi
        setImageSrc(`https://camauvkc.edu.vn/Images/HinhGV/${maso}.jpg`);
        setError(false);
    }, [maso]);

    const handleImageError = () => {
        // Nếu .jpg lỗi, thử .png
        if (!imageSrc.endsWith('.png')) {
            setImageSrc(`https://camauvkc.edu.vn/Images/HinhGV/${maso}.png`);
        } else {
            // Nếu cả .jpg và .png đều lỗi, set cờ error
            setError(true);
        }
    };

    if (error || !maso) {
        // Ảnh mặc định nếu không có ảnh nào được tìm thấy
        return (
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-6 ring-4 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800">
                <User className="w-16 h-16 text-gray-400" />
            </div>
        );
    }

    return (
        <img
            src={imageSrc}
            onError={handleImageError}
            alt="Ảnh đại diện"
            className="w-32 h-32 rounded-full object-cover mb-6 ring-4 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800"
        />
    );
};


const UpdateProfilePage = () => {
    //Bước 2: Gọi ghi log
	// Tên '...' sẽ được ghi vào cột 'Cuaso'
	usePageLogger('Cập nhật thông tin user');

	const navigate = useNavigate();
    const { user } = useAuthStore();
    const [formData, setFormData] = useState({
        chuyenNganh: '',
        dienThoai: '',
        email: ''
    });
    const [initialData, setInitialData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const { data } = await axiosInstance.get('/user/profile');
                const profileData = {
                    chuyenNganh: data.Chuyennganh || '',
                    dienThoai: data.Dienthoai || '',
                    email: data.Email || ''
                };
                setFormData(profileData);
                setInitialData({
                    maso: data.Maso,
                    hoTen: `${data.Holot} ${data.Ten}`
                });
            } catch (error) {
                toast.error('Không thể tải thông tin cá nhân.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { data } = await axiosInstance.put('/user/profile', formData);
            toast.success(data.message);
            // Có thể đóng form sau khi lưu thành công
            // navigate(-1);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lưu thông tin thất bại.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-white text-center uppercase">
                    Cập nhật thông tin người dùng
                </h1>

                <div className="flex flex-col items-center">
                    <ProfilePicture maso={initialData?.maso} />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Mã số */}
                    <div className="flex items-center">
                        <label className="w-1/3 text-gray-600 dark:text-gray-300 font-medium">Mã số:</label>
                        <input
                            type="text"
                            value={initialData?.maso || ''}
                            readOnly
                            className="w-2/3 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md cursor-not-allowed"
                        />
                    </div>
                    {/* Họ và tên */}
                     <div className="flex items-center">
                        <label className="w-1/3 text-gray-600 dark:text-gray-300 font-medium">Họ và tên:</label>
                        <input
                            type="text"
                            value={initialData?.hoTen || ''}
                            readOnly
                            className="w-2/3 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md cursor-not-allowed"
                        />
                    </div>
                     {/* Chuyên ngành */}
                     <div className="flex items-center">
                        <label htmlFor="chuyenNganh" className="w-1/3 text-gray-600 dark:text-gray-300 font-medium">Chuyên ngành:</label>
                        <input
                            id="chuyenNganh"
                            name="chuyenNganh"
                            type="text"
                            value={formData.chuyenNganh}
                            onChange={handleChange}
                            className="w-2/3 p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                     {/* Điện thoại */}
                     <div className="flex items-center">
                        <label htmlFor="dienThoai" className="w-1/3 text-gray-600 dark:text-gray-300 font-medium">Điện thoại:</label>
                        <input
                            id="dienThoai"
                            name="dienThoai"
                            type="text"
                            value={formData.dienThoai}
                            onChange={handleChange}
                            className="w-2/3 p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                     {/* Email */}
                     <div className="flex items-center">
                        <label htmlFor="email" className="w-1/3 text-gray-600 dark:text-gray-300 font-medium">Email:</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-2/3 p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <p className="text-sm italic text-yellow-600 dark:text-yellow-400 text-center pt-2">
                        Ghi chú: Cần nhập đúng Email đang sử dụng để có thể đăng nhập bằng tài khoản Google hoặc để khôi phục mật khẩu nếu bị quên.
                    </p>

                    {/* Nút bấm */}
                    <div className="flex justify-center items-center gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            <span>Lưu</span>
                        </button>
                        
                    </div>

                </form>
            </div>
        </div>
    );
};

export default UpdateProfilePage;
