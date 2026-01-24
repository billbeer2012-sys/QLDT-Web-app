/*
 * Đường dẫn file: D:/QLDT-app/client/src/pages/CreditClassManagementPage.jsx
 * Cập nhật: 07/11/2025
 * Tóm tắt:
 * - Bổ sung log khi mở trang (giữ nguyên).
 * - BỔ SUNG: Chức năng inline-editing cho cột "Chức vụ SV" trong danh sách sinh viên.
 * - Tải danh sách chức vụ SV từ API mới.
 * - Thêm state `studentPendingChanges` để theo dõi các thay đổi.
 * - Thêm thanh "Lưu/Hủy" cho danh sách SV khi có thay đổi.
 * - Thêm hàm `handleSaveStudentChanges` để gọi API cập nhật.
 * - Cập nhật `EditableCell` để hiển thị combobox Chức vụ SV.
 * - CẬP NHẬT: Tinh chỉnh hiển thị tiêu đề (màu sắc, in hoa) cho các cấp độ.
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import { Resizable } from 're-resizable';
import { 
    Search, ChevronDown, ChevronRight, Folder, Calendar, Users, BookOpen, Library, 
    Loader, Settings2, ChevronsDown, ChevronsUp, PanelLeftClose, PanelLeftOpen, ArrowUpDown, ArrowUp, ArrowDown,
    FileCheck2, Download, Trash2, XCircle, ListChecks, SortAsc, Save, Ban, Edit, View
} from 'lucide-react';
import { useDebounce } from 'use-debounce';
import PaginationControls from '../components/ui/PaginationControls';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FileCheck } from 'lucide-react';
import moment from 'moment';
import { cn } from '../lib/utils';
import { exportToExcel, exportToCSV } from '../lib/excelExporter';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import useAuthStore from '../store/authStore';
//Bước 1: Bổ sung Import hook
import { usePageLogger } from '../hooks/usePageLogger';

// --- CONFIGURATION & HELPERS ---
const CheckmarkCell = ({ value }) => (value ? '✓' : '');
const DateCell = ({ value, format = "DD/MM/YYYY" }) => (value ? moment(value).format(format) : '');
const NumberCell = ({ value, fixed = 1 }) => (typeof value === 'number' ? value.toFixed(fixed) : '');

// --- COLUMN DEFINITIONS ---
const classColumnsConfig = [
    { accessor: 'stt', header: 'Stt', defaultVisible: true, isLocked: true, cell: ({ rowIndex, currentPage, itemsPerPage }) => (currentPage - 1) * itemsPerPage + rowIndex + 1, className: 'text-center' },
    { accessor: 'DonviQuanLy', header: 'Đơn vị quản lý', defaultVisible: false, sortable: true },
    { accessor: 'MaLHP', header: 'Mã LHP', defaultVisible: false },
    { accessor: 'Tenlop', header: 'Tên lớp', defaultVisible: true, isLocked: true, cell: ({ value }) => <span className="font-bold">{value}</span>, sortable: true },
    { accessor: 'TenHocPhan', header: 'Tên học phần', defaultVisible: false, sortable: true },
	{ accessor: 'ViettatHP', header: 'Tên HP (viết tắt)', defaultVisible: true, isLocked: false, sortable: true },
    { accessor: 'Giangvien', header: 'Giảng viên', defaultVisible: true, isLocked: false, sortable: true },
    { accessor: 'Soluong', header: 'SLg tối đa', defaultVisible: false, className: 'text-center' },
    { accessor: 'SLgDanhSach', header: 'SLg danh sách', defaultVisible: true, isLocked: false, className: 'text-center' },
    { accessor: 'LockDK', header: 'Khoá đăng ký', defaultVisible: false, cell: CheckmarkCell, sortable: true, className: 'text-center', editable: 'checkbox' },
    { accessor: 'SoTC', header: 'Tín chỉ', defaultVisible: true, isLocked: false, className: 'text-center' },
    { accessor: 'Tongsotiet', header: 'Số giờ', defaultVisible: true, isLocked: false, className: 'text-center' },
    { accessor: 'GioTKB', header: 'Giờ TKB', defaultVisible: true, isLocked: false, className: 'text-center' },
    { accessor: 'NgayBatDau', header: 'Ngày bắt đầu', defaultVisible: true, isLocked: false, cell: DateCell, className: 'text-center' },
    { 
        accessor: 'NgayKetThuc', 
        header: 'Ngày kết thúc', 
        defaultVisible: true, 
        isLocked: false,
        className: 'text-center',
        cell: ({ value }) => {
            const date = moment(value);
            if (!date.isValid()) return '';
            const isPastOrToday = date.isSameOrBefore(moment(), 'day');
            const dateString = date.format("DD/MM/YYYY");
            if (isPastOrToday) { return <span className="bg-yellow-100 text-red-600 font-semibold px-2 py-0.5 rounded-md">{dateString}</span>; }
            return dateString;
        } 
    },
    { accessor: 'Tuanhoc', header: 'Tuần học', defaultVisible: false },
	{ accessor: 'TKB', header: 'Thời khóa biểu', defaultVisible: false },
    // Bổ sung: Cột Ngày thi L1
    { 
        accessor: 'NgayThiL1', 
        header: 'Ngày thi L1', 
        defaultVisible: true, 
        isLocked: false,
        className: 'text-center',
        cell: ({ value }) => {
            const date = moment(value);
            if (!date.isValid()) return '';
            const isPastOrToday = date.isSameOrBefore(moment(), 'day');
            const dateString = date.format("DD/MM/YYYY");
            if (isPastOrToday) { return <span className="bg-blue-200 text-red-600 font-semibold px-2 py-0.5 rounded-md">{dateString}</span>; }
            return dateString;
        } 
    },
    { accessor: 'NhapdiemKiemtraL1', header: 'Cho nhập KT L1', defaultVisible: false, cell: CheckmarkCell, className: 'text-center', editable: 'checkbox' },
    { accessor: 'NhapdiemKiemtraL2', header: 'Cho nhập KT L2', defaultVisible: false, cell: CheckmarkCell, className: 'text-center', editable: 'checkbox' },
    { accessor: 'NhapdiemThiL1', header: 'Cho nhập THI L1', defaultVisible: false, cell: CheckmarkCell, className: 'text-center', editable: 'checkbox' },
    { accessor: 'NhapdiemThiL2', header: 'Cho nhập THI L2', defaultVisible: false, cell: CheckmarkCell, className: 'text-center', editable: 'checkbox' },
    { accessor: 'LockDiemdanh', header: 'Khoá điểm danh', defaultVisible: false, cell: CheckmarkCell, sortable: true, className: 'text-center', editable: 'checkbox' },
    { accessor: 'LockXetthi', header: 'Khoá xét thi', defaultVisible: false, cell: CheckmarkCell, sortable: true, className: 'text-center', editable: 'checkbox' },
    //Tạm bỏ cột này: Vì chưa xác định được tác dụng
	//{ accessor: 'NhapdiemKiemtra', header: 'Đã nhập điểm', defaultVisible: true, isLocked: false, cell: ({ value }) => (value === true || value === -1 ? '✓' : ''), sortable: true, className: 'text-center' },
    { accessor: 'LockND', header: 'Khóa nhập điểm', defaultVisible: false, cell: CheckmarkCell, sortable: true, className: 'text-center', editable: 'checkbox' },
    { accessor: 'Daxacnhan', header: 'Đã xác nhận', defaultVisible: false, cell: CheckmarkCell, sortable: true, className: 'text-center', editable: 'checkbox' },
	
	// Sửa: "Đã công bố" hiển thị theo '✓' - Không cho sửa
    // { accessor: 'Dacongbo', header: 'Đã công bố', defaultVisible: false, cell: CheckmarkCell, sortable: true, className: 'text-center', editable: 'checkbox' },
	{ accessor: 'Dacongbo', header: 'Đã công bố', defaultVisible: false, isLocked: false, cell: ({ value }) => (value === 1 ? '✓' : ''), sortable: true, className: 'text-center' },
	
    { accessor: 'DaxacnhanL2', header: 'Đã XN L2', defaultVisible: false, cell: CheckmarkCell, sortable: true, className: 'text-center', editable: 'checkbox' },
    
	// Sửa: "Đã công bố L2" hiển thị theo '✓' - Không cho sửa
	//{ accessor: 'DacongboL2', header: 'Đã CB lần 2', defaultVisible: false, cell: CheckmarkCell, sortable: true, className: 'text-center', editable: 'checkbox' },
    { accessor: 'DacongboL2', header: 'Đã CB L2', defaultVisible: false, isLocked: false, cell: ({ value }) => (value === 1 ? '✓' : ''), sortable: true, className: 'text-center' },
	
    { accessor: 'Kieunhapdiem', header: 'Kiểu nhập điểm', defaultVisible: false },
    { accessor: 'CotNhapDiem', header: 'Cột nhập điểm', defaultVisible: false },
    { accessor: 'PhieuDanhgia', header: 'Đánh giá HP', defaultVisible: false, sortable: true, editable: 'combobox' },
    { accessor: 'DanhgiatungayCK', header: 'ĐG từ ngày', defaultVisible: false, cell: DateCell, className: 'text-center', editable: 'date' },
    { accessor: 'DanhgiadenngayCK', header: 'ĐG đến ngày', defaultVisible: false, cell: DateCell, className: 'text-center', editable: 'date' },
    // Bổ sung: Cột SLg ĐGHP
    { accessor: 'SLgDGHP', header: 'SLg ĐGHP', defaultVisible: false, className: 'text-center' },
    { accessor: 'LockDGCK', header: 'ĐG khóa', defaultVisible: false, cell: CheckmarkCell, className: 'text-center', editable: 'checkbox' },
    { accessor: 'GhichuDGCK', header: 'ĐG Ghi chú', defaultVisible: false, editable: 'text' },
];

const studentColumnsConfig = [
    { accessor: 'stt', header: 'Stt', defaultVisible: true, isLocked: true, cell: ({ rowIndex, currentPage, itemsPerPage }) => (currentPage - 1) * itemsPerPage + rowIndex + 1, className: 'text-center' },
    { accessor: 'Tinhtrang', header: 'Tình trạng', defaultVisible: true, className: 'text-center',
        cell: ({ value }) => {
            switch (value) {
                case 0: return '✓';
                case 1: return <span className="text-green-600 font-semibold">BLưu</span>;
                case 2: return <span className="text-red-600 font-semibold">Nghỉ</span>;
                case 3: return <span className="text-blue-600 font-semibold">TN</span>;
                default: return '';
            }
        }
    },
    { accessor: 'Maso', header: 'Mã số SV', defaultVisible: true, isLocked: true },
    { accessor: 'Holot', header: 'Họ lót', defaultVisible: true, isLocked: true },
    { accessor: 'Ten', header: 'Tên', defaultVisible: true, isLocked: true },
    { accessor: 'Gioitinh', header: 'Nữ', defaultVisible: true, cell: ({ value }) => (value ? '✓' : ''), className: 'text-center' },
    { accessor: 'Ngaysinh', header: 'Ngày sinh', defaultVisible: true, cell: DateCell, className: 'text-center' },
    { accessor: 'Noisinh', header: 'Nơi sinh', defaultVisible: true },
    { accessor: 'Dantoc', header: 'Dân tộc', defaultVisible: false },
    { accessor: 'Diachi', header: 'Địa chỉ', defaultVisible: false },
    { accessor: 'Dienthoai', header: 'Điện thoại', defaultVisible: true },
    { accessor: 'SoCMND', header: 'Số CCCD', defaultVisible: false },
    { accessor: 'TrinhdoVH', header: 'Trình độ VH', defaultVisible: false },
    { accessor: 'DTCS', header: 'Đối tượng', defaultVisible: false },
    { accessor: 'Miengiam', header: 'Giảm HP', defaultVisible: false },
    { accessor: 'LopSH', header: 'Lớp SH', defaultVisible: true },
    // BỔ SUNG: Thêm editable: 'combobox'
    { accessor: 'ChucvuSV', header: 'Chức vụ SV', defaultVisible: true, editable: 'combobox' },
    { accessor: 'SoGioNghi', header: 'Số giờ nghỉ', defaultVisible: false, className: 'text-center' },
    { accessor: 'TyLeNghi', header: 'Tỷ lệ nghỉ (%)', defaultVisible: false, className: 'text-center text-gray-500',
        cell: ({ value }) => {
            const percentage = typeof value === 'number' ? value.toFixed(1) : '';
            if (value > 20) { return <span className="text-yellow-800 font-semibold px-2 py-0.5 rounded-md">{percentage}</span>; }
            return percentage;
        }
    },
    { accessor: 'TBHS', header: 'ĐTB KT', defaultVisible: false, className: 'text-center font-semibold text-yellow-800',
        cell: ({ value }) => {
            const score = typeof value === 'number' ? value.toFixed(1) : '';
            if (value < 5) { return <span className="text-yellow-800 font-semibold px-2 py-0.5 rounded-md">{score}</span>; }
            return score;
        } 
    },
    { accessor: 'ThiL1', header: 'Thi L1', defaultVisible: false, cell: CheckmarkCell, className: 'text-center bg-red-50' },
    { 
        accessor: 'CT1', header: 'Điểm L1', defaultVisible: false, className: 'text-center bg-red-50',
        cell: ({ value }) => {
            const score = typeof value === 'number' ? value.toFixed(1) : '';
            if (value < 5) { return <span className="text-yellow-800 font-semibold px-2 py-0.5 rounded-md">{score}</span>; }
            return score;
        } 
    },
    { accessor: 'DHP1', header: 'ĐHP L1', defaultVisible: false, className: 'text-center bg-red-50',
        cell: ({ value }) => {
            const score = typeof value === 'number' ? value.toFixed(1) : '';
            if (value < 4) { return <span className="text-yellow-800 font-semibold px-2 py-0.5 rounded-md">{score}</span>; }
            return score;
        } 
    },
    { accessor: 'ThiL2', header: 'Thi L2', defaultVisible: false, cell: CheckmarkCell, className: 'text-center bg-green-100' },
    { 
        accessor: 'CT2', header: 'Điểm L2', defaultVisible: false, className: 'text-center bg-green-100',
        cell: ({ value }) => {
            const score = typeof value === 'number' ? value.toFixed(1) : '';
            if (value < 5) { return <span className="text-yellow-800 font-semibold px-2 py-0.5 rounded-md">{score}</span>; }
            return score;
        }
    },
    { 
        accessor: 'DHP2', header: 'ĐHP L2', defaultVisible: false, className: 'text-center bg-green-100',
        cell: ({ value }) => {
            const score = typeof value === 'number' ? value.toFixed(1) : '';
            if (value < 4) { return <span className="text-yellow-800 font-semibold px-2 py-0.5 rounded-md">{score}</span>; }
            return score;
        }
    },
    { 
        accessor: 'DHP', header: 'Đ10 TK', defaultVisible: false, className: 'text-center font-semibold bg-yellow-100',
        cell: ({ value }) => {
            const score = typeof value === 'number' ? value.toFixed(1) : '';
            if (value < 4) { return <span className="bg-red-100 text-yellow-800 font-semibold px-2 py-0.5 rounded-md">{score}</span>; }
            return score;
        }
    },
    { 
        accessor: 'DHPBon', header: 'Đ4 TK', defaultVisible: false, className: 'text-center font-semibold bg-yellow-100',
        cell: ({ value }) => {
            const score = typeof value === 'number' ? value.toFixed(0) : '';
            if (value === 0) { return <span className="bg-red-100 text-yellow-800 font-semibold px-2 py-0.5 rounded-md">{score}</span>; }
            return score;
        }
    },
    { 
        accessor: 'DHPChu', header: 'Điểm chữ', defaultVisible: false, className: 'text-center font-semibold bg-yellow-100',
        cell: ({ value }) => {
            if (value === 'F') { return <span className="bg-red-100 text-yellow-800 font-semibold px-2 py-0.5 rounded-md">{value}</span>; }
            return value;
        }
    },
    { accessor: 'GhichuXetThi', header: 'Ghi chú xét thi', defaultVisible: false },
];

// Cập nhật: Các presets hiển thị cột ('NhapdiemKiemtra', : trong exam)
const classColumnPresets = {
    default: ['stt', 'Tenlop', 'ViettatHP', 'Giangvien', 'SLgDanhSach', 'SoTC', 'Tongsotiet', 'GioTKB', 'NgayBatDau', 'NgayKetThuc', 'NgayThiL1', 'Daxacnhan', 'Dacongbo'],
    exam: ['stt', 'Tenlop', 'ViettatHP', 'Giangvien', 'NhapdiemKiemtraL1', 'NhapdiemKiemtraL2', 'NhapdiemThiL1', 'NhapdiemThiL2', 'Daxacnhan', 'Dacongbo', 'DaxacnhanL2', 'DacongboL2'],
    lock: ['stt', 'Tenlop', 'ViettatHP', 'Giangvien', 'Daxacnhan', 'Dacongbo', 'LockDK', 'LockDiemdanh', 'LockXetthi', 'LockND'],
    evaluation: ['stt', 'Tenlop', 'ViettatHP', 'Giangvien', 'Dacongbo', 'PhieuDanhgia', 'DanhgiatungayCK', 'DanhgiadenngayCK', 'SLgDGHP', 'LockDGCK', 'GhichuDGCK'],
};

// --- HELPER COMPONENTS ---
// BỔ SUNG: `EditableCell` được cập nhật để xử lý `studentPositions`
const EditableCell = ({ value, row, column, onUpdate, evaluationForms, studentPositions, pendingChanges }) => {
    const [currentValue, setCurrentValue] = useState(value);
    useEffect(() => { setCurrentValue(value); }, [value]);

    const handleBlur = () => {
        if (column.editable !== 'combobox' && currentValue !== value) {
            // Xác định rowId dựa trên loại dữ liệu
            const rowId = row.MaLHP ? row.MaLHP : row.MaSV;
            onUpdate(rowId, column.accessor, currentValue);
        }
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        setCurrentValue(newValue);
        if (column.editable === 'combobox') {
            // Cập nhật ngay lập tức cho combobox
            if (column.accessor === 'PhieuDanhgia') {
                onUpdate(row.MaLHP, 'MaPDGCK', newValue);
            } else if (column.accessor === 'ChucvuSV') {
                onUpdate(row.MaSV, 'ChucvuSV', newValue); // Gửi MaCVSV mới
            }
        }
    };
    
    const handleKeyDown = (e) => { if (e.key === 'Enter') e.target.blur(); };
    
    if (column.editable === 'combobox') {
        if (column.accessor === 'PhieuDanhgia') {
            const allowedFormIds = ['001', '002', '003', '004'];
            const filteredForms = evaluationForms.filter(form => allowedFormIds.includes(form.MaPDG));
            // Xác định giá trị đang chọn (từ pending changes hoặc từ data)
            const selectedMaPDG = pendingChanges[row.MaLHP]?.MaPDGCK !== undefined ? pendingChanges[row.MaLHP].MaPDGCK : row.MaPDGCK;
            
            return (
                <select
                    value={selectedMaPDG || ''}
                    onChange={handleChange}
                    onBlur={() => onUpdate(null, null, null)} // Reset editing state
                    autoFocus
                    className="w-full bg-transparent border-b-2 border-blue-500 outline-none p-1"
                >
                    <option value="">-- Chọn --</option>
                    {filteredForms.map(form => (
                        <option key={form.MaPDG} value={form.MaPDG}>{form.PhieuDanhgia}</option>
                    ))}
                </select>
            );
        } else if (column.accessor === 'ChucvuSV') {
            // BỔ SUNG: Logic cho Chức vụ SV
            // row.MaCVSV phải được thêm vào query API /students/:classId
            const selectedMaCVSV = pendingChanges[row.MaSV]?.[column.accessor] !== undefined 
                ? pendingChanges[row.MaSV][column.accessor] 
                : row.MaCVSV; // Dùng MaCVSV từ data

            return (
                <select
                    value={selectedMaCVSV || ''}
                    onChange={handleChange} // `handleChange` đã xử lý onUpdate
                    onBlur={() => onUpdate(null, null, null)} // Reset editing state
                    autoFocus
                    className="w-full bg-transparent border-b-2 border-blue-500 outline-none p-1"
                >
                    <option value="">-- Bỏ chọn --</option>
                    {(studentPositions || []).map(pos => (
                        <option key={pos.MaCVSV} value={pos.MaCVSV}>{pos.ChucvuSV}</option>
                    ))}
                </select>
            );
        }
    }

    if (column.editable === 'date') {
        return <input type="date" value={currentValue ? moment(currentValue).format('YYYY-MM-DD') : ''} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} className="w-full bg-transparent border-b-2 border-blue-500 outline-none p-1"/>;
    }
    return <input type="text" value={currentValue === null || currentValue === undefined ? '' : currentValue} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown} className="w-full bg-transparent border-b-2 border-blue-500 outline-none p-1"/>;
};


const LevelIcon = ({ level, isCollapsed }) => {
    const commonClass = `w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-2'} text-gray-500 dark:text-gray-400 flex-shrink-0`;
    const icons = { 1: Folder, 2: Calendar, 3: Users, 4: BookOpen, 5: Library };
    const Icon = icons[level] || Folder;
    return <Icon className={commonClass} />;
};

const TreeView = ({ nodes, onNodeSelect, searchTerm, highlightedNodeIds, expandedNodes, toggleNode, isCollapsed, selectedNode }) => {
    const nodeRef = useRef(null);
    useEffect(() => { if (selectedNode && nodeRef.current) { nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, [selectedNode]);
    const filterNodes = (nodesToFilter) => {
        if (!searchTerm) return nodesToFilter;
        return nodesToFilter.reduce((acc, node) => {
            const children = node.children ? filterNodes(node.children) : [];
            if (node.name.toLowerCase().includes(searchTerm.toLowerCase()) || children.length > 0) { acc.push({ ...node, children }); }
            return acc;
        }, []);
    };
    const filteredNodes = filterNodes(nodes);
    const renderNode = (node) => {
        const isExpanded = expandedNodes[node.id];
        const isHighlighted = highlightedNodeIds.has(node.id);
        const isSelected = selectedNode?.id === node.id;
        const hasChildren = node.children && node.children.length > 0;
        return (
            <div key={node.id} ref={isSelected ? nodeRef : null}>
                <div onClick={() => onNodeSelect(node)} className={cn("flex items-center p-2 rounded-md cursor-pointer transition-colors duration-150", isHighlighted ? "bg-blue-100 dark:bg-blue-900/40" : "hover:bg-gray-100 dark:hover:bg-gray-700", isSelected && "font-bold text-blue-600 dark:text-blue-400")}>
                    {hasChildren ? (<button onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }} className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><ChevronDown className={cn("w-4 h-4 transition-transform", !isExpanded && "-rotate-90")} /></button>) : <div className="w-5"></div>}
                    <LevelIcon level={node.level} isCollapsed={isCollapsed} />
                    {!isCollapsed && <span className="truncate" title={node.name}>{node.name}</span>}
                    {!isCollapsed && typeof node.count !== 'undefined' && <span className="ml-auto text-xs text-gray-400">({node.count})</span>}
                </div>
                {isExpanded && hasChildren && (<div className={cn(!isCollapsed && "pl-4")}>{node.children.map(renderNode)}</div>)}
            </div>
        );
    };
    return <div className="p-2 space-y-1">{filteredNodes.map(renderNode)}</div>;
};

// BỔ SUNG: `DataTable` nhận thêm `studentPositions`
const DataTable = ({ columns, data, title, uniqueKeyField, sortConfig, onSort, contentType, onStudentsDelete, onStudentsSort, onRowDoubleClick, pendingChanges, setPendingChanges, visibleColumns, onVisibleColumnsChange, evaluationForms, studentPositions, activePreset, onPresetChange }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
    const [selectedRowIds, setSelectedRowIds] = useState({});
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [editingCell, setEditingCell] = useState(null);
    const [isDetailedGradesMode, setIsDetailedGradesMode] = useState(false);
    
    const userVisibleColumnsRef = useRef(null);
    
    const { isAdmin, isXepTKB, nhapDiem, isKhaothi } = useAuthStore();
    const canPerformActions = isAdmin || isXepTKB || nhapDiem;
    const canUpdateClasses = isAdmin || isKhaothi;
    // BỔ SUNG: Quyền cập nhật sinh viên (giống canPerformActions)
    const canUpdateStudents = isAdmin || isXepTKB || nhapDiem;

    useEffect(() => {
        setIsSelectionMode(false);
        setSelectedRowIds({});
        setEditingCell(null); 
        setCurrentPage(1);
    }, [data]);
    
    useEffect(() => {
        if (contentType === 'students') {
            if (isDetailedGradesMode) {
                userVisibleColumnsRef.current = visibleColumns;
                const columnsToHide = new Set(['Gioitinh', 'Ngaysinh', 'Noisinh', 'Dantoc', 'Diachi', 'Dienthoai', 'SoCMND', 'TrinhdoVH', 'DTCS', 'Miengiam', 'LopSH', 'ChucvuSV']);
                const examColumns = columns.map(c => c.accessor).filter(accessor => !columnsToHide.has(accessor));
                onVisibleColumnsChange(examColumns, true);
            } else {
                if (userVisibleColumnsRef.current) {
                    onVisibleColumnsChange(userVisibleColumnsRef.current, true);
                } else {
                    const defaultVisible = columns.filter(c => c.defaultVisible).map(c => c.accessor);
                    onVisibleColumnsChange(defaultVisible, true);
                }
            }
        }
    }, [isDetailedGradesMode, contentType]);
    
    const filteredData = useMemo(() => {
        if (!debouncedSearchTerm) return data;
        return data.filter(row => columns.filter(c => visibleColumns.includes(c.accessor)).some(col => String(row[col.accessor]).toLowerCase().includes(debouncedSearchTerm.toLowerCase())));
    }, [data, debouncedSearchTerm, visibleColumns, columns]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    
    const selectedStudents = useMemo(() => {
        const selectedIds = Object.keys(selectedRowIds).filter(id => selectedRowIds[id]);
        return data.filter(student => selectedIds.includes(student[uniqueKeyField]));
    }, [selectedRowIds, data, uniqueKeyField]);

    const canDeleteSelected = useMemo(() => {
        if (selectedStudents.length === 0) return false;
        return selectedStudents.every(s => 
            (s.Tinhtrang === 1 || s.Tinhtrang === 2) && 
            s.Daxacnhan !== 1 && 
            (s.CT1 === null || s.CT1 === undefined)
        );
    }, [selectedStudents]);

    const handleToggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedRowIds({});
    };
    
    const handleRowSelect = (rowId) => {
        setSelectedRowIds(prev => ({...prev, [rowId]: !prev[rowId]}));
    };

    const handleSelectAllOnPage = () => {
        const pageIds = paginatedData.map(row => row[uniqueKeyField]);
        const allOnPageSelected = pageIds.length > 0 && pageIds.every(id => selectedRowIds[id]);
        const newSelected = {...selectedRowIds};
        if (allOnPageSelected) {
            pageIds.forEach(id => delete newSelected[id]);
        } else {
            pageIds.forEach(id => newSelected[id] = true);
        }
        setSelectedRowIds(newSelected);
    };

    const handleDelete = () => {
        if (canDeleteSelected) setIsConfirmModalOpen(true);
    };
    
    const confirmDelete = async () => {
        await onStudentsDelete(selectedStudents);
        setSelectedRowIds({});
        setIsSelectionMode(false);
    };
    
    const handleSortPersistence = () => {
        const studentOrder = filteredData.map((student, index) => ({
            MaSV: student.MaSV,
            TT: index + 1
        }));
        onStudentsSort(studentOrder);
    };

    const SortIndicator = ({ columnKey }) => {
        if (!sortConfig || sortConfig.key !== columnKey) return <ArrowUpDown className="w-4 h-4 ml-2 text-gray-400" />;
        if (sortConfig.direction === 'asc') return <ArrowUp className="w-4 h-4 ml-2" />;
        return <ArrowDown className="w-4 h-4 ml-2" />;
    };

    // Cập nhật: Hàm handleExport để tạo tên file IN HOA và không dấu (22/10/2025)
    const handleExport = (format) => {
        const dataToExport = filteredData.map((row, index) => {
            const newRow = {};
            columns.filter(c => visibleColumns.includes(c.accessor)).forEach(col => {
                let cellValue;
                if (col.accessor === 'stt') { cellValue = (currentPage - 1) * itemsPerPage + index + 1; }
                else if (col.cell) { const renderResult = col.cell({ value: row[col.accessor], row, rowIndex: index, currentPage, itemsPerPage }); if (React.isValidElement(renderResult)) { cellValue = renderResult.props.children; if(typeof cellValue === 'object' && cellValue !== null){ cellValue = Array.isArray(cellValue) ? cellValue.join('') : String(cellValue); } } else { cellValue = renderResult; } }
                else { cellValue = row[col.accessor]; }
                
                // BỔ SUNG: Hiển thị tên Chức vụ SV trong file export thay vì MaCVSV
                if (col.accessor === 'ChucvuSV' && studentPositions && row.MaCVSV) {
                    const pos = studentPositions.find(p => p.MaCVSV === row.MaCVSV);
                    cellValue = pos ? pos.ChucvuSV : row.ChucvuSV; // Fallback về giá trị cũ (nếu có)
                }

                newRow[col.header] = cellValue;
            });
            return newRow;
        });
        
        // BỔ SUNG: Kiểm tra nếu title là React element
        let titleString;
        if (typeof title === 'string') {
            titleString = title;
        } else if (React.isValidElement(title)) {
            // Cố gắng trích xuất text từ React element
            titleString = React.Children.toArray(title.props.children).join('').replace(/\s+/g, ' ');
        } else {
            titleString = 'Export';
        }


        // Tạo tên file: bỏ dấu, thay thế ký tự đặc biệt, chuyển thành IN HOA
        const filename = titleString
            .normalize("NFD") // Chuẩn hóa Unicode (tách dấu)
            .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu
            .replace(/đ/g, "d").replace(/Đ/g, "D") // Thay thế đ/Đ
            .replace(/[^a-z0-9\s]/gi, '') // Bỏ ký tự đặc biệt (giữ lại khoảng trắng)
            .replace(/\s+/g, '_') // Thay khoảng trắng bằng gạch dưới
            .toUpperCase(); // Chuyển thành IN HOA

        if (format === 'excel') { exportToExcel({ data: dataToExport, filename: `${filename}.xlsx`, mainTitle: titleString }); }
        else if (format === 'csv') { exportToCSV({ data: dataToExport, filename: `${filename}.csv` }); }
    };
    // Kết thúc cập nhật (22/10/2025)

    const handleCellUpdate = (rowId, columnId, value) => {
        if(rowId === null) {
            setEditingCell(null);
            return;
        }
        setPendingChanges(prev => ({
            ...prev,
            [rowId]: {
                ...prev[rowId],
                [columnId]: value,
            }
        }));
        setEditingCell(null);
    };

    const handleBulkCheckboxChange = (columnId, newValue) => {
        const newChanges = { ...pendingChanges };
        const selectedIds = Object.keys(selectedRowIds).filter(id => selectedRowIds[id]);
        selectedIds.forEach(rowId => {
            newChanges[rowId] = {
                ...newChanges[rowId],
                [columnId]: newValue,
            };
        });
        setPendingChanges(newChanges);
    };

    return (
        <div className="p-4 flex flex-col h-full bg-white dark:bg-gray-800 rounded-b-lg shadow-md">
            {isSelectionMode && contentType === 'classes' && canUpdateClasses && selectedStudents.length > 0 && (
                <div className="flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md mb-4 flex items-center justify-between">
                     <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        {`Đã chọn: ${selectedStudents.length} lớp`}
                    </span>
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                <Edit className="w-4 h-4" /> Cập nhật hàng loạt
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content sideOffset={5} className="w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 border dark:border-gray-700 z-50">
                                {columns.filter(c => c.editable === 'checkbox').map(col => (
                                    <DropdownMenu.Sub key={col.accessor}>
                                        <DropdownMenu.SubTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none text-sm">
                                            <span>{col.header}</span>
                                            <ChevronRight className="w-4 h-4"/>
                                        </DropdownMenu.SubTrigger>
                                        <DropdownMenu.Portal>
                                            <DropdownMenu.SubContent sideOffset={5} alignOffset={-5} className="w-28 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 border dark:border-gray-700 z-50">
                                                <DropdownMenu.Item onSelect={() => handleBulkCheckboxChange(col.accessor, true)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none text-sm">Bật</DropdownMenu.Item>
                                                <DropdownMenu.Item onSelect={() => handleBulkCheckboxChange(col.accessor, false)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none text-sm">Tắt</DropdownMenu.Item>
                                            </DropdownMenu.SubContent>
                                        </DropdownMenu.Portal>
                                    </DropdownMenu.Sub>
                                ))}
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
            )}
            
            {isSelectionMode && contentType === 'students' && (
                <div className="flex-shrink-0 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        {selectedStudents.length > 0 ? `Đã chọn: ${selectedStudents.length} sinh viên` : "Chế độ chọn đang bật"}
                    </span>
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={handleSortPersistence}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
                            title="Sắp xếp danh sách sinh viên trên hệ thống theo thứ tự tại danh sách này!"
                        >
                            <SortAsc className="w-4 h-4" /> Sắp xếp
                        </button>
                        <button 
                            onClick={handleDelete}
                            disabled={!canDeleteSelected}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed"
                            title={!canDeleteSelected ? "Chỉ xóa được SV 'Nghỉ'/'BL' chưa có điểm thi và lớp chưa xác nhận." : "Xóa sinh viên đã chọn"}
                        >
                            <Trash2 className="w-4 h-4" /> Xóa khỏi lớp
                        </button>
                    </div>
                </div>
            )}
            
            <div className="flex-shrink-0">
                {/* CẬP NHẬT: Tiêu đề giờ đây có thể là React Node */}
                <h2 className="text-xl font-bold mb-4 truncate text-primary dark:text-gray-100" title={typeof title === 'string' ? title : 'Tiêu đề'}>{title}</h2>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                         <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Tìm kiếm trong bảng..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 w-64 border rounded-md dark:bg-gray-700 dark:border-gray-600"/></div>
                        {canPerformActions && (
                            <button onClick={handleToggleSelectionMode} className={cn("px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors", isSelectionMode ? "bg-red-100 text-red-700" : "bg-gray-100 dark:bg-gray-700")}>
                                {isSelectionMode ? <XCircle className="w-4 h-4" /> : <ListChecks className="w-4 h-4" />}
                                {isSelectionMode ? 'Hủy' : 'Chọn'}
                            </button>
                        )}
                        {contentType === 'students' && (
                            <button onClick={() => setIsDetailedGradesMode(prev => !prev)} className={cn("px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors", isDetailedGradesMode ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-red-500 text-white dark:bg-gray-700 hover:bg-red-200 dark:hover:bg-gray-600")}>
                                <FileCheck2 className="w-4 h-4" />
                                {isDetailedGradesMode ? 'Mặc định' : 'Điểm HP'}
                            </button>
                        )}
                        {contentType === 'classes' && (
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button className="flex items-center gap-2 px-3 py-2 border rounded-md text-white bg-red-500 dark:bg-gray-700 hover:bg-red-300 dark:hover:bg-gray-600 text-sm">
                                        <View className="w-4 h-4" />
                                        <span>Xem</span>
                                        <ChevronDown className="w-4 h-4 opacity-60" />
                                    </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                    <DropdownMenu.Content sideOffset={5} className="w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 border dark:border-gray-700 z-50">
                                        <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold text-gray-500">Chế độ xem nhanh</DropdownMenu.Label>
                                        <DropdownMenu.RadioGroup value={activePreset} onValueChange={onPresetChange}>
                                            <DropdownMenu.RadioItem value="default" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none text-sm data-[state=checked]:font-semibold">
                                                <DropdownMenu.ItemIndicator className="w-4 h-4"><FileCheck className="w-4 h-4 text-blue-600"/></DropdownMenu.ItemIndicator>
                                                <span className="flex-grow pl-2">Mặc định</span>
                                            </DropdownMenu.RadioItem>
                                            <DropdownMenu.RadioItem value="exam" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none text-sm data-[state=checked]:font-semibold">
                                                <DropdownMenu.ItemIndicator className="w-4 h-4"><FileCheck className="w-4 h-4 text-blue-600"/></DropdownMenu.ItemIndicator>
                                                <span className="flex-grow pl-2">Kiểm tra / Thi</span>
                                            </DropdownMenu.RadioItem>
                                            <DropdownMenu.RadioItem value="lock" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none text-sm data-[state=checked]:font-semibold">
                                                <DropdownMenu.ItemIndicator className="w-4 h-4"><FileCheck className="w-4 h-4 text-blue-600"/></DropdownMenu.ItemIndicator>
                                                <span className="flex-grow pl-2">Khóa / Mở khóa</span>
                                            </DropdownMenu.RadioItem>
                                            <DropdownMenu.RadioItem value="evaluation" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none text-sm data-[state=checked]:font-semibold">
                                                <DropdownMenu.ItemIndicator className="w-4 h-4"><FileCheck className="w-4 h-4 text-blue-600"/></DropdownMenu.ItemIndicator>
                                                <span className="flex-grow pl-2">ĐGCK học phần</span>
                                            </DropdownMenu.RadioItem>
                                        </DropdownMenu.RadioGroup>
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild><button className="flex items-center gap-2 px-3 py-2 border rounded-md bg-green-600 text-white hover:bg-green-700  dark:hover:bg-gray-700 text-sm"><Download className="w-4 h-4"/> </button></DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                                <DropdownMenu.Content sideOffset={5} className="w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 border dark:border-gray-700 z-50">
                                    <DropdownMenu.Item onSelect={() => handleExport('excel')} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none text-sm">Xuất Excel (.xlsx)</DropdownMenu.Item>
                                    <DropdownMenu.Item onSelect={() => handleExport('csv')} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none text-sm">Xuất CSV (.csv)</DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>

                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild><button className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"><Settings2 className="w-4 h-4"/></button></DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                                <DropdownMenu.Content sideOffset={5} className="w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 border dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                                    {columns.map(col => (
                                        <DropdownMenu.CheckboxItem key={col.accessor} checked={visibleColumns.includes(col.accessor)} onCheckedChange={() => !col.isLocked && onVisibleColumnsChange(col.accessor)} onSelect={(e) => e.preventDefault()} disabled={col.isLocked} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none text-sm data-[disabled]:opacity-50"><DropdownMenu.ItemIndicator><FileCheck className="w-4 h-4 text-blue-600"/></DropdownMenu.ItemIndicator><span className={cn("flex-grow", !visibleColumns.includes(col.accessor) && "pl-5")}>{col.header}</span></DropdownMenu.CheckboxItem>
                                    ))}
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                        <div className="flex items-center gap-2 text-sm">
                            <span></span>
                            <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                <option value={15}>15</option>
                                <option value={35}>35</option>
                                <option value={50}>50</option>
                                <option value={Number.MAX_SAFE_INTEGER}>Tất cả</option>
                            </select>
                            <span>dòng</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-grow overflow-auto border rounded-lg dark:border-gray-700">
                 <table className="w-full text-sm text-left table-auto table-row-hover">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
                        <tr>
                            {isSelectionMode && (
                                <th className="p-2 w-10 text-center">
                                    <input type="checkbox" onChange={handleSelectAllOnPage} checked={paginatedData.length > 0 && paginatedData.every(row => selectedRowIds[row[uniqueKeyField]])} />
                                </th>
                            )}
                            {columns.filter(c => visibleColumns.includes(c.accessor)).map(col => (
                                <th key={col.accessor} className={cn("px-4 py-3 font-semibold whitespace-normal", col.className)}>
                                    {col.sortable ? (<button className="flex items-center" onClick={() => onSort(col.accessor)}>{col.header}<SortIndicator columnKey={col.accessor} /></button>) : col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {paginatedData.map((row, rowIndex) => {
                             const rowId = row[uniqueKeyField];
                             return (
                                 <tr key={rowId} 
                                     className={cn("transition-colors duration-150", selectedRowIds[rowId] && "bg-blue-50 dark:bg-blue-900/30", contentType === 'classes' && "cursor-pointer")}
                                     // Bổ sung: Sự kiện double click cho hàng
                                     onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(row)}
                                >
                                     {isSelectionMode && (
                                         <td className="p-2 w-10 text-center">
                                             <input type="checkbox" checked={!!selectedRowIds[rowId]} onChange={() => handleRowSelect(rowId)} />
                                         </td>
                                     )}
                                     {columns.filter(c => visibleColumns.includes(c.accessor)).map(col => {
                                         const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === col.accessor;
                                         const pendingValue = pendingChanges[rowId]?.[col.accessor];
                                         
                                         // BỔ SUNG: Xác định giá trị hiển thị cho ChucvuSV
                                         let displayValue;
                                         if (col.accessor === 'ChucvuSV') {
                                            const selectedMaCVSV = pendingValue !== undefined ? pendingValue : row.MaCVSV;
                                            const pos = studentPositions.find(p => p.MaCVSV === selectedMaCVSV);
                                            displayValue = pos ? pos.ChucvuSV : ''; // Hiển thị tên chức vụ
                                         } else {
                                            displayValue = pendingValue !== undefined ? pendingValue : row[col.accessor];
                                         }


                                         return (
                                            <td key={col.accessor} 
                                                className={cn("px-4 py-2 whitespace-nowrap", col.className, pendingValue !== undefined && "bg-yellow-100/50 dark:bg-yellow-900/20")} 
                                                onDoubleClick={(e) => {
                                                    if(col.editable) e.stopPropagation(); 
                                                    // BỔ SUNG: Kiểm tra quyền cho cả class và student
                                                    const canEdit = (contentType === 'classes' && canUpdateClasses) || (contentType === 'students' && canUpdateStudents);
                                                    if(canEdit && col.editable && col.editable !== 'checkbox') {
                                                        setEditingCell({rowId, columnId: col.accessor});
                                                    }
                                                }}
                                            >
                                                {isEditing ? (
                                                    // BỔ SUNG: Truyền studentPositions vào EditableCell
                                                    <EditableCell value={displayValue} row={row} column={col} onUpdate={handleCellUpdate} evaluationForms={evaluationForms} studentPositions={studentPositions} pendingChanges={pendingChanges} />
                                                ) : col.editable === 'checkbox' ? (
                                                     <input type="checkbox" checked={!!displayValue} onChange={(e) => canUpdateClasses && handleCellUpdate(rowId, col.accessor, e.target.checked)} disabled={!canUpdateClasses} />
                                                ) : col.cell ? (
                                                    col.cell({ value: displayValue, row, rowIndex, currentPage, itemsPerPage })
                                                ) : (displayValue === null || displayValue === undefined ? '' : displayValue) }
                                            </td>
                                         )
                                     })}
                                 </tr>
                             );
                        })}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex-shrink-0 pt-4">
                    <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
            <ConfirmationModal 
                open={isConfirmModalOpen}
                onOpenChange={setIsConfirmModalOpen}
                onConfirm={confirmDelete}
                title="Xác nhận xóa sinh viên"
                description={`Bạn có chắc chắn muốn xóa ${selectedStudents.length} sinh viên đã chọn khỏi lớp học phần này không? Hành động này sẽ xóa cả dữ liệu điểm danh, đăng ký học, và kết quả học tập liên quan. Hành động này không thể hoàn tác.`}
            />
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
const CreditClassManagementPage = () => {
    //Bước 2: Gọi ghi log
	// Tên '...' sẽ được ghi vào cột 'Cuaso'
	usePageLogger('QL lớp học phần');

	const [treeData, setTreeData] = useState([]);
    const [isLoadingTree, setIsLoadingTree] = useState(true);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [contentData, setContentData] = useState({ type: null, data: [], title: 'QUẢN LÝ LỚP HỌC PHẦN' });
    const [selectedNode, setSelectedNode] = useState(null);
    const [treeSearchTerm, setTreeSearchTerm] = useState('');
    const [debouncedTreeSearchTerm] = useDebounce(treeSearchTerm, 300);
    const [highlightedNodeIds, setHighlightedNodeIds] = useState(new Set());
    const [sidebarWidth, setSidebarWidth] = useState(350);
    const lastSidebarWidth = useRef(350);
    const isSidebarCollapsed = sidebarWidth <= 56;
    const [expandedNodes, setExpandedNodes] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: 'DonviQuanLy', direction: 'asc' });
    // BỔ SUNG: Tách riêng pendingChanges cho class và student
    const [classPendingChanges, setClassPendingChanges] = useState({});
    const [studentPendingChanges, setStudentPendingChanges] = useState({});
    const [evaluationForms, setEvaluationForms] = useState([]);
    // BỔ SUNG: State cho Chức vụ SV
    const [studentPositions, setStudentPositions] = useState([]);
    const [classVisibleColumns, setClassVisibleColumns] = useState(classColumnsConfig.filter(c => c.defaultVisible).map(c => c.accessor));
    const [studentVisibleColumns, setStudentVisibleColumns] = useState(studentColumnsConfig.filter(c => c.defaultVisible).map(c => c.accessor));
    
    const [activeClassPreset, setActiveClassPreset] = useState('default');

    const columns = useMemo(() => {
        if (contentData.type === 'classes') return classColumnsConfig;
        if (contentData.type === 'students') {
            const dynamicColumns = [...studentColumnsConfig];
            const firstStudent = contentData.data[0];
            if (firstStudent && firstStudent.MaCT2) {
                const scoreColumns = [];
                const scoreMap = {
                    "002": [ {accessor: "C11", header: "Điểm Hs11"}, {accessor: "C21", header: "Điểm Hs21"} ],
                    "003": [ {accessor: "C11", header: "Điểm Hs11"}, {accessor: "C21", header: "Điểm Hs21"}, {accessor: "C22", header: "Điểm Hs22"} ],
                    "004": [ {accessor: "C11", header: "Điểm Hs11"}, {accessor: "C21", header: "Điểm Hs21"}, {accessor: "C22", header: "Điểm Hs22"}, {accessor: "C23", header: "Điểm Hs23"} ],
                    "005": [ {accessor: "C11", header: "Điểm Hs11"}, {accessor: "C21", header: "Điểm Hs21"}, {accessor: "C22", header: "Điểm Hs22"}, {accessor: "C23", header: "Điểm Hs23"}, {accessor: "C24", header: "Điểm Hs24"} ],
                    "006": [ {accessor: "C11", header: "Điểm Hs11"}, {accessor: "C21", header: "Điểm Hs21"}, {accessor: "C22", header: "Điểm Hs22"}, {accessor: "C23", header: "Điểm Hs23"}, {accessor: "C24", header: "Điểm Hs24"}, {accessor: "C25", header: "Điểm Hs25"} ],
                };
                if (scoreMap[firstStudent.MaCT2]) {
                    scoreMap[firstStudent.MaCT2].forEach(col => { scoreColumns.push({ ...col, defaultVisible: false, cell: NumberCell, className: 'text-center' }); });
                }
                const insertIndex = dynamicColumns.findIndex(col => col.accessor === 'TBHS');
                if (insertIndex !== -1) { dynamicColumns.splice(insertIndex, 0, ...scoreColumns); }
            }
            return dynamicColumns;
        }
        return [];
    }, [contentData.type, contentData.data]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoadingTree(true);
                // BỔ SUNG: Tải đồng thời 3 API
                const [treeRes, formsRes, positionsRes] = await Promise.all([
                    axiosInstance.get('/credit-class-management/tree'),
                    axiosInstance.get('/credit-class-management/evaluation-forms'),
                    axiosInstance.get('/credit-class-management/student-positions') // API mới
                ]);
                setTreeData(treeRes.data);
                setEvaluationForms(formsRes.data);
                setStudentPositions(positionsRes.data); // Lưu DS Chức vụ SV
            } catch (error) {
                toast.error('Không thể tải dữ liệu khởi tạo cho module.');
            } finally {
                setIsLoadingTree(false);
            }
        };
        fetchInitialData();
    }, []);
    
    const getAncestorIds = useCallback((nodes, nodeId) => {
        for (const node of nodes) { if (node.id === nodeId) return [nodeId]; if (node.children) { const path = getAncestorIds(node.children, nodeId); if (path.length > 0) return [node.id, ...path]; } } return [];
    }, []);
    
    const handleVisibleColumnsChange = (accessor, forceSet = false) => {
        const updater = (prev) => {
            if(forceSet) return accessor;
            if (contentData.type === 'classes') setActiveClassPreset(null);
            return prev.includes(accessor) ? prev.filter(c => c !== accessor) : [...prev, accessor];
        }
        if (contentData.type === 'classes') {
            setClassVisibleColumns(updater);
        } else if (contentData.type === 'students') {
            setStudentVisibleColumns(updater);
        }
    };

    const handleClassPresetChange = (presetName) => {
        setActiveClassPreset(presetName);
        setClassVisibleColumns(classColumnPresets[presetName]);
    };

    const handleToggleSidebar = () => {
        if (!isSidebarCollapsed) { lastSidebarWidth.current = sidebarWidth; setSidebarWidth(56); } 
        else { setSidebarWidth(lastSidebarWidth.current); }
    };

    const fetchClassData = useCallback(async (node, currentSortConfig) => {
        if (!node || node.level < 2 || node.level > 4) return;
        setIsLoadingContent(true);
        try { 
            const params = { ...node.params, sortBy: currentSortConfig.key, sortOrder: currentSortConfig.direction }; 
            const response = await axiosInstance.get('/credit-class-management/classes', { params }); 
            
            // BỔ SUNG: Tạo tiêu đề React Node (In hoa, màu xanh)
            const title = (
                <>
                    Danh sách Lớp HP: 
                    <span className="text-blue-600 uppercase">
                        {` ${node.name}`}
                    </span>
                </>
            );
            setContentData({ type: 'classes', data: response.data, title: title }); 
        } catch (error) { 
            toast.error(`Không thể tải dữ liệu cho ${node.name}.`); 
            setContentData({ type: 'classes', data: [], title: 'Đã có lỗi xảy ra.' }); 
        } finally { 
            setIsLoadingContent(false); 
        }
    }, []);
    
    const handleNodeSelect = useCallback(async (node, keepSort = false) => {
        // BỔ SUNG: Reset cả 2 pending changes
        setClassPendingChanges({});
        setStudentPendingChanges({});
        
        setSelectedNode(node);
        const ancestorIds = getAncestorIds(treeData, node.id);
        
        const newExpanded = {...expandedNodes};
        ancestorIds.forEach(id => newExpanded[id] = true);
        setExpandedNodes(newExpanded);

        setHighlightedNodeIds(new Set(ancestorIds));
        
        if (node.level < 2) { setContentData({ type: null, data: [], title: 'Vui lòng chọn cấp "Học kỳ" trở xuống để xem dữ liệu.' }); return; }
        
        if (node.level >= 2 && node.level <= 4) { 
            const newSortConfig = keepSort ? sortConfig : { key: 'DonviQuanLy', direction: 'asc' };
            if(!keepSort) setSortConfig(newSortConfig);
            await fetchClassData(node, newSortConfig); 
        } 
        else if (node.level === 5) {
            setIsLoadingContent(true);
            try { 
                const response = await axiosInstance.get(`/credit-class-management/students/${node.params.maLHP}`); 
                
                // BỔ SUNG: Tạo tiêu đề React Node (In hoa, màu đỏ)
                const titleString = `${node.name} (${node.params.viettatHP || 'N/A'}) - GV: ${node.params.viettatGV || 'N/A'}`;
                const title = (
                    <>
                        Danh sách SV: 
                        <span className="text-red-600 uppercase">
                            {` ${titleString}`}
                        </span>
                    </>
                );
                setContentData({ type: 'students', data: response.data, title }); 
            } catch (error) { 
                toast.error(`Không thể tải dữ liệu cho ${node.name}.`); 
            } finally { 
                setIsLoadingContent(false); 
            }
        }
    }, [treeData, getAncestorIds, fetchClassData, sortConfig, expandedNodes]);

    // Bổ sung: Handler cho double click vào hàng lớp học phần
    const handleClassRowDoubleClick = useCallback((classRow) => {
        const findNodeByIdRecursive = (nodes, targetIdWithPrefix) => {
            for (const node of nodes) {
                if (node.id === targetIdWithPrefix) return node; // So sánh trực tiếp với ID có tiền tố
                if (node.children) {
                    const found = findNodeByIdRecursive(node.children, targetIdWithPrefix);
                    if (found) return found;
                }
            }
            return null;
        };
        // Tạo ID có tiền tố để tìm kiếm
        const targetNodeId = `lhp_${classRow.MaLHP}`;
        const classNode = findNodeByIdRecursive(treeData, targetNodeId);
        if (classNode) {
            handleNodeSelect(classNode);
        } else {
            console.error("Tree Data for search:", JSON.stringify(treeData, null, 2)); // Log treeData để debug
            console.error("Searching for Node ID:", targetNodeId);
            toast.error("Không tìm thấy lớp học phần tương ứng trong cây thư mục. Vui lòng kiểm tra lại cấu trúc cây.");
        }
    }, [treeData, handleNodeSelect]);

    const handleSort = useCallback((columnKey) => {
        if (contentData.type !== 'classes') return;
        let direction = 'asc';
        if (sortConfig.key === columnKey && sortConfig.direction === 'asc') { direction = 'desc'; }
        const newSortConfig = { key: columnKey, direction };
        setSortConfig(newSortConfig);
        if (selectedNode) { fetchClassData(selectedNode, newSortConfig); }
    }, [sortConfig, selectedNode, contentData.type, fetchClassData]);

    const handleStudentsDelete = async (studentsToDelete) => {
        const studentIds = studentsToDelete.map(s => s.MaSV);
        if (studentIds.length === 0 || !selectedNode) { toast.error("Không có sinh viên nào được chọn để xóa."); return; }
        const maLHP = selectedNode.params.maLHP;
        const loadingToast = toast.loading("Đang xóa sinh viên...");
        try {
            const response = await axiosInstance.delete('/credit-class-management/students', { data: { studentIds, maLHP } });
            toast.success(response.data.message, { id: loadingToast });
            handleNodeSelect(selectedNode);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Xóa thất bại.', { id: loadingToast });
        }
    };
    
    const handleStudentsSort = async (studentOrder) => {
        if (!selectedNode || studentOrder.length === 0) { toast.error("Không có danh sách để sắp xếp."); return; }
        const maLHP = selectedNode.params.maLHP;
        const loadingToast = toast.loading("Đang cập nhật thứ tự...");
        try {
            const response = await axiosInstance.put('/credit-class-management/students/order', { studentOrder, maLHP });
            toast.success(response.data.message, { id: loadingToast });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cập nhật thứ tự thất bại.', { id: loadingToast });
        }
    };
    
    // Cập nhật: Đổi tên hàm
    const handleSaveClassChanges = async () => {
        const updates = Object.entries(classPendingChanges).map(([maLHP, fields]) => ({ MaLHP: maLHP, ...fields }));
        if (updates.length === 0) return;

        const loadingToast = toast.loading("Đang lưu thay đổi...");
        try {
            await axiosInstance.put('/credit-class-management/classes', { 
                updates,
                context: selectedNode?.name 
            });
            toast.success("Lưu thay đổi thành công!", { id: loadingToast });
            setClassPendingChanges({}); // Reset
            if (selectedNode) {
                await handleNodeSelect(selectedNode, true); // Reload
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lưu thất bại.', { id: loadingToast });
        }
    };

    // BỔ SUNG: Hàm lưu thay đổi cho Chức vụ SV
    const handleSaveStudentChanges = async () => {
        const updates = Object.entries(studentPendingChanges).map(([maSV, fields]) => ({
            MaSV: maSV,
            MaCVSV: fields.ChucvuSV, // 'ChucvuSV' là accessor
            MaLHP: selectedNode.params.maLHP
        }));

        if (updates.length === 0) return;

        const loadingToast = toast.loading("Đang lưu thay đổi chức vụ...");
        try {
            const response = await axiosInstance.put('/credit-class-management/students/update-positions', { updates });
            toast.success(response.data.message || "Lưu thay đổi thành công!", { id: loadingToast });
            setStudentPendingChanges({}); // Reset
            if (selectedNode) {
                await handleNodeSelect(selectedNode, true); // Reload
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lưu thất bại.', { id: loadingToast });
        }
    };


    const getDescendantIds = useCallback((nodeId, data) => { const ids = {}; const findNode = (nodes, id) => { for (const node of nodes) { if (node.id === id) return node; if (node.children) { const found = findNode(node.children, id); if (found) return found; } } return null; }; const startNode = findNode(data, nodeId); if (!startNode) return ids; const traverse = (node) => { if (node.children && node.children.length > 0) { ids[node.id] = true; node.children.forEach(traverse); } }; traverse(startNode); return ids; }, []);
    const handleExpandSubTree = useCallback(() => { if (!selectedNode) return; const descendantIds = getDescendantIds(selectedNode.id, treeData); setExpandedNodes(prev => ({ ...prev, ...descendantIds, [selectedNode.id]: true })); }, [selectedNode, treeData, getDescendantIds]);
    const handleCollapseSubTree = useCallback(() => { if (!selectedNode) return; const descendantIds = getDescendantIds(selectedNode.id, treeData); const newExpanded = { ...expandedNodes }; Object.keys(descendantIds).forEach(id => { delete newExpanded[id]; }); delete newExpanded[selectedNode.id]; setExpandedNodes(newExpanded); }, [selectedNode, expandedNodes, treeData, getDescendantIds]);
    
    const renderContent = () => {
        if (isLoadingContent) { return <div className="flex items-center justify-center h-full"><Loader className="w-8 h-8 animate-spin text-blue-600"/></div>; }
        
        // BỔ SUNG: Xác định pendingChanges nào đang hoạt động
        const isClassChanges = contentData.type === 'classes' && Object.keys(classPendingChanges).length > 0;
        const isStudentChanges = contentData.type === 'students' && Object.keys(studentPendingChanges).length > 0;
        
        const currentVisibleColumns = contentData.type === 'classes' ? classVisibleColumns : studentVisibleColumns;
        
        // BỔ SUNG: Truyền đúng pendingChanges và setPendingChanges
        const currentPendingChanges = contentData.type === 'classes' ? classPendingChanges : studentPendingChanges;
        const currentSetPendingChanges = contentData.type === 'classes' ? setClassPendingChanges : setStudentPendingChanges;
        
        return (
            <div className="flex flex-col h-full">
                {/* BỔ SUNG: Hiển thị thanh Lưu/Hủy động */}
                {(isClassChanges || isStudentChanges) && (
                    <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900/30 p-2 flex items-center justify-center gap-4 border-b dark:border-yellow-800">
                        <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Bạn có thay đổi chưa được lưu.</span>
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={isClassChanges ? handleSaveClassChanges : handleSaveStudentChanges} 
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1.5"
                             >
                                <Save className="w-4 h-4"/> Lưu thay đổi
                             </button>
                             <button 
                                onClick={() => currentSetPendingChanges({})} 
                                className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center gap-1.5"
                             >
                                <Ban className="w-4 h-4"/> Hủy bỏ
                             </button>
                        </div>
                    </div>
                )}
                <div className="flex-grow overflow-hidden">
                     <DataTable 
                        columns={columns} data={contentData.data} title={contentData.title}
                        uniqueKeyField={contentData.type === 'students' ? 'MaSV' : 'MaLHP'} 
                        sortConfig={sortConfig} onSort={handleSort}
                        contentType={contentData.type}
                        onStudentsDelete={handleStudentsDelete}
                        onStudentsSort={handleStudentsSort}
                        onRowDoubleClick={contentData.type === 'classes' ? handleClassRowDoubleClick : null}
                        
                        // BỔ SUNG: Truyền đúng props
                        pendingChanges={currentPendingChanges}
                        setPendingChanges={currentSetPendingChanges}
                        
                        visibleColumns={currentVisibleColumns}
                        onVisibleColumnsChange={handleVisibleColumnsChange}
                        
                        // BỔ SUNG: Truyền danh sách chức vụ
                        evaluationForms={evaluationForms}
                        studentPositions={studentPositions} 

                        activePreset={activeClassPreset}
                        onPresetChange={handleClassPresetChange}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-[calc(100vh-116px)] w-full bg-gray-50 dark:bg-gray-900">
            <Resizable 
                size={{ width: sidebarWidth, height: '100%' }} minWidth={isSidebarCollapsed ? 56 : 250} maxWidth="50%" 
                enable={{ right: !isSidebarCollapsed }} className="bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col"
                onResizeStop={(e, direction, ref, d) => {
                    const newWidth = sidebarWidth + d.width;
                    setSidebarWidth(newWidth);
                    if (!isSidebarCollapsed) { lastSidebarWidth.current = newWidth; }
                }}
            >
                <div className="p-2 border-b dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center justify-between gap-1">
                         <button onClick={handleToggleSidebar} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md" title={isSidebarCollapsed ? "Mở rộng" : "Thu gọn"}>{isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5"/> : <PanelLeftClose className="w-5 h-5"/>}</button>
                       {!isSidebarCollapsed && (<>
                                <button onClick={handleExpandSubTree} disabled={!selectedNode || !selectedNode.children} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed" title="Mở rộng mục con"><ChevronsDown className="w-5 h-5"/></button>
                                <button onClick={handleCollapseSubTree} disabled={!selectedNode || !selectedNode.children} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed" title="Thu gọn mục con"><ChevronsUp className="w-5 h-5"/></button>
                           </>)}
                    </div>
                     {!isSidebarCollapsed && (<div className="relative mt-2">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Tìm kiếm trong cây..." value={treeSearchTerm} onChange={(e) => setTreeSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                        </div>)}
                </div>
                <div className={cn("flex-grow overflow-y-auto", isSidebarCollapsed ? 'overflow-x-hidden' : 'overflow-x-auto')}>
                    {isLoadingTree ? <div className="flex items-center justify-center h-full"><Loader className="w-8 h-8 animate-spin text-blue-600"/></div>
                        : <TreeView nodes={treeData} onNodeSelect={handleNodeSelect} searchTerm={debouncedTreeSearchTerm} highlightedNodeIds={highlightedNodeIds} expandedNodes={expandedNodes} toggleNode={(nodeId) => setExpandedNodes(prev => ({...prev, [nodeId]: !prev[nodeId]}))} isCollapsed={isSidebarCollapsed} selectedNode={selectedNode} />
                    }
                </div>
            </Resizable>
            <main className="flex-1 overflow-hidden">{renderContent()}</main>
        </div>
    );
};

export default CreditClassManagementPage;