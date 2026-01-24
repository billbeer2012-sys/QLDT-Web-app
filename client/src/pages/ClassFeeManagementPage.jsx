/*
 * Đường dẫn file: D:\QLDT-app\client\src\pages\ClassFeeManagementPage.jsx
 * Cập nhật: 25/10/2025
 * Tóm tắt: Bổ sung log khi mở trang
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import { Loader, AlertCircle, Search, Users, FileDown, Settings2, BookCopy, GraduationCap, School, Wallet, CalendarDays, UserCheck, Check, FileSpreadsheet, FileText, Info, ChevronsUpDown, Filter, DollarSign, RefreshCw, Paperclip, ClipboardPaste, X } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '../lib/utils';
import moment from 'moment';
import { exportToExcel, exportToCSV } from '../lib/excelExporter.js';
import useAuthStore from '../store/authStore';
import SemesterFeeModal from '../features/class-fee-management/SemesterFeeModal';
import ResitAndRetakeFeeModal from '../features/class-fee-management/ResitAndRetakeFeeModal';
import OtherFeeCollectionModal from '../features/class-fee-management/OtherFeeCollectionModal';
//Bước 1: Bổ sung Import hook
import { usePageLogger } from '../hooks/usePageLogger';

// --- CẤU HÌNH VÀ HÀM HỖ TRỢ ---
const formatCurrency = (value) => { if (value === null || value === undefined) return ''; const num = Number(value); if (isNaN(num)) return ''; if (num === 0) return '0'; return num.toLocaleString('vi-VN'); };
const parseCurrency = (value) => { if (typeof value !== 'string') return value; const num = Number(value.replace(/[^0-9]/g, '')); return isNaN(num) ? 0 : num; };
const statusMap = { 0: { text: 'Đang học', color: 'text-green-600 dark:text-green-400' }, 1: { text: 'Bảo lưu', color: 'text-yellow-600 dark:text-yellow-400' }, 2: { text: 'Thôi học', color: 'text-red-600 dark:text-red-400' }, 3: { text: 'Tốt nghiệp', color: 'text-blue-600 dark:text-blue-400' },};
const ALL_COLUMNS = [ { key: 'Tinhtrang', label: 'Tình trạng', defaultVisible: true, align: 'left' }, { key: 'Maso', label: 'Mã số', defaultVisible: true, align: 'left' }, { key: 'Holot', label: 'Họ lót', defaultVisible: true, align: 'left' }, { key: 'Ten', label: 'Tên', defaultVisible: true, align: 'left' }, { key: 'Gioitinh', label: 'Nữ', defaultVisible: false, align: 'center' }, { key: 'Ngaysinh', label: 'Ngày sinh', defaultVisible: false, align: 'center' }, { key: 'HocphiQD', label: 'HP quy định', defaultVisible: false, colorClass: 'text-cyan-600 dark:text-cyan-400', align: 'right', isEditable: true }, { key: 'Miengiam', label: 'HP miễn giảm', defaultVisible: false, colorClass: 'text-cyan-600 dark:text-cyan-400', align: 'right', isEditable: true }, { key: 'Phainop', label: 'HP phải nộp', defaultVisible: true, colorClass: 'text-cyan-600 dark:text-cyan-400', align: 'right', isEditable: true }, { key: 'HP_DaThu', label: 'HP đã thu', defaultVisible: true, colorClass: 'text-indigo-600 dark:text-indigo-400', align: 'right' }, { key: 'HP_ConNo', label: 'HP còn nợ', defaultVisible: true, align: 'right' }, { key: 'NgayThuHP_Last', label: 'Ngày thu HP', defaultVisible: false, colorClass: 'text-indigo-600 dark:text-indigo-400', align: 'center' }, { key: 'SoCT', label: 'Số phiếu', defaultVisible: false, align: 'center' }, { key: 'Lydo', label: 'Lý do thu', defaultVisible: false, align: 'left' }, { key: 'Hinhthucthanhtoan', label: 'Hình thức thu', defaultVisible: false, align: 'center' }, { key: 'NguoiThu', label: 'Người thu', defaultVisible: false, align: 'left' }, { key: 'SoLanThuHP', label: 'Số lần thu HP', defaultVisible: false, align: 'center' }, { key: 'Thu_HPHL', label: 'Thu HPHL', defaultVisible: true, bgColorClass: 'bg-amber-50 dark:bg-amber-900/40', align: 'right', hasDetails: true, maKT: '666' }, { key: 'SoLanThuHPHL', label: 'Số HpHL', defaultVisible: false, align: 'center' }, { key: 'Thu_LPTL', label: 'Thu LPTL', defaultVisible: true, bgColorClass: 'bg-rose-50 dark:bg-rose-900/40', align: 'right', hasDetails: true, maKT: '777' }, { key: 'SoLanThuLPTL', label: 'Số HpTL', defaultVisible: false, align: 'center' }, { key: 'Thu_Khac', label: 'Thu Khác', defaultVisible: true, bgColorClass: 'bg-teal-50 dark:bg-teal-900/40', align: 'right', hasDetails: true, maKT: '000' }, { key: 'SoLanThuKhac', label: 'Số lần thu', defaultVisible: false, align: 'center' } ];
const EDITABLE_COLUMNS = ['HocphiQD', 'Miengiam', 'Phainop'];


// --- COMPONENT CON ---
const PageNavbar = ({ courses, selectedCourse, onCourseChange, classes, selectedClass, onClassChange, semesters, selectedSemester, onSemesterChange, searchTerm, onSearchChange, loading, onExport, visibleColumns, onVisibilityChange, onOpenSemesterFeeModal, onOpenResitFeeModal, onOpenOtherFeeModal, isActionDisabled }) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 flex-shrink-0"><BookCopy className="w-5 h-5 text-gray-500" /><select value={selectedCourse} onChange={onCourseChange} disabled={loading.courses} className="h-9 px-3 border rounded-md dark:bg-gray-700 bg-white">{loading.courses ? <option>Đang tải...</option> : courses.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                <div className="flex items-center gap-2 flex-shrink-0"><Users className="w-5 h-5 text-gray-500" /><select value={selectedClass} onChange={onClassChange} disabled={loading.classes || classes.length === 0} className="h-9 px-3 border rounded-md dark:bg-gray-700 bg-white">{loading.classes ? <option>Đang tải...</option> : classes.map(c => <option key={c.MaL} value={c.MaL}>{c.Tenlop}</option>)}</select></div>
                <div className="flex items-center gap-2 flex-shrink-0"><CalendarDays className="w-5 h-5 text-gray-500" /><select value={selectedSemester} onChange={onSemesterChange} disabled={loading.semesters || semesters.length === 0} className="h-9 px-3 border rounded-md dark:bg-gray-700 bg-white">{loading.semesters ? <option>Đang tải...</option> : semesters.map(s => <option key={s.MaHK} value={s.MaHK}>{s.Hocky}</option>)}</select></div>
                <div className="relative flex-grow min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={onSearchChange} className="w-full pl-10 pr-3 h-9 border rounded-md dark:bg-gray-700" /></div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger disabled={isActionDisabled} className="h-9 px-4 flex items-center gap-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400">
                        <DollarSign className="w-4 h-4" /> <span className="font-semibold">Lập phiếu thu</span> <ChevronsUpDown className="w-4 h-4 opacity-70" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content align="end" sideOffset={5} className="z-50 min-w-[200px] bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 p-1">
                            <DropdownMenu.Item onSelect={onOpenSemesterFeeModal} className="px-3 py-1.5 text-sm flex items-center gap-2 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed" disabled={isActionDisabled}><Wallet className="w-4 h-4" /> Thu học phí học kỳ</DropdownMenu.Item>
                            <DropdownMenu.Item onSelect={onOpenResitFeeModal} className="px-3 py-1.5 text-sm flex items-center gap-2 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed" disabled={isActionDisabled}><RefreshCw className="w-4 h-4" /> Thu HP học lại, LP thi lại</DropdownMenu.Item>
                            <DropdownMenu.Item onSelect={onOpenOtherFeeModal} className="px-3 py-1.5 text-sm flex items-center gap-2 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed" disabled={isActionDisabled}><Paperclip className="w-4 h-4" /> Khoản thu khác</DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger className="h-9 w-9 flex items-center justify-center bg-green-600 text-white hover:bg-green-700 dark:bg-gray-600 rounded-md  dark:hover:bg-gray-500"><FileDown className="w-5 h-5" /></DropdownMenu.Trigger>
                    <DropdownMenu.Portal><DropdownMenu.Content align="end" sideOffset={5} className="z-50 min-w-[150px] bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 p-1"><DropdownMenu.Item onSelect={() => onExport('excel')} className="px-3 py-1.5 text-sm flex items-center gap-2 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"><FileSpreadsheet className="w-4 h-4 text-green-600" /> Excel</DropdownMenu.Item><DropdownMenu.Item onSelect={() => onExport('csv')} className="px-3 py-1.5 text-sm flex items-center gap-2 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"><FileText className="w-4 h-4 text-blue-600" /> CSV</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal>
                </DropdownMenu.Root>
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger className="h-9 w-9 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"><Settings2 className="w-5 h-5" /></DropdownMenu.Trigger>
                    <DropdownMenu.Portal><DropdownMenu.Content align="end" sideOffset={5} className="z-50 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 p-2 max-h-96 overflow-y-auto">{ALL_COLUMNS.map(col => <DropdownMenu.CheckboxItem key={col.key} checked={visibleColumns[col.key]} onCheckedChange={() => onVisibilityChange(col.key)} className="px-2 py-1.5 text-sm flex items-center gap-2 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"><DropdownMenu.ItemIndicator><Check className="w-4 h-4" /></DropdownMenu.ItemIndicator>{col.label}</DropdownMenu.CheckboxItem>)}</DropdownMenu.Content></DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>
        </div>
    );
};
const EditableCell = ({ student, fieldName, value, onSave, onFocus, canEdit, isPreview }) => { const [isEditing, setIsEditing] = useState(false); const [currentValue, setCurrentValue] = useState(value); const inputRef = useRef(null); useEffect(() => { setCurrentValue(value); }, [value]); useEffect(() => { if (isEditing) { inputRef.current?.focus(); inputRef.current?.select(); } }, [isEditing]); const handleDoubleClick = () => { if (canEdit) setIsEditing(true); }; const handleSave = async () => { if (String(currentValue) !== String(value)) { const success = await onSave(student.MaSV, student.Maso, fieldName, currentValue, value); if (success) setIsEditing(false); } else { setIsEditing(false); } }; const handleKeyDown = (e) => { if (e.key === 'Enter') handleSave(); else if (e.key === 'Escape') { setCurrentValue(value); setIsEditing(false); } }; if (isEditing) { return <input ref={inputRef} type="text" value={formatCurrency(currentValue)} onChange={(e) => setCurrentValue(parseCurrency(e.target.value))} onBlur={handleSave} onKeyDown={handleKeyDown} className="w-full px-1 py-0.5 text-right bg-yellow-100 dark:bg-yellow-900 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />; } return <span onDoubleClick={handleDoubleClick} onFocus={onFocus} tabIndex={-1} className={cn("inline-block w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-sm", canEdit && "hover:bg-yellow-100 dark:hover:bg-yellow-900/50 cursor-pointer p-1 -m-1", isPreview && "bg-yellow-200 dark:bg-yellow-700/50")}>{formatCurrency(value)}</span>; };
const FeeDetailPopover = ({ maSV, maHK, maKT, children }) => { const [details, setDetails] = useState([]); const [isLoading, setIsLoading] = useState(false); const [isOpen, setIsOpen] = useState(false); const fetchDetails = useCallback(async () => { if (!isOpen) return; setIsLoading(true); setDetails([]); try { const res = await axiosInstance.get('/class-fee-management/fee-details', { params: { maSV, maHK, maKT } }); setDetails(res.data); } catch (error) { toast.error("Lỗi khi tải chi tiết khoản thu."); } finally { setIsLoading(false); } }, [isOpen, maSV, maHK, maKT]); useEffect(() => { if(isOpen) fetchDetails(); }, [isOpen, fetchDetails]); return <Popover.Root open={isOpen} onOpenChange={setIsOpen}><Popover.Trigger asChild>{children}</Popover.Trigger><Popover.Portal><Popover.Content sideOffset={5} className="z-50 w-96 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 p-3"><h4 className="font-bold text-center mb-2 border-b pb-2 dark:border-gray-600">Chi tiết các lần thu</h4>{isLoading ? <div className="flex justify-center p-4"><Loader className="animate-spin" /></div> : details.length > 0 ? (<div className="max-h-60 overflow-y-auto"><table className="w-full text-sm">

{/* BẮT ĐẦU CẬP NHẬT GIAO DIỆN TOOLTIP */}
    <thead className="font-semibold bg-gray-100 dark:bg-gray-700">
        <tr >
            <th className="p-1 text-center w-8">STT</th>
            <th className="p-1 text-left">Nội dung</th>
            <th className="p-1 text-center">Số phiếu</th>
            <th className="p-1 text-center">Ngày nộp</th>
            <th className="p-1 text-right">Số tiền</th>
        </tr>
    </thead>
    <tbody>
        {details.map((item, index) => (
            <tr key={index} className="border-b dark:border-gray-700 last:border-b-0">
                <td className="p-1 text-center">{index + 1}</td>
                <td className="p-1">{item.Lydo}</td>
                <td className="p-1 text-center">{item.SoCT}</td>
                <td className="p-1 text-center">{moment(item.Ngaynop).format('DD/MM/YY')}</td>
                <td className="p-1 text-right">{formatCurrency(item.Sotienthu)}</td>
            </tr>
        ))}
    </tbody>
    {/* KẾT THÚC CẬP NHẬT GIAO DIỆN TOOLTIP */}

