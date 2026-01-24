/*
 * D:/QLDT-app/client/src/pages/AdmissionStatsPage.jsx
 * Cập nhật: 25/10/2025
 * Tóm tắt: Bổ sung log khi mở trang
 */
import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Target, UserCheck, UserPlus, Users, Loader2, ServerCrash, Download } from 'lucide-react';
import { exportToExcel } from '../lib/excelExporter';
import useMediaQuery from '../hooks/useMediaQuery';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
// Bổ sung: 1. Import hook
import { usePageLogger } from '../hooks/usePageLogger';

// Component Thẻ điểm (StatCard)
const StatCard = ({ title, value, icon, color, extraValue, extraLabel }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center space-x-4 border-l-4" style={{ borderColor: color }}>
        <div className={`rounded-full p-3 text-white`} style={{ backgroundColor: color }}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value.toLocaleString('vi-VN')}</p>
                {extraValue && (
                    <p className="text-sm font-semibold" style={{ color: color }}>
                        ({extraValue}% {extraLabel})
                    </p>
                )}
            </div>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600 shadow-xl">
                <p className="font-bold text-base mb-2 text-gray-800 dark:text-gray-100">{label}</p>
                {payload.map((p, index) => {
                    let rateInfo = '';
                    if (p.dataKey === 'NV1') rateInfo = `(${data.TyLeNV1}%)`;
                    if (p.dataKey === 'Sum_Trungtuyen') rateInfo = `(${data.TyLeTT}%)`;
                    if (p.dataKey === 'Sum_Nhaphoc') rateInfo = `(${data.TyLeNH}%)`;
                    return (
                        <p key={index} style={{ color: p.color }} className="text-sm">
                            {`${p.name}: ${p.value.toLocaleString('vi-VN')} ${rateInfo}`}
                        </p>
                    );
                })}
            </div>
        );
    }
    return null;
};

// Component chính của trang
const AdmissionStatsPage = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [availableKhoa, setAvailableKhoa] = useState([]);
    const [selectedKhoa, setSelectedKhoa] = useState('');
    const [availableDot, setAvailableDot] = useState([]);
    const [selectedDot, setSelectedDot] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
	// Bổ sung: 2. Gọi hook ghi log
	usePageLogger('TK Tuyển sinh');
