/*
* D:\QLDT-app\client\src\features\class-management\SignerSelectionModal.jsx
* File mới: 20/08/2025
* - Component Modal để người dùng chọn người ký cho "Giấy xác nhận sinh viên".
*/
import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Printer } from 'lucide-react';

const SignerSelectionModal = ({ isOpen, onClose, onConfirm }) => {
    const [signer, setSigner] = useState('truongphong'); // Mặc định là Trưởng phòng

    const handleConfirm = () => {
        onConfirm({ signer });
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-black/50 fixed inset-0 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 w-[90vw] max-w-xs p-6">
                    <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                        Người ký
                    </Dialog.Title>
                    
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center">
                            <input id="signer-ht" name="signer" type="radio" value="hieutruong" checked={signer === 'hieutruong'} onChange={(e) => setSigner(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                            <label htmlFor="signer-ht" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">Hiệu trưởng</label>
                        </div>
                        <div className="flex items-center">
                            <input id="signer-pht" name="signer" type="radio" value="phohieutruong" checked={signer === 'phohieutruong'} onChange={(e) => setSigner(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                            <label htmlFor="signer-pht" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">Phó Hiệu trưởng</label>
                        </div>
                        <div className="flex items-center">
                            <input id="signer-tp" name="signer" type="radio" value="truongphong" checked={signer === 'truongphong'} onChange={(e) => setSigner(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                            <label htmlFor="signer-tp" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">Trưởng phòng</label>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-8">
                        <button type="button" onClick={handleConfirm} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                            <Printer className="w-4 h-4 mr-2" />
                            In GXN
                        </button>
                        <Dialog.Close asChild>
                            <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200">
                                Đóng
                            </button>
                        </Dialog.Close>
                    </div>

                    <Dialog.Close asChild>
                        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="w-5 h-5" />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default SignerSelectionModal;
