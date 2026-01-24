/*
* D:\QLDT-app\client\src\features\admissions\ApplicantModal.jsx
* Phiên bản cập nhật: 16/08/2025
* Tóm tắt những nội dung cập nhật:
* - SỬA LỖI TRIỆT ĐỂ: Khắc phục lỗi logic cốt lõi khiến trạng thái "Trúng tuyển" không hiển thị khi cập nhật.
* + Tái cấu trúc logic tính toán điểm xét tuyển bằng `useMemo` và thêm một `useEffect` để hợp nhất dữ liệu một cách an toàn, phá vỡ vòng lặp cập nhật state không mong muốn.
* + Giờ đây, ký hiệu trúng tuyển sẽ hiển thị chính xác trong cả danh sách nguyện vọng và phần radio button.
* - Giữ nguyên các bản sửa lỗi và cải tiến trước đó.
*/
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { X, Save, User, Hash, VenetianMask, Cake, MapPin, Flag, Shield, Phone, Mail, Map, Home, School, BookOpen, Calendar, UserCheck, FileText, StickyNote, Building, Loader, Folder, Info, Briefcase, FilePlus, PlusCircle, Trash2, CheckCircle, CircleOff, Printer } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import { cn } from '../../lib/utils';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import useAuthStore from '../../store/authStore';
import { generateAdmissionReceiptPDF, getQrCodeData } from './AdmissionReceiptGenerator';

// --- Component con & Hàm hỗ trợ ---
const FormRow = ({ label, icon, required, children, className }) => (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center py-2.5", className)}>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center md:col-span-1">
            {icon}
            <span className="ml-2">{label}</span>
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="md:col-span-2">{children}</div>
    </div>
);
const Input = (props) => <input {...props} className={cn("w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none", props.className)} />;
const Select = (props) => <select {...props} className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none">{props.children}</select>;
const Textarea = (props) => <textarea {...props} rows={2} className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none" />;
const RadioGroup = ({ name, value, onChange, options }) => (
    <div className="flex items-center gap-6">
        {options.map(opt => (
            <label key={opt.value} className="flex items-center cursor-pointer">
                <input type="radio" name={name} value={opt.value} checked={String(value) === opt.value} onChange={onChange} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                <span className="ml-2 text-sm">{opt.label}</span>
            </label>
        ))}
    </div>
);
const Checkbox = ({ name, label, checked, onChange, disabled }) => (
    <label className={cn("flex items-center cursor-pointer", disabled && "opacity-50 cursor-not-allowed")}>
        <input type="checkbox" name={name} checked={!!checked} onChange={onChange} disabled={disabled} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-200" />
        <span className="ml-2 text-sm text-gray-800 dark:text-gray-200">{label}</span>
    </label>
);
const Fieldset = ({ legend, children, className }) => (
    <fieldset className={cn("border border-gray-300 dark:border-gray-600 rounded-md p-4", className)}>
        <legend className="px-2 text-sm font-semibold text-primary dark:text-blue-400">{legend}</legend>
        <div className="space-y-4">{children}</div>
    </fieldset>
);

const capitalizeWords = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/(^|\s)\S/g, (L) => L.toUpperCase());
};

const removeAccents = (str) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};


const initialFormData = {
    Holot: '', Ten: '', Gioitinh: false, Ngaysinh: '',
    Noisinh: 'Tỉnh Cà Mau', MaDT: '', MaTG: '', MaDTCS: '',
    Dienthoai: '', Email: '', Diachi: '', Hokhau: '',
    Fld01: '', NamTN: new Date().getFullYear(), MaTHPT: '', MaKV: '',
    SoCMND: '', NgaycapCMND: '', NoicapCMND: '',
    Ghichu: '', Trungtuyen: null, Nhaphoc: null,
    hs1: true, hs2: false, hs3: false, hs12: false, hs11: false, hs13: '',
    hs4: false, hs5: false, hs8: false,
    hs15: false, hs16: false, hs14: false,
    hs6: false, hs7: false, hs9: false,
    NopOnline: true, SoDT: '', MaTiepCan: '', GhichuHoSo: '',
    NguoiXT: null, NgayXT: null, NguoiRasoat: null, NgayRasoat: null,
    NguoiNhan: null, NgayNhan: null, NguoiSua: null, NgaySua: null
};

