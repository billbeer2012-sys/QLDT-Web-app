/*
 * Đường dẫn file: D:\QLDT-app\client\src\pages\ClassManagementPage.jsx
 * Cập nhật: 25/10/2025
 * Tóm tắt: Bổ sung log khi mở trang
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import { Loader, AlertCircle, Search, Users, FileDown, ChevronsUpDown, Eye, Settings2, BookCopy, GraduationCap, School, UserCheck, Wallet, KeyRound, View } from 'lucide-react'; // Bổ sung icon
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../lib/utils';
import moment from 'moment';
import useAuthStore from '../store/authStore';

import { exportToExcel, exportToCSV } from '../lib/excelExporter.js';
import { generateStudentConfirmationPDF } from '../features/class-management/StudentConfirmationGenerator';
import LoanConfirmationOptionsModal from '../features/class-management/LoanConfirmationOptionsModal';
import { generateLoanConfirmationPDF } from '../features/class-management/LoanConfirmationGenerator';
import SignerSelectionModal from '../features/class-management/SignerSelectionModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
//Bước 1: Bổ sung Import hook
import { usePageLogger } from '../hooks/usePageLogger';

// --- CẤU HÌNH VÀ HÀM HỖ TRỢ ---

// BỔ SUNG: Cấu hình chi tiết cho các cột có thể chỉnh sửa
const columnConfigs = {
    // Text inputs
    Maso: { editor: 'text', updateField: 'Maso', adminOnly: true },
    Holot: { editor: 'text', updateField: 'Holot' },
    Ten: { editor: 'text', updateField: 'Ten' },
    Dienthoai: { editor: 'text', updateField: 'Dienthoai' },
    Diachi: { editor: 'text', updateField: 'Diachi' },
    Hokhau: { editor: 'text', updateField: 'Hokhau' },
    SoCMND: { editor: 'text', updateField: 'SoCMND' },
    Ghichu: { editor: 'text', updateField: 'Ghichu' },
    HotenBo: { editor: 'text', updateField: 'HotenBo' },
    NghenghiepBo: { editor: 'text', updateField: 'NghenghiepBo' },
    GhichuBo: { editor: 'text', updateField: 'GhichuBo' },
    HotenMe: { editor: 'text', updateField: 'HotenMe' },
    NghenghiepMe: { editor: 'text', updateField: 'NghenghiepMe' },
    GhichuMe: { editor: 'text', updateField: 'GhichuMe' },
    Diachitamtru: { editor: 'text', updateField: 'Diachitamtru' },
    Chunhatamtru: { editor: 'text', updateField: 'Chunhatamtru' },
    Dienthoaitamtru: { editor: 'text', updateField: 'Dienthoaitamtru' },
    Noilamviec: { editor: 'text', updateField: 'Noilamviec' },
    Miengiam: { editor: 'number', updateField: 'Miengiam' }, // BỔ SUNG: Cấu hình cho cột Miễn giảm

    // Checkbox
    Gioitinh: { editor: 'checkbox', updateField: 'Gioitinh' },

    // Date inputs
    Ngaysinh: { editor: 'date', updateField: 'Ngaysinh' },
    NgaycapCMND: { editor: 'date', updateField: 'NgaycapCMND' },

    // Selects with Foreign Keys
    Dantoc: { editor: 'select', updateField: 'MaDT', lookupKey: 'danToc', valueField: 'MaDT', labelField: 'Dantoc' },
    DTCS: { editor: 'select', updateField: 'MaDTCS', lookupKey: 'doiTuongChinhSach', valueField: 'MaDTCS', labelField: 'DTCS' },
    Khuvuc: { editor: 'select', updateField: 'MaKV', lookupKey: 'khuVuc', valueField: 'MaKV', labelField: 'Khuvuc' },
    Tongiao: { editor: 'select', updateField: 'MaTG', lookupKey: 'tonGiao', valueField: 'MaTG', labelField: 'Tongiao' },

    // Selects with simple text values
    Noisinh: { editor: 'select-simple', updateField: 'Noisinh', lookupKey: 'tinhThanh' }, 
    NoicapCMND: { editor: 'select-simple', updateField: 'NoicapCMND', lookupKey: 'noiCapCCCD' },
    TrinhdoVH: { editor: 'select-simple', updateField: 'TrinhdoVH', lookupKey: 'trinhDoVanHoa' },
    Hinhthuctamtru: { editor: 'select-simple', updateField: 'Hinhthuctamtru', lookupKey: 'hinhThucTamTru' },
};


const ALL_COLUMNS = [
    { key: 'Tinhtrang', label: 'Tình trạng', defaultVisible: true }, { key: 'Maso', label: 'Mã số', defaultVisible: true }, { key: 'Holot', label: 'Họ lót', defaultVisible: true }, { key: 'Ten', label: 'Tên', defaultVisible: true }, { key: 'Gioitinh', label: 'Nữ', defaultVisible: true }, { key: 'Ngaysinh', label: 'Ngày sinh', defaultVisible: true }, { key: 'Noisinh', label: 'Nơi sinh', defaultVisible: true }, { key: 'Dantoc', label: 'Dân tộc', defaultVisible: true }, { key: 'DTCS', label: 'ĐT chính sách', defaultVisible: true }, { key: 'Dienthoai', label: 'Số điện thoại', defaultVisible: true }, { key: 'TrinhdoVH', label: 'Trình độ VH', defaultVisible: true }, { key: 'Diachi', label: 'Địa chỉ liên lạc', defaultVisible: true }, { key: 'Hokhau', label: 'Hộ khẩu thường trú', defaultVisible: false }, { key: 'Khuvuc', label: 'Khu vực', defaultVisible: false }, { key: 'Tongiao', label: 'Tôn giáo', defaultVisible: false }, { key: 'SoCMND', label: 'Số CCCD', defaultVisible: false }, { key: 'NgaycapCMND', label: 'Ngày cấp CC', defaultVisible: false }, { key: 'NoicapCMND', label: 'Nơi cấp CC', defaultVisible: false },
    // BỔ SUNG: Cột Miễn giảm
    { key: 'Miengiam', label: 'Miễn giảm', defaultVisible: false },
    { key: 'HotenBo', label: 'Họ tên bố', defaultVisible: false }, { key: 'NghenghiepBo', label: 'Nghề nghiệp bố', defaultVisible: false }, { key: 'GhichuBo', label: 'Ghi chú bố', defaultVisible: false }, { key: 'HotenMe', label: 'Họ tên mẹ', defaultVisible: false }, { key: 'NghenghiepMe', label: 'Nghề nghiệp mẹ', defaultVisible: false }, { key: 'GhichuMe', 'label': 'Ghi chú mẹ', defaultVisible: false }, { key: 'Hinhthuctamtru', label: 'Hình thức tạm trú', defaultVisible: false }, { key: 'Diachitamtru', label: 'Địa chỉ tạm trú', defaultVisible: false }, { key: 'Chunhatamtru', label: 'Chủ nhà TT', defaultVisible: false }, { key: 'Dienthoaitamtru', label: 'Điện thoại TT', defaultVisible: false }, { key: 'Noilamviec', label: 'Việc làm', defaultVisible: false }, { key: 'Ghichu', label: 'Ghi chú', defaultVisible: false },
    // BỔ SUNG: Các cột tình trạng
    { key: 'Quyetdinh', label: 'Quyết định', defaultVisible: false },
    { key: 'Ngaybatdau', label: 'Ngày QĐ', defaultVisible: false },
    { key: 'Ngayketthuc', label: 'Kết thúc BL', defaultVisible: false },
    { key: 'Lydo', label: 'Lý do', defaultVisible: false },
];

const statusMap = {
    0: { text: 'Đang học', color: 'text-green-600 dark:text-green-400' },
    1: { text: 'Bảo lưu', color: 'text-yellow-600 dark:text-yellow-400' },
    2: { text: 'Thôi học', color: 'text-red-600 dark:text-red-400' },
    3: { text: 'Tốt nghiệp', color: 'text-blue-600 dark:text-blue-400' },
};


// --- COMPONENT CON ---
const PageNavbar = ({ courses, selectedCourse, onCourseChange, classes, selectedClass, onClassChange, searchTerm, onSearchChange, loading }) => {
    const selectBaseClass = "h-9 px-3 border rounded-md dark:bg-gray-700 bg-white focus:border-blue-500 focus:ring-blue-500";
    const inputBaseClass = "w-full pl-10 pr-3 h-9 border rounded-md dark:bg-gray-700";

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
                <BookCopy className="w-5 h-5 text-gray-500" />
                <select value={selectedCourse} onChange={onCourseChange} disabled={loading.courses} className={selectBaseClass}>
                    {loading.courses ? <option>Đang tải...</option> : courses.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <Users className="w-5 h-5 text-gray-500" />
                <select value={selectedClass} onChange={onClassChange} disabled={loading.classes || classes.length === 0} className={selectBaseClass}>
                    {loading.classes ? <option>Đang tải...</option> : classes.map(c => <option key={c.MaL} value={c.MaL}>{c.Tenlop}</option>)}
                </select>
            </div>
            <div className="relative flex-grow min-w-[150px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={onSearchChange} className={inputBaseClass} />
            </div>
        </div>
    );
};

const Actionbar = ({ onExportExcel, onExportCsv, onOpenSignerModal, isConfirmationDisabled, onOpenLoanOptions, isLoanConfirmationDisabled, visibleColumns, onVisibilityChange, onResetPassword, isResetPasswordDisabled }) => {
    const { isLoggedIn } = useAuthStore();
    const canExport = isLoggedIn;
    const buttonBaseClass = "flex items-center gap-2 px-3 h-9 text-sm font-semibold rounded-md transition-colors";

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu.Root>
                <DropdownMenu.Trigger className={`${buttonBaseClass} bg-blue-600 text-white hover:bg-blue-700`}>Sinh viên <ChevronsUpDown className="w-4 h-4" /></DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                    <DropdownMenu.Content className="bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border dark:border-gray-700 w-64 z-30">
                        <DropdownMenu.Item onSelect={onOpenSignerModal} disabled={isConfirmationDisabled} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed">
                           <Users className="w-4 h-4" />  GXN Sinh viên
                        </DropdownMenu.Item>
                        <DropdownMenu.Item onSelect={onOpenLoanOptions} disabled={isLoanConfirmationDisabled} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed">
                            <Wallet className="w-4 h-4" /> GXN Vay vốn
                        </DropdownMenu.Item>
						<DropdownMenu.Separator className="h-[1px] bg-gray-200 dark:bg-gray-700 m-1" />
												
						<DropdownMenu.Item onSelect={onResetPassword} disabled={isResetPasswordDisabled} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed">
                            <KeyRound className="w-4 h-4" /> Reset mật khẩu
                        </DropdownMenu.Item>
					</DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <button disabled={!canExport} className={`${buttonBaseClass} bg-green-600 text-white hover:bg-green-700 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed`}>
                        <FileDown className="w-4 h-4" /> 
                    </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                    <DropdownMenu.Content align="end" className="bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border dark:border-gray-700 w-56 z-30">
                        <DropdownMenu.Item onSelect={onExportExcel} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 focus:outline-none text-sm">
                            Xuất Excel (.xlsx)
                        </DropdownMenu.Item>
                        <DropdownMenu.Item onSelect={onExportCsv} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 focus:outline-none text-sm">
                            Xuất CSV (.csv)
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <button className={`${buttonBaseClass} bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600`}>
                        <Settings2 className="w-4 h-4" /> 
                    </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                    <DropdownMenu.Content align="end" className="bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border dark:border-gray-700 w-64 max-h-96 overflow-y-auto z-30">
                        <DropdownMenu.Label className="px-3 py-2 font-semibold">Hiển thị cột</DropdownMenu.Label>
                        {ALL_COLUMNS.map(col => (
                            <DropdownMenu.CheckboxItem key={col.key} checked={visibleColumns[col.key]} onCheckedChange={() => onVisibilityChange(col.key)} onSelect={(e) => e.preventDefault()} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 focus:outline-none">
                                <DropdownMenu.ItemIndicator><Eye className="w-4 h-4" /></DropdownMenu.ItemIndicator>
                                <span className="ml-6">{col.label}</span>
                            </DropdownMenu.CheckboxItem>
                        ))}
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
    );
}

// TÁI CẤU TRÚC HOÀN TOÀN: Component EditableCell
const EditableCell = ({ student, column, onSave, lookups, isLoadingLookups }) => {
    const { isAdmin, isHssv } = useAuthStore();
    const [value, setValue] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const config = columnConfigs[column.key];

    // Cập nhật giá trị nội bộ khi student hoặc column thay đổi
    useEffect(() => {
        setValue(student[config?.updateField] ?? student[column.key]);
    }, [student, column.key, config]);
    
    // Xác định quyền sửa
    const canEditGeneral = isAdmin || isHssv;
    const isActuallyEditable = canEditGeneral && config && (!config.adminOnly || isAdmin);

    const handleDoubleClick = () => {
        if (isActuallyEditable) {
            setIsEditing(true);
        }
    };

    const handleSave = async () => {
        // Không lưu nếu giá trị không đổi
        const originalValue = student[config.updateField] ?? student[column.key];
        if (value == originalValue) { // Dùng == để so sánh null và undefined
            setIsEditing(false);
            return;
        }
        setIsSaving(true);
        await onSave(student.MaSV, config.updateField, value);
        setIsSaving(false);
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        else if (e.key === 'Escape') {
            setValue(student[config?.updateField] ?? student[column.key]);
            setIsEditing(false);
        }
    };
    
    // Logic render editor dựa trên config
    const renderEditor = () => {
        const commonProps = {
            onBlur: handleSave,
            onKeyDown: handleKeyDown,
            autoFocus: true,
            className: "w-full box-border bg-yellow-100 dark:bg-gray-600 border border-blue-400 rounded-sm px-1 py-0.5 text-sm focus:outline-none"
        };

        switch (config.editor) {
            case 'checkbox':
                return <input type="checkbox" checked={!!value} onChange={(e) => setValue(e.target.checked)} {...commonProps} />;
            case 'date':
                return <input type="date" value={value ? moment(value).format('YYYY-MM-DD') : ''} onChange={(e) => setValue(e.target.value)} {...commonProps} />;
            // BỔ SUNG: Xử lý input kiểu số
            case 'number':
                 return <input type="number" value={value || ''} onChange={(e) => setValue(e.target.value)} {...commonProps} />;
            case 'select':
            case 'select-simple':
                if (isLoadingLookups) return <span>Đang tải...</span>;
                const options = lookups[config.lookupKey] || [];
                return (
                    <select value={value ?? ''} onChange={(e) => setValue(e.target.value === 'null' ? null : e.target.value)} {...commonProps}>
                        <option value="null">-- Chọn --</option>
                        {config.editor === 'select'
                            ? options.map(opt => <option key={opt[config.valueField]} value={opt[config.valueField]}>{opt[config.labelField]}</option>)
                            : options.map(opt => <option key={opt} value={opt}>{opt}</option>)
                        }
                    </select>
                );
            case 'text':
            default:
                return <input type="text" value={value || ''} onChange={(e) => setValue(e.target.value)} {...commonProps} />;
        }
    };
    
    // Logic render giá trị hiển thị khi không edit
    const renderDisplayValue = () => {
        const initialValue = student[column.key];
        switch (column.key) {
            case 'Gioitinh': return initialValue ? '✓' : '';
            case 'Ngaysinh':
            case 'NgaycapCMND': 
            // BỔ SUNG: Thêm các cột ngày tháng mới
            case 'Ngaybatdau':
            case 'Ngayketthuc':
                return initialValue ? moment(initialValue).format('DD/MM/YYYY') : '';
            default: return initialValue;
        }
    }

    return (
        <div className="relative w-full h-full">
            {isSaving ? <Loader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 animate-spin" /> :
                isEditing ? renderEditor() : (
                    <div
                        onDoubleClick={handleDoubleClick}
                        className={cn("w-full h-full truncate min-h-6 flex items-center", 
                            isActuallyEditable && "cursor-cell hover:bg-yellow-100/50 dark:hover:bg-yellow-800/50 transition-colors"
                        )}
                        title={isActuallyEditable ? 'Nhấp đúp để sửa' : ''}
                    >
                        {renderDisplayValue()}
                    </div>
                )}
        </div>
    );
};


// --- COMPONENT CHÍNH ---
const ClassManagementPage = () => {
    //Bước 2: Gọi ghi log
	// Tên '...' sẽ được ghi vào cột 'Cuaso'
	usePageLogger('QL Lớp SH');

	const { user, isAdmin, isHssv } = useAuthStore();
    const [courses, setCourses] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [classDetails, setClassDetails] = useState({});
    const [stats, setStats] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState({ courses: true, classes: false, students: false, lookups: true });
    const [error, setError] = useState('');

    const [isLoanOptionsModalOpen, setIsLoanOptionsModalOpen] = useState(false);
    const [isSignerModalOpen, setIsSignerModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    // BỔ SUNG: State cho dữ liệu combobox
    const [lookups, setLookups] = useState(null);

    const [visibleColumns, setVisibleColumns] = useState(
        ALL_COLUMNS.reduce((acc, col) => ({ ...acc, [col.key]: col.defaultVisible }), {})
    );
    
    // BỔ SUNG: State cho chế độ xem
    const [viewMode, setViewMode] = useState('default'); // 'default' hoặc 'status'

    // THAY THẾ: Bỏ state `statusFilter`
    // const [statusFilter, setStatusFilter] = useState({ 0: true, 1: true, 2: true, 3: true, });

    useEffect(() => {
        setLoading(prev => ({ ...prev, courses: true }));
        axiosInstance.get('/class-management/courses')
            .then(res => {
                setCourses(res.data);
                if (res.data.length > 0) setSelectedCourse(res.data[0].value);
            })
            .catch(() => toast.error("Lỗi khi tải danh sách khóa học."))
            .finally(() => setLoading(prev => ({ ...prev, courses: false })));

        // BỔ SUNG: Tải dữ liệu lookups một lần
        setLoading(prev => ({ ...prev, lookups: true }));
        axiosInstance.get('/class-management/lookups')
            .then(res => setLookups(res.data))
            .catch(() => toast.error("Lỗi khi tải dữ liệu cho các bộ lọc."))
            .finally(() => setLoading(prev => ({ ...prev, lookups: false })));

    }, []);

    useEffect(() => {
        if (!selectedCourse) return;
        setLoading(prev => ({ ...prev, classes: true }));
        axiosInstance.get('/class-management/classes', { params: { courseYear: selectedCourse } })
            .then(res => {
                setClasses(res.data);
                if (res.data.length > 0) {
                    setSelectedClass(res.data[0].MaL);
                } else {
                    setSelectedClass(''); setStudents([]); setClassDetails({}); setStats([]);
                }
            })
            .catch(() => toast.error("Lỗi khi tải danh sách lớp."))
            .finally(() => setLoading(prev => ({ ...prev, classes: false })));
    }, [selectedCourse]);

    const fetchClassData = useCallback(() => {
        if (!selectedClass) return;
        setLoading(prev => ({ ...prev, students: true }));
        setError('');
        axiosInstance.get('/class-management/class-data', { params: { maL: selectedClass } })
            .then(res => {
                setStudents(res.data.students);
                setClassDetails(res.data.details);
                setStats(res.data.stats);
                setSelectedStudentId(null);
            })
            .catch(err => setError(err.response?.data?.message || "Lỗi khi tải dữ liệu sinh viên."))
            .finally(() => setLoading(prev => ({ ...prev, students: false })));
    }, [selectedClass]);

    useEffect(fetchClassData, [fetchClassData]);

    const filteredStudents = useMemo(() => {
        // THAY ĐỔI: Bỏ logic lọc theo statusFilter
        return students.filter(s =>
            !searchTerm ||
            (s.Holot + ' ' + s.Ten).toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.Maso?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            // BỔ SUNG: Tìm kiếm theo tên tình trạng
            statusMap[s.Tinhtrang]?.text.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [students, searchTerm]);

    const handleVisibilityChange = (key) => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
    
    // BỔ SUNG: Hàm chuyển đổi chế độ xem
    const handleViewToggle = () => {
        const newMode = viewMode === 'default' ? 'status' : 'default';
        setViewMode(newMode);

        if (newMode === 'status') {
            const statusViewColumns = {
                ...ALL_COLUMNS.reduce((acc, col) => ({ ...acc, [col.key]: false }), {}), // Ẩn tất cả
                // Hiện các cột cần thiết
                Tinhtrang: true, Maso: true, Holot: true, Ten: true, Gioitinh: true, Ngaysinh: true,
                Quyetdinh: true, Ngaybatdau: true, Ngayketthuc: true,  Lydo: true,
            };
            setVisibleColumns(statusViewColumns);
        } else {
            // Quay về mặc định
            const defaultColumns = ALL_COLUMNS.reduce((acc, col) => ({ ...acc, [col.key]: col.defaultVisible }), {});
            setVisibleColumns(defaultColumns);
        }
    };


    const visibleColumnsList = useMemo(() => ALL_COLUMNS.filter(col => visibleColumns[col.key]), [visibleColumns]);

    const getStatCount = (status) => stats.find(s => s.Tinhtrang === status)?.SoLuong || 0;
    const totalStudents = students.length;
    const statsSummary = useMemo(() => ({
        dangHoc: getStatCount(0), baoLuu: getStatCount(1), thoiHoc: getStatCount(2), totNghiep: getStatCount(3),
    }), [stats]);

    const handleExportExcel = () => {
        if (filteredStudents.length === 0) return toast.error("Không có dữ liệu sinh viên để xuất.");
        const dataToExport = filteredStudents.map((student, index) => {
            const row = { 'STT': index + 1 };
            visibleColumnsList.forEach(col => {
                let value = student[col.key];
                if (col.key === 'Gioitinh') value = student.Gioitinh ? '✓' : '';
                else if (col.key.includes('Ngay') && value) value = moment(value).format('DD/MM/YYYY');
                else if (col.key === 'Tinhtrang') value = statusMap[student.Tinhtrang]?.text || 'N/A';
                row[col.label] = value;
            });
            return row;
        });
        const className = classes.find(c => c.MaL === selectedClass)?.Tenlop || 'LopSH';
        const filename = `DanhSach_${className}_${moment().format('DD-MM-YYYY')}`;
        exportToExcel({
            data: dataToExport, filename,
            mainTitle: "DANH SÁCH HỌC SINH, SINH VIÊN",
            subTitle: `Lớp: ${className} | CVHT: ${classDetails?.CVHT || ''}`,
            statsData: [
                { label: null, value: null }, { label: 'THỐNG KÊ SỐ LƯỢNG', value: '' },
                { label: 'Đang học:', value: statsSummary.dangHoc }, { label: 'Bảo lưu:', value: statsSummary.baoLuu },
                { label: 'Thôi học:', value: statsSummary.thoiHoc }, { label: 'Tốt nghiệp:', value: statsSummary.totNghiep },
                { label: 'Tổng số:', value: totalStudents }
            ]
        });
        toast.success("Đang xuất file Excel...");
    };

    const handleExportCsv = () => {
        if (filteredStudents.length === 0) return toast.error("Không có dữ liệu sinh viên để xuất.");
        const dataToExport = filteredStudents.map((student) => {
            const row = {};
            ALL_COLUMNS.forEach(col => {
                let value = student[col.key];
                if (col.key === 'Gioitinh') value = student.Gioitinh ? 'Nữ' : 'Nam';
                else if (col.key.includes('Ngay') && value) value = moment(value).format('DD/MM/YYYY');
                else if (col.key === 'Tinhtrang') value = statusMap[student.Tinhtrang]?.text || 'N/A';
                row[col.label] = value;
            });
            return row;
        });
        const className = classes.find(c => c.MaL === selectedClass)?.Tenlop || 'LopSH';
        exportToCSV({ data: dataToExport, filename: `DanhSach_${className}_${moment().format('DD-MM-YYYY')}` });
        toast.success("Đang xuất file CSV...");
    };

    const selectedStudent = useMemo(() => students.find(s => s.MaSV === selectedStudentId), [students, selectedStudentId]);

    const canPerformAction = isAdmin || isHssv;
    const isConfirmationDisabled = !selectedStudent || selectedStudent.Tinhtrang !== 0 || !canPerformAction;
    const isLoanConfirmationDisabled = !selectedStudent || selectedStudent.Tinhtrang !== 0 || !canPerformAction;
    const canResetPassword = isAdmin || isHssv;
    const isResetPasswordDisabled = !selectedStudent || !canResetPassword;

    const handleOpenResetModal = () => {
        if (isResetPasswordDisabled) return toast.error("Vui lòng chọn một sinh viên và đảm bảo bạn có quyền.");
        setIsResetModalOpen(true);
    };

    const handleConfirmResetPassword = async () => {
        if (!selectedStudent) return;
        try {
            const response = await axiosInstance.put(`/class-management/students/${selectedStudentId}/reset-password`);
            toast.success(response.data.message);
            axiosInstance.post('/log-action', { Cuaso: "QL Lớp SH", Congviec: "Reset mật khẩu SV", Ghichu: `Reset MK cho SV: ${selectedStudent.Maso} - ${selectedStudent.Holot} ${selectedStudent.Ten}` });
        } catch (error) {
            toast.error(error.response?.data?.message || "Reset mật khẩu thất bại.");
        }
    };

    const handleOpenSignerModal = () => {
        if (isConfirmationDisabled) return toast.error("Vui lòng chọn một sinh viên có tình trạng 'Đang học'.");
        setIsSignerModalOpen(true);
    };

    const handlePrintConfirmationWithOptions = async (options) => {
        const pdfWindow = window.open('', '_blank');
        if (!pdfWindow) return toast.error("Vui lòng cho phép pop-up để xem giấy xác nhận.");
        pdfWindow.document.write('<body><p>Đang tạo giấy xác nhận, vui lòng chờ...</p></body>');
        try {
            const res = await axiosInstance.get(`/class-management/student-confirmation-data/${selectedStudentId}`);
            const pdfBlob = await generateStudentConfirmationPDF(res.data, options, user);
            if (pdfBlob) {
                pdfWindow.location.href = URL.createObjectURL(pdfBlob);
                axiosInstance.post('/log-action', { Cuaso: "QL lớp SH", Congviec: "GXN Sinh viên", Ghichu: `In GXN đang học cho: ${res.data.Maso} - ${res.data.Holot} ${res.data.Ten}` });
            } else pdfWindow.close();
        } catch (err) {
            toast.error("Lỗi khi tạo giấy xác nhận.");
            if (pdfWindow) pdfWindow.close();
        }
    };

    const handleOpenLoanOptions = () => {
        if (isLoanConfirmationDisabled) return toast.error("Vui lòng chọn một sinh viên có tình trạng 'Đang học'.");
        setIsLoanOptionsModalOpen(true);
    };

    const handlePrintLoanConfirmation = async (options) => {
        const pdfWindow = window.open('', '_blank');
        if (!pdfWindow) return toast.error("Vui lòng cho phép pop-up để xem giấy xác nhận.");
        pdfWindow.document.write('<body><p>Đang tạo giấy xác nhận, vui lòng chờ...</p></body>');
        try {
            const res = await axiosInstance.get(`/class-management/student-loan-data/${selectedStudentId}`);
            const pdfBlob = await generateLoanConfirmationPDF(res.data, options, user);
            if (pdfBlob) {
                pdfWindow.location.href = URL.createObjectURL(pdfBlob);
                axiosInstance.post('/log-action', { Cuaso: "QL lớp SH", Congviec: "GXN Vay vốn", Ghichu: `In GXN vay vốn cho: ${res.data.Maso} - ${res.data.Holot} ${res.data.Ten}` });
            } else pdfWindow.close();
        } catch (err) {
            toast.error("Lỗi khi tạo giấy xác nhận vay vốn.");
            if (pdfWindow) pdfWindow.close();
        }
    };

    // TỐI ƯU HÓA: Cập nhật state local thay vì fetch lại toàn bộ dữ liệu
    const handleUpdateStudentField = async (maSV, field, value) => {
        const studentInfo = students.find(s => s.MaSV === maSV);
        if (!studentInfo) return;

        // Lưu lại giá trị cũ để rollback nếu có lỗi
        const originalStudent = { ...studentInfo };
        
        // Tìm config cột để xử lý cập nhật hiển thị cho combobox
        const columnKey = ALL_COLUMNS.find(c => columnConfigs[c.key]?.updateField === field)?.key;
        const config = columnKey ? columnConfigs[columnKey] : null;

        let updatedDisplayFields = {};
        // Nếu là combobox, tìm text hiển thị tương ứng
        if (config && config.editor === 'select' && lookups) {
            const label = lookups[config.lookupKey]?.find(opt => opt[config.valueField] == value)?.[config.labelField];
            updatedDisplayFields[columnKey] = label;
        } else if (config && config.editor === 'select-simple') {
            updatedDisplayFields[columnKey] = value;
        }

        // Cập nhật giao diện ngay lập tức (Optimistic Update)
        setStudents(prevStudents =>
            prevStudents.map(student =>
                student.MaSV === maSV
                    ? { ...student, [field]: value, ...updatedDisplayFields }
                    : student
            )
        );

        try {
            await axiosInstance.patch(`/class-management/students/${maSV}/update-field`, { field, value });
            
            const columnLabel = ALL_COLUMNS.find(c => c.key === field || columnConfigs[c.key]?.updateField === field)?.label || field;
            axiosInstance.post('/log-action', {
                Cuaso: "QL lớp SH",
                Congviec: `Cập nhật trực tiếp: ${columnLabel}`,
                Ghichu: `SV: ${studentInfo.Maso}, Cột: ${columnLabel}, Giá trị mới: ${value}`
            });
            toast.success(`Đã cập nhật ${columnLabel}!`);

        } catch (error) {
            // Nếu có lỗi, rollback lại state
             setStudents(prevStudents =>
                prevStudents.map(student =>
                    student.MaSV === maSV ? originalStudent : student
                )
            );
            toast.error(error.response?.data?.message || 'Cập nhật thất bại.');
        }
    };


    return (
        <div className="flex flex-col h-[calc(100vh-116px)]">
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-800 dark:text-white text-center uppercase">
                    QUẢN LÝ SINH VIÊN LỚP SINH HOẠT
                </h1>
            </div>

            <div className="flex-1 flex flex-col min-h-0 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="p-3 border-b dark:border-gray-700 flex-shrink-0">
                        <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
                            <div className='flex flex-wrap items-center gap-2'>
                                <PageNavbar
                                    courses={courses} selectedCourse={selectedCourse} onCourseChange={e => setSelectedCourse(e.target.value)}
                                    classes={classes} selectedClass={selectedClass} onClassChange={e => setSelectedClass(e.target.value)}
                                    searchTerm={searchTerm} onSearchChange={e => setSearchTerm(e.target.value)} loading={loading}
                                />
                                {/* THAY ĐỔI: Nút chuyển chế độ xem */}
                                <button
                                    onClick={handleViewToggle}
                                    className={`flex items-center gap-2 px-3 h-9 text-sm font-semibold rounded-md transition-colors bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600`}
                                >
                                    {viewMode === 'default' ? (
                                        <> <Eye className="w-4 h-4" /> Tình trạng </>
                                    ) : (
                                        '✓  Mặc định'
                                    )}
                                </button>
                            </div>
                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <Actionbar
                                    onExportExcel={handleExportExcel} onExportCsv={handleExportCsv}
                                    onOpenSignerModal={handleOpenSignerModal} isConfirmationDisabled={isConfirmationDisabled}
                                    onOpenLoanOptions={handleOpenLoanOptions} isLoanConfirmationDisabled={isLoanConfirmationDisabled}
                                    visibleColumns={visibleColumns} onVisibilityChange={handleVisibilityChange}
                                    onResetPassword={handleOpenResetModal} isResetPasswordDisabled={isResetPasswordDisabled}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow min-h-0 overflow-auto">
                        {loading.students ? (
                            <div className="flex items-center justify-center h-full"><Loader className="w-10 h-10 animate-spin text-blue-600" /></div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-10 text-red-600"><AlertCircle className="w-12 h-12 mb-4" /><p className="font-semibold">{error}</p></div>
                        ) : (
                            <table className="min-w-full table-auto divide-y divide-gray-200 dark:divide-gray-700 table-row-hover">
                                <thead className="bg-gray-100 dark:bg-gray-700/50 font-semibold sticky top-0 z-10">
                                    <tr>
                                        <th className="px-2 py-2 text-center text-xs uppercase w-12">TT</th>
                                            {visibleColumnsList.map(col => (<th key={col.key} className="px-4 py-2 text-left text-xs uppercase tracking-wider">{col.label}</th>))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredStudents.length > 0 ? filteredStudents.map((s, index) => (
                                        <tr key={s.MaSV} onClick={() => setSelectedStudentId(s.MaSV)} className={cn("transition-colors", selectedStudentId === s.MaSV && "text-blue-600 dark:text-blue-400 font-semibold bg-blue-100 dark:bg-blue-900/50")}>
                                            <td className="px-2 py-2 text-center text-sm w-12">{index + 1}</td>
                                            {visibleColumnsList.map(col => (
                                                <td key={col.key} className="px-4 py-2 text-sm whitespace-nowrap">
                                                    {columnConfigs[col.key] && (isAdmin || isHssv) ? (
                                                        <EditableCell
                                                            student={s}
                                                            column={col}
                                                            onSave={handleUpdateStudentField}
                                                            lookups={lookups}
                                                            isLoadingLookups={loading.lookups}
                                                        />
                                                    ) : col.key === 'Tinhtrang' ? <span className={cn("font-medium", statusMap[s.Tinhtrang]?.color)}>{statusMap[s.Tinhtrang]?.text || 'N/A'}</span>
                                                        : ( (col.key.includes('Ngay') || col.key === 'Ngaybatdau' || col.key === 'Ngayketthuc') && s[col.key] ? moment(s[col.key]).format('DD/MM/YYYY')
                                                            : (col.key === 'Gioitinh' ? (s.Gioitinh ? '✓' : '') : s[col.key]))
                                                    }
                                                </td>
                                            ))}
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={visibleColumnsList.length + 1} className="text-center py-10 text-gray-500">Không có sinh viên.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {!loading.students && totalStudents > 0 && (
                        <div className="p-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs flex-shrink-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1">
                                <div><strong><School className="inline w-4 h-4 mr-1" />Tên nghề:</strong> {classDetails.Dacdiem}</div>
                                <div><strong><GraduationCap className="inline w-4 h-4 mr-1" />Trình độ:</strong> {classDetails.BacDTHienThi} ({classDetails.SoHK} học kỳ)</div>
                                <div><strong><UserCheck className="inline w-4 h-4 mr-1" />CVHT:</strong> {classDetails.CVHT}</div>
                            </div>
                            <div className="border-t dark:border-gray-700 mt-2 pt-2 grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-1">
                                <div><strong>Tổng số:</strong> {totalStudents}</div>
                                <div><strong>Đang học:</strong> {statsSummary.dangHoc} ({((statsSummary.dangHoc / totalStudents) * 100).toFixed(1)}%)</div>
                                <div><strong>Bảo lưu:</strong> {statsSummary.baoLuu} ({((statsSummary.baoLuu / totalStudents) * 100).toFixed(1)}%)</div>
                                <div><strong>Thôi học:</strong> {statsSummary.thoiHoc} ({((statsSummary.thoiHoc / totalStudents) * 100).toFixed(1)}%)</div>
                                <div><strong>Tốt nghiệp:</strong> {statsSummary.totNghiep} ({((statsSummary.totNghiep / totalStudents) * 100).toFixed(1)}%)</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isLoanOptionsModalOpen && (
                <LoanConfirmationOptionsModal isOpen={isLoanOptionsModalOpen} onClose={() => setIsLoanOptionsModalOpen(false)} onConfirm={handlePrintLoanConfirmation} />
            )}
            {isSignerModalOpen && (
                <SignerSelectionModal isOpen={isSignerModalOpen} onClose={() => setIsSignerModalOpen(false)} onConfirm={handlePrintConfirmationWithOptions} />
            )}
            {isResetModalOpen && selectedStudent && (
                <ConfirmationModal open={isResetModalOpen} onOpenChange={setIsResetModalOpen} onConfirm={handleConfirmResetPassword} title="Xác nhận Reset Mật khẩu"
                    description={`Reset mật khẩu cho sinh viên ${selectedStudent.Holot} ${selectedStudent.Ten} thành mật khẩu mặc định: ${moment(selectedStudent.Ngaysinh).format('DDMMYYYY')}?`} />
            )}
        </div>
    );
};

export default ClassManagementPage;


