/*
 * Đường dẫn file: D:\QLDT-app\client\src\features\dashboard\TrainingDashboard.jsx
 * Phiên bản cập nhật: 22/01/2026
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

// Custom Tooltip để kiểm soát thứ tự hiển thị
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // Sắp xếp theo thứ tự: Số giờ KH -> Giờ TKB -> Đã đào tạo
        const orderedPayload = [
            payload.find(p => p.dataKey === 'totalPlannedHours'),
            payload.find(p => p.dataKey === 'totalScheduledHours'),
            payload.find(p => p.dataKey === 'totalCompletedHours'),
        ].filter(Boolean);

        return (
            <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-lg border text-xs">
                <p className="font-bold mb-1">{label}</p>
                {orderedPayload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }}>
                        {entry.name}: {entry.value.toLocaleString('vi-VN')} giờ
                    </p>
                ))}
            </div>
        );
    }
    return null;
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
                    color={colorScheme}
                />
                <StatCard
                    title="Số giờ kế hoạch"
                    value={summary.totalPlannedHours}
                    icon={Clock}
                    color="gray"
                />
                <StatCard
                    title="Số giờ đã xếp TKB"
                    value={summary.totalScheduledHours}
                    icon={BarChart3}
                    color="amber"
                />
                <StatCard
                    title="Số giờ đã đào tạo"
                    value={summary.totalCompletedHours}
                    icon={CheckCircle}
                    color="green"
                />
            </div>

            {/* Progress Bar - CẬP NHẬT: Tăng margin bottom */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Tiến độ đào tạo</span>
                    <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                        className={`bg-${colorScheme}-500 h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* Chart - CẬP NHẬT: Tăng chiều cao để cân đối với chiều rộng */}
            {units.length > 0 && (
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={units} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
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
                            <Bar dataKey="totalPlannedHours" name="Số giờ KH" fill="#9CA3AF" />
                            <Bar dataKey="totalScheduledHours" name="Giờ TKB" fill="#F59E0B" />
                            <Bar dataKey="totalCompletedHours" name="Đã đào tạo" fill="#10B981" />
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

