/*
 * D:\QLDT-app\client\src\pages\AdmissionsPage.jsx
 * Cập nhật: 25/10/2025
 * Tóm tắt: Bổ sung log khi mở trang
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import {
    Loader, AlertCircle, Search, Users, Printer, FileDown, ChevronsUpDown, Eye,
    Settings2, GraduationCap, Wallet, UserPlus, Edit, BarChart3, Info,
    CalendarCheck, CalendarX, CheckCircle2, Filter, ArrowUp, ArrowDown, FileText, Trash2
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../lib/utils';
import moment from 'moment';
import useAuthStore from '../store/authStore';
import ApplicantFeeModal from '../features/admissions/ApplicantFeeModal';
import PaginationControls from '../components/ui/PaginationControls';
import ApplicantModal from '../features/admissions/ApplicantModal';
import { generateAdmissionNoticePDF } from '../features/admissions/AdmissionNoticeGenerator';
import { exportToExcel, exportToCSV } from '../lib/excelExporter';
import ConfirmationModal from '../components/ui/ConfirmationModal';
//Bước 1: Bổ sung Import hook
import { usePageLogger } from '../hooks/usePageLogger';


// BỔ SUNG: Cấu hình cho các cột có thể chỉnh sửa
const columnConfigs = {
    Holot: { editor: 'text', updateField: 'Holot' },
    Ten: { editor: 'text', updateField: 'Ten' },
	Dienthoai: { editor: 'text', updateField: 'Dienthoai' },
    NamTN: { editor: 'text', updateField: 'NamTN' },
    Diachi: { editor: 'text', updateField: 'Diachi' },
    Hokhau: { editor: 'text', updateField: 'Hokhau' },
    SoCMND: { editor: 'text', updateField: 'SoCMND' },
    Email: { editor: 'text', updateField: 'Email' },
    Ghichu: { editor: 'text', updateField: 'Ghichu' },
    Gioitinh: { editor: 'checkbox', updateField: 'Gioitinh' },
    Ngaysinh: { editor: 'date', updateField: 'Ngaysinh' },
    NgaycapCMND: { editor: 'date', updateField: 'NgaycapCMND' },
    Dantoc: { editor: 'select', updateField: 'MaDT', lookupKey: 'danToc', valueField: 'MaDT', labelField: 'Dantoc' },
    Tongiao: { editor: 'select', updateField: 'MaTG', lookupKey: 'tonGiao', valueField: 'MaTG', labelField: 'Tongiao' },
    Noisinh: { editor: 'select-simple', updateField: 'Noisinh', lookupKey: 'tinhThanh' },
    NoicapCMND: { editor: 'select-simple', updateField: 'NoicapCMND', lookupKey: 'noiCapCCCD' },
    TrinhdoVH: { editor: 'select-simple', updateField: 'Fld01', lookupKey: 'trinhDoVanHoa' },
};


// --- COMPONENT CON: EditableCell (Bổ sung mới) ---
const EditableCell = ({ applicant, column, onSave, lookups, isLoadingLookups }) => {
    const { isAdmin, isTuyensinh } = useAuthStore();
    const [value, setValue] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const config = columnConfigs[column.key];

    useEffect(() => {
        // Lấy giá trị ID (ví dụ: MaDT) thay vì giá trị hiển thị (Dantoc)
        setValue(config?.updateField ? applicant[config.updateField] : applicant[column.key]);
    }, [applicant, column.key, config]);

    const isActuallyEditable = (isAdmin || isTuyensinh) && config;

    const handleDoubleClick = () => {
        if (isActuallyEditable) setIsEditing(true);
    };

    const handleSave = async () => {
        const originalValue = config?.updateField ? applicant[config.updateField] : applicant[column.key];
        if (value == originalValue) {
            setIsEditing(false);
            return;
        }
        setIsSaving(true);
        await onSave(applicant.MaTSXT, config.updateField, value);
        setIsSaving(false);
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        else if (e.key === 'Escape') {
            setValue(config?.updateField ? applicant[config.updateField] : applicant[column.key]);
            setIsEditing(false);
        }
    };

    const renderEditor = () => {
        const commonProps = {
            onBlur: handleSave,
            onKeyDown: handleKeyDown,
            autoFocus: true,
            className: "w-full box-border bg-yellow-100 dark:bg-gray-600 border border-blue-400 rounded-sm px-1 py-0.5 text-sm focus:outline-none"
        };
        switch (config.editor) {
            case 'checkbox': return <input type="checkbox" checked={!!value} onChange={(e) => setValue(e.target.checked)} {...commonProps} />;
            case 'date': return <input type="date" value={value ? moment(value).format('YYYY-MM-DD') : ''} onChange={(e) => setValue(e.target.value)} {...commonProps} />;
            case 'select':
            case 'select-simple':
                if (isLoadingLookups) return <span>Đang tải...</span>;
                // Bổ sung kiểm tra an toàn
                const options = lookups ? (lookups[config.lookupKey] || []) : [];
                return (
                    <select value={value ?? ''} onChange={(e) => setValue(e.target.value === 'null' ? null : e.target.value)} {...commonProps}>
                        <option value="null">-- Chọn --</option>
                        {config.editor === 'select'
                            ? options.map(opt => <option key={opt[config.valueField]} value={opt[config.valueField]}>{opt[config.labelField]}</option>)
                            : options.map(opt => <option key={opt} value={opt}>{opt}</option>)
                        }
                    </select>
                );
            default: return <input type="text" value={value || ''} onChange={(e) => setValue(e.target.value)} {...commonProps} />;
        }
    };

    const renderDisplayValue = () => {
        const initialValue = applicant[column.key];
        // Giữ nguyên logic hiển thị ban đầu của bạn
        if (['Nhaphoc', 'Phanlop', 'Trungtuyen', 'Gioitinh'].includes(column.key)) {
            return (initialValue === 1 || initialValue === true) ? '✓' : '';
        }
        if (['Ngaysinh', 'NgaycapCMND'].includes(column.key)) {
            return initialValue ? moment(initialValue).format('DD/MM/YYYY') : '';
        }
        return initialValue;
    };

    return (
        <div className="relative w-full h-full">
            {isSaving ? <Loader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 animate-spin" /> :
                isEditing ? renderEditor() : (
                    <div
                        onDoubleClick={handleDoubleClick}
                        className={cn("w-full h-full truncate min-h-6 flex items-center",
                            isActuallyEditable && `text-${column.align || 'left'}`,
                            isActuallyEditable && "cursor-cell hover:bg-yellow-50 dark:hover:bg-yellow-800/50 transition-colors"
                        )}
                        title={isActuallyEditable ? 'Nhấp đúp để sửa' : ''}
                    >
                        {renderDisplayValue()}
                    </div>
                )}
        </div>
    );
};

// --- KHÔI PHỤC HOOK useDebounce ---
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

// --- KHÔI PHỤC COMPONENT PageNavbar ---
const PageNavbar = ({ periods, selectedPeriod, onPeriodChange, searchTerm, onSearchChange, visibleColumns, onVisibilityChange, loading, onOpenApplicantFeeModal, onExportExcel, onExportCSV, onExportReceipts, admissionStatusFilter, onAdmissionStatusFilterChange, onAddNew, onEdit, canPerformActions, isEditDisabled, onPrintAdmissionNotice, isAdmissionNoticeDisabled, onDelete, isDeleteDisabled, selectedApplicant }) => {
    const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
    const { isAdmin, isKetoan, isLoggedIn, isTuyensinh } = useAuthStore();
    
    const controlBaseClass = "h-9 px-3 border rounded-md dark:bg-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    const buttonBaseClass = "h-9 flex items-center gap-2 px-3 text-sm font-semibold rounded-md transition-colors";

    const isFeeCollectionDisabled = useMemo(() => {
        if (!selectedApplicant) return true;
        if (!isAdmin && !isKetoan) return true;
        if (selectedApplicant.Phanlop === 1) return true;
        return false;
    }, [isAdmin, isKetoan, selectedApplicant]);

    const canViewReceipts = isLoggedIn;
    const canExport = isLoggedIn;
    const canPrintNotice = isAdmin || isTuyensinh;

    return (
        <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Info className="w-5 h-5 text-gray-500" />
                    <select value={selectedPeriod} onChange={onPeriodChange} disabled={loading.periods} className={controlBaseClass}>
                        {loading.periods ? <option>Đang tải...</option> : periods.map(p => <option key={p.MaDXT} value={p.MaDXT}>{`${p.DotXT} - ${p.Ghichu}`}</option>)}
                    </select>
                </div>
                
                <div className="relative flex-grow min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Tìm theo mã TS, họ tên..." value={searchTerm} onChange={onSearchChange} className={`w-full pl-10 pr-4 ${controlBaseClass}`} />
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger disabled={!isLoggedIn} className={`${buttonBaseClass} bg-blue-600 text-white hover:bg-blue-700 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed`}>
                        Thí sinh <ChevronsUpDown className="w-4 h-4" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content className="bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border dark:border-gray-700 w-56 z-30">
                            <DropdownMenu.Item onSelect={onAddNew} disabled={!canPerformActions} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"><UserPlus className="w-4 h-4" /> Nhận hồ sơ mới</DropdownMenu.Item>
                            <DropdownMenu.Item onSelect={onEdit} disabled={isEditDisabled || !canPerformActions} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"><Edit className="w-4 h-4" /> Cập nhật hồ sơ</DropdownMenu.Item>
                            {isAdmin && (
                                <DropdownMenu.Item onSelect={onDelete} disabled={isDeleteDisabled} className="px-3 py-2 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 cursor-pointer flex items-center gap-2 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed">
                                    <Trash2 className="w-4 h-4" /> Xóa thí sinh
                                </DropdownMenu.Item>
                            )}
                            <DropdownMenu.Separator className="h-[1px] bg-gray-200 dark:bg-gray-700 m-1" />
                            <DropdownMenu.Item onSelect={onPrintAdmissionNotice} disabled={isAdmissionNoticeDisabled || !canPrintNotice} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed">
                                <FileText className="w-4 h-4" /> Giấy báo trúng tuyển
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>

                <DropdownMenu.Root>
                    <DropdownMenu.Trigger className={`${buttonBaseClass} bg-orange-500 text-white hover:bg-orange-600`}>Khoản thu <ChevronsUpDown className="w-4 h-4" /></DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content className="bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border dark:border-gray-700 w-56 z-30">
                            <DropdownMenu.Item onSelect={onOpenApplicantFeeModal} disabled={isFeeCollectionDisabled} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"><Wallet className="w-4 h-4" /> Lập phiếu thu</DropdownMenu.Item>
                            <DropdownMenu.Item onSelect={onExportReceipts} disabled={!canViewReceipts} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"><FileDown className="w-4 h-4" /> Xuất Danh sách thu</DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>

                <DropdownMenu.Root>
                    <DropdownMenu.Trigger className={`${buttonBaseClass} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600`}>
                        <Filter className="w-4 h-4" /> Trúng tuyển <ChevronsUpDown className="w-4 h-4" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content className="bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border dark:border-gray-700 w-56 z-30">
                            <DropdownMenu.CheckboxItem checked={admissionStatusFilter.yes} onCheckedChange={() => onAdmissionStatusFilterChange('yes')} onSelect={(e) => e.preventDefault()} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 focus:outline-none">
                                <DropdownMenu.ItemIndicator><CheckCircle2 className="w-4 h-4 text-green-500" /></DropdownMenu.ItemIndicator>
                                <span className="ml-6">Đã trúng tuyển</span>
                            </DropdownMenu.CheckboxItem>
                            <DropdownMenu.CheckboxItem checked={admissionStatusFilter.no} onCheckedChange={() => onAdmissionStatusFilterChange('no')} onSelect={(e) => e.preventDefault()} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 focus:outline-none">
                                <DropdownMenu.ItemIndicator><CheckCircle2 className="w-4 h-4 text-green-500" /></DropdownMenu.ItemIndicator>
                                <span className="ml-6">Chưa trúng tuyển</span>
                            </DropdownMenu.CheckboxItem>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>

                <DropdownMenu.Root>
                    <DropdownMenu.Trigger disabled={!canExport} className={`${buttonBaseClass} bg-green-600 text-white hover:bg-green-700 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed`}>
                        <FileDown className="w-4 h-4" /> 
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content align="end" className="bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border dark:border-gray-700 w-56 z-30">
                            <DropdownMenu.Item onSelect={onExportExcel} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2">Xuất Excel (.xlsx)</DropdownMenu.Item>
                            <DropdownMenu.Item onSelect={onExportCSV} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2">Xuất CSV (.csv)</DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
				
				<DropdownMenu.Root open={isColumnMenuOpen} onOpenChange={setIsColumnMenuOpen}>
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
        </div>
    );
};

// --- KHÔI PHỤC CẤU TRÚC CỘT GỐC ---
const ALL_COLUMNS = [
    { key: 'Trungtuyen', label: 'TT', defaultVisible: true, align: 'center', sortable: false },
    { key: 'Maso', label: 'Mã TS', defaultVisible: true, align: 'center', sortable: true },
    { key: 'Holot', label: 'Họ lót', defaultVisible: true, align: 'left', sortable: true },
    { key: 'Ten', label: 'Tên', defaultVisible: true, align: 'left', sortable: true },
    { key: 'Gioitinh', label: 'Nữ', defaultVisible: true, align: 'center', sortable: false },
    { key: 'Ngaysinh', label: 'Ngày sinh', defaultVisible: true, align: 'center', sortable: false },
    { key: 'Noisinh', label: 'Nơi sinh', defaultVisible: false, align: 'left', sortable: false },
    { key: 'Khuvuc', label: 'Khu vực', defaultVisible: false, align: 'left', sortable: false },
    { key: 'DTCS', label: 'ĐT chính sách', defaultVisible: false, align: 'left', sortable: false },
    { key: 'Dienthoai', label: 'Số điện thoại', defaultVisible: true, align: 'left', sortable: false },
    { key: 'TrinhdoVH', label: 'Trình độ VH', defaultVisible: false, align: 'left', sortable: false },
    { key: 'NamTN', label: 'Năm TN', defaultVisible: false, align: 'left', sortable: false },
    { key: 'TruongTHPT', label: 'Trường PT', defaultVisible: false, align: 'left', sortable: false },
    { key: 'Dantoc', label: 'Dân tộc', defaultVisible: false, align: 'left', sortable: false },
	{ key: 'Tongiao', label: 'Tôn giáo', defaultVisible: false, align: 'left', sortable: false },
    { key: 'Diachi', label: 'Địa chỉ cư trú', defaultVisible: true, align: 'left', sortable: false },
    { key: 'Hokhau', label: 'Hộ khẩu thường trú', defaultVisible: false, align: 'left', sortable: false },
    { key: 'SoCMND', label: 'Số CCCD', defaultVisible: false, align: 'left', sortable: false },
    { key: 'NgaycapCMND', label: 'Ngày cấp CC', defaultVisible: false, align: 'center', sortable: false },
    { key: 'NoicapCMND', label: 'Nơi cấp CC', defaultVisible: false, align: 'left', sortable: false },
    { key: 'Email', label: 'Email', defaultVisible: false, align: 'left', sortable: false },
    { key: 'Ghichu', label: 'Ghi chú', defaultVisible: false, align: 'left', sortable: false },
	{ key: 'NV1', label: 'Nguyện vọng 1', defaultVisible: true, align: 'left', sortable: true },
    { key: 'NV2', label: 'Nguyện vọng 2', defaultVisible: false, align: 'left', sortable: true },
    { key: 'NV3', label: 'Nguyện vọng 3', defaultVisible: false, align: 'left', sortable: true },
    { key: 'DiemUT', label: 'Điểm UT', defaultVisible: true, align: 'center', sortable: false },
    { key: 'TongDXT', label: 'Điểm XT', defaultVisible: true, align: 'center', sortable: false },
    { key: 'Tennganh', label: 'Nghề trúng tuyển', defaultVisible: true, align: 'left', sortable: true },
    { key: 'QuyetdinhTrungTuyen', label: 'QĐ trúng tuyển', defaultVisible: false, align: 'center', sortable: false },
    { key: 'Nhaphoc', label: 'Nhập học', defaultVisible: true, align: 'center', sortable: false },
    { key: 'Phanlop', label: 'Phân lớp', defaultVisible: true, align: 'center', sortable: false },
];


// --- COMPONENT CHÍNH ---
const AdmissionsPage = () => {
    //Bước 2: Gọi ghi log
	// Tên '...' sẽ được ghi vào cột 'Cuaso'
	usePageLogger('Danh sách thí sinh');

	const { user, isAdmin, isTuyensinh } = useAuthStore();
    const [periods, setPeriods] = useState([]);
    const [applicants, setApplicants] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [selectedApplicantId, setSelectedApplicantId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [sortConfig, setSortConfig] = useState({ key: 'Maso', direction: 'asc' });
    const [loading, setLoading] = useState({ periods: true, data: false, lookups: true }); // Bổ sung lookups
    const [error, setError] = useState('');
    const [pageSize, setPageSize] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalApplicants, setTotalApplicants] = useState(0);
    const [visibleColumns, setVisibleColumns] = useState(ALL_COLUMNS.reduce((acc, col) => ({ ...acc, [col.key]: col.defaultVisible }), {}));
    const [admissionStatusFilter, setAdmissionStatusFilter] = useState({ yes: true, no: true });
    const [isApplicantFeeModalOpen, setIsApplicantFeeModalOpen] = useState(false);
    const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    
    // BỔ SUNG: State cho dữ liệu combobox
    const [lookups, setLookups] = useState(null);

    const canPerformActions = isAdmin || isTuyensinh;

    useEffect(() => {
        setLoading(prev => ({ ...prev, periods: true }));
        axiosInstance.get('/admissions/periods')
            .then(res => {
                setPeriods(res.data);
                if (res.data.length > 0) setSelectedPeriod(res.data[0].MaDXT);
            })
            .catch(() => toast.error('Lỗi khi tải danh sách đợt tuyển sinh.'))
            .finally(() => setLoading(prev => ({ ...prev, periods: false })));
        
        // BỔ SUNG: Tải dữ liệu lookups
        setLoading(prev => ({ ...prev, lookups: true }));
        axiosInstance.get('/admissions/lookups-admissions')
            .then(res => setLookups(res.data))
            .catch(() => toast.error("Lỗi khi tải dữ liệu cho các bộ lọc."))
            .finally(() => setLoading(prev => ({ ...prev, lookups: false })));
    }, []);

    const fetchData = useCallback((page = 1) => {
        if (!selectedPeriod) return;
        setLoading(prev => ({ ...prev, data: true }));
        setError('');
        const params = {
            maDXT: selectedPeriod,
            page,
            pageSize,
            searchTerm: debouncedSearchTerm,
            trungTuyenYes: admissionStatusFilter.yes,
            trungTuyenNo: admissionStatusFilter.no,
            sortKey: sortConfig.key,
            sortDirection: sortConfig.direction,
        };
        axiosInstance.get('/admissions/applicants', { params })
            .then(res => {
                setApplicants(res.data.applicants);
                setTotalApplicants(res.data.total);
                setCurrentPage(page);
                setSelectedApplicantId(null);
            })
            .catch(err => setError(err.response?.data?.message || "Lỗi khi tải dữ liệu tuyển sinh."))
            .finally(() => setLoading(prev => ({ ...prev, data: false })));
    }, [selectedPeriod, debouncedSearchTerm, admissionStatusFilter, pageSize, sortConfig]);

    useEffect(() => {
        if (selectedPeriod) {
            fetchData(1);
        }
    }, [selectedPeriod, debouncedSearchTerm, admissionStatusFilter, pageSize, sortConfig, fetchData]);


    const handleSort = (key) => {
        if (!key) return;
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const totalPages = Math.ceil(totalApplicants / pageSize);

    const handleVisibilityChange = (key) => {
        setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleAdmissionStatusFilterChange = (key) => {
        setAdmissionStatusFilter(prev => {
            const newFilter = { ...prev, [key]: !prev[key] };
            if (!newFilter.yes && !newFilter.no) {
                return prev;
            }
            return newFilter;
        });
    };

    const handlePeriodChange = (e) => {
        setSelectedPeriod(e.target.value);
        setSearchTerm('');
    };

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
    };

    const handleOpenApplicantFeeModal = () => {
        setIsApplicantFeeModalOpen(true);
    };

    const handleAddNew = () => {
        setModalMode('add');
        setSelectedApplicantId(null); // Đảm bảo không có thí sinh nào được chọn
        setIsApplicantModalOpen(true);
    };

    const handleEdit = () => {
        if (!selectedApplicantId) {
            toast.error("Vui lòng chọn một thí sinh để cập nhật.");
            return;
        }
        setModalMode('edit');
        setIsApplicantModalOpen(true);
    };

    const handleSaveSuccess = () => {
        setIsApplicantModalOpen(false);
        fetchData(currentPage);
    };

    const selectedApplicant = useMemo(() =>
        applicants.find(a => a.MaTSXT === selectedApplicantId),
        [applicants, selectedApplicantId]
    );

    const isAdmissionNoticeDisabled = !selectedApplicant || selectedApplicant.Trungtuyen !== 1;
    const isEditDisabled = !selectedApplicant || (selectedApplicant.Phanlop === 1 && !isAdmin);
    const isDeleteDisabled = !isAdmin || !selectedApplicant || selectedApplicant.Trungtuyen === 1;

    const handleDelete = () => {
        if (isDeleteDisabled) {
            toast.error("Chỉ Admin có thể xóa thí sinh chưa trúng tuyển.");
            return;
        }
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (isDeleteDisabled) return;
        const promise = axiosInstance.delete(`/admissions/applicant/${selectedApplicantId}`);
        toast.promise(promise, {
            loading: 'Đang xóa thí sinh...',
            success: (res) => {
                fetchData(currentPage);
                return res.data.message;
            },
            error: (err) => {
                return err.response?.data?.message || "Xóa thất bại.";
            }
        });
        setIsDeleteConfirmOpen(false);
    };

    const handlePrintAdmissionNotice = async () => {
        if (isAdmissionNoticeDisabled) {
            toast.error("Vui lòng chọn một thí sinh đã trúng tuyển.");
            return;
        }

        const pdfWindow = window.open('', '_blank');
        if (!pdfWindow) {
            toast.error("Vui lòng cho phép pop-up để xem phiếu.");
            return;
        }
        pdfWindow.document.write('<html><head><title>Đang tạo giấy báo...</title></head><body><p>Vui lòng chờ trong khi giấy báo đang được tạo...</p></body></html>');

        try {
            const reportData = {
                applicant: selectedApplicant,
                period: selectedPeriodInfo,
            };

            const pdfBlob = generateAdmissionNoticePDF(reportData, user);

            if (pdfBlob) {
                const pdfUrl = URL.createObjectURL(pdfBlob);
                pdfWindow.location.href = pdfUrl;

                const logPayload = {
                    Cuaso: "DS thí sinh",
                    Congviec: "Giấy báo trúng tuyển",
                    Ghichu: `In giấy báo TT: ${selectedApplicant.Maso} - ${selectedApplicant.Holot} ${selectedApplicant.Ten}`
                };
                axiosInstance.post('/log-action', logPayload).catch(err => {
                    console.error("Ghi log thất bại:", err);
                });

            } else {
                pdfWindow.close();
            }
        } catch (err) {
            toast.error("Lỗi khi tạo giấy báo nhập học.");
            if (pdfWindow) pdfWindow.close();
        }
    };


    const selectedPeriodInfo = useMemo(() =>
        periods.find(p => p.MaDXT === selectedPeriod),
        [selectedPeriod, periods]
    );
    const visibleColumnsList = useMemo(() =>
        ALL_COLUMNS.filter(col => visibleColumns[col.key]),
        [visibleColumns]
    );

    const prepareExportData = (allApplicants) => {
        return allApplicants.map((applicant, index) => {
            const row = {};
            const columnsToExport = ALL_COLUMNS.filter(col => visibleColumns[col.key]);

            columnsToExport.forEach(col => {
                const key = col.key;
                const label = col.label;
                let value = applicant[key];

                if (['Ngaysinh', 'NgaycapCMND'].includes(key)) {
                    value = value ? new Date(moment(value).tz('Asia/Ho_Chi_Minh').format()) : null;
                } else if (['Nhaphoc', 'Phanlop', 'Trungtuyen', 'Gioitinh'].includes(key)) {
                    value = (value === 1 || value === true) ? '✓' : '';
                } else if (key === 'QuyetdinhTrungTuyen') {
                    value = applicant.SoQuyetdinh ? `${applicant.SoQuyetdinh}, ${moment(applicant.NgaykyQuyetdinh).format('DD/MM/YYYY')}` : '';
                } else if (value === null || value === undefined) {
                    value = '';
                }
                row[label] = value;
            });

            return { 'STT': index + 1, ...row };
        });
    };

    const handleExportExcel = async () => {
        const toastId = toast.loading('Đang chuẩn bị dữ liệu Excel, vui lòng chờ...');
        try {
            const params = {
                maDXT: selectedPeriod,
                searchTerm,
                trungTuyenYes: admissionStatusFilter.yes,
                trungTuyenNo: admissionStatusFilter.no,
                sortKey: sortConfig.key,
                sortDirection: sortConfig.direction
            };

            const response = await axiosInstance.get('/admissions/export', { params });
            const allApplicants = response.data;

            if (allApplicants.length === 0) {
                toast.error("Không có dữ liệu để xuất.", { id: toastId });
                return;
            }

            const dataToExport = prepareExportData(allApplicants);
            const columnConfig = {
                'STT': { align: 'center' },
                'TT': { align: 'center' },
                'Mã TS': { align: 'center', type: 's' },
                'Nữ': { align: 'center' },
                'Ngày sinh': { align: 'center', format: 'dd/mm/yyyy' },
                'Ngày cấp CC': { align: 'center', format: 'dd/mm/yyyy' },
                'Điểm UT': { align: 'center', format: '0.00' },
                'Điểm XT': { align: 'center', format: '0.00' },
                'Số điện thoại': { type: 's' },
                'Số CCCD': { type: 's' },
            };

            const statsResponse = await axiosInstance.get('/admissions/stats', { params: { maDXT: selectedPeriod } });
            const statsDataForExport = statsResponse.data ? [
                { label: 'THỐNG KÊ CHI TIẾT', value: '' },
                { label: 'Trình độ:', value: statsResponse.data.details.Ghichu },
                { label: 'Ngày kết thúc:', value: moment(statsResponse.data.details.Ngayketthuc).format('DD/MM/YYYY') },
                { label: 'Ngày xét tuyển:', value: moment(statsResponse.data.details.NgayXettuyen).format('DD/MM/YYYY') },
                {},
                { label: 'Tổng thí sinh:', value: statsResponse.data.general.TotalApplicants },
                { label: 'Trúng tuyển:', value: statsResponse.data.general.TotalSuccessful },
                {},
                { label: 'Thống kê trúng tuyển theo nghề:', value: '' },
                ...statsResponse.data.byMajor.map(major => ({ label: `  ${major.Tennganh}:`, value: major.SuccessfulCount }))
            ] : [];

            const filename = `DanhSachTS_${selectedPeriodInfo?.DotXT || 'DotTS'}_${moment().format('DD-MM-YYYY')}`;
            exportToExcel({
                data: dataToExport,
                filename: filename,
                columnConfig: columnConfig,
                mainTitle: "DANH SÁCH THÍ SINH",
                subTitle: `Đợt tuyển sinh: ${selectedPeriodInfo?.DotXT || ''}`,
                statsData: statsDataForExport
            });
            toast.dismiss(toastId);
            toast.success("Đã tải xuống file Excel!");

        } catch (err) {
            toast.error('Lỗi khi xuất dữ liệu Excel. Vui lòng thử lại.', { id: toastId });
        }
    };
    
    const handleExportCSV = async () => {
        const toastId = toast.loading('Đang chuẩn bị dữ liệu CSV, vui lòng chờ...');
        try {
            const params = {
                maDXT: selectedPeriod,
                searchTerm,
                trungTuyenYes: admissionStatusFilter.yes,
                trungTuyenNo: admissionStatusFilter.no,
                sortKey: sortConfig.key,
                sortDirection: sortConfig.direction
            };
            const response = await axiosInstance.get('/admissions/export', { params });
            const allApplicants = response.data;

            if (allApplicants.length === 0) {
                toast.error("Không có dữ liệu để xuất.", { id: toastId });
                return;
            }

            const dataToExport = prepareExportData(allApplicants);
            const filename = `DanhSachTS_${selectedPeriodInfo?.DotXT || 'DotTS'}_${moment().format('DD-MM-YYYY')}`;
            exportToCSV({ data: dataToExport, filename });
            toast.dismiss(toastId);
            toast.success("Đã tải xuống file CSV!");
        } catch (err) {
            toast.error('Lỗi khi xuất dữ liệu CSV. Vui lòng thử lại.', { id: toastId });
        }
    };
    
    const handleExportReceipts = async () => {
        const toastId = toast.loading('Đang chuẩn bị dữ liệu thu...');
        try {
            const res = await axiosInstance.get('/admissions/receipts-summary', { params: { maDXT: selectedPeriod } });
            const { data, feeTypes } = res.data;
            if (data.length === 0) {
                toast.error("Không có dữ liệu thu để xuất.", { id: toastId });
                return;
            }

            const columnConfig = {
                'STT': { align: 'center' },
                'Mã TS': { align: 'center', type: 's' },
                'Trúng tuyển': { align: 'center' },
                'Phân lớp': { align: 'center' },
                'Họ lót': { align: 'left' },
                'Tên': { align: 'left' },
                'Nghề trúng tuyển': { align: 'left' },
            };
            feeTypes.forEach(fee => {
                columnConfig[fee] = { align: 'right', format: '#,##0' };
            });

            const dataToExport = data.map((row, index) => {
                const newRow = {
                    'STT': index + 1,
                    'Mã TS': row.Maso,
                    'Họ lót': row.Holot,
                    'Tên': row.Ten,
                    'Trúng tuyển': row.Trungtuyen === 1 ? '✓' : '',
                    'Nghề trúng tuyển': row.Tennganh || '',
                    'Phân lớp': row.Phanlop === 1 ? '✓' : ''
                };
                feeTypes.forEach(fee => {
                    newRow[fee] = row[fee] || 0;
                });
                return newRow;
            });

            const filename = `DanhSachThuPhi_${selectedPeriodInfo?.DotXT || 'DotTS'}_${moment().format('DD-MM-YYYY')}`;
            exportToExcel({
                data: dataToExport,
                filename: filename,
                columnConfig: columnConfig,
                mainTitle: "DANH SÁCH THU PHÍ THÍ SINH",
                subTitle: `Đợt tuyển sinh: ${selectedPeriodInfo?.DotXT || ''}`
            });
            toast.dismiss(toastId);
        } catch (err) {
            toast.error("Lỗi khi xuất danh sách thu.", { id: toastId });
        }
    };

     // BỔ SUNG & CẬP NHẬT: Tích hợp logic ghi log
    const handleUpdateApplicantField = async (maTSXT, field, value) => {
        const applicantInfo = applicants.find(s => s.MaTSXT === maTSXT);
        if (!applicantInfo) return;

        const originalApplicant = { ...applicantInfo };
        const columnKey = ALL_COLUMNS.find(c => columnConfigs[c.key]?.updateField === field)?.key;
        const config = columnKey ? columnConfigs[columnKey] : null;

        // --- BỔ SUNG GHI LOG: Chuẩn bị dữ liệu ---
        const columnLabel = ALL_COLUMNS.find(c => c.key === columnKey)?.label || field;
        const originalRawValue = applicantInfo[field];

        // Hàm helper để lấy giá trị hiển thị
        const getDisplayValue = (rawValue, lookupConfig, lookupData) => {
            if (rawValue === null || rawValue === undefined || rawValue === '') return 'rỗng';
            if (lookupConfig) {
                if (lookupConfig.editor === 'checkbox') return rawValue ? '✓' : 'trống';
                if (lookupConfig.editor === 'date') return moment(rawValue).format('DD/MM/YYYY');
                const options = lookupData ? (lookupData[lookupConfig.lookupKey] || []) : [];
                if (lookupConfig.editor === 'select') {
                    return options.find(opt => opt[lookupConfig.valueField] == rawValue)?.[lookupConfig.labelField] || rawValue;
                }
                // select-simple
                return rawValue;
            }
            return rawValue;
        };

        const oldDisplayValue = getDisplayValue(originalRawValue, config, lookups);
        const newDisplayValue = getDisplayValue(value, config, lookups);
        
        const logPayload = {
            columnLabel,
            oldDisplayValue: `"${oldDisplayValue}"`,
            newDisplayValue: `"${newDisplayValue}"`,
        };
        // --- Kết thúc chuẩn bị dữ liệu log ---

        let updatedDisplayFields = {};
        if (config?.editor === 'select' && lookups) {
            const lookupArray = lookups[config.lookupKey] || [];
            const label = lookupArray.find(opt => opt[config.valueField] == value)?.[config.labelField];
            updatedDisplayFields[columnKey] = label;
        } else if (config?.editor === 'select-simple') {
            updatedDisplayFields[columnKey] = value;
        }

        setApplicants(prev => prev.map(app => app.MaTSXT === maTSXT ? { ...app, [field]: value, ...updatedDisplayFields } : app));

        try {
            // Gửi `logPayload` lên server
            await axiosInstance.patch(`/admissions/applicant/${maTSXT}/update-field`, { field, value, logPayload });
            toast.success(`Đã cập nhật ${columnLabel}!`);
        } catch (error) {
            setApplicants(prev => prev.map(app => app.MaTSXT === maTSXT ? originalApplicant : app));
            toast.error(error.response?.data?.message || 'Cập nhật thất bại.');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-116px)]">
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-800 dark:text-white text-center uppercase">
                    DANH SÁCH TUYỂN SINH
                </h1>
            </div>

            <div className="flex-1 flex flex-col min-h-0 px-4 sm:px-6 pb-4 sm:pb-6">
                 <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="p-3 border-b dark:border-gray-700 flex-shrink-0">
                        <PageNavbar
                            periods={periods} selectedPeriod={selectedPeriod} onPeriodChange={handlePeriodChange}
                            searchTerm={searchTerm} onSearchChange={e => setSearchTerm(e.target.value)}
                            visibleColumns={visibleColumns} onVisibilityChange={handleVisibilityChange} loading={loading}
                            onOpenApplicantFeeModal={handleOpenApplicantFeeModal} onExportExcel={handleExportExcel}
                            onExportCSV={handleExportCSV} onExportReceipts={handleExportReceipts}
                            admissionStatusFilter={admissionStatusFilter} onAdmissionStatusFilterChange={handleAdmissionStatusFilterChange}
                            onAddNew={handleAddNew} onEdit={handleEdit} canPerformActions={canPerformActions}
                            isEditDisabled={isEditDisabled} onPrintAdmissionNotice={handlePrintAdmissionNotice}
                            isAdmissionNoticeDisabled={isAdmissionNoticeDisabled} onDelete={handleDelete}
                            isDeleteDisabled={isDeleteDisabled} selectedApplicant={selectedApplicant}
                        />
                    </div>
                     <div className="flex justify-between items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 border-b dark:border-gray-700 flex-shrink-0">
                        <span>
                            Hiển thị {applicants.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, totalApplicants)} trên tổng số <strong>{totalApplicants}</strong> thí sinh
                        </span>
                        <div className="flex items-center gap-2">
                            <label htmlFor="pageSizeSelect">Số dòng/trang:</label>
                            <select id="pageSizeSelect" value={pageSize} onChange={handlePageSizeChange} className="h-7 px-2 border border-gray-300 rounded-md dark:bg-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                                <option value={15}>15</option><option value={30}>30</option><option value={50}>50</option><option value={100}>100</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex-grow min-h-0 overflow-auto">
                        {loading.data ? (<div className="flex items-center justify-center h-full"><Loader className="w-10 h-10 animate-spin text-blue-600" /></div>) :
                            error ? (<div className="flex flex-col items-center justify-center h-full text-center p-10 text-red-600"><AlertCircle className="w-12 h-12 mb-4" /><p className="font-semibold">{error}</p></div>) :
                                (
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-row-hover">
                                        <thead className="bg-gray-100 dark:bg-gray-700/50 font-semibold sticky top-0 z-10">
                                            <tr>
                                                <th className="px-2 py-2 text-center text-xs uppercase w-12">Stt</th>
                                                {visibleColumnsList.map(col => (
                                                    <th key={col.key} className={`px-4 py-2 text-${col.align || 'left'} text-xs uppercase tracking-wider`}>
                                                        {col.sortable ? (
                                                            <button onClick={() => handleSort(col.key)} className="flex items-center gap-1 hover:text-blue-600">
                                                                <span>{col.label}</span>
                                                                {sortConfig.key === col.key && ( sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} /> )}
                                                            </button>
                                                        ) : ( <span>{col.label}</span> )}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {applicants.map((s, index) => (
                                                <tr key={s.MaTSXT} onClick={() => setSelectedApplicantId(s.MaTSXT)} className={cn(selectedApplicantId === s.MaTSXT && "text-blue-600 dark:text-blue-400 font-bold bg-blue-100 dark:bg-blue-900/50")}>
                                                    <td className="px-2 py-2 text-center text-sm w-12">{(currentPage - 1) * pageSize + index + 1}</td>
                                                    {visibleColumnsList.map(col => {
                                                        const isEditable = columnConfigs[col.key] && (isAdmin || isTuyensinh);
                                                        return (
                                                            <td key={col.key} className={`px-4 py-1 text-sm whitespace-nowrap`}>
                                                                {isEditable ? (
                                                                    <EditableCell 
                                                                        applicant={s} 
                                                                        column={col} 
                                                                        onSave={handleUpdateApplicantField} 
                                                                        lookups={lookups} 
                                                                        isLoadingLookups={loading.lookups} 
                                                                    />
                                                                ) : (
                                                                    <div className={`text-${col.align || 'left'}`}>
                                                                    {(() => {
                                                                        let cellValue;
                                                                        if (col.key === 'QuyetdinhTrungTuyen') cellValue = s.SoQuyetdinh ? `${s.SoQuyetdinh}, ${moment(s.NgaykyQuyetdinh).format('DD/MM/YYYY')}` : '';
                                                                        else if (['Nhaphoc', 'Phanlop', 'Trungtuyen', 'Gioitinh'].includes(col.key)) cellValue = (s[col.key] === 1 || s[col.key] === true) ? '✓' : '';
                                                                        else if (['Ngaysinh', 'NgaycapCMND'].includes(col.key)) cellValue = s[col.key] ? moment(s[col.key]).format('DD/MM/YYYY') : '';
                                                                        else if (['DiemUT', 'TongDXT'].includes(col.key) && typeof s[col.key] === 'number') cellValue = s[col.key].toFixed(2);
                                                                        else cellValue = s[col.key];
                                                                        return cellValue;
                                                                    })()}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        )
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                        {!loading.data && !error && applicants.length === 0 && (<div className="text-center py-10 text-gray-500"><p>Không có thí sinh phù hợp với điều kiện.</p></div>)}
                    </div>
                    
                    {totalPages > 1 && ( <div className="flex-shrink-0 border-t dark:border-gray-700"> <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => fetchData(page)} /> </div> )}
                    
                </div>
            </div>

            {isApplicantFeeModalOpen && <ApplicantFeeModal isOpen={isApplicantFeeModalOpen} onClose={() => setIsApplicantFeeModalOpen(false)} periodInfo={selectedPeriodInfo} applicants={applicants} selectedApplicantId={selectedApplicantId} />}
            {isApplicantModalOpen && <ApplicantModal isOpen={isApplicantModalOpen} onClose={handleSaveSuccess} mode={modalMode} applicantId={selectedApplicantId} periodInfo={selectedPeriodInfo} onSaveSuccess={handleSaveSuccess} />}
            <ConfirmationModal open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen} onConfirm={handleConfirmDelete} title="Xác nhận xóa thí sinh" description={`Bạn hãy kiểm tra cẩn thận, nếu xóa thì tất cả dữ liệu của thí sinh ${selectedApplicant?.Holot || ''} ${selectedApplicant?.Ten || ''} sẽ mất?`} />
        </div>
    );
};

export default AdmissionsPage;



