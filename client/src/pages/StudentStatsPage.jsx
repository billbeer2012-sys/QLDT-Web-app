/*
 * D:/QLDT-app/client/src/pages/StudentStatsPage.jsx
 * Thời gian cập nhật: 08/09/2025
 * Tóm tắt nội dung:
 * - Bổ sung control lọc theo "Bậc đào tạo", cho phép chọn nhiều, mặc định chọn tất cả.
 * - Bổ sung thẻ điểm "Nữ cuối khóa" và tính toán tỷ lệ tương ứng.
 * - Căn giữa tiêu đề chính của trang.
 * - Cập nhật chức năng "Xuất file" để hỗ trợ nhiều định dạng.
 */
import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Users, UserCheck, UserX, Archive, GraduationCap, Briefcase, Loader2, ServerCrash, Download, Settings2, Library, User } from 'lucide-react';
import { exportToExcel } from '../lib/excelExporter';
import useMediaQuery from '../hooks/useMediaQuery';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import moment from 'moment-timezone';

// Component Thẻ điểm
const StatCard = ({ title, value, icon, color, extraValue, extraLabel }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center space-x-4 border-l-4" style={{ borderColor: color }}>
        <div className={`rounded-full p-3 text-white`} style={{ backgroundColor: color }}>{icon}</div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value.toLocaleString('vi-VN')}</p>
                {extraValue && (<p className="text-sm font-semibold" style={{ color: color }}>({extraValue}% {extraLabel})</p>)}
            </div>
        </div>
    </div>
);

// Component Tooltip tùy chỉnh
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600 shadow-xl">
                <p className="font-bold text-base mb-2 text-gray-800 dark:text-gray-100">{label}</p>
                {payload.map((p, index) => (
                    <p key={index} style={{ color: p.color }} className="text-sm">{`${p.name}: ${p.value.toLocaleString('vi-VN')}`}</p>
                ))}
            </div>
        );
    }
    return null;
};

