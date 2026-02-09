/*
 * Đường dẫn file: client/src/components/ExamScheduleModal.jsx
 * Phiên bản: 07/02/2026
 * Tóm tắt:
 * - Modal "Cập nhật lịch coi thi" (Part 5)
 * - Controls: Ngày thi, Giờ, Phút, Thời gian, Nhóm phòng, Phòng, Ghi chú, CB coi thi 1/2
 * - Nút: Xóa, Lưu, Thoát
 * - Kiểm tra trùng lịch sinh viên khi Lưu
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Trash2, Save, Loader, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';
import { cn } from '../lib/utils';

// ========================================
// Helper: Tính Tiết và Số tiết
// ========================================
const calculateTiet = (gio, phut) => {
    const g = parseInt(gio);
    const p = parseInt(phut) || 0;
    const baseHour = g >= 13 ? 13 : 7;
    const baseTiet = g >= 13 ? 7 : 1;
    const minutesFromBase = (g - baseHour) * 60 + p;
    return baseTiet + Math.floor(minutesFromBase / 50);
};

const calculateSotiet = (thoigian) => {
    return Math.ceil(parseInt(thoigian) / 50);
};

// ========================================
// Component: ConflictDialog
// ========================================
const ConflictDialog = ({ conflicts, onConfirm, onCancel }) => {
    const totalCount = conflicts.reduce((sum, c) => sum + c.count, 0);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <div className="flex items-center gap-3 text-amber-600 mb-4">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="text-lg font-semibold">Cảnh báo trùng lịch</h3>
                </div>

                <p className="mb-3 text-gray-700 dark:text-gray-300">
                    Phòng thi đang xếp lịch có <strong>{totalCount}</strong> sinh viên trùng lịch học / lịch thi tại:
                </p>

                <ul className="list-disc list-inside mb-4 text-sm text-gray-600 dark:text-gray-400 space-y-1 max-h-40 overflow-auto">
                    {conflicts.map((c, i) => (
                        <li key={i}>
                            <span className="font-medium">{c.type}:</span> {c.tenlop}
                            <span className="text-gray-500"> - {c.hocphan}</span>
                            <span className="text-red-500"> ({c.count} SV)</span>
                        </li>
                    ))}
                </ul>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                        Thoát
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                    >
                        Vẫn lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

// ========================================
// Component: ExamScheduleModal
// ========================================
const ExamScheduleModal = ({ isOpen, onClose, onSave, maPT, examType, roomData, maHK, maHP }) => {
    // Form state
    const [ngay, setNgay] = useState('');
    const [gio, setGio] = useState('');
    const [phut, setPhut] = useState('');
    const [thoigian, setThoigian] = useState('');
    const [maNP, setMaNP] = useState('');
    const [maPH, setMaPH] = useState('');
    const [ghichu, setGhichu] = useState('');
    const [maGV1, setMaGV1] = useState('');
    const [maGV2, setMaGV2] = useState('');

    // Data state
    const [roomGroups, setRoomGroups] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [availableTeachers, setAvailableTeachers] = useState([]);

    // Loading state
    const [loading, setLoading] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [loadingTeachers, setLoadingTeachers] = useState(false);

    // Conflict dialog state
    const [showConflictDialog, setShowConflictDialog] = useState(false);
    const [conflicts, setConflicts] = useState([]);

    // Options
    const gioOptions = [7, 8, 9, 10, 13, 14, 15, 16];
    const phutOptions = ['00', '15', '30', '45'];
    const thoigianOptions = [45, 60, 90, 120, 150, 180, 210, 240];

    // ========================================
    // Initialize form data from roomData
    // ========================================
    useEffect(() => {
        if (roomData) {
            // Ngày thi: nếu có thì format, không thì +7 ngày
            if (roomData.Ngaythi) {
                const d = new Date(roomData.Ngaythi);
                setNgay(d.toISOString().split('T')[0]);
            } else {
                const d = new Date();
                d.setDate(d.getDate() + 7);
                setNgay(d.toISOString().split('T')[0]);
            }

            setGio(roomData.Gio?.toString() || '7');
            setPhut(roomData.Phut?.toString().padStart(2, '0') || '00');
            setThoigian(roomData.Thoigian?.toString() || '60');
            setMaPH(roomData.MaPH || '');
            setGhichu(roomData.Ghichu || '');
            setMaGV1(roomData.MaGV1 || '');
            setMaGV2(roomData.MaGV2 || '');
        }
    }, [roomData]);

    // ========================================
    // Fetch room groups
    // ========================================
    useEffect(() => {
        const fetchRoomGroups = async () => {
            try {
                const response = await axiosInstance.get('/exam-room-management/schedule/room-groups');
                setRoomGroups(response.data);
                if (response.data.length > 0) {
                    setMaNP(response.data[0].MaNP);
                }
            } catch (error) {
                console.error('fetchRoomGroups error:', error);
            }
        };
        fetchRoomGroups();
    }, []);

    // ========================================
    // Fetch available rooms when time/group changes
    // ========================================
    const fetchAvailableRooms = useCallback(async () => {
        if (!ngay || !gio || !phut || !thoigian) return;

        setLoadingRooms(true);
        try {
            const tiet = calculateTiet(gio, phut);
            const sotiet = calculateSotiet(thoigian);

            const response = await axiosInstance.get('/exam-room-management/schedule/available-rooms', {
                params: {
                    maNP: maNP || undefined,
                    ngay,
                    tiet,
                    sotiet,
                    examType,
                    excludeMaPT: maPT
                }
            });
            setAvailableRooms(response.data);

            // Giữ lại phòng đã chọn nếu còn trong danh sách
            if (maPH && !response.data.find(r => r.MaPH === maPH)) {
                setMaPH('');
            }
        } catch (error) {
            console.error('fetchAvailableRooms error:', error);
        } finally {
            setLoadingRooms(false);
        }
    }, [ngay, gio, phut, thoigian, maNP, examType, maPT, maPH]);

    useEffect(() => {
        fetchAvailableRooms();
    }, [ngay, gio, phut, thoigian, maNP]);

    // ========================================
    // Fetch available teachers when time changes
    // ========================================
    const fetchAvailableTeachers = useCallback(async () => {
        if (!ngay || !gio || !phut || !thoigian) return;

        setLoadingTeachers(true);
        try {
            const tiet = calculateTiet(gio, phut);
            const sotiet = calculateSotiet(thoigian);

            const response = await axiosInstance.get('/exam-room-management/schedule/available-teachers', {
                params: {
                    ngay,
                    tiet,
                    sotiet,
                    examType,
                    excludeMaPT: maPT
                }
            });
            setAvailableTeachers(response.data);

            // Giữ lại GV đã chọn nếu còn trong danh sách
            if (maGV1 && !response.data.find(t => t.MaGV === maGV1)) {
                setMaGV1('');
            }
            if (maGV2 && !response.data.find(t => t.MaGV === maGV2)) {
                setMaGV2('');
            }
        } catch (error) {
            console.error('fetchAvailableTeachers error:', error);
        } finally {
            setLoadingTeachers(false);
        }
    }, [ngay, gio, phut, thoigian, examType, maPT, maGV1, maGV2]);

    useEffect(() => {
        fetchAvailableTeachers();
    }, [ngay, gio, phut, thoigian]);

    // ========================================
    // Handlers
    // ========================================
    const handleClear = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa dữ liệu lịch coi thi?')) {
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.put(`/exam-room-management/schedule/clear/${maPT}`, { examType });
            toast.success('Xóa lịch thi thành công!');

            // Reset form
            const d = new Date();
            d.setDate(d.getDate() + 7);
            setNgay(d.toISOString().split('T')[0]);
            setGio('7');
            setPhut('00');
            setThoigian('60');
            setMaPH('');
            setGhichu('');
            setMaGV1('');
            setMaGV2('');

            onSave();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Xóa lịch thi thất bại.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (forceSkipConflict = false) => {
        // Validate required fields
        if (!ngay) {
            toast.error('Vui lòng chọn ngày thi.');
            return;
        }
        if (!gio) {
            toast.error('Vui lòng chọn giờ thi.');
            return;
        }
        if (!phut) {
            toast.error('Vui lòng chọn phút.');
            return;
        }
        if (!thoigian) {
            toast.error('Vui lòng chọn thời gian.');
            return;
        }
        if (!maPH) {
            toast.error('Vui lòng chọn phòng thi.');
            return;
        }

        setLoading(true);
        try {
            const tiet = calculateTiet(gio, phut);
            const sotiet = calculateSotiet(thoigian);

            // Kiểm tra trùng lịch sinh viên (nếu chưa skip)
            if (!forceSkipConflict) {
                const conflictRes = await axiosInstance.post('/exam-room-management/schedule/check-student-conflicts', {
                    maPT,
                    ngay,
                    tiet,
                    sotiet,
                    examType,
                    maHK,
                    maHP
                });

                if (conflictRes.data.hasConflict) {
                    setConflicts(conflictRes.data.conflicts);
                    setShowConflictDialog(true);
                    setLoading(false);
                    return;
                }
            }

            // Lưu lịch thi
            await axiosInstance.put(`/exam-room-management/schedule/update/${maPT}`, {
                examType,
                ngay,
                gio,
                phut,
                thoigian,
                maPH,
                maGV1: maGV1 || null,
                maGV2: maGV2 || null,
                ghichu
            });

            toast.success('Cập nhật lịch thi thành công!');
            onSave();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cập nhật lịch thi thất bại.');
        } finally {
            setLoading(false);
            setShowConflictDialog(false);
        }
    };

    const handleConfirmConflict = () => {
        handleSave(true); // Force save, skip conflict check
    };

    const handleCancelConflict = () => {
        setShowConflictDialog(false);
    };

    // ========================================
    // Render
    // ========================================
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                CẬP NHẬT LỊCH THI
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Phòng thi: {roomData?.TenPhongthi || maPT}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-4 space-y-4">
                        {/* Ngày thi */}
                        <div className="flex items-center gap-4">
                            <label className="w-28 text-sm font-medium">Ngày thi: <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                value={ngay}
                                onChange={(e) => setNgay(e.target.value)}
                                className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>

                        {/* Giờ thi */}
                        <div className="flex items-center gap-4">
                            <label className="w-28 text-sm font-medium">Giờ thi: <span className="text-red-500">*</span></label>
                            <select
                                value={gio}
                                onChange={(e) => setGio(e.target.value)}
                                className="w-20 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="">--</option>
                                {gioOptions.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                            <span>:</span>
                            <select
                                value={phut}
                                onChange={(e) => setPhut(e.target.value)}
                                className="w-20 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="">--</option>
                                {phutOptions.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <label className="text-sm font-medium ml-4">Thời gian: <span className="text-red-500">*</span></label>
                            <select
                                value={thoigian}
                                onChange={(e) => setThoigian(e.target.value)}
                                className="w-24 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="">--</option>
                                {thoigianOptions.map(t => (
                                    <option key={t} value={t}>{t} phút</option>
                                ))}
                            </select>
                        </div>

                        {/* Nhóm phòng */}
                        <div className="flex items-center gap-4">
                            <label className="w-28 text-sm font-medium">Nhóm phòng:</label>
                            <select
                                value={maNP}
                                onChange={(e) => setMaNP(e.target.value)}
                                className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="">-- Tất cả --</option>
                                {roomGroups.map(np => (
                                    <option key={np.MaNP} value={np.MaNP}>{np.Nhomphong}</option>
                                ))}
                            </select>
                        </div>

                        {/* Phòng */}
                        <div className="flex items-center gap-4">
                            <label className="w-28 text-sm font-medium">Phòng: <span className="text-red-500">*</span></label>
                            <div className="flex-1 relative">
                                <select
                                    value={maPH}
                                    onChange={(e) => setMaPH(e.target.value)}
                                    disabled={loadingRooms}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                                >
                                    <option value="">-- Chọn phòng --</option>
                                    {availableRooms.map(ph => (
                                        <option key={ph.MaPH} value={ph.MaPH}>
                                            {ph.Tenphong} ({ph.Socho} chỗ)
                                        </option>
                                    ))}
                                </select>
                                {loadingRooms && (
                                    <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />
                                )}
                            </div>
                        </div>

                        {/* Ghi chú */}
                        <div className="flex items-center gap-4">
                            <label className="w-28 text-sm font-medium">Ghi chú:</label>
                            <input
                                type="text"
                                value={ghichu}
                                onChange={(e) => setGhichu(e.target.value)}
                                className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                placeholder="Nhập ghi chú (nếu có)"
                            />
                        </div>

                        {/* CB coi thi 1 */}
                        <div className="flex items-center gap-4">
                            <label className="w-28 text-sm font-medium">CB coi thi 1:</label>
                            <div className="flex-1 relative">
                                <select
                                    value={maGV1}
                                    onChange={(e) => setMaGV1(e.target.value)}
                                    disabled={loadingTeachers}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                                >
                                    <option value="">-- Chọn CB coi thi 1 --</option>
                                    {availableTeachers.map(gv => (
                                        <option key={gv.MaGV} value={gv.MaGV}>{gv.Hoten}</option>
                                    ))}
                                </select>
                                {loadingTeachers && (
                                    <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />
                                )}
                            </div>
                        </div>

                        {/* CB coi thi 2 */}
                        <div className="flex items-center gap-4">
                            <label className="w-28 text-sm font-medium">CB coi thi 2:</label>
                            <div className="flex-1 relative">
                                <select
                                    value={maGV2}
                                    onChange={(e) => setMaGV2(e.target.value)}
                                    disabled={loadingTeachers}
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                                >
                                    <option value="">-- Chọn CB coi thi 2 --</option>
                                    {availableTeachers.filter(gv => gv.MaGV !== maGV1).map(gv => (
                                        <option key={gv.MaGV} value={gv.MaGV}>{gv.Hoten}</option>
                                    ))}
                                </select>
                                {loadingTeachers && (
                                    <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t dark:border-gray-700">
                        <button
                            onClick={handleClear}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Xóa</span>
                        </button>
                        <button
                            onClick={() => handleSave(false)}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            <span>Lưu</span>
                        </button>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                            Thoát
                        </button>
                    </div>
                </div>
            </div>

            {/* Conflict Dialog */}
            {showConflictDialog && (
                <ConflictDialog
                    conflicts={conflicts}
                    onConfirm={handleConfirmConflict}
                    onCancel={handleCancelConflict}
                />
            )}
        </>
    );
};

export default ExamScheduleModal;
