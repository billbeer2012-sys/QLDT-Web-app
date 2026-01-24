/*
 * Đường dẫn file: D:\QLDT-app\client\src\pages\LichGiangDayPage.jsx
 * Thời gian cập nhật: 27/10/2025
 * Tóm tắt những nội dung cập nhật:
 * - SỬA LỖI (Tính lũy kế 'Đã dạy'): (Giữ nguyên)
 * - TINH CHỈNH (Định dạng):
 * 1. Tiêu đề: Đổi thành "LỊCH GIẢNG DẠY" và căn giữa.
 * 2. Cột "Giảng viên": Thêm class 'text-blue-600' (chữ màu xanh).
 * 3. Cột "Số giờ": Thêm class 'font-semibold' (in đậm).
 * 4. Cột "Ghi chú": Cập nhật state 'columnVisibility'
 * để 'GhiChu' mặc định là 'true' (hiển thị).
 * 5. Cột "Đã dạy":
 * - Thêm class 'font-semibold' (in đậm).
 * - Thêm logic tô nền màu vàng ('bg-yellow-200') khi số tiết
 * còn lại <= 6.
 */

import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axios';
import moment from 'moment-timezone';
import { useDebounce } from 'use-debounce';
import { toast } from 'react-hot-toast';
import {
  Search,
  FileDown,
  Loader2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Columns,
  Settings2,
  X, 
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { exportToExcel } from '../lib/excelExporter';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
} from '../components/ui/dropdown-menu';
import { usePageLogger } from '../hooks/usePageLogger';

// (Component SortableHeader giữ nguyên)
const SortableHeader = ({
  children,
  columnKey,
  sorting,
  onSort,
  className = '',
}) => {
  const isSorted = sorting.sortBy === columnKey;
  const Icon = isSorted
    ? sorting.sortDirection === 'ASC'
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <th
      className={`p-2 cursor-pointer hover:bg-gray-100 ${className}`}
      onClick={() => onSort(columnKey)}
    >
      <div className="flex items-center justify-between">
        {children}
        <Icon className="w-4 h-4 ml-2" />
      </div>
    </th>
  );
};

// (columnConfig giữ nguyên)
const columnConfig = [
  { key: 'NgayDay', label: 'Ngày dạy' },
  { key: 'Buoi', label: 'Buổi' },
  { key: 'GiangVien', label: 'Giảng viên' },
  { key: 'TenLopHP', label: 'Tên lớp HP' },
  { key: 'TenHocPhan', label: 'Tên học phần' },
  { key: 'SoGio', label: 'Số giờ' },
  { key: 'PhongHoc', label: 'Phòng học' },
  { key: 'GhiChu', label: 'Ghi chú' },
  { key: 'DaDay', label: 'Đã dạy' }, 
  { key: 'DonVi', label: 'Đơn vị' },
];

