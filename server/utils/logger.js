/*
 * Đường dẫn file: D:\QLDT-app\server\utils\logger.js
 * Thời gian cập nhật: 24/10/2025
 * Tóm tắt những nội dung cập nhật:
 * - SỬA LỖI (Khớp với DB schema 'db_LogWebapp'):
 * 1. Đổi tên tham số 'MaND' -> 'MaUser'.
 * 2. Xóa bỏ tham số 'Ip' (không có trong DB).
 * 3. Đổi tên cột 'Thoidiem' -> 'Thoigian' (cả biến và cột SQL).
 * 4. Cập nhật kiểu dữ liệu: Cuaso (nvarchar(100)), Ghichu (nvarchar(2000)).
 * 5. Cập nhật câu lệnh INSERT cho đúng tên cột.
 */

const sql = require('mssql');
const moment = require('moment-timezone');

/**
 * Ghi log hoạt động của người dùng vào CSDL.
 * @param {object} poolPromise - Lời hứa (Promise) của pool kết nối SQL.
 * @param {string} MaUser - Mã người dùng (từ token).
 * @param {string} Cuaso - Cửa sổ/Trang (ví dụ: 'Đăng nhập', 'Lịch giảng dạy').
 * @param {string} Congviec - Hành động (ví dụ: 'Đăng nhập', 'Mở trang').
 * @param {string} Ghichu - Ghi chú chi tiết (ví dụ: 'Thành công', 'Sai mật khẩu').
 */
// Cập nhật: Sửa signature (bỏ Ip, đổi MaND -> MaUser)
const writeLog = async (poolPromise, MaUser, Cuaso, Congviec, Ghichu) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    // Cập nhật: Đổi tên biến Thoidiem -> Thoigian
    const Thoigian = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');

    // Cập nhật: Truyền tham số
    request.input('MaUser', sql.NVarChar(10), MaUser); // Sửa MaND -> MaUser
    request.input('Thoigian', sql.DateTime, Thoigian); // Sửa Thoidiem -> Thoigian
    request.input('Cuaso', sql.NVarChar(100), Cuaso); // Sửa 200 -> 100
    request.input('Congviec', sql.NVarChar(200), Congviec);
    request.input('Ghichu', sql.NVarChar(2000), Ghichu); // Sửa 200 -> 2000

    // Cập nhật: Sửa câu lệnh INSERT (bỏ Ip, sửa tên cột)
    const query = `
      INSERT INTO db_LogWebapp (MaUser, Thoigian, Cuaso, Congviec, Ghichu)
      VALUES (@MaUser, @Thoigian, @Cuaso, @Congviec, @Ghichu)
    `;
    await request.query(query);
  } catch (error) {
    // Chỉ log lỗi ra console server, không làm sập tiến trình
    console.error('Lỗi khi ghi log (trong hàm tiện ích):', error);
  }
};

module.exports = {
  writeLog,
};

