** Tiếp tục thực hiện Part 4, Part 5 nối tiếp nhiệm vụ tại “TaotrangLichThi_1.md” **

# **Part 4**: Xây dựng trang Xếp lịch thi
Khi người dùng chọn submenu “Xếp lịch thi”: sẽ hiển thị Trang xếp lịch thi,  gồm 4 khu vực: 
- Tiêu đề trang; 
- control lựa chọn “Lần thi”; 
- Các nút lệnh (command buttons);
- Khu vực dữ liệu: có 1 bảng “Danh sách phòng thi” và 1 bảng “Danh sách sinh viên thuộc phòng thi”.

## **Task 4.1** Hãy xây dựng trang Xếp lịch thi với UX/UI hiện đại, bố trí các khu vực khoa học và tạo sự trải nghiệm tốt nhất đối với người dùng, sử dụng icon phù hợp với các chức năng của trang. 
Yêu cầu như sau: 
- Tiêu đề trang: “PHÒNG THI”
- Tiêu đề phụ: Học phần + “ (“ + Học kỳ + Năm học + “)”
- Combobox “Lần thi”, gồm 3 giá trị: “Giữa kỳ-GK”, “Cuối kỳ L1”, “Cuối kỳ L2” (thực hiện giống như **Task 3.1**)
- Các nút lệnh: 
+ “Lịch coi thi”: Cập nhật Ngày, Giờ thi, CB coi thi 1/2, Địa điểm thi,...
+ “In phòng thi”: In Danh sách sinh viên của phòng thi được chọn.
+ “Xuất phòng thi”: Xuất Danh sách sinh viên của phòng thi được chọn sang Excel

## **Task 4.2**: Xây dựng bảng “Danh sách phòng thi” (gọi tắt DS4). 

### Bảng danh sách này được xây dựng giống như DS2 thuộc **Task 3.4**, các nội dung giống với DS2, gồm:
- Tên danh sách
- Hiển thị danh sách
- Các cột dữ liệu (*Lưu ý:* cột “Ngày thi” hiển thị theo định dạng “DD/MM/YYYY”)
- Định dạng, chế độ mặc Định.
(Danh sách này không có các nút lệnh “Tạo phòng thi”, “Xóa phòng thi”)
### Tạo nút lệnh dạng Toggle button (bật/tắt; Hiện/Ẩn) “Ẩn/Hiện danh sách sinh viên”:
- Vị trí: Bên dưới danh sách phòng thi (phần footer của danh sách)
- Chức năng: Khi người phòng thi được chọn và người dùng nhấn nút lệnh này sẽ hiển thị (bật) hoặc ẩn (tắt) “Danh sách sinh viên thuộc phòng thi”.
- Mặc định chế độ: Tắt (Ẩn) - Không hiển thị “Danh sách sinh viên thuộc phòng thi”

## **Task 4.3**: Xây dựng bảng “Danh sách sinh viên thuộc phòng thi” (gọi tắt là DS5).
 
### Bảng danh sách này được xây dựng giống như DS3 thuộc **Task 3.6**, các nội dung giống với DS3, gồm:
- Tên danh sách
- Hiển thị danh sách
- Các cột dữ liệu (ngoại trừ cột “Chọn” - Bỏ cột checkbox này). *Lưu ý:* cột “Ngày sinh” hiển thị theo định dạng “DD/MM/YYYY”
- Thuộc tính các cột
- Định dạng.
(Danh sách này không có các nút lệnh “Xóa khỏi phòng thi”)
### Vị trí và mặc định:
- Vị trí: Ngay bên dưới DS4
- Mặc định: Không hiển thị khi khởi động

# **Part 5**: Xây dựng form cập nhật lịch coi thi

## **Task 5.1**: Xây dựng form “Cập nhật lịch coi thi”

