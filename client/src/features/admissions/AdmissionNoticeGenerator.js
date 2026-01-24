/*
* D:\QLDT-app\client\src\features\admissions\AdmissionNoticeGenerator.js
* Cập nhật: 08/8/2025
* Tóm tắt những nội dung cập nhật:
* - SỬA LỖI: Bổ sung các giá trị mặc định (fallback values) cho tất cả các trường dữ liệu được in ra.
* - Ví dụ: `data.applicant.Dacdiem || ''` sẽ đảm bảo rằng nếu `Dacdiem` không tồn tại, một chuỗi rỗng sẽ được sử dụng thay vì `undefined`, tránh gây lỗi cho jsPDF.
* - Giúp cho việc tạo PDF trở nên ổn định và đáng tin cậy hơn.
*/
import { jsPDF } from "jspdf";
import moment from "moment-timezone";
import { timesNewRomanNormal } from '../../assets/fonts/TimesNewRoman-Normal';
import { timesNewRomanBold } from '../../assets/fonts/TimesNewRoman-Bold';
import { timesNewRomanItalic } from '../../assets/fonts/TimesNewRoman-Italic';
import { logoData } from '../../assets/logo';
import { toast } from "react-hot-toast";

export const generateAdmissionNoticePDF = (data, currentUser) => {
    const toastId = toast.loading('Đang tạo giấy báo nhập học...');
    
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

        const fileName = `GiayBaoTrungTuyen_${data.applicant.Maso}.pdf`;
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
        
        
        // --- 4. TITLE ---
        
		currentY += 40;
        doc.setFont('Times-New-Roman', 'bold');
        doc.setFontSize(14);
        doc.text('GIẤY BÁO TRÚNG TUYỂN', pageWidth / 2, currentY, { align: 'center' });
        currentY += 20;
        doc.setFontSize(12);
        doc.text(`Đợt xét tuyển: ${data.period?.DotXT || ''} (${data.period?.Ghichu || ''})`, pageWidth / 2, currentY, { align: 'center' });
        currentY += 30;
        doc.setFontSize(11);
        doc.text('HỘI ĐỒNG TUYỂN SINH', pageWidth / 2, currentY, { align: 'center' });
        currentY += 15;
        doc.text('TRƯỜNG CAO ĐẲNG NGHỀ VIỆT NAM - HÀN QUỐC CÀ MAU THÔNG BÁO:', pageWidth / 2, currentY, { align: 'center' });
        currentY += 30;

        // --- 5. NỘI DUNG ---
        const drawInfoLine = (label, value, isValueBold = false) => {
            const safeValue = value || '';
            doc.setFont('Times-New-Roman', 'normal');
            doc.text(label, margin + 30, currentY); //thụt đầu dòng
            doc.setFont('Times-New-Roman', isValueBold ? 'bold' : 'normal');
            doc.text(safeValue, margin + 150, currentY);
            currentY += 20;
        };

        const drawBoldLine = (label, value) => {
            const safeValue = value || '';
            const labelWidth = doc.getStringUnitWidth(label) * doc.getFontSize();
            doc.setFont('Times-New-Roman', 'normal');
            doc.text(label, margin + 30, currentY);
            doc.setFont('Times-New-Roman', 'bold');
            doc.text(safeValue, margin + 150, currentY);
            currentY += 20;
        };

        drawInfoLine('- Mã thí sinh:', data.applicant?.Maso, true);
        drawInfoLine('- Họ và tên:', `${data.applicant?.Holot || ''} ${data.applicant?.Ten || ''}`, true);
        drawInfoLine('- Ngày sinh:', data.applicant?.Ngaysinh ? moment(data.applicant.Ngaysinh).format('DD/MM/YYYY') : '');
        drawInfoLine('- Địa chỉ:', data.applicant?.Diachi);
        drawInfoLine('- Điện thoại:', data.applicant?.Dienthoai);
        currentY += 5;

        doc.setFont('Times-New-Roman', 'bold');
        doc.text('Thí sinh đã trúng tuyển vào học tại Trường Cao đẳng nghề Việt Nam - Hàn Quốc Cà Mau:', margin + 10, currentY);
        currentY += 20;

        drawBoldLine('- Ngành nghề trúng tuyển:', data.applicant?.Dacdiem || '');
        drawBoldLine('- Trình độ trúng tuyển:', data.applicant?.BacDTHienthi || '');
        drawBoldLine('- Tổng điểm xét tuyển:', (data.applicant?.TongDXT || 0).toFixed(2));
        drawBoldLine('- Loại hình đào tạo:', 'Chính quy');
        currentY += 5;

        doc.setFont('Times-New-Roman', 'bold');
        doc.text('Yêu cầu thí sinh có mặt tại trường để thực hiện các nội dung sau:', margin + 10, currentY);
        currentY += 20;
        
        
		doc.text('1. Làm thủ tục và xác nhận nhập học:', margin +20, currentY);
        currentY += 20;
        const ngayBD = data.period?.NgayBDthutuc ? moment(data.period.NgayBDthutuc).format('DD/MM/YYYY') : '[chưa có]';
        const ngayKT = data.period?.NgayKTthutuc ? moment(data.period.NgayKTthutuc).format('DD/MM/YYYY') : '[chưa có]';
        doc.setFont('Times-New-Roman', 'normal');
		doc.text('- Thời gian:' ,  margin +35, currentY);
		doc.setFont('Times-New-Roman', 'bold');
		doc.text(`Từ ngày ${ngayBD} đến hết ngày ${ngayKT}`, margin +95, currentY);
		currentY += 20;
        doc.setFont('Times-New-Roman', 'normal');
		doc.text('- Địa điểm:' ,  margin +35, currentY);
		doc.setFont('Times-New-Roman', 'bold');
		doc.text(` ${data.period?.DiadiemThutuc || ''}`, margin +95, currentY);
        currentY += 20;
        
		
		doc.setFont('Times-New-Roman', 'bold');
        doc.text('Chú ý:', margin +35, currentY);
        currentY += 20;
        doc.setFont('Times-New-Roman', 'italic');
        doc.text('+ Thí sinh phải làm thủ tục và xác nhận nhập học trong thời gian quy định.', margin +55, currentY);
        currentY += 20;
        doc.text('+ Khi đến làm thủ tục nhập học, thí sinh mang theo tiền để đóng góp các khoản đầu năm.', margin +55, currentY);
        currentY += 20;

       
        const ngayNhapHoc = data.period?.NgayNhapHoc ? moment(data.period.NgayNhapHoc).format('DD/MM/YYYY') : '[chưa có]';
		const gioNhapHoc = data.period?.NgayNhapHoc ? moment(data.period.NgayNhapHoc).format('HH:mm') : '[chưa có]';
		doc.setFont('Times-New-Roman', 'bold');
        doc.text(`2. Nhập học chính thức:`,  margin +20, currentY);
		currentY += 20;
		doc.setFont('Times-New-Roman', 'normal');
		doc.text('- Thời gian:' ,  margin +35, currentY);
		doc.setFont('Times-New-Roman', 'bold');
		doc.text(` ${gioNhapHoc}, ngày ${ngayNhapHoc}`,  margin +95, currentY);
		currentY += 20;
        doc.setFont('Times-New-Roman', 'normal');
		doc.text('- Địa điểm:' ,  margin +35, currentY);
		doc.setFont('Times-New-Roman', 'bold');
		doc.text(` ${data.period?.DiadiemNhaphoc || ''}`, margin +95, currentY);		
		
		
		//doc.text('      - Địa điểm: Cơ sở 2 của Trường', margin +20, currentY, { maxWidth: pageWidth - margin * 2 });
 		//currentY += 20;
        //doc.setFont('Times-New-Roman', 'italic');      	
		//doc.text('      (Số 2, Nguyễn Tất Thành, phường Lý Văn Lâm, Cà Mau - chỗ Cầu Gành hào)', margin +20, currentY, { maxWidth: pageWidth - margin * 2 });
               
		
        currentY += 40;

        // --- 6. SIGNATURE ---
        doc.setFont('Times-New-Roman', 'bold');
        doc.text('TM. HỘI ĐỒNG TUYỂN SINH', pageWidth / 2 + 100, currentY, { align: 'center' });
        currentY += 15;
        doc.text('CHỦ TỊCH HỘI ĐỒNG', pageWidth / 2 + 100, currentY, { align: 'center' });

        // --- 7. FOOTER ---
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
        const timestamp = `${currentUser.maso} - ${moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')}`;
        doc.text(timestamp, pageWidth - margin, finalY - 10, { align: 'right' });

        // --- 8. OUTPUT ---
        toast.dismiss(toastId);
        return doc.output('blob');

    } catch (error) {
        console.error("Lỗi nghiêm trọng khi tạo PDF:", error);
        toast.error("Đã xảy ra lỗi khi tạo file PDF. Vui lòng kiểm tra console (F12).");
        toast.dismiss(toastId);
        return null;
    }
};
