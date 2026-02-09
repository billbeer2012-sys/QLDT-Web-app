/*
* Đường dẫn file: D:\QLDT-app\client\src\components\layout\MainMenu.jsx
* Cập nhật: 09/02/2026
* Đổi tên menu con của Admin;  menu "Xem lịch thi"
* Chuyển menu "QL lớp HP" thành cấp 2
*/
import React, { useState, useMemo } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { ChevronDown, ChevronRight, Home, Lock, ShieldCheck, BookOpen, History, Construction, Users, Users2, UserSearch, CalendarClock, BarChart, GraduationCap, LayoutDashboard, Award, DollarSign, Library, Briefcase, UserCog, Wrench, Calendar } from 'lucide-react';

import { cn } from '../../lib/utils';
import useAuthStore from '../../store/authStore';
import useTabStore from '../../store/tabStore.jsx';
//  Định nghĩa một item đặc biệt cho đường phân cách
const SEPARATOR = { id: 'separator', type: 'separator' };

const menuConfig = [
    {
        title: 'Hệ thống',
        children: [

            { id: 'change-password', title: 'Đổi mật khẩu', type: 'action', auth: 'loggedIn', icon: <Lock className="w-5 h-5 mr-3" /> },
            {
                id: 'update-profile',
                title: 'Cập nhật thông tin',
                type: 'tab',
                componentName: 'UpdateProfilePage',
                auth: 'profileUpdater', // Bất kỳ ai đăng nhập đều có quyền này
                icon: <UserCog className="w-5 h-5 mr-3" />
            },
            // BỔ SUNG: Thêm separator vào cấu hình menu
            SEPARATOR,
            {
                title: 'Admin',
                icon: <ShieldCheck className="w-5 h-5 mr-3" />,
                auth: 'admin',
                children: [
                    { id: 'dashboard', title: 'Truy cập', type: 'tab', componentName: 'DashboardPage', auth: 'admin', icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },

                    { id: 'log', title: 'Nhật ký', type: 'tab', componentName: 'LogPage', auth: 'admin', icon: <History className="w-5 h-5 mr-3" /> },

                    { id: 'permissions', title: 'Người dùng', type: 'tab', componentName: 'PermissionsPage', auth: 'admin', icon: <ShieldCheck className="w-5 h-5 mr-3" /> },
                ]
            },

        ],
    },
    {
        title: 'Quản lý',
        children: [
            {
                title: 'Tuyển sinh',
                icon: <UserSearch className="w-5 h-5 mr-3" />,
                auth: 'isVC',
                children: [
                    { id: 'admissions', title: 'Danh sách thí sinh', type: 'tab', componentName: 'AdmissionsPage', auth: 'isVC', icon: <Users2 className="w-5 h-5 mr-3" /> },
                    // BỔ SUNG: Thêm separator vào cấu hình menu
                    SEPARATOR,
                    { id: 'dotxettuyen', title: 'DM Đợt xét tuyển', type: 'tab', componentName: 'QuanLyDotXetTuyenPage', auth: 'isVC', icon: <Wrench className="w-5 h-5 mr-3" /> },
                ]
            },
            {
                title: 'Thời khoá biểu',
                icon: <BookOpen className="w-5 h-5 mr-3" />,
                children: [
                    { id: 'schedule', title: 'Thời khóa biểu', type: 'tab', componentName: 'SchedulePage', auth: 'public', icon: <BookOpen className="w-5 h-5 mr-3" /> },
                    { id: 'teaching-schedule', title: 'Lịch giảng dạy, coi thi', type: 'tab', componentName: 'LichGiangDayPage', auth: 'isVC', icon: <Calendar className="w-5 h-5 mr-3" /> },
                    // { id: 'exam-schedule', title: 'Xem Lịch thi', type: 'tab', componentName: 'ExamSchedulePage', auth: 'isVC', icon: <CalendarClock className="w-5 h-5 mr-3" /> },
                    SEPARATOR,
                    { id: 'schedule-builder', title: 'Xây dựng TKB', type: 'tab', componentName: 'ScheduleBuilderPage', auth: 'tkbBuilder', icon: <Construction className="w-5 h-5 mr-3" /> },
                ]
            },
            {
                title: 'Lớp sinh hoạt',
                icon: <Users className="w-5 h-5 mr-3" />,
                auth: 'isVC',
                children: [
                    { id: 'class-management', title: 'Quản lý Sinh viên', type: 'tab', componentName: 'ClassManagementPage', auth: 'isVC', icon: <Users2 className="w-5 h-5 mr-3" /> },
                    {
                        id: 'update-work-info',
                        title: 'Cập nhật việc làm',
                        type: 'tab',
                        componentName: 'UpdateWorkInfoPage',
                        auth: 'workInfoUpdater', // Quyền mới sẽ được định nghĩa trong checkAccess
                        icon: <Briefcase className="w-5 h-5 mr-3" />
                    },
                    SEPARATOR,
                    { id: 'danhmuc-lophoc', title: 'DM Lớp sinh hoạt', type: 'tab', componentName: 'DanhMucLopHocPage', auth: 'isVC', icon: <Wrench className="w-5 h-5 mr-3" /> },

                ]
            },
            {
                id: 'credit-class-management', title: 'QL Lớp Học phần', type: 'tab', componentName: 'CreditClassManagementPage', auth: 'creditClassManager', icon: <Library className="w-5 h-5 mr-3" />
                /*--Tạm bỏ---
                title: 'Lớp học phần',
                icon: <Library className="w-5 h-5 mr-3" />,
                auth: 'creditClassManager',
                children: [
                    { id: 'credit-class-management', title: 'QL Lớp Học phần', type: 'tab', componentName: 'CreditClassManagementPage', auth: 'creditClassManager', icon: <Library className="w-5 h-5 mr-3" /> },
                    id: 'nhap-diem-thi', title: 'Nhập điểm thi-test', type: 'tab', componentName: 'NhapDiemThiPage', auth: 'admin', icon: <UserCog className="w-5 h-5 mr-3" /> },
              ] */
            },
            {
                title: 'Khoản thu',
                icon: <DollarSign className="w-5 h-5 mr-3" />,
                auth: 'isVC',
                children: [
                    {
                        id: 'class-fee-management',
                        title: 'Khoản thu Sinh viên',
                        type: 'tab',
                        componentName: 'ClassFeeManagementPage',
                        auth: 'isVC',
                        icon: <Users className="w-5 h-5 mr-3" />
                    },
                    {
                        id: 'fee-summary',
                        title: 'Tổng hợp thu',
                        type: 'tab',
                        componentName: 'FeeSummaryPage',
                        auth: 'isVC',
                        icon: <DollarSign className="w-5 h-5 mr-3" />
                    },
                    SEPARATOR,
                    {
                        id: 'fee-notification',
                        title: 'Thông báo học phí',
                        type: 'tab',
                        componentName: 'FeeNotificationSetupPage',
                        auth: 'admin',
                        icon: <Wrench className="w-5 h-5 mr-3" />
                    },
                ]
            },
        ],
    },
    {
        title: 'Thống kê',
        auth: 'isVC',
        children: [
            {
                id: 'admission-stats',
                title: 'TK Tuyển sinh',
                type: 'tab',
                componentName: 'AdmissionStatsPage',
                auth: 'isVC',
                icon: <BarChart className="w-5 h-5 mr-3" />
            },
            {
                id: 'student-stats',
                title: 'TK Người học',
                type: 'tab',
                componentName: 'StudentStatsPage',
                auth: 'isVC',
                icon: <GraduationCap className="w-5 h-5 mr-3" />
            },
            {
                id: 'graduation-stats',
                title: 'TK Tốt nghiệp',
                type: 'tab',
                componentName: 'GraduationStatsPage',
                auth: 'isVC',
                icon: <Award className="w-5 h-5 mr-3" />
            },
        ],
    },
];

