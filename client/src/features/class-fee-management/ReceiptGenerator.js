/* 

D:\QLDT-app\client\src\features\class-fee-management\ReceiptGenerator.js
Cập nhật: 20/09/2025
* Bổ sung thêm WATERMARK to giữa trang.
*/

import { jsPDF } from "jspdf";
import { numberToWords } from '../../lib/numberToWords';
import moment from "moment";
import { timesNewRomanNormal } from '../../assets/fonts/TimesNewRoman-Normal';
import { timesNewRomanBold } from '../../assets/fonts/TimesNewRoman-Bold';
import { timesNewRomanItalic } from '../../assets/fonts/TimesNewRoman-Italic';
// Bổ sung: Import dữ liệu logo
import { logoData } from '../../assets/logo';

// Bổ sung: Hàm tiện ích để tạo tên file an toàn
const slugify = (text) => {
    const a = 'àáäâãåăæąçćčđďèéěëêęğǵḧìíïîįłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
    const b = 'aaaaaaaaacccddeeeeeeghhiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return text.toString().toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
        .replace(/&/g, '-and-') // Replace & with 'and'
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, '') // Trim - from end of text
}


export const generateReceiptPDF = (receiptData) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
    });

    doc.addFileToVFS('Times-New-Roman-Normal.ttf', timesNewRomanNormal);
    doc.addFileToVFS('Times-New-Roman-Bold.ttf', timesNewRomanBold);
    doc.addFileToVFS('Times-New-Roman-Italic.ttf', timesNewRomanItalic);
    doc.addFont('Times-New-Roman-Normal.ttf', 'Times-New-Roman', 'normal');
    doc.addFont('Times-New-Roman-Bold.ttf', 'Times-New-Roman', 'bold');
    doc.addFont('Times-New-Roman-Italic.ttf', 'Times-New-Roman', 'italic');

    const fileName = `BienLai_${String(receiptData.soPhieu).padStart(6, '0')}_${slugify(receiptData.hoTenSV)}.pdf`;
    doc.setProperties({
        title: fileName
    });
	 // --- WATERMARK Logo nhỏ ---
    const drawReceipt = (yOffset) => {
        // --- Bổ sung: Vẽ Watermark Logo ---
        if (logoData && logoData.startsWith('data:image')) {
            doc.saveGraphicsState();
            doc.setGState(new doc.GState({ opacity: 0.4 })); // Độ mờ - số càng lớn càng đậm
            doc.addImage(logoData, 'JPEG', 150, yOffset + 15, 60, 60);
            doc.restoreGraphicsState();
        }
 // ---  WATERMARK giữa trang---
        if (logoData && logoData.startsWith('data:image')) {
            doc.saveGraphicsState();
            doc.setGState(new doc.GState({ opacity: 0.02 }));
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.addImage(logoData, 'PNG', pageWidth / 2 - 100, pageHeight / 2 - 100, 200, 200);
            doc.restoreGraphicsState();
        }

        // --- Header theo mẫu mới ---
        doc.setFont('Times-New-Roman', 'normal');
        doc.setFontSize(11);
        doc.text('UBND TỈNH CÀ MAU', 130, yOffset + 20);
        
        doc.setFont('Times-New-Roman', 'bold');
        doc.text('TRƯỜNG CĐN VIỆT NAM - HÀN QUỐC CÀ MAU', 60, yOffset + 35);
        
        doc.setFont('Times-New-Roman', 'normal');
        doc.text('Địa chỉ: 8, Mậu Thân, Phường An Xuyên, Cà Mau', 70, yOffset + 50);
        doc.text('Điện thoại: (02903) 832.835', 120, yOffset + 65);
        doc.line(130, yOffset + 68, 225, yOffset + 68);

        doc.setFont('Times-New-Roman', 'bold');
        doc.text('Mẫu số C38 - BB', 400, yOffset + 20);
        
        doc.setFont('Times-New-Roman', 'normal');
        doc.setFontSize(10);
        doc.text('(Ban hành theo QĐ số 19/2006/QĐ-BTC ngày', 400, yOffset + 32);
        doc.text('30/03/2006 của Bộ trưởng Bộ Tài chính)', 400, yOffset + 44);
        
        doc.setFontSize(11);
        doc.text('Quyển số: ............', 400, yOffset + 65);
        doc.text('Số:', 400, yOffset + 80);
        doc.setFont('Times-New-Roman', 'bold');
        doc.text(String(receiptData.soPhieu).padStart(6, '0'), 425, yOffset + 80);


        // --- Title ---
        const titleY = yOffset + 110;
        doc.setFont('Times-New-Roman', 'bold');
        doc.setFontSize(14);
        doc.text('BIÊN LAI THU TIỀN', doc.internal.pageSize.getWidth() / 2, titleY, { align: 'center' });

        doc.setFont('Times-New-Roman', 'italic');
        doc.setFontSize(11);
        const today = moment();
        doc.text(`Ngày ${today.format('DD')} tháng ${today.format('MM')} năm ${today.format('YYYY')}`, doc.internal.pageSize.getWidth() / 2, titleY + 15, { align: 'center' });

        // --- Body ---
        doc.setFont('Times-New-Roman', 'normal');
        const bodyYStart = titleY + 35;
        const lineHeight = 18;
        const labelIndent = 60;
        const valueIndent = 200;

        doc.text('Họ tên người nộp tiền:', labelIndent, bodyYStart);
        doc.setFont('Times-New-Roman', 'bold');
        doc.text(`${receiptData.hoTenSV} (${receiptData.maSoSV}, ${receiptData.ngaySinhSV})`, valueIndent, bodyYStart);

        doc.setFont('Times-New-Roman', 'normal');
        doc.text('Địa chỉ:', labelIndent, bodyYStart + lineHeight);
        doc.setFont('Times-New-Roman', 'bold');
        doc.text(`${receiptData.tenLop}`, valueIndent, bodyYStart + lineHeight);
        
        doc.setFont('Times-New-Roman', 'normal');
        doc.text('Lý do nộp:', labelIndent, bodyYStart + lineHeight * 2);
        doc.setFont('Times-New-Roman', 'bold');
        doc.text(receiptData.lyDo, valueIndent, bodyYStart + lineHeight * 2);

        doc.setFont('Times-New-Roman', 'normal');
        doc.text('Số tiền thu:', labelIndent, bodyYStart + lineHeight * 3);
        doc.setFont('Times-New-Roman', 'bold');
        doc.text(`${receiptData.soTien.toLocaleString('vi-VN')} đồng`, valueIndent, bodyYStart + lineHeight * 3);

        doc.setFont('Times-New-Roman', 'normal');
        doc.text('Viết bằng chữ:', labelIndent, bodyYStart + lineHeight * 4);
        doc.setFont('Times-New-Roman', 'bold');
        doc.text(numberToWords(receiptData.soTien), valueIndent, bodyYStart + lineHeight * 4, { maxWidth: 350 });

        // --- Footer ---
        const footerYStart = bodyYStart + lineHeight * 5.5; // Khoảng cách 1.5 lần
        doc.setFont('Times-New-Roman', 'bold');
        doc.text('Người nộp tiền', 120, footerYStart, { align: 'center' });
        doc.text('Người thu tiền', 470, footerYStart, { align: 'center' });

        doc.setFont('Times-New-Roman', 'italic');
        doc.text('(Ký, ghi rõ họ tên)', 120, footerYStart + 12, { align: 'center' });
        doc.text('(Ký, ghi rõ họ tên)', 470, footerYStart + 12, { align: 'center' });

        const signatureY = footerYStart + 12 + 60; // Khoảng cách 4 lần
        doc.setFont('Times-New-Roman', 'bold');
        doc.setFontSize(11);
        doc.text(receiptData.nguoiThu, 470, signatureY, { align: 'center' });

        doc.setFont('Times-New-Roman', 'normal');
        doc.setFontSize(8);
        doc.text(moment().format('DD/MM/YYYY HH:mm:ss'), doc.internal.pageSize.getWidth() / 2, signatureY + 15, { align: 'center' });
        
        doc.setFont('Times-New-Roman', 'italic');
        doc.text(`Lưu ý: Cá nhân tự bảo quản biên lai để xuất trình khi cần thiết, mất không cấp lại.`, labelIndent, yOffset + 380);
    };

    // Draw Liên 1
    drawReceipt(20);
    
    // Separator line
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setLineDashPattern([2, 2], 0);
    doc.line(40, pageHeight / 2, doc.internal.pageSize.getWidth() - 40, pageHeight / 2);
    doc.setLineDashPattern([], 0);

    // Draw Liên 2
    drawReceipt(pageHeight / 2 + 10);

    // Open PDF in new window
    doc.output('dataurlnewwindow');
};
