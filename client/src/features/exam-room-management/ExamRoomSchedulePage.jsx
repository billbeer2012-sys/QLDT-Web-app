/*
 * Đường dẫn file: client/src/features/exam-room-management/ExamRoomSchedulePage.jsx
 * Phiên bản: 07/02/2026
 * Tóm tắt:
 * - Trang "Xếp lịch thi" (Part 4) - thuộc module Quản lý phòng thi
 * - DS4: Danh sách phòng thi
 * - DS5: Danh sách sinh viên thuộc phòng thi (toggle ẩn/hiện)
 * - Nút: Lịch coi thi, In danh sách, Xuất danh sách
 * - Part 6: In PDF và xuất Excel danh sách dự thi
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Loader, Calendar, Printer, FileSpreadsheet, ChevronDown, ChevronUp, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import moment from 'moment-timezone';
import axiosInstance from '../../api/axios';
import useTabStore from '../../store/tabStore';
import { cn } from '../../lib/utils';
import { exportToExcel } from '../../lib/excelExporter';
import ExamScheduleModal from './ExamScheduleModal';
import { generateExamRoomListPDF, openOrDownloadPDF } from './ExamRoomListGenerator';

// ========================================
// Helper: Format ngày DD/MM/YYYY
// ========================================
const formatDate = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).format('DD/MM/YYYY');
};

// ========================================
// Component: DataTable với header cố định
// ========================================
const DataTable = ({
    title,
    columns,
    data,
    onRowClick,
    highlightedRowId,
    uniqueKeyField = 'MaPT',
    emptyMessage = 'Không có dữ liệu',
    loading = false,
    maxHeight = null,
    className = '',
    boldRows = false  // Part 7: Font bold cho các record
}) => {
    return (
        <div className={cn("flex flex-col border rounded-lg dark:border-gray-700 overflow-hidden", className)}
            style={maxHeight ? { maxHeight } : {}}>
            {/* Header */}
            <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 px-3 py-2 border-b dark:border-gray-600">
                <h3 className="font-semibold text-sm">{title}</h3>
            </div>

            {/* Table */}
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
                                {columns.map(col => (
                                    <th
                                        key={col.accessor}
                                        className={cn(
                                            "px-2 py-2 text-left font-medium border-b dark:border-gray-700",
                                            col.className
                                        )}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => {
                                const rowId = row[uniqueKeyField];
                                const isHighlighted = highlightedRowId === rowId;

                                return (
                                    <tr
                                        key={rowId}
                                        onClick={() => onRowClick?.(row)}
                                        className={cn(
                                            "cursor-pointer transition-colors",
                                            isHighlighted
                                                ? "bg-blue-100 dark:bg-blue-900/30"
                                                : "hover:bg-gray-50 dark:hover:bg-gray-800"
                                        )}
                                    >
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
// Component: ExamRoomSchedulePage
// ========================================
const ExamRoomSchedulePage = ({ maHK, maDV, maHP, tenHP }) => {
    const { closeTab, tabs, activeTabId } = useTabStore();

    // State cho thông tin học phần
    const [courseInfo, setCourseInfo] = useState(null);

    // State cho lần thi
    const [examType, setExamType] = useState(1);

    // State cho dữ liệu
    const [examRooms, setExamRooms] = useState([]);
    const [assignedStudents, setAssignedStudents] = useState([]);

    // State cho loading
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // State cho selection
    const [selectedRoom, setSelectedRoom] = useState(null);

    // State cho toggle DS5
    const [showStudentList, setShowStudentList] = useState(false);

    // State cho modal
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const fetchExamRooms = useCallback(async () => {
        setLoadingRooms(true);
        try {
            const response = await axiosInstance.get('/exam-room-management/exam-rooms', {
                params: { maHK, maDV, maHP, examType }
            });
            setExamRooms(response.data);
            // Task 8.2.2: Auto-select phòng cuối cùng khi mở trang (DS4)
            if (response.data.length > 0 && !selectedRoom) {
                setSelectedRoom(response.data[response.data.length - 1].MaPT);
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
        setLoadingStudents(true);
        try {
            const response = await axiosInstance.get('/exam-room-management/assigned-students', {
                params: { maPT: selectedRoom, examType, maHK, maHP }
            });
            setAssignedStudents(response.data);
        } catch (error) {
            toast.error('Không thể tải danh sách sinh viên.');
        } finally {
            setLoadingStudents(false);
        }
    }, [selectedRoom, examType, maHK, maHP]);

    // ========================================
    // Effects
    // ========================================
    useEffect(() => {
        fetchCourseInfo();
    }, [fetchCourseInfo]);

    useEffect(() => {
        setSelectedRoom(null);
        fetchExamRooms();
    }, [examType]);

    useEffect(() => {
        if (showStudentList) {
            fetchAssignedStudents();
        }
    }, [selectedRoom, showStudentList, fetchAssignedStudents]);

    // ========================================
    // Handlers
    // ========================================
    const handleOpenModal = () => {
        if (!selectedRoom) {
            toast.error('Vui lòng chọn phòng thi.');
            return;
        }
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleModalSave = () => {
        setIsModalOpen(false);
        fetchExamRooms();
    };

    const handlePrint = async () => {
        if (!selectedRoom) {
            toast.error('Vui lòng chọn phòng thi.');
            return;
        }

        // Lấy danh sách sinh viên nếu chưa có
        let students = assignedStudents;
        if (students.length === 0) {
            try {
                const response = await axiosInstance.get('/exam-room-management/assigned-students', {
                    params: { maPT: selectedRoom, examType, maHK, maHP }
                });
                students = response.data;
            } catch (error) {
                toast.error('Không thể tải danh sách sinh viên.');
                return;
            }
        }

        // Tạo PDF
        const pdfBlob = await generateExamRoomListPDF({
            students,
            roomData: selectedRoomData,
            courseInfo,
            examType
        });

        if (pdfBlob) {
            openOrDownloadPDF(pdfBlob, `DS_DuThi_${selectedRoomData?.TenPhongthi || 'PhongThi'}.pdf`);
        }
    };

    const handleExport = async () => {
        if (!selectedRoom) {
            toast.error('Vui lòng chọn phòng thi.');
            return;
        }

        // Lấy danh sách sinh viên nếu chưa có
        let students = assignedStudents;
        if (students.length === 0) {
            try {
                const response = await axiosInstance.get('/exam-room-management/assigned-students', {
                    params: { maPT: selectedRoom, examType, maHK, maHP }
                });
                students = response.data;
            } catch (error) {
                toast.error('Không thể tải danh sách sinh viên.');
                return;
            }
        }

        // Sắp xếp: Lớp SH → Tên → Họ lót → Ngày sinh
        const sortedStudents = [...students].sort((a, b) => {
            const lopA = (a.LopSH || a.Tenlop || '').toLowerCase();
            const lopB = (b.LopSH || b.Tenlop || '').toLowerCase();
            if (lopA !== lopB) return lopA.localeCompare(lopB, 'vi');
            const tenA = (a.Ten || '').toLowerCase();
            const tenB = (b.Ten || '').toLowerCase();
            if (tenA !== tenB) return tenA.localeCompare(tenB, 'vi');
            const holotA = (a.Holot || '').toLowerCase();
            const holotB = (b.Holot || '').toLowerCase();
            if (holotA !== holotB) return holotA.localeCompare(holotB, 'vi');
            return new Date(a.Ngaysinh) - new Date(b.Ngaysinh);
        });

        // Format dữ liệu cho Excel
        const examTypeText = examType === 0 ? 'Giữa kỳ' : examType === 1 ? 'Cuối kỳ L1' : 'Cuối kỳ L2';
        const excelData = sortedStudents.map((sv, idx) => ({
            'Stt': idx + 1,
            'Mã số': sv.Maso || '',
            'Họ lót': sv.Holot || '',
            'Tên': sv.Ten || '',
            'Ngày sinh': sv.Ngaysinh ? moment(sv.Ngaysinh).format('DD/MM/YYYY') : '',
            'Lớp SH': sv.LopSH || sv.Tenlop || ''
        }));

        exportToExcel({
            data: excelData,
            filename: `DS_DuThi_${selectedRoomData?.TenPhongthi || 'PhongThi'}`,
            mainTitle: 'DANH SÁCH DỰ THI',
            subTitle: `Học phần: ${courseInfo?.TenHP || ''} - Phòng thi: ${selectedRoomData?.TenPhongthi || ''} - Lần thi: ${examTypeText} - Học kỳ: ${courseInfo?.TenHK || ''} (${courseInfo?.Namhoc || ''})`
        });

        toast.success('Đã xuất danh sách ra Excel!');
    };

    // ========================================
    // Column definitions
    // ========================================
    const roomColumns = useMemo(() => [
        { accessor: 'Stt', header: 'STT', className: 'text-center w-10', cell: (row, index) => index + 1 },
        { accessor: 'TenPhongthi', header: 'Tên phòng thi' },
        { accessor: 'SoLuong', header: 'SL', className: 'text-center w-12' },
        { accessor: 'Ngaythi', header: 'Ngày thi', cell: (row) => formatDate(row.Ngaythi) },
        { accessor: 'Giothi', header: 'Giờ', className: 'text-center w-16' },
        { accessor: 'CBCoithi1', header: 'CB coi thi 1' },
        { accessor: 'CBCoithi2', header: 'CB coi thi 2' },
        { accessor: 'Diadiem', header: 'Địa điểm' },
    ], []);

    const studentColumns = useMemo(() => [
        { accessor: 'Stt', header: 'STT', className: 'text-center w-10', cell: (row, index) => index + 1 },
        { accessor: 'Maso', header: 'Mã số', className: 'font-mono' },
        { accessor: 'Holot', header: 'Họ lót' },
        { accessor: 'Ten', header: 'Tên' },
        { accessor: 'Ngaysinh', header: 'Ngày sinh', cell: (row) => formatDate(row.Ngaysinh) },
        { accessor: 'TenLHP', header: 'Lớp HP' },
        { accessor: 'LopSH', header: 'Lớp SH' },
    ], []);

    // ========================================
    // Lấy thông tin phòng thi được chọn
    // ========================================
    const selectedRoomData = useMemo(() => {
        return examRooms.find(r => r.MaPT === selectedRoom);
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
                        PHÒNG THI
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {courseInfo?.TenHP || tenHP} ({courseInfo?.TenHK || ''})
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Combobox Lần thi */}
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
                </div>
            </div>

            {/* Toolbar buttons */}
            <div className="flex-shrink-0 flex gap-2">
                <button
                    onClick={handleOpenModal}
                    disabled={!selectedRoom}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Calendar className="w-4 h-4" />
                    <span>Lịch coi thi</span>
                </button>
                <button
                    onClick={handlePrint}
                    disabled={!selectedRoom}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Printer className="w-4 h-4" />
                    <span>In danh sách</span>
                </button>
                <button
                    onClick={handleExport}
                    disabled={!selectedRoom}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Xuất danh sách</span>
                </button>
            </div>

            {/* Main content */}
            <div className="flex-grow flex flex-col gap-4 min-h-0 overflow-auto">
                {/* DS4: Danh sách phòng thi */}
                <div className="flex-shrink-0">
                    <DataTable
                        title={`DS4: Danh sách phòng thi (${examRooms.length})`}
                        columns={roomColumns}
                        data={examRooms}
                        onRowClick={(row) => setSelectedRoom(row.MaPT)}
                        highlightedRowId={selectedRoom}
                        uniqueKeyField="MaPT"
                        loading={loadingRooms}
                        emptyMessage="Chưa có phòng thi"
                        maxHeight="250px"
                        boldRows={true}
                    />

                    {/* Toggle button */}
                    <div className="mt-2">
                        <button
                            onClick={() => setShowStudentList(!showStudentList)}
                            disabled={!selectedRoom}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                                showStudentList
                                    ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300"
                                    : "bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300",
                                !selectedRoom && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {showStudentList ? (
                                <>
                                    <EyeOff className="w-4 h-4" />
                                    <span>Ẩn danh sách sinh viên</span>
                                    <ChevronUp className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    <Eye className="w-4 h-4" />
                                    <span>Hiện danh sách sinh viên</span>
                                    <ChevronDown className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* DS5: Danh sách sinh viên (toggle) */}
                {showStudentList && selectedRoom && (
                    <div className="flex-grow">
                        <DataTable
                            title={`DS5: Sinh viên phòng ${selectedRoomData?.TenPhongthi || ''} (${assignedStudents.length})`}
                            columns={studentColumns}
                            data={assignedStudents}
                            uniqueKeyField="MaSV"
                            loading={loadingStudents}
                            emptyMessage="Chưa có sinh viên trong phòng thi này"
                            className="flex-grow"
                        />
                    </div>
                )}
            </div>

            {/* Modal Cập nhật lịch coi thi */}
            {isModalOpen && selectedRoom && (
                <ExamScheduleModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onSave={handleModalSave}
                    maPT={selectedRoom}
                    examType={examType}
                    roomData={selectedRoomData}
                    maHK={maHK}
                    maHP={maHP}
                />
            )}
        </div>
    );
};

export default ExamRoomSchedulePage;
