/*
 * Đường dẫn file: D:\QLDT-app\client\src\features\dot-xet-tuyen\ToHopXetTuyenDialog.jsx
 * Ngày tạo: 08/10/2025
 * Tóm tắt:
 * - Component Dialog mới để quản lý Tổ hợp xét tuyển cho từng ngành trong một đợt XT.
 * - Cho phép chọn ngành, sau đó hiển thị, thêm, sửa, xóa và lưu danh sách tổ hợp.
 * - Phân quyền các chức năng Thêm/Sửa/Lưu.
 */
import React, { useState, useEffect, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Edit, Save, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchNganhHocCoChiTieu, fetchAllToHopMon, fetchToHopDaGan, saveToHop } from '../../api/dotxettuyen';
import useAuthStore from '../../store/authStore';

const baseButtonStyles = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
const primaryButtonStyles = "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
const destructiveButtonStyles = "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500";
const outlineButtonStyles = "text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-indigo-500";
const inputStyles = "w-full text-center px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600";
const selectStyles = "w-full px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600";

const ToHopXetTuyenDialog = ({ isOpen, onClose, dotXetTuyen }) => {
    const [nganhHocList, setNganhHocList] = useState([]);
    const [allToHopList, setAllToHopList] = useState([]);
    const [selectedNganh, setSelectedNganh] = useState('');
    const [toHopData, setToHopData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const user = useAuthStore((state) => state.user);
    const canEdit = user?.isAdmin || (user?.isXepTKB && user?.isTuyensinh);

    const loadInitialData = useCallback(async () => {
        if (!dotXetTuyen?.MaDXT) return;
        setIsLoading(true);
        try {
            const [nganhHocRes, allToHopRes] = await Promise.all([
                fetchNganhHocCoChiTieu(dotXetTuyen.MaDXT),
                fetchAllToHopMon()
            ]);
            setNganhHocList(nganhHocRes);
            setAllToHopList(allToHopRes);
            if (nganhHocRes.length > 0) {
                setSelectedNganh(nganhHocRes[0].MaNG);
            } else {
                setToHopData([]);
            }
        } catch (error) {
            toast.error("Lỗi khi tải dữ liệu khởi tạo.");
        } finally {
            setIsLoading(false);
        }
    }, [dotXetTuyen]);

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
            setIsEditing(false);
        }
    }, [isOpen, loadInitialData]);

    useEffect(() => {
        const loadToHopDaGan = async () => {
            if (selectedNganh && dotXetTuyen?.MaDXT) {
                setIsLoading(true);
                try {
                    const data = await fetchToHopDaGan(dotXetTuyen.MaDXT, selectedNganh);
                    setToHopData(data);
                } catch (error) {
                    toast.error("Lỗi khi tải tổ hợp của ngành.");
                    setToHopData([]);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadToHopDaGan();
        setIsEditing(false);
    }, [selectedNganh, dotXetTuyen]);

    const handleDataChange = (index, field, value) => {
        const newData = [...toHopData];
        newData[index] = { ...newData[index], [field]: value };

        if (field === 'MaTHXT') {
             const selectedToHop = allToHopList.find(th => th.MaTHXT === value);
             newData[index].TohopXT = selectedToHop ? selectedToHop.TohopXT : '';
        }

        setToHopData(newData);
    };

    const handleAddNewRow = () => {
        setToHopData([...toHopData, { MaTHXT: '', TT: '', isNew: true }]);
    };
    
    const handleRemoveRow = (index) => {
        const newData = toHopData.filter((_, i) => i !== index);
        setToHopData(newData);
    };

    const handleSave = async () => {
        // Validate
        for (const item of toHopData) {
            if (item.MaTHXT && !item.TT) {
                toast.error(`Vui lòng nhập Thứ tự cho tổ hợp "${item.TohopXT}".`);
                return;
            }
             if (!item.MaTHXT && item.TT) {
                toast.error(`Vui lòng chọn Tổ hợp XT cho dòng có thứ tự "${item.TT}".`);
                return;
            }
        }
        
        setIsSaving(true);
        try {
            const tenNganh = nganhHocList.find(n => n.MaNG === selectedNganh)?.Tennganh || '';
            const payload = {
                maDxt: dotXetTuyen.MaDXT,
                maNganh: selectedNganh,
                toHopData: toHopData,
                dotXT: dotXetTuyen.DotXT,
                tenNganh: tenNganh,
            };
            const response = await saveToHop(payload);
            toast.success(response.message);
            setIsEditing(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lưu thất bại.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl bg-white dark:bg-gray-800 rounded-md shadow-lg p-6 max-h-[90vh] flex flex-col z-50">
                    <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-gray-100">Tổ hợp xét tuyển theo Ngành học</Dialog.Title>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Đợt xét tuyển: <span className="font-semibold">{dotXetTuyen?.DotXT}</span></p>

                    <div className="grid grid-cols-3 gap-4 mb-4 items-center">
                        <label htmlFor="nganh-hoc-select" className="text-sm font-medium col-span-1">Ngành học</label>
                        <select
                            id="nganh-hoc-select"
                            value={selectedNganh}
                            onChange={(e) => setSelectedNganh(e.target.value)}
                            className={`${selectStyles} col-span-2`}
                        >
                            {nganhHocList.map(nganh => (
                                <option key={nganh.MaNG} value={nganh.MaNG}>{nganh.Tennganh}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-grow overflow-y-auto border rounded-md">
                        {isLoading ? <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> : (
                            <table className="w-full">
                                <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="py-2 px-2 text-center w-16">STT</th>
                                        <th className="py-2 px-2 text-left">Tổ hợp xét tuyển</th>
                                        <th className="py-2 px-2 text-center w-24">TT</th>
                                        {isEditing && <th className="py-2 px-2 text-center w-16">Xóa</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {toHopData.map((item, index) => (
                                        <tr key={index} className="border-t dark:border-gray-700">
                                            <td className="py-1 px-2 text-center">{index + 1}</td>
                                            <td className="py-1 px-2">
                                                <select
                                                    value={item.MaTHXT}
                                                    onChange={(e) => handleDataChange(index, 'MaTHXT', e.target.value)}
                                                    disabled={!isEditing}
                                                    className={selectStyles}
                                                >
                                                    <option value="">-- Chọn tổ hợp --</option>
                                                    {allToHopList.map(th => (
                                                        <option key={th.MaTHXT} value={th.MaTHXT}>{th.TohopXT}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-1 px-2">
                                                <input
                                                    type="number"
                                                    value={item.TT}
                                                    onChange={(e) => handleDataChange(index, 'TT', e.target.value)}
                                                    disabled={!isEditing}
                                                    className={inputStyles}
                                                    min="1"
                                                />
                                            </td>
                                            {isEditing && (
                                                <td className="py-1 px-2 text-center">
                                                    <button onClick={() => handleRemoveRow(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    
                    {canEdit && isEditing && (
                        <div className="mt-2">
                             <button onClick={handleAddNewRow} className="text-sm text-blue-600 hover:text-blue-800 flex items-center"><Plus className="w-4 h-4 mr-1" /> Thêm dòng</button>
                        </div>
                    )}

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

export default ToHopXetTuyenDialog;
