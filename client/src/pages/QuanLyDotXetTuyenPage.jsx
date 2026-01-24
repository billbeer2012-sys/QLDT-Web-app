/*
 * Đường dẫn file: D:\QLDT-app\client\src\pages\QuanLyDotXetTuyenPage.jsx
 * Cập nhật: 25/10/2025
 * Tóm tắt: Bổ sung log khi mở trang
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, BookUser, Layers } from 'lucide-react'; // BỔ SUNG: Layers icon
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import moment from 'moment';

import { fetchDotXetTuyens, addDotXetTuyen, updateDotXetTuyen, deleteDotXetTuyen } from '../api/dotxettuyen';
import DotXetTuyenFormDialog from '../features/dot-xet-tuyen/DotXetTuyenFormDialog';
import DeleteDotXetTuyenDialog from '../features/dot-xet-tuyen/DeleteDotXetTuyenDialog';
import ChiTieuTuyenSinhDialog from '../features/dot-xet-tuyen/ChiTieuTuyenSinhDialog'; 
// BỔ SUNG: Import dialog Tổ hợp XT
import ToHopXetTuyenDialog from '../features/dot-xet-tuyen/ToHopXetTuyenDialog';

const baseButtonStyles = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
const primaryButtonStyles = "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
const secondaryButtonStyles = "text-white bg-gray-600 hover:bg-gray-700 focus:ring-gray-500";
const destructiveButtonStyles = "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500";
//Bước 1: Bổ sung Import hook
import { usePageLogger } from '../hooks/usePageLogger';


const QuanLyDotXetTuyenPage = () => {
    //Bước 2: Gọi ghi log
	// Tên '...' sẽ được ghi vào cột 'Cuaso'
	usePageLogger('DM đợt xét tuyển');

	const [dotXetTuyens, setDotXetTuyens] = useState([]);
    const [selectedDotXT, setSelectedDotXT] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const user = useAuthStore((state) => state.user);

    const [isChiTieuOpen, setIsChiTieuOpen] = useState(false);
    // BỔ SUNG: State cho dialog Tổ hợp XT
    const [isToHopOpen, setIsToHopOpen] = useState(false);

    const canManage = user?.isAdmin || (user?.isXepTKB && user?.isTuyensinh);
    const canDelete = user?.isAdmin;

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await fetchDotXetTuyens();
            setDotXetTuyens(data);
            setSelectedDotXT(null);
        } catch (error) {
            toast.error('Lỗi: Không thể tải danh sách đợt xét tuyển.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAddNew = () => { setSelectedDotXT(null); setIsFormOpen(true); };
    const handleEdit = (dotXT) => { setSelectedDotXT(dotXT); setIsFormOpen(true); };
    const handleDelete = (dotXT) => { setSelectedDotXT(dotXT); setIsDeleteConfirmOpen(true); };
    const handleOpenChiTieu = () => {
        if (selectedDotXT) { setIsChiTieuOpen(true); }
    };
    // BỔ SUNG: Hàm mở dialog Tổ hợp XT
    const handleOpenToHop = () => {
        if (selectedDotXT) { setIsToHopOpen(true); }
    };

    const handleSave = async (formData) => {
        const isEditing = !!selectedDotXT;
        const promise = isEditing ? updateDotXetTuyen(selectedDotXT.MaDXT, formData) : addDotXetTuyen(formData);
        await toast.promise(promise, {
            loading: 'Đang xử lý...',
            success: (res) => { loadData(); return res.message; },
            error: (err) => err.response?.data?.message || 'Đã xảy ra lỗi.',
        });
        setIsFormOpen(false);
    };

    const confirmDelete = async () => {
        if (!selectedDotXT) return;
        await toast.promise(deleteDotXetTuyen(selectedDotXT.MaDXT), {
            loading: 'Đang xóa...',
            success: (res) => {
                setIsDeleteConfirmOpen(false);
                loadData();
                return res.message;
            },
            error: (err) => err.response?.data?.message || 'Lỗi khi xóa.',
        });
    };
    
    const formatDate = (dateString, format = 'DD/MM/YYYY') => dateString ? moment(dateString).format(format) : '';

    return (
        <div className="p-4 h-full flex flex-col">
            <h1 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-white text-center uppercase">DANH MỤC ĐỢT XÉT TUYỂN</h1>
            <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                    {canManage && <button onClick={handleAddNew} className={`${baseButtonStyles} ${primaryButtonStyles}`}><Plus className="mr-2 h-4 w-4" /> Thêm mới</button>}
                    {canManage && <button onClick={() => selectedDotXT && handleEdit(selectedDotXT)} disabled={!selectedDotXT} className={`${baseButtonStyles} ${primaryButtonStyles}`}><Edit className="mr-2 h-4 w-4" /> Chỉnh sửa</button>}
                    {canDelete && <button onClick={() => selectedDotXT && handleDelete(selectedDotXT)} disabled={!selectedDotXT} className={`${baseButtonStyles} ${destructiveButtonStyles}`}><Trash2 className="mr-2 h-4 w-4" /> Xóa</button>}
                </div>
                {/* BỔ SUNG: Nhóm nút mới */}
                <div className="flex space-x-2">
                     <button onClick={handleOpenChiTieu} disabled={!selectedDotXT} className={`${baseButtonStyles} ${secondaryButtonStyles}`}><BookUser className="mr-2 h-4 w-4" /> Chỉ tiêu TS</button>
                     <button onClick={handleOpenToHop} disabled={!selectedDotXT} className={`${baseButtonStyles} ${secondaryButtonStyles}`}><Layers className="mr-2 h-4 w-4" /> Tổ hợp XT</button>
                </div>
            </div>

            {isLoading ? <p>Đang tải dữ liệu...</p> : (
                <div className="flex-grow overflow-auto">
                    <table className="min-w-full bg-white border">
                        <thead className="sticky top-0 bg-gray-200 z-10">
                            <tr>
                                <th className="py-2 px-4 border">ID</th>
                                <th className="py-2 px-4 border">Tên ĐXT</th>
                                <th className="py-2 px-4 border">Mã ĐXT</th>
                                <th className="py-2 px-4 border">Hết hạn nộp hồ sơ</th>
                                <th className="py-2 px-4 border">Ngày xét tuyển</th>
                                <th className="py-2 px-4 border">Địa điểm làm thủ tục</th>
                                <th className="py-2 px-4 border">Ngày nhập học</th>
                                <th className="py-2 px-4 border">Địa điểm nhập học</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dotXetTuyens.map((dxt) => (
                                <tr key={dxt.MaDXT} onClick={() => setSelectedDotXT(dxt)} className={`cursor-pointer hover:bg-blue-100 ${selectedDotXT?.MaDXT === dxt.MaDXT ? 'bg-blue-200' : ''}`}>
                                    <td className="py-2 px-4 border text-center">{dxt.MaDXT}</td>
                                    <td className="py-2 px-4 border">{dxt.DotXT}</td>
                                    <td className="py-2 px-4 border">{dxt.Ma_DXT}</td>
                                    <td className="py-2 px-4 border text-center">{formatDate(dxt.Ngayketthuc)}</td>
                                    <td className="py-2 px-4 border text-center">{formatDate(dxt.NgayXetTuyen)}</td>
                                    <td className="py-2 px-4 border">{dxt.DiadiemThutuc}</td>
                                    <td className="py-2 px-4 border text-center">{formatDate(dxt.NgayNhapHoc, 'DD/MM/YYYY HH:mm')}</td>
                                    <td className="py-2 px-4 border">{dxt.DiadiemNhaphoc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <DotXetTuyenFormDialog isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSave} initialData={selectedDotXT} />
            <DeleteDotXetTuyenDialog isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={confirmDelete} dotXetTuyen={selectedDotXT} />
            <ChiTieuTuyenSinhDialog isOpen={isChiTieuOpen} onClose={() => setIsChiTieuOpen(false)} dotXetTuyen={selectedDotXT} />
            {/* BỔ SUNG: Render dialog Tổ hợp XT */}
            <ToHopXetTuyenDialog isOpen={isToHopOpen} onClose={() => setIsToHopOpen(false)} dotXetTuyen={selectedDotXT} />
        </div>
    );
};
export default QuanLyDotXetTuyenPage;

