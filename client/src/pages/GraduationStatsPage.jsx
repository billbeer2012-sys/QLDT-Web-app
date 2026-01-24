/*
 * D:/QLDT-app/client/src/pages/GraduationStatsPage.jsx
 * Cập nhật: 25/10/2025
 * Tóm tắt: Bổ sung log khi mở trang
 */
import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { Users, UserCheck, Loader2, ServerCrash, Download, Settings2, Award, Star, ThumbsUp, Medal, GraduationCap, Library, Briefcase } from 'lucide-react';
import { exportToExcel, exportToCSV } from '../lib/excelExporter'; // Cập nhật import
import useMediaQuery from '../hooks/useMediaQuery';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tabs from '@radix-ui/react-tabs';
import moment from 'moment-timezone';
//Bước 1: Bổ sung Import hook
import { usePageLogger } from '../hooks/usePageLogger';

// --- Helper Components (Không thay đổi) ---
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

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const percentage = data.payload.percentage;
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600 shadow-xl">
                <p style={{ color: data.payload.fill || data.fill }} className="font-bold text-base mb-2">{data.name}</p>
                <p className="text-sm text-gray-700 dark:text-gray-200">Số lượng: <strong>{data.value.toLocaleString('vi-VN')}</strong></p>
                <p className="text-sm text-gray-700 dark:text-gray-200">Tỷ lệ: <strong>{percentage}%</strong></p>
            </div>
        );
    }
    return null;
};

const renderCustomBarLabel = (props) => {
    const { x, y, width, height, value, payload } = props;
    if (payload && typeof payload.percentage !== 'undefined') {
        return (
            <text 
                x={x + width + 5} 
                y={y + height / 2} 
                fill="currentColor" 
                textAnchor="start" 
                dominantBaseline="middle" 
                fontSize={12}
            >
                {`${value.toLocaleString('vi-VN')} (${payload.percentage}%)`}
            </text>
        );
    }
    return null;
};

const PIE_COLORS_XLTN = ['#ca8a04', '#16a34a', '#2563eb', '#0891b2', '#64748b'];
const PIE_COLORS_XLRL = ['#ca8a04', '#16a34a', '#2563eb', '#64748b'];

