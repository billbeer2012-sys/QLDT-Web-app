/*
 * Đường dẫn file: D:\QLDT-app\client\src\pages\FeeNotificationSetupPage.jsx
 * Cập nhật: 25/10/2025
 * Tóm tắt: Bổ sung log khi mở trang
 */
import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';
import { Save, Loader2, Calendar as CalendarIcon, Building2 } from 'lucide-react';
import moment from 'moment';
//Bước 1: Bổ sung Import hook
import { usePageLogger } from '../hooks/usePageLogger';


const FeeNotificationSetupPage = () => {
    //Bước 2: Gọi ghi log
	// Tên '...' sẽ được ghi vào cột 'Cuaso'
	usePageLogger('Thông báo học phí');

	const [formData, setFormData] = useState({
        MaHK: '',
        SoTB: '',
        NgayTB: '',
        NgayBatdau: '',
        NgayKetthuc: '',
        BankID: '',
        Ghichu: ''
    });
    const [semesters, setSemesters] = useState([]);
    const [banks, setBanks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [settingsRes, semestersRes, banksRes] = await Promise.all([
                axiosInstance.get('/fee-notification/settings'),
                axiosInstance.get('/fee-notification/semesters'),
                axiosInstance.get('/fee-notification/banks')
            ]);

            const settingsData = settingsRes.data;
            setFormData({
                MaHK: settingsData.MaHK || '',
                SoTB: settingsData.SoTB || '',
                NgayTB: settingsData.NgayTB ? moment(settingsData.NgayTB).format('YYYY-MM-DD') : '',
                NgayBatdau: settingsData.NgayBatdau ? moment(settingsData.NgayBatdau).format('YYYY-MM-DD') : '',
                NgayKetthuc: settingsData.NgayKetthuc ? moment(settingsData.NgayKetthuc).format('YYYY-MM-DD') : '',
                BankID: settingsData.BankID || '',
                Ghichu: settingsData.Ghichu || ''
            });

            setSemesters(semestersRes.data);
            setBanks(banksRes.data);

        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            toast.error(error.response?.data?.message || "Không thể tải dữ liệu cần thiết.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        // Validation basic
        for (const key in formData) {
            if (key !== 'Ghichu' && !formData[key]) {
                toast.error('Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
                setIsSaving(false);
                return;
            }
        }

        const toastId = toast.loading('Đang lưu thay đổi...');
        try {
            const payload = {
                ...formData,
                NgayTB: moment(formData.NgayTB).toISOString(),
                NgayBatdau: moment(formData.NgayBatdau).toISOString(),
                NgayKetthuc: moment(formData.NgayKetthuc).toISOString(),
            };
            await axiosInstance.put('/fee-notification/settings', payload);
            toast.success('Cập nhật thông báo thành công!', { id: toastId });
        } catch (error) {
            console.error("Lỗi khi lưu dữ liệu:", error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu.", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900 h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-white text-center uppercase">Thiết lập thông báo Thu học phí</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 text-center">
                        Cập nhật thông tin cho thông báo thu học phí sẽ được áp dụng cho toàn hệ thống.
                    </p>
                </div>
                <form onSubmit={handleSave} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Học kỳ */}
                        <div className="col-span-1">
                            <label htmlFor="MaHK" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Học kỳ <span className="text-red-500">*</span></label>
                            <select
                                id="MaHK"
                                name="MaHK"
                                value={formData.MaHK}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">-- Chọn học kỳ --</option>
                                {semesters.map(semester => (
                                    <option key={semester.MaHK} value={semester.MaHK}>{semester.Hocky}</option>
                                ))}
                            </select>
                        </div>

                        {/* Số thông báo */}
                        <div className="col-span-1">
                            <label htmlFor="SoTB" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số thông báo <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                id="SoTB"
                                name="SoTB"
                                value={formData.SoTB}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="VD: 123/TB-CĐN"
                            />
                        </div>

                        {/* Ngày ký TB */}
                        <div className="col-span-1 relative">
                            <label htmlFor="NgayTB" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày ký thông báo <span className="text-red-500">*</span></label>
                             <CalendarIcon className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                            <input
                                type="date"
                                id="NgayTB"
                                name="NgayTB"
                                value={formData.NgayTB}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Ngày đóng HP */}
                        <div className="col-span-1 relative">
                            <label htmlFor="NgayBatdau" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày bắt đầu đóng HP <span className="text-red-500">*</span></label>
                             <CalendarIcon className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                            <input
                                type="date"
                                id="NgayBatdau"
                                name="NgayBatdau"
                                value={formData.NgayBatdau}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Ngày hết hạn */}
                        <div className="col-span-1 relative">
                            <label htmlFor="NgayKetthuc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày hết hạn đóng HP <span className="text-red-500">*</span></label>
                             <CalendarIcon className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                            <input
                                type="date"
                                id="NgayKetthuc"
                                name="NgayKetthuc"
                                value={formData.NgayKetthuc}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Thu vào tài khoản */}
                        <div className="col-span-1 relative">
                             <label htmlFor="BankID" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thu vào tài khoản <span className="text-red-500">*</span></label>
                             <Building2 className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                             <select
                                id="BankID"
                                name="BankID"
                                value={formData.BankID}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">-- Chọn tài khoản ngân hàng --</option>
                                {banks.map(bank => (
                                    <option key={bank.BankID} value={bank.BankID}>
                                        {`${bank.BankName} (${bank.AccountNo})`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Ghi chú */}
                        <div className="md:col-span-2">
                             <label htmlFor="Ghichu" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ghi chú</label>
                             <textarea
                                id="Ghichu"
                                name="Ghichu"
                                value={formData.Ghichu}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập nội dung ghi chú nếu có..."
                             ></textarea>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                         <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeeNotificationSetupPage;
