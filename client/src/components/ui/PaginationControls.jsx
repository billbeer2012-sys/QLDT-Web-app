/*
* D:\QLDT-app\client\src\components\ui\PaginationControls.jsx
* Cập nhật: 29/07/2025
* Mô tả: Component UI mới cho việc điều khiển phân trang.
*/
import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

const PaginationButton = ({ children, onClick, disabled, isActive }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
            "mx-1 px-3 py-1 text-sm rounded-md transition-colors duration-150",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isActive 
                ? "bg-blue-600 text-white font-bold" 
                : "bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
        )}
    >
        {children}
    </button>
);

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) {
        return null;
    }

    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const halfPagesToShow = Math.floor(maxPagesToShow / 2);

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            let startPage, endPage;
            if (currentPage <= halfPagesToShow) {
                startPage = 1;
                endPage = maxPagesToShow;
            } else if (currentPage + halfPagesToShow >= totalPages) {
                startPage = totalPages - maxPagesToShow + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - halfPagesToShow;
                endPage = currentPage + halfPagesToShow;
            }
            
            if (startPage > 1) {
                pageNumbers.push(1);
                if (startPage > 2) {
                    pageNumbers.push('...');
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    pageNumbers.push('...');
                }
                pageNumbers.push(totalPages);
            }
        }
        return pageNumbers;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center justify-center py-4">
            <PaginationButton onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft className="w-4 h-4" />
            </PaginationButton>

            {pageNumbers.map((page, index) =>
                page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-1 text-sm flex items-center">
                        <MoreHorizontal className="w-4 h-4" />
                    </span>
                ) : (
                    <PaginationButton
                        key={page}
                        onClick={() => onPageChange(page)}
                        isActive={currentPage === page}
                    >
                        {page}
                    </PaginationButton>
                )
            )}

            <PaginationButton onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                <ChevronRight className="w-4 h-4" />
            </PaginationButton>
        </div>
    );
};

export default PaginationControls;