const checkAccess = (authType, user, isLoggedIn) => {
    if (!authType) {
        return true;
    }

    if (authType === 'public') {
        return true;
    }

    if (authType === 'loggedOut') {
        return !isLoggedIn;
    }

    if (!isLoggedIn) {
        return false;
    }

    switch (authType) {
        case 'loggedIn':
            return true;
        case 'admin':
            return user?.isAdmin === 1;
        case 'tkbBuilder':
            return user?.isAdmin === 1 || user?.isXepTKB === 1;
        case 'feeManager':
            return user?.isAdmin === 1 || user?.isXepTKB === 1 || user?.isKetoan === 1;
        case 'isVC':
            return user?.isVC === 1;
        case 'creditClassManager':
            return user?.isAdmin === 1 || user?.isKhaothi === 1 || user?.isXepTKB === 1 || user?.nhapDiem === 1;
        case 'adminKetoan':
            return user?.isAdmin === 1 || user?.isKetoan === 1;
        case 'workInfoUpdater':
            return user?.isAdmin === 1 || user?.isHssv === 1;
        case 'nhapDiem':
            return user?.isAdmin === 1 || user?.isKhaothi === 1;
        case 'profileUpdater': // BỔ SUNG: Quyền này tương đương đã đăng nhập
            return true;
        default:
            return false;
    }
};

