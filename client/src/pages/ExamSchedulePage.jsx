/*
* D:\QLDT-app\client\src\pages\ExamSchedulePage.jsx
* Cập nhật: 25/10/2025
* Tóm tắt: Bổ sung log khi mở trang
*/
import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import { Loader, AlertCircle, Search, FileDown, Calendar, CalendarClock } from 'lucide-react';
import { cn } from '../lib/utils';
import moment from 'moment-timezone';
//Bước 1: Bổ sung Import hook
import { usePageLogger } from '../hooks/usePageLogger';

// --- HÀM HỖ TRỢ (Không thay đổi) ---
const exportToCsv = (filename, rows) => {
    if (!rows || !rows.length) { toast.error("Không có dữ liệu để xuất."); return; }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent = '\uFEFF' + keys.join(separator) + '\n' + rows.map(row => {
        return keys.map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) { cell = `"${cell}"`; }
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
        toast.success("Đã xuất file Excel thành công!");
    }
};

// --- COMPONENT GIAO DIỆN THANH ĐIỀU HƯỚNG (Không thay đổi) ---
const PageNavbar = ({
    semesters, selectedSemester, onSemesterChange,
    filters, onFilterChange,
    searchTerm, onSearchChange,
    onExport, loading
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md mb-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <select value={selectedSemester} onChange={onSemesterChange} disabled={loading} className="p-2 border-2 border-gray-300 rounded-md dark:bg-gray-700 bg-white focus:border-blue-500 focus:ring-blue-500 min-w-[250px]">
                    {loading ? <option>Đang tải...</option> : semesters.map(s => (
                        <option key={s.MaHK} value={s.MaHK}>{`${s.Hocky} (${moment(s.Ngaybatdau).format('DD/MM/YYYY')} - ${moment(s.Ngayketthuc).format('DD/MM/YYYY')})`}</option>
                    ))}
                </select>
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="startDate" className="text-sm">Từ ngày:</label>
                <input type="date" id="startDate" name="startDate" value={filters.startDate} onChange={onFilterChange} className="p-2 border-2 border-gray-300 rounded-md dark:bg-gray-700 bg-white" />
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="endDate" className="text-sm">Đến ngày:</label>
                <input type="date" id="endDate" name="endDate" value={filters.endDate} onChange={onFilterChange} className="p-2 border-2 border-gray-300 rounded-md dark:bg-gray-700 bg-white" />
            </div>
            <div className="relative flex-grow min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Tìm lần thi, tên học phần, ngày thi..." value={searchTerm} onChange={onSearchChange} className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700" />
            </div>
            <button onClick={onExport} className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2 hover:bg-green-700 transition-colors ml-auto">
                <FileDown className="w-4 h-4" />
            </button>
        </div>
    );
};

