/*
 * Đường dẫn file: D:\QLDT-app\client\src\features\dot-xet-tuyen\DotXetTuyenFormDialog.jsx
 * Phiên bản cập nhật: 07/10/2025
 * Tóm tắt những nội dung cập nhật:
 * - BỔ SUNG: Thêm trường nhập liệu cho "Địa điểm làm thủ tục" (`DiadiemThutuc`) vào form.
 * - ĐIỀU CHỈNH: Cập nhật logic validation và khởi tạo form để bao gồm trường mới.
 */

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import toast from 'react-hot-toast';
import moment from 'moment';
import { getNextDotXetTuyenId } from '../../api/dotxettuyen';
import { X } from 'lucide-react';

const baseButtonStyles = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
const primaryButtonStyles = "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
const outlineButtonStyles = "text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-indigo-500";
const inputStyles = "block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";


const DotXetTuyenFormDialog = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const isEditing = !!initialData;

    useEffect(() => {
        const initializeForm = async () => {
            if (isEditing) {
                setFormData({
                    ...initialData,
                    Ngayketthuc: moment(initialData.Ngayketthuc).format('YYYY-MM-DD'),
                    NgayXetTuyen: moment(initialData.NgayXetTuyen).format('YYYY-MM-DD'),
                    NgayBDthutuc: moment(initialData.NgayBDthutuc).format('YYYY-MM-DD'),
                    NgayKTthutuc: moment(initialData.NgayKTthutuc).format('YYYY-MM-DD'),
                    NgayNhapHoc: moment(initialData.NgayNhapHoc).format('YYYY-MM-DDTHH:mm'),
                });
            } else {
                try {
                    const { nextId } = await getNextDotXetTuyenId();
                    // BỔ SUNG: Thêm `DiadiemThutuc` vào state khởi tạo
                    setFormData({ MaDXT: nextId, DotXT: '', Ma_DXT: '', Ghichu: '', Ngayketthuc: '', NgayXetTuyen: '', NgayBDthutuc: '', NgayKTthutuc: '', DiadiemThutuc: '', NgayNhapHoc: '', DiadiemNhaphoc: '' });
                } catch (error) { toast.error('Không thể lấy mã Đợt XT tiếp theo.'); }
            }
        };
        if (isOpen) { initializeForm(); setErrors({}); }
    }, [isOpen, initialData, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        // ĐIỀU CHỈNH: Cập nhật validation
        if (!formData.DotXT) newErrors.DotXT = 'Bắt buộc.';
        if (!formData.Ma_DXT) newErrors.Ma_DXT = 'Bắt buộc.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) { toast.error('Vui lòng điền Tên đợt XT và Mã đợt.'); return; }
        const dataToSave = {
            ...formData,
            Ngayketthuc: formData.Ngayketthuc ? moment(formData.Ngayketthuc).format('DD/MM/YYYY') : null,
            NgayXetTuyen: formData.NgayXetTuyen ? moment(formData.NgayXetTuyen).format('DD/MM/YYYY') : null,
            NgayBDthutuc: formData.NgayBDthutuc ? moment(formData.NgayBDthutuc).format('DD/MM/YYYY') : null,
            NgayKTthutuc: formData.NgayKTthutuc ? moment(formData.NgayKTthutuc).format('DD/MM/YYYY') : null,
            NgayNhapHoc: formData.NgayNhapHoc ? moment(formData.NgayNhapHoc).format('DD/MM/YYYY HH:mm') : null,
        };
        await onSave(dataToSave);
    };

    // BỔ SUNG: Cấu trúc các trường của form
    const formFields = {
        "MaDXT": { label: "ID", disabled: true }, 
        "DotXT": { label: "Tên Đợt XT *" }, 
        "Ma_DXT": { label: "Mã đợt *" }, 
        "Ghichu": { label: "Ghi chú" },
        "Ngayketthuc": { label: "Hết hạn nộp HS", type: "date" }, 
        "NgayXetTuyen": { label: "Ngày xét tuyển", type: "date" },
        "NgayBDthutuc": { label: "Bắt đầu làm TT", type: "date" }, 
        "NgayKTthutuc": { label: "Kết thúc TT", type: "date" },
        "DiadiemThutuc": { label: "Địa điểm làm TT" },
        "NgayNhapHoc": { label: "Ngày nhập học", type: "datetime-local" }, 
        "DiadiemNhaphoc": { label: "Địa điểm nhập học" }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[600px] bg-white dark:bg-gray-800 rounded-md shadow-lg p-6 max-h-[90vh] flex flex-col z-50">
                    <div className="flex items-center justify-between mb-4">
                        <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {isEditing ? 'Chỉnh sửa' : 'Thêm mới'} Đợt xét tuyển
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-gray-400 hover:text-gray-500">
                                <X className="h-4 w-4" />
                            </button>
                        </Dialog.Close>
                    </div>
                    <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2">
                        <div className="grid gap-4 py-4">
                            {Object.entries(formFields).map(([key, { label, type = "text", disabled = false }]) => (
                                <div key={key} className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor={key} className="text-right text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                                    <input id={key} name={key} type={type} value={formData[key] || ''} onChange={handleChange} disabled={disabled} className={`${inputStyles} col-span-3 ${errors[key] ? 'border-red-500' : ''}`} />
                                </div>
                            ))}
                        </div>
                    </form>
                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Dialog.Close asChild>
                           <button type="button" className={`${baseButtonStyles} ${outlineButtonStyles}`}>Hủy</button>
                        </Dialog.Close>
                        <button type="button" onClick={handleSubmit} className={`${baseButtonStyles} ${primaryButtonStyles}`}>Lưu</button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
export default DotXetTuyenFormDialog;

