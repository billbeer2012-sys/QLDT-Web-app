/*
* D:\QLDT-app\client\src\pages\PermissionsPage.jsx
* Cập nhật: 22/01/2026
* Đổi tên
*/
import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import { Loader, Users, Save, X, Eye, EyeOff, KeyRound, ShieldAlert, University, Search } from 'lucide-react';
import useAuthStore from '../store/authStore';
import ConfirmationModal from '../components/ui/ConfirmationModal.jsx';

// Component con cho checkbox
const PermissionCheckbox = ({ checked, onChange }) => (
    <input
        type="checkbox"
        checked={!!checked}
        onChange={onChange}
        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
    />
);

// Component chính của trang Phân quyền
const PermissionsPage = () => {
    const { isAdmin } = useAuthStore();
    const [users, setUsers] = useState([]);
    const [originalUsers, setOriginalUsers] = useState([]);
    const [donviList, setDonviList] = useState([]);
    const [selectedDonvi, setSelectedDonvi] = useState('<ALL>');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => {},
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!isAdmin) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [usersRes, donviRes] = await Promise.all([
                    axiosInstance.get('/permissions/users'),
                    axiosInstance.get('/permissions/donvi')
                ]);
                const usersData = usersRes.data.map(u => ({ ...u, Matkhau: u.Matkhau || '' }));
                setUsers(usersData);
                setOriginalUsers(JSON.parse(JSON.stringify(usersData)));
                setDonviList([{ MaDV: '<ALL>', Donvi: '<Tất cả đơn vị>' }, ...donviRes.data]);
            } catch (error) {
                toast.error(error.response?.data?.message || "Không thể tải dữ liệu phân quyền.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isAdmin]);

    const filteredUsers = useMemo(() => {
        return users
            .filter(u => selectedDonvi === '<ALL>' || u.MaDV === selectedDonvi)
            .filter(u => 
                (u.Holot + ' ' + u.Ten).toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [users, selectedDonvi, searchTerm]);

    const hasChanges = useMemo(() => {
        return JSON.stringify(users) !== JSON.stringify(originalUsers);
    }, [users, originalUsers]);

    const handlePermissionChange = (maGV, permissionKey, isChecked) => {
        setUsers(currentUsers =>
            currentUsers.map(user =>
                user.MaGV === maGV ? { ...user, [permissionKey]: isChecked ? 1 : null } : user
            )
        );
    };

    const handleSave = async () => {
        const changedUsers = users.filter(user => {
            const originalUser = originalUsers.find(ou => ou.MaGV === user.MaGV);
            return JSON.stringify(user) !== JSON.stringify(originalUser);
        });

        if (changedUsers.length === 0) {
            toast("Không có thay đổi nào để lưu.", { icon: '💡' });
            return;
        }

        setSaving(true);
        try {
            await axiosInstance.post('/permissions/update', changedUsers);
            toast.success('Cập nhật quyền thành công!');
            setOriginalUsers(JSON.parse(JSON.stringify(users)));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cập nhật quyền thất bại.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setUsers(JSON.parse(JSON.stringify(originalUsers)));
        toast.error('Đã hủy bỏ mọi thay đổi.');
    };

    const performReset = async (maGV, hoTen) => {
        try {
            await axiosInstance.post('/permissions/reset-password', { maGV });
            const newPassword = 'Vkc1234#';
            
            const updateUserState = (state) => state.map(u => u.MaGV === maGV ? {...u, Matkhau: newPassword} : u);
            setUsers(updateUserState);
            setOriginalUsers(updateUserState);

            toast.success(`Đã reset mật khẩu cho ${hoTen}.`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Reset mật khẩu thất bại.');
        }
    };

    const handleResetPassword = async (maGV, hoTen) => {
        console.log('[DEBUG] Nhấn reset mật khẩu cho:', maGV);
        if (!window.confirm(`Bạn có chắc chắn muốn reset mật khẩu cho mã GV: ${hoTen} về mặc định "vkc1234@"?`)) return;

        try {
            const response = await axiosInstance.post('/permissions/reset-password', { maGV });
            toast.success(response.data.message || 'Reset mật khẩu thành công!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi reset mật khẩu.');
            console.error('[Reset mật khẩu]', error);
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-white dark:bg-gray-800 rounded-lg">
                <ShieldAlert className="w-16 h-16 text-red-500" />
                <h2 className="mt-4 text-2xl font-bold">Truy cập bị từ chối</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Bạn không có quyền truy cập chức năng này.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="flex items-center justify-center h-full"><Loader className="w-10 h-10 animate-spin" /></div>;
    }

    const permissionColumns = [
        { key: 'isAdmin', label: 'Admin' },
		{ key: 'isVC', label: 'CBVC' },
        { key: 'Nhapdiem', label: 'G.Viên' },
        { key: 'isXepTKB', label: 'XếpTKB' },
        { key: 'isKhaothi', label: 'K.Thí' },
        { key: 'isHssv', label: 'HSSV' },
        { key: 'isTuyensinh', label: 'T.Sinh' },
        { key: 'isKetoan', label: 'K.Toán' },
    ];

    return (
        <div className="p-4 sm:p-6 h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            <ConfirmationModal {...modalState} onOpenChange={(isOpen) => setModalState(prev => ({ ...prev, isOpen }))} />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">NGƯỜI DÙNG</h1>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setShowPassword(s => !s)} className="flex items-center px-3 py-2 text-sm bg-white dark:bg-gray-700 border rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                    <button onClick={handleCancel} disabled={!hasChanges || saving} className="flex items-center px-3 py-2 text-sm bg-yellow-500 text-white rounded-md shadow-sm hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed">
                        <X className="w-4 h-4 mr-2" /> Hủy
                    </button>
                    <button onClick={handleSave} disabled={!hasChanges || saving} className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">
                        {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {saving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                 <div className="relative">
                    <University className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                    <select value={selectedDonvi} onChange={e => setSelectedDonvi(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500">
                        {donviList.map(dv => <option key={dv.MaDV} value={dv.MaDV}>{dv.Donvi}</option>)}
                    </select>
                </div>
                <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                    <input type="text" placeholder="Tìm kiếm theo họ tên..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>

            <div className="flex-grow overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-row-hover">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12">STT</th>
                             <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mã số</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Họ và Tên</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mật khẩu</th>
                            {permissionColumns.map(p => (
                                <th key={p.key} className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{p.label}</th>
                            ))}
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.map((user, index) => (
                            <tr key={user.MaGV} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                                 <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.Maso}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.Holot} {user.Ten}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                                    {showPassword ? user.Matkhau : '********'}
                                </td>
                                {permissionColumns.map(p => (
                                    <td key={p.key} className="px-2 py-3 whitespace-nowrap text-center">
                                        <PermissionCheckbox
                                            checked={user[p.key]}
                                            onChange={e => handlePermissionChange(user.MaGV, p.key, e.target.checked)}
                                        />
                                    </td>
                                ))}
                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                    <button onClick={() => handleResetPassword(user.MaGV, `${user.Holot} ${user.Ten}`)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Reset mật khẩu">
                                        <KeyRound className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredUsers.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <Users className="w-12 h-12 mx-auto" />
                        <p className="mt-2">Không tìm thấy người dùng phù hợp.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PermissionsPage;