// Component chính của trang
const LichGiangDayPage = () => {
  usePageLogger('Lịch giảng dạy');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    tuNgay: moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD'),
    denNgay: moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD'),
    searchTerm: '',
  });
  const [sorting, setSorting] = useState({
    sortBy: 'NgayDay',
    sortDirection: 'ASC',
  });

  // Bổ sung: Cập nhật state 'GhiChu'
  const [columnVisibility, setColumnVisibility] = useState({
    NgayDay: true,
    Buoi: true,
    GiangVien: true,
    TenLopHP: true,
    TenHocPhan: true,
    SoGio: true,
    PhongHoc: true,
    GhiChu: true, // Cập nhật: Mặc định hiển thị
    DaDay: true, 
    DonVi: false,
  });

  const [debouncedSearchTerm] = useDebounce(filters.searchTerm, 500);

  // (fetchData giữ nguyên)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...sorting,
        tuNgay: filters.tuNgay,
        denNgay: filters.denNgay,
        searchTerm: debouncedSearchTerm,
      };
      const response = await axiosInstance.get('/lich-giang-day', {
        params,
      });

      if (Array.isArray(response.data)) {
        setData(response.data); 
      } else {
        console.error('API trả về dữ liệu không phải mảng:', response.data);
        throw new Error(
          response.data?.message || 'Định dạng dữ liệu trả về không hợp lệ.'
        );
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch giảng dạy:', error);
      toast.error(
        'Không thể tải dữ liệu. ' +
          (error.response?.data?.message || error.message)
      );
      setData([]); 
    } finally {
      setLoading(false);
    }
  }, [filters.tuNgay, filters.denNgay, debouncedSearchTerm, sorting]);

  // (useEffect gọi fetchData giữ nguyên)
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // (handleFilterChange giữ nguyên)
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // (handleSort giữ nguyên)
  const handleSort = (columnKey) => {
    if (columnKey === 'DaDay') return; 
    
    setSorting((prev) => {
      const isAsc =
        prev.sortBy === columnKey && prev.sortDirection === 'ASC';
      return {
        sortBy: columnKey,
        sortDirection: isAsc ? 'DESC' : 'ASC',
      };
    });
  };

  // (handleColumnVisibilityChange giữ nguyên)
  const handleColumnVisibilityChange = (key) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // (visibleColumns giữ nguyên)
  const visibleColumns =
    1 + Object.values(columnVisibility).filter(Boolean).length;

  // (handleExportExcel giữ nguyên)
  const handleExportExcel = () => {
    try {
      const tuNgayFormatted = moment(filters.tuNgay).format('DD/MM/YYYY');
      const denNgayFormatted = moment(filters.denNgay).format(
        'DD/MM/YYYY'
      );
      const mainTitle = 'LỊCH GIẢNG DẠY';
      const subTitle = `Từ ngày: ${tuNgayFormatted} Đến ngày: ${denNgayFormatted}`;

      const dataToExport = data.map((item, index) => {
        const row = { Stt: index + 1 };
        if (columnVisibility.NgayDay)
          row['Ngày dạy'] = moment(item.NgayDay).format('DD/MM/YYYY');
        if (columnVisibility.Buoi) row['Buổi'] = item.Buoi;
        if (columnVisibility.GiangVien)
          row['Giảng viên'] = item.GiangVien;
        if (columnVisibility.TenLopHP)
          row['Tên lớp HP'] = item.TenLopHP;
        if (columnVisibility.TenHocPhan)
          row['Tên học phần'] = item.TenHocPhan;
        if (columnVisibility.SoGio) row['Số giờ'] = item.SoGio;
        if (columnVisibility.PhongHoc)
          row['Phòng học'] = item.PhongHoc;
        if (columnVisibility.GhiChu) row['Ghi chú'] = item.GhiChu;
        if (columnVisibility.DaDay)
          row['Đã dạy'] = `${item.daDayCumulative ?? 0}/${item.TongSoTietHP ?? '?'}`; 
        if (columnVisibility.DonVi) row['Đơn vị'] = item.DonVi;
        return row;
      });

      const columnConfig = {
        Stt: { align: 'center' },
        'Số giờ': { align: 'center' },
        'Ngày dạy': { align: 'center' },
        Buổi: { align: 'center' },
        'Đã dạy': { align: 'center' }, 
      };

      exportToExcel({
        data: dataToExport,
        filename: 'LichGiangDay',
        mainTitle: mainTitle,
        subTitle: subTitle,
        columnConfig: columnConfig,
      });

      toast.success('Xuất Excel thành công!');
    } catch (error) {
      console.error('Lỗi khi xuất Excel:', error);
      toast.error('Có lỗi xảy ra khi xuất file Excel.');
    }
  };

  // (Render UI)
  return (
    <div className="p-4 bg-white h-full overflow-auto">
      {/* Bổ sung: Cập nhật tiêu đề và căn giữa */}
      <h2 className="text-xl font-semibold mb-4 text-blue-800 text-center">
        LỊCH GIẢNG DẠY
      </h2>

      {/* (Thanh PageNavbar giữ nguyên) */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-4 border rounded-md bg-gray-50">
        <div className="flex flex-col">
          <label htmlFor="tuNgay" className="text-sm font-medium mb-1">
            Từ ngày
          </label>
          <Input
            type="date"
            id="tuNgay"
            name="tuNgay"
            value={filters.tuNgay}
            onChange={handleFilterChange}
            className="w-40"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="denNgay" className="text-sm font-medium mb-1">
            Đến ngày
          </label>
          <Input
            type="date"
            id="denNgay"
            name="denNgay"
            value={filters.denNgay}
            onChange={handleFilterChange}
            className="w-40"
          />
        </div>
        <div className="flex flex-col flex-grow min-w-[200px]">
          <label htmlFor="searchTerm" className="text-sm font-medium mb-1">
            Tìm kiếm
          </label>
          <div className="relative">
            <Input
              type="text"
              id="searchTerm"
              name="searchTerm"
              placeholder="Tìm giảng viên, lớp, học phần..."
              value={filters.searchTerm}
              onChange={handleFilterChange}
              className="pl-10 pr-10" 
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            {filters.searchTerm && (
              <button
                onClick={() =>
                  handleFilterChange({
                    target: { name: 'searchTerm', value: '' },
                  })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-900 focus:outline-none"
                aria-label="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-end h-full">
          <Button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 mt-6"
            disabled={loading || data.length === 0}
          >
            <FileDown className="h-6 w-6 flex items-center justify-center bg-green-600 text-white hover:bg-green-700 dark:bg-gray-600 rounded-md  dark:hover:bg-gray-500" />            
          </Button>
        </div>
        <div className="flex flex-col justify-end h-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-gray-300 hover:bg-gray-100 border-gray-300 text-gray-700 mt-6"
              >
                <Settings2 className="h-6 w-6 flex items-center justify-center bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500" />                
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                {columnConfig.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.key}
                    className="capitalize"
                    checked={columnVisibility[column.key]}
                    onCheckedChange={() =>
                      handleColumnVisibilityChange(column.key)
                    }
                    onSelect={(e) => e.preventDefault()}
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* (Bảng dữ liệu) */}
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full divide-y divide-gray-200 table-row-hover">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left text-xs font-semibold text-gray-600 uppercase w-12">
                Stt
              </th>
              {columnVisibility.NgayDay && ( <SortableHeader columnKey="NgayDay" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Ngày dạy </SortableHeader> )}
              {columnVisibility.Buoi && ( <SortableHeader columnKey="Buoi" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Buổi </SortableHeader> )}
              {columnVisibility.GiangVien && ( <SortableHeader columnKey="GiangVien" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Giảng viên </SortableHeader> )}
              {columnVisibility.TenLopHP && ( <SortableHeader columnKey="TenLopHP" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Tên lớp HP </SortableHeader> )}
              {columnVisibility.TenHocPhan && ( <SortableHeader columnKey="TenHocPhan" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Tên học phần </SortableHeader> )}
              {columnVisibility.SoGio && ( <SortableHeader columnKey="SoGio" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Số giờ </SortableHeader> )}
              {columnVisibility.PhongHoc && ( <SortableHeader columnKey="PhongHoc" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Phòng học </SortableHeader> )}
              {columnVisibility.GhiChu && ( <SortableHeader columnKey="GhiChu" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Ghi chú </SortableHeader> )}
              {columnVisibility.DaDay && (
                <th className="p-2 text-center text-xs font-semibold text-gray-600 uppercase">
                  Đang dạy
                </th>
              )}
              {columnVisibility.DonVi && ( <SortableHeader columnKey="DonVi" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Đơn vị </SortableHeader> )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr> <td colSpan={visibleColumns} className="p-4 text-center"> <Loader2 className="w-6 h-6 animate-spin inline-block" /> </td> </tr>
            ) : data.length === 0 ? (
              <tr> <td colSpan={visibleColumns} className="p-4 text-center text-gray-500"> Không tìm thấy dữ liệu. </td> </tr>
            ) : (
              data.map((item, index) => {
                
                // Bổ sung: Logic kiểm tra tô nền
                const tongSoTietHP = parseInt(item.TongSoTietHP, 10);
                const daDay = parseInt(item.daDayCumulative, 10);
                let highlight = false;
                
                if (!isNaN(tongSoTietHP) && !isNaN(daDay)) {
                  const soTietConLai = tongSoTietHP - daDay;
                  if (soTietConLai <= 5 && soTietConLai >= 0) {
                    highlight = true;
                  }
                }

                return (
                  <tr key={`${item.MaLHP}-${index}-${item.NgayDay}-${item.Tiet}`} className="hover:bg-gray-50"> 
                    <td className="p-2 text-sm text-gray-700 text-center"> {index + 1} </td>
                    {columnVisibility.NgayDay && ( <td className="p-2 text-sm text-gray-700 whitespace-nowrap"> {moment(item.NgayDay).format('DD/MM/YYYY')} </td> )}
                    {columnVisibility.Buoi && ( <td className="p-2 text-sm text-gray-700"> {item.Buoi} </td> )}
                    
                    {/* Bổ sung: Cập nhật Cột "Giảng viên" (màu xanh) */}
                    {columnVisibility.GiangVien && ( 
                      <td className="p-2 text-sm text-blue-600 font-semibold whitespace-nowrap"> 
                        {item.GiangVien} 
                      </td> 
                    )}
                    
                    {columnVisibility.TenLopHP && ( <td className="p-2 text-sm text-gray-700"> {item.TenLopHP} </td> )}
                    {columnVisibility.TenHocPhan && ( <td className="p-2 text-sm text-gray-700"> {item.TenHocPhan} </td> )}
                    
                    {/* Bổ sung: Cập nhật Cột "Số giờ" (in đậm) */}
                    {columnVisibility.SoGio && ( 
                      <td className="p-2 text-sm text-gray-900 font-semibold text-center"> 
                        {item.SoGio} 
                      </td> 
                    )}
                    
                    {columnVisibility.PhongHoc && ( <td className="p-2 text-sm text-gray-700"> {item.PhongHoc} </td> )}
                    {columnVisibility.GhiChu && ( <td className="p-2 text-sm text-gray-700"> {item.GhiChu} </td> )}
                    
                    {/* Bổ sung: Cập nhật Cột "Đã dạy" (tô nền) */}
                    {columnVisibility.DaDay && (
                      <td className={`p-2 text-sm text-center ${highlight ? 'bg-yellow-200 text-red-900' : 'text-gray-900'}`}>
                        {`${item.daDayCumulative ?? 0}/${item.TongSoTietHP ?? '?'}`}
                      </td>
                    )}
                    
                    {columnVisibility.DonVi && ( <td className="p-2 text-sm text-gray-700"> {item.DonVi} </td> )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LichGiangDayPage;