const ApplicantModal = ({ isOpen, onClose, mode, applicantId, periodInfo, onSaveSuccess }) => {
    const isEditMode = mode === 'edit';
    const [activeTab, setActiveTab] = useState('info');
    const [formData, setFormData] = useState(initialFormData);
    
    const [aspirations, setAspirations] = useState([]);
    const [scores, setScores] = useState([]);
    const [dependencies, setDependencies] = useState({ 
        noiSinhList: [], danTocList: [], tonGiaoList: [], dtcsList: [], 
        trinhDoList: [], truongPTList: [], noiCapList: [], tiepCanList: [],
        khuvucList: [], nganhHocList: [], toHopList: [], tieuChiList: [], 
        nganhToHopMapping: [], toHopMonMapping: [],
        existingScores: []
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);

    const isAdmissionLocked = useMemo(() => formData.Trungtuyen === 1, [formData.Trungtuyen]);
    const canSetAdmission = useMemo(() => moment().isSameOrAfter(moment(periodInfo.NgayXetTuyen), 'day'), [periodInfo.NgayXetTuyen]);
    const { user } = useAuthStore();

    const fetchApplicantData = useCallback(async () => {
        if (!isEditMode || !applicantId) return;
        try {
            const res = await axiosInstance.get(`/admissions/applicant/${applicantId}`);
            const data = { ...res.data };
            data.Ngaysinh = data.Ngaysinh ? moment(data.Ngaysinh).format('YYYY-MM-DD') : '';
            data.NgaycapCMND = data.NgaycapCMND ? moment(data.NgaycapCMND).format('YYYY-MM-DD') : '';
            setFormData(prev => ({ ...initialFormData, ...data }));

            const aspirationsRes = await axiosInstance.get('/admissions/aspirations-dependencies', { 
                params: { maDXT: periodInfo.MaDXT, maTSXT: applicantId }
            });
            const { existingAspirations } = aspirationsRes.data;
            setAspirations(existingAspirations.length > 0 ? existingAspirations : [{ MaNVXT: 1, MaNG: '', MaTHXT: '003', MaTCXT: '' }]);
        } catch (error) {
            toast.error("Lỗi khi tải lại dữ liệu thí sinh.");
        }
    }, [isEditMode, applicantId, periodInfo.MaDXT]);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setFormData({ ...initialFormData, NamTN: new Date().getFullYear() });
            setAspirations([]);
            setScores([]);
            setIsDirty(false);
            
            const fetchDependencies = async () => {
                try {
                    const p1 = axiosInstance.get('/admissions/form-dependencies');
                    const p2 = axiosInstance.get('/admissions/aspirations-dependencies', { 
                        params: { maDXT: periodInfo.MaDXT, maTSXT: isEditMode ? applicantId : null }
                    });
                    const [res1, res2] = await Promise.all([p1, p2]);
                    const deps = { ...res1.data, ...res2.data };
                    setDependencies(deps);

                    if (isEditMode && applicantId) {
                        await fetchApplicantData();
                    } else { 
                        setFormData(prev => ({
                            ...prev,
                            MaDT: deps.danTocList[0]?.MaDT || '',
                            MaTG: deps.tonGiaoList[0]?.MaTG || '',
                            MaDTCS: deps.dtcsList[0]?.MaDTCS || '',
                        }));
                        const defaultTieuChi = deps.tieuChiList?.[0]?.MaTCXT || '';
                        setAspirations([{ MaNVXT: 1, MaNG: '', MaTHXT: '003', MaTCXT: defaultTieuChi }]);
                    }
                } catch (error) {
                    toast.error("Lỗi tải dữ liệu cần thiết cho form.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDependencies();
        }
    }, [isOpen, isEditMode, applicantId, periodInfo.MaDXT, fetchApplicantData]);

    useEffect(() => {
        const firstAspiration = aspirations[0];
        if (firstAspiration && firstAspiration.MaTHXT && dependencies.toHopMonMapping.length > 0) {
            const newScores = dependencies.toHopMonMapping
                .filter(m => m.MaTHXT === firstAspiration.MaTHXT)
                .map(m => {
                    const existingScore = dependencies.existingScores.find(s => s.MaMXT === m.MaMXT);
                    const diem = existingScore ? (parseFloat(String(existingScore.Diem).replace(',', '.'))).toFixed(1).replace('.', ',') : '0,0';
                    return {
                        MaMXT: m.MaMXT,
                        MonXT: m.MonXT,
                        Diem: diem,
                        Ghichu: existingScore ? existingScore.Ghichu : ''
                    };
                });
            setScores(newScores);
        } else {
            setScores([]);
        }
    }, [aspirations[0]?.MaTHXT, dependencies.toHopMonMapping, dependencies.existingScores]);
    
    const calculatedScores = useMemo(() => {
        const totalScore = scores.reduce((sum, score) => {
            const diemValue = parseFloat(String(score.Diem).replace(',', '.')) || 0;
            return sum + diemValue;
        }, 0);

        const khuvucBonus = dependencies.khuvucList.find(k => k.MaKV === formData.MaKV)?.DiemUT || 0;
        const dtcsBonus = dependencies.dtcsList.find(d => d.MaDTCS === formData.MaDTCS)?.DiemUT || 0;
        const priorityBonus = khuvucBonus + dtcsBonus;

        let diemUT = priorityBonus;
        if (totalScore >= 22.5) {
            diemUT = ((30 - totalScore) / 7.5) * priorityBonus;
        }
        diemUT = Math.round(diemUT * 100) / 100;

        const tongDXT = Math.round((totalScore + diemUT) * 100) / 100;
        const dtbxt = Math.round(((totalScore / 3) + diemUT) * 100) / 100;

        return { diemUT, tongDXT, dtbxt };
    }, [scores, formData.MaKV, formData.MaDTCS, dependencies.khuvucList, dependencies.dtcsList]);

    // SỬA LỖI: Hợp nhất điểm đã tính vào state aspirations một cách an toàn
    useEffect(() => {
        if (aspirations.length > 0) {
            setAspirations(prevAspirations =>
                prevAspirations.map(asp => ({
                    ...asp,
                    TongDXT: calculatedScores.tongDXT,
                    DTBXT: calculatedScores.dtbxt,
                }))
            );
        }
    }, [calculatedScores]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let val = type === 'checkbox' ? checked : (type === 'radio' ? (value === 'true') : value);
        setFormData(prev => ({ ...prev, [name]: val }));
        setIsDirty(true);
    };
    
    const handleNumericChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value.replace(/[^0-9]/g, '') }));
        setIsDirty(true);
    };

    const handleTruongChange = (e) => {
        const maTHPT = e.target.value;
        const selectedTruong = dependencies.truongPTList.find(t => t.MaTHPT === maTHPT);
        setFormData(prev => ({ ...prev, MaTHPT: maTHPT, MaKV: selectedTruong ? selectedTruong.MaKV : '' }));
        setIsDirty(true);
    };

    const handleClose = () => {
        if (isDirty && !isAdmissionLocked) setIsConfirmCloseOpen(true);
        else onClose();
    };
    
    const validateAndPreparePayload = () => {
        if (!formData.Holot || !formData.Ten || !formData.Ngaysinh || !formData.Diachi || !formData.Fld01 || !formData.NamTN || !formData.MaTHPT) {
            toast.error("Vui lòng điền đầy đủ các trường thông tin bắt buộc (*).");
            setActiveTab('info');
            return null;
        }
        if (aspirations.length === 0 || !aspirations[0].MaNG) {
            toast.error("Vui lòng chọn ít nhất Nguyện vọng 1.");
            setActiveTab('docs');
            return null;
        }
        
        return { 
            ...formData, 
            MaDXT: periodInfo.MaDXT, 
            Holot: capitalizeWords(formData.Holot), 
            Ten: capitalizeWords(formData.Ten),
            aspirations,
            scores
        };
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const payload = validateAndPreparePayload();
        if (!payload) return;

        setIsSaving(true);
        const promise = isEditMode
            ? axiosInstance.put(`/admissions/applicant/${applicantId}`, payload)
            : axiosInstance.post('/admissions/applicant', payload);

        toast.promise(promise, {
            loading: 'Đang lưu dữ liệu...',
            success: (res) => {
                setIsSaving(false);
                onSaveSuccess();
                return res.data.message;
            },
            error: (err) => {
                setIsSaving(false);
                return err.response?.data?.message || "Có lỗi xảy ra.";
            }
        });
    };

    const handleSaveAndPrint = async () => {
        const payload = validateAndPreparePayload();
        if (!payload) return;

        const pdfWindow = window.open('', '_blank');
        if (!pdfWindow) {
            toast.error("Vui lòng cho phép pop-up để xem phiếu.");
            return;
        }
        pdfWindow.document.write('<html><head><title>Đang tạo phiếu...</title></head><body><p>Vui lòng chờ trong khi phiếu đang được tạo...</p></body></html>');

        setIsSaving(true);
        try {
            const res = isEditMode
                ? await axiosInstance.put(`/admissions/applicant/${applicantId}`, payload)
                : await axiosInstance.post('/admissions/applicant', payload);
            
            toast.success(res.data.message);
            
            const finalApplicantData = { ...formData, ...res.data.newApplicant };

            const tenKhongDau = removeAccents(`${finalApplicantData.Holot} ${finalApplicantData.Ten}`);
            const addInfo = `${finalApplicantData.Maso}-${tenKhongDau}-LPXT`.replace(/\s/g, '%20');

            const qrCodeData = await getQrCodeData(addInfo);

            const pdfBlob = generateAdmissionReceiptPDF({
                applicant: finalApplicantData,
                periodInfo: periodInfo,
                aspirations: payload.aspirations,
                nganhHocList: dependencies.nganhHocList,
                currentUser: user.hoTen
            }, qrCodeData);

            if (pdfBlob) {
                const pdfUrl = URL.createObjectURL(pdfBlob);
                pdfWindow.location.href = pdfUrl;
            } else {
                pdfWindow.close();
            }

            onSaveSuccess();

        } catch (err) {
            toast.error(err.response?.data?.message || "Có lỗi xảy ra khi lưu hoặc in phiếu.");
            if (pdfWindow) pdfWindow.close();
        } finally {
            setIsSaving(false);
        }
    };

    const handleAspirationChange = (index, field, value) => {
        const newAspirations = [...aspirations];
        newAspirations[index][field] = value;

        if (field === 'MaNG') {
            const validToHop = dependencies.nganhToHopMapping.find(m => m.MaNG === value);
            newAspirations[index].MaTHXT = validToHop ? validToHop.MaTHXT : '003';
        }

        setAspirations(newAspirations);
        setIsDirty(true);
    };

    const addAspiration = () => {
        if (aspirations.length < 3) {
            const defaultTieuChi = dependencies.tieuChiList?.[0]?.MaTCXT || '';
            setAspirations([...aspirations, { 
                MaNVXT: aspirations.length + 1, 
                MaNG: '', 
                MaTHXT: '003', 
                MaTCXT: defaultTieuChi
            }]);
            setIsDirty(true);
        }
    };

    const removeAspiration = (index) => {
        const newAspirations = aspirations.filter((_, i) => i !== index)
            .map((asp, idx) => ({ ...asp, MaNVXT: idx + 1 }));
        setAspirations(newAspirations);
        setIsDirty(true);
    };

    const handleScoreChange = (index, field, value) => {
        const newScores = [...scores];
        if (field === 'Diem') {
            newScores[index][field] = value;
        } else {
            newScores[index][field] = value;
        }
        setScores(newScores);
        setIsDirty(true);
    };
    
    const handleScoreBlur = (index) => {
        const newScores = [...scores];
        const score = newScores[index];
        
        const standardizedValue = String(score.Diem).replace(',', '.');
        
        let numericValue = parseFloat(standardizedValue);
        if (isNaN(numericValue)) {
            numericValue = 0;
        }

        if (numericValue < 0) numericValue = 0;
        if (numericValue > 10) numericValue = 10;
        
        newScores[index].Diem = numericValue.toFixed(1).replace('.', ',');
        setScores(newScores);
    };

    const handleSetAdmission = async (maNVXT) => {
        if (formData.Nhaphoc === 1) {
            toast.error("Thí sinh đã nhập học. Vui lòng bỏ xác nhận nhập học trước khi thay đổi nguyện vọng trúng tuyển.");
            return;
        }

        const toastId = toast.loading('Đang cập nhật trạng thái trúng tuyển...');
        try {
            await axiosInstance.put(`/admissions/applicant/${applicantId}/set-admission`, { maNVXT });
            toast.success('Cập nhật thành công!', { id: toastId });
            await fetchApplicantData();
            setIsDirty(true);
        } catch (error) {
            toast.error(error.response?.data?.message || "Cập nhật thất bại.", { id: toastId });
        }
    };

    const handleSetEnrollment = async (e) => {
        const isEnrolled = e.target.checked;
        const toastId = toast.loading('Đang cập nhật trạng thái nhập học...');
        try {
            await axiosInstance.put(`/admissions/applicant/${applicantId}/set-enrollment`, { isEnrolled });
            toast.success('Cập nhật thành công!', { id: toastId });
            await fetchApplicantData();
            setIsDirty(true);
        } catch (error) {
            toast.error(error.response?.data?.message || "Cập nhật thất bại.", { id: toastId });
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-black/60 fixed inset-0 z-50" />
                <Dialog.Content onInteractOutside={(e) => { if (isDirty && !isAdmissionLocked) e.preventDefault(); }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-xl z-50 w-[95vw] max-w-5xl max-h-[90vh] flex flex-col">
                    <Dialog.Title className="p-4 border-b border-gray-200 dark:border-gray-700 text-lg font-bold text-primary dark:text-white flex justify-between items-center">
                        <div>
                            {isEditMode ? 'CẬP NHẬT HỒ SƠ THÍ SINH' : 'NHẬN HỒ SƠ THÍ SINH'}
                            <p className="text-sm font-normal text-gray-500">Đợt tuyển sinh: {periodInfo?.DotXT}</p>
                        </div>
                        <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X size={20}/></button>
                    </Dialog.Title>
                    
                    {isLoading ? (
                        <div className="flex-grow flex items-center justify-center"><Loader className="w-8 h-8 animate-spin text-blue-500"/></div>
                    ) : (
                    <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col overflow-hidden">
                        <Tabs.List className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
                            <Tabs.Trigger value="info" className={cn("px-4 py-2 text-sm font-medium", activeTab === 'info' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500')}>Thông tin thí sinh</Tabs.Trigger>
                            <Tabs.Trigger value="docs" className={cn("px-4 py-2 text-sm font-medium", activeTab === 'docs' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500')}>Hồ sơ và Nguyện vọng</Tabs.Trigger>
                        </Tabs.List>
                        <form id="applicantForm" onSubmit={handleSave} className="flex-grow overflow-y-auto">
                            <Tabs.Content value="info" className="p-4 md:p-6 space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                    <FormRow label="Mã thí sinh" icon={<Hash size={16}/>}><Input name="Maso" value={formData.Maso || ''} readOnly disabled className="bg-gray-200 dark:bg-gray-600"/></FormRow>
                                    <FormRow label="ID" icon={<UserCheck size={16}/>}><Input name="MaTSXT" value={formData.MaTSXT || ''} readOnly disabled className="bg-gray-200 dark:bg-gray-600"/></FormRow>
                                    <FormRow label="Họ lót" icon={<User size={16}/>} required><Input name="Holot" value={formData.Holot} onChange={handleChange} /></FormRow>
                                    <FormRow label="Tên" icon={<User size={16}/>} required><Input name="Ten" value={formData.Ten} onChange={handleChange} /></FormRow>
                                    <FormRow label="Giới tính" icon={<VenetianMask size={16}/>}>
                                        <RadioGroup name="Gioitinh" value={formData.Gioitinh} onChange={handleChange} options={[{value: 'false', label: 'Nam'}, {value: 'true', label: 'Nữ'}]} />
                                    </FormRow>
                                    <FormRow label="Ngày sinh" icon={<Cake size={16}/>} required><Input type="date" name="Ngaysinh" value={formData.Ngaysinh} onChange={handleChange} /></FormRow>
                                    <FormRow label="Nơi sinh" icon={<MapPin size={16}/>}>
                                        <Select name="Noisinh" value={formData.Noisinh} onChange={handleChange}>
                                            {dependencies.noiSinhList.map(item => <option key={item} value={item}>{item}</option>)}
                                        </Select>
                                    </FormRow>
                                    <FormRow label="Dân tộc" icon={<Flag size={16}/>}>
                                        <Select name="MaDT" value={formData.MaDT} onChange={handleChange}>
                                            {dependencies.danTocList.map(item => <option key={item.MaDT} value={item.MaDT}>{item.Dantoc}</option>)}
                                        </Select>
                                    </FormRow>
                                    <FormRow label="Tôn giáo" icon={<Shield size={16}/>}>
                                        <Select name="MaTG" value={formData.MaTG} onChange={handleChange}>
                                            {dependencies.tonGiaoList.map(item => <option key={item.MaTG} value={item.MaTG}>{item.Tongiao}</option>)}
                                        </Select>
                                    </FormRow>
                                    <FormRow label="ĐT Chính sách" icon={<UserCheck size={16}/>}>
                                        <Select name="MaDTCS" value={formData.MaDTCS} onChange={handleChange}>
                                            {dependencies.dtcsList.map(item => <option key={item.MaDTCS} value={item.MaDTCS}>{item.DTCS}</option>)}
                                        </Select>
                                    </FormRow>
                                    <FormRow label="Điện thoại" icon={<Phone size={16}/>}><Input name="Dienthoai" value={formData.Dienthoai} onChange={handleNumericChange} /></FormRow>
                                    <FormRow label="Email" icon={<Mail size={16}/>}><Input type="email" name="Email" value={formData.Email} onChange={handleChange} /></FormRow>
                                    <FormRow label="Địa chỉ liên lạc" icon={<Map size={16}/>} required><Textarea name="Diachi" value={formData.Diachi} onChange={handleChange} /></FormRow>
                                    <FormRow label="Hộ khẩu" icon={<Home size={16}/>}><Textarea name="Hokhau" value={formData.Hokhau} onChange={handleChange} /></FormRow>
                                    <FormRow label="Trình độ VH" icon={<BookOpen size={16}/>} required>
                                        <Select name="Fld01" value={formData.Fld01} onChange={handleChange}>
                                            <option value="">-- Chọn trình độ --</option>
                                            {dependencies.trinhDoList.map(item => <option key={item} value={item}>{item}</option>)}
                                        </Select>
                                    </FormRow>
                                    <FormRow label="Năm TN" icon={<Calendar size={16}/>} required><Input type="number" name="NamTN" value={formData.NamTN} onChange={handleChange} /></FormRow>
                                    <FormRow label="Trường PT" icon={<School size={16}/>} required>
                                        <Select name="MaTHPT" value={formData.MaTHPT} onChange={handleTruongChange}>
                                            <option value="">-- Chọn trường PT --</option>
                                            {dependencies.truongPTList.map(item => <option key={item.MaTHPT} value={item.MaTHPT}>{item.TruongTHPT}</option>)}
                                        </Select>
                                    </FormRow>
                                    <FormRow label="Khu vực" icon={<MapPin size={16}/>}><Input name="MaKV" value={formData.MaKV || ''} readOnly disabled className="bg-gray-200 dark:bg-gray-600"/></FormRow>
                                    <FormRow label="Số CCCD" icon={<FileText size={16}/>}><Input name="SoCMND" value={formData.SoCMND} onChange={handleNumericChange} /></FormRow>
                                    <FormRow label="Ngày cấp" icon={<Calendar size={16}/>}><Input type="date" name="NgaycapCMND" value={formData.NgaycapCMND} onChange={handleChange} /></FormRow>
                                    <FormRow label="Nơi cấp" icon={<Building size={16}/>}>
                                        <Select name="NoicapCMND" value={formData.NoicapCMND} onChange={handleChange}>
                                            <option value="">-- Chọn nơi cấp CCCD --</option>
                                            {dependencies.noiCapList.map(item => <option key={item} value={item}>{item}</option>)}
                                        </Select>
                                    </FormRow>
                                    <FormRow label="Ghi chú" icon={<StickyNote size={16}/>}><Textarea name="Ghichu" value={formData.Ghichu} onChange={handleChange} /></FormRow>
                                </div>
                            </Tabs.Content>
                            <Tabs.Content value="docs" className="p-4 md:p-6 space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Fieldset legend="Hồ sơ chung & Thông tin bổ sung" className="lg:col-span-1">
                                        <h4 className="font-semibold text-gray-600 dark:text-gray-300">Hồ sơ chung</h4>
                                        <div className="pl-4 space-y-4">
                                            <Checkbox name="hs1" label="1. Phiếu đăng ký dự tuyển" checked={formData.hs1} onChange={handleChange} />
                                            <Checkbox name="hs2" label="2. Sơ yếu lý lịch" checked={formData.hs2} onChange={handleChange} />
                                            <Checkbox name="hs3" label="3. Giấy khai sinh" checked={formData.hs3} onChange={handleChange} />
                                            <Checkbox name="hs12" label="4. CMND/CCCD" checked={formData.hs12} onChange={handleChange} />
                                            <Checkbox name="hs11" label="5. 02 ảnh màu (3x4)" checked={formData.hs11} onChange={handleChange} />
                                            <Input name="hs13" placeholder="6. Giấy ƯT..." value={formData.hs13 || ''} onChange={handleChange} />
                                        </div>
                                        <hr className="my-4 border-gray-300 dark:border-gray-600"/>
                                        <h4 className="font-semibold text-gray-600 dark:text-gray-300">Thông tin bổ sung</h4>
                                        <div className="pl-4 space-y-4">
                                            <Checkbox name="NopOnline" label="Đăng ký online" checked={formData.NopOnline} onChange={handleChange} />
                                            <Input name="SoDT" placeholder="Điện thoại PH..." value={formData.SoDT || ''} onChange={handleNumericChange} />
                                            <Select name="MaTiepCan" value={formData.MaTiepCan || ''} onChange={handleChange}>
                                                <option value="">-- Chọn kênh thí sinh biết --</option>
                                                {dependencies.tiepCanList.map(item => <option key={item.MaTiepCan} value={item.MaTiepCan}>{item.TenTiepCan}</option>)}
                                            </Select>
                                            <Textarea name="GhichuHoSo" placeholder="Ghi chú hồ sơ..." value={formData.GhichuHoSo || ''} onChange={handleChange} />
                                        </div>
                                    </Fieldset>
                                    <Fieldset legend="Hồ sơ theo trình độ" className="lg:col-span-1">
                                        <h4 className="font-semibold text-gray-600 dark:text-gray-300">Cao đẳng</h4>
                                        <div className="pl-4 space-y-4">
                                            <Checkbox name="hs4" label="C1. Bằng TN THPT" checked={formData.hs4} onChange={handleChange} />
                                            <Checkbox name="hs5" label="C2. GiấyCN TN THPT" checked={formData.hs5} onChange={handleChange} />
                                            <Checkbox name="hs8" label="C3. Học bạ THPT" checked={formData.hs8} onChange={handleChange} />
                                        </div>
                                        <hr className="my-4 border-gray-300 dark:border-gray-600"/>
                                        <h4 className="font-semibold text-gray-600 dark:text-gray-300">Liên thông</h4>
                                        <div className="pl-4 space-y-4">
                                            <Checkbox name="hs15" label="L1. Bằng Trung cấp" checked={formData.hs15} onChange={handleChange} />
                                            <Checkbox name="hs16" label="L2. Bảng điểm THPT" checked={formData.hs16} onChange={handleChange} />
                                            <Checkbox name="hs14" label="L3. Học bạ THPT" checked={formData.hs14} onChange={handleChange} />
                                        </div>
                                        <hr className="my-4 border-gray-300 dark:border-gray-600"/>
                                        <h4 className="font-semibold text-gray-600 dark:text-gray-300">Trung cấp</h4>
                                        <div className="pl-4 space-y-4">
                                            <Checkbox name="hs6" label="T1. Bằng TN THCS" checked={formData.hs6} onChange={handleChange} />
                                            <Checkbox name="hs7" label="T2. GiấyCN TN THCS" checked={formData.hs7} onChange={handleChange} />
                                            <Checkbox name="hs9" label="T3. Học bạ THCS" checked={formData.hs9} onChange={handleChange} />
                                        </div>
                                    </Fieldset>
                                </div>
                                
                                <div className="mt-6 border-t dark:border-gray-700 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-lg">Nguyện vọng xét tuyển</h3>
                                        <button type="button" onClick={addAspiration} disabled={isAdmissionLocked || aspirations.length >= 3} className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 disabled:opacity-50">
                                            <PlusCircle size={14} /> Thêm NV
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-12 gap-2 px-2 pb-1 text-xs font-bold text-gray-600 dark:text-gray-300">
                                            <div className="col-span-1 text-center">STT</div>
                                            <div className="col-span-3">Ngành học</div>
                                            <div className="col-span-2">Tổ hợp</div>
                                            <div className="col-span-2">Tiêu chí</div>
                                            <div className="col-span-1 text-center">Tổng ĐXT</div>
                                            <div className="col-span-1 text-center">ĐTB XT</div>
                                            <div className="col-span-1 text-center">Trúng tuyển</div>
                                            <div className="col-span-1"></div>
                                        </div>
                                        {aspirations.map((asp, index) => {
                                            const availableToHop = dependencies.toHopList.filter(
                                                th => dependencies.nganhToHopMapping.some(m => m.MaNG === asp.MaNG && m.MaTHXT === th.MaTHXT)
                                            );

                                            return (
                                                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                                    <div className="col-span-1 font-bold text-center">{asp.MaNVXT}</div>
                                                    <div className="col-span-3">
                                                        <Select value={asp.MaNG} onChange={(e) => handleAspirationChange(index, 'MaNG', e.target.value)} disabled={isAdmissionLocked}>
                                                            <option value="">-- Chọn ngành học --</option>
                                                            {dependencies.nganhHocList.map(n => <option key={n.MaNG} value={n.MaNG}>{n.Tennganh}</option>)}
                                                        </Select>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Select value={asp.MaTHXT} onChange={(e) => handleAspirationChange(index, 'MaTHXT', e.target.value)} disabled={!asp.MaNG || isAdmissionLocked}>
                                                            {availableToHop.map(t => <option key={t.MaTHXT} value={t.MaTHXT}>{t.TohopXT}</option>)}
                                                        </Select>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Select value={asp.MaTCXT} onChange={(e) => handleAspirationChange(index, 'MaTCXT', e.target.value)} disabled={isAdmissionLocked}>
                                                            {dependencies.tieuChiList.map(t => <option key={t.MaTCXT} value={t.MaTCXT}>{t.TieuchiXT}</option>)}
                                                        </Select>
                                                    </div>
                                                    <div className="col-span-1"><Input value={asp.TongDXT?.toFixed(2).replace('.', ',') || '0,00'} readOnly disabled className="bg-gray-200 dark:bg-gray-600 text-center"/></div>
                                                    <div className="col-span-1"><Input value={asp.DTBXT?.toFixed(2).replace('.', ',') || '0,00'} readOnly disabled className="bg-gray-200 dark:bg-gray-600 text-center"/></div>
                                                    <div className="col-span-1 text-center">
                                                        {asp.Trungtuyen === 1 && <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />}
                                                    </div>
                                                    <div className="col-span-1 text-center">
                                                        {aspirations.length > 1 && (
                                                            <button type="button" onClick={() => removeAspiration(index)} disabled={isAdmissionLocked} className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                <Fieldset legend="Điểm xét tuyển (theo NV1)" className="mt-6">
                                    <div className="space-y-2">
                                        {scores.length > 0 ? scores.map((score, index) => (
                                            <div key={score.MaMXT} className="grid grid-cols-5 gap-2 items-center">
                                                <label className="col-span-2 font-medium text-sm">
                                                    {score.MonXT}
                                                </label>
                                                <div className="col-span-1">
                                                    <Input 
                                                        type="text" 
                                                        value={score.Diem} 
                                                        onChange={(e) => handleScoreChange(index, 'Diem', e.target.value)} 
                                                        onBlur={() => handleScoreBlur(index)}
                                                        className="text-right"
                                                        disabled={isAdmissionLocked}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Input 
                                                        placeholder="Ghi chú..." 
                                                        value={score.Ghichu}
                                                        onChange={(e) => handleScoreChange(index, 'Ghichu', e.target.value)} 
                                                        disabled={isAdmissionLocked}
                                                    />
                                                </div>
                                            </div>
                                        )) : <p className="text-sm text-gray-500 text-center mt-4">Vui lòng chọn Ngành và Tổ hợp ở Nguyện vọng 1 để nhập điểm.</p>}
                                    </div>
                                </Fieldset>

                                <Fieldset legend="Xét tuyển và Nhập học" className="mt-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Xét tuyển</h4>
                                            {isEditMode ? (
                                                <div className={cn(!canSetAdmission && "opacity-60")}>
                                                    {!canSetAdmission && <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">Chưa đến ngày xét tuyển ({moment(periodInfo.NgayXetTuyen).format('DD/MM/YYYY')}).</p>}
                                                    {isAdmissionLocked && <p className="text-xs text-green-600 dark:text-green-400 mb-2">Thí sinh đã được xét trúng tuyển.</p>}
                                                    
                                                    <div className="space-y-2">
                                                        {aspirations.map(asp => (
                                                            <label key={asp.MaNVXT} className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                                                <input 
                                                                    type="radio" 
                                                                    name="admissionChoice"
                                                                    value={asp.MaNVXT}
                                                                    checked={asp.Trungtuyen === 1}
                                                                    onChange={() => handleSetAdmission(asp.MaNVXT)}
                                                                    disabled={!canSetAdmission || isAdmissionLocked}
                                                                    className="h-4 w-4 text-blue-600 border-gray-400 focus:ring-blue-500"
                                                                />
                                                                <span className="ml-3 text-sm">
                                                                    <strong>NV{asp.MaNVXT}:</strong> {dependencies.nganhHocList.find(n => n.MaNG === asp.MaNG)?.Tennganh || 'N/A'}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleSetAdmission(null)} 
                                                        disabled={!canSetAdmission || !isAdmissionLocked}
                                                        className="mt-2 text-xs flex items-center gap-1 text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <CircleOff size={14} /> Bỏ trúng tuyển
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">Chức năng chỉ khả dụng ở chế độ Cập nhật.</p>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Nhập học</h4>
                                            {isEditMode ? (
                                                <div className="mt-4">
                                                    <Checkbox 
                                                        name="nhaphoc"
                                                        label="Xác nhận nhập học"
                                                        checked={formData.Nhaphoc === 1}
                                                        onChange={handleSetEnrollment}
                                                        disabled={!isAdmissionLocked}
                                                    />
                                                    {!isAdmissionLocked && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 ml-6">Thí sinh phải trúng tuyển trước.</p>}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">Chức năng chỉ khả dụng ở chế độ Cập nhật.</p>
                                            )}
                                        </div>
                                    </div>
                                </Fieldset>
                            </Tabs.Content>
                        </form>
                    </Tabs.Root>
                    )}
                    <div className="flex-shrink-0 p-4 flex justify-between items-center gap-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                            {formData.NguoiNhan && <span>Người nhận: <strong>{formData.NguoiNhan}</strong> - {formData.NgayNhan ? moment(formData.NgayNhan).format('DD/MM/YYYY HH:mm:ss') : ''}</span>}
                            {formData.NguoiSua && <span className="block">Người sửa: <strong>{formData.NguoiSua}</strong> - {formData.NgaySua ? moment(formData.NgaySua).format('DD/MM/YYYY HH:mm:ss') : ''}</span>}
                            {formData.NguoiXT && <span className="block">Xét tuyển: <strong>{formData.NguoiXT}</strong> - {formData.NgayXT ? moment(formData.NgayXT).format('DD/MM/YYYY HH:mm') : ''}</span>}
                            {formData.NguoiRasoat && <span className="block">Nhập học: <strong>{formData.NguoiRasoat}</strong> - {formData.NgayRasoat ? moment(formData.NgayRasoat).format('DD/MM/YYYY HH:mm') : ''}</span>}
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={handleSaveAndPrint} disabled={isSaving || isLoading} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                                {isSaving ? <><Loader size={16} className="animate-spin"/> Đang xử lý...</> : <><Printer size={16}/> In phiếu</>}
                            </button>
                            <button type="submit" form="applicantForm" disabled={isSaving || isLoading || isAdmissionLocked} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                                {isSaving ? <><Loader size={16} className="animate-spin"/> Đang lưu...</> : <><Save size={16}/> Lưu</>}
                            </button>
                            <button type="button" onClick={handleClose} className="px-4 py-2 bg-white text-gray-800 rounded-md hover:bg-gray-100 border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-500">Thoát</button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
            <ConfirmationModal
                open={isConfirmCloseOpen}
                onOpenChange={setIsConfirmCloseOpen}
                onConfirm={() => { setIsConfirmCloseOpen(false); onClose(); }}
                title="Xác nhận thoát"
                description="Dữ liệu đã thay đổi nhưng chưa được lưu. Bạn có chắc chắn muốn thoát?"
            />
        </Dialog.Root>
    );
};

export default ApplicantModal;