### Khi người dùng nhấn chọn nút lệnh “Lịch coi thi”, hiển thị form cập nhật lịch thi theo dạng Pop-up (Modal Form).
Khi mở form, dữ liệu được load từ các trường trong table PhongthiX lên các control tương ứng trên form. Controls trên form như sau (tham khảo ảnh Xeplichthi.jpg):
- Tên form: “CẬP NHẬT LỊCH THI”
- Tên phụ: “Phòng thi: ” + Tên phòng thi (*Tên phòng thi*: là cột ”Tên phòng thi” của DS4)
- Control “Ngày thi” (PhongthiX.Ngay): chứa ngày thi dạng “DD/MM/YYYY” (control này, người dùng có thể nhập ngày thi trực tiếp hoặc hiển thị Lịch tháng để chọn), Ngày thi mặc định là sau ngày hiện tại 7 ngày; control bắt buộc nhập.
- “Giờ thi” gồm combobox “Giờ” (PhongthiX.Gio) và Combobox “Phút” (PhongthiX.Phut); control bắt buộc nhập.
+ combobox “Giờ”, danh sách gồm các giá trị số: 7, 8, 9, 10, 13, 14, 15, 16; control bắt buộc nhập.
+ combobox “Phút”, danh sách gồm các giá trị số: 00, 15, 30, 45; control bắt buộc nhập.
- combobox “Thời gian (phút)” (PhongthiX.Thoigian), danh sách gồm các giá trị số: 45, 60, 90, 120, 150, 180, 210, 240; control bắt buộc nhập.
- combobox ”Địa điểm” (Nhomphong.Nhomphong). combobox này chỉ là điều kiện để lọc các giá trị của combobox ”Phòng thi”; mặc định là giá trị đầu tiên trong danh sách.
- combobox ”Phòng” (PhongthiX.MaPH): danh sách chứa tên phòng (Phonghoc.Tenphong), loại trừ những Phòng xếp Lịch dạy, Lịch thi. Giá trị của combobox này phụ thuộc vào combobox ”Địa điểm”, control bắt buộc nhập.
- textbox “Ghi chú” (PhongthiX.Ghichu)
- combobox “CB coi thi 1” (PhongthiX.MaGV1): danh sách chứa Họ và tên giáo viên (Giaovien.Hoten), loại trừ những giáo viên đã có Lịch dạy, Lịch thi, control này cho phép để trống.
*Lưu ý*: Mối quan hệ các table PhongthiX.MaGV1 → Giaovien.MaGV
- combobox “CB coi thi 2” (PhongthiX.MaGV2): danh sách chứa Họ và tên giáo viên (Giaovien.Hoten), loại trừ những giáo viên đã có Lịch dạy, Lịch thi, control này cho phép để trống.
*Lưu ý*: Mối quan hệ các table PhongthiX.MaGV2 → Giaovien.MaGV

## **Task 5.2**: Tạo và xử lý các nút lệnh trong form “Cập nhật lịch coi thi”

### Nút lệnh “Xóa”: 
Khi người dùng nhấn nút lệnh này hiển thị thông báo để cảnh báo người dùng. Nếu người dùng ”Đồng ý” thì thực hiện xóa:
1. Xóa dữ liệu tại các control trên form được xóa trống

2. Xóa dữ liệu các trường trong table PhongthiX có liên quan đến các control trên form và thuộc Phòng thi đang được chọn tại DS4.

3. Ghi log khi xóa thành công:
+ Cuaso: “Cập nhật lịch coi thi”
+ Congviec: ”Xóa dữ liệu lịch coi thi ”
+ Ghichu: ”Phòng thi: ” + Tên phòng thi

### Nút lệnh “Lưu”: 
Lưu dữ liệu trên form vào các trường tương ứng trong table PhongthiX, gồm các trường “Ngay”, “Gio”, “Phut”, “Thoigian”, “MaPH”, “MaGV1”, “MaGV2”, “Tiet”, “Sotiet”