// Component render không cần logic kiểm tra quyền nữa
const MenuItemRenderer = ({ item, onSelect }) => {
    // SỬA LỖI: Render đường phân cách
    if (item.type === 'separator') {
        // Thay đổi: Sử dụng border-b thay vì height và background
        return <DropdownMenu.Separator className="border-b border-gray-200 dark:border-gray-700 my-1" />;
    }
    // Nếu item có con, render nó như một submenu
    if (item.children && item.children.length > 0) {
        return (
            <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger
                    className={cn(
                        "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md cursor-pointer focus:outline-none",
                        "hover:bg-blue-50 dark:hover:bg-gray-700 data-[state=open]:bg-blue-50 dark:data-[state=open]:bg-gray-700"
                    )}
                >
                    <span className="flex items-center">
                        {item.icon}
                        {item.title}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                    <DropdownMenu.SubContent className="w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg p-1 z-50 border border-gray-200 dark:border-gray-700" sideOffset={5} alignOffset={-5}>
                        {item.children.map((child) => <MenuItemRenderer key={child.id || child.title} item={child} onSelect={onSelect} />)}
                    </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
            </DropdownMenu.Sub>
        );
    }

    // Nếu không, render nó như một item bình thường
    return (
        <DropdownMenu.Item
            onSelect={() => onSelect(item)}
            className={cn(
                "w-full text-left flex items-center px-3 py-2 text-sm rounded-md focus:outline-none",
                "hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer"
            )}
        >
            {item.icon}
            {item.title}
        </DropdownMenu.Item>
    );
};

