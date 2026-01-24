/*
 * Đường dẫn file: D:\QLDT-app\client\src\features\class-fee-management\SemesterFeeModal.jsx
 * Phiên bản cập nhật: 29/09/2025 (Sửa lỗi API & Tối ưu hóa)
 * Tóm tắt những nội dung cập nhật:
 * - SỬA LỖI API: Thay đổi đường dẫn API từ '/class-management/...' sang
 * '/class-fee-management/...' để khớp với backend.
 * - TỐI ƯU HÓA: Sửa lại logic của các hook useEffect/useCallback để chỉ
 * lấy số phiếu thu một lần duy nhất khi modal mở ra, tránh vòng lặp vô tận.
 */

import React, { useState, useEffect, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader, Users, User, Hash, Cake, History, Banknote, StickyNote, Landmark, Printer, Save, Info, Calendar } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { toast } from 'react-hot-toast';
import moment from 'moment-timezone';
import { cn } from '../../lib/utils';
import useAuthStore from '../../store/authStore';
import { generateReceiptPDF } from './ReceiptGenerator';

// --- Helper Components & Functions ---
const FormRow = ({ icon, label, children }) => ( <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center flex-shrink-0 sm:w-32 mb-1 sm:mb-0">{icon}<span className="ml-2">{label}:</span></label><div className="w-full">{children}</div></div>);
const ReadOnlyInput = ({ value }) => ( <input type="text" value={value || ''} readOnly className="w-full p-1.5 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none text-sm" /> );
const CustomInput = ({ value, onChange, placeholder, type = "text", as: Component = 'input', children, className = "" }) => ( <Component type={type} value={value} onChange={onChange} className={cn("w-full p-1.5 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm", className)} placeholder={placeholder}>{children}</Component> );
const formatCurrency = (value) => { if (value === null || value === undefined) return ''; const num = Number(value); if (isNaN(num)) return ''; if (num === 0) return '0'; return num.toLocaleString('vi-VN'); };

// --- Main Component ---
const SemesterFeeModal = ({ isOpen, onClose, studentData, semesterInfo, classInfo, onSaveSuccess }) => {
    const { user } = useAuthStore();
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [newPayment, setNewPayment] = useState({ soPhieu: '', ngayThu: moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY'), soTien: '', ghiChu: '', lyDo: '', hinhThuc: 'CK qua VCB' });
    const [loading, setLoading] = useState({ history: false, nextReceipt: false });
    const [isSaving, setIsSaving] = useState(false);
    
    // Sửa lỗi: API fetchHistory
    const fetchHistory = useCallback(() => {
        if (!isOpen || !studentData?.MaSV || !semesterInfo?.maHK) return;
        setLoading(prev => ({ ...prev, history: true }));
        // BẮT ĐẦU SỬA LỖI: Đổi đường dẫn API
        axiosInstance.get('/class-fee-management/tuition-history', { params: { maSV: studentData.MaSV, maHK: semesterInfo.maHK, maKT: '555' } })
        // KẾT THÚC SỬA LỖI
            .then(res => setPaymentHistory(res.data.map(item => ({ ...item, Ngaynop: moment(item.Ngaynop).isValid() ? moment(item.Ngaynop).format('DD/MM/YYYY') : '' }))))
            .catch(() => toast.error("Lỗi tải lịch sử thu học phí."))
            .finally(() => setLoading(prev => ({ ...prev, history: false })));
    }, [isOpen, studentData?.MaSV, semesterInfo?.maHK]);

    useEffect(() => {
        if (isOpen) {
            fetchHistory(); // Tải lịch sử trước
            
            // Tối ưu hóa: Lấy số phiếu thu chỉ một lần khi modal mở
            setLoading(prev => ({ ...prev, nextReceipt: true }));
            // BẮT ĐẦU SỬA LỖI: Đổi đường dẫn API
            axiosInstance.get('/class-fee-management/next-receipt-number-by-type', { params: { maLPT: '001' } })
            // KẾT THÚC SỬA LỖI
                .then(res => {
                    // Cập nhật số tiền và lý do sau khi lịch sử đã được tải xong (hoặc ngay lập tức)
                    setPaymentHistory(currentHistory => {
                        const lanThu = (currentHistory.length || 0) + 1;
                        setNewPayment({
                            soPhieu: res.data.nextSoCT,
                            ngayThu: moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY'),
                            soTien: Math.max(0, studentData.HP_ConNo || 0),
                            ghiChu: '',
                            lyDo: lanThu === 1 ? `Học phí: ${semesterInfo.tenHK}` : `Học phí: ${semesterInfo.tenHK} (lần ${lanThu})`,
                            hinhThuc: 'CK qua VCB'
                        });
                        return currentHistory;
                    });
                })
                .catch(() => toast.error("Lỗi khi lấy số phiếu thu."))
                .finally(() => setLoading(prev => ({ ...prev, nextReceipt: false })));
        }
    }, [isOpen, fetchHistory, studentData.HP_ConNo, semesterInfo.tenHK]); // Dependency được tối ưu hóa


    const handleSoTienChange = (e) => { setNewPayment(prev => ({ ...prev, soTien: e.target.value.replace(/[^0-9]/g, '') })); };

    const performSave = async () => {
        const soTienNum = parseInt(newPayment.soTien, 10);
        if (isNaN(soTienNum) || soTienNum <= 0) { toast.error("Vui lòng nhập số tiền thu hợp lệ."); return null; }
        const payload = { maSV: studentData.MaSV, maHK: semesterInfo.maHK, lan: paymentHistory.length + 1, lyDo: newPayment.lyDo, soCT: newPayment.soPhieu, soTien: soTienNum, ngayNop: newPayment.ngayThu, ghiChu: newPayment.ghiChu, hinhThuc: newPayment.hinhThuc, };
        await axiosInstance.post('/log-action', { Cuaso: "Khoản thu Lớp SH", Congviec: "Thu học phí học kỳ", Ghichu: `Thu HP cho SV: ${studentData.Maso}, Số phiếu: ${payload.soCT}, Số tiền: ${payload.soTien.toLocaleString('vi-VN')}, Lý do: ${payload.lyDo}` });
        await axiosInstance.post('/class-fee-management/semester-fee', payload);
        return payload;
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const savedData = await performSave();
            if(savedData) { toast.success("Lưu phiếu thu thành công!"); onSaveSuccess(); onClose(); }
        } catch (error) { toast.error(error.response?.data?.message || "Lưu phiếu thu thất bại."); } 
        finally { setIsSaving(false); }
    };
    
    const handlePrint = async () => {
        setIsSaving(true);
        try {
            const savedData = await performSave();
            if (savedData) {
                toast.success("Lưu thành công, đang tạo biên lai...");
                generateReceiptPDF({
                    soPhieu: savedData.soCT, hoTenSV: `${studentData.Holot} ${studentData.Ten}`, maSoSV: studentData.Maso,
                    ngaySinhSV: moment(studentData.Ngaysinh).format('DD/MM/YYYY'), tenLop: classInfo.tenLop, lyDo: savedData.lyDo,
                    soTien: savedData.soTien, nguoiThu: user.hoTen,
                });
                onSaveSuccess(); onClose();
            }
        } catch (error) { toast.error(error.response?.data?.message || "Thao tác thất bại."); } 
        finally { setIsSaving(false); }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-black/60 fixed inset-0 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 w-[95vw] max-w-3xl p-4 max-h-[90vh] flex flex-col">
                    <Dialog.Title className="text-lg font-bold text-primary dark:text-white text-center flex-shrink-0">THU HỌC PHÍ HỌC KỲ</Dialog.Title>
                    <p className="text-center text-sm font-semibold text-blue-600 mb-2">{semesterInfo.tenHK}</p>
                    <Dialog.Close asChild><button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button></Dialog.Close>
                    <div className="flex-grow overflow-y-auto mt-3 pr-2 -mr-2 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                            <FormRow icon={<Users/>} label="Tên lớp SH"><ReadOnlyInput value={classInfo.tenLop} /></FormRow>
                            <FormRow icon={<User/>} label="Họ và tên SV"><ReadOnlyInput value={`${studentData.Holot} ${studentData.Ten}`} /></FormRow>
                            <FormRow icon={<Hash/>} label="Mã số"><ReadOnlyInput value={studentData.Maso} /></FormRow>
                            <FormRow icon={<Cake/>} label="Ngày sinh"><ReadOnlyInput value={moment(studentData.Ngaysinh).format('DD/MM/YYYY')} /></FormRow>
                        </div>
                        <div className="lg:col-span-2"><h3 className="font-semibold mb-1.5 text-sm flex items-center"><Info/>Chi tiết học phí cần thu</h3><div className="border rounded-md overflow-hidden"><table className="w-full text-xs text-center"><thead className="bg-gray-100 dark:bg-gray-700"><tr><th className="p-1.5">HP Quy định</th><th className="p-1.5">Miễn giảm</th><th className="p-1.5 font-bold">Phải nộp</th><th className="p-1.5">Đã thu</th><th className="p-1.5 font-bold">Còn nợ</th></tr></thead><tbody><tr className="border-t dark:border-gray-600 font-mono text-sm"><td className="p-1.5">{formatCurrency(studentData.HocphiQD)}</td><td className="p-1.5">{formatCurrency(studentData.Miengiam)}</td><td className="p-1.5 font-bold">{formatCurrency(studentData.Phainop)}</td><td className="p-1.5">{formatCurrency(studentData.HP_DaThu)}</td>
                        <td className={cn("p-1.5 font-bold", studentData.HP_ConNo > 0 ? "text-red-600" : "text-green-700 bg-green-100 dark:bg-green-900/50")}>{formatCurrency(studentData.HP_ConNo)}</td>
                        </tr></tbody></table></div></div>
                        <div className="lg:col-span-2"><h3 className="font-semibold mb-1.5 text-sm flex items-center"><History/>Danh sách các lần thu</h3>{loading.history ? <div className="flex justify-center p-4"><Loader className="w-6 h-6 animate-spin"/></div> :<div className="border rounded-md overflow-hidden max-h-32 overflow-y-auto"><table className="w-full text-xs"><thead className="bg-gray-100 dark:bg-gray-700"><tr><th className="p-1.5 text-center">Lần</th><th className="p-1.5 text-center">Số phiếu</th><th className="p-1.5 text-right">Số tiền</th><th className="p-1.5 text-center">Ngày thu</th><th className="p-1.5 text-left">Người thu</th><th className="p-1.5 text-left">Ghi chú</th></tr></thead><tbody>{paymentHistory.map((item) => ( <tr key={item.Lan} className="border-t dark:border-gray-600"><td className="p-1.5 text-center">{item.Lan}</td><td className="p-1.5 text-center">{item.SoCT}</td><td className="p-1.5 text-right">{formatCurrency(item.Sotien)}</td><td className="p-1.5 text-center">{item.Ngaynop}</td><td className="p-1.5">{item.MaUser}</td><td className="p-1.5">{item.Ghichu}</td></tr>))}</tbody></table></div>}</div>
                        <div><h3 className="font-semibold mb-2 border-t dark:border-gray-600 pt-2 text-sm">Chi tiết lần nộp</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2"><FormRow icon={<Hash/>} label="Số phiếu"><ReadOnlyInput value={newPayment.soPhieu} /></FormRow><FormRow icon={<Calendar/>} label="Ngày thu"><ReadOnlyInput value={newPayment.ngayThu} /></FormRow><FormRow icon={<Banknote/>} label="Số tiền thu"><CustomInput type="text" value={formatCurrency(newPayment.soTien)} onChange={handleSoTienChange} className="text-right font-bold text-lg" placeholder="0" /></FormRow><FormRow icon={<StickyNote/>} label="Ghi chú"><CustomInput value={newPayment.ghiChu} onChange={(e) => setNewPayment(p => ({...p, ghiChu: e.target.value}))} /></FormRow><div className="md:col-span-2"><FormRow icon={<StickyNote/>} label="Lý do thu"><ReadOnlyInput value={newPayment.lyDo} /></FormRow></div><FormRow icon={<Landmark/>} label="Hình thức"><CustomInput as="select" value={newPayment.hinhThuc} onChange={(e) => setNewPayment(p => ({...p, hinhThuc: e.target.value}))}><option>CK qua VCB</option><option>CK qua BIDV</option><option>Tiền mặt</option></CustomInput></FormRow></div></div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4 pt-3 border-t dark:border-gray-600 flex-shrink-0">
                        <button onClick={handlePrint} disabled={isSaving} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 text-sm">{isSaving ? <Loader className="w-4 h-4 animate-spin"/> : <Printer className="w-4 h-4" />} In phiếu</button>
                        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 text-sm">{isSaving ? <Loader className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />} Lưu</button>
                        <Dialog.Close asChild><button className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 text-sm">Thoát</button></Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
export default SemesterFeeModal;
