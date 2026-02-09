** Xây dựng chức năng: Xây dựng Lịch thi học phần **

# **Part 1**: Bạn hãy đọc và phân tích kỹ lưỡng các yêu cầu để xây dựng kế hoạch (planning) và thực thi đối với Part 2, Part 3, Part 4,...
## Bạn hãy đọc kỹ lưỡng các file credit-class-management.js và CreditClassManagementPage.jsx. Đây là phân hệ “Quản lý lớp học phần” trong dự án. Mô tả cơ bản chức năng hiện tại như sau:
### Khung bên trái: Chứa cây lựa chọn (Tree View), cấu trúc gồm 5 cấp:
1. **Cấp 1**: Năm học
2. **Cấp 2**: Học kỳ
3. **Cấp 3**: Đơn vị quản lý (Phòng, Khoa)
4. **Cấp 4**: Học phần
5. **Cấp 5**: Tên Lớp học phần
### Khung bên phải, gồm 2 danh sách:
1. **Danh sách lớp HP**: Chứa danh mục các học phần thuộc các cấp từ Cấp 2 đến Cấp 4; Danh sách này được hiển thị khi người dùng nhấp vào Cấp 2 đến Cấp 4.
2. **Danh sách SV**: Đây là danh sách sinh viên thuộc lớp học phần. Nó được hiển thị khi người dùng nhấp vào Cấp 5 (Tên Lớp học phần)
## Cấu trúc dữ liệu của các table liên quan đến phân hệ và cả dự án có trong nội dung của file QLDT-app\Database\Databases.md 

# **Part 2**: Bổ sung thêm các nút lệnh để gọi các chức năng liên quan đến **Xây dựng lịch thi học phần**. Yêu cầu:

## **Task**: Trên **Danh sách lớp HP**, thêm nút lệnh (command button) “Thi học phần” theo dạng DropdownMenu, gồm 2 menu con (submenu): “Tạo phòng thi” và “Xếp lịch thi”.
### *Thuộc tính*: Nút lệnh “Thi học phần” mặc định không khả dụng (người dùng nhắp chọn sẽ không hoạt động) đối với người dùng, ngoại trừ người dùng là isAdmin hoặc isKhaothi. 
### *Vị trí*: nút lệnh này bố trí bên phải của nút lệnh “Xem” hiện có.
### *Phân quyền*: Chỉ có người dùng “Admin” (Giaovien.isAdmin = -1) hoặc người dùng “Khảo thí” Giaovien.isKhaothi = -1) mới có quyền thực hiện lệnh này. Khi người dùng là “Admin”  hoặc “Khảo thí” nhấn chọn Cấp 4 (Học phần) của cây bên trái thì nút lệnh “Thi học phần” được khả dụng.
*Chú ý:* Khi Admin hoặc Khảo thí nhấn chọn các Cấp khác trên cây thì nút lệnh “Thi học phần” vẫn không khả dụng.

# **Part 3**: Xây dựng trang “Tạo phòng thi”
Khi người dùng chọn menu “Tạo phòng thi”: sẽ hiển thị Trang “Tạo phòng thi” gồm 4 khu vực: 
- Tiêu đề trang; 
- control lựa chọn “Lần thi”; 
- Nút lệnh “Đóng” trang (command button “Close”) 
- Khu vực dữ liệu: gồm 3 bảng danh sách, mỗi danh sách kèm những nút lệnh (command button) để xử lý dữ liệu trong danh sách liên quan, gồm:
+ DS1: “Danh sách sinh viên đủ điều kiện dự thi”
+ DS2: “Danh sách phòng thi”
+ DS3: “Danh sách sinh viên đã xếp phòng thi”
(tham khảo ảnh “TaoPhongthi.jpg” đính kèm). 

