/*
 * Đường dẫn file: client/src/features/exam-room-management/ExamRoomListGenerator.js
 * Phiên bản: 07/02/2026
 * Tóm tắt:
 * - Generator PDF "Danh sách dự thi" theo mẫu DSPhongThi.jpg
 * - Định dạng A4, font Times New Roman
 * - Bao gồm header, tiêu đề, bảng danh sách sinh viên, footer
 */

import { jsPDF } from "jspdf";
import moment from "moment-timezone";
import { timesNewRomanNormal } from '../../assets/fonts/TimesNewRoman-Normal';
import { timesNewRomanBold } from '../../assets/fonts/TimesNewRoman-Bold';
import { timesNewRomanItalic } from '../../assets/fonts/TimesNewRoman-Italic';
import { logoData } from '../../assets/logo';
import { toast } from "react-hot-toast";

/**
 * Tạo PDF danh sách dự thi
 * @param {Object} options - Các tùy chọn
 * @param {Array} options.students - Danh sách sinh viên
 * @param {Object} options.roomData - Thông tin phòng thi
 * @param {Object} options.courseInfo - Thông tin học phần
 * @param {number} options.examType - Lần thi (0: Giữa kỳ, 1: Cuối kỳ L1, 2: Cuối kỳ L2)
 * @returns {Promise<Blob>} - PDF blob
 */