const MainMenu = ({ isMobile, onNavigate, onOpenLogin, onOpenChangePass }) => {
    const openTab = useTabStore(state => state.openTab);
    const setActiveTab = useTabStore(state => state.setActiveTab);
    const [openMenus, setOpenMenus] = useState({});
    const [openMobileSubmenus, setOpenMobileSubmenus] = useState({});
    const { user, isLoggedIn } = useAuthStore();


    const handleSelect = (item) => {
        if (item.type === 'action') {
            //if (item.id === 'login') onOpenLogin();
            if (item.id === 'change-password') onOpenChangePass();
        } else if (item.type === 'tab') {
            if (item.id === 'home') {
                setActiveTab('home');
            } else {
                openTab({ id: item.id, title: item.title, componentName: item.componentName, props: item.props || {} });
            }
        }
        setOpenMenus({});
        if (isMobile) {
            onNavigate?.();
        }
    };

    // Logic lọc menu được tái cấu trúc hoàn toàn
    const filteredMenuConfig = useMemo(() => {
        const filterItems = (items) => {
            const accessibleItems = [];
            for (const item of items) {
                // Đệ quy lọc các menu con trước
                const accessibleChildren = item.children ? filterItems(item.children) : [];

                // Kiểm tra xem user có quyền truy cập trực tiếp item này không
                const hasDirectAccess = checkAccess(item.auth, user, isLoggedIn);

                // Giữ lại item nếu user có quyền truy cập trực tiếp
                // HOẶC nếu nó là một submenu và có ít nhất một menu con có thể truy cập
                if (hasDirectAccess || accessibleChildren.length > 0) {
                    accessibleItems.push({
                        ...item,
                        children: accessibleChildren, // Gắn lại các menu con đã được lọc
                    });
                }
            }
            return accessibleItems;
        };
        return filterItems(menuConfig);
    }, [user, isLoggedIn]);

    const handleOpenChange = (title, open) => {
        setOpenMenus(prev => ({ ...prev, [title]: open }));
    };

    const toggleMobileSubmenu = (title) => {
        setOpenMobileSubmenus(prev => ({ ...prev, [title]: !prev[title] }));
    };

    if (!isMobile) {
        return (
            <nav className='flex items-center space-x-1'>
                {filteredMenuConfig.map(topLevelItem => (
                    <DropdownMenu.Root key={topLevelItem.title} open={openMenus[topLevelItem.title] || false} onOpenChange={(open) => handleOpenChange(topLevelItem.title, open)}>
                        <DropdownMenu.Trigger asChild>
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-gray-700">
                                {topLevelItem.title}
                                <ChevronDown className="w-4 h-4 ml-1" />
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content className="w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg p-1 z-50 border border-gray-200 dark:border-gray-700" sideOffset={5}>
                                {topLevelItem.children.map(child => <MenuItemRenderer key={child.id || child.title} item={child} onSelect={handleSelect} />)}
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                ))}
            </nav>
        );
    }

    // Đơn giản hóa logic render cho mobile, không cần kiểm tra quyền nữa
    return (
        <nav className='flex flex-col space-y-1'>
            <button onClick={() => handleSelect({ id: 'home', type: 'tab' })} className="w-full text-left flex items-center px-4 py-2 text-base rounded-md hover:bg-blue-50 dark:hover:bg-gray-700">
                <Home className="w-5 h-5 mr-3" />
                Trang chủ
            </button>

            {filteredMenuConfig.map(group => (
                <div key={group.title} className="py-1">
                    <span className="block px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{group.title}</span>
                    <div className="space-y-1">
                        {group.children.map(child => {
                            if (child.children && child.children.length > 0) {
                                const isOpen = openMobileSubmenus[child.title];
                                return (
                                    <div key={child.title}>
                                        <button
                                            onClick={() => toggleMobileSubmenu(child.title)}
                                            className="w-full text-left flex items-center justify-between px-4 py-2 text-base rounded-md hover:bg-blue-50 dark:hover:bg-gray-700"
                                        >
                                            <span className="flex items-center">
                                                {child.icon}
                                                {child.title}
                                            </span>
                                            <ChevronDown className={cn("w-5 h-5 transition-transform", isOpen && "rotate-180")} />
                                        </button>
                                        <div className={cn(
                                            "overflow-hidden transition-all duration-300 ease-in-out",
                                            isOpen ? "max-h-96" : "max-h-0"
                                        )}>
                                            <div className="pl-8 pt-1 space-y-1">
                                                {child.children.map(sub => (
                                                    <button
                                                        key={sub.id}
                                                        onClick={() => handleSelect(sub)}
                                                        className="w-full text-left flex items-center px-4 py-2 text-base rounded-md hover:bg-blue-50 dark:hover:bg-gray-700"
                                                    >
                                                        {sub.icon}
                                                        {sub.title}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <button
                                    key={child.id}
                                    onClick={() => handleSelect(child)}
                                    className="w-full text-left flex items-center px-4 py-2 text-base rounded-md hover:bg-blue-50 dark:hover:bg-gray-700"
                                >
                                    {child.icon}
                                    {child.title}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );
};

export default MainMenu;

