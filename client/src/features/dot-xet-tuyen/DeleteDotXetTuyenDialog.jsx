/*
 * Đường dẫn file: D:\QLDT-app\client\src\features\dot-xet-tuyen\DeleteDotXetTuyenDialog.jsx
 * Phiên bản cập nhật: 06/10/2025
 * Tóm tắt những nội dung cập nhật:
 * - SỬA LỖI: Thêm class `z-50` vào Dialog.Overlay để khắc phục lỗi bị tiêu đề bảng che mất.
 */

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

const baseButtonStyles = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
const destructiveButtonStyles = "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500";
const outlineButtonStyles = "text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-indigo-500";


const DeleteDotXetTuyenDialog = ({ isOpen, onClose, onConfirm, dotXetTuyen }) => {
    if (!dotXetTuyen) return null;
    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                {/* SỬA LỖI: Thêm class `z-50` vào đây */}
                <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white dark:bg-gray-800 rounded-md shadow-lg p-6 z-50">
                     <div className="flex items-start justify-between">
                        <div>
                             <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                Xác nhận Xóa
                            </Dialog.Title>
                            <Dialog.Description className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Bạn có chắc chắn muốn xóa Đợt xét tuyển: <strong>{dotXetTuyen.DotXT}</strong> (ID: {dotXetTuyen.MaDXT})?
                                <br/>Hành động này không thể được hoàn tác.
                            </Dialog.Description>
                        </div>
                        <Dialog.Close asChild>
                             <button className="text-gray-400 hover:text-gray-500 ml-4">
                                <X className="h-4 w-4" />
                            </button>
                        </Dialog.Close>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                         <Dialog.Close asChild>
                            <button type="button" className={`${baseButtonStyles} ${outlineButtonStyles}`}>Hủy</button>
                         </Dialog.Close>
                        <button type="button" onClick={onConfirm} className={`${baseButtonStyles} ${destructiveButtonStyles}`}>Xóa</button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
export default DeleteDotXetTuyenDialog;