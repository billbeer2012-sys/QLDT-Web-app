/*
* Đường dẫn file: D:\QLDT-app\client\src\pages\UpdateWorkInfoPage.jsx
* Cập nhật: 25/10/2025
 * Tóm tắt: Bổ sung log khi mở trang
 */
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import { UploadCloud, FileText, Download, CheckCircle, XCircle, AlertTriangle, Send, ListX } from 'lucide-react';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import axiosInstance from '../api/axios';
import { cn } from '../lib/utils';
//Bước 1: Bổ sung Import hook
import { usePageLogger } from '../hooks/usePageLogger';

// --- HÀM HỖ TRỢ ---

const createExcelTemplate = () => {
    const headerInstructions = [
        ["HƯỚNG DẪN CẬP NHẬT DỮ LIỆU VIỆC LÀM TỪ FILE EXCEL"],
        ["Vui lòng KHÔNG SỬA ĐỔI cấu trúc của file mẫu này."],
        ["1. Cột 'Maso': Nhập chính xác Mã số sinh viên (bắt buộc)."],
        ["2. Cột 'Noilamviec': Nhập thông tin nơi làm việc. Dữ liệu phải có độ dài tối thiểu 40 ký tự và chứa ít nhất 1 ký tự '|' (gạch đứng) để phân cách thông tin."],
    ];
    const dataHeader = [ "Maso", "Noilamviec" ];
    
    const ws = XLSX.utils.aoa_to_sheet(headerInstructions);
    XLSX.utils.sheet_add_aoa(ws, [dataHeader], { origin: "A5" });

    ws['!merges'] = [ { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } } ]; 
    ws['!cols'] = [ { wch: 20 }, { wch: 80 } ]; 

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mau_CapNhat_ViecLam");
    XLSX.writeFile(wb, "Mau_CapNhat_ViecLam.xlsx");
};

// --- COMPONENT CHÍNH ---

