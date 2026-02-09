/*
* D:\QLDT-app\client\src\pages\ScheduleBuilderPage.jsx
* Cập nhật: 27/01/2026
* Tóm tắt những nội dung cập nhật (bổ sung):
* - Bổ sung API Nhóm phòng, Học vị
*/
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axiosInstance from '../api/axios';
import useAuthStore from '../store/authStore';
import moment from 'moment-timezone';
import { toast } from 'react-hot-toast';
// BỔ SUNG: Thêm FileDown, Layers, ClipboardList vào danh sách import
import { ShieldAlert, Loader, University, Book, Users, Clipboard, ClipboardPaste, PlusCircle, Edit, Trash2, CalendarDays, Calendar, ChevronDown, Save, X as CloseIcon, FileDown, Layers, ClipboardList, Clock, MapPin } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { cn } from '../lib/utils';
import ConfirmationModal from '../components/ui/ConfirmationModal';
// SỬA LỖI: Bổ sung thư viện Dialog bị thiếu
import * as Dialog from '@radix-ui/react-dialog';
//Bước 1: Bổ sung Import hook
import { usePageLogger } from '../hooks/usePageLogger';


// BỔ SUNG: Hàm hỗ trợ xuất file CSV
const exportToCsv = (filename, rows) => {
    if (!rows || !rows.length) {
        return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
        '\uFEFF' + // BOM for UTF-8
        keys.join(separator) +
        '\n' +
        rows.map(row => {
            return keys.map(k => {
                let cell = row[k] === null || row[k] === undefined ? '' : row[k];
                cell = cell instanceof Date
                    ? cell.toLocaleString()
                    : cell.toString().replace(/"/g, '""');
                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = `"${cell}"`;
                }
                return cell;
            }).join(separator);
        }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};


// --- COMPONENT CON ---
const ControlSelect = ({ label, value, onChange, options, disabled = false, loading = false, icon, className = "" }) => (
    <div className={`flex-1 min-w-[200px] ${className}`}>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {icon}
            {label}:
        </label>
        <div className="relative">
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled || loading}
                className="w-full p-2 pr-8 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-200 dark:disabled:bg-gray-600 focus:ring-2 focus:ring-blue-500 appearance-none"
            >
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {loading && <Loader className="w-4 h-4 animate-spin absolute right-10 top-1/2 -translate-y-1/2" />}
        </div>
    </div>
);

const ScheduleEditModal = ({ isOpen, onClose, onSave, mode, initialData, allTeachers, isSaving }) => {
    const { isAdmin } = useAuthStore();
    const [formData, setFormData] = useState({});
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    // BỔ SUNG: State cho nhóm phòng
    const [nhomphongList, setNhomphongList] = useState([]);
    const [selectedNhomphong, setSelectedNhomphong] = useState('all');

    // BỔ SUNG: Fetch danh sách nhóm phòng khi modal mở
    useEffect(() => {
        if (isOpen) {
            setFormData(initialData);
            setSelectedNhomphong('all');
            axiosInstance.get('/schedule-builder/nhomphong')
                .then(res => setNhomphongList(res.data || []))
                .catch(() => toast.error("Lỗi khi tải danh sách nhóm phòng."));
        }
    }, [isOpen, initialData]);

    // CẬP NHẬT: Thêm selectedNhomphong vào dependencies và params
    useEffect(() => {
        if (!isOpen || !formData.Ngay || !formData.Tiet || !formData.Sotiet) {
            setAvailableRooms([]);
            return;
        }
        setLoadingRooms(true);
        const params = {
            ngay: moment(formData.Ngay).format('YYYY-MM-DD'),
            tietStart: formData.Tiet,
            soTiet: formData.Sotiet,
            maNP: selectedNhomphong,
            ...(mode === 'edit' && {
                excludeMaLHP: initialData.MaLHP,
                excludeTiet: initialData.originalData.Tiet
            })
        };
        axiosInstance.get('/schedule-builder/resources', { params })
            .then(res => {
                const rooms = res.data.rooms || [];
                if (mode === 'edit' && initialData.MaPH && !rooms.some(r => r.MaPH === initialData.MaPH)) {
                    rooms.unshift({ MaPH: initialData.MaPH, Tenphong: initialData.Tenphong });
                }
                setAvailableRooms(rooms);
            })
            .catch(() => toast.error("Lỗi khi tải danh sách phòng trống."))
            .finally(() => setLoadingRooms(false));
    }, [isOpen, formData.Ngay, formData.Tiet, formData.Sotiet, selectedNhomphong, mode, initialData]);

    const handleChange = (field, value) => {
        const isNumericField = field === 'Tiet' || field === 'Sotiet';
        const processedValue = isNumericField ? parseInt(value, 10) : value;
        const newFormData = { ...formData, [field]: processedValue };
        setFormData(newFormData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.MaPH) {
            toast.error("Vui lòng chọn phòng học.");
            return;
        }
        onSave(formData);
    };

    const tietOptions = useMemo(() => {
        if (!initialData || !initialData.Tiet) return [];
        const isMorning = initialData.Tiet <= 6;
        return isMorning
            ? Array.from({ length: 6 }, (_, i) => ({ value: i + 1, label: `Tiết ${i + 1}` }))
            : Array.from({ length: 6 }, (_, i) => ({ value: i + 7, label: `Tiết ${i + 7}` }));
    }, [initialData]);

    const soTietOptions = useMemo(() => {
        const startTiet = parseInt(formData.Tiet) || 1;
        const maxTiet = (startTiet <= 6) ? (6 - startTiet + 1) : (12 - startTiet + 1);
        return Array.from({ length: Math.min(6, maxTiet) }, (_, i) => ({ value: i + 1, label: `${i + 1} tiết` }));
    }, [formData.Tiet]);

    if (!formData) return null;

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-black/50 fixed inset-0 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 w-[90vw] max-w-md p-6">
                    <Dialog.Title className="text-lg font-bold text-primary dark:text-white">
                        {mode === 'add' ? 'Thêm Lịch học' : 'Sửa Lịch học'}
                    </Dialog.Title>
                    <Dialog.Description className="text-gray-500 dark:text-gray-400 mt-1 mb-4">
                        Ngày: {moment(formData.Ngay).format('DD/MM/YYYY')}
                    </Dialog.Description>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium">Tên lớp HP:</label>
                            <input type="text" value={initialData.Tenlop || ''} disabled className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-md" />
                        </div>
                        <ControlSelect label="Giảng viên" value={formData.MaGV || ''} onChange={val => handleChange('MaGV', val)} options={allTeachers.map(t => ({ value: t.MaGV, label: t.HoTen }))} disabled={!isAdmin} icon={<Users className="w-5 h-5 text-gray-500" />} />
                        {/* CẬP NHẬT: Responsive flex cho Tiết bắt đầu và Số tiết */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <ControlSelect label="Tiết bắt đầu" value={formData.Tiet || ''} onChange={val => handleChange('Tiet', val)} options={tietOptions} className="flex-1" />
                            <ControlSelect label="Số tiết" value={formData.Sotiet || ''} onChange={val => handleChange('Sotiet', val)} options={soTietOptions} className="flex-1" />
                        </div>
                        {/* BỔ SUNG: Combobox Nhóm phòng */}
                        <ControlSelect
                            label="Nhóm phòng"
                            value={selectedNhomphong}
                            onChange={val => { setSelectedNhomphong(val); handleChange('MaPH', ''); }}
                            options={[{ value: 'all', label: 'Tất cả' }, ...nhomphongList.map(np => ({ value: np.MaNP, label: np.Nhomphong }))]}
                            icon={<Layers className="w-5 h-5 text-gray-500" />}
                        />
                        <ControlSelect
                            label="Phòng"
                            value={formData.MaPH || ''}
                            onChange={val => handleChange('MaPH', val)}
                            options={[{ value: '', label: '<-- Chọn phòng -->' }, ...availableRooms.map(r => ({ value: r.MaPH, label: r.Tenphong }))]}
                            loading={loadingRooms}
                            icon={<University className="w-5 h-5 text-gray-500" />}
                        />
                        <div className="space-y-1">
                            <label className="block text-sm font-medium">Ghi chú:</label>
                            <input type="text" value={formData.Ghichu || ''} onChange={e => handleChange('Ghichu', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700" />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <Dialog.Close asChild><button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">Thoát</button></Dialog.Close>
                            <button type="submit" disabled={isSaving || loadingRooms} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2">
                                {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Lưu
                            </button>
                        </div>
                    </form>
                    <Dialog.Close asChild><button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><CloseIcon /></button></Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

const ScheduleCell = ({ data, selectedLopHP, selectedTenlop, selectedMaGV, onAdd, onEdit, onDelete, dayInfo, tiet }) => {
    if (!data) {
        return (
            <td className="border border-gray-200 dark:border-gray-700 p-1 text-center h-[60px]">
                <button onClick={() => onAdd(dayInfo, tiet)} className="text-gray-300 dark:text-gray-600 hover:text-blue-500 transition-colors" title="Thêm mới">
                    <PlusCircle className="w-5 h-5" />
                </button>
            </td>
        );
    }

    const isCurrentClass = data.MaLHP === selectedLopHP;
    const isClassNameConflict = !isCurrentClass && data.Tenlop === selectedTenlop;
    const isTeacherConflict = !isCurrentClass && !isClassNameConflict && data.MaGV === selectedMaGV;

    let bgColor = 'bg-white dark:bg-gray-800';
    if (isCurrentClass) {
        bgColor = 'bg-yellow-100 dark:bg-yellow-800/40';
    } else if (isClassNameConflict) {
        bgColor = 'bg-purple-100 dark:bg-purple-900/40';
    } else if (isTeacherConflict) {
        bgColor = 'bg-blue-100 dark:bg-blue-900/50';
    }

    return (
        <td rowSpan={data.Sotiet} className={`border border-gray-200 dark:border-gray-700 p-0 align-top relative group ${bgColor}`}>
            <div className="p-1.5 text-left text-[13px] flex flex-col h-full">
                <div className="flex items-start justify-between">
                    <strong className="font-semibold text-gray-900 dark:text-white">{data.TenHP}</strong>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 shrink-0">({data.Sotiet} tiết)</span>
                </div>
                <span className='text-xs text-gray-600 dark:text-gray-300'>{data.Tenlop}</span>
                {data.Ghichu && <span className="text-xs text-amber-600 dark:text-amber-400">Ghi chú: {data.Ghichu}</span>}
                {/* BỔ SUNG: Hiển thị Nhomphong bên dưới Tenphong */}
                <div className="mt-1 space-y-0.5 text-blue-600 dark:text-blue-400 font-medium flex-grow">
                    <span className="block"><Users className="w-3 h-3 inline mr-1.5" />{data.HoTenGV}</span>
                    <span className="block text-red-600 dark:text-red-400"><University className="w-3 h-3 inline mr-1.5" />{data.Tenphong}</span>
                    {data.Nhomphong && <span className="block text-gray-500 dark:text-gray-400 text-xs"><Layers className="w-3 h-3 inline mr-1.5" />{data.Nhomphong}</span>}
                </div>
            </div>
            {isCurrentClass && (
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(data)} className="p-1 bg-white/50 dark:bg-black/50 rounded hover:bg-green-500 hover:text-white" title="Sửa"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(data)} className="p-1 bg-white/50 dark:bg-black/50 rounded hover:bg-red-500 hover:text-white" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                </div>
            )}
        </td>
    );
};

// BỔ SUNG: Component hiển thị lịch thi trong grid
const ExamCell = ({ data }) => {
    // Tính toán số tiết từ thời gian thi (Thoigian = số phút)
    const soTiet = Math.ceil((data.Thoigian || 90) / 50); // 50 phút/tiết, mặc định 90 phút = 2 tiết

    // Format thời gian
    const gio = String(data.Gio || 0).padStart(2, '0');
    const phut = String(data.Phut || 0).padStart(2, '0');
    const thoiGianThi = `${gio}:${phut}`;

    return (
        <td rowSpan={soTiet} className="border border-red-300 dark:border-red-700 p-0 align-top bg-red-100 dark:bg-red-900/50">
            <div className="p-1.5 text-left text-[12px] flex flex-col h-full">
                <div className="flex items-start justify-between">
                    <strong className="font-semibold text-red-800 dark:text-red-200 flex items-center gap-1">
                        <ClipboardList className="w-3 h-3 shrink-0" />
                        THI
                    </strong>
                    <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">{data.Lanthi}</span>
                </div>
                <span className="text-red-700 dark:text-red-300 font-medium mt-1 line-clamp-2">{data.TenHocPhan}</span>
                <div className="mt-1 space-y-0.5 text-red-600 dark:text-red-400 text-xs flex-grow">
                    <span className="block flex items-center gap-1"><Clock className="w-3 h-3" />{thoiGianThi} ({data.Thoigian}')</span>
                    <span className="block flex items-center gap-1"><MapPin className="w-3 h-3" />{data.DiaDiemThi || data.Phongthi}</span>
                    {data.CBCoiThi1 && <span className="block"><Users className="w-3 h-3 inline mr-1" />{data.CBCoiThi1}</span>}
                    {data.CBCoiThi2 && <span className="block ml-4">{data.CBCoiThi2}</span>}
                </div>
            </div>
        </td>
    );
};

// --- COMPONENT CHÍNH ---
const ScheduleBuilderPage = () => {
    //Bước 2: Gọi ghi log
    // Tên '...' sẽ được ghi vào cột 'Cuaso'
    usePageLogger('Xây dựng TKB');

    const { user, isAdmin, isLoggedIn } = useAuthStore();
    const canBuild = isAdmin || user?.isXepTKB === 1;

    const [semesters, setSemesters] = useState([]);
    const [weeks, setWeeks] = useState([]);
    const [donviList, setDonviList] = useState([]);
    const [hocphanList, setHocphanList] = useState([]);
    const [lopHPList, setLopHPList] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedWeek, setSelectedWeek] = useState('');
    const [selectedDonvi, setSelectedDonvi] = useState('');
    const [selectedHocphan, setSelectedHocphan] = useState('');
    const [selectedLopHP, setSelectedLopHP] = useState('');

    // BỔ SUNG: State để lưu tên giảng viên
    const [teacherName, setTeacherName] = useState('');

    const [scheduleGrid, setScheduleGrid] = useState([]);
    const [soTietDaXep, setSoTietDaXep] = useState(0);
    const [loading, setLoading] = useState({
        semesters: true, weeks: false, donvi: true, hocphan: false, lophp: false, schedule: false
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [modalInitialData, setModalInitialData] = useState(null);
    const [allTeachers, setAllTeachers] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, data: null });
    const [clipboard, setClipboard] = useState({ sourceWeek: null, sourceMaLHP: null, sourceTenlop: null, entries: [] });
    const [isExporting, setIsExporting] = useState(false);
    // BỔ SUNG: State cho lịch thi
    const [examSchedule, setExamSchedule] = useState([]);
    // BỔ SUNG: State cho cảnh báo trùng sinh viên
    const [overlapWarning, setOverlapWarning] = useState({
        isOpen: false,
        conflicts: [],
        pendingData: null,
        pendingAction: null // 'save' | 'paste'
    });

    // BỔ SUNG: Component dialog cảnh báo trùng sinh viên
    const OverlapWarningDialog = () => {
        if (!overlapWarning.isOpen) return null;

        const totalStudents = overlapWarning.conflicts.reduce((sum, c) => sum + c.count, 0);

        return (
            <Dialog.Root open={overlapWarning.isOpen} onOpenChange={(open) => !open && setOverlapWarning({ isOpen: false, conflicts: [], pendingData: null, pendingAction: null })}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md z-50">
                        <Dialog.Title className="text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-4">
                            <ShieldAlert className="w-6 h-6" />
                            Cảnh báo trùng sinh viên
                        </Dialog.Title>
                        <Dialog.Description asChild>
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                <p className="mb-3">
                                    Lớp đang xếp lịch có <strong className="text-red-600">{totalStudents}</strong> sinh viên trùng lịch học tại:
                                </p>
                                <ul className="list-none space-y-2 mb-4 pl-2 border-l-4 border-amber-400">
                                    {overlapWarning.conflicts.map((c, i) => (
                                        <li key={i} className="bg-amber-50 dark:bg-amber-900/30 p-2 rounded">
                                            <div><strong>- Lớp:</strong> {c.Tenlop}</div>
                                            <div><strong>- Học phần:</strong> {c.Viettat}</div>
                                            <div className="text-xs text-gray-500 mt-1">({c.count} sinh viên trùng)</div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Dialog.Description>
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setOverlapWarning({ isOpen: false, conflicts: [], pendingData: null, pendingAction: null })}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition-colors"
                            >
                                Thoát
                            </button>
                            <button
                                onClick={async () => {
                                    setOverlapWarning({ isOpen: false, conflicts: [], pendingData: null, pendingAction: null });
                                    if (overlapWarning.pendingAction === 'save') {
                                        await handleForceSave(overlapWarning.pendingData);
                                    } else if (overlapWarning.pendingAction === 'paste') {
                                        await handleForcePaste(overlapWarning.pendingData);
                                    }
                                }}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors"
                            >
                                Vẫn lưu
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        );
    };

    useEffect(() => {
        if (canBuild) {
            axiosInstance.get('/schedule-builder/resources', { params: { ngay: '1970-01-01', tietStart: 1, soTiet: 1 } })
                .then(res => { setAllTeachers(res.data.teachers || []); })
                .catch(() => toast.error("Không thể tải danh sách Giảng viên."));
        }
    }, [canBuild]);

    // BỔ SUNG: useEffect để cập nhật tên giảng viên khi chọn Lớp HP
    useEffect(() => {
        if (selectedLopHP && lopHPList.length > 0 && allTeachers.length > 0) {
            const currentLop = lopHPList.find(l => l.MaLHP === selectedLopHP);
            if (currentLop && currentLop.MaGV) {
                const teacher = allTeachers.find(t => t.MaGV === currentLop.MaGV);
                setTeacherName(teacher ? teacher.HoTen : 'Chưa có GV');
            } else {
                setTeacherName('Chưa có GV');
            }
        } else {
            setTeacherName('');
        }
    }, [selectedLopHP, lopHPList, allTeachers]);

    // CẬP NHẬT: Logic fetch học kỳ
    useEffect(() => {
        setLoading(p => ({ ...p, semesters: true }));
        // CẬP NHẬT: Gọi API mới
        axiosInstance.get('/schedule-builder/semesters')
            .then(res => {
                // CẬP NHẬT: Xử lý response object
                const { semesters, defaultSemester } = res.data;
                setSemesters(semesters.map(s => ({ value: s.MaHK, label: s.Hocky })));

                // CẬP NHẬT: Gán giá trị mặc định từ backend
                if (defaultSemester) {
                    setSelectedSemester(defaultSemester);
                } else if (semesters.length > 0) {
                    setSelectedSemester(semesters[0].MaHK);
                }
            })
            .catch(() => toast.error("Lỗi khi tải danh sách học kỳ."))
            .finally(() => setLoading(p => ({ ...p, semesters: false })));
    }, []);


    useEffect(() => {
        if (!selectedSemester) return;
        setLoading(p => ({ ...p, weeks: true }));
        setWeeks([]); setSelectedWeek('');
        axiosInstance.get(`/schedule-builder/weeks-by-semester?mahk=${selectedSemester}`).then(res => {
            const weekData = res.data;
            setWeeks(weekData);
            if (weekData.length > 0) {
                const now = moment().tz('Asia/Ho_Chi_Minh');
                const defaultWeek = weekData.find(t => now.isBetween(moment(t.value.split('_')[0]), moment(t.value.split('_')[1]), 'day', '[]'));
                setSelectedWeek(defaultWeek ? defaultWeek.value : weekData[0].value);
            }
        }).catch(() => toast.error("Lỗi khi tải danh sách tuần.")).finally(() => setLoading(p => ({ ...p, weeks: false })));
    }, [selectedSemester]);

    useEffect(() => {
        if (!isLoggedIn || !canBuild) return;
        setLoading(p => ({ ...p, donvi: true }));
        axiosInstance.get('/schedule-builder/donvi')
            .then(res => {
                const donviData = res.data || [];
                setDonviList(donviData);
                if (isAdmin && donviData.length > 0) {
                    setSelectedDonvi(donviData[0].MaDV);
                } else if (!isAdmin && user?.maDV) {
                    setSelectedDonvi(user.maDV);
                }
            }).catch(() => toast.error("Lỗi khi tải danh sách đơn vị.")).finally(() => setLoading(p => ({ ...p, donvi: false })));
    }, [isLoggedIn, canBuild, isAdmin, user]);

    useEffect(() => {
        if (!selectedDonvi || !selectedSemester) return;
        setLoading(p => ({ ...p, hocphan: true }));
        setHocphanList([]); setSelectedHocphan('');
        axiosInstance.get(`/schedule-builder/hocphan?maDV=${selectedDonvi}&maHK=${selectedSemester}`).then(res => {
            setHocphanList(res.data);
            if (res.data.length > 0) setSelectedHocphan(res.data[0].MaHP);
        }).catch(() => toast.error("Lỗi khi tải danh sách học phần.")).finally(() => setLoading(p => ({ ...p, hocphan: false })));
    }, [selectedDonvi, selectedSemester]);

    useEffect(() => {
        if (!selectedHocphan || !selectedSemester || !selectedDonvi) { setLopHPList([]); setSelectedLopHP(''); return; };
        setLoading(p => ({ ...p, lophp: true }));
        axiosInstance.get(`/schedule-builder/lophp?maHP=${selectedHocphan}&maHK=${selectedSemester}&maDV=${selectedDonvi}`).then(res => {
            setLopHPList(res.data);
            if (res.data.length > 0) setSelectedLopHP(res.data[0].MaLHP);
        }).catch(() => toast.error("Lỗi khi tải danh sách lớp HP.")).finally(() => setLoading(p => ({ ...p, lophp: false })));
    }, [selectedHocphan, selectedSemester, selectedDonvi]);

    const fetchTKBData = useCallback(() => {
        if (!selectedLopHP || !selectedWeek || lopHPList.length === 0) {
            setScheduleGrid(Array(12).fill(null).map(() => Array(7).fill(null)));
            setSoTietDaXep(0);
            return;
        }
        const currentLopHP = lopHPList.find(l => l.MaLHP === selectedLopHP);
        if (!currentLopHP) return;

        const params = {
            maGV: currentLopHP.MaGV,
            tenlop: currentLopHP.Tenlop,
            maLHP: currentLopHP.MaLHP,
            startDate: selectedWeek.split('_')[0],
            endDate: selectedWeek.split('_')[1],
        };

        setLoading(prev => ({ ...prev, schedule: true }));
        axiosInstance.get(`/schedule-builder/tkb-data`, { params }).then(res => {
            const newGrid = Array(12).fill(null).map(() => Array(7).fill(null));
            let totalTietLopHienTai = 0;
            const currentLopData = res.data.filter(item => item.MaLHP === selectedLopHP);
            if (currentLopData.length > 0) {
                totalTietLopHienTai = currentLopData[0].SoTietTichLuy;
            }

            res.data.forEach(item => {
                const dayIndex = moment(item.Ngay).isoWeekday() - 1;
                const tietIndex = item.Tiet - 1;
                if (tietIndex >= 0 && tietIndex < 12 && dayIndex >= 0 && dayIndex < 7) {
                    newGrid[tietIndex][dayIndex] = item;
                    for (let i = 1; i < item.Sotiet; i++) {
                        if (tietIndex + i < 12) newGrid[tietIndex + i][dayIndex] = 'occupied';
                    }
                }
            });
            setScheduleGrid(newGrid);
            setSoTietDaXep(totalTietLopHienTai);
        }).catch(() => toast.error("Lỗi khi tải dữ liệu TKB.")).finally(() => setLoading(prev => ({ ...prev, schedule: false })));
    }, [selectedLopHP, selectedWeek, lopHPList]);
    useEffect(fetchTKBData, [fetchTKBData]);

    // BỔ SUNG: Fetch lịch thi của giảng viên trong tuần được chọn
    const fetchExamSchedule = useCallback(() => {
        const currentLopHP = lopHPList.find(l => l.MaLHP === selectedLopHP);
        if (!selectedWeek || !currentLopHP?.MaGV) {
            setExamSchedule([]);
            return;
        }

        const [startDate, endDate] = selectedWeek.split('_');
        axiosInstance.get('/schedule-builder/exam-schedule-by-teacher', {
            params: { maGV: currentLopHP.MaGV, startDate, endDate }
        })
            .then(res => {
                setExamSchedule(res.data || []);
            })
            .catch(err => {
                console.error("Lỗi khi tải lịch thi:", err);
                setExamSchedule([]);
            });
    }, [selectedWeek, selectedLopHP, lopHPList]);
    useEffect(fetchExamSchedule, [fetchExamSchedule]);

    const handleOpenAddModal = (dayInfo, tiet) => {
        const currentLopHP = lopHPList.find(l => l.MaLHP === selectedLopHP);
        if (!currentLopHP) { toast.error("Vui lòng chọn một Lớp học phần trước."); return; }
        setModalInitialData({ Ngay: dayInfo, Tiet: tiet, Sotiet: 1, MaLHP: currentLopHP.MaLHP, Tenlop: currentLopHP.Tenlop, MaGV: currentLopHP.MaGV, MaPH: '', Ghichu: '' });
        setModalMode('add');
        setIsModalOpen(true);
    };
    const handleOpenEditModal = (scheduleItem) => {
        const currentLopHP = lopHPList.find(l => l.MaLHP === selectedLopHP);
        setModalInitialData({ ...scheduleItem, Tenlop: currentLopHP.Tenlop, originalData: { Ngay: scheduleItem.Ngay, Tiet: scheduleItem.Tiet, Sotiet: scheduleItem.Sotiet } });
        setModalMode('edit');
        setIsModalOpen(true);
    };
    const handleDeleteClick = (scheduleItem) => { setDeleteConfirm({ isOpen: true, data: scheduleItem }); };
    const confirmDelete = async () => {
        const item = deleteConfirm.data;
        if (!item) return;
        try {
            await axiosInstance.delete('/schedule-builder/tkb', { data: { MaLHP: item.MaLHP, Ngay: item.Ngay, Tiet: item.Tiet } });
            toast.success("Xóa buổi học thành công!");
            fetchTKBData();
        } catch (error) { toast.error(error.response?.data?.message || "Xóa thất bại."); }
        setDeleteConfirm({ isOpen: false, data: null });
    };

    const handleModalSave = async (formData) => {
        setIsSaving(true);
        try {
            let response;
            if (modalMode === 'add') {
                response = await axiosInstance.post('/schedule-builder/tkb', formData);
            } else {
                response = await axiosInstance.put('/schedule-builder/tkb', formData);
            }

            // BỔ SUNG: Kiểm tra trùng sinh viên
            if (response.data?.studentOverlap) {
                setOverlapWarning({
                    isOpen: true,
                    conflicts: response.data.conflicts,
                    pendingData: formData,
                    pendingAction: 'save'
                });
                setIsSaving(false);
                return;
            }

            toast.success("Lưu thành công!");
            fetchTKBData();
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Thao tác thất bại.");
        } finally {
            setIsSaving(false);
        }
    };

    // BỔ SUNG: Hàm lưu với forceOverlap khi người dùng chọn "Vẫn lưu"
    const handleForceSave = async (formData) => {
        setIsSaving(true);
        try {
            if (modalMode === 'add') {
                await axiosInstance.post('/schedule-builder/tkb?forceOverlap=true', formData);
            } else {
                await axiosInstance.put('/schedule-builder/tkb?forceOverlap=true', formData);
            }
            toast.success("Lưu thành công!");
            fetchTKBData();
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Thao tác thất bại.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopy = () => {
        const currentLopHP = lopHPList.find(l => l.MaLHP === selectedLopHP);
        if (!currentLopHP) {
            toast.error("Vui lòng chọn một lớp để sao chép.");
            return;
        }

        const entriesToCopy = scheduleGrid.flat().filter(cell => cell && cell !== 'occupied' && cell.MaLHP === selectedLopHP);

        if (entriesToCopy.length === 0) {
            toast.error("Không có lịch học nào trong tuần này để sao chép.");
            return;
        }

        setClipboard({
            sourceWeek: selectedWeek,
            sourceMaLHP: selectedLopHP,
            sourceTenlop: currentLopHP.Tenlop,
            entries: entriesToCopy.map(entry => ({
                dayIndex: moment(entry.Ngay).isoWeekday() - 1,
                Tiet: entry.Tiet,
                Sotiet: entry.Sotiet,
                MaPH: entry.MaPH,
                MaGV: entry.MaGV,
                Ghichu: entry.Ghichu,
            }))
        });
        toast.success(`Đã sao chép lịch của lớp ${currentLopHP.Tenlop}.`);
    };

    const handlePaste = async () => {
        const currentLopHP = lopHPList.find(l => l.MaLHP === selectedLopHP);
        if (clipboard.sourceMaLHP !== selectedLopHP) {
            toast.error(`Chức năng dán chỉ áp dụng cho lớp "${clipboard.sourceTenlop}". Vui lòng chọn lại lớp này.`);
            return;
        }

        const targetWeekStart = moment(selectedWeek.split('_')[0]);
        const batchEntries = clipboard.entries.map(entry => ({
            ...entry,
            Ngay: targetWeekStart.clone().add(entry.dayIndex, 'days').format('YYYY-MM-DD'),
        }));

        setIsSaving(true);
        try {
            const response = await axiosInstance.post('/schedule-builder/tkb/batch', {
                MaLHP: selectedLopHP,
                entries: batchEntries
            });

            // BỔ SUNG: Kiểm tra trùng sinh viên
            if (response.data?.studentOverlap) {
                setOverlapWarning({
                    isOpen: true,
                    conflicts: response.data.conflicts,
                    pendingData: batchEntries,
                    pendingAction: 'paste'
                });
                setIsSaving(false);
                return;
            }

            toast.success("Dán lịch học thành công!");
            fetchTKBData();
            setClipboard({ sourceWeek: null, sourceMaLHP: null, sourceTenlop: null, entries: [] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Dán thất bại.");
        } finally {
            setIsSaving(false);
        }
    };

    // BỔ SUNG: Hàm dán với forceOverlap khi người dùng chọn "Vẫn lưu"
    const handleForcePaste = async (batchEntries) => {
        setIsSaving(true);
        try {
            await axiosInstance.post('/schedule-builder/tkb/batch?forceOverlap=true', {
                MaLHP: selectedLopHP,
                entries: batchEntries
            });
            toast.success("Dán lịch học thành công!");
            fetchTKBData();
            setClipboard({ sourceWeek: null, sourceMaLHP: null, sourceTenlop: null, entries: [] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Dán thất bại.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = async () => {
        if (!selectedDonvi || !selectedWeek) {
            toast.error("Vui lòng chọn Đơn vị và Tuần để xuất file.");
            return;
        }

        setIsExporting(true);
        try {
            const [startDate, endDate] = selectedWeek.split('_');
            const params = { maDV: selectedDonvi, startDate, endDate };

            const response = await axiosInstance.get('/schedule-builder/export', { params });

            if (response.data && response.data.length > 0) {
                const donviName = donviList.find(d => d.MaDV === selectedDonvi)?.Donvi.replace(/\s/g, '_') || 'DonVi';
                const weekLabel = weeks.find(w => w.value === selectedWeek)?.label.split(':')[0].replace(/\s/g, '_') || 'Tuan';
                const filename = `TKB_${donviName}_${weekLabel}.csv`;

                toast.success("Đang tải file Excel...");
                exportToCsv(filename, response.data);
            } else {
                toast.error("Không có dữ liệu TKB để xuất cho lựa chọn hiện tại.");
            }

        } catch (error) {
            toast.error(error.response?.data?.message || "Xuất file thất bại.");
        } finally {
            setIsExporting(false);
        }
    };

    const currentLopHPInfo = lopHPList.find(l => l.MaLHP === selectedLopHP);
    const isPasteDisabled = !clipboard.sourceWeek || clipboard.sourceWeek === selectedWeek || isSaving;
    const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    const weekStartDate = selectedWeek ? selectedWeek.split('_')[0] : moment();

    if (!isLoggedIn) {
        return <div className="flex items-center justify-center h-full"><p>Đang tải...</p></div>;
    }
    if (!canBuild) {
        return (<div className="flex flex-col items-center justify-center h-full text-center p-10"><ShieldAlert className="w-16 h-16 text-red-500" /><h2 className="mt-4 text-2xl font-bold">Truy cập bị từ chối</h2><p className="mt-2 text-gray-600 dark:text-gray-300">Bạn không có quyền truy cập chức năng này.</p></div>);
    }

    return (
        <div className="p-4 sm:p-6 h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {isModalOpen && <ScheduleEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleModalSave} mode={modalMode} initialData={modalInitialData} allTeachers={allTeachers} isSaving={isSaving} />}
            <ConfirmationModal open={deleteConfirm.isOpen} onOpenChange={() => setDeleteConfirm({ isOpen: false, data: null })} onConfirm={confirmDelete} title="Xác nhận xóa?" description="Bạn có chắc muốn xóa buổi học này không? Hành động này không thể hoàn tác." />

            {/* BỔ SUNG: Dialog cảnh báo trùng sinh viên */}
            <OverlapWarningDialog />

            <h1 className="text-2xl font-bold text-blue-800 dark:text-white mb-4 text-center uppercase">Xây dựng Thời Khóa Biểu</h1>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <ControlSelect label="Học kỳ" value={selectedSemester} onChange={setSelectedSemester} options={semesters} loading={loading.semesters} icon={<Calendar className="w-5 h-5 text-gray-500" />} />
                    <ControlSelect label="Tuần" value={selectedWeek} onChange={setSelectedWeek} options={weeks.map(w => ({ value: w.value, label: w.label }))} loading={loading.weeks} icon={<CalendarDays className="w-5 h-5 text-gray-500" />} />
                    <ControlSelect label="Đơn vị" value={selectedDonvi} onChange={setSelectedDonvi} options={donviList.map(d => ({ value: d.MaDV, label: d.Donvi }))} disabled={!isAdmin} loading={loading.donvi} icon={<University className="w-5 h-5 text-gray-500" />} />
                </div>
                {/* CẬP NHẬT: Thay đổi layout grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ControlSelect label="Học phần" value={selectedHocphan} onChange={setSelectedHocphan} options={hocphanList.map(h => ({ value: h.MaHP, label: h.Hocphan }))} loading={loading.hocphan} icon={<Book className="w-5 h-5 text-gray-500" />} />
                    <ControlSelect label="Tên lớp HP" value={selectedLopHP} onChange={setSelectedLopHP} options={lopHPList.map(l => ({ value: l.MaLHP, label: l.Tenlop }))} loading={loading.lophp} icon={<Users className="w-5 h-5 text-gray-500" />} />

                    {/* BỔ SUNG: Control hiển thị tên giảng viên */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <Users className="w-5 h-5 text-gray-500" />
                            Giảng viên phụ trách:
                        </label>
                        <input
                            type="text"
                            value={teacherName}
                            disabled
                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 cursor-not-allowed"
                            placeholder="Chọn lớp học phần để xem"
                        />
                    </div>
                </div>
                {currentLopHPInfo && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md text-center font-semibold text-blue-800 dark:text-blue-200">
                        Số tiết đã xếp / Tổng số tiết: {soTietDaXep} / {currentLopHPInfo.Tongsotiet}
                    </div>
                )}
            </div>

            <div className="flex-grow overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm relative">
                {loading.schedule && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-20"><Loader className="w-8 h-8 animate-spin" /></div>}
                <table className="min-w-full border-collapse">
                    <thead className="bg-gray-700 text-white sticky top-0 z-10">
                        <tr>
                            <th className="p-2 w-16">Buổi</th><th className="p-2 w-12">Tiết</th>
                            {daysOfWeek.map((day, i) => (<th key={day} className="p-2 text-center"><div>{day}</div><div className="font-normal text-sm text-yellow-300">{moment(weekStartDate).add(i, 'days').format('DD/MM')}</div></th>))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 12 }).map((_, i) => {
                            const isAfternoon = i >= 6;
                            const rowClass = isAfternoon ? 'bg-amber-50/50 dark:bg-gray-800/60' : 'bg-blue-50/50 dark:bg-gray-900/60';
                            const dividerClass = i === 6 ? 'border-t-2 border-blue-300 dark:border-blue-700' : '';

                            // BỔ SUNG: Tính toán examGrid để xác định vị trí hiển thị lịch thi
                            // Tiết: 1-6 Sáng (7:00-11:50), 7-12 Chiều (13:00-17:50)
                            // Mỗi tiết ~50 phút
                            const getExamTiet = (gio, phut) => {
                                const totalMinutes = gio * 60 + phut;
                                // Sáng: 7:00 (420) - 11:50 (710) => Tiết 1-6
                                // Chiều: 13:00 (780) - 17:50 (1070) => Tiết 7-12
                                if (totalMinutes >= 420 && totalMinutes < 720) {
                                    return Math.floor((totalMinutes - 420) / 50) + 1; // Tiết 1-6
                                } else if (totalMinutes >= 780 && totalMinutes < 1080) {
                                    return Math.floor((totalMinutes - 780) / 50) + 7; // Tiết 7-12
                                }
                                return null;
                            };

                            return (
                                <tr key={i} className={`${rowClass} ${dividerClass}`}>
                                    {i === 0 && <td rowSpan="6" className="text-center font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">SÁNG</td>}
                                    {i === 6 && <td rowSpan="6" className="text-center font-bold bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">CHIỀU</td>}
                                    <td className="text-center font-semibold">{i + 1}</td>
                                    {Array.from({ length: 7 }).map((_, j) => {
                                        const dayInfo = moment(weekStartDate).add(j, 'days').format('YYYY-MM-DD');
                                        const tiet = i + 1;
                                        const cell = scheduleGrid[i]?.[j];

                                        // BỔ SUNG: Kiểm tra xem có lịch thi ở ô này không
                                        const examForCell = examSchedule.find(exam => {
                                            const examDate = moment(exam.Ngay).format('YYYY-MM-DD');
                                            if (examDate !== dayInfo) return false;
                                            const examTiet = getExamTiet(exam.Gio, exam.Phut);
                                            return examTiet === tiet;
                                        });

                                        // Kiểm tra xem ô này có bị "occupied" bởi exam không
                                        const isExamOccupied = examSchedule.some(exam => {
                                            const examDate = moment(exam.Ngay).format('YYYY-MM-DD');
                                            if (examDate !== dayInfo) return false;
                                            const examTiet = getExamTiet(exam.Gio, exam.Phut);
                                            if (!examTiet) return false;
                                            const examSoTiet = Math.ceil((exam.Thoigian || 90) / 50);
                                            // Kiểm tra nếu tiết hiện tại nằm trong khoảng của exam nhưng không phải là tiết bắt đầu
                                            return tiet > examTiet && tiet < examTiet + examSoTiet;
                                        });

                                        // Hiển thị ExamCell nếu có lịch thi
                                        if (examForCell) {
                                            return <ExamCell key={j} data={examForCell} />;
                                        }

                                        // Bỏ qua ô bị chiếm bởi exam
                                        if (isExamOccupied) {
                                            return null;
                                        }

                                        // Hiển thị ScheduleCell hoặc ô trống cho TKB
                                        if (cell && cell !== 'occupied') return <ScheduleCell key={j} data={cell} selectedLopHP={selectedLopHP} selectedTenlop={currentLopHPInfo?.Tenlop} selectedMaGV={currentLopHPInfo?.MaGV} onEdit={handleOpenEditModal} onDelete={handleDeleteClick} />;
                                        if (cell === 'occupied') return null;
                                        return <ScheduleCell key={j} data={null} onAdd={handleOpenAddModal} dayInfo={dayInfo} tiet={tiet} />;
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center items-center gap-4 mt-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400" disabled={!selectedLopHP || isSaving}>
                    <Clipboard className="w-5 h-5" /> Copy
                </button>
                <button onClick={handlePaste} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400" disabled={isPasteDisabled}>
                    <ClipboardPaste className="w-5 h-5" /> Paste
                </button>
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400" disabled={isExporting || !selectedDonvi || !selectedWeek}>
                    {isExporting ? <Loader className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
                    Excel
                </button>
            </div>
        </div>
    );
};

export default ScheduleBuilderPage;