1. Xác định dữ liệu để lưu vào trường: Tiet, Sotiet (dựa vào dữ liệu của các trường Gio, Phut, Thoigian):
- **Tiet** (Tiết bắt đầu): Buổi sáng bắt đầu từ 7:00, tương ứng với Tiet = 1; Buổi chiều bắt đầu từ 13:00, tương ứng với Tiet = 7. Mỗi tiết tương đương 50 phút. 
*Ví dụ:* Người dùng chọn: Gio = 7, Phut = 00 hoặc Gio = 7, Phut = 45 → Tiet = 1; Gio = 8, Phut = 30 → Tiet = 2; Gio = 8, Phut = 45 → Tiet = 3; Gio = 13, Phut = 30 → Tiet = 7; …
- **Sotiet** (khoảng thời gian từ Tiet đến kết thúc): Được xác định dựa vào trường Thoigian.
*Ví dụ:* Người dùng chọn: Gio = 7, Phut = 00 và Thoigan = 45 → Sotiet = 1;  Gio = 7, Phut = 00 và Thoigan = 60 → Sotiet = 2;  Gio = 13, Phut = 30 và Thoigan = 45 → Sotiet = 2; Gio = 13, Phut = 30 và Thoigan = 90 → Sotiet = 3;  Gio = 13, Phut = 30 và Thoigan = 180 → Sotiet = 5,...

2. **Kiểm tra trùng dữ liệu trước khi lưu:** Dựa vào trường “Ngay”, “Tiet”, “Sotiet”, “MaGV1”, “MaGV2”, “MaPH” để kiểm tra trùng (1) Trùng Lịch coi thi của CB coi thi 1/2; (2) Trùng Lịch giảng dạy của CB coi thi 1/2, (3) Trùng phòng thi; (4) Trùng phòng học;  (5) Trùng Lịch thi của từng sinh viên; (6) Trùng Lịch học của từng sinh viên.

- Kiểm tra trùng Lịch thi, Phòng thi (1), (3), (5): So sánh với các trường “Ngay”, “Tiet”, “Sotiet”, “MaGV1”, “MaGV2”, “MaPH” trong các table PhongthiX
- Kiểm tra trùng Lịch dạy, lịch học, Phòng học (2), (4), (6): So sánh với các trường “Ngay”, “Tiet”, “Sotiet”, “MaGV”, “MaPH” trong các table TKB
- Trùng thời gian trên lịch học, lịch thi giữa thời gian trên form và thời gian trên PhongthiX, TKB là: Cùng ngày, cùng buổi và Tiet, Sotiet giao nhau.

→ **Chú ý:**
- Kiểm tra trùng lịch: bạn có thể tham khảo lại trang “Xây dựng Thời khóa biểu”  (schedule-builder.js, ScheduleBuilderPage.jsx)
- Table PhongthiX là cách viết chung của Phongthi0 (thi Giữa kỳ), Phongthi1 (thi Cuối kỳ L1), Phongthi2 (thi Cuối kỳ L2)
- Đối với các combobox “Phòng”, “CB coi thi 1”, “CB coi thi 2”: Kiểm tra trùng lịch ngay khi người dùng nhập ngày, thời gian và Không cho hiển thị danh sách Phòng, danh sách Giáo viên nếu đã có xếp Lịch thi, Lịch học (không phải kiểm tra lại khi chọn nút “Lưu”)
- Đối với sinh viên trùng Lịch học hoặc Lịch thi (kiểm tra khi “Lưu”), hiển thị **Thông báo** (dialog box), như sau:
“Phòng thi đang xếp lịch có ” + Số lượng sinh viên trùng lịch + “sinh viên trùng lịch học / lịch thi tại:”
“- Lớp học: / Phòng thi: ” + LopHP.Tenlop / PhongthiX.Phongthi
“- Học phần: ” + Hocphan.Hocphan
**Nút lệnh để người dùng lựa chọn:** “Vẫn lưu”, “Thoát”
→ Nếu người dùng chọn “Vẫn lưu”: Tiếp tục thực hiện lưu bình thường. Lưu xong thì đóng Thông báo.

3. Ghi log sau khi Lưu thành công:
+ Cuaso: “Cập nhật lịch coi thi”
+ Congviec: “Lưu thành công ”
+ Ghichu: Tên phòng thi, Ngày thi, Giờ thi, Thời gian, Phòng, CB coi thi 1/2.

#### Nút lệnh “Thoát”: 
Đóng form mà không làm gì.
