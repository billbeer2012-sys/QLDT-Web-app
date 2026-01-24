/*D:\QLDT-app\client\src\components\ui\ConfirmationModal.jsx
*/

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ open, onOpenChange, onConfirm, title, description }) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50 fixed inset-0 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 w-[90vw] max-w-md p-6">
          <div className="flex items-start space-x-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <div className="flex-1">
                <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                    {title}
                </Dialog.Title>
                <Dialog.Description className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                    {description}
                </Dialog.Description>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
             <Dialog.Close asChild>
                 <button 
                    type="button" 
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                 >
                    Hủy bỏ
                </button>
             </Dialog.Close>
             <button 
                type="button" 
                onClick={() => {
                    onConfirm();
                    onOpenChange(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
             >
                Xác nhận
             </button>
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

export default ConfirmationModal;