## **Task 3.1** Hãy xây dựng Trang “Tạo phòng thi”. Yêu cầu trang như sau:
- UX/UI hiện đại, bố trí các khu vực khoa học và tạo sự trải nghiệm tốt nhất đối với người dùng.
- Tiêu đề trang: “TẠO PHÒNG THI”
- Tiêu đề phụ: Học phần + “ (“ + Học kỳ + Năm học + “)”
- Combobox “Lần thi”, gồm 3 giá trị: “Giữa kỳ-GK”, “Cuối kỳ L1”, “Cuối kỳ L2”. *Vị trí*: Dưới tiêu đề phụ và bên trái trang.
- Nút lệnh “Đóng”: Dùng để đóng trang và quay lại trang “Quản lý lớp học phần”. *Vị trí*: cùng dòng với “Lần thi” và đặt bên phải trang.

## **Task 3.2**: Xây dựng bảng **Danh sách sinh viên đủ điều kiện dự thi** (DS1). Yêu cầu:
### Bảng này hiển thị Danh sách sinh viên đủ điều kiện dự thi và chưa xếp phòng thi. Danh sách này lấy từ danh sách sinh viên thuộc Lớp học phần (Cấp 5 trên cây). Đồng thời, phụ thuộc lần thi được chọn tại combobox “Lần thi”.
- Khi “Lần thi” = “Giữa kỳ-GK”: DS1 hiển thị các sinh viên thỏa điều kiện (SinhvienLopHP.ThiL0 = -1) And (SinhvienLopHP.MaPT0 = Null)
- Khi “Lần thi” = “Cuối kỳ L1”: DS1 hiển thị các sinh viên thỏa điều kiện (SinhvienLopHP.ThiL1 = -1) And (SinhvienLopHP.MaPT1 = Null)
- Khi “Lần thi” = “Cuối kỳ L2”: DS1 hiển thị các sinh viên thỏa điều kiện (SinhvienLopHP.ThiL2 = -1) And (SinhvienLopHP.MaPT2 = Null)
### DS1 gồm các cột: 
- “Stt”: Đây là số thứ tự tự động cho danh sách
- “Chọn” (Checkbox): Cho phép người dùng chọn 1 sinh viên hoặc nhiều sinh viên hoặc tất cả (all) sinh viên trong danh sách.
- “Mã số” (Sinhvien.Maso): Chứa mã số sinh viên
- “Họ lót” (Sinhvien.Holot): Chứa họ lót
- “Tên” (Sinhvien.Ten): Chứa tên sinh viên
- “Ngày sinh” (Sinhvien.Ngaysinh): Chứa ngày sinh sinh viên, hiển thị theo dạng “DD/MM/YYYY”
- “Lớp học phần” (LopHP.Tenlop): Chứa tên lớp học phần (tương tự Cấp 5 của cây bên trái)
- “Lớp sinh hoạt” (Lop.Tenlop): Chứa tên lớp sinh hoạt
### Thuộc tính chung của các cột: “Mã số”, “Họ lót”, “Tên”, “Ngày sinh” “Lớp học phần”, “Lớp sinh hoạt”: 
- Mặc định: hiển thị.
- Cho phép người dùng sắp xếp tăng dần hoặc giảm dần (Nhấp chuột vào tiêu đề cột để sắp xếp).
### Định dạng danh sách:
- Danh sách được sắp xếp mặc định theo thứ tự: “Lớp học phần” (tăng dần) → “Tên” (tăng dần) → “Họ lót” (tăng dần)
- Khi sinh viên được chọn (checked): Highlight toàn bộ dòng (record) dữ liệu của sinh viên. Ngược lại, không chọn (bỏ chọn) hiển thị bình thường.

## **Task 3.3**: Tạo nút lệnh “Thêm vào phòng thi” để xử lý dữ liệu trong DS1
- *Chức năng*: Thêm thí sinh được chọn (checked) vào Phòng thi đang được chọn trong “Danh sách phòng thi”.
- *Thuộc tính*: Nút lệnh khả dụng khi người dùng đã chọn (checked) ít nhất 1 sinh viên trong DS1, đồng thời đã nhấp chọn Phòng thi trong “Danh sách phòng thi”
- *Logic xử lý*: khi người dùng nhấp chọn “Thêm vào phòng thi”: 
(1). Thêm “Mã phòng thi” (MaPTX) tương ứng đối với từng sinh viên đã được chọn (checked) trong table SinhvienLopHP:
+ Nếu Lần thi = “Giữa kỳ-GK”, thì SinhvienLopHP.MaPT0  = Phongthi0.MaPT0
+ Nếu Lần thi = “Cuối kỳ L1”, thì SinhvienLopHP.MaPT1 = Phongthi1.MaPT1 
+ Nếu Lần thi = “Cuối kỳ L2”, thì SinhvienLopHP.MaPT2 = Phongthi2.MaPT2

