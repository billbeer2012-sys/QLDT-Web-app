/*
* D:\QLDT-app\client\src\features\class-management\LoanConfirmationOptionsModal.jsx
* File mới: 18/08/2025
* - Component Modal để người dùng chọn các tùy chọn cho "Giấy xác nhận vay vốn".
* - Sửa lỗi cú pháp import.
*/
import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Printer } from 'lucide-react';

const LoanConfirmationOptionsModal = ({ isOpen, onClose, onConfirm }) => {
    const [exemptionStatus, setExemptionStatus] = useState('khong');
    const [orphanStatus, setOrphanStatus] = useState('khong');
    const [signer, setSigner] = useState('truongphong');

    const handleConfirm = () => {
        onConfirm({
            exemptionStatus,
            orphanStatus,
            signer,
        });
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-black/50 fixed inset-0 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 w-[90vw] max-w-sm p-6">
                    <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                        Chọn nội dung
                    </Dialog.Title>
                    
                    <div className="mt-4 space-y-6">
                        {/* Phần 1: Thuộc diện */}
                        <div>
                            <label className="text-base font-semibold text-gray-700 dark:text-gray-300">Thuộc diện</label>
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center">
                                    <input id="exemption-khong" name="exemptionStatus" type="radio" value="khong" checked={exemptionStatus === 'khong'} onChange={(e) => setExemptionStatus(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                    <label htmlFor="exemption-khong" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">Không miễn giảm</label>
                                </div>
                                <div className="flex items-center">
                                    <input id="exemption-giam" name="exemptionStatus" type="radio" value="giam" checked={exemptionStatus === 'giam'} onChange={(e) => setExemptionStatus(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                    <label htmlFor="exemption-giam" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">Giảm học phí</label>
                                </div>
                                <div className="flex items-center">
                                    <input id="exemption-mien" name="exemptionStatus" type="radio" value="mien" checked={exemptionStatus === 'mien'} onChange={(e) => setExemptionStatus(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                    <label htmlFor="exemption-mien" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">Miễn học phí</label>
                                </div>
                            </div>
                        </div>

                        {/* Phần 2: Thuộc đối tượng */}
                        <div>
                            <label className="text-base font-semibold text-gray-700 dark:text-gray-300">Thuộc đối tượng</label>
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center">
                                    <input id="orphan-co" name="orphanStatus" type="radio" value="co" checked={orphanStatus === 'co'} onChange={(e) => setOrphanStatus(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                    <label htmlFor="orphan-co" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">Mồ côi</label>
                                </div>
                                <div className="flex items-center">
                                    <input id="orphan-khong" name="orphanStatus" type="radio" value="khong" checked={orphanStatus === 'khong'} onChange={(e) => setOrphanStatus(e.target.value)} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                    <label htmlFor="orphan-khong" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">Không mồ côi</label>
                                </div>
                            </div>
                        </div>

                        {/* Phần 3: Người ký */}
                        <div>
                            <label className="text-base font-semibold text-gray-700 dark:text-gray-300">Người ký</label>
                            <div className="mt-2 space-y-2">
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

export default LoanConfirmationOptionsModal;
