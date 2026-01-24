/*
* D:\QLDT-app\client\src\features\admissions\AdmissionReceiptGenerator.js
* Cập nhật: 08/08/2025
* Tóm tắt những nội dung cập nhật:
* - SỬA LỖI TRIỆT ĐỂ (V3): Thay đổi cách thức hoạt động của `generateAdmissionReceiptPDF`.
* - Hàm `generateAdmissionReceiptPDF` giờ đây sẽ trả về một đối tượng Blob của file PDF thay vì data URI.
* - `ApplicantModal` sẽ chịu trách nhiệm tạo URL từ Blob này và mở trong cửa sổ mới, đảm bảo tính ổn định cao nhất.
*/
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import moment from "moment-timezone";
import { timesNewRomanNormal } from '../../assets/fonts/TimesNewRoman-Normal';
import { timesNewRomanBold } from '../../assets/fonts/TimesNewRoman-Bold';
import { timesNewRomanItalic } from '../../assets/fonts/TimesNewRoman-Italic';
import { logoData } from '../../assets/logo';
import { toast } from "react-hot-toast";
import axiosInstance from "../../api/axios";

// Hàm chuyển đổi chuỗi có dấu thành không dấu
const removeAccents = (str) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

// HÀM BẤT ĐỒNG BỘ: Lấy dữ liệu QR từ server
export const getQrCodeData = async (addInfo) => {
    try {
        const response = await axiosInstance.get('/admissions/qr-code', {
            params: { addInfo }
        });
        if (response.data && response.data.base64 && response.data.format) {
            return response.data;
        }
        throw new Error("Dữ liệu ảnh không hợp lệ trả về từ server.");
    } catch (error) {
        console.error("Could not fetch QR image via proxy:", error);
        toast.error("Không thể tải mã QR. Vui lòng thử lại.");
        return null;
    }
};