(2). Làm mới (refresh) các danh sách: DS1, DS2, DS3

(3) Ghi log với nội dung: 
+ Cuaso: “Tạo phòng thi”
+ Congviec: “Thêm SV vào phòng thi ”
+ Ghichu: Tên phòng thi + ”: ” + Đếm tổng số lượng sinh viên được thêm + “ sinh viên”
*Lưu ý*: Trên file server.js đã có gọi hàm ghi log tập trung “writeLog”

## **Task 3.4**: Xây dựng bảng **Danh sách phòng thi** (DS2). Yêu cầu:
### Bảng này hiển thị danh sách Phòng thi, phụ thuộc lần thi được chọn tại combobox “Lần thi”.
- Khi Lần thi = “Giữa kỳ-GK”: DS2 hiển thị Phòng thi được lấy từ table “Phongthi0”
- Khi Lần thi = “Cuối kỳ L1”: DS2 hiển thị Phòng thi được lấy từ table “Phongthi1”
- Khi Lần thi = “Cuối kỳ L2”: DS2 hiển thị Phòng thi được lấy từ table “Phongthi2” 
*Ghi chú*: Phongthi0, Phongthi1, Phongthi2 gọi chung là PhongthiX
### DS2 gồm các cột: 
- “Stt”: Đây là số thứ tự tự động cho danh sách
-  “Tên phòng thi” (PhongthiX.Phongthi): Chứa tên phòng thi. 
*Chú ý*: Tại cột này, cho phép người dùng nhấn đúp chuột (double click) vào ô chứa tên phòng thi để cập nhật trực tiếp (Inline Editing) tên phòng thi. Nhấp ra ngoài hoặc nhấn phím Enter để lưu lại dữ liệu. Khi lưu thành công thì tiến hành ghi log:
+ Cuaso: “Tạo phòng thi”
+ Congviec: “Sửa Phòng thi”
+ Ghichu: Tên phòng thi cũ ”→” Tên phòng thi mới

- “Số lượng”: Đếm số lượng sinh viên có trong DS3
- “Ngày thi” (PhongthiX.Ngay): Chứa Ngày thi
- “Thời gian” = PhongthiX.Gio + “:” + PhongthiX.Phut + “ (“ + PhongthiX.Thoigian + “ phút)”
- “CB coi thi 1” (Giaovien.Hoten) - *Lưu ý*: Mối quan hệ PhongthiX.MaGV1 = Giaovien.MaGV
- “CB coi thi 2” (Giaovien.Hoten) - *Lưu ý*: Mối quan hệ PhongthiX.MaGV2 = Giaovien.MaGV
- “Địa điểm thi” = Phonghoc.Tenphong + ” (” + Nhomphong.Nhomphong +”)”

### Định dạng DS2: 
- Phòng thi (record) được chọn (select) mặc định là record cuối cùng của DS2
- Khi phòng thi được chọn (người dùng nhấp chọn hoặc chọn mặc định): Highlight toàn bộ record

## **Task 3.5**:  tạo nút lệnh “Tạo phòng thi” và “Xóa phòng thi” để xử lý dữ liệu trong DS2
### Nút lệnh “Tạo phòng thi”
- *Chức năng*: Tạo phòng thi mới cho các “Lần thi” được chọn.
- *Thuộc tính*: Nút lệnh luôn khả dụng.
- *Logic xử lý*: khi người dùng nhấp chọn “Tạo phòng thi”: 
(1). Thêm (add new) dữ liệu cho 4 trường: PhongthiX.MaPTX (Mã phòng thi), PhongthiX.Phongthi (Phòng thi), PhongthiX.MaKND, PhongthiX.MaCT. Cách xác định dữ liệu thêm vào như sau:

