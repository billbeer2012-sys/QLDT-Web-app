/*
* Đường dẫn file: D:\QLDT-app\client\src\pages\LogPage.jsx
* Phiên bản cập nhật: 24/09/2025
* Tóm tắt những nội dung cập nhật:
* - SỬA LỖI: Sửa lại logic trong hàm `handleFilter` và `useEffect` để
* đảm bảo `logSource` được truyền chính xác khi người dùng thay đổi
* nguồn log và nhấn nút "Xem".
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import { Loader, Calendar, Download, AlertCircle, Search, Server, Database } from 'lucide-react';
import moment from 'moment-timezone';

// --- HÀM HỖ TRỢ (Không thay đổi) ---
const exportToCsv = (filename, rows) => {
    if (!rows || !rows.length) { return; }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
        keys.join(separator) + '\n' +
        rows.map(row => {
            return keys.map(k => {
                let cell = row[k] === null || row[k] === undefined ? '' : row[k];
                cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
                if (cell.search(/("|,|\n)/g) >= 0) { cell = `"${cell}"`; }
                return cell;
            }).join(separator);
        }).join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
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

const LogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: moment().subtract(2, 'days').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [logSource, setLogSource] = useState('webapp');
    const initialFetchDone = useRef(false);

    const fetchLogs = useCallback(async (start, end, term, source) => {
        setLoading(true);
        setError('');
        try {
            const response = await axiosInstance.get('/log', {
                params: {
                    startDate: start,
                    endDate: end,
                    searchTerm: term,
                    logSource: source
                }
            });
            setLogs(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải dữ liệu log. Bạn có thể không có quyền truy cập.');
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, []);
    
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };
    
    // SỬA LỖI: handleFilter giờ sẽ gọi fetchLogs với các giá trị state hiện tại
    const handleFilter = () => {
        fetchLogs(dateRange.startDate, dateRange.endDate, searchTerm, logSource);
    }
    
    // SỬA LỖI: useEffect sẽ chỉ fetch dữ liệu ban đầu một lần
    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchLogs(dateRange.startDate, dateRange.endDate, '', 'webapp');
            initialFetchDone.current = true;
        }
    }, [fetchLogs, dateRange.startDate, dateRange.endDate]);
    
    const handleExport = () => {
        if(logs.length > 0) {
            toast.success("Đang xuất file CSV...");
            const sourceName = logSource === 'webapp' ? 'Log_Webapp' : 'Log_EdumanUNI';
            const filename = `${sourceName}_Tu_${dateRange.startDate}_Den_${dateRange.endDate}.csv`;
            exportToCsv(filename, logs);
        } else {
            toast.error("Không có dữ liệu để xuất.");
        }
    };
    
    // SỬA LỖI: Khi người dùng đổi nguồn log, cũng gọi lại API
    const handleSourceChange = (newSource) => {
        setLogSource(newSource);
        fetchLogs(dateRange.startDate, dateRange.endDate, searchTerm, newSource);
    }

    return (
        <div className="p-4 sm:p-6 h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center uppercase">
                {logSource === 'webapp' ? 'LOG WEBAPP' : 'LOG EDUMANUNI'}
            </h1>

            <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col items-center gap-4">
                <div className="flex items-center p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <button
                        onClick={() => handleSourceChange('webapp')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                            logSource === 'webapp' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow' : 'text-gray-600 dark:text-gray-300'
                        }`}
                    >
                        <Server className="w-5 h-5" />
                        Webapp
                    </button>
                    <button
                        onClick={() => handleSourceChange('eduman')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                            logSource === 'eduman' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow' : 'text-gray-600 dark:text-gray-300'
                        }`}
                    >
                        <Database className="w-5 h-5" />
                        EdumanUNI
                    </button>
                </div>

                <div className="w-full flex flex-col lg:flex-row items-center gap-4">
                     <div className="flex flex-wrap items-center justify-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <label htmlFor="startDate" className="font-medium text-sm">Từ ngày:</label>
                        </div>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateChange}
                            className="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <label htmlFor="endDate" className="font-medium text-sm">Đến ngày:</label>
                        </div>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={dateRange.endDate}
                            onChange={handleDateChange}
                            className="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    
                    <div className="flex-grow flex items-center gap-2 w-full lg:w-auto">
                        <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm trong log..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            className="p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 w-full text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-auto lg:w-max">
                         <button
                            onClick={handleFilter}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 w-full sm:w-auto"
                        >
                            <Search className="w-5 h-5" />
                            Xem
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={loading || logs.length === 0}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                            <Download className="w-5 h-5" />
                            Xuất
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-grow overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader className="w-10 h-10 animate-spin text-blue-600" />
                    </div>
                ) : error ? (
                     <div className="flex flex-col items-center justify-center h-full text-center p-10 text-red-600">
                        <AlertCircle className="w-12 h-12 mb-4" />
                        <p className="font-semibold">{error}</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed table-row-hover">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%]">Thời gian</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[10%]">Người dùng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%]">Cửa sổ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%]">Công việc</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[45%]">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {logs.map((log, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 break-words">{log.Thoigian}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white break-words">{log.MaUser}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 break-words">{log.Cuaso}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 break-words">{log.Congviec}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 break-words">{log.Ghichu}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                 { !loading && !error && logs.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p>Không có dữ liệu log cho các tiêu chí đã chọn.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogPage;
