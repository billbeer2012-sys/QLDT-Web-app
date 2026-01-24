/*
 * Đường dẫn file: D:\QLDT-app\client\src\pages\DanhMucLopHocPage.jsx
 * Cập nhật: 25/10/2025
 * Tóm tắt: Bổ sung log khi mở trang
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Edit, Save, X, Loader2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { fetchKhoaHocList, fetchLopHocList, fetchDataSources, updateLopHocList } from '../api/danhmuc-lophoc';
import _ from 'lodash';
//Bước 1: Bổ sung Import hook
import { usePageLogger } from '../hooks/usePageLogger';


const baseButtonStyles = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
const primaryButtonStyles = "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
const secondaryButtonStyles = "text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-gray-500";
const inputStyles = "w-full text-left px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600";
const selectStyles = "w-full px-2 py-1 border border-gray-300 rounded-md disabled:bg-gray-100 dark:disabled:bg-gray-700 dark:bg-gray-700 dark:border-gray-600";

const DanhMucLopHocPage = () => {
    //Bước 2: Gọi ghi log
	// Tên '...' sẽ được ghi vào cột 'Cuaso'
	usePageLogger('DM lớp SH');

	const [khoaHocList, setKhoaHocList] = useState([]);
    const [selectedKhoaHoc, setSelectedKhoaHoc] = useState('');
    const [lopHocList, setLopHocList] = useState([]);
    const [originalLopHocList, setOriginalLopHocList] = useState([]);
    const [dataSources, setDataSources] = useState({ giaoVien: [], nganhHoc: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const user = useAuthStore(state => state.user);

    const canEdit = useMemo(() => user?.isAdmin || (user?.isXepTKB && user?.isKhaothi), [user]);

    const loadInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [khoaHocRes, dataSourcesRes] = await Promise.all([fetchKhoaHocList(), fetchDataSources()]);
            setKhoaHocList(khoaHocRes);
            setDataSources(dataSourcesRes);
            if (khoaHocRes.length > 0) {
                setSelectedKhoaHoc(khoaHocRes[0].MaKH);
            }
        } catch (error) {
            toast.error("Lỗi khi tải dữ liệu khởi tạo.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    useEffect(() => {
        const loadLopHoc = async () => {
            if (selectedKhoaHoc) {
                setIsLoading(true);
                try {
                    const data = await fetchLopHocList(selectedKhoaHoc);
                    setLopHocList(data);
                    setOriginalLopHocList(_.cloneDeep(data));
                } catch (error) {
                    toast.error("Lỗi khi tải danh sách lớp học.");
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadLopHoc();
    }, [selectedKhoaHoc]);

    const handleRowChange = (mal, field, value) => {
        const newList = lopHocList.map(lop => {
            if (lop.MaL === mal) {
                return { ...lop, [field]: value };
            }
            return lop;
        });
        setLopHocList(newList);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setLopHocList(_.cloneDeep(originalLopHocList));
        setIsEditing(false);
    };

    const handleSaveClick = async () => {
        setIsSaving(true);
        const updatedLops = lopHocList.filter((lop, index) => {
            return !_.isEqual(lop, originalLopHocList[index]);
        });
        
        if (updatedLops.length === 0) {
            toast.success("Không có thay đổi nào để lưu.");
            setIsEditing(false);
            setIsSaving(false);
            return;
        }

        try {
            const response = await updateLopHocList(updatedLops);
            toast.success(response.message);
            setOriginalLopHocList(_.cloneDeep(lopHocList));
            setIsEditing(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Lưu thất bại.");
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="p-4 h-full flex flex-col">
            <h1 className="text-2xl font-semibold mb-4 text-blue-800 dark:text-white text-center uppercase">DANH MỤC LỚP SINH HOẠT</h1>
            
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    <label htmlFor="khoa-hoc-select" className="text-sm font-medium">Khóa đào tạo:</label>
                    <select id="khoa-hoc-select" value={selectedKhoaHoc} onChange={e => setSelectedKhoaHoc(e.target.value)} className={selectStyles}>
                        {khoaHocList.map(kh => <option key={kh.MaKH} value={kh.MaKH}>{kh.Khoahoc}</option>)}
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    {canEdit && !isEditing && (
                        <button onClick={handleEditClick} className={`${baseButtonStyles} ${primaryButtonStyles}`}><Edit className="mr-2 h-4 w-4" />Chỉnh sửa</button>
                    )}
                    {canEdit && isEditing && (
                        <>
                            <button onClick={handleSaveClick} disabled={isSaving} className={`${baseButtonStyles} ${primaryButtonStyles}`}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Lưu thay đổi
                            </button>
                            <button onClick={handleCancelClick} disabled={isSaving} className={`${baseButtonStyles} ${secondaryButtonStyles}`}><X className="mr-2 h-4 w-4" />Hủy bỏ</button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-grow overflow-auto">
                 {isLoading ? <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div> : (
                    <table className="min-w-full bg-white border">
                        <thead className="sticky top-0 bg-gray-200 z-10">
                            <tr>
                                <th className="py-2 px-2 border w-12">STT</th>
                                <th className="py-2 px-2 border w-24">ID</th>
                                <th className="py-2 px-2 border text-left">Tên lớp</th>
                                <th className="py-2 px-2 border w-32">SL đầu vào</th>
                                <th className="py-2 px-2 border text-left w-64">Cố vấn học tập</th>
                                <th className="py-2 px-2 border text-left w-64">Ngành nghề đào tạo</th>
                                <th className="py-2 px-2 border w-48">Khóa học</th>
                                <th className="py-2 px-2 border w-20">Khóa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lopHocList.map((lop, index) => (
                                <tr key={lop.MaL} className="hover:bg-gray-50">
                                    <td className="py-1 px-2 border text-center">{index + 1}</td>
                                    <td className="py-1 px-2 border text-center font-mono">{lop.MaL}</td>
                                    <td className="py-1 px-2 border">
                                        <input type="text" value={lop.Tenlop || ''} onChange={e => handleRowChange(lop.MaL, 'Tenlop', e.target.value)} disabled={!isEditing} className={inputStyles} />
                                    </td>
                                    <td className="py-1 px-2 border">
                                        <input type="number" value={lop.Soluong || ''} onChange={e => handleRowChange(lop.MaL, 'Soluong', e.target.value)} disabled={!isEditing} className={`${inputStyles} text-center`} />
                                    </td>
                                    <td className="py-1 px-2 border">
                                        <select value={lop.MaGV || ''} onChange={e => handleRowChange(lop.MaL, 'MaGV', e.target.value)} disabled={!isEditing} className={selectStyles}>
                                            <option value="">-- Chọn CVHT --</option>
                                            {dataSources.giaoVien.map(gv => <option key={gv.MaGV} value={gv.MaGV}>{gv.HoTen}</option>)}
                                        </select>
                                    </td>
                                    {/* ĐIỀU CHỈNH: Thay đổi <select> thành <input> chỉ đọc */}
                                    <td className="py-1 px-2 border">
                                        <input 
                                            type="text" 
                                            value={dataSources.nganhHoc.find(ng => ng.MaNG === lop.MaNG)?.Tennganh || ''} 
                                            disabled 
                                            className={inputStyles} 
                                        />
                                    </td>
                                    <td className="py-1 px-2 border">
                                        <input type="text" value={lop.Khoahoc || ''} onChange={e => handleRowChange(lop.MaL, 'Khoahoc', e.target.value)} disabled={!isEditing} className={inputStyles} />
                                    </td>
                                    <td className="py-1 px-2 border text-center">
                                        <input type="checkbox" checked={lop.Lock || false} onChange={e => handleRowChange(lop.MaL, 'Lock', e.target.checked)} disabled={!isEditing} className="h-5 w-5" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 )}
            </div>
        </div>
    );
};

export default DanhMucLopHocPage;