// HÀM ĐỒNG BỘ: Tạo PDF với dữ liệu đã có sẵn
export const generateAdmissionReceiptPDF = (data, qrCodeData) => {
    const toastId = toast.loading('Đang tạo phiếu nhận hồ sơ...');
    
    try {
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4'
        });

        // --- 1. CÀI ĐẶT FONT VÀ THUỘC TÍNH ---
        doc.addFileToVFS('Times-New-Roman-Normal.ttf', timesNewRomanNormal);
        doc.addFileToVFS('Times-New-Roman-Bold.ttf', timesNewRomanBold);
        doc.addFileToVFS('Times-New-Roman-Italic.ttf', timesNewRomanItalic);
        doc.addFont('Times-New-Roman-Normal.ttf', 'Times-New-Roman', 'normal');
        doc.addFont('Times-New-Roman-Bold.ttf', 'Times-New-Roman', 'bold');
        doc.addFont('Times-New-Roman-Italic.ttf', 'Times-New-Roman', 'italic');
        doc.setFont('Times-New-Roman', 'normal');

        const fileName = `PhieuNhanHoSo_${data.applicant.Maso}.pdf`;
        doc.setProperties({ title: fileName });

        // --- 2. WATERMARK ---
        if (logoData && logoData.startsWith('data:image')) {
            doc.saveGraphicsState();
            doc.setGState(new doc.GState({ opacity: 0.1 })); //defaul: 0.05
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.addImage(logoData, 'PNG', pageWidth / 2 - 100, pageHeight / 2 - 100, 200, 200);
            doc.restoreGraphicsState();
        }

        // --- 3. HEADER ---
        const margin = 40;
        const pageWidth = doc.internal.pageSize.getWidth();
        let currentY = 50;
        doc.setFontSize(10);
        doc.text('TRƯỜNG CĐ NGHỀ VIỆT NAM - HÀN QUỐC CÀ MAU', margin, currentY);
		doc.setFont('Times-New-Roman', 'bold');
        doc.text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', pageWidth - margin, currentY, { align: 'right' });
        currentY += 15;
        doc.setFont('Times-New-Roman', 'bold');
        doc.text('HỘI ĐỒNG TUYỂN SINH', margin + 60, currentY);
        doc.text('Độc lập - Tự do - Hạnh phúc', pageWidth - margin - 50, currentY, { align: 'right' });
        currentY += 15;
        doc.setLineWidth(0.5);
        doc.line(margin + 60, currentY - 10, margin + 180, currentY - 10);
        doc.line(margin + 345, currentY - 10, margin + 465, currentY - 10);
        
        doc.setFont('Times-New-Roman', 'italic');
        doc.text(`Cà Mau, ngày ${moment().format('DD')} tháng ${moment().format('MM')} năm ${moment().format('YYYY')}`, pageWidth - margin, currentY + 15, { align: 'right' });
        currentY += 45;

        // --- 4. TITLE ---
        doc.setFont('Times-New-Roman', 'bold');
        doc.setFontSize(14);
        doc.text('PHIẾU NHẬN HỒ SƠ TUYỂN SINH', pageWidth / 2, currentY, { align: 'center' });
        currentY += 20;
        doc.setFontSize(12);
        doc.text(`Đợt xét tuyển: ${data.periodInfo.DotXT} (${data.periodInfo.Ghichu})`, pageWidth / 2, currentY, { align: 'center' });
        currentY += 25;

        // --- 5. THÔNG TIN THÍ SINH ---
        doc.setFontSize(11);
        doc.setFont('Times-New-Roman', 'bold');
        doc.text('Thông tin về thí sinh nộp hồ sơ dự tuyển:', margin, currentY);
        currentY += 20;

        const drawInfoLine = (label, value, isValueBold = false) => {
            doc.setFont('Times-New-Roman', 'normal');
            doc.text(label, margin +10, currentY); //thụt đầu dòng 10
            doc.setFont('Times-New-Roman', isValueBold ? 'bold' : 'normal');
            doc.text(value, margin + 90, currentY);
            currentY += 18;
        };
        
        drawInfoLine('- Mã thí sinh:', data.applicant.Maso || '', true);
        drawInfoLine('- Họ và tên:', `${data.applicant.Holot || ''} ${data.applicant.Ten || ''}`, true);
        drawInfoLine('- Ngày sinh:', data.applicant.Ngaysinh ? moment(data.applicant.Ngaysinh).format('DD/MM/YYYY') : '');
        drawInfoLine('- Địa chỉ:', data.applicant.Diachi || '');
        drawInfoLine('- Điện thoại:', data.applicant.Dienthoai || '');
        currentY += 5;

        // --- 6. NGUYỆN VỌNG XÉT TUYỂN ---
        doc.setFont('Times-New-Roman', 'bold');
        doc.text('Đăng ký dự tuyển giáo dục nghề nghiệp tại trường:', margin, currentY);
        currentY += 5;

        const aspirationsBody = data.aspirations.map(asp => {
            const nganh = data.nganhHocList.find(n => n.MaNG === asp.MaNG);
            return [
                asp.MaNVXT || '-',
                nganh ? (nganh.Dacdiem || nganh.Tennganh || 'N/A') : 'N/A',
                nganh ? (nganh.BacDTHienthi || 'N/A') : 'N/A'
            ];
        });

        autoTable(doc, {
            startY: currentY,
            head: [['Nguyện vọng', 'Ngành học', 'Trình độ']],
            body: aspirationsBody,
            theme: 'grid',
            headStyles: { font: 'Times-New-Roman', fontStyle: 'bold', fillColor: [230, 230, 230], textColor: 0, halign: 'center' },
            bodyStyles: {
                font: 'Times-New-Roman',
                fontStyle: 'bold',
                cellPadding: 5,
                fillColor: false, // <-- Nền trong suốt
                textColor: 0      // <-- Chữ màu đen
            },
            columnStyles: {
                0: { halign: 'center' } // <-- Canh giữa cột "Nguyện vọng"
            },
            margin: { left: margin, right: margin }
        });
        currentY = doc.lastAutoTable.finalY + 20;

        // --- 7. HỒ SƠ ĐÃ NỘP ---
        doc.setFont('Times-New-Roman', 'bold');
        doc.text('Hồ sơ nộp, gồm:', margin, currentY);
        currentY += 20;
		doc.setFont('Times-New-Roman', 'italic');
		doc.text('Hồ sơ chung', margin + 10, currentY);
		doc.text('Hồ sơ theo trình độ', pageWidth / 2 + 20, currentY);
        currentY += 20;

        const hoSoChung = [
            { key: 'hs1', label: '1. Phiếu đăng ký dự tuyển' },
            { key: 'hs2', label: '2. Sơ yếu lý lịch' },
            { key: 'hs3', label: '3. Giấy khai sinh' },
            { key: 'hs12', label: '4. CMND/CCCD' },
            { key: 'hs11', label: '5. 02 ảnh màu (3x4)' },
            { key: 'hs13', label: `     6. Giấy ƯT: ${data.applicant.hs13 || ''}` },
        ];
        
        const hoSoTrinhDo = [
            { key: 'hs4', label: 'C1. Bằng TN THPT' },
            { key: 'hs5', label: 'C2. GiấyCN TN THPT' },
            { key: 'hs8', label: 'C3. Học bạ THPT' },
            { key: 'hs15', label: 'L1. Bằng Trung cấp' },
            { key: 'hs16', label: 'L2. Bảng điểm THPT' },
            { key: 'hs14', label: 'L3. Học bạ THPT' },
            { key: 'hs6', label: 'T1. Bằng TN THCS' },
            { key: 'hs7', label: 'T2. GiấyCN TN THCS' },
            { key: 'hs9', label: 'T3. Học bạ THCS' },
        ].filter(item => data.applicant[item.key]);
		doc.setFontSize(10);
        doc.setFont('Times-New-Roman', 'normal');
        const startYHoSo = currentY;
        hoSoChung.forEach((item, index) => {
            const labelText = item.key === 'hs13' ? item.label : `[${data.applicant[item.key] ? 'x' : ' '}] ${item.label}`;
            doc.text(labelText, margin+10, startYHoSo + index * 18); //thụt đầu dòng 10
        });
        
        hoSoTrinhDo.forEach((item, index) => {
            doc.text(`[x] ${item.label}`, pageWidth / 2 + 20, startYHoSo + index * 18);
        });
        currentY = startYHoSo + Math.max(hoSoChung.length, hoSoTrinhDo.length) * 18;
        
        // --- 8. FOOTER & QR CODE ---
        currentY += 10;
        doc.setFont('Times-New-Roman', 'bold');
        doc.text('Ghi chú:', margin, currentY);
        currentY += 15;

        const leftColumnX = margin +10 ;
        const rightColumnX = pageWidth - margin - 150;
        const startYFooter = currentY;

        // Cột trái
        doc.setFont('Times-New-Roman', 'bold');
        doc.text('1. Điều kiện để được xét tuyển:', leftColumnX, currentY);
        currentY += 15;
        doc.setFont('Times-New-Roman', 'normal');
        doc.text('- Hồ sơ xét tuyển: Nộp đủ theo quy chế tuyển sinh', leftColumnX +20, currentY);
        currentY += 15;
        doc.text('- Lệ phí xét tuyển: Nộp đầy đủ trước ngày xét tuyển', leftColumnX+20, currentY);
        currentY += 20;
        doc.setFont('Times-New-Roman', 'bold');
        doc.text(`2. Ngày xét tuyển (dự kiến): ${moment(data.periodInfo.NgayXetTuyen).format('DD/MM/YYYY')}`, leftColumnX, currentY);
        currentY += 20;
        doc.text(`3. Ngày nhập học chính thức: ${moment(data.periodInfo.NgayNhapHoc).format('DD/MM/YYYY')}`, leftColumnX, currentY);
        currentY += 20;
        doc.setFont('Times-New-Roman', 'bold');
        doc.text('4. Hướng dẫn thanh toán lệ phí xét tuyển trực tuyến:', leftColumnX, currentY);
        currentY += 15;
        doc.setFont('Times-New-Roman', 'normal');
        doc.text('- Quét mã QR bên phải để thanh toán', leftColumnX+20, currentY);
        currentY += 15;
        doc.text('- Hoặc chuyển khoản với thông tin sau:', leftColumnX+20, currentY);
        currentY += 15;
        doc.setFontSize(9);
		doc.text('+ Tên TK: TRUONG CD NGHE VIET NAM-HAN QUOC CA MAU', leftColumnX+25, currentY);
        currentY += 15;
        doc.text('+ Ngân hàng: Vietcombank', leftColumnX+25, currentY);
        currentY += 15;
        doc.text('+ Số tài khoản: 1023082986', leftColumnX+25, currentY);
        currentY += 15;
        doc.text('+ Số tiền chuyển: 30.000', leftColumnX+25, currentY);
        currentY += 15;
        const tenKhongDau = removeAccents(`${data.applicant.Holot} ${data.applicant.Ten}`);
        doc.text(`+ Nội dung: LPXT-${data.applicant.Maso}-${tenKhongDau}`, leftColumnX+25, currentY);

        // Cột phải (QR và Người nhận)
        if (qrCodeData) {
            doc.addImage(qrCodeData.base64, qrCodeData.format, rightColumnX+10, startYFooter-30, 130, 150);
        } else {
            doc.rect(rightColumnX, startYFooter, 150, 150);
            doc.setFontSize(9);
            doc.text('Không thể tải mã QR', rightColumnX + 75, startYFooter + 75, { align: 'center' });
        }
        
        const signatureY = startYFooter + 150;
        doc.setFont('Times-New-Roman', 'bold');
        doc.setFontSize(11);
        doc.text('NGƯỜI NHẬN HỒ SƠ', rightColumnX + 75, signatureY, { align: 'center' });
        doc.text(data.currentUser, rightColumnX + 75, signatureY + 60, { align: 'center' });
		
		//phần footer nhỏ
		const finalY = doc.internal.pageSize.getHeight() - 10;
        doc.setLineWidth(0.5);
        doc.line(margin, finalY - 45, pageWidth - margin, finalY - 45);
        doc.setFontSize(8);
        doc.setFont('Times-New-Roman', 'italic');
        doc.text('Khi cần biết thêm thông tin, vui lòng liên hệ với nhà trường bằng cách:', margin, finalY - 30);
		doc.setFont('Times-New-Roman', 'normal');
		doc.text('- Điện thoại: (02903) 592 101 - (02903) 592 102', margin, finalY - 20);
        doc.text('- Truy cập website: https://camauvkc.edu.vn', margin, finalY - 10);

        doc.setFont('Times-New-Roman', 'italic');
        const timestamp = `${moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}`;
        doc.text(timestamp, pageWidth - margin, finalY - 10, { align: 'right' });		
		
        // --- 9. OUTPUT ---
        toast.dismiss(toastId);
        // SỬA LỖI: Trả về Blob thay vì data URI
        return doc.output('blob');

    } catch (error) {
        console.error("Lỗi nghiêm trọng khi tạo PDF:", error);
        toast.error("Đã xảy ra lỗi khi tạo file PDF. Vui lòng kiểm tra console (F12).");
        toast.dismiss(toastId);
        return null; // Trả về null nếu có lỗi
    }
};
