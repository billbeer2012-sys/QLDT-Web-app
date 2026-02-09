/*
 * Đường dẫn file: D:\QLDT-app\client\src\pages\LichGiangDayPage.jsx
 * Thời gian cập nhật: 28/01/2026
 * Tóm tắt những nội dung cập nhật:
 * - KẾT HỢP: Hiển thị Lịch giảng dạy + Lịch coi thi
 * - Đổi tiêu đề thành "LỊCH GIẢNG DẠY - COI THI"
 * - Đổi tên cột: Ngày dạy -> Ngày, Tên lớp HP -> Lớp HP/Phòng thi, Phòng học -> Địa điểm
 * - "Đến ngày" mặc định = "Từ ngày" + 3 ngày
 * - Dòng lịch thi: Nền đỏ tươi, chữ trắng
 * - Cột "Đang dạy": Để trống với lịch thi
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

// Cập nhật: Đổi tên các cột
const columnConfig = [
  { key: 'NgayDay', label: 'Ngày' },
  { key: 'Buoi', label: 'Buổi' },
  { key: 'GiangVien', label: 'Giảng viên' },
  { key: 'TenLopHP', label: 'Lớp HP/Phòng thi' },
  { key: 'TenHocPhan', label: 'Tên học phần' },
  { key: 'SoGio', label: 'Số giờ' },
  { key: 'PhongHoc', label: 'Địa điểm' },
  { key: 'GhiChu', label: 'Ghi chú' },
  { key: 'DaDay', label: 'Đang dạy' },
  { key: 'DonVi', label: 'Đơn vị' },
];

const LichGiangDayPage = () => {
  usePageLogger('Lịch giảng dạy - coi thi');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cập nhật: denNgay mặc định = tuNgay + 3 ngày
  const today = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
  const [filters, setFilters] = useState({
    tuNgay: today,
    denNgay: moment().tz('Asia/Ho_Chi_Minh').add(3, 'days').format('YYYY-MM-DD'),
    searchTerm: '',
  });
  const [sorting, setSorting] = useState({
    sortBy: 'NgayDay',
    sortDirection: 'ASC',
  });

  const [columnVisibility, setColumnVisibility] = useState({
    NgayDay: true,
    Buoi: true,
    GiangVien: true,
    TenLopHP: true,
    TenHocPhan: true,
    SoGio: true,
    PhongHoc: true,
    GhiChu: true,
    DaDay: true,
    DonVi: false,
  });

  const [debouncedSearchTerm] = useDebounce(filters.searchTerm, 500);

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
      console.error('Lỗi khi tải lịch giảng dạy - coi thi:', error);
      toast.error(
        'Không thể tải dữ liệu. ' +
        (error.response?.data?.message || error.message)
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters.tuNgay, filters.denNgay, debouncedSearchTerm, sorting]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      // Tự động cập nhật denNgay khi thay đổi tuNgay
      if (name === 'tuNgay' && !prev.denNgayManuallySet) {
        newFilters.denNgay = moment(value).add(3, 'days').format('YYYY-MM-DD');
      }
      return newFilters;
    });
  };

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

  const handleColumnVisibilityChange = (key) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const visibleColumns =
    1 + Object.values(columnVisibility).filter(Boolean).length;

  const handleExportExcel = () => {
    try {
      const tuNgayFormatted = moment(filters.tuNgay).format('DD/MM/YYYY');
      const denNgayFormatted = moment(filters.denNgay).format('DD/MM/YYYY');
      const mainTitle = 'LỊCH GIẢNG DẠY - COI THI';
      const subTitle = `Từ ngày: ${tuNgayFormatted} Đến ngày: ${denNgayFormatted}`;

      const dataToExport = data.map((item, index) => {
        const row = { Stt: index + 1 };
        if (columnVisibility.NgayDay)
          row['Ngày'] = moment(item.NgayDay).format('DD/MM/YYYY');
        if (columnVisibility.Buoi) row['Buổi'] = item.Buoi;
        if (columnVisibility.GiangVien)
          row['Giảng viên'] = item.GiangVien;
        if (columnVisibility.TenLopHP)
          row['Lớp HP/Phòng thi'] = item.TenLopHP;
        if (columnVisibility.TenHocPhan)
          row['Tên học phần'] = item.TenHocPhan;
        if (columnVisibility.SoGio) row['Số giờ'] = item.SoGio;
        if (columnVisibility.PhongHoc)
          row['Địa điểm'] = item.PhongHoc;
        if (columnVisibility.GhiChu) row['Ghi chú'] = item.GhiChu;
        if (columnVisibility.DaDay)
          row['Đang dạy'] = item.isExam ? '' : `${item.daDayCumulative ?? 0}/${item.TongSoTietHP ?? '?'}`;
        if (columnVisibility.DonVi) row['Đơn vị'] = item.DonVi;
        return row;
      });

      const columnConfigExcel = {
        Stt: { align: 'center' },
        'Số giờ': { align: 'center' },
        'Ngày': { align: 'center' },
        Buổi: { align: 'center' },
        'Đang dạy': { align: 'center' },
      };

      exportToExcel({
        data: dataToExport,
        filename: 'LichGiangDay_CoiThi',
        mainTitle: mainTitle,
        subTitle: subTitle,
        columnConfig: columnConfigExcel,
      });

      toast.success('Xuất Excel thành công!');
    } catch (error) {
      console.error('Lỗi khi xuất Excel:', error);
      toast.error('Có lỗi xảy ra khi xuất file Excel.');
    }
  };

  return (
    <div className="p-4 bg-white h-full overflow-auto">
      {/* Cập nhật: Tiêu đề mới */}
      <h2 className="text-xl font-semibold mb-4 text-blue-800 text-center">
        LỊCH GIẢNG DẠY - COI THI
      </h2>

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

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full divide-y divide-gray-200 table-row-hover">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left text-xs font-semibold text-gray-600 uppercase w-12">
                Stt
              </th>
              {columnVisibility.NgayDay && (<SortableHeader columnKey="NgayDay" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Ngày </SortableHeader>)}
              {columnVisibility.Buoi && (<SortableHeader columnKey="Buoi" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Buổi </SortableHeader>)}
              {columnVisibility.GiangVien && (<SortableHeader columnKey="GiangVien" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Giảng viên </SortableHeader>)}
              {columnVisibility.TenLopHP && (<SortableHeader columnKey="TenLopHP" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Lớp HP/Phòng thi </SortableHeader>)}
              {columnVisibility.TenHocPhan && (<SortableHeader columnKey="TenHocPhan" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Tên học phần </SortableHeader>)}
              {columnVisibility.SoGio && (<SortableHeader columnKey="SoGio" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Số giờ </SortableHeader>)}
              {columnVisibility.PhongHoc && (<SortableHeader columnKey="PhongHoc" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Địa điểm </SortableHeader>)}
              {columnVisibility.GhiChu && (<SortableHeader columnKey="GhiChu" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Ghi chú </SortableHeader>)}
              {columnVisibility.DaDay && (
                <th className="p-2 text-center text-xs font-semibold text-gray-600 uppercase">
                  Đang dạy
                </th>
              )}
              {columnVisibility.DonVi && (<SortableHeader columnKey="DonVi" sorting={sorting} onSort={handleSort} className="text-left text-xs font-semibold text-gray-600 uppercase"> Đơn vị </SortableHeader>)}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr> <td colSpan={visibleColumns} className="p-4 text-center"> <Loader2 className="w-6 h-6 animate-spin inline-block" /> </td> </tr>
            ) : data.length === 0 ? (
              <tr> <td colSpan={visibleColumns} className="p-4 text-center text-gray-500"> Không tìm thấy dữ liệu. </td> </tr>
            ) : (
              data.map((item, index) => {
                // Lịch thi: isExam = 1
                const isExamRow = item.isExam === 1;

                // Logic kiểm tra tô nền cho lịch dạy (không áp dụng cho lịch thi)
                const tongSoTietHP = parseInt(item.TongSoTietHP, 10);
                const daDay = parseInt(item.daDayCumulative, 10);
                let highlight = false;

                if (!isExamRow && !isNaN(tongSoTietHP) && !isNaN(daDay)) {
                  const soTietConLai = tongSoTietHP - daDay;
                  if (soTietConLai <= 5 && soTietConLai >= 0) {
                    highlight = true;
                  }
                }

                // Cập nhật: Row class cho lịch thi (nền đỏ tươi, chữ trắng)
                const rowClassName = isExamRow
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'hover:bg-gray-50';

                return (
                  <tr key={`${item.MaLHP || item.MaPTX}-${index}-${item.NgayDay}-${item.SortTiet}`} className={rowClassName}>
                    <td className="p-2 text-sm text-center"> {index + 1} </td>
                    {columnVisibility.NgayDay && (<td className="p-2 text-sm whitespace-nowrap"> {moment(item.NgayDay).format('DD/MM/YYYY')} </td>)}
                    {columnVisibility.Buoi && (<td className="p-2 text-sm"> {item.Buoi} </td>)}

                    {/* Cột "Giảng viên" */}
                    {columnVisibility.GiangVien && (
                      <td className={`p-2 text-sm font-semibold whitespace-nowrap ${isExamRow ? '' : 'text-blue-600'}`}>
                        {item.GiangVien}
                      </td>
                    )}

                    {columnVisibility.TenLopHP && (<td className="p-2 text-sm"> {item.TenLopHP} </td>)}
                    {columnVisibility.TenHocPhan && (<td className="p-2 text-sm"> {item.TenHocPhan} </td>)}

                    {/* Cột "Số giờ" */}
                    {columnVisibility.SoGio && (
                      <td className="p-2 text-sm font-semibold text-center">
                        {item.SoGio}
                      </td>
                    )}

                    {columnVisibility.PhongHoc && (<td className="p-2 text-sm"> {item.PhongHoc} </td>)}
                    {columnVisibility.GhiChu && (<td className="p-2 text-sm"> {item.GhiChu} </td>)}

                    {/* Cột "Đang dạy" - để trống cho lịch thi */}
                    {columnVisibility.DaDay && (
                      <td className={`p-2 text-sm text-center ${!isExamRow && highlight ? 'bg-yellow-200 text-red-900' : ''}`}>
                        {isExamRow ? '' : `${item.daDayCumulative ?? 0}/${item.TongSoTietHP ?? '?'}`}
                      </td>
                    )}

                    {columnVisibility.DonVi && (<td className="p-2 text-sm"> {item.DonVi} </td>)}
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