a) **PhongthiX** là viết tắt của các table Phongthi0, Phongthi1, Phongthi2, được xác định như sau:
+ Nếu Lần thi = “Giữa kỳ-GK”, thì thêm dữ liệu vào table Phongthi0 
+ Nếu Lần thi = “Cuối kỳ L1”, thì thêm dữ liệu vào table Phongthi1
+ Nếu Lần thi = “Cuối kỳ L2”, thì thêm dữ liệu vào table Phongthi2

b) **MaPTX** là viết tắt của các trường MaPT0, MaPT1, MaPT2 tương ứng trong các table Phongthi0, Phongthi1 và Phongthi2. MaPTX được xác định gồm 9 ký tự “HHHMMMMXX”, trong đó:
+ “HHH” là mã học kỳ (MaHK) lấy dữ liệu từ Cấp 2 đang được chọn của cây. Ví dụ: “241”, “251”, “252”,...
+ “MMMM” là mã học phần (MaHP) lấy dữ liệu từ Cấp 4 đang được chọn của cây. Ví dụ: “0001”, “0232”, …; 
+ “XX” là số thứ tự tăng dần mỗi lần thêm mới 1 phòng thi trong cùng “Lần thi”. Ví dụ: “01”, “02”, “03” (nếu như chỉ có 1 phòng thi: HHHMMMM thì XX=”01”; nếu có thêm 1 phong thi: HHHMMMM (trùng với lần 1) thì XX=“02”,... ví dụ: “251002301”, “251002302”, “251004401”, “251004402”, “251004403”)

c) **Phongthi** là trường dữ liệu có giá trị mặc định mỗi khi thêm mới là: “P” + XX + “-” + TênHP Viettat + “-” + 2 ký tự cuối của Lần thi đang được chọn.
+ XX: được xác định giống như XX tại trường MaPTX 
+ Tên HP viettat: được xác định tại Cấp 4 (Hocphan.Hocphan) đang được chọn trên cây; lấy dữ liệu tương ứng tại Hocphan.Viettat. Nếu số ký tự của Hocphan.Viettat > 40 ký tự, thì cắt bỏ phần sau và chỉ lấy đúng 40 ký tự bắt đầu từ vị trí đầu tiên.
+ *Ví dụ*: Lần thi = “Cuối kỳ L1”; trong bảng Danh sách phòng thi của lần thi trên đã tồn tại 1 phòng thi; Cấp 4 trên cây đang là học phần “Bảng tính Excel” (tên học phần viết tắt là “Ms Excel”) → Tên phòng thi = “P02-Ms Excel-L1”

d) **MaKND**: dữ liệu được lấy từ LopHP.MaKND, cách lấy như sau:
+ MaHK: được xác định từ Cấp 2 đang được chọn trên cây
+ MaHP: được xác định từ Cấp 4 đang được chọn trên cây
→ lấy giá trị của MaHK và MaHP được xác định trên, dò tìm trong table LopHP. Nếu giá trị LopHP.MaHK = MaHK và LopHP.MaHP = MaHP thì lấy giá trị tương ứng tại trường LopHP.MaKND

e) **MaCT**: dữ liệu được lấy từ LopHP.MaCT, cách lấy giống như cách lấy MaKND

(2). Làm mới (refresh) các danh sách: DS2

(3) Ghi log với nội dung: 
+ Cuaso: “Tạo phòng thi”
+ Congviec: “Thêm Phòng thi ”
+ Ghichu: Tên phòng thi 
*Lưu ý*: Trên file server.js đã có gọi hàm ghi log tập trung “writeLog”

### Nút lệnh “Xóa phòng thi” 
- *Chức năng*: Xóa phòng thi đang được chọn.
- *Thuộc tính*: Nút lệnh khả dụng khi cột “Số lượng”=0. Nghĩa là, DS3 không có sinh viên (trong phòng thi không có sinh viên)
- *Logic xử lý*: khi người dùng nhấp chọn “Xoá phòng thi” (1) Nếu thỏa mãn điều kiện (phòng thi không có sinh viên) thì tiến hành xóa dữ liệu trong table PhongthiX tương ứng.
(1) Làm mới (refresh) các danh sách: DS2
(3) Ghi log với nội dung: 
+ Cuaso: “Tạo phòng thi”
+ Congviec: “Xóa Phòng thi ”
+ Ghichu: Tên phòng thi 
*Lưu ý*: Trên file server.js đã có gọi hàm ghi log tập trung “writeLog”

