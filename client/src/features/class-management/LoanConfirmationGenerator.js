/*
* D:\QLDT-app\client\src\features\class-management\LoanConfirmationGenerator.js
* Cập nhật: 12/09/2025
* - Tinh chỉnh định dạng văn bản.
* - Bổ sung logic làm tròn số tháng học.
* - Cập nhật nhãn học phí và cách hiển thị.
* - Bổ sung in đậm tên sinh viên trong phần cam kết.
* - QR code to hơn
*/
import { jsPDF } from "jspdf";
import moment from "moment-timezone";
import QRCode from 'qrcode';
import { timesNewRomanNormal } from '../../assets/fonts/TimesNewRoman-Normal';
import { timesNewRomanBold } from '../../assets/fonts/TimesNewRoman-Bold';
import { timesNewRomanItalic } from '../../assets/fonts/TimesNewRoman-Italic';
import { toast } from "react-hot-toast";

// Hàm làm tròn số tháng theo quy tắc
const roundToNearest5 = (num) => {
    if (!num || num <= 0) return 0;
    return Math.round(num / 5) * 5;
};

export const generateLoanConfirmationPDF = async (data, options, currentUser) => {
    const toastId = toast.loading('Đang tạo giấy xác nhận...');
    
    try {
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4'
        });

        // --- CÀI ĐẶT FONT VÀ THUỘC TÍNH ---
        doc.addFileToVFS('Times-New-Roman-Normal.ttf', timesNewRomanNormal);
        doc.addFileToVFS('Times-New-Roman-Bold.ttf', timesNewRomanBold);
        doc.addFileToVFS('Times-New-Roman-Italic.ttf', timesNewRomanItalic);
        doc.addFont('Times-New-Roman-Normal.ttf', 'Times-New-Roman', 'normal');
        doc.addFont('Times-New-Roman-Bold.ttf', 'Times-New-Roman', 'bold');
        doc.addFont('Times-New-Roman-Italic.ttf', 'Times-New-Roman', 'italic');
        doc.setFont('Times-New-Roman', 'normal');
        doc.setLineHeightFactor(1.0);
        doc.setFontSize(12);

        const fileName = `GXNVV_SV_${data.Maso}.pdf`;
        doc.setProperties({ title: fileName });

        // --- HEADER ---
        const margin = 60;
        const pageWidth = doc.internal.pageSize.getWidth();
        let currentY = 60;
		doc.setFontSize(8);
        doc.text('Mẫu số: 01/TDSV', pageWidth - margin, currentY - 20, { align: 'right' });
		
		doc.setFontSize(12);
        doc.text('UBND TỈNH CÀ MAU', margin + 40, currentY);
		doc.setFont('Times-New-Roman', 'bold');
        doc.text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', pageWidth - margin, currentY, { align: 'right' });
        currentY += 15;
        doc.text('TRƯỜNG CAO ĐẲNG NGHỀ', margin+20, currentY);
        doc.text('Độc lập - Tự do - Hạnh phúc', pageWidth - margin-50, currentY, { align: 'right' });
        		currentY += 15;
        doc.text('VIỆT NAM - HÀN QUỐC CÀ MAU', margin, currentY);
        doc.setLineWidth(0.5);
        doc.line(margin + 290, currentY - 10, margin + 420, currentY - 10);
        currentY += 25;
		doc.setLineWidth(0.5);
		doc.line(margin + 40, currentY - 20, margin + 160, currentY - 20);
        doc.setFont('Times-New-Roman', 'normal');
        doc.text('Số:         /GXN-CĐN', margin+45, currentY);
       
        doc.setFont('Times-New-Roman', 'italic');
        doc.text(`Cà Mau, ngày ${moment().format('DD')} tháng ${moment().format('MM')} năm ${moment().format('YYYY')}`, pageWidth - margin, currentY, { align: 'right' });
		
		
        // --- TITLE ---
        currentY += 40;
        doc.setFont('Times-New-Roman', 'bold');
        doc.setFontSize(14);
        doc.text('GIẤY XÁC NHẬN', pageWidth / 2, currentY, { align: 'center' });
        currentY += 40;

        // --- NỘI DUNG ---
        doc.setFontSize(12);
        const col1X = margin;
        const col2X = pageWidth / 2 + 40;

        const drawLineCompact = (label, value, isValueBold = false) => {
            doc.setFont('Times-New-Roman', 'normal');
            doc.text(label, col1X, currentY);
            const labelWidth = doc.getStringUnitWidth(label) * doc.getFontSize() / doc.internal.scaleFactor;
            doc.setFont('Times-New-Roman', isValueBold ? 'bold' : 'normal');
            doc.text(String(value || ''), col1X + labelWidth + 2, currentY);
            currentY += 20;
        };
        
        const drawTwoCols = (label1, value1, label2, value2) => {
            doc.setFont('Times-New-Roman', 'normal');
            doc.text(label1, col1X, currentY);
            doc.text(String(value1 || ''), col1X + 100, currentY);
            doc.text(label2, col2X, currentY);
            doc.text(String(value2 || ''), col2X + 100, currentY);
            currentY += 20;
        };

        doc.setFont('Times-New-Roman', 'normal');
        doc.text('Họ và tên học sinh, sinh viên:', col1X, currentY);
        doc.setFont('Times-New-Roman', 'bold');
        doc.text(((data.Holot || '') + ' ' + (data.Ten || '')).toUpperCase(), col1X + 170, currentY);
        currentY += 20;

        const genderText = data.Gioitinh ? 'Nam [   ]     Nữ [ X ]' : 'Nam [ X ]     Nữ [   ]';
        drawTwoCols('Ngày sinh:', data.Ngaysinh ? moment(data.Ngaysinh).format('DD/MM/YYYY') : '', 'Giới tính:', genderText);
        drawTwoCols('CMND (CCCD):', data.SoCMND, 'Ngày cấp:', data.NgaycapCMND ? moment(data.NgaycapCMND).format('DD/MM/YYYY') : '');
        
        doc.text('Nơi cấp:', col1X, currentY);
        doc.text(data.NoicapCMND || '', col1X + 100, currentY);
        currentY += 20;
        
        drawLineCompact('Mã trường theo học (mã quy định trong tuyển sinh ĐH, CĐ, TC): ', 'D99', true);
        drawLineCompact('Tên trường: ', 'TRƯỜNG CAO ĐẲNG NGHỀ VIỆT NAM - HÀN QUỐC CÀ MAU', true);
        
        drawLineCompact('Ngành học: ', data.Dacdiem || '', true);
		drawLineCompact('Hệ đào tạo (Trung cấp, Cao đẳng): ', data.BacDTHienthi || '', true);
		
        drawTwoCols('Niên khóa:', data.Khoahoc, 'Loại hình đào tạo:', 'Chính quy');
        drawTwoCols('Lớp học:', data.Tenlop, 'Số thẻ HSSV:', data.Maso);
        
        const ngayRaTruong = data.NgayRaTruong ? moment(data.NgayRaTruong) : null;
        const ngayNhapHoc = data.NgayNhapHoc ? moment(data.NgayNhapHoc) : null;
        let soThang = 0;
        if (ngayRaTruong && ngayNhapHoc) {
            const diffMonths = ngayRaTruong.diff(ngayNhapHoc, 'months');
            soThang = roundToNearest5(diffMonths);
        }
        drawTwoCols('Ngày nhập học:', ngayNhapHoc ? ngayNhapHoc.format('DD/MM/YYYY') : '', 'Thời gian ra trường:', ngayRaTruong ? ngayRaTruong.format('MM/YYYY') : '');

        doc.setFont('Times-New-Roman', 'italic');
        doc.text(`(Thời gian học tại trường: ${soThang} tháng)`, pageWidth / 2, currentY, { align: 'center' });
        currentY += 25;
        
        doc.setFont('Times-New-Roman', 'normal');
        const hocphi = data.AvgHocphiThang ? `${data.AvgHocphiThang.toLocaleString('vi-VN')} đồng` : '.................. đồng';
        doc.text(`- Số tiền học phí hàng tháng (tính bình quân toàn khóa): ${hocphi}`, col1X, currentY);
        currentY += 20;
        
        doc.text('Thuộc diện:', col1X+20, currentY);
        doc.text('- Không miễn giảm', col1X + 120, currentY);
        doc.text(options.exemptionStatus === 'khong' ? '[ X ]' : '[    ]', col1X + 250, currentY);
        currentY += 20;
        doc.text('- Giảm học phí', col1X + 120, currentY);
        doc.text(options.exemptionStatus === 'giam' ? '[ X ]' : '[    ]', col1X + 250, currentY);
        currentY += 20;
        doc.text('- Miễn học phí', col1X + 120, currentY);
        doc.text(options.exemptionStatus === 'mien' ? '[ X ]' : '[    ]', col1X + 250, currentY);
        currentY += 20;

        doc.text('Thuộc đối tượng:', col1X+20, currentY);
        doc.text('- Mồ côi', col1X + 120, currentY);
        doc.text(options.orphanStatus === 'co' ? '[ X ]' : '[    ]', col1X + 250, currentY);
        currentY += 20;
        doc.text('- Không mồ côi', col1X + 120, currentY);
        doc.text(options.orphanStatus === 'khong' ? '[ X ]' : '[    ]', col1X + 250, currentY);
        currentY += 25;

        const textBeforeName = '- Trong thời gian theo học tại trường, anh (chị) ';
        const studentNameBold = `${data.Holot || ''} ${data.Ten || ''}`;
        const textAfterName = '  không bị xử phạt hành chính trở lên về các hành vi: cờ bạc, nghiện hút, trộm cắp, buôn lậu.';
        
        const textBeforeWidth = doc.getStringUnitWidth(textBeforeName) * doc.getFontSize() / doc.internal.scaleFactor;
        
        doc.setFont('Times-New-Roman', 'normal');
        doc.text(textBeforeName, col1X, currentY);
        
        doc.setFont('Times-New-Roman', 'bold');
        doc.text(studentNameBold, col1X + textBeforeWidth, currentY);
        
        const nameWidth = doc.getStringUnitWidth(studentNameBold) * doc.getFontSize() / doc.internal.scaleFactor;
		currentY += 15;
        doc.setFont('Times-New-Roman', 'normal');
        doc.text(textAfterName, col1X, currentY, {maxWidth: pageWidth - margin * 2 });
        currentY += 25;
        
        doc.text('- Số tài khoản của nhà trường: 3716.2.1122250.00000, tại: Kho bạc Nhà nước khu vực XX-Cà Mau ./.', col1X, currentY);
        currentY += 50;

        // --- SIGNATURE ---
        const signatureX = pageWidth / 2 + 100;
        doc.setFont('Times-New-Roman', 'bold');
        
        if (options.signer === 'hieutruong') {
            doc.text('HIỆU TRƯỞNG', signatureX, currentY, { align: 'center' });
        } else if (options.signer === 'phohieutruong') {
            doc.text('KT. HIỆU TRƯỞNG', signatureX, currentY, { align: 'center' });
            currentY += 15;
            doc.text('PHÓ HIỆU TRƯỞNG', signatureX, currentY, { align: 'center' });
        } else { // truongphong
            doc.text('TL. HIỆU TRƯỞNG', signatureX, currentY, { align: 'center' });
            currentY += 15;
            doc.text('TRƯỞNG PHÒNG CT HSSV', signatureX, currentY, { align: 'center' });
        }
		// --- 8. FOOTER ---
		const finalY = doc.internal.pageSize.getHeight() - 10;
		currentY = finalY - 30
		
		// --- 6. QR CODE ---
        const qrCodeURL = `https://camauvkc.edu.vn/sinhvien?maso=${data.Maso || ''}`;
        const qrCodeImage = await QRCode.toDataURL(qrCodeURL, { errorCorrectionLevel: 'L', width: 50 });
        doc.addImage(qrCodeImage, 'PNG', margin, currentY);
		
		doc.setFontSize(8);
		doc.setFont('Times-New-Roman', 'italic');
        const timestamp = `${currentUser.maso} - ${moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}`;
        doc.text(timestamp, pageWidth - margin, finalY - 10, { align: 'right' });
		
        // --- OUTPUT ---
        toast.dismiss(toastId);
        return doc.output('blob');

    } catch (error) {
        console.error("Lỗi khi tạo PDF Giấy xác nhận vay vốn:", error);
        toast.error("Đã xảy ra lỗi khi tạo file PDF.");
        toast.dismiss(toastId);
        return null;
    }
};
