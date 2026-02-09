/*
 * Đường dẫn file: client/src/pages/ExamRoomBuilderPage.jsx
 * Phiên bản cập nhật: 05/02/2026
 * Tóm tắt cập nhật:
 * - Layout vertical: DS1 → DS2 → DS3 từ trên xuống
 * - DS2: chiều cao cố định = header + 2 rows
 * - Sorting cho DS1 và DS3 bằng click tiêu đề cột
 * - Inline editing cho cột "Tên phòng thi" ở DS2
 * - Gửi maPT khi unassign để kiểm tra ngày thi
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Loader, Plus, Trash2, UserPlus, UserMinus, X,
    CheckSquare, Square, ChevronDown, ChevronUp, ChevronsUpDown, Pencil, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';
import useTabStore from '../store/tabStore';
import { cn } from '../lib/utils';
import moment from 'moment-timezone';

// ========================================
// Helper: Format ngày DD/MM/YYYY
// ========================================
const formatDate = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).format('DD/MM/YYYY');
};

// ========================================
// Component: SortableDataTable - Bảng với sorting và header cố định
// ========================================
const SortableDataTable = ({
    title,
    columns,
    data,
    selectedRows,
    onRowSelect,
    onRowClick,
    onDoubleClick,
    highlightedRowId,
    uniqueKeyField = 'MaSV',
    showCheckbox = true,
    emptyMessage = 'Không có dữ liệu',
    loading = false,
    sortable = false,
    maxHeight = null, // null = auto, số = fixed height
    className = '',
    boldRows = false  // Part 7: Font bold cho các record
}) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const allSelected = data.length > 0 && selectedRows.length === data.length;
    const someSelected = selectedRows.length > 0 && !allSelected;

    const handleSelectAll = () => {
        if (allSelected) {
            onRowSelect([]);
        } else {
            onRowSelect(data.map(row => row[uniqueKeyField]));
        }
    };

    const handleSort = (accessor) => {
        if (!sortable) return;
        setSortConfig(prev => {
            if (prev.key === accessor) {
                return { key: accessor, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key: accessor, direction: 'asc' };
        });
    };

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return data;
        return [...data].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal == null) return 1;
            if (bVal == null) return -1;
            if (typeof aVal === 'string') {
                return sortConfig.direction === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }
            return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        });
    }, [data, sortConfig]);

    const getSortIcon = (accessor) => {
        if (!sortable) return null;
        if (sortConfig.key !== accessor) {
            return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
        }
        return sortConfig.direction === 'asc'
            ? <ChevronUp className="w-3 h-3" />
            : <ChevronDown className="w-3 h-3" />;
    };

    return (
        <div className={cn("flex flex-col border rounded-lg dark:border-gray-700 overflow-hidden", className)}
            style={maxHeight ? { maxHeight } : {}}>
            {/* Header cố định */}
            <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 px-3 py-2 border-b dark:border-gray-600">
                <h3 className="font-semibold text-sm">{title}</h3>
            </div>

            {/* Bảng với scroll */}
            <div className="flex-grow overflow-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-24">
                        <Loader className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex items-center justify-center h-24 text-gray-500">
                        {emptyMessage}
                    </div>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                            <tr>
                                {showCheckbox && (
                                    <th className="px-2 py-2 text-center w-10 border-b dark:border-gray-700">
                                        <button onClick={handleSelectAll} className="p-1">
                                            {allSelected ? (
                                                <CheckSquare className="w-4 h-4 text-blue-600" />
                                            ) : someSelected ? (
                                                <div className="w-4 h-4 border-2 border-blue-600 bg-blue-200 rounded" />
                                            ) : (
                                                <Square className="w-4 h-4 text-gray-400" />
                                            )}
                                        </button>
                                    </th>
                                )}
                                {columns.map(col => (
                                    <th
                                        key={col.accessor}
                                        onClick={() => handleSort(col.accessor)}
                                        className={cn(
                                            "px-2 py-2 text-left font-medium border-b dark:border-gray-700",
                                            sortable && "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none",
                                            col.className
                                        )}
                                    >
                                        <div className="flex items-center gap-1">
                                            {col.header}
                                            {getSortIcon(col.accessor)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((row, index) => {
                                const rowId = row[uniqueKeyField];
                                const isSelected = selectedRows.includes(rowId);
                                const isHighlighted = highlightedRowId === rowId;

                                return (
                                    <tr
                                        key={rowId}
                                        onClick={() => onRowClick?.(row)}
                                        onDoubleClick={() => onDoubleClick?.(row)}
                                        className={cn(
                                            "cursor-pointer transition-colors",
                                            isHighlighted
                                                ? "bg-blue-100 dark:bg-blue-900/30"
                                                : isSelected
                                                    ? "bg-yellow-50 dark:bg-yellow-900/20"
                                                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        {showCheckbox && (
                                            <td className="px-2 py-1.5 text-center border-b dark:border-gray-700">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isSelected) {
                                                            onRowSelect(selectedRows.filter(id => id !== rowId));
                                                        } else {
                                                            onRowSelect([...selectedRows, rowId]);
                                                        }
                                                    }}
                                                    className="p-1"
                                                >
                                                    {isSelected ? (
                                                        <CheckSquare className="w-4 h-4 text-blue-600" />
                                                    ) : (
                                                        <Square className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </button>
                                            </td>
                                        )}
                                        {columns.map(col => (
                                            <td
                                                key={col.accessor}
                                                className={cn(
                                                    "px-2 py-1.5 border-b dark:border-gray-700 whitespace-nowrap",
                                                    col.className,
                                                    boldRows && "font-bold"
                                                )}
                                            >
                                                {col.cell ? col.cell(row, index) : row[col.accessor]}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

// ========================================
// Component: ExamRoomBuilderPage
// ========================================
const ExamRoomBuilderPage = ({ maHK, maDV, maHP, tenHP }) => {
    const { closeTab, tabs, activeTabId } = useTabStore();

    // State cho thông tin học phần
    const [courseInfo, setCourseInfo] = useState(null);

    // State cho lần thi được chọn
    const [examType, setExamType] = useState(1); // Mặc định: Cuối kỳ L1

    // State cho dữ liệu
    const [eligibleStudents, setEligibleStudents] = useState([]);
    const [examRooms, setExamRooms] = useState([]);
    const [assignedStudents, setAssignedStudents] = useState([]);

    // State cho loading
    const [loadingEligible, setLoadingEligible] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [loadingAssigned, setLoadingAssigned] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // State cho selection
    const [selectedEligible, setSelectedEligible] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedAssigned, setSelectedAssigned] = useState([]);

    // State cho inline editing
    const [editingRoomId, setEditingRoomId] = useState(null);
    const [editingRoomName, setEditingRoomName] = useState('');

    // ========================================
    // Data fetching
    // ========================================
    const fetchCourseInfo = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/exam-room-management/course-info', {
                params: { maHK, maDV, maHP }
            });
            setCourseInfo(response.data);
        } catch (error) {
            console.error('fetchCourseInfo error:', error);
        }
    }, [maHK, maDV, maHP]);

    const fetchEligibleStudents = useCallback(async () => {
        setLoadingEligible(true);
        try {
            const response = await axiosInstance.get('/exam-room-management/eligible-students', {
                params: { maHK, maDV, maHP, examType }
            });
            setEligibleStudents(response.data);
            setSelectedEligible([]);
        } catch (error) {
            toast.error('Không thể tải danh sách sinh viên.');
        } finally {
            setLoadingEligible(false);
        }
    }, [maHK, maDV, maHP, examType]);

    const fetchExamRooms = useCallback(async () => {
        setLoadingRooms(true);
        try {
            const response = await axiosInstance.get('/exam-room-management/exam-rooms', {
                params: { maHK, maDV, maHP, examType }
            });
            setExamRooms(response.data);
            // Auto-select phòng cuối cùng được tạo
            if (response.data.length > 0) {
                setSelectedRoom(response.data[response.data.length - 1].MaPT);
            } else {
                setSelectedRoom(null);
            }
        } catch (error) {
            toast.error('Không thể tải danh sách phòng thi.');
        } finally {
            setLoadingRooms(false);
        }
    }, [maHK, maDV, maHP, examType]);

    const fetchAssignedStudents = useCallback(async () => {
        if (!selectedRoom) {
            setAssignedStudents([]);
            return;
        }
        setLoadingAssigned(true);
        try {
            const response = await axiosInstance.get('/exam-room-management/assigned-students', {
                params: { maPT: selectedRoom, examType, maHK, maHP }
            });
            setAssignedStudents(response.data);
            setSelectedAssigned([]);
        } catch (error) {
            toast.error('Không thể tải danh sách sinh viên đã xếp phòng.');
        } finally {
            setLoadingAssigned(false);
        }
    }, [selectedRoom, examType, maHK, maHP]);

    // ========================================
    // Effects
    // ========================================
    useEffect(() => {
        fetchCourseInfo();
    }, [fetchCourseInfo]);

    useEffect(() => {
        fetchEligibleStudents();
        fetchExamRooms();
    }, [fetchEligibleStudents, fetchExamRooms]);

    useEffect(() => {
        fetchAssignedStudents();
    }, [fetchAssignedStudents]);

    // ========================================
    // Handlers
    // ========================================
    const handleCreateRoom = async () => {
        setActionLoading(true);
        try {
            const response = await axiosInstance.post('/exam-room-management/exam-rooms', {
                maHK, maHP, examType
            });
            toast.success(response.data.message);
            await fetchExamRooms();
            setSelectedRoom(response.data.maPT);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Tạo phòng thi thất bại.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteRoom = async () => {
        if (!selectedRoom) {
            toast.error('Vui lòng chọn phòng thi để xóa.');
            return;
        }

        setActionLoading(true);
        try {
            // Part 7.2: Sửa lỗi - gửi params qua query string thay vì body
            const response = await axiosInstance.delete(`/exam-room-management/exam-rooms/${selectedRoom}`, {
                params: { examType, maHK, maHP }
            });
            toast.success(response.data.message);
            await fetchExamRooms();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Xóa phòng thi thất bại.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAssignStudents = async () => {
        if (selectedEligible.length === 0) {
            toast.error('Vui lòng chọn sinh viên để thêm vào phòng thi.');
            return;
        }
        if (!selectedRoom) {
            toast.error('Vui lòng chọn phòng thi.');
            return;
        }

        const students = eligibleStudents
            .filter(s => selectedEligible.includes(s.MaSV))
            .map(s => ({ MaSV: s.MaSV, MaLHP: s.MaLHP }));

        const room = examRooms.find(r => r.MaPT === selectedRoom);

        setActionLoading(true);
        try {
            const response = await axiosInstance.post('/exam-room-management/assign-students', {
                students,
                maPT: selectedRoom,
                examType,
                maHK,
                maHP,
                tenPhongthi: room?.TenPhongthi
            });
            toast.success(response.data.message);
            await Promise.all([fetchEligibleStudents(), fetchExamRooms(), fetchAssignedStudents()]);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Thêm sinh viên thất bại.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnassignStudents = async () => {
        if (selectedAssigned.length === 0) {
            toast.error('Vui lòng chọn sinh viên để xóa khỏi phòng thi.');
            return;
        }

        const students = assignedStudents
            .filter(s => selectedAssigned.includes(s.MaSV))
            .map(s => ({ MaSV: s.MaSV, MaLHP: s.MaLHP }));

        const room = examRooms.find(r => r.MaPT === selectedRoom);

        setActionLoading(true);
        try {
            const response = await axiosInstance.post('/exam-room-management/unassign-students', {
                students,
                examType,
                maHK,
                maHP,
                maPT: selectedRoom, // Thêm maPT để kiểm tra ngày thi
                tenPhongthi: room?.TenPhongthi
            });
            toast.success(response.data.message);
            await Promise.all([fetchEligibleStudents(), fetchExamRooms(), fetchAssignedStudents()]);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Xóa sinh viên thất bại.');
        } finally {
            setActionLoading(false);
        }
    };

    // Inline edit handlers
    const handleStartEditRoom = (room) => {
        setEditingRoomId(room.MaPT);
        setEditingRoomName(room.TenPhongthi);
    };

    const handleSaveRoomName = async () => {
        if (!editingRoomId || !editingRoomName.trim()) {
            setEditingRoomId(null);
            return;
        }

        setActionLoading(true);
        try {
            await axiosInstance.put(`/exam-room-management/exam-rooms/${editingRoomId}/name`, {
                newName: editingRoomName.trim(),
                examType
            });
            toast.success('Đổi tên phòng thi thành công!');
            await fetchExamRooms();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đổi tên thất bại.');
        } finally {
            setActionLoading(false);
            setEditingRoomId(null);
        }
    };

    const handleCancelEditRoom = () => {
        setEditingRoomId(null);
        setEditingRoomName('');
    };

    const handleClose = () => {
        const currentTab = tabs.find(t => t.id === activeTabId);
        if (currentTab) {
            closeTab(currentTab.id);
        }
    };

    // ========================================
    // Column definitions
    // ========================================
    const studentColumns = useMemo(() => [
        { accessor: 'Stt', header: 'STT', className: 'text-center w-12', cell: (row, index) => index + 1 },
        { accessor: 'Maso', header: 'Mã số', className: 'font-mono' },
        { accessor: 'Holot', header: 'Họ lót' },
        { accessor: 'Ten', header: 'Tên' },
        { accessor: 'Ngaysinh', header: 'Ngày sinh', cell: (row) => formatDate(row.Ngaysinh) },
        { accessor: 'TenLHP', header: 'Lớp HP' },
        { accessor: 'LopSH', header: 'Lớp SH' },
    ], []);

    const assignedStudentColumns = useMemo(() => [
        { accessor: 'Stt', header: 'STT', className: 'text-center w-12', cell: (row, index) => index + 1 },
        { accessor: 'Maso', header: 'Mã số', className: 'font-mono' },
        { accessor: 'Holot', header: 'Họ lót' },
        { accessor: 'Ten', header: 'Tên' },
        { accessor: 'Ngaysinh', header: 'Ngày sinh', cell: (row) => formatDate(row.Ngaysinh) },
        { accessor: 'TenLHP', header: 'Lớp HP' },
        { accessor: 'LopSH', header: 'Lớp SH' },
    ], []);

    const roomColumns = useMemo(() => [
        { accessor: 'Stt', header: 'STT', className: 'text-center w-10', cell: (row, index) => index + 1 },
        {
            accessor: 'TenPhongthi',
            header: 'Tên phòng thi',
            cell: (row) => {
                if (editingRoomId === row.MaPT) {
                    return (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="text"
                                value={editingRoomName}
                                onChange={(e) => setEditingRoomName(e.target.value)}
                                className="px-2 py-0.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 w-full"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveRoomName();
                                    if (e.key === 'Escape') handleCancelEditRoom();
                                }}
                            />
                            <button onClick={handleSaveRoomName} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                <Check className="w-4 h-4" />
                            </button>
                            <button onClick={handleCancelEditRoom} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                }
                return (
                    <div className="flex items-center gap-1 group">
                        <span>{row.TenPhongthi}</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleStartEditRoom(row); }}
                            className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 rounded"
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                    </div>
                );
            }
        },
        { accessor: 'SoLuong', header: 'SL', className: 'text-center w-12' },
        { accessor: 'Ngaythi', header: 'Ngày thi', cell: (row) => formatDate(row.Ngaythi) },
        { accessor: 'Giothi', header: 'Giờ', className: 'text-center w-16' },
        { accessor: 'CBCoithi1', header: 'CB1' },
        { accessor: 'CBCoithi2', header: 'CB2' },
        { accessor: 'Diadiem', header: 'Địa điểm' },
    ], [editingRoomId, editingRoomName]);

    // ========================================
    // Lấy tên phòng thi được chọn cho tiêu đề DS3
    // ========================================
    const selectedRoomName = useMemo(() => {
        const room = examRooms.find(r => r.MaPT === selectedRoom);
        return room?.TenPhongthi || 'Chưa chọn';
    }, [examRooms, selectedRoom]);

    // Kiểm tra phòng thi đã có ngày thi chưa
    const selectedRoomHasExamDate = useMemo(() => {
        const room = examRooms.find(r => r.MaPT === selectedRoom);
        return room?.Ngaythi != null;
    }, [examRooms, selectedRoom]);

    // ========================================
    // Render
    // ========================================
    return (
        <div className="flex flex-col h-full p-4 gap-4">
            {/* Header */}
            <div className="flex-shrink-0 flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        TẠO PHÒNG THI
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cơ sở dữ liệu - {courseInfo?.TenHK || ''} - {courseInfo?.TenDV || ''}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                        <span>Lần thi:</span>
                        <select
                            value={examType}
                            onChange={(e) => setExamType(Number(e.target.value))}
                            className="px-3 py-1.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value={0}>Giữa kỳ</option>
                            <option value={1}>Cuối kỳ L1</option>
                            <option value={2}>Cuối kỳ L2</option>
                        </select>
                    </label>

                    <button
                        onClick={handleClose}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <X className="w-4 h-4" />
                        <span>Đóng</span>
                    </button>
                </div>
            </div>

            {/* Main content - Vertical layout */}
            <div className="flex-grow flex flex-col gap-4 min-h-0 overflow-auto">
                {/* DS1: Sinh viên đủ điều kiện - chiều cao tự động co giãn */}
                <div className="flex-grow flex flex-col min-h-[200px]">
                    <SortableDataTable
                        title={`DS1: Sinh viên đủ điều kiện dự thi (${eligibleStudents.length})`}
                        columns={studentColumns}
                        data={eligibleStudents}
                        selectedRows={selectedEligible}
                        onRowSelect={setSelectedEligible}
                        uniqueKeyField="MaSV"
                        loading={loadingEligible}
                        emptyMessage="Không có sinh viên đủ điều kiện"
                        sortable={true}
                        className="flex-grow"
                    />
                    <div className="flex-shrink-0 mt-2">
                        <button
                            onClick={handleAssignStudents}
                            disabled={actionLoading || selectedEligible.length === 0 || !selectedRoom}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Thêm vào phòng thi ({selectedEligible.length})</span>
                        </button>
                    </div>
                </div>

                {/* DS2: Danh sách phòng thi - chiều cao cố định (~2 rows) */}
                <div className="flex-shrink-0">
                    <SortableDataTable
                        title={`DS2: Danh sách phòng thi (${examRooms.length})`}
                        columns={roomColumns}
                        data={examRooms}
                        selectedRows={[]}
                        onRowSelect={() => { }}
                        onRowClick={(row) => setSelectedRoom(row.MaPT)}
                        onDoubleClick={handleStartEditRoom}
                        highlightedRowId={selectedRoom}
                        uniqueKeyField="MaPT"
                        showCheckbox={false}
                        loading={loadingRooms}
                        emptyMessage="Chưa có phòng thi"
                        sortable={false}
                        maxHeight="180px" // ~Header + 2 rows
                        boldRows={true}
                    />
                    <div className="flex-shrink-0 mt-2 flex gap-2">
                        <button
                            onClick={handleCreateRoom}
                            disabled={actionLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tạo phòng thi</span>
                        </button>
                        <button
                            onClick={handleDeleteRoom}
                            disabled={actionLoading || !selectedRoom}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Xóa phòng thi</span>
                        </button>
                    </div>
                </div>

                {/* DS3: Sinh viên đã xếp phòng */}
                <div className="flex-shrink-0">
                    <SortableDataTable
                        title={`DS3: SV đã xếp phòng: ${selectedRoomName} (${assignedStudents.length})`}
                        columns={assignedStudentColumns}
                        data={assignedStudents}
                        selectedRows={selectedAssigned}
                        onRowSelect={setSelectedAssigned}
                        uniqueKeyField="MaSV"
                        loading={loadingAssigned}
                        emptyMessage={selectedRoom ? "Chưa có sinh viên trong phòng thi này" : "Chọn một phòng thi để xem"}
                        sortable={true}
                    />
                    <div className="flex-shrink-0 mt-2">
                        <button
                            onClick={handleUnassignStudents}
                            disabled={actionLoading || selectedAssigned.length === 0 || selectedRoomHasExamDate}
                            title={selectedRoomHasExamDate ? "Không thể xóa SV khỏi phòng thi đã xếp lịch" : ""}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <UserMinus className="w-4 h-4" />
                            <span>Xóa khỏi phòng thi ({selectedAssigned.length})</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamRoomBuilderPage;
