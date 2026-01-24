/*
 * Đường dẫn file: D:\QLDT-app\client\src\features\dot-xet-tuyen\ChiTieuTuyenSinhDialog.jsx
 * Ngày tạo: 07/10/2025
 * Tóm tắt:
 * - Component Dialog mới để hiển thị và cập nhật chỉ tiêu tuyển sinh cho một đợt xét tuyển.
 * - Lấy danh sách ngành học và chỉ tiêu đã có qua API.
 * - Cho phép chỉnh sửa và lưu lại chỉ tiêu.
 * - Phân quyền cho các nút lệnh "Chỉnh sửa", "Lưu".
 */

import React, { useState, useEffect, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Edit, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchChiTieu, saveChiTieu } from '../../api/dotxettuyen';
import useAuthStore from '../../store/authStore';

const baseButtonStyles = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
const primaryButtonStyles = "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
const outlineButtonStyles = "text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-indigo-500";
const inputStyles = "w-full text-center px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600";

const ChiTieuTuyenSinhDialog = ({ isOpen, onClose, dotXetTuyen }) => {
    const [chiTieuData, setChiTieuData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const user = useAuthStore((state) => state.user);
    const canEdit = user?.isAdmin || (user?.isXepTKB && user?.isTuyensinh);

    const loadChiTieu = useCallback(async () => {
        if (!dotXetTuyen?.MaDXT) return;
        setIsLoading(true);
        try {
            const data = await fetchChiTieu(dotXetTuyen.MaDXT);
            setChiTieuData(data.map(item => ({ ...item, Chitieu: item.Chitieu || '' })));
        } catch (error) {
            toast.error("Lỗi khi tải dữ liệu chỉ tiêu.");
        } finally {
            setIsLoading(false);
        }
    }, [dotXetTuyen]);

    useEffect(() => {
        if (isOpen) {
            loadChiTieu();
            setIsEditing(false); // Reset trạng thái edit khi mở dialog
        }
    }, [isOpen, loadChiTieu]);

    const handleChiTieuChange = (maNG, value) => {
        const newData = chiTieuData.map(item =>
            item.MaNG === maNG ? { ...item, Chitieu: value } : item
        );
        setChiTieuData(newData);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const dataToSave = {
            chiTieuData: chiTieuData,
            dotXT: dotXetTuyen.DotXT
        }
        try {
            const response = await saveChiTieu(dotXetTuyen.MaDXT, dataToSave);
            toast.success(response.message);
            setIsEditing(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lưu chỉ tiêu thất bại.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg bg-white dark:bg-gray-800 rounded-md shadow-lg p-6 max-h-[90vh] flex flex-col z-50">
                    <div className="flex items-center justify-between mb-2">
                        <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Chỉ tiêu tuyển sinh
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-gray-400 hover:text-gray-500"><X className="h-4 w-4" /></button>
                        </Dialog.Close>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Đợt xét tuyển: <span className="font-semibold">{dotXetTuyen?.DotXT}</span>
                    </p>

                    <div className="flex-grow overflow-y-auto border rounded-md">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                        ) : (
                            <table className="w-full">
                                <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="py-2 px-2 text-center w-16">STT</th>
                                        <th className="py-2 px-2 text-left">Ngành học</th>
                                        <th className="py-2 px-2 text-center w-28">Chỉ tiêu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chiTieuData.map((item, index) => (
                                        <tr key={item.MaNG} className="border-t dark:border-gray-700">
                                            <td className="py-1 px-2 text-center">{index + 1}</td>
                                            <td className="py-1 px-2">{item.Tennganh}</td>
                                            <td className="py-1 px-2">
                                                <input
                                                    type="number"
                                                    value={item.Chitieu}
                                                    onChange={(e) => handleChiTieuChange(item.MaNG, e.target.value)}
                                                    disabled={!isEditing}
                                                    className={inputStyles}
                                                    min="0"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                        {canEdit && !isEditing && (
                             <button onClick={() => setIsEditing(true)} className={`${baseButtonStyles} ${primaryButtonStyles}`}><Edit className="mr-2 h-4 w-4" />Chỉnh sửa</button>
                        )}
                        {canEdit && isEditing && (
                            <button onClick={handleSave} disabled={isSaving} className={`${baseButtonStyles} ${primaryButtonStyles}`}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Lưu
                            </button>
                        )}
                        <Dialog.Close asChild>
                           <button className={`${baseButtonStyles} ${outlineButtonStyles}`}>Đóng</button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default ChiTieuTuyenSinhDialog;
