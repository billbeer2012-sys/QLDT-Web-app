/*
 * Đường dẫn file: D:\QLDT-app\client\src\api\danhmuc-lophoc.js
 * Ngày tạo: 08/10/2025
 * Tóm tắt:
 * - Tạo mới file để quản lý các hàm gọi API cho chức năng "Danh mục lớp sinh hoạt".
 */
import axiosInstance from './axios';

const API_URL = '/danhmuc-lophoc';

export const fetchKhoaHocList = async () => {
    const response = await axiosInstance.get(`${API_URL}/khoa-hoc`);
    return response.data;
};

export const fetchLopHocList = async (maKh) => {
    const response = await axiosInstance.get(`${API_URL}/lop-hoc/${maKh}`);
    return response.data;
};

export const fetchDataSources = async () => {
    const response = await axiosInstance.get(`${API_URL}/data-sources`);
    return response.data;
};

export const updateLopHocList = async (updatedLops) => {
    const response = await axiosInstance.put(`${API_URL}/lop-hoc`, { updatedLops });
    return response.data;
};