// --- COMPONENT CHÍNH CỦA TRANG ---
const ExamSchedulePage = () => {
    //Bước 2: Gọi ghi log
    // Tên '...' sẽ được ghi vào cột 'Cuaso'
    usePageLogger('Xem Lịch thi');

    const [semesters, setSemesters] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [loading, setLoading] = useState({ semesters: true, schedules: false });
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        startDate: moment().format('YYYY-MM-DD'),
        endDate: moment().add(14, 'days').format('YYYY-MM-DD'),
    });

    // Logic chọn học kỳ mặc định: ĐÃ CHÍNH XÁC, không cần thay đổi
    useEffect(() => {
        setLoading(prev => ({ ...prev, semesters: true }));
        axiosInstance.get('/exam-schedule/semesters')
            .then(res => {
                const semesterData = res.data;
                setSemesters(semesterData);
                if (res.data.length > 0) {
                    const now = moment();
                    let defaultSemester = semesterData.find(s => now.isBetween(moment(s.Ngaybatdau), moment(s.Ngayketthuc)));
                    if (!defaultSemester) {
                        const semestersWithDiff = semesterData.map(s => ({ ...s, diff: Math.abs(moment(s.Ngaybatdau).diff(now)) }));
                        semestersWithDiff.sort((a, b) => a.diff - b.diff);
                        defaultSemester = semestersWithDiff[0];
                    }
                    setSelectedSemester(defaultSemester.MaHK);
                }
            })
            .catch(() => toast.error("Lỗi khi tải danh sách học kỳ."))
            .finally(() => setLoading(prev => ({ ...prev, semesters: false })));
    }, []);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    const fetchSchedules = useCallback(() => {
        if (!selectedSemester) return;
        setLoading(prev => ({ ...prev, schedules: true }));
        setError('');
        const params = {
            maHK: selectedSemester,
            startDate: filters.startDate,
            endDate: filters.endDate,
            searchTerm: debouncedSearchTerm,
        };
        axiosInstance.get('/exam-schedule/list', { params })
            .then(res => { setSchedules(res.data); })
            .catch(err => setError(err.response?.data?.message || "Lỗi khi tải dữ liệu lịch thi."))
            .finally(() => setLoading(prev => ({ ...prev, schedules: false })));
    }, [selectedSemester, filters, debouncedSearchTerm]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleExport = () => {
        if (schedules.length === 0) {
            toast.error("Không có dữ liệu để xuất.");
            return;
        }
        const dataToExport = schedules.map((item, index) => ({
            'STT': index + 1, 'Lần thi': item.Lanthi, 'Tên học phần': item.TenHocPhan,
            'Phòng thi': item.Phongthi, 'SLSV': item.SLSV,
            'Ngày thi': item.Ngay ? moment(item.Ngay).format('DD/MM/YYYY') : '',
            'Giờ thi': `${String(item.Gio || 0).padStart(2, '0')}:${String(item.Phut || 0).padStart(2, '0')}`,
            'Thời gian (phút)': item.Thoigian, 'CB coi thi 1': item.CBCoiThi1, 'CB coi thi 2': item.CBCoiThi2,
            'Địa điểm thi': item.DiaDiemThi, 'Ghi chú': item.Ghichu,
        }));
        const semesterName = semesters.find(s => s.MaHK === selectedSemester)?.Hocky || 'HocKy';
        const filename = `LichThi_${semesterName.replace(/\s/g, '_')}_${moment().format('DDMMYYYY')}.csv`;
        exportToCsv(filename, dataToExport);
    };

    return (
        <div className="p-4 sm:p-6 h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            <h1 className="text-2xl font-bold text-blue-800 dark:text-white mb-4 text-center uppercase">
                <CalendarClock className="inline-block w-8 h-8 mr-2" />
                XEM LỊCH THI
            </h1>

            <PageNavbar
                semesters={semesters}
                selectedSemester={selectedSemester}
                onSemesterChange={e => setSelectedSemester(e.target.value)}
                filters={filters}
                onFilterChange={handleFilterChange}
                searchTerm={searchTerm}
                onSearchChange={e => setSearchTerm(e.target.value)}
                onExport={handleExport}
                loading={loading.semesters}
            />

            <div className="flex-grow overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                {loading.schedules ? (
                    <div className="flex items-center justify-center h-full"><Loader className="w-10 h-10 animate-spin text-blue-600" /></div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-10 text-red-600"><AlertCircle className="w-12 h-12 mb-4" /><p className="font-semibold">{error}</p></div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed table-row-hover">
                        <thead className="bg-gray-200 dark:bg-gray-700 font-bold sticky top-0 z-10">
                            <tr>
                                <th className="px-2 py-3 text-center text-xs uppercase w-12">Stt</th>
                                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider w-24">Lần thi</th>
                                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider w-1/5">Tên học phần</th>
                                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider w-28">Phòng thi</th>
                                <th className="px-4 py-3 text-center text-xs uppercase tracking-wider w-16">SLSV</th>
                                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider w-28">Ngày thi</th>
                                <th className="px-4 py-3 text-center text-xs uppercase tracking-wider w-20">Giờ thi</th>
                                <th className="px-4 py-3 text-center text-xs uppercase tracking-wider w-24">Thời gian</th>
                                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider w-1/6">CB coi thi 1</th>
                                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider w-1/6">CB coi thi 2</th>
                                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider w-32">Địa điểm thi</th>
                                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {schedules.map((item, index) => (
                                <tr key={item.MaPTX} className={cn(
                                    "hover:bg-blue-50 dark:hover:bg-blue-900/40",
                                    // BỔ SUNG: Thêm điều kiện để định dạng màu cho Lần 2 và Giữa kỳ
                                    item.Lanthi === 'L2' && "text-red-600 dark:text-red-400",
                                    item.Lanthi === 'Gk' && "text-blue-600 dark:text-blue-400"
                                )}>
                                    <td className="px-2 py-4 text-center text-sm">{index + 1}</td>
                                    <td className="px-4 py-4 text-sm break-words text-center font-semibold">{item.Lanthi}</td>
                                    <td className="px-4 py-4 text-sm font-semibold break-words">{item.TenHocPhan}</td>
                                    <td className="px-4 py-4 text-sm break-words">{item.Phongthi}</td>
                                    <td className="px-4 py-4 text-sm text-center">{item.SLSV}</td>
                                    <td className="px-4 py-4 text-sm text-blue-600">{item.Ngay ? moment(item.Ngay).format('DD/MM/YYYY') : ''}</td>
                                    <td className="px-4 py-4 text-sm font-semibold text-blue-600 text-center">{`${String(item.Gio || 0).padStart(2, '0')}:${String(item.Phut || 0).padStart(2, '0')}`}</td>
                                    <td className="px-4 py-4 text-sm text-center">{item.Thoigian}'</td>
                                    <td className="px-4 py-4 text-sm break-words">{item.CBCoiThi1}</td>
                                    <td className="px-4 py-4 text-sm break-words">{item.CBCoiThi2}</td>
                                    <td className="px-4 py-4 text-sm break-words">{item.DiaDiemThi}</td>
                                    <td className="px-4 py-4 text-sm break-words">{item.Ghichu}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!loading.schedules && !error && schedules.length === 0 && (
                    <div className="text-center py-10 text-gray-500"><p>Không có lịch thi nào phù hợp với điều kiện lọc.</p></div>
                )}
            </div>
        </div>
    );
};

export default ExamSchedulePage;