export const generateExamRoomListPDF = async (options) => {
    const { students, roomData, courseInfo, examType } = options;
    const toastId = toast.loading('Đang tạo danh sách dự thi...');

    try {
        // Khởi tạo PDF - A4 portrait
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4'
        });

        // --- 1. CÀI ĐẶT FONT ---
        doc.addFileToVFS('Times-New-Roman-Normal.ttf', timesNewRomanNormal);
        doc.addFileToVFS('Times-New-Roman-Bold.ttf', timesNewRomanBold);
        doc.addFileToVFS('Times-New-Roman-Italic.ttf', timesNewRomanItalic);
        doc.addFont('Times-New-Roman-Normal.ttf', 'Times-New-Roman', 'normal');
        doc.addFont('Times-New-Roman-Bold.ttf', 'Times-New-Roman', 'bold');
        doc.addFont('Times-New-Roman-Italic.ttf', 'Times-New-Roman', 'italic');
        doc.setFont('Times-New-Roman', 'normal');
        doc.setLineHeightFactor(1.15);

        // Margins: top: 2cm (56.7pt), bottom: 1cm (28.35pt), left: 1cm (28.35pt), right: 0.5cm (14.17pt)
        const marginTop = 56.7;
        const marginBottom = 28.35;
        const marginLeft = 28.35;
        const marginRight = 14.17;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const contentWidth = pageWidth - marginLeft - marginRight;

        // Lần thi text
        const examTypeText = examType === 0 ? 'Giữa kỳ' : examType === 1 ? 'Cuối kỳ L1' : 'Cuối kỳ L2';

        // --- 2. WATERMARK ---
        const addWatermark = () => {
            if (logoData && logoData.startsWith('data:image')) {
                doc.saveGraphicsState();
                doc.setGState(new doc.GState({ opacity: 0.1 }));
                doc.addImage(logoData, 'PNG', pageWidth / 2 - 100, pageHeight / 2 - 100, 200, 200);
                doc.restoreGraphicsState();
            }
        };
        addWatermark();

        // --- 3. HEADER ---
        let currentY = marginTop;
        doc.setFontSize(11);

        // Dòng 1
        doc.setFont('Times-New-Roman', 'normal');
        doc.text('UBND TỈNH CÀ MAU', marginLeft + 90, currentY, { align: 'center' });
        doc.setFont('Times-New-Roman', 'bold');
        doc.text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', pageWidth - marginRight - 130, currentY, { align: 'center' });

        currentY += 14;
        // Dòng 2
        doc.setFont('Times-New-Roman', 'bold');
        doc.text('TRƯỜNG CĐN VIỆT NAM-HÀN QUỐC', marginLeft + 90, currentY, { align: 'center' });
        doc.setFont('Times-New-Roman', 'bold');
        doc.text('Độc lập - Tự do - Hạnh phúc', pageWidth - marginRight - 130, currentY, { align: 'center' });

        currentY += 8;
        // Đường kẻ ngang dưới header
        doc.setLineWidth(0.5);
        doc.line(marginLeft + 10, currentY, marginLeft + 170, currentY);
        doc.line(pageWidth - marginRight - 195, currentY, pageWidth - marginRight - 60, currentY);

        // --- 4. TIÊU ĐỀ NỘI DUNG ---
        currentY += 30;
        doc.setFontSize(14);
        doc.setFont('Times-New-Roman', 'bold');
        doc.text('DANH SÁCH DỰ THI', pageWidth / 2, currentY, { align: 'center' });

        // Task 8.2.4: Thông tin học phần - bắt đầu từ lề trái + 5cm (141.7pt)
        const infoStartX = marginLeft + 118.2; // 4cm từ lề trái (1cm=29.5)
        currentY += 24;
        doc.setFontSize(11);
        doc.setFont('Times-New-Roman', 'normal');
        doc.text('Học phần:    ', infoStartX, currentY);
        doc.setFont('Times-New-Roman', 'bold');
        doc.text(courseInfo?.TenHP || '', infoStartX + 55, currentY);

        currentY += 16;
        doc.setFont('Times-New-Roman', 'normal');
        doc.text('Phòng thi:    ', infoStartX, currentY);
        doc.setFont('Times-New-Roman', 'bold');
        doc.text(roomData?.TenPhongthi || '', infoStartX + 55, currentY);

        doc.setFont('Times-New-Roman', 'normal');
        doc.text('Lần thi:  ', infoStartX + 200, currentY);
        doc.setFont('Times-New-Roman', 'bold');
        doc.text(examTypeText, infoStartX + 235, currentY);

        currentY += 16;
        doc.setFont('Times-New-Roman', 'normal');
        doc.text('Học kỳ:        ', infoStartX, currentY);
        doc.setFont('Times-New-Roman', 'bold');
        const hocKyText = `${courseInfo?.TenHK || ''}`;
        doc.text(hocKyText, infoStartX + 55, currentY);

        // Task 8.2.4: Dòng ghi chú - fontsize 10pt
        currentY += 20;
        doc.setFontSize(11);
        doc.setFont('Times-New-Roman', 'normal');
        doc.text('*Ngày thi:......................... *Thời gian thi:..............phút; giờ bắt đầu:........h........*Địa điểm:..............................', pageWidth / 2, currentY, { align: 'center' });

        // --- 5. BẢNG DANH SÁCH (10 cột) ---
        currentY += 15;

        // Task 8.2.4: Định nghĩa 10 cột (bỏ cột Tên riêng, ghép vào Họ và tên)
        const columns = [
            { header: 'Stt', width: 22, align: 'center' },
            { header: 'Mã số', width: 73, align: 'left' },
            { header: 'Họ và tên', width: 135, align: 'left' },  // Ghép Holot + Ten
            { header: 'Ngày sinh', width: 57, align: 'center' },
            { header: 'Lớp SH', width: 70, align: 'left' },
            { header: 'Số tờ\n(Đề)', width: 25, align: 'center' },
            { header: 'Điểm\nthi\n(Số)', width: 30, align: 'center' },
            { header: 'Điểm\nthi\n(Chữ)', width: 40, align: 'center' },
            { header: 'Ký tên', width: 55, align: 'center' },
            { header: 'Ghi\nchú', width: 45, align: 'center' }
        ];

        // Tính vị trí x cho mỗi cột
        let startX = marginLeft;
        const colPositions = [];
        columns.forEach((col, i) => {
            colPositions.push({ x: startX, width: col.width, header: col.header, align: col.align });
            startX += col.width;
        });

        const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
        const rowHeight = 18;
        const headerHeight = 36;

        // Vẽ header bảng
        doc.setFontSize(10);
        doc.setFont('Times-New-Roman', 'bold');

        // Vẽ viền header
        doc.rect(marginLeft, currentY, tableWidth, headerHeight);

        // Vẽ các cột header
        let colX = marginLeft;
        columns.forEach((col, i) => {
            // Vẽ đường dọc
            if (i > 0) {
                doc.line(colX, currentY, colX, currentY + headerHeight);
            }
            // Căn giữa text trong header
            const textX = colX + col.width / 2;
            const lines = col.header.split('\n');
            const lineHeight = 10;
            const startY = currentY + (headerHeight - lines.length * lineHeight) / 2 + 8;
            lines.forEach((line, lineIdx) => {
                doc.text(line, textX, startY + lineIdx * lineHeight, { align: 'center' });
            });
            colX += col.width;
        });

        currentY += headerHeight;

        // Sắp xếp sinh viên: Lớp SH → Tên → Họ lót → Ngày sinh
        const sortedStudents = [...students].sort((a, b) => {
            // Lớp SH
            const lopA = (a.LopSH || a.Tenlop || '').toLowerCase();
            const lopB = (b.LopSH || b.Tenlop || '').toLowerCase();
            if (lopA !== lopB) return lopA.localeCompare(lopB, 'vi');
            // Tên
            const tenA = (a.Ten || '').toLowerCase();
            const tenB = (b.Ten || '').toLowerCase();
            if (tenA !== tenB) return tenA.localeCompare(tenB, 'vi');
            // Họ lót
            const holotA = (a.Holot || '').toLowerCase();
            const holotB = (b.Holot || '').toLowerCase();
            if (holotA !== holotB) return holotA.localeCompare(holotB, 'vi');
            // Ngày sinh
            return new Date(a.Ngaysinh) - new Date(b.Ngaysinh);
        });

        // Vẽ các dòng dữ liệu
        doc.setFont('Times-New-Roman', 'normal');
        doc.setFontSize(10);

        sortedStudents.forEach((student, idx) => {
            // Kiểm tra nếu cần sang trang mới
            if (currentY + rowHeight > pageHeight - marginBottom - 80) {
                doc.addPage();
                addWatermark();
                currentY = marginTop;
            }

            // Vẽ viền dòng
            doc.rect(marginLeft, currentY, tableWidth, rowHeight);

            // Vẽ các cột và dữ liệu
            colX = marginLeft;
            const textY = currentY + rowHeight / 2 + 3;

            // STT (cột 1)
            doc.line(colX + 22, currentY, colX + 22, currentY + rowHeight);
            doc.text(String(idx + 1), colX + 12.5, textY, { align: 'center' });
            colX += 22;

            // Mã số (cột 2)
            doc.line(colX + 73, currentY, colX + 73, currentY + rowHeight);
            doc.text(student.Maso || '', colX + 3, textY);
            colX += 73;

            // Họ và tên (cột 3) - Task 8.2.4: ghép Holot + " " + Ten
            const hoVaTen = `${student.Holot || ''} ${student.Ten || ''}`.trim();
            doc.line(colX + 135, currentY, colX + 135, currentY + rowHeight);
            doc.text(hoVaTen, colX + 3, textY);
            colX += 135;

            // Ngày sinh (cột 4)
            doc.line(colX + 57, currentY, colX + 57, currentY + rowHeight);
            const ngaysinh = student.Ngaysinh ? moment(student.Ngaysinh).format('DD/MM/YYYY') : '';
            doc.text(ngaysinh, colX + 29, textY, { align: 'center' });
            colX += 57;

            // Lớp SH (cột 5)
            doc.line(colX + 70, currentY, colX + 70, currentY + rowHeight);
            doc.text(student.LopSH || student.Tenlop || '', colX + 3, textY);
            colX += 70;

            // Số tờ (cột 6 - để trống)
            doc.line(colX + 25, currentY, colX + 25, currentY + rowHeight);
            colX += 25;

            // Điểm số (cột 7 - để trống)
            doc.line(colX + 30, currentY, colX + 30, currentY + rowHeight);
            colX += 30;

            // Điểm chữ (cột 8 - để trống)
            doc.line(colX + 40, currentY, colX + 40, currentY + rowHeight);
            colX += 40;

            // Ký tên (cột 9 - để trống)
            doc.line(colX + 55, currentY, colX + 55, currentY + rowHeight);
            colX += 55;

            // Ghi chú (cột 10 - để trống) - cột cuối không cần vẽ đường dọc

            currentY += rowHeight;
        });

        // --- 6. FOOTER ---
        // Task 8.2.4: Dòng thứ 1 phía dưới bảng - fontsize 10pt
        currentY += 20;
        doc.setFontSize(11);
        doc.setFont('Times-New-Roman', 'normal');
        doc.text(`*Phòng thi này có: ${students.length} SV đủ điều kiện dự thi; *Dự thi:..........SV; *Vắng:..........SV./.`, pageWidth / 2, currentY, { align: 'center' });

        currentY += 20;
        doc.setFont('Times-New-Roman', 'italic');
        doc.text(`Ngày chấm thi:...... tháng.......... năm 20...`, pageWidth - marginRight - 110, currentY, { align: 'center' });

        // Phần chữ ký
        currentY += 20;
        doc.setFontSize(11);
        doc.setFont('Times-New-Roman', 'bold');

        // COI THI
        doc.text('COI THI', marginLeft + 80, currentY, { align: 'center' });
        // CHẤM THI
        doc.text('CHẤM THI', pageWidth - marginRight - 100, currentY, { align: 'center' });

        currentY += 15;
        doc.setFont('Times-New-Roman', 'normal');
        doc.text('CB coi thi 1', marginLeft + 40, currentY, { align: 'center' });
        doc.text('CB coi thi 2', marginLeft + 130, currentY, { align: 'center' });
        doc.text('Giám khảo 1', pageWidth - marginRight - 140, currentY, { align: 'center' });
        doc.text('Giám khảo 2', pageWidth - marginRight - 50, currentY, { align: 'center' });

        // Cán bộ nhập điểm
        currentY += 70;
        doc.text('Cán bộ nhập điểm:...............................................................', marginLeft, currentY);

        // Set file properties
        const fileName = `DS_DuThi_${roomData?.TenPhongthi || 'PhongThi'}.pdf`;
        doc.setProperties({ title: fileName });

        toast.dismiss(toastId);
        toast.success('Đã tạo danh sách dự thi!');

        return doc.output('blob');

    } catch (error) {
        console.error("Lỗi khi tạo PDF danh sách dự thi:", error);
        toast.error("Đã xảy ra lỗi khi tạo file PDF.");
        toast.dismiss(toastId);
        return null;
    }
};

/**
 * Mở PDF trong tab mới hoặc tải về
 * @param {Blob} pdfBlob - PDF blob
 * @param {string} filename - Tên file
 */
export const openOrDownloadPDF = (pdfBlob, filename) => {
    if (!pdfBlob) return;

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';

    // Mở trong tab mới để xem/in
    window.open(url, '_blank');

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};