/*
    useEffect(() => {
        const logAccess = async () => {
            try {
                await axiosInstance.post('/log-action', {
                    Cuaso: 'Thống kê tuyển sinh',
                    Congviec: 'Mở trang',
                    Ghichu: 'Thành công'
                });
            } catch (error) {
                console.error("Lỗi ghi log truy cập trang:", error);
            }
        };
        logAccess();
    }, []);
*/
    useEffect(() => {
        const fetchKhoa = async () => {
            try {
                const res = await axiosInstance.get('/statistics/admission-cohorts');
                const khoaList = res.data.map(item => item.Khoa);
                setAvailableKhoa(khoaList);
                if (khoaList.length > 0) setSelectedKhoa(khoaList[0]);
            } catch (err) { toast.error("Không thể tải danh sách khóa tuyển sinh."); }
        };
        fetchKhoa();
    }, []);

    useEffect(() => {
        if (!selectedKhoa) return;
        setAvailableDot([]); setSelectedDot([]);
        const fetchDot = async () => {
            try {
                const res = await axiosInstance.get(`/statistics/admission-phases?khoa=${selectedKhoa}`);
                setAvailableDot(res.data);
                setSelectedDot(res.data.map(d => d.MaDXT));
            } catch (err) { toast.error("Không thể tải danh sách đợt tuyển sinh."); }
        };
        fetchDot();
    }, [selectedKhoa]);

    useEffect(() => {
        if (!selectedKhoa) return;
        const fetchData = async () => {
            setLoading(true); setError(null);
            try {
                const params = new URLSearchParams({ khoa: selectedKhoa, dxt: selectedDot.join(',') });
                const res = await axiosInstance.get(`/statistics/admissions?${params.toString()}`);
                setData(res.data);
            } catch (err) {
                setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại.');
                toast.error('Lỗi khi tải dữ liệu thống kê.');
            } finally { setLoading(false); }
        };
        fetchData();
    }, [selectedKhoa, selectedDot]);
    
    const processedData = useMemo(() => {
        return data.map(item => ({
            ...item,
            TyLeNV1: item.Chitieu > 0 ? ((item.NV1 / item.Chitieu) * 100).toFixed(1) : "0.0",
            TyLeTT: item.Chitieu > 0 ? ((item.Sum_Trungtuyen / item.Chitieu) * 100).toFixed(1) : "0.0",
            TyLeNH: item.Chitieu > 0 ? ((item.Sum_Nhaphoc / item.Chitieu) * 100).toFixed(1) : "0.0",
            TyLePL: item.Chitieu > 0 ? ((item.Sum_Phanlop / item.Chitieu) * 100).toFixed(1) : "0.0",
        }));
    }, [data]);

    const summary = useMemo(() => {
        const initial = { totalChitieu: 0, totalNV1: 0, totalTrungTuyen: 0, totalNhapHoc: 0 };
        const summaryData = processedData.reduce((acc, curr) => {
            acc.totalChitieu += curr.Chitieu;
            acc.totalNV1 += curr.NV1;
            acc.totalTrungTuyen += curr.Sum_Trungtuyen;
            acc.totalNhapHoc += curr.Sum_Nhaphoc;
            return acc;
        }, initial);
        summaryData.tyLeNV1 = summaryData.totalChitieu > 0 ? ((summaryData.totalNV1 / summaryData.totalChitieu) * 100).toFixed(1) : 0;
        summaryData.tyLeTrungTuyen = summaryData.totalChitieu > 0 ? ((summaryData.totalTrungTuyen / summaryData.totalChitieu) * 100).toFixed(1) : 0;
        summaryData.tyLeNhapHoc = summaryData.totalChitieu > 0 ? ((summaryData.totalNhapHoc / summaryData.totalChitieu) * 100).toFixed(1) : 0;
        return summaryData;
    }, [processedData]);

    const handleDotChange = (dxt) => {
        setSelectedDot(prev => prev.includes(dxt) ? prev.filter(d => d !== dxt) : [...prev, dxt]);
    };

    const handleExport = (format) => {
        if (processedData.length === 0) {
            toast.error("Không có dữ liệu để xuất."); return;
        }
        // BỔ SUNG: Thêm cột Stt vào dữ liệu xuất file
        const dataToExport = processedData.map((item, index) => ({
            'Stt': index + 1,
            'Bậc ĐT': item.BacDT, 'Ngành nghề': item.Nganhhoc, 'Chỉ tiêu': item.Chitieu, 'NV1': item.NV1,
            'Tỷ lệ NV1 (%)': item.TyLeNV1, 'Trúng tuyển': item.Sum_Trungtuyen, 'Tỷ lệ TT (%)': item.TyLeTT,
            'Nhập học': item.Sum_Nhaphoc, 'Tỷ lệ NH (%)': item.TyLeNH, 'Phân lớp': item.Sum_Phanlop,
            'Tỷ lệ PL (%)': item.TyLePL,
        }));
        
        const filename = `ThongKeTuyenSinh_${selectedKhoa}`;
        const selectedDotInfo = selectedDot.length === availableDot.length ? "Tất cả" : selectedDot.map(sd => availableDot.find(d => d.MaDXT === sd)?.DotXT).join(', ');
        const subTitle = `Khóa tuyển sinh: ${selectedKhoa} - Đợt: ${selectedDotInfo}`;

        if (format === 'excel') {
            exportToExcel({
                data: dataToExport, filename, mainTitle: "THỐNG KÊ TUYỂN SINH", subTitle: subTitle
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
            <h1 className="text-2xl font-bold text-red-800 dark:text-white uppercase mb-4 text-center">THỐNG KÊ TUYỂN SINH</h1>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                        <label htmlFor="khoa-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Khóa tuyển sinh</label>
                        <select id="khoa-select" value={selectedKhoa} onChange={(e) => setSelectedKhoa(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500">
                            {availableKhoa.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Đợt tuyển sinh (chọn nhiều)</label>
                        <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md dark:border-gray-600 min-h-[42px]">
                             {availableDot.map(d => (
                                <button key={d.MaDXT} onClick={() => handleDotChange(d.MaDXT)} className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${selectedDot.includes(d.MaDXT) ? 'bg-blue-600 text-white font-semibold shadow' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'}`}>
                                    {d.DotXT}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {loading && <div className="flex flex-col items-center justify-center p-10"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /><p className="mt-4 text-lg">Đang tải dữ liệu...</p></div>}
            {error && !loading && <div className="flex flex-col items-center justify-center p-10 bg-red-50 dark:bg-red-900/20 rounded-lg"><ServerCrash className="w-12 h-12 text-red-500" /><p className="mt-4 text-lg text-red-700 dark:text-red-300">{error}</p></div>}
            
            {!loading && !error && (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                    <StatCard title="Tổng Chỉ tiêu" value={summary.totalChitieu} icon={<Target className="w-6 h-6"/>} color="#3b82f6" />
                    <StatCard title="Tổng Đăng ký (NV1)" value={summary.totalNV1} icon={<UserPlus className="w-6 h-6"/>} color="#f97316" extraValue={summary.tyLeNV1} extraLabel="so chỉ tiêu" />
                    <StatCard title="Tổng Trúng tuyển" value={summary.totalTrungTuyen} icon={<UserCheck className="w-6 h-6"/>} color="#22c55e" extraValue={summary.tyLeTrungTuyen} extraLabel="so chỉ tiêu"/>
                    <StatCard title="Tổng Nhập học" value={summary.totalNhapHoc} icon={<Users className="w-6 h-6"/>} color="#8b5cf6" extraValue={summary.tyLeNhapHoc} extraLabel="so chỉ tiêu"/>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-4 text-primary dark:text-white">Biểu đồ tuyển sinh hỗn hợp</h3>
                         <div style={{ width: '100%', height: isMobile ? 600 : 450 }}>
                            <ResponsiveContainer>
                                <ComposedChart data={processedData} layout={isMobile ? 'vertical' : 'horizontal'} margin={isMobile ? { top: 20, right: 30, left: 20, bottom: 20 } : { top: 20, right: 20, left: -10, bottom: 120 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                    {isMobile ? (
                                        <>
                                            <XAxis type="number" tick={{ fill: 'rgb(156 163 175)', fontSize: 12 }} />
                                            <YAxis type="category" dataKey="NganhViettat" width={80} tick={{ fill: 'rgb(156 163 175)', fontSize: 12 }} />
                                        </>
                                    ) : (
                                        <>
                                            <XAxis dataKey="NganhViettat" angle={-60} textAnchor="end" interval={0} tick={{ fill: 'rgb(156 163 175)', fontSize: 12 }} />
                                            <YAxis allowDecimals={false} tick={{ fill: 'rgb(156 163 175)', fontSize: 12 }} />
                                        </>
                                    )}
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}/>
                                    <Legend wrapperStyle={isMobile ? {} : { paddingTop: '40px' }}/>
                                    <Bar dataKey="NV1" name="NV1" fill="#f97316" />
                                    <Bar dataKey="Sum_Trungtuyen" name="Trúng tuyển" fill="#22c55e" />
                                    <Bar dataKey="Sum_Nhaphoc" name="Nhập học" fill="#8b5cf6" />
                                    <Line type="monotone" dataKey="Chitieu" name="Chỉ tiêu" stroke="#3b82f6" strokeWidth={3}>
                                        <LabelList dataKey="Chitieu" position={isMobile ? "right" : "top"} fill="#3b82f6" fontSize={12} fontWeight="bold" />
                                    </Line>
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
                        <div className="flex justify-between items-center p-4">
                            <h3 className="text-lg font-semibold text-primary dark:text-white">Bảng tổng hợp chi tiết</h3>
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button disabled={loading || data.length === 0} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition-colors data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed">
                                        <Download className="w-4 h-4" /> Xuất file
                                    </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                    <DropdownMenu.Content align="end" className="w-48 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-xl border dark:border-gray-700 z-50">
                                        <DropdownMenu.Item onSelect={() => handleExport('excel')} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none text-sm">Xuất Excel (.xlsx)</DropdownMenu.Item>
                                        <DropdownMenu.Item onSelect={() => handleExport('csv')} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none text-sm">Xuất CVS (.csv)</DropdownMenu.Item>
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                        </div>
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-row-hover">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                                <tr>
                                    {/* BỔ SUNG: Cột Stt */}
                                    <th scope="col" className="px-4 py-3 text-center">Stt</th>
                                    <th scope="col" className="px-4 py-3">Bậc ĐT</th>
                                    <th scope="col" className="px-4 py-3">Ngành nghề</th>
                                    <th scope="col" className="px-4 py-3 text-center">Chỉ tiêu</th>
                                    <th scope="col" className="px-4 py-3 text-center">NV1</th>
                                    <th scope="col" className="px-4 py-3 text-center">Tỷ lệ NV1</th>
                                    <th scope="col" className="px-4 py-3 text-center">Trúng tuyển</th>
                                    <th scope="col" className="px-4 py-3 text-center">Tỷ lệ TT</th>
                                    <th scope="col" className="px-4 py-3 text-center">Nhập học</th>
                                    <th scope="col" className="px-4 py-3 text-center">Tỷ lệ NH</th>
                                    <th scope="col" className="px-4 py-3 text-center">Phân lớp</th>
                                    <th scope="col" className="px-4 py-3 text-center">Tỷ lệ PL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedData.map((item, index) => (
                                    <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        {/* BỔ SUNG: Cột Stt */}
                                        <td className="px-4 py-2 text-center">{index + 1}</td>
                                        <td className="px-4 py-2">{item.BacDT}</td>
                                        <td className="px-4 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.Nganhhoc}</td>
                                        <td className="px-4 py-2 text-center font-bold text-blue-600 dark:text-blue-400">{item.Chitieu.toLocaleString('vi-VN')}</td>
                                        <td className="px-4 py-2 text-center font-bold text-orange-600 dark:text-orange-400">{item.NV1.toLocaleString('vi-VN')}</td>
                                        <td className="px-4 py-2 text-center font-normal text-orange-600 dark:text-orange-400">{item.TyLeNV1}%</td>
                                        <td className="px-4 py-2 text-center font-bold text-green-600 dark:text-green-400">{item.Sum_Trungtuyen.toLocaleString('vi-VN')}</td>
                                        <td className="px-4 py-2 text-center font-normal text-green-600 dark:text-green-400">{item.TyLeTT}%</td>
                                        <td className="px-4 py-2 text-center font-bold text-purple-600 dark:text-purple-400">{item.Sum_Nhaphoc.toLocaleString('vi-VN')}</td>
                                        <td className="px-4 py-2 text-center font-normal text-purple-600 dark:text-purple-400">{item.TyLeNH}%</td>
                                        <td className="px-4 py-2 text-center font-bold text-gray-700 dark:text-gray-300">{item.Sum_Phanlop.toLocaleString('vi-VN')}</td>
                                        <td className="px-4 py-2 text-center font-normal text-gray-700 dark:text-gray-300">{item.TyLePL}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
            )}
        </div>
    );
};

export default AdmissionStatsPage;