## **Task 3.6**: Xây dựng bảng **Danh sách sinh viên đã xếp phòng thi** (DS3). Yêu cầu:
### Bảng này hiển thị Danh sách sinh viên đã được xếp lịch thi. Nghĩa là, các trường SinhvienLopHP.MaPT0 hoặc SinhvienLopHP.MaPT1 hoặc SinhvienLopHP.MaPT2 có dữ liệu (<> Null).
Danh sách này hiển thị phụ thuộc vào Phòng thi trong DS2 được chọn. Nghĩa là, khi người dùng nhấp chọn Phòng thi trong DS2 thì sinh viên trong DS3 được lọc theo các cột: 
- SinhvienLopHP.MaPT0 <> Null (nếu “Lần thi” = “Giữa kỳ-GK”), 
- SinhvienLopHP.MaPT1 <> Null (nếu “Lần thi” = “Cuối kỳ L1”), 
- SinhvienLopHP.MaPT2 <> Null (nếu “Lần thi” = “Cuối kỳ L2”)

### Tiêu đề của DS3: “Danh sách sinh viên đã xếp phòng thi: ” + Tên phòng thi (được chọn tại DS2).

### DS3 gồm các cột giống như DS1

### Thuộc tính chung của các cột: “Mã số”, “Họ lót”, “Tên”, “Ngày sinh” “Lớp học phần”, “Lớp sinh hoạt”: 
- Mặc định: hiển thị.
- Cho phép người dùng sắp xếp tăng dần hoặc giảm dần (Nhấp chuột vào tiêu đề cột để sắp xếp).
#### Định dạng DS3:
- Danh sách được sắp xếp mặc định theo thứ tự: “Lớp học phần” (tăng dần) → “Tên” (tăng dần) → “Họ lót” (tăng dần)
- Khi sinh viên được chọn (checked): Highlight toàn bộ dòng (record) dữ liệu của sinh viên. Ngược lại, không chọn (bỏ chọn) hiển thị bình thường.

## **Task 3.7**: Tạo nút lệnh “Xóa khỏi phòng thi” để xử lý dữ liệu trong DS3
- *Chức năng*: Xóa (remove) thí sinh được chọn (checked) khỏi Phòng thi.
- *Thuộc tính*: Nút lệnh khả dụng khi người dùng đã chọn (checked) ít nhất 1 sinh viên trong DS3
- *Logic xử lý*: khi người dùng nhấp chọn “Xóa khỏi phòng thi”: 
(1). Xóa giá trị “Mã phòng thi” (MaPTX) tương ứng đối với từng sinh viên đã được chọn (checked) trong table SinhvienLopHP trở về giá trị Null:
+ Nếu Lần thi = “Giữa kỳ-GK”, thì SinhvienLopHP.MaPT0  = Null
+ Nếu Lần thi = “Cuối kỳ L1”, thì SinhvienLopHP.MaPT1 = Null 
+ Nếu Lần thi = “Cuối kỳ L2”, thì SinhvienLopHP.MaPT2 =Null

(2). Làm mới (refresh) các danh sách: DS1, DS2, DS3

(3) Ghi log với nội dung: 
+ Cuaso: “Tạo phòng thi”
+ Congviec: “Xóa SV khỏi phòng thi ”
+ Ghichu: Tên phòng thi + ”: ” + Đếm tổng số lượng sinh viên được thêm + “ sinh viên”
*Lưu ý*: Trên file server.js đã có gọi hàm ghi log tập trung “writeLog”

# **Part 4**: Xây dựng trang “Xếp lịch thi”
Khi người dùng chọn menu “Xếp lịch thi” sẽ hiển thị Trang “Xếp lịch thi”.

## Bạn hãy thực hiện các Part 1, Part 2, Part 3.
## Yêu cầu của Part 4, tôi sẽ mô tả và gửi sau!
