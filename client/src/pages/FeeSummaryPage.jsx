/*
 * D:/QLDT-app/client/src/pages/FeeSummaryPage.jsx
 * Cập nhật: 25/10/2025
 * Tóm tắt: Bổ sung log khi mở trang
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import * as Tabs from '@radix-ui/react-tabs';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import moment from 'moment-timezone';
import { Loader, AlertCircle, Search, FileDown, ArrowUp, ArrowDown, Filter, Check, ChevronsUpDown, Settings2, Eye } from 'lucide-react';
import PaginationControls from '../components/ui/PaginationControls';
import { exportToExcel } from '../lib/excelExporter';
import { cn } from '../lib/utils';
//Bước 1: Bổ sung Import hook
import { usePageLogger } from '../hooks/usePageLogger';

// Cấu hình cột cho Tab 1
const ALL_COLUMNS_TAB1 = [
    { key: 'KhoanThu', label: 'Khoản thu', defaultVisible: true, sortable: true },
    { key: 'NgayThu', label: 'Ngày thu', defaultVisible: true, sortable: true },
    { key: 'SoPhieu', label: 'Số phiếu', defaultVisible: true, sortable: false },
    { key: 'SoTienThu', label: 'Số tiền thu', defaultVisible: true, sortable: false },
    { key: 'LyDoThu', label: 'Lý do thu', defaultVisible: true, sortable: false },
    { key: 'HinhThucThu', label: 'Hình thức thu', defaultVisible: false, sortable: false },
    { key: 'NguoiNop', label: 'Người nộp', defaultVisible: true, sortable: true },
    { key: 'MaSo', label: 'Mã số', defaultVisible: false, sortable: false },
    { key: 'MaTuyensinh', label: 'Mã TS', defaultVisible: false, sortable: false },
	{ key: 'NgaySinh', label: 'Ngày sinh', defaultVisible: false, sortable: false },
    { key: 'TenLop', label: 'Tên lớp', defaultVisible: true, sortable: true },
    { key: 'NguoiThu', label: 'Người thu', defaultVisible: false, sortable: false },
    { key: 'HocKy', label: 'Học kỳ', defaultVisible: true, sortable: true },
    { key: 'GhiChu', label: 'Ghi chú', defaultVisible: false, sortable: false }
];

// Cấu hình cột cho Tab 2
const ALL_COLUMNS_TAB2 = [
    { key: 'KhoanThu', label: 'Khoản thu', defaultVisible: true, sortable: true },
    { key: 'NgayThu', label: 'Ngày thu', defaultVisible: true, sortable: true },
    { key: 'SoPhieu', label: 'Số phiếu', defaultVisible: true, sortable: false },
    { key: 'SoTienThu', label: 'Số tiền thu', defaultVisible: true, sortable: false },
    { key: 'LyDoThu', label: 'Lý do thu', defaultVisible: true, sortable: false },
    { key: 'HinhThucThu', label: 'Hình thức thu', defaultVisible: true, sortable: false },
    { key: 'NguoiNop', label: 'Người nộp', defaultVisible: true, sortable: true },
    { key: 'MaSo', label: 'Mã số', defaultVisible: false, sortable: false },
    { key: 'MaTuyensinh', label: 'Mã TS', defaultVisible: false, sortable: false },
    { key: 'NgaySinh', label: 'Ngày sinh', defaultVisible: false, sortable: false },
    { key: 'TenLop', label: 'Tên lớp', defaultVisible: true, sortable: true },
    { key: 'NguoiThu', label: 'Người thu', defaultVisible: false, sortable: false },
    { key: 'GhiChu', label: 'Ghi chú', defaultVisible: false, sortable: false }
];

// Hook debounce để tối ưu việc tìm kiếm
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, 500);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
}

// Hàm tạo màu chữ khác nhau
const colorPalette = ['text-sky-700', 'text-emerald-700', 'text-red-700', 'text-purple-700', 'text-amber-700', 'text-indigo-700', 'text-pink-700', 'text-teal-700', 'dark:text-sky-400', 'dark:text-emerald-400', 'dark:text-red-400', 'dark:text-purple-400', 'dark:text-amber-400', 'dark:text-indigo-400', 'dark:text-pink-400', 'dark:text-teal-400'];
const colorMap = new Map();
const getColorForString = (str) => {
    if (!str) return 'text-gray-800 dark:text-gray-200';
    if (colorMap.has(str)) return colorMap.get(str);
    let hash = 0;
    for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); }
    const color = colorPalette[Math.abs(hash % colorPalette.length)];
    colorMap.set(str, color);
    return color;
};

// Component thanh điều khiển (tái sử dụng cho cả 2 tab)
const PageNavbar = ({ dateRange, onDateChange, feeTypes, selectedFeeTypes, onFeeTypeChange, searchTerm, onSearchChange, onExport, loading, visibleColumns, onVisibilityChange, allColumnsConfig }) => {
    const allFeeTypesSelected = feeTypes.length > 0 && selectedFeeTypes.length === feeTypes.length;
    const handleSelectAll = () => { onFeeTypeChange(allFeeTypesSelected ? [] : feeTypes.map(ft => ft.MaKT)); };

    return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md mb-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                <label htmlFor="startDate" className="text-sm font-medium">Từ ngày:</label>
                <input type="date" id="startDate" value={dateRange.start} onChange={(e) => onDateChange('start', e.target.value)} className="p-2 border rounded-md dark:bg-gray-700 bg-white text-sm"/>
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="endDate" className="text-sm font-medium">Đến ngày:</label>
                <input type="date" id="endDate" value={dateRange.end} onChange={(e) => onDateChange('end', e.target.value)} className="p-2 border rounded-md dark:bg-gray-700 bg-white text-sm"/>
            </div>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-md flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
                        <Filter className="w-4 h-4" /> Khoản thu ({selectedFeeTypes.length}) <ChevronsUpDown className="w-4 h-4" />
                    </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                    <DropdownMenu.Content align="start" className="bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border dark:border-gray-700 w-64 max-h-96 overflow-y-auto z-30">
                        <DropdownMenu.CheckboxItem checked={allFeeTypesSelected} onCheckedChange={handleSelectAll} onSelect={(e) => e.preventDefault()} className="px-3 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-700 cursor-pointer flex items-center gap-2 focus:outline-none font-semibold">
                            <DropdownMenu.ItemIndicator><Check className="w-4 h-4 text-blue-600" /></DropdownMenu.ItemIndicator>
                            <span className="ml-6">Chọn tất cả</span>
                        </DropdownMenu.CheckboxItem>
                        <DropdownMenu.Separator className="h-[1px] bg-gray-200 dark:bg-gray-700 m-1" />
                        {feeTypes.map(ft => (
                            <DropdownMenu.CheckboxItem key={ft.MaKT} checked={selectedFeeTypes.includes(ft.MaKT)} onCheckedChange={() => onFeeTypeChange(ft.MaKT)} onSelect={(e) => e.preventDefault()} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 focus:outline-none text-sm">
                                <DropdownMenu.ItemIndicator><Check className="w-4 h-4 text-blue-600" /></DropdownMenu.ItemIndicator>
                                <span className="ml-6">{ft.Khoanthu}</span>
                            </DropdownMenu.CheckboxItem>
                        ))}
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
            <div className="relative flex-grow min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Tìm kiếm theo mã số, họ tên..." value={searchTerm} onChange={onSearchChange} className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 text-sm"/>
            </div>
            <div className="flex items-center gap-4 ml-auto">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2 hover:bg-green-700 transition-colors text-sm disabled:opacity-50">
                            <FileDown className="w-4 h-4" /> Xuất file <ChevronsUpDown className="w-4 h-4" />
                        </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content align="end" className="bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border dark:border-gray-700 w-48 z-30">
                            <DropdownMenu.Item onSelect={() => onExport('excel')} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 text-sm">Xuất Excel (.xlsx)</DropdownMenu.Item>
                            <DropdownMenu.Item onSelect={() => onExport('csv')} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 text-sm">Xuất CSV (.csv)</DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm">
                            <Settings2 className="w-4 h-4" /> Tùy chọn
                        </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content align="end" className="bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border dark:border-gray-700 w-64 max-h-96 overflow-y-auto z-30">
                             <DropdownMenu.Label className="px-3 py-2 font-semibold text-sm">Hiển thị cột</DropdownMenu.Label>
                             {allColumnsConfig.map(col => (
                                <DropdownMenu.CheckboxItem key={col.key} checked={visibleColumns[col.key]} onCheckedChange={() => onVisibilityChange(col.key)} onSelect={(e) => e.preventDefault()} className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 focus:outline-none text-sm">
                                    <DropdownMenu.ItemIndicator><Eye className="w-4 h-4 text-blue-600" /></DropdownMenu.ItemIndicator>
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

// Component chung cho nội dung Tab
const FeeTabContent = ({ tabName, logAction, apiEndpoints, allColumnsConfig, defaultSort }) => {
    const [data, setData] = useState([]);
    const [stats, setStats] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState({ start: moment().subtract(7, 'days').format('YYYY-MM-DD'), end: moment().format('YYYY-MM-DD') });
    const [selectedFeeTypes, setSelectedFeeTypes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [pageSize, setPageSize] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [sortConfig, setSortConfig] = useState(defaultSort);
    const [visibleColumns, setVisibleColumns] = useState(allColumnsConfig.reduce((acc, col) => ({ ...acc, [col.key]: col.defaultVisible }), {}));
    
    const handleVisibilityChange = (key) => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
    const visibleColumnsList = useMemo(() => allColumnsConfig.filter(col => visibleColumns[col.key]), [visibleColumns, allColumnsConfig]);

    useEffect(() => {
        axiosInstance.get(apiEndpoints.feeTypes).then(res => {
            setFeeTypes(res.data);
            setSelectedFeeTypes(res.data.map(ft => ft.MaKT));
        }).catch(() => toast.error(`Lỗi khi tải danh sách khoản thu.`));
    }, [apiEndpoints.feeTypes]);

    const fetchData = useCallback((page = 1) => {
        if (selectedFeeTypes.length === 0) {
            setData([]); setStats([]); setTotalRecords(0); return;
        }
        setLoading(true); setError('');
        const params = { startDate: dateRange.start, endDate: dateRange.end, feeTypeIds: selectedFeeTypes.join(','), searchTerm: debouncedSearchTerm, page, pageSize, sortKey: sortConfig.key, sortDirection: sortConfig.direction };
        const dataPromise = axiosInstance.get(apiEndpoints.data, { params });
        const statsPromise = axiosInstance.get(apiEndpoints.stats, { params: { startDate: dateRange.start, endDate: dateRange.end, feeTypeIds: selectedFeeTypes.join(',') } });
        
        Promise.all([dataPromise, statsPromise]).then(([dataRes, statsRes]) => {
            setData(dataRes.data.data);
            setTotalRecords(dataRes.data.total);
            setStats(statsRes.data);
            setCurrentPage(page);
        }).catch(err => setError(err.response?.data?.message || "Lỗi khi tải dữ liệu.")).finally(() => setLoading(false));
    // SỬA LỖI: Loại bỏ fetchData khỏi dependency array để tránh vòng lặp
    }, [dateRange, selectedFeeTypes, debouncedSearchTerm, pageSize, sortConfig, apiEndpoints]);

    useEffect(() => {
        // Chỉ gọi fetchData khi các dependency thực sự thay đổi
        if (feeTypes.length > 0) {
            fetchData(1);
        }
    // SỬA LỖI: Cập nhật dependency array
    }, [dateRange, selectedFeeTypes, debouncedSearchTerm, pageSize, sortConfig, feeTypes]);


    const handleDateChange = (key, value) => setDateRange(prev => ({ ...prev, [key]: value }));
    const handleFeeTypeChange = (maKT) => setSelectedFeeTypes(prev => Array.isArray(maKT) ? maKT : (prev.includes(maKT) ? prev.filter(id => id !== maKT) : [...prev, maKT]));
    const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

    const handleExport = async (format) => {
        const toastId = toast.loading(`Đang chuẩn bị file ${format.toUpperCase()}...`);
        try {
            const params = { startDate: dateRange.start, endDate: dateRange.end, feeTypeIds: selectedFeeTypes.join(','), searchTerm: debouncedSearchTerm, sortKey: sortConfig.key, sortDirection: sortConfig.direction };
            const res = await axiosInstance.get(apiEndpoints.export, { params });
            if (res.data.length === 0) { toast.error("Không có dữ liệu để xuất.", { id: toastId }); return; }
            const dataToExport = res.data.map((row, index) => {
                const rowData = { 'STT': index + 1 };
                visibleColumnsList.forEach(col => {
                    let value = row[col.key];
                    if ((col.key === 'NgayThu' || col.key === 'NgaySinh') && value) {
                        value = moment(value).format('DD/MM/YYYY');
                    }
                    rowData[col.label] = value;
                });
                return rowData;
            });
            const filename = `TongHopKhoanThu_${moment().format('DDMMYYYY_HHmmss')}`;
            if (format === 'excel') {
                const colBHeader = visibleColumnsList[0]?.label || 'Khoản thu';
                const colCHeader = visibleColumnsList[1]?.label || 'Ngày thu';
                const statsRows = [
                    {}, { [colBHeader]: 'THỐNG KÊ TỔNG HỢP' },
                    { [colBHeader]: `Thời gian thu: Từ ${moment(dateRange.start).format('DD/MM/YYYY')} đến ${moment(dateRange.end).format('DD/MM/YYYY')}` },
                    { [colBHeader]: `Số lần thu:`, [colCHeader]: totalRecords },
                    { [colBHeader]: `Tổng số tiền thu:`, [colCHeader]: stats.reduce((sum, item) => sum + Number(item.TongTien), 0) },
                    ...stats.map(item => ({ [colBHeader]: `- ${item.Khoanthu}:`, [colCHeader]: item.TongTien })),
                    {}, { [colBHeader]: 'Ghi chú:'},
                    { [colBHeader]: '- Số liệu thống kê được tính trên toàn bộ dữ liệu lọc, không bị ảnh hưởng bởi phân trang.'},
                    { [colBHeader]: debouncedSearchTerm ? '- Số liệu có áp dụng điều kiện từ ô tìm kiếm.' : '- Số liệu không áp dụng điều kiện từ ô tìm kiếm.'}
                ];
                exportToExcel({ data: [...dataToExport, ...statsRows], filename, mainTitle: `DANH SÁCH THU: ${selectedFeeTypes.length === feeTypes.length ? 'Tất cả' : `${selectedFeeTypes.length} khoản thu`}`, subTitle: `Từ ngày: ${moment(dateRange.start).format('DD/MM/YYYY')} - đến ngày: ${moment(dateRange.end).format('DD/MM/YYYY')}`, columnConfig: { 'Số tiền thu': { align: 'right', format: '#,##0' }, [colCHeader]: { align: 'right', format: '#,##0' } } });
            } else if (format === 'csv') {
                const headers = ['STT', ...visibleColumnsList.map(c => c.label)];
                const csvContent = [headers.join(','), ...dataToExport.map(row => headers.map(header => `"${String(row[header] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
                const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url); link.setAttribute("download", `${filename}.csv`);
                document.body.appendChild(link); link.click(); document.body.removeChild(link);
            }
            toast.success("Xuất file thành công!", { id: toastId });
            const allSelected = selectedFeeTypes.length === feeTypes.length;
            const selectedFeeNames = allSelected ? "Tất cả" : feeTypes.filter(ft => selectedFeeTypes.includes(ft.MaKT)).map(ft => ft.Khoanthu).join(', ');
            const ghiChuLog = `Từ ngày: ${moment(dateRange.start).format('DD/MM/YYYY')} Đến ngày: ${moment(dateRange.end).format('DD/MM/YYYY')}. Khoản thu: ${selectedFeeNames}`;
            logAction(format === 'excel' ? 'Xuất Excel' : 'Xuất CSV', ghiChuLog, tabName);

        } catch (err) { toast.error("Lỗi khi xuất file.", { id: toastId }); }
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <PageNavbar dateRange={dateRange} onDateChange={handleDateChange} feeTypes={feeTypes} selectedFeeTypes={selectedFeeTypes} onFeeTypeChange={handleFeeTypeChange} searchTerm={searchTerm} onSearchChange={e => setSearchTerm(e.target.value)} onExport={handleExport} loading={loading} visibleColumns={visibleColumns} onVisibilityChange={handleVisibilityChange} allColumnsConfig={allColumnsConfig}/>
            <div className="flex flex-wrap justify-between items-center mb-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Hiển thị {data.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, totalRecords)} trên tổng số <strong>{totalRecords}</strong> bản ghi</span>
                <div className="flex items-center gap-2">
                    <label htmlFor="pageSizeSelect">Số dòng/trang:</label>
                    <select id="pageSizeSelect" value={pageSize} onChange={e => setPageSize(Number(e.target.value))} className="p-1 border rounded-md dark:bg-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value={15}>15</option><option value={30}>30</option><option value={50}>50</option>
                    </select>
                </div>
            </div>
            <div className="flex-grow overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                {loading ? <div className="flex items-center justify-center h-full"><Loader className="w-10 h-10 animate-spin text-blue-600" /></div> :
                 error ? <div className="flex flex-col items-center justify-center h-full text-center p-10 text-red-600"><AlertCircle className="w-12 h-12 mb-4" /><p className="font-semibold">{error}</p></div> :
                 (<>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-200 dark:bg-gray-700 font-bold sticky top-0 z-10">
                            <tr>
                                <th className="px-2 py-3 text-center text-xs uppercase w-12">STT</th>
                                {visibleColumnsList.map(col => (
                                    <th key={col.key} className="px-4 py-3 text-left text-xs uppercase tracking-wider">
                                        {(!col.sortable) ? <span>{col.label}</span> : (<button onClick={() => handleSort(col.key)} className="flex items-center gap-1 hover:text-blue-600"><span>{col.label}</span>{sortConfig.key === col.key && (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</button>)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {data.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-2 py-3 text-center text-sm">{(currentPage - 1) * pageSize + index + 1}</td>
                                    {visibleColumnsList.map(col => {
                                        let cellValue = row[col.key];
                                        if ((col.key === 'NgayThu' || col.key === 'NgaySinh') && cellValue) {
                                            cellValue = moment(cellValue).format('DD/MM/YYYY');
                                        } else if (col.key === 'SoTienThu' && typeof cellValue === 'number') {
                                            cellValue = cellValue.toLocaleString('vi-VN');
                                        }
                                        return (<td key={col.key} className={cn("px-4 py-3 text-sm whitespace-nowrap", col.key === 'KhoanThu' && `font-semibold ${getColorForString(row.KhoanThu)}`, col.key === 'SoTienThu' && 'text-right')}>{cellValue}</td>)
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && !error && data.length === 0 && <div className="text-center py-10 text-gray-500"><p>Không có dữ liệu phù hợp.</p></div>}
                 </>)}
            </div>
            <PaginationControls currentPage={currentPage} totalPages={Math.ceil(totalRecords / pageSize)} onPageChange={(page) => fetchData(page)} />
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-sm">
                <h4 className="font-bold text-base mb-2">Thống kê</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div><strong>Thời gian thu:</strong> {moment(dateRange.start).format('DD/MM/YYYY')} - {moment(dateRange.end).format('DD/MM/YYYY')}</div>
                    <div><strong>Ghi chú:</strong> {debouncedSearchTerm ? 'Đã áp dụng bộ lọc tìm kiếm.' : 'Không áp dụng bộ lọc tìm kiếm.'}</div>
                    <div><strong>Tổng số lần thu:</strong> {totalRecords.toLocaleString('vi-VN')}</div>
                    <div className="font-bold text-base"><strong>Tổng số tiền thu:</strong> {(stats.reduce((sum, item) => sum + Number(item.TongTien), 0)).toLocaleString('vi-VN')} đ</div>
                </div>
                <div className="border-t dark:border-gray-700 mt-4 pt-4">
                    <h5 className="font-semibold mb-2">Chi tiết theo khoản thu:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                        {stats.map(item => (<div key={item.Khoanthu}><strong>- {item.Khoanthu}:</strong> {(Number(item.TongTien)).toLocaleString('vi-VN')} đ ({item.SoLanThu} lần)</div>))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Component trang chính
const FeeSummaryPage = () => {
    //Bước 2: Gọi ghi log
	// Tên '...' sẽ được ghi vào cột 'Cuaso'
	usePageLogger('Tổng hợp khoản thu');

	const logAction = useCallback(async (congViec, ghiChu, cuaSo = 'Tổng hợp khoản thu') => {
        try {
            await axiosInstance.post('/log-action', { Cuaso: cuaSo, Congviec: congViec, Ghichu: ghiChu });
        } catch (error) { console.error('Failed to log action:', error); }
    }, []);

    useEffect(() => {
        logAction('Mở trang', 'Thành công');
    }, [logAction]);

    return (
        <div className="h-full">
            <Tabs.Root defaultValue="tab1" className="flex flex-col h-full">
                <Tabs.List className="flex-shrink-0 border-b border-gray-300 dark:border-gray-700">
                    <Tabs.Trigger value="tab1" className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600">Học phí, lệ phí thi</Tabs.Trigger>
                    <Tabs.Trigger value="tab2" className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600">Khoản thu khác</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="tab1" className="flex-grow overflow-y-auto focus:outline-none">
                    <FeeTabContent tabName="Tab-Thu học phí, lệ phí thi" logAction={logAction} apiEndpoints={{ feeTypes: '/fee-summary/fee-types', data: '/fee-summary', stats: '/fee-summary/stats', export: '/fee-summary/export' }} allColumnsConfig={ALL_COLUMNS_TAB1} defaultSort={{ key: 'NgayThu', direction: 'desc' }}/>
                </Tabs.Content>
                <Tabs.Content value="tab2" className="flex-grow overflow-y-auto focus:outline-none">
                     <FeeTabContent tabName="Tab-Khoản thu khác" logAction={logAction} apiEndpoints={{ feeTypes: '/fee-summary/other-fee-types', data: '/fee-summary/other-fees', stats: '/fee-summary/other-stats', export: '/fee-summary/other-export' }} allColumnsConfig={ALL_COLUMNS_TAB2} defaultSort={{ key: 'NgayThu', direction: 'desc' }}/>
                </Tabs.Content>
            </Tabs.Root>
        </div>
    );
};

export default FeeSummaryPage;