// --- Component cho Tab 1: Thống kê theo Khóa ---
const StatsByCourseTab = () => {
    const [courses, setCourses] = useState([]);
    // ĐIỀU CHỈNH: State để lưu nhiều khóa học
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [availableBacDT, setAvailableBacDT] = useState([]);
    const [selectedBacDT, setSelectedBacDT] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleColumns, setVisibleColumns] = useState({
        bacDT: false, nganhNghe: false, loaiHinhDT: false, khoaQL: false, cvht: false,
        cuoiKhoa: true, xlrlXuatSac: false, tyLeRLXS: false, xlrlTot: false, tyLeRLT: false,
        xlrlKha: false, tyLeRLK: false, xlrlTBinh: false, tyLeRLTB: false,
    });

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await axiosInstance.get('/statistics/graduation-courses');
                setCourses(data);
                // ĐIỀU CHỈNH: Mặc định chọn khóa mới nhất
                if (data.length > 0) {
                    setSelectedCourses([data[0]]);
                }
            } catch (err) { toast.error("Không thể tải danh sách khóa học."); }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        // ĐIỀU CHỈNH: Kiểm tra nếu không có khóa nào được chọn
        if (selectedCourses.length === 0) {
            setData([]);
            setLoading(false);
            return;
        }
        const fetchData = async () => {
            setLoading(true); setError(null); setData([]); 
            try {
                // ĐIỀU CHỈNH: Gửi mảng các khóa đã chọn
                const params = new URLSearchParams({ khoa: selectedCourses.join(',') });
                const { data } = await axiosInstance.get(`/statistics/graduation-data?${params.toString()}`);
                setData(data);
            } catch (err) {
                setError('Không thể tải dữ liệu. Vui lòng thử lại.');
                toast.error('Lỗi khi tải dữ liệu thống kê.');
            } finally { setLoading(false); }
        };
        fetchData();
    }, [selectedCourses]);

    // ĐIỀU CHỈNH: Xử lý chọn/bỏ chọn khóa học
    const handleCourseChange = (course) => {
        setSelectedCourses(prev => 
            prev.includes(course) 
            ? prev.filter(c => c !== course) 
            : [...prev, course]
        );
    };

    // Các useEffect và useMemo còn lại không thay đổi logic bên trong
    useEffect(() => {
        if (data.length > 0) {
            const bacDTs = [...new Set(data.map(item => item.BacDTHienthi))];
            setAvailableBacDT(bacDTs); setSelectedBacDT(bacDTs); 
        } else {
            setAvailableBacDT([]); setSelectedBacDT([]);
        }
    }, [data]);
    
    const processedData = useMemo(() => {
        const filtered = data.filter(item => selectedBacDT.includes(item.BacDTHienthi));
        return filtered.map(item => ({
            ...item,
            TyLeCK: item.DauVao > 0 ? ((item.CuoiKhoa / item.DauVao) * 100).toFixed(1) : "0.0",
            TyLeTN: item.CuoiKhoa > 0 ? ((item.TotNghiep / item.CuoiKhoa) * 100).toFixed(1) : "0.0",
            TyLeTNXS: item.TotNghiep > 0 ? ((item.XLTN_XuatSac / item.TotNghiep) * 100).toFixed(1) : "0.0",
            TyLeTNG: item.TotNghiep > 0 ? ((item.XLTN_Gioi / item.TotNghiep) * 100).toFixed(1) : "0.0",
            TyLeTNK: item.TotNghiep > 0 ? ((item.XLTN_Kha / item.TotNghiep) * 100).toFixed(1) : "0.0",
            TyLeTNTBK: item.TotNghiep > 0 ? ((item.XLTN_TBKha / item.TotNghiep) * 100).toFixed(1) : "0.0",
            TyLeTNTB: item.TotNghiep > 0 ? ((item.XLTN_TBinh / item.TotNghiep) * 100).toFixed(1) : "0.0",
            TyLeRLXS: item.TotNghiep > 0 ? ((item.XLRL_XuatSac / item.TotNghiep) * 100).toFixed(1) : "0.0",
            TyLeRLT: item.TotNghiep > 0 ? ((item.XLRL_Tot / item.TotNghiep) * 100).toFixed(1) : "0.0",
            TyLeRLK: item.TotNghiep > 0 ? ((item.XLRL_Kha / item.TotNghiep) * 100).toFixed(1) : "0.0",
            TyLeRLTB: item.TotNghiep > 0 ? ((item.XLRL_TBinh / item.TotNghiep) * 100).toFixed(1) : "0.0",
            TyLeVL: item.TotNghiep > 0 ? ((item.ViecLam / item.TotNghiep) * 100).toFixed(1) : "0.0",
        }));
    }, [data, selectedBacDT]);

    const summary = useMemo(() => {
        const initial = { dauVao: 0, cuoiKhoa: 0, totNghiep: 0, xs: 0, gioi: 0, kha: 0, tbk: 0, tb: 0, viecLam: 0, soLop: 0 };
        const s = processedData.reduce((acc, curr) => {
            acc.dauVao += curr.DauVao; acc.cuoiKhoa += curr.CuoiKhoa; acc.totNghiep += curr.TotNghiep;
            acc.xs += curr.XLTN_XuatSac; acc.gioi += curr.XLTN_Gioi; acc.kha += curr.XLTN_Kha;
            acc.tbk += curr.XLTN_TBKha; acc.tb += curr.XLTN_TBinh; acc.viecLam += curr.ViecLam;
            return acc;
        }, initial);
        s.soLop = processedData.length;
        s.tyLeCK = s.dauVao > 0 ? ((s.cuoiKhoa / s.dauVao) * 100).toFixed(1) : 0;
        s.tyLeTN = s.cuoiKhoa > 0 ? ((s.totNghiep / s.cuoiKhoa) * 100).toFixed(1) : 0;
        s.tyLeXS = s.totNghiep > 0 ? ((s.xs / s.totNghiep) * 100).toFixed(1) : 0;
        s.tyLeGioi = s.totNghiep > 0 ? ((s.gioi / s.totNghiep) * 100).toFixed(1) : 0;
        s.tyLeKha = s.totNghiep > 0 ? ((s.kha / s.totNghiep) * 100).toFixed(1) : 0;
        s.tyLeTBK = s.totNghiep > 0 ? ((s.tbk / s.totNghiep) * 100).toFixed(1) : 0;
        s.tyLeTB = s.totNghiep > 0 ? ((s.tb / s.totNghiep) * 100).toFixed(1) : 0;
        s.tyLeVL = s.totNghiep > 0 ? ((s.viecLam / s.totNghiep) * 100).toFixed(1) : 0;
        return s;
    }, [processedData]);

    const chartData = useMemo(() => {
        const result = {};
        const xlrlOrder = ['Xuất sắc', 'Tốt', 'Khá', 'Trung bình'];
        selectedBacDT.forEach(bacDT => {
            const dataForBacDT = processedData.filter(p => p.BacDTHienthi === bacDT);
            const totalGraduates = dataForBacDT.reduce((sum, item) => sum + item.TotNghiep, 0);
            if (totalGraduates > 0) {
                const xltnDataRaw = dataForBacDT.reduce((acc, item) => {
                    acc['Xuất sắc'] = (acc['Xuất sắc'] || 0) + item.XLTN_XuatSac;
                    acc['Giỏi'] = (acc['Giỏi'] || 0) + item.XLTN_Gioi;
                    acc['Khá'] = (acc['Khá'] || 0) + item.XLTN_Kha;
                    acc['T.bình khá'] = (acc['T.bình khá'] || 0) + item.XLTN_TBKha;
                    acc['Trung bình'] = (acc['Trung bình'] || 0) + item.XLTN_TBinh;
                    return acc;
                }, {});
                const xlrlDataRaw = dataForBacDT.reduce((acc, item) => {
                    acc['Xuất sắc'] = (acc['Xuất sắc'] || 0) + item.XLRL_XuatSac;
                    acc['Tốt'] = (acc['Tốt'] || 0) + item.XLRL_Tot;
                    acc['Khá'] = (acc['Khá'] || 0) + item.XLRL_Kha;
                    acc['Trung bình'] = (acc['Trung bình'] || 0) + item.XLRL_TBinh;
                    return acc;
                }, {});
                result[bacDT] = {
                    xltn: Object.entries(xltnDataRaw).map(([name, value]) => ({ name, value, percentage: ((value / totalGraduates) * 100).toFixed(1) })).filter(d => d.value > 0),
                    xlrl: Object.entries(xlrlDataRaw).map(([name, value]) => ({ name, value, percentage: ((value / totalGraduates) * 100).toFixed(1) })).filter(d => d.value > 0).sort((a, b) => xlrlOrder.indexOf(a.name) - xlrlOrder.indexOf(b.name))
                };
            }
        });
        return result;
    }, [processedData, selectedBacDT]);

    const handleBacDTChange = (bacDT) => {
        setSelectedBacDT(prev => prev.includes(bacDT) ? prev.filter(b => b !== bacDT) : [...prev, bacDT]);
    };

    const handleExport = (format) => {
        if (processedData.length === 0) { toast.error("Không có dữ liệu để xuất."); return; }
        const visibleHeaders = {
            'Stt': (item, index) => index + 1,
            'Khóa ĐT': 'Khoahoc', ...(visibleColumns.bacDT && { 'Bậc ĐT': 'BacDTHienthi' }), ...(visibleColumns.nganhNghe && { 'Ngành nghề': 'Dacdiem' }),
            ...(visibleColumns.loaiHinhDT && { 'Loại hình ĐT': 'LoaihinhDT' }), ...(visibleColumns.khoaQL && { 'Khoa quản lý': 'Donvi' }),
            'Tên lớp': 'Tenlop', ...(visibleColumns.cvht && { 'Cố vấn học tập': 'Gvcn' }), 'Đầu vào': 'DauVao',
            ...(visibleColumns.cuoiKhoa && { 'Cuối khóa': 'CuoiKhoa' }), 'Tỷ lệ CK (%)': 'TyLeCK', 'Tốt nghiệp': 'TotNghiep', 'Tỷ lệ TN (%)': 'TyLeTN',
            'Nam': 'Nam', 'Nữ': 'Nu', 'XLTN Xuất sắc': 'XLTN_XuatSac', 'Tỷ lệ TNXS (%)': 'TyLeTNXS', 'XLTN Giỏi': 'XLTN_Gioi', 'Tỷ lệ TNG (%)': 'TyLeTNG',
            'XLTN Khá': 'XLTN_Kha', 'Tỷ lệ TNK (%)': 'TyLeTNK', 'XLTN TB khá': 'XLTN_TBKha', 'Tỷ lệ TNTBK (%)': 'TyLeTNTBK',
            'XLTN Tbình': 'XLTN_TBinh', 'Tỷ lệ TNTB (%)': 'TyLeTNTB',
            ...(visibleColumns.xlrlXuatSac && { 'XLRL Xuất sắc': 'XLRL_XuatSac' }), ...(visibleColumns.tyLeRLXS && { 'Tỷ lệ RLXS (%)': 'TyLeRLXS' }),
            ...(visibleColumns.xlrlTot && { 'XLRL Tốt': 'XLRL_Tot' }), ...(visibleColumns.tyLeRLT && { 'Tỷ lệ RLT (%)': 'TyLeRLT' }),
            ...(visibleColumns.xlrlKha && { 'XLRL Khá': 'XLRL_Kha' }), ...(visibleColumns.tyLeRLK && { 'Tỷ lệ RLK (%)': 'TyLeRLK' }),
            ...(visibleColumns.xlrlTBinh && { 'XLRL Tbình': 'XLRL_TBinh' }), ...(visibleColumns.tyLeRLTB && { 'Tỷ lệ RLTB (%)': 'TyLeRLTB' }),
            'Việc làm': 'ViecLam', 'Tỷ lệ VL (%)': 'TyLeVL',
        };
        const dataToExport = processedData.map((item, index) => {
            const row = {};
            for (const header in visibleHeaders) {
                const keyOrFunc = visibleHeaders[header];
                row[header] = typeof keyOrFunc === 'function' ? keyOrFunc(item, index) : item[keyOrFunc];
            }
            return row;
        });
        const filename = `ThongKeTotNghiep_TheoKhoa_${selectedCourses.join('-')}`;
        const bacDTString = selectedBacDT.length === availableBacDT.length ? 'Tất cả' : selectedBacDT.join(', ');
        const subTitle = `Khoá đào tạo: ${selectedCourses.join(', ')} - Bậc đào tạo: ${bacDTString}`;
        if (format === 'excel') {
            exportToExcel({ data: dataToExport, filename, mainTitle: "THỐNG KÊ TỐT NGHIỆP THEO KHÓA", subTitle: subTitle });
        } else if (format === 'csv') {
            exportToCSV({ data: dataToExport, filename });
        }
        toast.success(`Đã xuất file ${format.toUpperCase()} thành công!`);
    };

    return (
        <div className="pt-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    {/* ĐIỀU CHỈNH: Giao diện chọn nhiều khóa */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Khóa đào tạo</label>
                        <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md dark:border-gray-600 min-h-[42px]">
                            {courses.map(c => (
                                <button 
                                    key={c} 
                                    onClick={() => handleCourseChange(c)} 
                                    className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${selectedCourses.includes(c) ? 'bg-blue-600 text-white font-semibold shadow' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500'}`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
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
            {error && !loading && <div className="flex flex-col items-center justify-center p-10 bg-red-50 dark:bg-red-900/20 rounded-lg"><ServerCrash className="w-12 h-12 text-red-500" /><p className="mt-4 text-red-700">{error}</p></div>}
            {!loading && !error && processedData.length === 0 && (
                <div className="text-center py-10 text-gray-500"><p>Không có dữ liệu tốt nghiệp cho lựa chọn hiện tại.</p></div>
            )}

            {!loading && !error && processedData.length > 0 && (
            <>
                {/* Các thẻ StatCard và Biểu đồ không thay đổi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                    <StatCard title="Số lớp TN" value={summary.soLop} icon={<Library className="w-6 h-6"/>} color="#0284c7" />
                    <StatCard title="SLg Đầu vào" value={summary.dauVao} icon={<Users className="w-6 h-6"/>} color="#4b5563" />
                    <StatCard title="SLg Cuối khóa" value={summary.cuoiKhoa} icon={<UserCheck className="w-6 h-6"/>} color="#0d9488" extraValue={summary.tyLeCK} extraLabel="so đầu vào"/>
                    <StatCard title="SLg Tốt nghiệp" value={summary.totNghiep} icon={<GraduationCap className="w-6 h-6"/>} color="#8b5cf6" extraValue={summary.tyLeTN} extraLabel="so cuối khóa"/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
                    <StatCard title="Xuất sắc" value={summary.xs} icon={<Award className="w-6 h-6"/>} color="#ca8a04" extraValue={summary.tyLeXS} extraLabel="% so TN"/>
                    <StatCard title="Giỏi" value={summary.gioi} icon={<Star className="w-6 h-6"/>} color="#16a34a" extraValue={summary.tyLeGioi} extraLabel=""/>
                    <StatCard title="Khá" value={summary.kha} icon={<ThumbsUp className="w-6 h-6"/>} color="#2563eb" extraValue={summary.tyLeKha} extraLabel=""/>
                    <StatCard title="T.bình khá" value={summary.tbk} icon={<Medal className="w-6 h-6"/>} color="#0891b2" extraValue={summary.tyLeTBK} extraLabel=""/>
                    <StatCard title="Trung bình" value={summary.tb} icon={<Medal className="w-6 h-6"/>} color="#64748b" extraValue={summary.tyLeTB} extraLabel=""/>
                    <StatCard title="Có việc làm" value={summary.viecLam} icon={<Briefcase className="w-6 h-6"/>} color="#0891b2" extraValue={summary.tyLeVL} extraLabel="so TN"/>
                </div>
                
                <div className="grid grid-cols-1 gap-6 mb-6">
                {Object.entries(chartData).map(([bacDT, chartData]) => (
                    <div key={bacDT} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-primary dark:text-white text-center">Xếp loại tốt nghiệp - {bacDT}</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={chartData.xltn} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                                const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                                                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                                return (<text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>{`${(percent * 100).toFixed(0)}%`}</text>);
                                            }}>
                                                {chartData.xltn.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS_XLTN[index % PIE_COLORS_XLTN.length]} />)}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-primary dark:text-white text-center">Kết quả rèn luyện - {bacDT}</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={chartData.xlrl} layout="vertical" margin={{ top: 20, right: 40, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" width={80} tick={{ fill: 'currentColor', fontSize: 12 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="value" barSize={20}>
                                                {chartData.xlrl.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS_XLRL[index % PIE_COLORS_XLRL.length]} />
                                                ))}
                                                <LabelList dataKey="value" position="right" content={renderCustomBarLabel} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                 ))}
                 </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
                    {/* Bảng dữ liệu và các nút tùy chọn không thay đổi */}
                    <div className="flex justify-between items-center p-4">
                        <h3 className="text-lg font-semibold text-primary dark:text-white">Bảng tổng hợp chi tiết</h3>
                        <div className="flex items-center gap-2">
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition-colors data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed">
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
                                            bacDT: 'Bậc ĐT', nganhNghe: 'Ngành nghề', loaiHinhDT: 'Loại hình ĐT', khoaQL: 'Khoa quản lý', cvht: 'Cố vấn học tập', 
                                            xlrlXuatSac: 'XLRL Xuất sắc', tyLeRLXS: 'Tỷ lệ RLXS', xlrlTot: 'XLRL Tốt', tyLeRLT: 'Tỷ lệ RLT',
                                            xlrlKha: 'XLRL Khá', tyLeRLK: 'Tỷ lệ RLK', xlrlTBinh: 'XLRL Tbình', tyLeRLTB: 'Tỷ lệ RLTB'
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
                        {/* Table Head */}
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                            <tr>
                               <th className="px-2 py-3 text-center">Stt</th>
                               <th className="px-2 py-3">Khóa ĐT</th>
                               {visibleColumns.bacDT && <th className="px-2 py-3">Bậc ĐT</th>}
                               {visibleColumns.nganhNghe && <th className="px-2 py-3">Ngành nghề</th>}
                               {visibleColumns.loaiHinhDT && <th className="px-2 py-3">Loại hình ĐT</th>}
                               {visibleColumns.khoaQL && <th className="px-2 py-3">Khoa QL</th>}
                               <th className="px-2 py-3">Tên lớp</th>
                               {visibleColumns.cvht && <th className="px-2 py-3">CVHT</th>}
                               <th className="px-2 py-3 text-center">Đầu vào</th>
                               {visibleColumns.cuoiKhoa && <th className="px-2 py-3 text-center">Cuối khóa</th>}
                               <th className="px-2 py-3 text-center">Tỷ lệ CK</th>
                               <th className="px-2 py-3 text-center">Tốt nghiệp</th>
                               <th className="px-2 py-3 text-center">Tỷ lệ TN</th>
                               <th className="px-2 py-3 text-center">Nam</th>
                               <th className="px-2 py-3 text-center">Nữ</th>
                               <th className="px-2 py-3 text-center">XLTN XS</th>
                               <th className="px-2 py-3 text-center">Tỷ lệ</th>
                               <th className="px-2 py-3 text-center">XLTN Giỏi</th>
                               <th className="px-2 py-3 text-center">Tỷ lệ</th>
                               <th className="px-2 py-3 text-center">XLTN Khá</th>
                               <th className="px-2 py-3 text-center">Tỷ lệ</th>
                               <th className="px-2 py-3 text-center">XLTN TBK</th>
                               <th className="px-2 py-3 text-center">Tỷ lệ</th>
                               <th className="px-2 py-3 text-center">XLTN TB</th>
                               <th className="px-2 py-3 text-center">Tỷ lệ</th>
                               {visibleColumns.xlrlXuatSac && <th className="px-2 py-3 text-center">XLRL XS</th>}
                               {visibleColumns.tyLeRLXS && <th className="px-2 py-3 text-center">Tỷ lệ</th>}
                               {visibleColumns.xlrlTot && <th className="px-2 py-3 text-center">XLRL Tốt</th>}
                               {visibleColumns.tyLeRLT && <th className="px-2 py-3 text-center">Tỷ lệ</th>}
                               {visibleColumns.xlrlKha && <th className="px-2 py-3 text-center">XLRL Khá</th>}
                               {visibleColumns.tyLeRLK && <th className="px-2 py-3 text-center">Tỷ lệ</th>}
                               {visibleColumns.xlrlTBinh && <th className="px-2 py-3 text-center">XLRL TB</th>}
                               {visibleColumns.tyLeRLTB && <th className="px-2 py-3 text-center">Tỷ lệ</th>}
                               <th className="px-2 py-3 text-center">Việc làm</th>
                               <th className="px-2 py-3 text-center">Tỷ lệ VL</th>
                            </tr>
                        </thead>
                        {/* Table Body */}
                        <tbody>
                            {processedData.map((item, index) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-2 py-2 text-center">{index + 1}</td>
                                    <td className="px-2 py-2">{item.Khoahoc}</td>
                                    {visibleColumns.bacDT && <td className="px-2 py-2">{item.BacDTHienthi}</td>}
                                    {visibleColumns.nganhNghe && <td className="px-2 py-2">{item.Dacdiem}</td>}
                                    {visibleColumns.loaiHinhDT && <td className="px-2 py-2">{item.LoaihinhDT}</td>}
                                    {visibleColumns.khoaQL && <td className="px-2 py-2">{item.Donvi}</td>}
                                    <td className="px-2 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.Tenlop}</td>
                                    {visibleColumns.cvht && <td className="px-2 py-2 whitespace-nowrap">{item.Gvcn}</td>}
                                    <td className="px-2 py-2 text-center font-bold text-gray-600 dark:text-gray-300">{item.DauVao}</td>
                                    {visibleColumns.cuoiKhoa && <td className="px-2 py-2 text-center font-bold text-teal-600 dark:text-teal-400">{item.CuoiKhoa}</td>}
                                    <td className="px-2 py-2 text-center font-normal text-teal-600 dark:text-teal-400">{item.TyLeCK}%</td>
                                    <td className="px-2 py-2 text-center font-bold text-purple-600 dark:text-purple-400">{item.TotNghiep}</td>
                                    <td className="px-2 py-2 text-center font-normal text-purple-600 dark:text-purple-400">{item.TyLeTN}%</td>
                                    <td className="px-2 py-2 text-center font-bold">{item.Nam}</td>
                                    <td className="px-2 py-2 text-center font-bold">{item.Nu}</td>
                                    <td className="px-2 py-2 text-center font-bold text-yellow-600 dark:text-yellow-400">{item.XLTN_XuatSac}</td>
                                    <td className="px-2 py-2 text-center font-normal text-yellow-600 dark:text-yellow-400">{item.TyLeTNXS}%</td>
                                    <td className="px-2 py-2 text-center font-bold text-green-600 dark:text-green-400">{item.XLTN_Gioi}</td>
                                    <td className="px-2 py-2 text-center font-normal text-green-600 dark:text-green-400">{item.TyLeTNG}%</td>
                                    <td className="px-2 py-2 text-center font-bold text-blue-600 dark:text-blue-400">{item.XLTN_Kha}</td>
                                    <td className="px-2 py-2 text-center font-normal text-blue-600 dark:text-blue-400">{item.TyLeTNK}%</td>
                                    <td className="px-2 py-2 text-center font-bold text-cyan-600 dark:text-cyan-400">{item.XLTN_TBKha}</td>
                                    <td className="px-2 py-2 text-center font-normal text-cyan-600 dark:text-cyan-400">{item.TyLeTNTBK}%</td>
                                    <td className="px-2 py-2 text-center font-bold text-slate-600 dark:text-slate-400">{item.XLTN_TBinh}</td>
                                    <td className="px-2 py-2 text-center font-normal text-slate-600 dark:text-slate-400">{item.TyLeTNTB}%</td>
                                    {visibleColumns.xlrlXuatSac && <td className="px-2 py-2 text-center font-bold">{item.XLRL_XuatSac}</td>}
                                    {visibleColumns.tyLeRLXS && <td className="px-2 py-2 text-center font-normal">{item.TyLeRLXS}%</td>}
                                    {visibleColumns.xlrlTot && <td className="px-2 py-2 text-center font-bold">{item.XLRL_Tot}</td>}
                                    {visibleColumns.tyLeRLT && <td className="px-2 py-2 text-center font-normal">{item.TyLeRLT}%</td>}
                                    {visibleColumns.xlrlKha && <td className="px-2 py-2 text-center font-bold">{item.XLRL_Kha}</td>}
                                    {visibleColumns.tyLeRLK && <td className="px-2 py-2 text-center font-normal">{item.TyLeRLK}%</td>}
                                    {visibleColumns.xlrlTBinh && <td className="px-2 py-2 text-center font-bold">{item.XLRL_TBinh}</td>}
                                    {visibleColumns.tyLeRLTB && <td className="px-2 py-2 text-center font-normal">{item.TyLeRLTB}%</td>}
                                    <td className="px-2 py-2 text-center font-bold text-cyan-600 dark:text-cyan-400">{item.ViecLam}</td>
                                    <td className="px-2 py-2 text-center font-normal text-cyan-600 dark:text-cyan-400">{item.TyLeVL}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
            )}
        </div>
    );
}

// --- Component cho Tab 2: Thống kê theo Năm (Không thay đổi) ---
const StatsByYearTab = () => {
    // ... (Toàn bộ code của component này được giữ nguyên)
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [decisions, setDecisions] = useState([]);
    const [selectedDecisions, setSelectedDecisions] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleColumns, setVisibleColumns] = useState({
        bacDT: false, nganhNghe: false, loaiHinhDT: false, khoaQL: false, cvht: false,
        xlrlXuatSac: false, tyLeRLXS: false, xlrlTot: false, tyLeRLT: false,
        xlrlKha: false, tyLeRLK: false, xlrlTBinh: false, tyLeRLTB: false,
    });

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const { data } = await axiosInstance.get('/statistics/graduation-years');
                setYears(data);
                if (data.length > 0) setSelectedYear(data[0]);
            } catch (err) { toast.error("Không thể tải danh sách năm tốt nghiệp."); }
        };
        fetchYears();
    }, []);

    useEffect(() => {
        if (!selectedYear) return;
        setDecisions([]); setSelectedDecisions([]);
        const fetchDecisions = async () => {
            try {
                const { data } = await axiosInstance.get(`/statistics/graduation-decisions-by-year?year=${selectedYear}`);
                setDecisions(data);
                setSelectedDecisions(data.map(d => d.MaQDTN));
            } catch (err) { toast.error("Không thể tải danh sách quyết định."); }
        };
        fetchDecisions();
    }, [selectedYear]);

    useEffect(() => {
        if (selectedDecisions.length === 0) {
            setData([]);
            setLoading(false);
            return;
        }
        const fetchData = async () => {
            setLoading(true); setError(null); setData([]);
            try {
                const params = new URLSearchParams({ maQDTNs: selectedDecisions.join(',') });
                const { data } = await axiosInstance.get(`/statistics/graduation-data-by-decision?${params.toString()}`);
                setData(data);
            } catch (err) {
                setError('Không thể tải dữ liệu. Vui lòng thử lại.');
                toast.error('Lỗi khi tải dữ liệu thống kê.');
            } finally { setLoading(false); }
        };
        fetchData();
    }, [selectedDecisions]);

    const processedData = useMemo(() => data.map(item => ({
        ...item,
        TyLeTNXS: item.TotNghiep > 0 ? ((item.XLTN_XuatSac / item.TotNghiep) * 100).toFixed(1) : "0.0",
        TyLeTNG: item.TotNghiep > 0 ? ((item.XLTN_Gioi / item.TotNghiep) * 100).toFixed(1) : "0.0",
        TyLeTNK: item.TotNghiep > 0 ? ((item.XLTN_Kha / item.TotNghiep) * 100).toFixed(1) : "0.0",
        TyLeTNTBK: item.TotNghiep > 0 ? ((item.XLTN_TBKha / item.TotNghiep) * 100).toFixed(1) : "0.0",
        TyLeTNTB: item.TotNghiep > 0 ? ((item.XLTN_TBinh / item.TotNghiep) * 100).toFixed(1) : "0.0",
        TyLeRLXS: item.TotNghiep > 0 ? ((item.XLRL_XuatSac / item.TotNghiep) * 100).toFixed(1) : "0.0",
        TyLeRLT: item.TotNghiep > 0 ? ((item.XLRL_Tot / item.TotNghiep) * 100).toFixed(1) : "0.0",
        TyLeRLK: item.TotNghiep > 0 ? ((item.XLRL_Kha / item.TotNghiep) * 100).toFixed(1) : "0.0",
        TyLeRLTB: item.TotNghiep > 0 ? ((item.XLRL_TBinh / item.TotNghiep) * 100).toFixed(1) : "0.0",
        TyLeVL: item.TotNghiep > 0 ? ((item.ViecLam / item.TotNghiep) * 100).toFixed(1) : "0.0",
    })), [data]);

    const summary = useMemo(() => {
        const initial = { soLopXetTN: 0, totNghiep: 0, xs: 0, gioi: 0, kha: 0, tbk: 0, tb: 0, bacDTCounts: {} };
        const s = processedData.reduce((acc, curr) => {
            acc.totNghiep += curr.TotNghiep;
            acc.xs += curr.XLTN_XuatSac; acc.gioi += curr.XLTN_Gioi; acc.kha += curr.XLTN_Kha;
            acc.tbk += curr.XLTN_TBKha; acc.tb += curr.XLTN_TBinh;
            acc.bacDTCounts[curr.BacDTHienthi] = (acc.bacDTCounts[curr.BacDTHienthi] || 0) + curr.TotNghiep;
            return acc;
        }, initial);
        s.soLopXetTN = processedData.length;
        s.tyLeXS = s.totNghiep > 0 ? ((s.xs / s.totNghiep) * 100).toFixed(1) : 0;
        s.tyLeGioi = s.totNghiep > 0 ? ((s.gioi / s.totNghiep) * 100).toFixed(1) : 0;
        s.tyLeKha = s.totNghiep > 0 ? ((s.kha / s.totNghiep) * 100).toFixed(1) : 0;
        s.tyLeTBK = s.totNghiep > 0 ? ((s.tbk / s.totNghiep) * 100).toFixed(1) : 0;
        s.tyLeTB = s.totNghiep > 0 ? ((s.tb / s.totNghiep) * 100).toFixed(1) : 0;
        return s;
    }, [processedData]);

    const chartData = useMemo(() => {
        const result = {};
        const availableBacDTs = [...new Set(processedData.map(p => p.BacDTHienthi))];
        const xlrlOrder = ['Xuất sắc', 'Tốt', 'Khá', 'Trung bình'];
        availableBacDTs.forEach(bacDT => {
            const dataForBacDT = processedData.filter(p => p.BacDTHienthi === bacDT);
            const totalGraduates = dataForBacDT.reduce((sum, item) => sum + item.TotNghiep, 0);
            if (totalGraduates > 0) {
                const xltnDataRaw = dataForBacDT.reduce((acc, item) => {
                    acc['Xuất sắc'] = (acc['Xuất sắc'] || 0) + item.XLTN_XuatSac;
                    acc['Giỏi'] = (acc['Giỏi'] || 0) + item.XLTN_Gioi;
                    acc['Khá'] = (acc['Khá'] || 0) + item.XLTN_Kha;
                    acc['T.bình khá'] = (acc['T.bình khá'] || 0) + item.XLTN_TBKha;
                    acc['Trung bình'] = (acc['Trung bình'] || 0) + item.XLTN_TBinh;
                    return acc;
                }, {});
                const xlrlDataRaw = dataForBacDT.reduce((acc, item) => {
                    acc['Xuất sắc'] = (acc['Xuất sắc'] || 0) + item.XLRL_XuatSac;
                    acc['Tốt'] = (acc['Tốt'] || 0) + item.XLRL_Tot;
                    acc['Khá'] = (acc['Khá'] || 0) + item.XLRL_Kha;
                    acc['Trung bình'] = (acc['Trung bình'] || 0) + item.XLRL_TBinh;
                    return acc;
                }, {});
                result[bacDT] = {
                    xltn: Object.entries(xltnDataRaw).map(([name, value]) => ({ name, value, percentage: ((value / totalGraduates) * 100).toFixed(1) })).filter(d => d.value > 0),
                    xlrl: Object.entries(xlrlDataRaw).map(([name, value]) => ({ name, value, percentage: ((value / totalGraduates) * 100).toFixed(1) })).filter(d => d.value > 0).sort((a, b) => xlrlOrder.indexOf(a.name) - xlrlOrder.indexOf(b.name))
                };
            }
        });
        return result;
    }, [processedData]);

    const handleDecisionChange = (maQDTN) => {
        setSelectedDecisions(prev => prev.includes(maQDTN) ? prev.filter(d => d !== maQDTN) : [...prev, maQDTN]);
    };

    const handleExport = (format) => {
        if (processedData.length === 0) { toast.error("Không có dữ liệu để xuất."); return; }
        const visibleHeaders = {
            'Stt': (item, index) => index + 1,
            'Khóa ĐT': 'Khoahoc', ...(visibleColumns.bacDT && { 'Bậc ĐT': 'BacDTHienthi' }), ...(visibleColumns.nganhNghe && { 'Ngành nghề': 'Dacdiem' }),
            ...(visibleColumns.loaiHinhDT && { 'Loại hình ĐT': 'LoaihinhDT' }), ...(visibleColumns.khoaQL && { 'Khoa quản lý': 'Donvi' }),
            'Tên lớp': 'Tenlop', ...(visibleColumns.cvht && { 'Cố vấn học tập': 'Gvcn' }), 'Danh sách': 'DanhSach',
            'Tốt nghiệp': 'TotNghiep', 'Nam': 'Nam', 'Nữ': 'Nu',
            'XLTN Xuất sắc': 'XLTN_XuatSac', 'Tỷ lệ TNXS (%)': 'TyLeTNXS', 'XLTN Giỏi': 'XLTN_Gioi', 'Tỷ lệ TNG (%)': 'TyLeTNG',
            'XLTN Khá': 'XLTN_Kha', 'Tỷ lệ TNK (%)': 'TyLeTNK', 'XLTN TB khá': 'XLTN_TBKha', 'Tỷ lệ TNTBK (%)': 'TyLeTNTBK',
            'XLTN Tbình': 'XLTN_TBinh', 'Tỷ lệ TNTB (%)': 'TyLeTNTB',
            ...(visibleColumns.xlrlXuatSac && { 'XLRL Xuất sắc': 'XLRL_XuatSac' }), ...(visibleColumns.tyLeRLXS && { 'Tỷ lệ RLXS (%)': 'TyLeRLXS' }),
            ...(visibleColumns.xlrlTot && { 'XLRL Tốt': 'XLRL_Tot' }), ...(visibleColumns.tyLeRLT && { 'Tỷ lệ RLT (%)': 'TyLeRLT' }),
            ...(visibleColumns.xlrlKha && { 'XLRL Khá': 'XLRL_Kha' }), ...(visibleColumns.tyLeRLK && { 'Tỷ lệ RLK (%)': 'TyLeRLK' }),
            ...(visibleColumns.xlrlTBinh && { 'XLRL Tbình': 'XLRL_TBinh' }), ...(visibleColumns.tyLeRLTB && { 'Tỷ lệ RLTB (%)': 'TyLeRLTB' }),
            'Việc làm': 'ViecLam', 'Tỷ lệ VL (%)': 'TyLeVL',
        };
        const dataToExport = processedData.map((item, index) => {
            const row = {};
            for (const header in visibleHeaders) {
                const keyOrFunc = visibleHeaders[header];
                row[header] = typeof keyOrFunc === 'function' ? keyOrFunc(item, index) : item[keyOrFunc];
            }
            return row;
        });
        const filename = `ThongKeTotNghiep_TheoNam_${selectedYear}`;
        const subTitle = `Năm tốt nghiệp: ${selectedYear}`;
        if (format === 'excel') {
            exportToExcel({ data: dataToExport, filename, mainTitle: "THỐNG KÊ TỐT NGHIỆP THEO NĂM", subTitle: subTitle });
        } else if (format === 'csv') {
            exportToCSV({ data: dataToExport, filename });
        }
        toast.success(`Đã xuất file ${format.toUpperCase()} thành công!`);
    };

    return (
        <div className="pt-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                        <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Năm tốt nghiệp</label>
                        <select id="year-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500">
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quyết định tốt nghiệp</label>
                        <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md dark:border-gray-600 min-h-[42px]">
                            {decisions.map(d => (
                                <button key={d.MaQDTN} onClick={() => handleDecisionChange(d.MaQDTN)} className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${selectedDecisions.includes(d.MaQDTN) ? 'bg-blue-600 text-white font-semibold shadow' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500'}`}>
                                    {d.Display}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {loading && <div className="flex flex-col items-center justify-center p-10"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /><p className="mt-4">Đang tải dữ liệu...</p></div>}
            {error && !loading && <div className="flex flex-col items-center justify-center p-10 bg-red-50 dark:bg-red-900/20 rounded-lg"><ServerCrash className="w-12 h-12 text-red-500" /><p className="mt-4 text-red-700">{error}</p></div>}
            {!loading && !error && processedData.length === 0 && (
                <div className="text-center py-10 text-gray-500"><p>Không có dữ liệu tốt nghiệp cho lựa chọn hiện tại.</p></div>
            )}

            {!loading && !error && processedData.length > 0 && (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                    <StatCard title="Số lớp xét TN" value={summary.soLopXetTN} icon={<Library className="w-6 h-6"/>} color="#0284c7" />
                    <StatCard title="SLg Tốt nghiệp" value={summary.totNghiep} icon={<GraduationCap className="w-6 h-6"/>} color="#8b5cf6" />
                    {Object.entries(summary.bacDTCounts).map(([bacDT, count]) => (
                        <StatCard key={bacDT} title={bacDT} value={count} icon={<Library className="w-6 h-6"/>} color="#16a34a" />
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
                    <StatCard title="Xuất sắc" value={summary.xs} icon={<Award className="w-6 h-6"/>} color="#ca8a04" extraValue={summary.tyLeXS} extraLabel="% so TN"/>
                    <StatCard title="Giỏi" value={summary.gioi} icon={<Star className="w-6 h-6"/>} color="#16a34a" extraValue={summary.tyLeGioi} extraLabel=""/>
                    <StatCard title="Khá" value={summary.kha} icon={<ThumbsUp className="w-6 h-6"/>} color="#2563eb" extraValue={summary.tyLeKha} extraLabel=""/>
                    <StatCard title="T.bình khá" value={summary.tbk} icon={<Medal className="w-6 h-6"/>} color="#0891b2" extraValue={summary.tyLeTBK} extraLabel=""/>
                    <StatCard title="Trung bình" value={summary.tb} icon={<Medal className="w-6 h-6"/>} color="#64748b" extraValue={summary.tyLeTB} extraLabel=""/>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-6">
                {Object.entries(chartData).map(([bacDT, chartData]) => (
                    <div key={bacDT} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-primary dark:text-white text-center">Xếp loại tốt nghiệp - {bacDT}</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={chartData.xltn} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                                const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                                                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                                return (<text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>{`${(percent * 100).toFixed(0)}%`}</text>);
                                            }}>
                                                {chartData.xltn.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS_XLTN[index % PIE_COLORS_XLTN.length]} />)}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-primary dark:text-white text-center">Kết quả rèn luyện - {bacDT}</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={chartData.xlrl} layout="vertical" margin={{ top: 20, right: 40, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" width={80} tick={{ fill: 'currentColor', fontSize: 12 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="value" barSize={20}>
                                                {chartData.xlrl.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS_XLRL[index % PIE_COLORS_XLRL.length]} />
                                                ))}
                                                <LabelList dataKey="value" position="right" content={renderCustomBarLabel} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
                    <div className="flex justify-between items-center p-4">
                        <h3 className="text-lg font-semibold text-primary dark:text-white">Bảng tổng hợp chi tiết</h3>
                        <div className="flex items-center gap-2">
                            
							 <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed">
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
                                            bacDT: 'Bậc ĐT', nganhNghe: 'Ngành nghề', loaiHinhDT: 'Loại hình ĐT', khoaQL: 'Khoa quản lý', cvht: 'Cố vấn học tập', 
                                            xlrlXuatSac: 'XLRL Xuất sắc', tyLeRLXS: 'Tỷ lệ RLXS', xlrlTot: 'XLRL Tốt', tyLeRLT: 'Tỷ lệ RLT',
                                            xlrlKha: 'XLRL Khá', tyLeRLK: 'Tỷ lệ RLK', xlrlTBinh: 'XLRL Tbình', tyLeRLTB: 'Tỷ lệ RLTB'
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
                        {/* Table Head */}
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                            <tr>
                               <th className="px-2 py-3 text-center">Stt</th>
                               <th className="px-2 py-3">Khóa ĐT</th>
                               {visibleColumns.bacDT && <th className="px-2 py-3">Bậc ĐT</th>}
                               {visibleColumns.nganhNghe && <th className="px-2 py-3">Ngành nghề</th>}
                               {visibleColumns.loaiHinhDT && <th className="px-2 py-3">Loại hình ĐT</th>}
                               {visibleColumns.khoaQL && <th className="px-2 py-3">Khoa QL</th>}
                               <th className="px-2 py-3">Tên lớp</th>
                               {visibleColumns.cvht && <th className="px-2 py-3">CVHT</th>}
                               <th className="px-2 py-3 text-center">Danh sách</th>
                               <th className="px-2 py-3 text-center">Tốt nghiệp</th>
                               <th className="px-2 py-3 text-center">Nam</th>
                               <th className="px-2 py-3 text-center">Nữ</th>
                               <th className="px-2 py-3 text-center">XLTN XS</th>
                               <th className="px-2 py-3 text-center">Tỷ lệ</th>
                               <th className="px-2 py-3 text-center">XLTN Giỏi</th>
                               <th className="px-2 py-3 text-center">Tỷ lệ</th>
                               <th className="px-2 py-3 text-center">XLTN Khá</th>
                               <th className="px-2 py-3 text-center">Tỷ lệ</th>
                               <th className="px-2 py-3 text-center">XLTN TBK</th>
                               <th className="px-2 py-3 text-center">Tỷ lệ</th>
                               <th className="px-2 py-3 text-center">XLTN TB</th>
                               <th className="px-2 py-3 text-center">Tỷ lệ</th>
                               {visibleColumns.xlrlXuatSac && <th className="px-2 py-3 text-center">XLRL XS</th>}
                               {visibleColumns.tyLeRLXS && <th className="px-2 py-3 text-center">Tỷ lệ</th>}
                               {visibleColumns.xlrlTot && <th className="px-2 py-3 text-center">XLRL Tốt</th>}
                               {visibleColumns.tyLeRLT && <th className="px-2 py-3 text-center">Tỷ lệ</th>}
                               {visibleColumns.xlrlKha && <th className="px-2 py-3 text-center">XLRL Khá</th>}
                               {visibleColumns.tyLeRLK && <th className="px-2 py-3 text-center">Tỷ lệ</th>}
                               {visibleColumns.xlrlTBinh && <th className="px-2 py-3 text-center">XLRL TB</th>}
                               {visibleColumns.tyLeRLTB && <th className="px-2 py-3 text-center">Tỷ lệ</th>}
                               <th className="px-2 py-3 text-center">Việc làm</th>
                               <th className="px-2 py-3 text-center">Tỷ lệ VL</th>
                            </tr>
                        </thead>
                        {/* Table Body */}
                        <tbody>
                            {processedData.map((item, index) => (
                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-2 py-2 text-center">{index + 1}</td>
                                    <td className="px-2 py-2">{item.Khoahoc}</td>
                                    {visibleColumns.bacDT && <td className="px-2 py-2">{item.BacDTHienthi}</td>}
                                    {visibleColumns.nganhNghe && <td className="px-2 py-2">{item.Dacdiem}</td>}
                                    {visibleColumns.loaiHinhDT && <td className="px-2 py-2">{item.LoaihinhDT}</td>}
                                    {visibleColumns.khoaQL && <td className="px-2 py-2">{item.Donvi}</td>}
                                    <td className="px-2 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.Tenlop}</td>
                                    {visibleColumns.cvht && <td className="px-2 py-2 whitespace-nowrap">{item.Gvcn}</td>}
                                    <td className="px-2 py-2 text-center font-bold text-gray-600 dark:text-gray-300">{item.DanhSach}</td>
                                    <td className="px-2 py-2 text-center font-bold text-purple-600 dark:text-purple-400">{item.TotNghiep}</td>
                                    <td className="px-2 py-2 text-center font-bold">{item.Nam}</td>
                                    <td className="px-2 py-2 text-center font-bold">{item.Nu}</td>
                                    <td className="px-2 py-2 text-center font-bold text-yellow-600 dark:text-yellow-400">{item.XLTN_XuatSac}</td>
                                    <td className="px-2 py-2 text-center font-normal text-yellow-600 dark:text-yellow-400">{item.TyLeTNXS}%</td>
                                    <td className="px-2 py-2 text-center font-bold text-green-600 dark:text-green-400">{item.XLTN_Gioi}</td>
                                    <td className="px-2 py-2 text-center font-normal text-green-600 dark:text-green-400">{item.TyLeTNG}%</td>
                                    <td className="px-2 py-2 text-center font-bold text-blue-600 dark:text-blue-400">{item.XLTN_Kha}</td>
                                    <td className="px-2 py-2 text-center font-normal text-blue-600 dark:text-blue-400">{item.TyLeTNK}%</td>
                                    <td className="px-2 py-2 text-center font-bold text-cyan-600 dark:text-cyan-400">{item.XLTN_TBKha}</td>
                                    <td className="px-2 py-2 text-center font-normal text-cyan-600 dark:text-cyan-400">{item.TyLeTNTBK}%</td>
                                    <td className="px-2 py-2 text-center font-bold text-slate-600 dark:text-slate-400">{item.XLTN_TBinh}</td>
                                    <td className="px-2 py-2 text-center font-normal text-slate-600 dark:text-slate-400">{item.TyLeTNTB}%</td>
                                    {visibleColumns.xlrlXuatSac && <td className="px-2 py-2 text-center font-bold">{item.XLRL_XuatSac}</td>}
                                    {visibleColumns.tyLeRLXS && <td className="px-2 py-2 text-center font-normal">{item.TyLeRLXS}%</td>}
                                    {visibleColumns.xlrlTot && <td className="px-2 py-2 text-center font-bold">{item.XLRL_Tot}</td>}
                                    {visibleColumns.tyLeRLT && <td className="px-2 py-2 text-center font-normal">{item.TyLeRLT}%</td>}
                                    {visibleColumns.xlrlKha && <td className="px-2 py-2 text-center font-bold">{item.XLRL_Kha}</td>}
                                    {visibleColumns.tyLeRLK && <td className="px-2 py-2 text-center font-normal">{item.TyLeRLK}%</td>}
                                    {visibleColumns.xlrlTBinh && <td className="px-2 py-2 text-center font-bold">{item.XLRL_TBinh}</td>}
                                    {visibleColumns.tyLeRLTB && <td className="px-2 py-2 text-center font-normal">{item.TyLeRLTB}%</td>}
                                    <td className="px-2 py-2 text-center font-bold text-cyan-600 dark:text-cyan-400">{item.ViecLam}</td>
                                    <td className="px-2 py-2 text-center font-normal text-cyan-600 dark:text-cyan-400">{item.TyLeVL}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
            )}
        </div>
    );
}

// --- Component chính của trang ---
const GraduationStatsPage = () => {
    useEffect(() => {
        axiosInstance.post('/log-action', {
            Cuaso: 'TK tốt nghiệp', Congviec: 'Mở trang',
            Ghichu: 'Thành công'
        }).catch(err => console.error("Lỗi ghi log:", err));
    }, []);

    return (
        <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900/50 min-h-full">
            <h1 className="text-2xl font-bold text-red-800 dark:text-white mb-4 text-center uppercase">THỐNG KÊ TỐT NGHIỆP</h1>
            <Tabs.Root defaultValue="tab1">
                <Tabs.List className="flex border-b border-gray-300 dark:border-gray-700">
                    <Tabs.Trigger value="tab1" className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-300 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600">Thống kê theo Khóa</Tabs.Trigger>
                    <Tabs.Trigger value="tab2" className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-300 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600">Thống kê theo Năm TN</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="tab1">
                    <StatsByCourseTab />
                </Tabs.Content>
                <Tabs.Content value="tab2">
                    <StatsByYearTab />
                </Tabs.Content>
            </Tabs.Root>
        </div>
    );
};

export default GraduationStatsPage;
