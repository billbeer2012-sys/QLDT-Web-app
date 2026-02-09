/*
 * Đường dẫn file: D:\QLDT-app\client\src\features\dashboard\TrainingDashboard.jsx
 * Phiên bản cập nhật: 28/01/2026
 * Tóm tắt:
 * - Component Dashboard tiến độ đào tạo chính
 * - Hiển thị thống kê theo năm học với Year Selector
 * - Hiển thị dữ liệu cả 2 học kỳ trong năm
 * - CẬP NHẬT: Compact layout, bỏ subtitle, sửa tooltip order, đổi tiêu đề
 */
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Loader, Calendar, BookOpen, Clock, CheckCircle, BarChart3, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Component StatCard - Thẻ hiển thị số liệu
const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-3 border-l-4 border-${color}-500`}>
        <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
                {/* CẬP NHẬT: Bỏ truncate, cho phép wrap text, font nhỏ hơn */}
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">{title}</p>
                <p className={`text-lg sm:text-xl font-bold text-${color}-600 dark:text-${color}-400 mt-0.5`}>
                    {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
                </p>
            </div>
            <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/30 rounded-full ml-2 flex-shrink-0`}>
                <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
            </div>
        </div>
    </div>
);

// Custom Tooltip để kiểm soát thứ tự hiển thị và hiển thị tỷ lệ %
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // Lấy giá trị Số giờ KH làm cơ sở tính %
        const plannedEntry = payload.find(p => p.dataKey === 'totalPlannedHours');
        const scheduledEntry = payload.find(p => p.dataKey === 'totalScheduledHours');
        const completedEntry = payload.find(p => p.dataKey === 'totalCompletedHours');

        const plannedHours = plannedEntry?.value || 0;

        // Tính tỷ lệ %
        const scheduledPercent = plannedHours > 0 ? Math.round((scheduledEntry?.value || 0) / plannedHours * 100) : 0;
        const completedPercent = plannedHours > 0 ? Math.round((completedEntry?.value || 0) / plannedHours * 100) : 0;

        return (
            <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-lg border text-xs">
                <p className="font-bold mb-1">{label}</p>
                {plannedEntry && (
                    <p style={{ color: plannedEntry.color }}>
                        {plannedEntry.name}: {plannedEntry.value.toLocaleString('vi-VN')} giờ
                    </p>
                )}
                {scheduledEntry && (
                    <p style={{ color: scheduledEntry.color }}>
                        {scheduledEntry.name}: {scheduledEntry.value.toLocaleString('vi-VN')} giờ ({scheduledPercent}%)
                    </p>
                )}
                {completedEntry && (
                    <p style={{ color: completedEntry.color }}>
                        {completedEntry.name}: {completedEntry.value.toLocaleString('vi-VN')} giờ ({completedPercent}%)
                    </p>
                )}
            </div>
        );
    }
    return null;
};

