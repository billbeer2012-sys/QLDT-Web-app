/*
 * Đường dẫn file: D:\QLDT-app\client\src\api\dotxettuyen.js
 * Phiên bản cập nhật: 08/10/2025
 * Tóm tắt những nội dung cập nhật:
 * - BỔ SUNG: Thêm các hàm API mới để quản lý "Tổ hợp xét tuyển":
 * - fetchNganhHocCoChiTieu
 * - fetchAllToHopMon
 * - fetchToHopDaGan
 * - saveToHop
 */
import axiosInstance from './axios';

const API_URL = '/dot-xet-tuyen';

export const fetchDotXetTuyens = async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
};
export const getNextDotXetTuyenId = async () => {
    const response = await axiosInstance.get(`${API_URL}/next-id`);
    return response.data;
};
export const addDotXetTuyen = async (data) => {
    const response = await axiosInstance.post(API_URL, data);
    return response.data;
};
export const updateDotXetTuyen = async (id, data) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    return response.data;
};
export const deleteDotXetTuyen = async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
};
export const fetchChiTieu = async (maDxt) => {
    const response = await axiosInstance.get(`${API_URL}/chitieu/${maDxt}`);
    return response.data;
}
export const saveChiTieu = async (maDxt, data) => {
    const response = await axiosInstance.post(`${API_URL}/chitieu/${maDxt}`, data);
    return response.data;
}

// BỔ SUNG: API cho Tổ hợp xét tuyển
export const fetchNganhHocCoChiTieu = async (maDxt) => {
    const response = await axiosInstance.get(`${API_URL}/tohop-xt/nganh-hoc/${maDxt}`);
    return response.data;
};
export const fetchAllToHopMon = async () => {
    const response = await axiosInstance.get(`${API_URL}/tohop-xt/tohop-mon`);
    return response.data;
};
export const fetchToHopDaGan = async (maDxt, maNganh) => {
    const response = await axiosInstance.get(`${API_URL}/tohop-xt/${maDxt}/${maNganh}`);
    return response.data;
};
export const saveToHop = async (data) => {
    const response = await axiosInstance.post(`${API_URL}/tohop-xt`, data);
    return response.data;
};