// Component chính
const StudentStatsPage = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');

    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // BỔ SUNG: State cho bộ lọc Bậc đào tạo
    const [availableBacDT, setAvailableBacDT] = useState([]);
    const [selectedBacDT, setSelectedBacDT] = useState([]);

    const [visibleColumns, setVisibleColumns] = useState({
        danToc: false, tonGiao: false, viecLam: false, tyLeVL: false,
        cvht: false, bacDT: false, nganhNghe: false,
    });

    useEffect(() => {
        axiosInstance.post('/log-action', {
            Cuaso: 'TK người học', Congviec: 'Mở trang',
            Ghichu: 'Thành công'
        }).catch(err => console.error("Lỗi ghi log:", err));
    }, []);

    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                const response = await axiosInstance.get('/statistics/student-semesters');
                const semesterData = response.data;
                setSemesters(semesterData.semesters);
                if (semesterData.defaultSemester) {
                    setSelectedSemester(semesterData.defaultSemester);
                } else if (semesterData.semesters.length > 0) {
                    setSelectedSemester(semesterData.semesters[0].MaHK);
                }
            } catch (err) {
                toast.error("Không thể tải danh sách học kỳ.");
            }
        };
        fetchSemesters();
    }, []);

    useEffect(() => {
        if (!selectedSemester) return;
        setCourses([]); setSelectedCourses([]);
        const fetchCourses = async () => {
            try {
                const { data } = await axiosInstance.get(`/statistics/student-courses?maHK=${selectedSemester}`);
                setCourses(data);
                setSelectedCourses(data.map(c => c.MaKH));
            } catch (err) { toast.error("Không thể tải danh sách khóa học."); }
        };
        fetchCourses();
    }, [selectedSemester]);

    useEffect(() => {
        if (!selectedSemester || selectedCourses.length === 0) {
            setData([]);
            return;
        };
        const fetchData = async () => {
            setLoading(true); setError(null);
            try {
                const params = new URLSearchParams({ maHK: selectedSemester, maKHs: selectedCourses.join(',') });
                const { data } = await axiosInstance.get(`/statistics/student-data?${params.toString()}`);
                setData(data);
            } catch (err) {
                setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại.');
                toast.error('Lỗi khi tải dữ liệu thống kê.');
            } finally { setLoading(false); }
        };
        fetchData();
    }, [selectedSemester, selectedCourses]);

    // BỔ SUNG: useEffect để cập nhật bộ lọc Bậc đào tạo khi dữ liệu thay đổi
    useEffect(() => {
        if (data.length > 0) {
            const bacDTs = [...new Set(data.map(item => item.BacDT))].sort();
            setAvailableBacDT(bacDTs);
            setSelectedBacDT(bacDTs); // Mặc định chọn tất cả
        } else {
            setAvailableBacDT([]);
            setSelectedBacDT([]);
        }
    }, [data]);

    const processedData = useMemo(() => {
        return data
            .filter(item => selectedBacDT.includes(item.BacDT)) // Lọc theo bậc đào tạo
            .map(item => ({
                ...item,
                TyLeDH: item.DauVao > 0 ? ((item.DangHoc / item.DauVao) * 100).toFixed(1) : "0.0",
                TyLeBL: item.DauVao > 0 ? ((item.BaoLuu / item.DauVao) * 100).toFixed(1) : "0.0",
                TyLeTH: item.DauVao > 0 ? ((item.ThoiHoc / item.DauVao) * 100).toFixed(1) : "0.0",
                TyLeCK: item.DauVao > 0 ? ((item.CuoiKhoa / item.DauVao) * 100).toFixed(1) : "0.0",
                TyLeTN: item.CuoiKhoa > 0 ? ((item.TotNghiep / item.CuoiKhoa) * 100).toFixed(1) : "0.0",
                TyLeVL: item.TotNghiep > 0 ? ((item.ViecLam / item.TotNghiep) * 100).toFixed(1) : "0.0",
            }));
    }, [data, selectedBacDT]);

    const summary = useMemo(() => {
        const initial = { totalLop: 0, dauVao: 0, danhSach: 0, dangHoc: 0, baoLuu: 0, thoiHoc: 0, totNghiep: 0, cuoiKhoa: 0, nuCuoiKhoa: 0 };
        const summaryData = processedData.reduce((acc, curr) => {
            acc.dauVao += curr.DauVao;
            acc.danhSach += curr.DanhSach;
            acc.dangHoc += curr.DangHoc;
            acc.baoLuu += curr.BaoLuu;
            acc.thoiHoc += curr.ThoiHoc;
            acc.totNghiep += curr.TotNghiep;
            acc.cuoiKhoa += curr.CuoiKhoa;
            acc.nuCuoiKhoa += curr.Nu_CuoiKhoa; // Bổ sung
            return acc;
        }, initial);
        summaryData.totalLop = processedData.length;
        summaryData.tyLeDangHoc = summaryData.dauVao > 0 ? ((summaryData.dangHoc / summaryData.dauVao) * 100).toFixed(1) : 0;
        summaryData.tyLeBaoLuu = summaryData.dauVao > 0 ? ((summaryData.baoLuu / summaryData.dauVao) * 100).toFixed(1) : 0;
        summaryData.tyLeThoiHoc = summaryData.dauVao > 0 ? ((summaryData.thoiHoc / summaryData.dauVao) * 100).toFixed(1) : 0;
        summaryData.tyLeCuoiKhoa = summaryData.dauVao > 0 ? ((summaryData.cuoiKhoa / summaryData.dauVao) * 100).toFixed(1) : 0;
        // Bổ sung tính tỷ lệ Nữ cuối khóa
        summaryData.tyLeNuCuoiKhoa = summaryData.cuoiKhoa > 0 ? ((summaryData.nuCuoiKhoa / summaryData.cuoiKhoa) * 100).toFixed(1) : 0;
        summaryData.tyLeTotNghiep = summaryData.cuoiKhoa > 0 ? ((summaryData.totNghiep / summaryData.cuoiKhoa) * 100).toFixed(1) : 0;
        return summaryData;
    }, [processedData]);
    
    const groupedChartData = useMemo(() => {
        return processedData.reduce((acc, item) => {
            const key = item.Khoa;
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
    }, [processedData]);

    const handleCourseChange = (maKH) => {
        setSelectedCourses(prev => prev.includes(maKH) ? prev.filter(k => k !== maKH) : [...prev, maKH]);
    };

    // BỔ SUNG: Hàm xử lý thay đổi Bậc đào tạo
    const handleBacDTChange = (bacDT) => {
        setSelectedBacDT(prev => prev.includes(bacDT) ? prev.filter(b => b !== bacDT) : [...prev, bacDT]);
    };
    
    const handleExport = (format) => {
        if (processedData.length === 0) {
            toast.error("Không có dữ liệu để xuất."); return;
        }
        const visibleHeaders = {
            'Stt': (item, index) => index + 1, 'Khóa': 'Khoa', 'Bậc ĐT': 'BacDT', 'Tên lớp': 'Tenlop', 'CVHT': 'CoVanHocTap',
            'Đầu vào': 'DauVao', 'Danh sách': 'DanhSach', 'Đang học': 'DangHoc', 'Tỷ lệ ĐH (%)': 'TyLeDH',
            'Nam (ĐH)': 'Nam_DH', 'Nữ (ĐH)': 'Nu_DH',
            ...(visibleColumns.danToc && { 'D.tộc (ĐH)': 'DanToc_DH' }),
            ...(visibleColumns.tonGiao && { 'T.giáo (ĐH)': 'TonGiao_DH' }),
            'Bảo lưu': 'BaoLuu', 'Tỷ lệ BL (%)': 'TyLeBL', 'Thôi học': 'ThoiHoc', 'Tỷ lệ TH (%)': 'TyLeTH',
            'Cuối khóa': 'CuoiKhoa', 'Tỷ lệ CK (%)': 'TyLeCK', 'Tốt nghiệp': 'TotNghiep', 'Tỷ lệ TN (%)': 'TyLeTN',
            ...(visibleColumns.viecLam && { 'Việc làm': 'ViecLam' }),
            ...(visibleColumns.tyLeVL && { 'Tỷ lệ VL (%)': 'TyLeVL' }),
            ...(visibleColumns.nganhNghe && { 'Ngành nghề': 'NganhNghe' }),
        };

        const dataToExport = processedData.map((item, index) => {
            const row = {};
            for (const header in visibleHeaders) {
                const keyOrFunc = visibleHeaders[header];
                row[header] = typeof keyOrFunc === 'function' ? keyOrFunc(item, index) : item[keyOrFunc];
            }
            return row;
        });
        
        const filename = `ThongKeNguoiHoc_${selectedSemester}`;
        const selectedSemesterInfo = semesters.find(s => s.MaHK === selectedSemester)?.Display || '';
        const selectedCoursesInfo = selectedCourses.length === courses.length ? "Tất cả" : selectedCourses.map(sc => courses.find(c => c.MaKH === sc)?.KhoaDaoTao).join(', ');
        const subTitle = `Học kỳ: ${selectedSemesterInfo} | Khóa: ${selectedCoursesInfo}`;

        if (format === 'excel') {
            exportToExcel({
                data: dataToExport, filename, mainTitle: "THỐNG KÊ HỌC SINH, SINH VIÊN", subTitle: subTitle
            });
        } else if (format === 'csv') {
            const csvContent = '\uFEFF' + 
                Object.keys(dataToExport[0]).join(',') + '\n' + 
                dataToExport.map(row => Object.values(row).join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${filename}.csv`;
            link.click();
        }
        toast.success(`Đã xuất file ${format.toUpperCase()} thành công!`);
    };

    return (
        <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900/50 min-h-full">
            <h1 className="text-2xl font-bold text-red-800 dark:text-white uppercase mb-4 text-center">THỐNG KÊ HỌC SINH, SINH VIÊN</h1>

            {/* Bộ lọc */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div>
                        <label htmlFor="semester-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Học kỳ</label>
                        <select id="semester-select" value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                            {semesters.map(s => <option key={s.MaHK} value={s.MaHK}>{s.Display}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Khóa đào tạo</label>
                        <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md dark:border-gray-600 min-h-[42px]">
                             {courses.map(c => (
                                <button key={c.MaKH} onClick={() => handleCourseChange(c.MaKH)} className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${selectedCourses.includes(c.MaKH) ? 'bg-blue-600 text-white font-semibold shadow' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500'}`}>
                                    {c.KhoaDaoTao}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* BỔ SUNG: Control lọc Bậc đào tạo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bậc đào tạo</label>
                        <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md dark:border-gray-600 min-h-[42px]">
                             {availableBacDT.map(bdt => (
                                <button key={bdt} onClick={() => handleBacDTChange(bdt)} className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${selectedBacDT.includes(bdt) ? 'bg-blue-600 text-white font-semibold shadow' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500'}`}>
                                    {bdt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {loading && <div className="flex flex-col items-center justify-center p-10"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /><p className="mt-4">Đang tải dữ liệu...</p></div>}
            {error && !loading && <div className="flex flex-col items-center justify-center p-10 bg-red-50 dark:bg-red-900/20 rounded-lg"><ServerCrash className="w-12 h-12 text-red-500" /><p className="mt-4 text-red-700 dark:text-red-300">{error}</p></div>}
            
            {!loading && !error && (
            <>
                {/* Thẻ điểm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                    <StatCard title="Tổng số lớp" value={summary.totalLop} icon={<Library className="w-6 h-6"/>} color="#0284c7" />
                    <StatCard title="SLg Đầu vào" value={summary.dauVao} icon={<Users className="w-6 h-6"/>} color="#4b5563" />
                    <StatCard title="SLg Đang học" value={summary.dangHoc} icon={<UserCheck className="w-6 h-6"/>} color="#16a34a" extraValue={summary.tyLeDangHoc} extraLabel="so đầu vào"/>
                    <StatCard title="SLg Bảo lưu" value={summary.baoLuu} icon={<Archive className="w-6 h-6"/>} color="#f97316" extraValue={summary.tyLeBaoLuu} extraLabel="so đầu vào"/>
                    <StatCard title="SLg Thôi học" value={summary.thoiHoc} icon={<UserX className="w-6 h-6"/>} color="#dc2626" extraValue={summary.tyLeThoiHoc} extraLabel="so đầu vào"/>
                    <StatCard title="SLg Cuối khóa" value={summary.cuoiKhoa} icon={<Briefcase className="w-6 h-6"/>} color="#0d9488" extraValue={summary.tyLeCuoiKhoa} extraLabel="so đầu vào"/>
                    {/* BỔ SUNG: Thẻ điểm Nữ cuối khóa */}
                    <StatCard title="Nữ cuối khóa" value={summary.nuCuoiKhoa} icon={<User className="w-6 h-6"/>} color="#db2777" extraValue={summary.tyLeNuCuoiKhoa} extraLabel="so cuối khóa"/>
                    <StatCard title="SLg Tốt nghiệp" value={summary.totNghiep} icon={<GraduationCap className="w-6 h-6"/>} color="#8b5cf6" extraValue={summary.tyLeTotNghiep} extraLabel="so cuối khóa"/>
                </div>
                
                {/* Biểu đồ */}
                <div className="grid grid-cols-1 gap-6 mb-6">
                {Object.entries(groupedChartData).map(([khoa, chartData]) => (
                    <div key={khoa} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-4 text-primary dark:text-white">Biểu đồ tình hình người học - {khoa}</h3>
                        <div style={{ width: '100%', height: isMobile ? 600 : 450 }}>
                            <ResponsiveContainer>
                                <ComposedChart data={chartData} layout={isMobile ? 'vertical' : 'horizontal'} margin={isMobile ? { top: 5, right: 20, left: 20, bottom: 5 } : { top: 20, right: 20, left: -10, bottom: 120 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                    {isMobile ? (
                                        <>
                                            <XAxis type="number" tick={{ fill: 'rgb(156 163 175)', fontSize: 12 }} />
                                            <YAxis type="category" dataKey="Tenlop" width={100} tick={{ fill: 'rgb(156 163 175)', fontSize: 10 }} />
                                        </>
                                    ) : (
                                        <>
                                            <XAxis dataKey="Tenlop" angle={-60} textAnchor="end" interval={0} tick={{ fill: 'rgb(156 163 175)', fontSize: 12 }} />
                                            <YAxis allowDecimals={false} tick={{ fill: 'rgb(156 163 175)', fontSize: 12 }} />
                                        </>
                                    )}
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}/>
                                    <Legend wrapperStyle={isMobile ? {} : { paddingTop: '40px' }}/>
                                    <Bar dataKey="DangHoc" name="Đang học" fill="#16a34a" stackId="a" />
                                    <Bar dataKey="BaoLuu" name="Bảo lưu" fill="#f97316" stackId="a" />
                                    <Bar dataKey="ThoiHoc" name="Thôi học" fill="#dc2626" stackId="a" />
                                    <Bar dataKey="TotNghiep" name="Tốt nghiệp" fill="#8b5cf6" stackId="a" />
                                    <Line type="monotone" dataKey="DauVao" name="Đầu vào" stroke="#0ea5e9" strokeWidth={3}>
                                        <LabelList dataKey="DauVao" position={isMobile ? "right" : "top"} fill="#0ea5e9" fontSize={12} fontWeight="bold" />
                                    </Line>
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ))}
                </div>

                {/* Bảng dữ liệu */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
                    <div className="flex justify-between items-center p-4">
                        <h3 className="text-lg font-semibold text-primary dark:text-white">Bảng tổng hợp chi tiết</h3>
                        <div className="flex items-center gap-2">
                             <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button disabled={loading || data.length === 0} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition-colors data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed">
                                        <Download className="w-4 h-4" /> Xuất file
                                    </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                    <DropdownMenu.Content align="end" className="w-48 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-xl border dark:border-gray-700 z-50">
                                        <DropdownMenu.Item onSelect={() => handleExport('excel')} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none text-sm">Xuất Excel (.xlsx)</DropdownMenu.Item>
                                        <DropdownMenu.Item onSelect={() => handleExport('csv')} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none text-sm">Xuất CSV (.csv)</DropdownMenu.Item>
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root>
							<DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-sm font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                        <Settings2 className="w-4 h-4" /> Tùy chọn
                                    </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                    <DropdownMenu.Content align="end" className="w-56 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-xl border dark:border-gray-700 z-50">
                                        {Object.entries({
                                            bacDT: 'Bậc ĐT', cvht: 'Cố vấn học tập', danToc: 'D.tộc (Đang học)', tonGiao: 'T.giáo (Đang học)', viecLam: 'Việc làm', tyLeVL: 'Tỷ lệ VL',
                                            nganhNghe: 'Ngành nghề'
                                        }).map(([key, label]) => (
                                            <DropdownMenu.CheckboxItem key={key} checked={visibleColumns[key]} onCheckedChange={() => setVisibleColumns(prev => ({...prev, [key]: !prev[key]}))}
                                                className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none select-none">
                                                <div className="w-4 h-4 border-2 border-gray-400 dark:border-gray-500 rounded-sm flex items-center justify-center">
                                                    <DropdownMenu.ItemIndicator><UserCheck className="w-3 h-3 text-blue-600"/></DropdownMenu.ItemIndicator>
                                                </div>
                                                <span className="flex-1 text-sm">{label}</span>
                                            </DropdownMenu.CheckboxItem>
                                        ))}
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                            
                        </div>
                    </div>
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-row-hover">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                            <tr>
                                <th className="px-2 py-3 text-center">Stt</th>
                                <th className="px-2 py-3">Khóa</th>
                                {visibleColumns.bacDT && <th className="px-2 py-3">Bậc ĐT</th>}
                                <th className="px-2 py-3">Tên lớp</th>
                                {visibleColumns.cvht && <th className="px-2 py-3">CVHT</th>}
                                <th className="px-2 py-3 text-center">Đầu vào</th>
                                <th className="px-2 py-3 text-center">Danh sách</th>
                                <th className="px-2 py-3 text-center">Đang học</th>
                                <th className="px-2 py-3 text-center">Tỷ lệ ĐH</th>
                                <th className="px-2 py-3 text-center">Nam</th>
                                <th className="px-2 py-3 text-center">Nữ</th>
                                {visibleColumns.danToc && <th className="px-2 py-3 text-center">D.tộc</th>}
                                {visibleColumns.tonGiao && <th className="px-2 py-3 text-center">T.giáo</th>}
                                <th className="px-2 py-3 text-center">Bảo lưu</th>
                                <th className="px-2 py-3 text-center">Tỷ lệ BL</th>
                                <th className="px-2 py-3 text-center">Thôi học</th>
                                <th className="px-2 py-3 text-center">Tỷ lệ TH</th>
                                <th className="px-2 py-3 text-center">Cuối khóa</th>
                                <th className="px-2 py-3 text-center">Tỷ lệ CK</th>
                                <th className="px-2 py-3 text-center">Tốt nghiệp</th>
                                <th className="px-2 py-3 text-center">Tỷ lệ TN</th>
                                {visibleColumns.viecLam && <th className="px-2 py-3 text-center">Việc làm</th>}
                                {visibleColumns.tyLeVL && <th className="px-2 py-3 text-center">Tỷ lệ VL</th>}
                                {visibleColumns.nganhNghe && <th className="px-2 py-3">Ngành nghề</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {processedData.map((item, index) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-2 py-2 text-center">{index + 1}</td>
                                    <td className="px-2 py-2">{item.Khoa}</td>
                                    {visibleColumns.bacDT && <td className="px-2 py-2">{item.BacDT}</td>}
                                    <td className="px-2 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.Tenlop}</td>
                                    {visibleColumns.cvht && <td className="px-2 py-2 whitespace-nowrap">{item.CoVanHocTap}</td>}
                                    <td className="px-2 py-2 text-center font-bold">{item.DauVao}</td>
                                    <td className="px-2 py-2 text-center font-bold">{item.DanhSach}</td>
                                    <td className="px-2 py-2 text-center font-bold text-green-600">{item.DangHoc}</td>
                                    <td className="px-2 py-2 text-center font-normal text-green-600">{item.TyLeDH}%</td>
                                    <td className="px-2 py-2 text-center font-bold">{item.Nam_DH}</td>
                                    <td className="px-2 py-2 text-center font-bold">{item.Nu_DH}</td>
                                    {visibleColumns.danToc && <td className="px-2 py-2 text-center font-bold">{item.DanToc_DH}</td>}
                                    {visibleColumns.tonGiao && <td className="px-2 py-2 text-center font-bold">{item.TonGiao_DH}</td>}
                                    <td className="px-2 py-2 text-center font-bold text-orange-600">{item.BaoLuu}</td>
                                    <td className="px-2 py-2 text-center font-normal text-orange-600">{item.TyLeBL}%</td>
                                    <td className="px-2 py-2 text-center font-bold text-red-600">{item.ThoiHoc}</td>
                                    <td className="px-2 py-2 text-center font-normal text-red-600">{item.TyLeTH}%</td>
                                    <td className="px-2 py-2 text-center font-bold text-teal-600">{item.CuoiKhoa}</td>
                                    <td className="px-2 py-2 text-center font-normal text-teal-600">{item.TyLeCK}%</td>
                                    <td className="px-2 py-2 text-center font-bold text-purple-600">{item.TotNghiep}</td>
                                    <td className="px-2 py-2 text-center font-normal text-purple-600">{item.TyLeTN}%</td>
                                    {visibleColumns.viecLam && <td className="px-2 py-2 text-center font-bold">{item.ViecLam}</td>}
                                    {visibleColumns.tyLeVL && <td className="px-2 py-2 text-center font-normal">{item.TyLeVL}%</td>}
                                    {visibleColumns.nganhNghe && <td className="px-2 py-2 whitespace-nowrap">{item.NganhNghe}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
            )}
        </div>
    );
};

export default StudentStatsPage;