// Component TimeProgressBar - Hiển thị tiến độ thời gian học kỳ
const TimeProgressBar = ({ startDate, endDate, totalWeeks, colorScheme }) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Tính toán các giá trị thời gian
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((now - start) / (1000 * 60 * 60 * 24));

    // Xác định trạng thái
    let status = 'ongoing'; // ongoing, upcoming, completed
    let timePercent = 0;
    let currentWeek = 0;
    let remainingDays = 0;
    let statusText = '';

    if (now < start) {
        // Chưa bắt đầu
        status = 'upcoming';
        timePercent = 0;
        remainingDays = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
        statusText = `Còn ${remainingDays} ngày nữa bắt đầu`;
    } else if (now > end) {
        // Đã kết thúc
        status = 'completed';
        timePercent = 100;
        currentWeek = totalWeeks;
        statusText = 'Đã hoàn thành';
    } else {
        // Đang diễn ra
        status = 'ongoing';
        timePercent = Math.min(Math.round((elapsedDays / totalDays) * 100), 100);
        currentWeek = Math.min(Math.ceil(elapsedDays / 7), totalWeeks);
        remainingDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        statusText = `Tuần ${currentWeek}/${totalWeeks} • Còn ${remainingDays} ngày`;
    }

    // Format dates
    const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Màu sắc cho thanh tiến độ thời gian (xanh lá/teal để phân biệt với tiến độ đào tạo)
    const getProgressColor = () => {
        if (status === 'completed') return '#10b981'; // emerald-500
        return colorScheme === 'blue' ? '#10b981' : '#14b8a6'; // emerald-500 hoặc teal-500
    };

    const getBadgeColor = () => {
        if (status === 'upcoming') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        if (status === 'completed') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        return '';
    };

    return (
        <div className="mb-6">
            {/* Header với thông tin */}
            <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span className="flex items-center gap-2">
                    Thời gian học kỳ
                    {status !== 'ongoing' && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getBadgeColor()}`}>
                            {status === 'upcoming' ? 'Sắp tới' : 'Hoàn thành'}
                        </span>
                    )}
                </span>
                <span className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-500">{statusText}</span>
                    <span className="font-semibold">{timePercent}%</span>
                </span>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                        width: `${timePercent}%`,
                        backgroundColor: getProgressColor()
                    }}
                ></div>

                {/* Marker "Hôm nay" cho trạng thái đang diễn ra */}
                {status === 'ongoing' && (
                    <div
                        className="absolute top-0 h-full flex flex-col items-center"
                        style={{ left: `${timePercent}%`, transform: 'translateX(-50%)' }}
                    >
                        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-gray-700 dark:border-t-gray-300 -mt-0.5"></div>
                    </div>
                )}
            </div>

            {/* Footer với ngày bắt đầu/kết thúc */}
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                <span>{formatDate(startDate)}</span>
                {status === 'ongoing' && (
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                        ▼ Hôm nay
                    </span>
                )}
                <span>{formatDate(endDate)}</span>
            </div>
        </div>
    );
};

// Component SemesterSection - Hiển thị thống kê cho 1 học kỳ
const SemesterSection = ({ semester, colorScheme }) => {
    const { hocKyLabel, summary, units } = semester;
    const progressPercent = summary.totalPlannedHours > 0
        ? Math.round((summary.totalCompletedHours / summary.totalPlannedHours) * 100)
        : 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className={`text-sm font-bold text-${colorScheme}-700 dark:text-${colorScheme}-400 mb-4 flex items-center gap-2`}>
                <Calendar className="w-4 h-4" />
                {hocKyLabel}
            </h3>

            {/* Summary Cards - CẬP NHẬT: Tăng gap và margin bottom */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <StatCard
                    title="Tổng số học phần"
                    value={summary.totalClasses}
                    icon={BookOpen}
                    color="red"
                />
                <StatCard
                    title="Số giờ kế hoạch"
                    value={summary.totalPlannedHours}
                    icon={Clock}
                    color="gray"
                />
                <StatCard
                    title="Số giờ xếp TKB"
                    value={summary.totalScheduledHours}
                    icon={BarChart3}
                    color="amber"
                />
                <StatCard
                    title="Số giờ đã đào tạo"
                    value={summary.totalCompletedHours}
                    icon={CheckCircle}
                    color="blue"
                />
            </div>

            {/* Progress Bar - CẬP NHẬT: Sử dụng inline style để đảm bảo màu hiển thị đúng */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Tiến độ đào tạo</span>
                    <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-[#8b94a3] dark:bg-gray-700 rounded-full h-3">
                    <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{
                            width: `${Math.min(progressPercent, 100)}%`,
                            backgroundColor: colorScheme === 'blue' ? '#3b82f6' : '#6366f1'
                        }}
                    ></div>
                </div>
            </div>

            {/* Time Progress Bar - Tiến độ thời gian học kỳ */}
            {semester.ngayBatDau && semester.ngayKetThuc && (
                <TimeProgressBar
                    startDate={semester.ngayBatDau}
                    endDate={semester.ngayKetThuc}
                    totalWeeks={semester.soTuan}
                    colorScheme={colorScheme}
                />
            )}

            {/* Chart - CẬP NHẬT: Tăng chiều cao để cân đối với chiều rộng */}
            {units.length > 0 && (
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={units} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="tenDV"
                                angle={-45}
                                textAnchor="end"
                                height={70}
                                tick={{ fontSize: 10 }}
                            />
                            <YAxis tick={{ fontSize: 10 }} width={40} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                            <Bar dataKey="totalPlannedHours" name="Số giờ KH" fill="#656c78" />
                            <Bar dataKey="totalScheduledHours" name="Số giờ TKB" fill="#ba7809" />
                            <Bar dataKey="totalCompletedHours" name="Đã đào tạo" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

// Main Component
const TrainingDashboard = () => {
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState({ years: true, stats: false });
    const [error, setError] = useState('');

    // Fetch danh sách năm học
    useEffect(() => {
        const fetchYears = async () => {
            try {
                const res = await axiosInstance.get('/dashboard-training/years');
                setYears(res.data.years);
                if (res.data.defaultYear) {
                    setSelectedYear(res.data.defaultYear);
                }
            } catch (err) {
                console.error('Fetch years error:', err);
                setError('Không thể tải danh sách năm học.');
                toast.error('Không thể tải danh sách năm học.');
            } finally {
                setLoading(prev => ({ ...prev, years: false }));
            }
        };
        fetchYears();
    }, []);

    // Fetch thống kê khi chọn năm
    useEffect(() => {
        if (!selectedYear) return;

        const fetchStats = async () => {
            setLoading(prev => ({ ...prev, stats: true }));
            setError('');
            try {
                const res = await axiosInstance.get(`/dashboard-training/stats?namHoc=${selectedYear}`);
                setStatsData(res.data);
            } catch (err) {
                console.error('Fetch stats error:', err);
                setError('Không thể tải thống kê đào tạo.');
                toast.error('Không thể tải thống kê đào tạo.');
            } finally {
                setLoading(prev => ({ ...prev, stats: false }));
            }
        };
        fetchStats();
    }, [selectedYear]);

    if (loading.years) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header với Year Selector - Compact */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow p-3 text-white">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold">TIẾN ĐỘ ĐÀO TẠO</h1>

                    {/* Year Selector */}
                    <div className="relative">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="appearance-none bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
                        >
                            {years.map(year => (
                                <option key={year.namHoc} value={year.namHoc} className="text-gray-800">
                                    {year.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading.stats ? (
                <div className="flex items-center justify-center h-32">
                    <Loader className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-sm text-gray-600">Đang tải dữ liệu...</span>
                </div>
            ) : error ? (
                <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-lg text-center text-sm">
                    {error}
                </div>
            ) : statsData && statsData.semesters.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                    {statsData.semesters.map((semester, index) => (
                        <SemesterSection
                            key={semester.maHK}
                            semester={semester}
                            colorScheme={index === 0 ? 'blue' : 'indigo'}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <Calendar className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Không có dữ liệu cho năm học này.</p>
                </div>
            )}
        </div>
    );
};

export default TrainingDashboard;