const UpdateWorkInfoPage = () => {
    //Bước 2: Gọi ghi log
	// Tên '...' sẽ được ghi vào cột 'Cuaso'
	usePageLogger('Cập nhật việc làm');

	const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [errorCount, setErrorCount] = useState(0);
    const [isValidFile, setIsValidFile] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const processFile = useCallback((acceptedFile) => {
        setFile(acceptedFile);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 4 });

                const headers = jsonData[0];
                if (headers[0]?.trim() !== 'Maso' || headers[1]?.trim() !== 'Noilamviec') {
                    toast.error("Cấu trúc file không hợp lệ. Vui lòng sử dụng file mẫu.");
                    resetState();
                    return;
                }

                const dataRows = jsonData.slice(1).filter(row => row.length > 0 && row[0]);

                if (dataRows.length === 0) {
                    toast.error("File không có dữ liệu để xử lý.");
                    resetState();
                    return;
                }
                
                let currentErrorCount = 0;
                const validatedData = dataRows.map((row, index) => {
                    const maso = row[0]?.toString().trim() || '';
                    const noilamviec = row[1]?.toString().trim() || '';
                    let status = { valid: true, message: 'Hợp lệ' };

                    if (!maso) {
                        status = { valid: false, message: 'Mã số không được để trống.' };
                    } else if (!noilamviec) {
                        status = { valid: false, message: 'Nơi làm việc không được để trống.' };
                    } else if (noilamviec.length < 40) {
                        status = { valid: false, message: 'Nơi làm việc phải có ít nhất 40 ký tự.' };
                    } else if (!noilamviec.includes('|')) {
                        status = { valid: false, message: 'Nơi làm việc phải chứa ký tự "|".' };
                    }
                    
                    if (!status.valid) {
                        currentErrorCount++;
                    }

                    return {
                        id: index,
                        Maso: maso,
                        Noilamviec: noilamviec,
                        status: status
                    };
                });
                
                setPreviewData(validatedData);
                setErrorCount(currentErrorCount);
                setIsValidFile(currentErrorCount === 0);
            } catch (err) {
                toast.error("Đã xảy ra lỗi khi đọc file. File có thể bị hỏng hoặc không đúng định dạng.");
                console.error(err);
                resetState();
            }
        };
        reader.readAsArrayBuffer(acceptedFile);
    }, []);
    
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            processFile(acceptedFiles[0]);
        }
    }, [processFile]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
        maxFiles: 1,
    });
    
    const resetState = () => {
        setFile(null);
        setPreviewData([]);
        setErrorCount(0);
        setIsValidFile(false);
        setIsLoading(false);
    };

    const handleExportErrors = () => {
        const errorData = previewData
            .filter(row => !row.status.valid)
            .map(row => ({
                'Maso': row.Maso,
                'Noilamviec': row.Noilamviec,
                'Loi': row.status.message
            }));
        
        if (errorData.length === 0) {
            toast.success("Không có lỗi nào để xuất.");
            return;
        }

        const ws = XLSX.utils.json_to_sheet(errorData);
        ws['!cols'] = [ { wch: 20 }, { wch: 80 }, { wch: 50 } ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "BaoCaoLoi");
        XLSX.writeFile(wb, "BaoCaoLoi_CapNhatViecLam.xlsx");
    };

    const handleUpdate = async () => {
        setIsConfirmModalOpen(false);
        setIsLoading(true);

        const dataToSubmit = previewData
            .filter(row => row.status.valid)
            .map(({ Maso, Noilamviec }) => ({ Maso, Noilamviec }));

        try {
            const response = await axiosInstance.post('/update-work-info/students', { students: dataToSubmit });
            toast.success(response.data.message);
            
            // BỔ SUNG: Gọi API ghi log chung
            try {
                const logPayload = {
                    Cuaso: "Cập nhật việc làm",
                    Congviec: "Cập nhật từ file Excel",
                    Ghichu: `Cập nhật thành công cho ${response.data.updatedCount} sinh viên.`
                };
                await axiosInstance.post('/log-action', logPayload);
            } catch (logError) {
                console.error("Ghi log thất bại:", logError);
                // Không cần thông báo lỗi ghi log cho người dùng
            }
            
            resetState();
        } catch (error) {
            toast.error(error.response?.data?.message || "Cập nhật thất bại. Vui lòng kiểm tra lại file.");
             if(error.response?.data?.details) {
                toast.error(`Chi tiết: ${error.response.data.details}`, { duration: 6000 });
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="p-4 sm:p-6 h-full flex flex-col items-center">
            <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-blue-800 dark:text-white">CẬP NHẬT VIỆC LÀM CỦA NGƯỜI HỌC</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Tải lên file Excel (.xlsx) chứa dữ liệu việc làm của học sinh, sinh viên để cập nhật vào hệ thống.
                    </p>
                </div>

                {!file ? (
                    <div className="mt-8 flex flex-col items-center gap-6">
                        <div {...getRootProps()} className={cn(
                            "w-full max-w-lg border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors",
                            isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                        )}>
                            <input {...getInputProps()} />
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-gray-600 dark:text-gray-300">Kéo và thả file vào đây, hoặc nhấn để chọn file</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Chỉ chấp nhận file .xlsx</p>
                        </div>
                        <button
                            onClick={createExcelTemplate}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold"
                        >
                            <Download className="w-5 h-5" />
                            Tải file mẫu
                        </button>
                    </div>
                ) : (
                    <div className="mt-6">
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-500" />
                                <span className="font-semibold">{file.name}</span>
                            </div>
                            <button onClick={resetState} className="text-sm text-blue-600 hover:underline">Tải lên file khác</button>
                        </div>
                        
                        <div className="mb-4 p-3 border-x border-b dark:border-gray-700 flex flex-wrap justify-between items-center gap-4">
                             <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="w-5 h-5"/>
                                    <span>{previewData.length - errorCount} dòng hợp lệ</span>
                                </div>
                                <div className={cn("flex items-center gap-2", errorCount > 0 ? "text-red-600" : "text-gray-500")}>
                                    <XCircle className="w-5 h-5"/>
                                    <span>{errorCount} dòng có lỗi</span>
                                </div>
                            </div>
                            {errorCount > 0 && (
                                <button
                                    onClick={handleExportErrors}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 transition-colors font-semibold"
                                >
                                    <ListX className="w-4 h-4" />
                                    Xuất báo cáo lỗi
                                </button>
                            )}
                        </div>

                        <div className="max-h-[40vh] overflow-auto border dark:border-gray-700 rounded-b-lg">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                <thead className="bg-gray-100 dark:bg-gray-900/50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-1/4">Maso</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-1/2">Noilamviec</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-1/4">Tình trạng</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {previewData.map(row => (
                                        <tr key={row.id} className={!row.status.valid ? 'bg-red-100 dark:bg-red-900/30' : ''}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{row.Maso}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{row.Noilamviec}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                {row.status.valid ? (
                                                    <span className="flex items-center gap-1 text-green-600"><CheckCircle size={16} /> {row.status.message}</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-red-600"><XCircle size={16} /> {row.status.message}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setIsConfirmModalOpen(true)}
                                disabled={!isValidFile || isLoading || previewData.length === 0}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-bold text-base"
                            >
                                <Send className="w-5 h-5" />
                                {isLoading ? 'Đang xử lý...' : `Tiến hành cập nhật (${previewData.length - errorCount})`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <ConfirmationModal
                open={isConfirmModalOpen}
                onOpenChange={setIsConfirmModalOpen}
                onConfirm={handleUpdate}
                title="Xác nhận Cập nhật"
                description={`Bạn có chắc chắn muốn cập nhật thông tin việc làm cho ${previewData.length - errorCount} sinh viên không? Hành động này không thể hoàn tác.`}
            />
        </div>
    );
};

export default UpdateWorkInfoPage;