</table></div>) : <p className="text-center text-gray-500 p-4">Không có dữ liệu.</p>}<Popover.Arrow className="fill-current text-white dark:text-gray-800" /></Popover.Content></Popover.Portal></Popover.Root>; };


// --- COMPONENT CHÍNH ---
const ClassFeeManagementPage = () => {
    //Bước 2: Gọi ghi log
	// Tên '...' sẽ được ghi vào cột 'Cuaso'
	usePageLogger('Khoản thu Lớp SH');

	// --- State gốc ---
    const [courses, setCourses] = useState([]);
    const [classes, setClasses] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [students, setStudents] = useState([]);
    const [classDetails, setClassDetails] = useState({});
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState({ courses: true, classes: false, semesters: false, students: false });
    const [error, setError] = useState('');
    const [visibleColumns, setVisibleColumns] = useState(ALL_COLUMNS.reduce((acc, col) => ({ ...acc, [col.key]: col.defaultVisible }), {}));
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [isSemesterFeeModalOpen, setIsSemesterFeeModalOpen] = useState(false);
    const [isResitFeeModalOpen, setIsResitFeeModalOpen] = useState(false);
    const [isOtherFeeModalOpen, setIsOtherFeeModalOpen] = useState(false);
    
    // --- State cho tính năng Dán từ Excel ---
    const [focusedCell, setFocusedCell] = useState(null);
    const [pastePreview, setPastePreview] = useState([]);
    const tableContainerRef = useRef(null);

    const { user } = useAuthStore();
    const canManageFees = useMemo(() => user?.isKetoan || user?.isAdmin, [user]);

    // --- useEffect gốc ---
    useEffect(() => { setLoading(p => ({ ...p, courses: true })); axiosInstance.get('/class-fee-management/courses-for-fees').then(res => { setCourses(res.data); if (res.data.length > 0) setSelectedCourse(res.data[0].value); }).catch(() => toast.error("Lỗi khi tải DS khóa học.")).finally(() => setLoading(p => ({ ...p, courses: false }))); }, []);
    useEffect(() => { if (!selectedCourse) return; setClasses([]); setSemesters([]); setStudents([]); setSelectedClass(''); setSelectedSemester(''); setSelectedStudentId(null); setLoading(p => ({ ...p, classes: true })); axiosInstance.get('/class-fee-management/classes-for-fees', { params: { courseYear: selectedCourse } }).then(res => { setClasses(res.data); if (res.data.length > 0) setSelectedClass(res.data[0].MaL); }).catch(() => toast.error("Lỗi khi tải DS lớp.")).finally(() => setLoading(p => ({ ...p, classes: false }))); }, [selectedCourse]);
    useEffect(() => { if (!selectedClass) return; setSemesters([]); setStudents([]); setSelectedSemester(''); setSelectedStudentId(null); setLoading(p => ({ ...p, semesters: true })); axiosInstance.get('/class-fee-management/semesters', { params: { maLop: selectedClass } }).then(res => { setSemesters(res.data.semesters); const defaultSemester = res.data.defaultSemester || (res.data.semesters.length > 0 ? res.data.semesters[0].MaHK : ''); setSelectedSemester(defaultSemester); }).catch(() => toast.error("Lỗi khi tải DS học kỳ.")).finally(() => setLoading(p => ({ ...p, semesters: false }))); }, [selectedClass]);

    const fetchStudentData = useCallback(() => {
        if (!selectedClass || !selectedSemester) return;
        setLoading(p => ({ ...p, students: true })); 
        setError('');
        setPastePreview([]);
        axiosInstance.get('/class-fee-management/student-fees', { params: { maLop: selectedClass, maHK: selectedSemester } })
            .then(res => { 
                setStudents(res.data);
                setSelectedStudentId(prevId => {
                    if (prevId && !res.data.some(s => s.MaSV === prevId)) return null;
                    return prevId;
                });
            })
            .catch(err => setError(err.response?.data?.message || "Lỗi tải dữ liệu."))
            .finally(() => setLoading(p => ({ ...p, students: false })));
        axiosInstance.get('/class-management/class-data', { params: { maL: selectedClass } }).then(res => setClassDetails(res.data.details)).catch(err => console.error("Lỗi tải chi tiết lớp: ", err));
    }, [selectedClass, selectedSemester]);
    
    useEffect(() => { if (!isSemesterFeeModalOpen && !isResitFeeModalOpen && !isOtherFeeModalOpen) { fetchStudentData(); } }, [fetchStudentData, isSemesterFeeModalOpen, isResitFeeModalOpen, isOtherFeeModalOpen]);

    const filteredStudents = useMemo(() => students.filter(s => !searchTerm || (s.Holot + ' ' + s.Ten).toLowerCase().includes(searchTerm.toLowerCase()) || s.Maso?.toLowerCase().includes(searchTerm.toLowerCase())), [students, searchTerm]);
    const selectedStudent = useMemo(() => students.find(s => s.MaSV === selectedStudentId), [students, selectedStudentId]);
    const visibleColumnsList = useMemo(() => ALL_COLUMNS.filter(col => visibleColumns[col.key]), [visibleColumns]);

    // --- Logic cho tính năng Dán từ Excel ---
    const handlePaste = useCallback((event) => {
        if (!focusedCell || !canManageFees) return;
        event.preventDefault();
        const pasteData = event.clipboardData.getData('text/plain');
        const rows = pasteData.trim().split('\n');
        const updates = [];
        const visibleEditableCols = visibleColumnsList.filter(c => EDITABLE_COLUMNS.includes(c.key));
        const startColIndex = visibleEditableCols.findIndex(c => c.key === focusedCell.colKey);
        if (startColIndex === -1) { toast.error("Vui lòng chọn một ô trong các cột HP quy định, HP miễn giảm, hoặc HP phải nộp."); return; }
        rows.forEach((row, rowIndex) => {
            const targetRowIndex = focusedCell.rowIndex + rowIndex;
            if (targetRowIndex >= filteredStudents.length) return;
            const student = filteredStudents[targetRowIndex];
            const cells = row.split('\t');
            cells.forEach((cell, cellIndex) => {
                const targetColIndex = startColIndex + cellIndex;
                if (targetColIndex >= visibleEditableCols.length) return;
                const colKey = visibleEditableCols[targetColIndex].key;
                const parsedValue = parseCurrency(cell);
                if (!isNaN(parsedValue)) { updates.push({ MaSV: student.MaSV, colKey: colKey, newValue: parsedValue, }); }
            });
        });
        if (updates.length > 0) { setPastePreview(updates); } 
        else { toast.error("Không tìm thấy dữ liệu số hợp lệ để dán."); }
    }, [focusedCell, canManageFees, filteredStudents, visibleColumnsList]);

    useEffect(() => { const tableEl = tableContainerRef.current; if (tableEl) { tableEl.addEventListener('paste', handlePaste); return () => tableEl.removeEventListener('paste', handlePaste); } }, [handlePaste]);
    
    const handleConfirmPaste = async () => {
        const updatesPayload = pastePreview.reduce((acc, item) => {
            let studentUpdate = acc.find(u => u.MaSV === item.MaSV);
            if (!studentUpdate) { studentUpdate = { MaSV: item.MaSV }; acc.push(studentUpdate); }
            studentUpdate[item.colKey] = item.newValue;
            return acc;
        }, []);
        try {
            await toast.promise(
                axiosInstance.patch('/class-fee-management/student-fees/batch-update', { maHK: selectedSemester, updates: updatesPayload }),
                { loading: 'Đang cập nhật hàng loạt...', success: (res) => res.data.message, error: (err) => err.response?.data?.message || 'Cập nhật thất bại.' }
            );
            fetchStudentData(); // Tải lại dữ liệu sau khi thành công
        } finally {
            setPastePreview([]); // Xóa preview dù thành công hay thất bại
        }
    };
    
    const handleCancelPaste = () => { setPastePreview([]); };

    const studentsWithPreview = useMemo(() => {
        if (pastePreview.length === 0) return filteredStudents;
        return filteredStudents.map(student => {
            const updatesForStudent = pastePreview.filter(p => p.MaSV === student.MaSV);
            if (updatesForStudent.length === 0) return student;
            const updatedStudent = { ...student };
            updatesForStudent.forEach(update => { updatedStudent[update.colKey] = update.newValue; });
            return updatedStudent;
        });
    }, [filteredStudents, pastePreview]);

    // --- Hàm xử lý gốc ---
    const handleSaveFee = async (maSV, maso, fieldName, newValue, oldValue) => {
        const valueToSave = newValue === '' ? 0 : parseInt(newValue, 10);
        if (isNaN(valueToSave)) { toast.error("Vui lòng nhập một số hợp lệ."); return false; }
        try {
            await toast.promise(
                axiosInstance.patch('/class-fee-management/student-fee', { maSV, maso, maHK: selectedSemester, fieldName, newValue: valueToSave, oldValue: oldValue ?? 0 }),
                { loading: 'Đang cập nhật...', success: 'Cập nhật thành công!', error: (err) => err.response?.data?.message || 'Cập nhật thất bại.' }
            );
            setStudents(prev => prev.map(s => {
                if (s.MaSV === maSV) {
                    const updated = { ...s, [fieldName]: valueToSave };
                    if (fieldName === 'HocphiQD' || fieldName === 'Miengiam') {
                        const hocphiQD = fieldName === 'HocphiQD' ? valueToSave : updated.HocphiQD;
                        const miengiam = fieldName === 'Miengiam' ? valueToSave : updated.Miengiam;
                        updated.Phainop = (hocphiQD || 0) - (miengiam || 0);
                    }
                    updated.HP_ConNo = updated.Phainop - (updated.HP_DaThu || 0);
                    return updated;
                }
                return s;
            }));
            return true;
        } catch (error) { return false; }
    };
    
    const handleExport = (type) => {
        if (filteredStudents.length === 0) return toast.error("Không có dữ liệu để xuất.");
        const dataToExport = filteredStudents.map((student, index) => {
            const row = { 'STT': index + 1 };
            visibleColumnsList.forEach(col => {
                let value = student[col.key];
                if (col.key === 'Tinhtrang') value = statusMap[student.Tinhtrang]?.text || 'N/A';
                else if (col.key === 'Gioitinh') value = student.Gioitinh ? 'x' : '';
                else if (col.key.includes('Ngay') && value) value = moment(value).format('DD/MM/YYYY');
                row[col.label] = value;
            });
            return row;
        });
        const semesterName = semesters.find(s => s.MaHK === selectedSemester)?.Hocky || '';
        const className = classes.find(c => c.MaL === selectedClass)?.Tenlop || '';
        const mainTitle = `DANH SÁCH THU HỌC PHÍ: ${semesterName.toUpperCase()}`;
        const subTitle = `Lớp: ${className}`;
        const filename = `HP_${className}_${semesterName}_${moment().format('DDMMYYYY')}`;
        if (type === 'excel') { exportToExcel({ data: dataToExport, filename, mainTitle, subTitle }); toast.success("Đang xuất file Excel..."); } 
        else if (type === 'csv') { exportToCSV({ data: dataToExport, filename }); toast.success("Đang xuất file CSV..."); }
    };

    const totals = useMemo(() => {
        const columnsToSum = ['HocphiQD', 'Miengiam', 'Phainop', 'HP_DaThu', 'HP_ConNo', 'Thu_HPHL', 'Thu_LPTL', 'Thu_Khac'];
        const initialTotals = columnsToSum.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
        if (!filteredStudents || filteredStudents.length === 0) return initialTotals;
        return filteredStudents.reduce((acc, student) => {
            columnsToSum.forEach(key => { acc[key] += Number(student[key]) || 0; });
            return acc;
        }, initialTotals);
    }, [filteredStudents]);

    return (
        <div className="flex flex-col h-[calc(100vh-116px)]">
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex-shrink-0"><h1 className="text-2xl font-bold text-blue-800 dark:text-white text-center uppercase">KHOẢN THU SINH VIÊN LỚP SINH HOẠT</h1></div>
            <div className="flex-1 flex flex-col min-h-0 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="p-3 border-b dark:border-gray-700 flex-shrink-0">
                        <PageNavbar {...{ courses, selectedCourse, classes, selectedClass, semesters, selectedSemester, searchTerm, loading, visibleColumns, onCourseChange: e => setSelectedCourse(e.target.value), onClassChange: e => setSelectedClass(e.target.value), onSemesterChange: e => setSelectedSemester(e.target.value), onSearchChange: e => setSearchTerm(e.target.value), onExport: handleExport, onVisibilityChange: key => setVisibleColumns(p => ({ ...p, [key]: !p[key] })), onOpenSemesterFeeModal: () => { if(selectedStudentId) setIsSemesterFeeModalOpen(true) }, onOpenResitFeeModal: () => { if(selectedStudentId) setIsResitFeeModalOpen(true) }, onOpenOtherFeeModal: () => { if(selectedStudentId) setIsOtherFeeModalOpen(true) }, isActionDisabled: !selectedStudentId || !canManageFees }} />
                        {/* --- CẢI TIẾN GIAO DIỆN XÁC NHẬN --- */}
                        {pastePreview.length > 0 && (
                            <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 rounded-md flex justify-between items-center animate-fade-in">
                                <div className="flex items-center gap-2">
                                    <ClipboardPaste className="w-5 h-5 text-yellow-700 dark:text-yellow-300" />
                                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                                        Xem trước: Sẵn sàng cập nhật {pastePreview.length} ô dữ liệu.
                                    </p>
                                </div>
                                <div>
                                    <button onClick={handleConfirmPaste} className="px-3 py-1 text-sm font-bold text-white bg-green-600 rounded-md hover:bg-green-700 mr-2 transition-colors">
                                        Xác nhận
                                    </button>
                                    <button onClick={handleCancelPaste} className="p-1 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors">
                                        <X className="w-4 h-4 text-yellow-800 dark:text-yellow-200" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div ref={tableContainerRef} className="flex-grow min-h-0 overflow-auto">
                        {loading.students ? <div className="flex items-center justify-center h-full"><Loader className="w-10 h-10 animate-spin text-blue-600" /></div> : error ? <div className="flex flex-col items-center justify-center h-full text-center p-10 text-red-600"><AlertCircle className="w-12 h-12 mb-4" /><p className="font-semibold">{error}</p></div> : (
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-row-hover">
                                <thead className="bg-gray-100 dark:bg-gray-700 font-semibold sticky top-0 z-10"><tr><th className="px-2 py-2 text-center text-xs uppercase w-12">TT</th>{visibleColumnsList.map(col => <th key={col.key} className={cn("px-4 py-2 text-xs uppercase tracking-wider", `text-${col.align}`)}>{col.label}</th>)}</tr></thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {studentsWithPreview.map((s, index) => (
                                        <tr key={s.MaSV} onClick={() => setSelectedStudentId(s.MaSV)} className={cn("cursor-pointer", selectedStudentId === s.MaSV ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50')}>
                                            <td className="px-2 py-2 text-center text-sm w-12">{index + 1}</td>
                                            {visibleColumnsList.map(col => {
                                                const value = s[col.key]; let cellContent; const isSelected = selectedStudentId === s.MaSV;
                                                const isPreview = pastePreview.some(p => p.MaSV === s.MaSV && p.colKey === col.key);
                                                if (col.isEditable) cellContent = <EditableCell student={s} fieldName={col.key} value={value} onSave={handleSaveFee} canEdit={canManageFees} onFocus={() => setFocusedCell({ rowIndex: index, colKey: col.key })} isPreview={isPreview} />;
                                                else if (col.hasDetails && value > 0) cellContent = <FeeDetailPopover maSV={s.MaSV} maHK={selectedSemester} maKT={col.maKT}><span className="flex items-center justify-end gap-1 cursor-pointer border-b border-dotted border-gray-400 dark:border-gray-500 hover:text-blue-500">{formatCurrency(value)} <Info className="w-3 h-3 text-gray-400" /></span></FeeDetailPopover>;
                                                else if (col.key === 'Tinhtrang') { const statusColor = isSelected ? '' : statusMap[value]?.color; cellContent = <span className={cn("font-medium", statusColor)}>{statusMap[value]?.text || 'N/A'}</span>; }
                                                else if (col.key === 'Gioitinh') cellContent = s.Gioitinh ? <Check className="w-4 h-4 mx-auto text-gray-600" /> : '';
                                                else if (col.key.includes('Ngay') && value) cellContent = moment(value).format('DD/MM/YYYY');
                                                else if (typeof value === 'number') cellContent = formatCurrency(value);
                                                else cellContent = value;
                                                let specialStyling = "";
                                                if (isSelected) specialStyling = "font-semibold text-blue-800 dark:text-blue-300";
                                                else if (col.key === 'HP_ConNo' && value > 0) specialStyling = "font-bold bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-200";
                                                else if (col.key === 'HP_ConNo' && value < 0) specialStyling = "font-bold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200";
                                                else specialStyling = col.colorClass;
                                                return <td key={col.key} className={cn("px-4 py-2 text-sm whitespace-nowrap", specialStyling, col.bgColorClass, `text-${col.align}`)}>{cellContent}</td>;
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                                {filteredStudents.length > 0 && (
                                <tfoot className="sticky bottom-0 z-10">
                                    <tr className="bg-gray-200 dark:bg-gray-700 font-bold text-sm border-t-2 border-gray-400 dark:border-gray-500">
                                        <td className="px-2 py-2 text-center"></td>
                                        {(() => {
                                            const firstSummableIndex = visibleColumnsList.findIndex(col => totals[col.key] !== undefined);
                                            const colSpan = firstSummableIndex === -1 ? visibleColumnsList.length : firstSummableIndex;
                                            return (
                                                <>
                                                    <td colSpan={colSpan} className="px-4 py-2 text-center uppercase">TỔNG CỘNG</td>
                                                    {visibleColumnsList.slice(firstSummableIndex).map(col => (
                                                        <td key={col.key} className={cn("px-4 py-2", `text-${col.align}`)}>
                                                            {totals[col.key] !== undefined ? formatCurrency(totals[col.key]) : ''}
                                                        </td>
                                                    ))}
                                                </>
                                            )
                                        })()}
                                    </tr>
                                </tfoot>
                                )}
                            </table>
                        )}
                    </div>
                    {!loading.students && students.length > 0 && (<div className="p-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs flex-shrink-0"><div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1"><div><strong><School className="inline w-4 h-4 mr-1"/>Tên nghề:</strong> {classDetails.Dacdiem}</div><div><strong><GraduationCap className="inline w-4 h-4 mr-1"/>Trình độ:</strong> {classDetails.BacDTHienThi} ({classDetails.SoHK} học kỳ)</div><div><strong><UserCheck className="inline w-4 h-4 mr-1"/>CVHT:</strong> {classDetails.CVHT}</div></div></div>)}
                </div>
            </div>
            {isSemesterFeeModalOpen && selectedStudent && <SemesterFeeModal isOpen={isSemesterFeeModalOpen} onClose={() => setIsSemesterFeeModalOpen(false)} studentData={selectedStudent} semesterInfo={{ maHK: selectedSemester, tenHK: semesters.find(s => s.MaHK === selectedSemester)?.Hocky }} classInfo={{ maLop: selectedClass, tenLop: classes.find(c => c.MaL === selectedClass)?.Tenlop }} onSaveSuccess={fetchStudentData} />}
            {isResitFeeModalOpen && selectedStudent && <ResitAndRetakeFeeModal isOpen={isResitFeeModalOpen} onClose={() => setIsResitFeeModalOpen(false)} studentData={selectedStudent} semesterInfo={{ maHK: selectedSemester, tenHK: semesters.find(s => s.MaHK === selectedSemester)?.Hocky }} classInfo={{ maLop: selectedClass, tenLop: classes.find(c => c.MaL === selectedClass)?.Tenlop }} onSaveSuccess={fetchStudentData} />}
            {isOtherFeeModalOpen && selectedStudent && <OtherFeeCollectionModal isOpen={isOtherFeeModalOpen} onClose={() => setIsOtherFeeModalOpen(false)} studentData={selectedStudent} semesterInfo={{ maHK: selectedSemester, tenHK: semesters.find(s => s.MaHK === selectedSemester)?.Hocky }} classInfo={{ maLop: selectedClass, tenLop: classes.find(c => c.MaL === selectedClass)?.Tenlop }} onSaveSuccess={fetchStudentData} />}
            {/* ConfirmationModal không còn được sử dụng ở đây */}
        </div>
    );
};
export default ClassFeeManagementPage;

