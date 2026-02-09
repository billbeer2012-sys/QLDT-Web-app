** Tiếp tục thực hiện Part 6, Part 7 nối tiếp nhiệm vụ tại “TaotrangLichThi_1.md” và “TaotrangLichThi_2.md” **

# **Part 6**: Xây dựng các danh sách dự thi

## **Task 6.1**: Xây dựng Report danh sách dự thi, có thể in ra máy in hoặc lưu dạng PDF

###Khi người dùng nhấn chọn nút lệnh “In danh sách” sẽ mở report “danh sách dự thi”:
- Danh sách dự thi tương tự như ảnh “DSPhongThi.jpg”
- Tham khảo thiết lập và hiển thị danh sách trong phân hệ “Quản lý sinh viên lớp sinh hoạt” (class-management.js, ClassManagementPage.jsx) và file tạo report \client\src\features\class-management\StudentConfirmationGenerator.js 

###Mô tả các nội dung và yêu cầu liên quan:

**1. Định dạng chung:**
- Page size: A4 (210cm x 297cm); top: 2cm, bottom: 1 cm, left: 1cm, right: 0.5cm
- Font mặc định: “Times new roman” (Normal), font size: 11pt
- Giãn cách đoạn (paragraph): before: 3pt; after: 0pt
- Logo chìm (watermark) giống như trong file “StudentConfirmationGenerator.js”

**2. Mô tả report danh sách dự thi: **

* Phần đầu trang:*
- Dòng 1 (“UBND TỈNH CÀ MAU…”) đến dòng 3 (dòng đường kẻ ngang):  Nội dung văn bản và định dạng (căn lề, font style, đường kẻ ngang) được thiết kế giống hệt trong ảnh “DSPhongThi.jpg”.

* Phần tiêu đề nội dung:*
- Dòng 4: nhãn (label) “DANH SÁCH DỰ THI”, căn giữa văn bản, font size: 14pt, chữ in đậm (Bold)
- Dòng 5: “Học phần:    ” + Tên học phần 
- Dòng 6: “Phòng thi:    ” + Tên phòng thi		+ “Lần thi: ” + Lần thi đang được chọn
- Dòng 7: “Học kỳ:        ” + Học kỳ  + “ (” + Năm học + “)”
→ *Chú ý* Từ dòng 4 đến dòng 7: các nhãn, chữ thường (Normal); các trường dữ liệu, chữ in đậm.
- Dòng 8: nhãn “*Ngày thi:......................... *Thời gian thi:.........phút; giờ bắt đầu:..............*Phòng:.........................”, fontsize: 8pt, căn giữa văn bản.

* Phần thân nội dung:*
- Dòng 9, tiêu đề bảng, gồm 11 cột “Stt”, “Mã số”, “Họ và tên”, “Ngày sinh”, “Lớp SH”, “Số tờ (đề)”, “Điểm (số)”, “Điểm (chữ)”, “Ký tên”, “Ghi chú”: Chữ in đậm.
→ *Lưu ý:* “Họ và tên” ghép 2 ô của cột thứ 3 và thứ 4
- Dòng 10, nội dung của bảng, gồm các record chứa thông tin sinh viên trong phòng thi:
+ Cột 1 “Stt”: Đây là số thứ tự tự động, bắt đầu từ 1 đến kết thúc danh sách.
+ Cột 2 “Mã số” (Sinhvien.Maso)
+ Cột 3  (Sinhvien.Holot)
+ Cột 4  (Sinhvien.Ten)
+ Cột 5 “Ngày sinh” (Sinhvien.Ngaysinh): định dạng hiển thị theo dạng “DD/MM/YYYY”
+ Cột 6 “Lớp SH” (Lop.Tenlop)
+ Cột 7, 8, 9, 10, 11: để trống (không có dữ liệu)
→ *Lưu ý:* Danh sách được sắp xếp theo thứ tự: “Lớp SH” (tăng dần) → “Ten” (tăng dần) → “Holot” (tăng dần) → “Ngày sinh” (tăng dần)

* Phần cuối nội dung:* ngay sau khi kết thúc dữ liệu của bảng
- Dòng thứ 1 phía dưới bảng: “*Ds này có: ” + đếm số lượng trong danh sách + “ SV đủ điều kiện dự thi; *Dự thi:..........SV; *Vắng:..........SV./.”, fontsize: 8pt, Italic, căn giữa văn bản.
- Dòng thứ 3 phía dưới bảng (“Ngày chấm thi:...”) đến dòng cuối cùng (“Cán bộ nhập điểm:...”): Nội dung văn bản và định dạng (căn lề, font style, đường kẻ ngang) được thiết kế giống hệt trong ảnh “DSPhongThi.jpg”.

## **Task 6.2**: Xuất danh sách sang Excel

###Khi người dùng nhấn chọn nút lệnh “Xuất danh sách” sẽ xuất ra Excel: Tham khảo phần xuất Excel trong phân hệ “Quản lý sinh viên lớp sinh hoạt” (class-management.js, ClassManagementPage.jsx) và file \client\src\lib\excelExporter.js

### Nội dung file Excel:
- A1: “DANH SÁCH DỰ THI”
- A2: “Học phần: ” + Tên học phần + “ - Phòng thi: ” + Tên phòng thi + “ - Lần thi: ” + Lần thi đang được chọn + “ - Học kỳ: ” + Học kỳ  + “ (” + Năm học + “)”
- Các cột dữ liệu xuất gồm: “Stt”, “Mã số”, “Họ lót”, “Tên”, “Ngày sinh”, “Lớp SH”
→ *Lưu ý:* Danh sách được sắp xếp theo thứ tự: “Lớp SH” (tăng dần) → “Ten” (tăng dần) → “Holot” (tăng dần) → “Ngày sinh” (tăng dần)

# **Part 7**: Sửa các lỗi đã phát hiện

##1. Trong các danh sách: DS1, DS2, DS3, DS4, DS5 các cột có kiểu dữ liệu Ngày tháng, định dạng hiển thị theo “DD/MM/YYYY”

##2. DS2:
- Định dạng font chữ in đậm (Bold) cho các record
- Kiểm tra lại nút lệnh “Xóa phòng thi”: Báo lỗi “Thiếu tham số bắt buộc” mặc dù điều kiện để xóa là đúng (Được xóa phòng thi không có sinh viên).

##3. DS5:
- Định dạng font chữ in đậm (Bold) cho các record
- Record cuối cùng được chọn mặc định khi trang được mở

##4. Form Cập nhật lịch thi:
- Kiểm tra combobox ”Phòng” có được load được dữ liệu khi mở form không (tôi test đôi khi không load được)
- Thông báo cảnh báo khi nhấn nút “Xóa”: Sử dụng thông báo trên Dialog box “Cảnh báo xóa dữ liệu”; Nội dung “Thông tin đã thiết lập Lịch coi thi bị xóa trống. Bạn có chắc chắn xóa không?”; button: “Đồng ý” (Yes), “Không” (No)

