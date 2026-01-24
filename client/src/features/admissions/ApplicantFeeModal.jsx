/*
* D:\QLDT-app\client\src\features\admissions\ApplicantFeeModal.jsx
* Cập nhật: 07/10/2025
* Tóm tắt: Tự động cập nhật "Số phiếu" khi người dùng thay đổi "Khoản thu".
*/
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader, Users, User, Calendar, Hash, Cake, History, FilePlus, Banknote, StickyNote, Landmark, Printer, Save } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { toast } from 'react-hot-toast';
import moment from 'moment-timezone';
import { cn } from '../../lib/utils';
import useAuthStore from '../../store/authStore'; 
import { generateReceiptPDF } from './ReceiptGenerator';

// Helper Components
const FormRow = ({ icon, label, children, className = "" }) => (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:gap-2", className)}>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center flex-shrink-0 sm:w-32 mb-1 sm:mb-0">
            {icon}
            <span className="ml-2">{label}:</span>
        </label>
        <div className="w-full">
            {children}
        </div>
    </div>
);

const ReadOnlyInput = ({ value }) => (
    <input
        type="text"
        value={value || ''}
        readOnly
        className="w-full p-1.5 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none text-sm"
    />
);

const CustomSelect = ({ value, onChange, disabled, options, className }) => (
     <select 
        value={value} 
        onChange={onChange}
        disabled={disabled}
        className={cn("w-full p-1.5 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm", className)}
    >
        {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
    </select>
);

const CustomInput = ({ value, onChange, placeholder, className, type = "text" }) => (
    <input 
        type={type}
        value={value}
        onChange={onChange}
        className={cn("w-full p-1.5 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm", className)}
        placeholder={placeholder}
    />
);

const ApplicantFeeModal = ({ isOpen, onClose, periodInfo, applicants, selectedApplicantId: initialSelectedId }) => {
    const { user } = useAuthStore();
    const [feeTypes, setFeeTypes] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);

    const [selectedApplicantId, setSelectedApplicantId] = useState('');
    const [selectedFeeTypeId, setSelectedFeeTypeId] = useState('');
    const [newPayment, setNewPayment] = useState({
        soPhieu: '',
        ngayThu: moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY'),
        soTien: '',
        ghiChu: '',
        lyDo: '',
        hinhThuc: 'CK qua VCB'
    });
    const [loading, setLoading] = useState({
        feeTypes: false,
        history: false,
        nextReceipt: false,
    });
    const [isSaving, setIsSaving] = useState(false);

    const formatCurrency = (value) => {
        if (!value) return '';
        const num = parseInt(value.toString().replace(/[^0-9]/g, ''), 10);
        return isNaN(num) ? '' : num.toLocaleString('vi-VN');
    };

    const handleSoTienChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        setNewPayment(prev => ({ ...prev, soTien: rawValue }));
    };
    
    const sortedApplicants = useMemo(() => {
        return [...applicants].sort((a, b) => a.Ten.localeCompare(b.Ten) || a.Holot.localeCompare(b.Holot));
    }, [applicants]);

    const selectedApplicant = useMemo(() => sortedApplicants.find(s => s.MaTSXT === selectedApplicantId), [selectedApplicantId, sortedApplicants]);
    const selectedFeeType = useMemo(() => feeTypes.find(f => f.MaKT === selectedFeeTypeId), [selectedFeeTypeId, feeTypes]);

    // Initial load when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedApplicantId(initialSelectedId || sortedApplicants[0]?.MaTSXT || '');
            
            setLoading(prev => ({ ...prev, feeTypes: true }));
            axiosInstance.get('/admissions/other-fee-types')
                .then(res => {
                    setFeeTypes(res.data);
                    if (res.data.length > 0) {
                        setSelectedFeeTypeId(res.data[0].MaKT);
                    }
                })
                .catch(() => toast.error("Lỗi khi tải danh sách khoản thu."))
                .finally(() => setLoading(prev => ({ ...prev, feeTypes: false })));
        }
    }, [isOpen, sortedApplicants, initialSelectedId]);

    // Fetch payment history
    const fetchHistory = useCallback(() => {
        if (isOpen && selectedApplicantId && selectedFeeTypeId) {
            setLoading(prev => ({ ...prev, history: true }));
            const params = { maTSXT: selectedApplicantId, maKT: selectedFeeTypeId };
            axiosInstance.get('/admissions/other-fee-history', { params })
                .then(res => setPaymentHistory(res.data))
                .catch(() => toast.error("Lỗi khi tải lịch sử thu."))
                .finally(() => setLoading(prev => ({ ...prev, history: false })));
        }
    }, [isOpen, selectedApplicantId, selectedFeeTypeId]);

    useEffect(fetchHistory, [fetchHistory]);

    // ĐIỀU CHỈNH: Fetch số phiếu thu mới khi modal mở hoặc khi "Khoản thu" thay đổi
    useEffect(() => {
        // BỔ SUNG: Chỉ chạy khi modal mở và đã có một khoản thu được chọn
        if (isOpen && selectedFeeTypeId) {
            setLoading(prev => ({...prev, nextReceipt: true}));
            // SỬA LỖI: Gọi đúng API của 'admissions' để lấy số phiếu thu
            axiosInstance.get('/admissions/next-receipt-number')
                .then(res => setNewPayment(prev => ({...prev, soPhieu: res.data.nextSoCT})))
                .catch(() => toast.error("Lỗi khi lấy số phiếu thu."))
                .finally(() => setLoading(prev => ({...prev, nextReceipt: false})));
        }
    }, [isOpen, selectedFeeTypeId]); // BỔ SUNG: Thêm selectedFeeTypeId vào dependency array


    // Update "Lý do thu"
    useEffect(() => {
        if (selectedFeeType) {
            setNewPayment(prev => ({ ...prev, lyDo: selectedFeeType.Lydo }));
        }
    }, [selectedFeeType]);

    const writeLog = async (savedData) => {
        try {
            const logPayload = {
                Cuaso: "Khoản thu thí sinh",
                Congviec: selectedFeeType.Khoanthu,
                Ghichu: `${selectedApplicant.Maso}, ${selectedApplicant.Holot} ${selectedApplicant.Ten}, Số phiếu: ${savedData.SoCT}, Số tiền: ${savedData.Sotien.toLocaleString('vi-VN')}, ${savedData.Lydo}`
            };
            await axiosInstance.post('/log-action', logPayload);
        } catch (error) {
            console.error("Ghi log thất bại:", error);
        }
    };

    const performSave = async () => {
        const soTienNum = parseInt(newPayment.soTien, 10);
        if (isNaN(soTienNum) || soTienNum <= 0) {
            toast.error("Vui lòng nhập số tiền thu hợp lệ.");
            return null;
        }
        if (!newPayment.lyDo) {
            toast.error("Không có lý do thu. Vui lòng chọn khoản thu.");
            return null;
        }

        const payload = {
            MaSV: selectedApplicantId,
            MaHK: "000",
            MaKT: selectedFeeTypeId,
            Lan: paymentHistory.length + 1,
            Lydo: newPayment.lyDo,
            SoCT: newPayment.soPhieu,
            Thue: 0,
            Sotien: soTienNum,
            Sotienthu: soTienNum,
            Ngaynop: newPayment.ngayThu,
            Ghichu: newPayment.ghiChu,
            MaLPT: "002",
            Hinhthucthanhtoan: newPayment.hinhThuc
        };

        await axiosInstance.post('/admissions/save-other-fee', payload);
        await writeLog(payload);
        return payload;
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const savedData = await performSave();
            if (savedData) {
                toast.success("Lưu phiếu thu thành công!");
                fetchHistory();
                setNewPayment(prev => ({ ...prev, soTien: '', ghiChu: '' }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Lưu phiếu thu thất bại.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAndPrint = async () => {
        setIsSaving(true);
        try {
            const savedData = await performSave();
            if (savedData) {
                toast.success("Lưu thành công, đang tạo biên lai...");
                generateReceiptPDF({
                    soPhieu: savedData.SoCT,
                    hoTenSV: `${selectedApplicant.Holot} ${selectedApplicant.Ten}`,
                    maSoSV: selectedApplicant.Maso,
                    ngaySinhSV: moment(selectedApplicant.Ngaysinh).format('DD/MM/YYYY'),
                    tenLop: periodInfo.DotXT,
                    lyDo: savedData.Lydo,
                    soTien: savedData.Sotien,
                    nguoiThu: user.hoTen,
                });
                fetchHistory();
                setNewPayment(prev => ({ ...prev, soTien: '', ghiChu: '' }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Thao tác thất bại.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-black/60 fixed inset-0 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 w-[95vw] max-w-4xl p-4 max-h-[90vh] flex flex-col">
                    <Dialog.Title className="text-lg font-bold text-primary dark:text-white flex items-center flex-shrink-0">
                        <FilePlus className="mr-2 text-blue-600" />
                        KHOẢN THU THÍ SINH
                    </Dialog.Title>
                    <Dialog.Close asChild>
                        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X className="w-5 h-5" />
                        </button>
                    </Dialog.Close>

                    <div className="flex-grow overflow-y-auto mt-3 pr-2 -mr-2 space-y-3">
                        {/* Applicant Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                            <FormRow icon={<Users className="w-4 h-4" />} label="Khóa tuyển sinh"><ReadOnlyInput value={periodInfo.DotXT} /></FormRow>
                            <FormRow icon={<User className="w-4 h-4" />} label="Họ và tên TS">
                                <CustomSelect value={selectedApplicantId} onChange={e => setSelectedApplicantId(e.target.value)} options={sortedApplicants.map(s => ({ value: s.MaTSXT, label: `${s.Holot} ${s.Ten}`}))} />
                            </FormRow>
                            <FormRow icon={<Hash className="w-4 h-4" />} label="Mã số"><ReadOnlyInput value={selectedApplicant?.Maso} /></FormRow>
                            <FormRow icon={<Cake className="w-4 h-4" />} label="Ngày sinh"><ReadOnlyInput value={selectedApplicant?.Ngaysinh ? moment(selectedApplicant.Ngaysinh).format('DD/MM/YYYY') : ''} /></FormRow>
                        </div>
                        
                        {/* Payment History Table */}
                        <div>
                            <h3 className="font-semibold mb-1.5 text-sm flex items-center"><History className="w-4 h-4 mr-2" />Danh sách các lần thu</h3>
                            <div className="border rounded-md overflow-hidden max-h-40 overflow-y-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th className="p-1.5 text-center">Stt</th>
                                            <th className="p-1.5 text-center">Số phiếu</th>
                                            <th className="p-1.5 text-right">Số tiền</th>
                                            <th className="p-1.5 text-center">Ngày thu</th>
                                            <th className="p-1.5 text-left">Người thu</th>
                                            <th className="p-1.5 text-left">Lý do thu</th>
                                            <th className="p-1.5 text-left">Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentHistory.map((item) => (
                                            <tr key={item.Lan} className="border-t dark:border-gray-600">
                                                <td className="p-1.5 text-center">{item.Lan}</td>
                                                <td className="p-1.5 text-center">{item.SoCT}</td>
                                                <td className="p-1.5 text-right">{formatCurrency(item.Sotien)}</td>
                                                <td className="p-1.5 text-center">{item.Ngaynop}</td>
                                                <td className="p-1.5">{item.MaUser}</td>
                                                <td className="p-1.5">{item.Lydo}</td>
                                                <td className="p-1.5">{item.Ghichu}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* New Payment Section */}
                        <div>
                            <h3 className="font-semibold mb-2 border-t dark:border-gray-600 pt-2 text-sm">Chi tiết lần thu</h3>
                            <div className="md:col-span-2">
                                <FormRow icon={<Banknote className="w-4 h-4" />} label="Khoản thu">
                                    <CustomSelect value={selectedFeeTypeId} onChange={e => setSelectedFeeTypeId(e.target.value)} disabled={loading.feeTypes} options={feeTypes.map(f => ({ value: f.MaKT, label: f.Khoanthu }))} />
                                </FormRow>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-2">
                                <FormRow icon={<Hash className="w-4 h-4" />} label="Số phiếu"><ReadOnlyInput value={newPayment.soPhieu} /></FormRow>
                                <FormRow icon={<Calendar className="w-4 h-4" />} label="Ngày thu"><ReadOnlyInput value={newPayment.ngayThu} /></FormRow>
                                <FormRow icon={<Banknote className="w-4 h-4" />} label="Số tiền thu">
                                    <CustomInput type="text" value={formatCurrency(newPayment.soTien)} onChange={handleSoTienChange} className="text-right" placeholder="0" />
                                </FormRow>
                                <FormRow icon={<StickyNote className="w-4 h-4" />} label="Ghi chú">
                                    <CustomInput value={newPayment.ghiChu} onChange={(e) => setNewPayment(prev => ({...prev, ghiChu: e.target.value}))} />
                                </FormRow>
                                <div className="md:col-span-2">
                                    <FormRow icon={<StickyNote className="w-4 h-4" />} label="Lý do thu">
                                        <CustomInput value={newPayment.lyDo} onChange={(e) => setNewPayment(prev => ({...prev, lyDo: e.target.value}))} />
                                    </FormRow>
                                </div>
                                <FormRow icon={<Landmark className="w-4 h-4" />} label="Hình thức">
                                    <CustomSelect value={newPayment.hinhThuc} onChange={(e) => setNewPayment(prev => ({...prev, hinhThuc: e.target.value}))} options={[{value: 'CK qua VCB', label: 'CK qua VCB'}, {value: 'CK qua BIDV', label: 'CK qua BIDV'}, {value: 'Tiền mặt', label: 'Tiền mặt'}]} />
                                </FormRow>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 mt-4 pt-3 border-t dark:border-gray-600 flex-shrink-0">
                        <button onClick={handleSaveAndPrint} disabled={isSaving} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 text-sm">
                            {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                             In phiếu
                        </button>
                        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 text-sm">
                            {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Lưu
                        </button>
                        <Dialog.Close asChild>
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 text-sm">Thoát</button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default ApplicantFeeModal;