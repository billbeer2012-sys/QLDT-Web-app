/*
* Đường dẫn file: D:\QLDT-app\client\src\pages\SchedulePage.jsx
* Cập nhật: 25/10/2025
 * Tóm tắt: Bổ sung log khi mở trang
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axiosInstance from '../api/axios';
import moment from 'moment-timezone';
import { Calendar, Loader, User, Users, DoorOpen, Search, Info, Calculator } from 'lucide-react';
//Bước 1: Bổ sung Import hook
import { usePageLogger } from '../hooks/usePageLogger';


const infoLineClass = 'info-line block';

// --- Debounce Helper ---
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

const ControlSelect = ({ label, value, onChange, options, icon, disabled = false }) => (
    <div className="space-y-2">
        <label className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300">{icon} {label}:</label>
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-200 dark:disabled:bg-gray-600 focus:ring-2 focus:ring-blue-500"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

const SearchInput = ({ value, onChange, icon, placeholder }) => (
    <div className="space-y-2">
        <label className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300">{icon} Tìm kiếm:</label>
        <div className="relative">
            <input
                type="search"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full p-2 pl-10 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
    </div>
);


const ScheduleTable = ({ group, weekStartDate }) => {
    const grid = useMemo(() => {
        const newGrid = Array(12).fill(null).map(() => Array(7).fill(null));
        group.schedule.forEach(item => {
            const dayIndex = moment(item.Ngay).isoWeekday() - 1;
            const tietIndex = item.Tiet - 1;
            if (tietIndex >= 0 && tietIndex < 12 && dayIndex >= 0 && dayIndex < 7) {
                const cumulativeHtml =
                    item.Tongsotiet > 0 ? (
                        <span
                            className={`${infoLineClass} text-xs font-normal ${
                                item.SoTietTichLuy >= item.Tongsotiet
                                    ? 'bg-yellow-200 dark:bg-yellow-800/50'
                                    : 'text-amber-600 dark:text-amber-400'
                            }`}
                        >
                            <Calculator className="w-3 h-3 inline mr-1.5" />
                            {item.SoTietTichLuy}/{item.Tongsotiet}
                        </span>
                    ) : null;
                
                // Cố định hiển thị theo kiểu "Lớp HP"
                const contextualInfo = (
                    <>
                        <span className={`${infoLineClass}`}>
                            <User className="w-3 h-3 inline mr-1.5" />
                            {item.HoTenGV}
                        </span>
                        <span className={`${infoLineClass} text-red-600 dark:text-red-400`}>
                            <DoorOpen className="w-3 h-3 inline mr-1.5" />
                            {item.Tenphong}
                        </span>
                    </>
                );

                const firstLine = (
                    <div className="flex items-start justify-between">
                        <strong className="font-semibold text-gray-900 dark:text-white">{item.TenHP}</strong>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 shrink-0">({item.Sotiet} giờ)</span>
                    </div>
                );

                newGrid[tietIndex][dayIndex] = {
                    content: (
                        <div className="p-1.5 text-left text-[13px] flex flex-col h-full">
                            {firstLine}
                            {item.Ghichu && (
                                <span className={`${infoLineClass} text-xs text-amber-600 dark:text-amber-400`}>
                                    <Info className="w-3 h-3 inline mr-1.5" />
                                    {item.Ghichu}
                                </span>
                            )}
                            <div className="mt-1 space-y-0.5 text-blue-600 dark:text-blue-400 font-medium flex-grow">
                                {contextualInfo}
                            </div>
                            {cumulativeHtml}
                        </div>
                    ),
                    rowspan: item.Sotiet,
                };

                for (let i = 1; i < item.Sotiet; i++) {
                    if (tietIndex + i < 12) newGrid[tietIndex + i][dayIndex] = 'occupied';
                }
            }
        });
        return newGrid;
    }, [group]);

    const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

    return (
        <div className="overflow-x-auto rounded-lg shadow-md bg-white dark:bg-gray-800">
            <table className="w-full min-w-[1000px] border-collapse">
                <thead>
                    <tr className="bg-gray-700 text-white">
                        <th className="p-2 w-16">Buổi</th>
                        <th className="p-2 w-12">Tiết</th>
                        {daysOfWeek.map((day, i) => (
                            <th key={day} className="p-2 text-center">
                                <div>{day}</div>
                                <div className="font-normal text-sm text-yellow-300">
                                    {moment(weekStartDate).add(i, 'days').format('DD/MM')}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 12 }).map((_, i) => {
                        const isAfternoon = i >= 6;
                        const rowClass = isAfternoon ? 'bg-amber-50 dark:bg-gray-800' : 'bg-blue-50 dark:bg-gray-900/50';
                        const dividerClass = i === 6 ? 'border-t-2 border-blue-300 dark:border-blue-700' : '';
                        return (
                            <tr key={i} className={`${rowClass} ${dividerClass}`}>
                                {i === 0 && (
                                    <td rowSpan="6" className="text-center font-bold bg-blue-100 dark:bg-blue-900">
                                        SÁNG
                                    </td>
                                )}
                                {i === 6 && (
                                    <td rowSpan="6" className="text-center font-bold bg-amber-100 dark:bg-amber-800">
                                        CHIỀU
                                    </td>
                                )}
                                <td className="text-center ">{i + 1}</td>
                                {Array.from({ length: 7 }).map((_, j) => {
                                    const cell = grid[i][j];
                                    if (cell && cell !== 'occupied')
                                        return (
                                            <td
                                                key={j}
                                                rowSpan={cell.rowspan}
                                                className="border border-gray-200 dark:border-gray-700 p-0 align-top"
                                            >
                                                {cell.content}
                                            </td>
                                        );
                                    if (cell === 'occupied') return null;
                                    return <td key={j} className="border border-gray-200 dark:border-gray-700"></td>;
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const SchedulePage = () => {
    //Bước 2: Gọi ghi log
	// Tên '...' sẽ được ghi vào cột 'Cuaso'
	usePageLogger('Xem TKB');

	const [semesters, setSemesters] = useState([]);
    const [weeks, setWeeks] = useState([]);
    const [scheduleData, setScheduleData] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedWeek, setSelectedWeek] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState({ semesters: true, weeks: false, schedule: false });
    const [error, setError] = useState('');
    
    const debouncedSearchTerm = useDebounce(searchTerm, 400);

    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                const res = await axiosInstance.get('/schedule/semesters');
                const { semesters, defaultSemester } = res.data;
                setSemesters(semesters);
                
                if (defaultSemester) {
                    setSelectedSemester(defaultSemester);
                } else if (semesters.length > 0) {
                    setSelectedSemester(semesters[0].MaHK);
                }
            } catch (err) {
                setError('Không thể tải danh sách học kỳ.');
            } finally {
                setLoading(prev => ({ ...prev, semesters: false }));
            }
        };
        fetchSemesters();
    }, []);

    useEffect(() => {
        if (!selectedSemester) return;
        const fetchWeeks = async () => {
            setLoading(prev => ({ ...prev, weeks: true }));
            setWeeks([]);
            setSelectedWeek('');
            try {
                const res = await axiosInstance.get(`/schedule/weeks?mahk=${selectedSemester}`);
                setWeeks(res.data);
                if (res.data.length > 0) {
                    const now = moment().tz('Asia/Ho_Chi_Minh');
                    const defaultWeek = res.data.find(t =>
                        now.isBetween(moment(t.value.split('_')[0]), moment(t.value.split('_')[1]), 'day', '[]')
                    );
                    setSelectedWeek(defaultWeek ? defaultWeek.value : res.data[0].value);
                }
            } catch (err) {
                setError('Không thể tải danh sách tuần.');
            } finally {
                setLoading(prev => ({ ...prev, weeks: false }));
            }
        };
        fetchWeeks();
    }, [selectedSemester]);

    const fetchSchedule = useCallback(async () => {
        if (!selectedWeek) {
            setScheduleData([]);
            return;
        }
        setLoading(prev => ({ ...prev, schedule: true }));
        setError('');
        try {
            const [startDate, endDate] = selectedWeek.split('_');
            const params = { startDate, endDate };
            if (debouncedSearchTerm) {
                params.searchTerm = debouncedSearchTerm;
            }
            const res = await axiosInstance.get('/schedule/data', { params });
            setScheduleData(res.data);
        } catch (err) {
            setError('Lỗi khi tải dữ liệu thời khóa biểu.');
        } finally {
            setLoading(prev => ({ ...prev, schedule: false }));
        }
    }, [selectedWeek, debouncedSearchTerm]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    if (loading.semesters) {
        return (
            <div className="text-center p-8">
                <Loader className="w-12 h-12 mx-auto animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="p-4 sm:p-1 h-full flex flex-col bg-gray-50 dark:bg-gray-900">
                <h1 className="text-2xl font-bold text-blue-800 dark:text-white mb-4 text-center uppercase">THỜI KHÓA BIỂU</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ControlSelect
                        label="Học kỳ"
                        value={selectedSemester}
                        onChange={setSelectedSemester}
                        options={semesters.map(s => ({ value: s.MaHK, label: s.Hocky }))}
                        icon={<Calendar className="w-5 h-5 text-blue-500" />} />
                    <ControlSelect
                        label="Tuần"
                        value={selectedWeek}
                        onChange={setSelectedWeek}
                        options={weeks.map(w => ({ value: w.value, label: w.label }))}
                        icon={<Calendar className="w-5 h-5 text-blue-500" />} disabled={loading.weeks} />
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Nhập tên GV, học phần, phòng..."
                        icon={<Search className="w-5 h-5 text-blue-500" />} />
                </div>
            </div>

            {loading.schedule ? (
                <div className="text-center p-8">
                    <Loader className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                    <p className="mt-2">Đang tải lịch học...</p>
                </div>
            ) : error ? (
                <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-md text-center">
                    {error}
                </div>
            ) : scheduleData.length === 0 ? (
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <Calendar className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-4 font-semibold">Không có dữ liệu thời khóa biểu</p>
                    <p className="text-sm text-gray-500">Vui lòng chọn hoặc tìm kiếm thông tin khác.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {scheduleData.map(group => (
                        <div key={group.name} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-3">
                                <Users className="text-blue-600" /> {group.name}
                            </h3>
                            <ScheduleTable
                                group={group}
                                weekStartDate={selectedWeek.split('_')[0]}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SchedulePage;

