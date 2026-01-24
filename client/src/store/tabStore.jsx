/*
 * D:\QLDT-app\client\src\store\tabStore.jsx
 * Phiên bản cập nhật: 15/11/2025
 * Tóm tắt những nội dung cập nhật:
 * Bổ sung "Nhập điểm thi"
 */
 
import React from 'react';
import { create } from 'zustand';

// Import trang mới
import HomePage from '../pages/HomePage.jsx';
import SchedulePage from '../pages/SchedulePage.jsx';
import PermissionsPage from '../pages/PermissionsPage.jsx';
import ScheduleBuilderPage from '../pages/ScheduleBuilderPage.jsx';
import LogPage from '../pages/LogPage.jsx';
import ClassManagementPage from '../pages/ClassManagementPage.jsx';
import AdmissionsPage from '../pages/AdmissionsPage.jsx';
import ExamSchedulePage from '../pages/ExamSchedulePage.jsx';
// Import trang Thống kê Tuyển sinh
import AdmissionStatsPage from '../pages/AdmissionStatsPage.jsx';
// Import trang Thống kê Người học
import StudentStatsPage from '../pages/StudentStatsPage.jsx';
// Import trang Dashboard
import DashboardPage from '../pages/DashboardPage.jsx';
// Import trang Thống kê Tốt nghiệp
import GraduationStatsPage from '../pages/GraduationStatsPage.jsx';
// Import trang Tổng hợp khoản thu
import FeeSummaryPage from '../pages/FeeSummaryPage.jsx';
// Import trang QL Lớp HP
import CreditClassManagementPage from '../pages/CreditClassManagementPage.jsx';
// Import trang Cập nhật việc làm
import UpdateWorkInfoPage from '../pages/UpdateWorkInfoPage.jsx';
// Import trang Cập nhật thông tin
import UpdateProfilePage from '../pages/UpdateProfilePage.jsx';
// Import trang "Khoản thu lớp SH"
import ClassFeeManagementPage from '../pages/ClassFeeManagementPage.jsx';
// Import trang "Thiết lập TB học phí"
import FeeNotificationSetupPage from '../pages/FeeNotificationSetupPage.jsx';
// Import trang "DM đợt Xét tuyển"
import QuanLyDotXetTuyenPage from '../pages/QuanLyDotXetTuyenPage.jsx';
// Import trang "DM lớp"
import DanhMucLopHocPage from '../pages/DanhMucLopHocPage.jsx';
// Import trang "Lịch giảng dạy"
import LichGiangDayPage from '../pages/LichGiangDayPage.jsx';
// Import trang "Nhập điểm thi"
import NhapDiemThiPage from '../pages/NhapDiemThiPage.jsx';

const componentMap = {
    'HomePage': HomePage,
    'SchedulePage': SchedulePage,
    'PermissionsPage': PermissionsPage,
    'ScheduleBuilderPage': ScheduleBuilderPage,
    'LogPage': LogPage,
    'ClassManagementPage': ClassManagementPage,
    'AdmissionsPage': AdmissionsPage,
    'ExamSchedulePage': ExamSchedulePage,
    // Thêm trang "Thống kê Tuyển sinh" vào map
    'AdmissionStatsPage': AdmissionStatsPage,
	// Thêm trang "Thống kê Người học" vào map
    'StudentStatsPage': StudentStatsPage,
	// Thêm trang Dashboard vào map
    'DashboardPage': DashboardPage,
	// Thêm trang "Thống kê Tốt nghiệp" vào map
    'GraduationStatsPage': GraduationStatsPage,
	// Thêm trang "Tổng hợp khoản thu" vào map
    'FeeSummaryPage': FeeSummaryPage,
	// Thêm trang "Quản lý Lớp học phần" vào map
    'CreditClassManagementPage': CreditClassManagementPage,
	// Đăng ký component "Cập nhật việc làm"
    'UpdateWorkInfoPage': UpdateWorkInfoPage,
	//Đăng ký component "Cập nhập thông tin nười dừng"
    'UpdateProfilePage': UpdateProfilePage,
	// Đăng ký component "Khoản thu lớp SH"
    'ClassFeeManagementPage': ClassFeeManagementPage,
	// Đăng ký component "Thông báo học phí"
	'FeeNotificationSetupPage': FeeNotificationSetupPage,
	// Đăng ký component "DM đợt XT"
	'QuanLyDotXetTuyenPage': QuanLyDotXetTuyenPage,
	// Đăng ký component "DM Lớp"
    'DanhMucLopHocPage': DanhMucLopHocPage,
	// Đăng ký component "Lịch giảng dạy"
    'LichGiangDayPage': LichGiangDayPage,
	// Đăng ký component "Nhập điểm thi"
    'NhapDiemThiPage': NhapDiemThiPage,
};

const createTab = (id, title, componentName, props = {}) => ({
    id,
    title,
    componentName,
    props
});

const ComponentNotFound = ({ name }) => (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        <h2>Lỗi Giao diện</h2>
        <p>Không thể tìm thấy component với tên: <strong>{name}</strong>.</p>
    </div>
);

const useTabStore = create((set) => ({
    tabs: [createTab('home', 'Trang chủ', 'HomePage')],
    activeTabId: 'home',

    openTab: (tabData) => set(state => {
        const existingTab = state.tabs.find(t => t.id === tabData.id);
        if (existingTab) {
            return { activeTabId: tabData.id };
        }
        return {
            tabs: [...state.tabs, createTab(tabData.id, tabData.title, tabData.componentName, tabData.props)],
            activeTabId: tabData.id,
        };
    }),

    closeTab: (tabId) => set(state => {
        if (tabId === 'home') return {};
        const tabIndex = state.tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return {};
        const newTabs = state.tabs.filter(t => t.id !== tabId);
        let newActiveTabId = state.activeTabId;
        if (state.activeTabId === tabId) {
            newActiveTabId = newTabs[tabIndex - 1]?.id || newTabs[0]?.id;
        }
        return { tabs: newTabs, activeTabId: newActiveTabId };
    }),

    setActiveTab: (tabId) => set({ activeTabId: tabId }),

    getComponent: (componentName) => {
        const Component = componentMap[componentName];
        return Component ? Component : () => <ComponentNotFound name={componentName} />;
    },
}));

export default useTabStore;