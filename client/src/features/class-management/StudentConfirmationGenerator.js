/*
* D:\QLDT-app\client\src\features\class-management\StudentConfirmationGenerator.js
* Cập nhật: 20/08/2025
* - Cập nhật logic phần chữ ký để hiển thị đúng chức danh (Hiệu trưởng,
* Phó Hiệu trưởng, Trưởng phòng) dựa trên lựa chọn của người dùng.
*/
import { jsPDF } from "jspdf";
import moment from "moment-timezone";
import QRCode from 'qrcode';
import { timesNewRomanNormal } from '../../assets/fonts/TimesNewRoman-Normal';
import { timesNewRomanBold } from '../../assets/fonts/TimesNewRoman-Bold';
import { timesNewRomanItalic } from '../../assets/fonts/TimesNewRoman-Italic';
import { logoData } from '../../assets/logo';
import { toast } from "react-hot-toast";

export const generateStudentConfirmationPDF = async (data, options, currentUser) => {
    const toastId = toast.loading('Đang tạo giấy xác nhận...');
    
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
        doc.setLineHeightFactor(1.15);

        const fileName = `GXN_SV_${data.Maso}.pdf`;
        doc.setProperties({ title: fileName });

        // --- 2. WATERMARK ---
        if (logoData && logoData.startsWith('data:image')) {
            doc.saveGraphicsState();
            doc.setGState(new doc.GState({ opacity: 0.1 }));
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.addImage(logoData, 'PNG', pageWidth / 2 - 100, pageHeight / 2 - 100, 200, 200);
            doc.restoreGraphicsState();
        }

        // --- 3. HEADER ---
        const margin = 60;
        const pageWidth = doc.internal.pageSize.getWidth();
        let currentY = 60;
		
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

        // --- 4. TITLE ---
        currentY += 40;
        doc.setFont('Times-New-Roman', 'bold');
        doc.setFontSize(14);
        doc.text('GIẤY XÁC NHẬN', pageWidth / 2, currentY, { align: 'center' });
        currentY += 30;

        // --- 5. NỘI DUNG ---
        doc.setFontSize(12);
        doc.setFont('Times-New-Roman', 'normal');
        const contentText = '     Trường Cao đẳng nghề Việt Nam - Hàn Quốc Cà Mau xác nhận người học có thông tin dưới đây là học sinh, sinh viên đang học tại trường:';
        doc.text(contentText, margin, currentY, { maxWidth: pageWidth - margin * 2, align: 'justify' });
        currentY += 40;

        const infoStartY = currentY;
        const col1X = margin + 10;
        const col2X = pageWidth / 2 + 60;

        const drawInfoLine = (y, label1, value1, label2 = null, value2 = null) => {
            doc.setFont('Times-New-Roman', 'normal');
            doc.text(label1, col1X, y);
            doc.setFont('Times-New-Roman', 'bold');
            doc.text(value1 || '', col1X + 80, y);

            if (label2) {
                doc.setFont('Times-New-Roman', 'normal');
                doc.text(label2, col2X, y);
                doc.setFont('Times-New-Roman', 'bold');
                doc.text(value2 || '', col2X + 80, y);
            }
        };

        drawInfoLine(currentY, '- Họ và tên:', `${data.Holot || ''} ${data.Ten || ''}`, 'Giới tính:', data.Gioitinh ? 'Nữ' : 'Nam');
        currentY += 20;
        drawInfoLine(currentY, '- Ngày sinh:', data.Ngaysinh ? moment(data.Ngaysinh).format('DD/MM/YYYY') : '', 'Nơi sinh:', data.Noisinh || '');
        currentY += 20;
        drawInfoLine(currentY, '- Địa chỉ:', data.Diachi || '');
        currentY += 20;
        drawInfoLine(currentY, '- Mã số:', data.Maso || '');
        currentY += 20;
        drawInfoLine(currentY, '- Tên lớp học:', data.Tenlop || '');
        currentY += 20;
        drawInfoLine(currentY, '- Ngành nghề:', data.Dacdiem || '');
        currentY += 20;
        drawInfoLine(currentY, '- Bậc đào tạo:', data.BacDTHienthi || '', 'Loại hình ĐT:', 'Chính quy');
        currentY += 20;
        const khoaDaoTao = data.MaL ? `20${data.MaL.substring(1, 3)}` : '';
        drawInfoLine(currentY, '- Khóa đào tạo:', khoaDaoTao, 'Niên khóa:', data.Khoahoc || '');
        currentY += 20;
        const totNghiepDuKien = data.NgayTotNghiepDuKien ? moment(data.NgayTotNghiepDuKien).format('MM/YYYY') : '';
        drawInfoLine(currentY, '- Tốt nghiệp:', `${totNghiepDuKien} (dự kiến)`);
        currentY += 20;

        // --- 6. QR CODE ---
        const qrCodeURL = `https://camauvkc.edu.vn/sinhvien?maso=${data.Maso || ''}`;
        const qrCodeImage = await QRCode.toDataURL(qrCodeURL, { errorCorrectionLevel: 'L', width: 90 });
        doc.addImage(qrCodeImage, 'PNG', margin, currentY);

        // --- 7. SIGNATURE ---
        const signatureX = pageWidth / 2 + 120;
        doc.setFont('Times-New-Roman', 'bold');
        
        if (options.signer === 'hieutruong') {
            doc.text('HIỆU TRƯỞNG', signatureX, currentY + 15, { align: 'center' });
        } else if (options.signer === 'phohieutruong') {
            doc.text('KT. HIỆU TRƯỞNG', signatureX, currentY + 15, { align: 'center' });
            currentY += 15;
            doc.text('PHÓ HIỆU TRƯỞNG', signatureX, currentY + 15, { align: 'center' });
        } else { // truongphong
            doc.text('TL. HIỆU TRƯỞNG', signatureX, currentY + 15, { align: 'center' });
            currentY += 15;
            doc.text('TRƯỞNG PHÒNG CT HSSV', signatureX, currentY + 15, { align: 'center' });
        }

        // --- 8. FOOTER ---
        const finalY = doc.internal.pageSize.getHeight() - 10;
        doc.setFontSize(10);
        doc.setFont('Times-New-Roman', 'bold');
        doc.text('Lưu ý:', margin, finalY - 120);
		doc.setFontSize(9);
		 doc.setFont('Times-New-Roman', 'normal');
        doc.text('     Giấy xác nhận này chỉ có giá trị khi học sinh, sinh viên đang còn học tập tại trường.', margin, finalY - 105);
        doc.setFont('Times-New-Roman', 'italic');
		doc.text('     (Quét mã QRCode phía trên để kiểm tra, xác thực học sinh, sinh viên của nhà trường)', margin, finalY - 90);

        doc.setLineWidth(0.5);
        doc.line(margin, finalY - 70, pageWidth - margin, finalY - 70);
        doc.setFontSize(9);
        doc.setFont('Times-New-Roman', 'bold');
        doc.text('Để biết thêm thông tin, liên hệ với nhà trường qua các hình thức sau:', margin, finalY - 55);
		doc.setFontSize(8);
        doc.setFont('Times-New-Roman', 'normal');
        doc.text('- Điện thoại:', margin, finalY - 40);
        doc.text('(02903) 592 101 - 592 102', margin + 50, finalY - 40);
        doc.text('- E-mail:', margin, finalY - 28);
        doc.text('camauvkc@camauvkc.edu.vn', margin + 50, finalY - 28);
        doc.text('- Website:', margin, finalY - 16);
        doc.text('https://camauvkc.edu.vn', margin + 50, finalY - 16);
        
        doc.setFont('Times-New-Roman', 'italic');
        const timestamp = `${currentUser.maso} - ${moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}`;
        doc.text(timestamp, pageWidth - margin, finalY - 10, { align: 'right' });

        // --- 9. OUTPUT ---
        toast.dismiss(toastId);
        return doc.output('blob');

    } catch (error) {
        console.error("Lỗi khi tạo PDF Giấy xác nhận:", error);
        toast.error("Đã xảy ra lỗi khi tạo file PDF.");
        toast.dismiss(toastId);
        return null;
    }
};
