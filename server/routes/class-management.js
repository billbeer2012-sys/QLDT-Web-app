/*
 * Đường dẫn file: D:\QLDT-app\server\routes\class-management.js
 * Cập nhật: 30/09/2025
 * Tóm tắt những nội dung cập nhật:
 * - BỔ SUNG (API /class-data):
 * + Thêm cột Miengiam từ bảng Sinhvien.
 * + LEFT JOIN với view `web_SinhvienTinhtrang` để lấy các cột liên quan đến quyết định tình trạng (Quyetdinh, Ngaybatdau, Ngayketthuc, Quyetdinhhoctiep, Lydo).
 * - BỔ SUNG (API /update-field):
 * + Thêm 'Miengiam' vào danh sách `editableFields`.
 * + Xử lý kiểu dữ liệu số cho trường 'Miengiam'.
 */
const express = require('express');
const sql = require('mssql');
const moment = require('moment-timezone');

module.exports = function(poolPromise) {
    const router = express.Router();


    // API để lấy dữ liệu cho Giấy xác nhận Vay Vốn
    router.get('/student-loan-data/:maSV', async (req, res) => {
        const { maSV } = req.params;
        if (!maSV) {
            return res.status(400).json({ message: "Thiếu Mã sinh viên (maSV)." });
        }

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaSV', sql.NVarChar, maSV);

            const query = `
                SELECT
                    sv.Holot, sv.Ten, sv.Ngaysinh, sv.Gioitinh, sv.SoCMND, sv.NgaycapCMND, sv.NoicapCMND, sv.Maso,
                    l.Tenlop, l.Khoahoc,
                    n.Dacdiem, n.BacDTHienthi,
                    (SELECT MIN(hk_inner.Ngaybatdau) FROM Hocky hk_inner JOIN CTDTLop ctdt_inner ON hk_inner.MaHK = ctdt_inner.MaHK WHERE ctdt_inner.MaL = sv.MaL) as NgayNhapHoc,
                    (SELECT MAX(hk_inner.Ngayketthuc) FROM Hocky hk_inner JOIN CTDTLop ctdt_inner ON hk_inner.MaHK = ctdt_inner.MaHK WHERE ctdt_inner.MaL = sv.MaL) as NgayRaTruong,
                    hp.AvgHocphiThang
                FROM Sinhvien sv
                LEFT JOIN Lop l ON sv.MaL = l.MaL
                LEFT JOIN Nganhhoc n ON l.MaNG = n.MaNG
                OUTER APPLY (
                    SELECT CAST(AVG(CAST(hplh.HocphiThang AS FLOAT)) AS INT) as AvgHocphiThang
                    FROM db_HocphiLopHocky hplh
                    WHERE hplh.MaL = sv.MaL
                ) as hp
                WHERE sv.MaSV = @MaSV;
            `;

            const result = await request.query(query);

            if (result.recordset.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy sinh viên." });
            }

            res.json(result.recordset[0]);

        } catch (err) {
            console.error("Get Student Loan Data Error:", err);
            res.status(500).json({ message: "Lỗi server khi lấy dữ liệu vay vốn." });
        }
    });

    // API để lấy dữ liệu cho Giấy xác nhận sinh viên
    router.get('/student-confirmation-data/:maSV', async (req, res) => {
        const { maSV } = req.params;
        if (!maSV) {
            return res.status(400).json({ message: "Thiếu Mã sinh viên (maSV)." });
        }

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaSV', sql.NVarChar, maSV);

            const query = `
                SELECT
                    sv.MaSV, sv.Holot, sv.Ten, sv.Gioitinh, sv.Ngaysinh, sv.Noisinh, sv.Diachi, sv.Maso, sv.MaL,
                    l.Tenlop, l.Khoahoc,
                    n.Dacdiem, n.BacDTHienthi,
                    (
                        SELECT DATEADD(day, 30, MAX(hk.Ngayketthuc))
                        FROM CTDTLop ctdt
                        JOIN Hocky hk ON ctdt.MaHK = hk.MaHK
                        WHERE ctdt.MaL = sv.MaL
                    ) as NgayTotNghiepDuKien
                FROM Sinhvien sv
                LEFT JOIN Lop l ON sv.MaL = l.MaL
                LEFT JOIN Nganhhoc n ON l.MaNG = n.MaNG
                WHERE sv.MaSV = @MaSV;
            `;

            const result = await request.query(query);

            if (result.recordset.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy sinh viên." });
            }

            res.json(result.recordset[0]);

        } catch (err) {
            console.error("Get Student Confirmation Data Error:", err);
            res.status(500).json({ message: "Lỗi server khi lấy dữ liệu giấy xác nhận." });
        }
    });


    // API Lấy danh sách Khóa học
    router.get('/courses', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT DISTINCT SUBSTRING(MaL, 2, 2) as CourseYear 
                FROM Lop 
                WHERE MaL LIKE 'C[0-9][0-9]%'
                ORDER BY CourseYear DESC
            `);
            const courses = result.recordset.map(item => ({
                value: item.CourseYear,
                label: `Khóa 20${item.CourseYear}`
            }));
            res.json(courses);
        } catch (err) {
            console.error("Get Courses Error:", err);
            res.status(500).json({ message: "Lỗi server khi lấy danh sách khóa học." });
        }
    });

    // API: Lấy danh sách Lớp SH theo Khóa
    router.get('/classes', async (req, res) => {
        const { courseYear } = req.query;
        if (!courseYear) {
            return res.status(400).json({ message: "Thiếu thông tin năm của khóa học." });
        }
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('Pattern', sql.NVarChar, `C${courseYear}%`);
            const result = await request.query(`
                SELECT MaL, Tenlop 
                FROM Lop 
                WHERE MaL LIKE @Pattern 
                ORDER BY Tenlop ASC
            `);
            res.json(result.recordset);
        } catch (err) {
            console.error("Get Classes Error:", err);
            res.status(500).json({ message: "Lỗi server khi lấy danh sách lớp." });
        }
    });

    // API: Lấy danh sách sinh viên và thông tin chi tiết của lớp
    router.get('/class-data', async (req, res) => {
        const { maL } = req.query;
        if (!maL) {
            return res.status(400).json({ message: "Thiếu Mã lớp (maL)." });
        }
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaL', sql.NVarChar, maL);

            const studentQuery = `
                SELECT 
                    sv.MaSV, sv.Maso, sv.Holot, sv.Ten, sv.Gioitinh, sv.Ngaysinh, sv.Noisinh,
                    dt.Dantoc, dtcs.DTCS, sv.Dienthoai, sv.TrinhdoVH, sv.Diachi, sv.Hokhau,
                    kv.Khuvuc, tg.Tongiao, sv.SoCMND, sv.NgaycapCMND, sv.NoicapCMND,
                    sv.Miengiam, -- BỔ SUNG: Cột Miễn giảm
                    sv.HotenBo, sv.NghenghiepBo, sv.GhichuBo, sv.HotenMe, sv.NghenghiepMe, sv.GhichuMe,
                    sv.Hinhthuctamtru, sv.Diachitamtru, sv.Chunhatamtru, sv.Dienthoaitamtru,
                    sv.Noilamviec, sv.Ghichu, sv.Tinhtrang,
                    sv.MaDT, sv.MaDTCS, sv.MaKV, sv.MaTG,
                    -- BỔ SUNG: Các cột từ view web_SinhvienTinhtrang
                    stt.Quyetdinh, stt.Ngaybatdau, stt.Ngayketthuc, stt.Quyetdinhhoctiep, stt.Lydo
                FROM Sinhvien sv
                LEFT JOIN Dantoc dt ON sv.MaDT = dt.MaDT
                LEFT JOIN DTCS dtcs ON sv.MaDTCS = dtcs.MaDTCS
                LEFT JOIN Khuvuc kv ON sv.MaKV = kv.MaKV
                LEFT JOIN Tongiao tg ON sv.MaTG = tg.MaTG
                LEFT JOIN web_SinhvienTinhtrang stt ON sv.MaSV = stt.MaSV -- BỔ SUNG: Join với view
                WHERE sv.MaL = @MaL
                ORDER BY sv.Tinhtrang, sv.Ten, sv.Holot, sv.Ngaysinh;
            `;

            const classDetailsQuery = `
                SELECT 
                    n.Dacdiem, n.BacDTHienThi, n.SoHK, l.Khoahoc,
                    gv.Holot + ' ' + gv.Ten as CVHT
                FROM Lop l
                LEFT JOIN Nganhhoc n ON l.MaNG = n.MaNG
                LEFT JOIN Giaovien gv ON l.MaGV = gv.MaGV
                WHERE l.MaL = @MaL;
            `;

            const statsQuery = `
                SELECT Tinhtrang, COUNT(*) as SoLuong
                FROM Sinhvien
                WHERE MaL = @MaL
                GROUP BY Tinhtrang;
            `;

            const [studentsResult, classDetailsResult, statsResult] = await Promise.all([
                request.query(studentQuery),
                request.query(classDetailsQuery),
                request.query(statsQuery)
            ]);

            res.json({
                students: studentsResult.recordset,
                details: classDetailsResult.recordset[0] || {},
                stats: statsResult.recordset
            });

        } catch (err) {
            console.error("Get Class Data Error:", err);
            res.status(500).json({ message: "Lỗi server khi lấy dữ liệu lớp." });
        }
    });


    // API Reset mật khẩu sinh viên
    router.put('/students/:maSV/reset-password', async (req, res) => {
        const { maSV } = req.params;
        const { isAdmin, isHssv } = req.user;

        if (!isAdmin && !isHssv) {
            return res.status(403).json({ message: 'Không có quyền thực hiện chức năng này.' });
        }

        if (!maSV) {
            return res.status(400).json({ message: "Thiếu Mã sinh viên." });
        }

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaSV', sql.NVarChar, maSV);

            const studentResult = await request.query('SELECT Ngaysinh FROM Sinhvien WHERE MaSV = @MaSV');
            if (studentResult.recordset.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy sinh viên." });
            }
            const student = studentResult.recordset[0];
            const newPassword = moment(student.Ngaysinh).format('DDMMYYYY');

            const updateRequest = new sql.Request(pool);
            updateRequest.input('MaSV', sql.NVarChar, maSV);
            updateRequest.input('NewPassword', sql.NVarChar, newPassword);
            await updateRequest.query('UPDATE Sinhvien SET Matkhau = @NewPassword WHERE MaSV = @MaSV');

            res.json({ message: `Mật khẩu đã được reset thành ${newPassword}!` });

        } catch (err) {
            console.error("Reset Password API Error:", err);
            res.status(500).json({ message: "Lỗi server khi reset mật khẩu." });
        }
    });

    // API mới để lấy dữ liệu cho các combobox/dropdown
    router.get('/lookups', async (req, res) => {
      try {
        const pool = await poolPromise;
        const [
          danTocRes,
          dtcsRes,
          khuVucRes,
          tonGiaoRes,
          hinhThucTTRes,
          tinhThanhRes,
          noiCapCCCDRes,
          trinhDoVHRes,
        ] = await Promise.all([
          pool.request().query('SELECT MaDT, Dantoc FROM Dantoc ORDER BY TT'),
          pool.request().query('SELECT MaDTCS, DTCS FROM DTCS ORDER BY TT'),
          pool.request().query('SELECT MaKV, Khuvuc FROM Khuvuc ORDER BY TT'),
          pool.request().query('SELECT MaTG, Tongiao FROM Tongiao ORDER BY TT'),
          pool.request().query('SELECT HinhthucTT FROM HinhthucTT ORDER BY HinhthucTT'),
          pool.request().query('SELECT Tinhthanh FROM Tinhthanh ORDER BY Tinhthanh'),
          pool.request().query('SELECT NoicapCMND FROM db_NoicapCMND ORDER BY NoicapCMND'),
          pool.request().query('SELECT TrinhdoVH FROM db_TrinhdoVanhoa ORDER BY TrinhdoVH'),
        ]);

        res.json({
          danToc: danTocRes.recordset,
          doiTuongChinhSach: dtcsRes.recordset,
          khuVuc: khuVucRes.recordset,
          tonGiao: tonGiaoRes.recordset,
          hinhThucTamTru: hinhThucTTRes.recordset.map(item => item.HinhthucTT), 
          tinhThanh: tinhThanhRes.recordset.map(item => item.Tinhthanh),
          noiCapCCCD: noiCapCCCDRes.recordset.map(item => item.NoicapCMND),
          trinhDoVanHoa: trinhDoVHRes.recordset.map(item => item.TrinhdoVH),
        });
      } catch (err) {
        console.error('SQL error', err);
        res.status(500).send({ message: 'Lỗi khi truy vấn dữ liệu', error: err.message });
      }
    });

    // API cập nhật một trường dữ liệu của sinh viên (Inline Edit)
    router.patch('/students/:maSV/update-field', async (req, res) => {
        const { maSV } = req.params;
        const { field, value } = req.body;
        const { isAdmin, isHssv } = req.user;

        if (!isAdmin && !isHssv) {
            return res.status(403).json({ message: 'Không có quyền thực hiện chức năng này.' });
        }

        // Logic phân quyền - Chỉ isAdmin mới được sửa cột 'Maso'
        if (field === 'Maso' && !isAdmin) {
            return res.status(403).json({ message: 'Bạn không có quyền sửa mã số sinh viên.' });
        }

        // BỔ SUNG: Mở rộng danh sách các cột được phép chỉnh sửa trực tiếp
        const editableFields = [
            'Maso', 'Holot', 'Ten', 'Gioitinh', 'Ngaysinh', 'Noisinh', 'Dienthoai', 'TrinhdoVH',
            'Diachi', 'Hokhau', 'SoCMND', 'NgaycapCMND', 'NoicapCMND', 'Ghichu',
            'MaDT', 'MaDTCS', 'MaKV', 'MaTG', // Các cột khóa ngoại
            'Miengiam', // BỔ SUNG: Cột miễn giảm
            'HotenBo', 'NghenghiepBo', 'GhichuBo',
            'HotenMe', 'NghenghiepMe', 'GhichuMe',
            'Hinhthuctamtru', 'Diachitamtru', 'Chunhatamtru', 'Dienthoaitamtru',
            'Noilamviec'
        ];


        if (!editableFields.includes(field)) {
            return res.status(400).json({ message: `Trường '${field}' không được phép chỉnh sửa.` });
        }

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaSV', sql.NVarChar, maSV);

            let finalValue = value;
            if (value === null || value === '' || value === 'null') {
                finalValue = null;
            }

            // Xử lý các kiểu dữ liệu khác nhau
            if (field === 'Gioitinh') {
                request.input('Value', sql.Bit, finalValue);
            } else if (field === 'NgaycapCMND' || field === 'Ngaysinh') {
                if (finalValue === null) {
                    request.input('Value', sql.DateTime, null);
                } else {
                    const date = moment(finalValue, 'YYYY-MM-DD');
                    if (!date.isValid()) {
                        return res.status(400).json({ message: 'Định dạng ngày không hợp lệ.' });
                    }
                    request.input('Value', sql.DateTime, date.toDate());
                }
            } else if (field === 'Miengiam') { // BỔ SUNG: Xử lý kiểu số cho Miengiam
                 request.input('Value', sql.Float, finalValue);
            } else {
                request.input('Value', sql.NVarChar, finalValue);
            }

            const query = `UPDATE Sinhvien SET [${field}] = @Value WHERE MaSV = @MaSV`;
            await request.query(query);

            res.status(200).json({ message: 'Cập nhật thành công' });
        } catch (err) {
            console.error("Inline Update API Error:", err);
            res.status(500).json({ message: 'Lỗi server khi cập nhật dữ liệu.' });
        }
    });

    return router;
};

