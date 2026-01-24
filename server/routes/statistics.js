/*
  D:/QLDT-app/server/routes/statistics.js
 * Thời gian cập nhật: 08/09/2025
 * Tóm tắt nội dung:
 * - Bổ sung trường Nu_CuoiKhoa vào API /student-data để thống kê số lượng nữ cuối khóa.
 * - Cập nhật logic xác định học kỳ mặc định trong API /student-semesters.
 * - Điều chỉnh thống kê NGƯỜI HỌC (tự điêu chỉnh)
 * + Lấy các số liệu từ Khóa 2015
 */

const express = require('express');
const sql = require('mssql');
const moment = require('moment-timezone'); // Cần để xử lý ngày tháng

module.exports = function(poolPromise) {
    const router = express.Router();

    // === CÁC API CHO THỐNG KÊ TUYỂN SINH (GIỮ NGUYÊN) ===
    router.get('/admission-cohorts', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT DISTINCT LEFT(DotXT, 5) AS Khoa
                FROM dbo.DotXT
                ORDER BY Khoa DESC
            `);
            res.json(result.recordset);
        } catch (err) {
            console.error('API Error fetching admission cohorts:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách khóa tuyển sinh.' });
        }
    });

    router.get('/admission-phases', async (req, res) => {
        const { khoa } = req.query;
        if (!khoa) return res.status(400).json({ message: 'Vui lòng cung cấp Khóa tuyển sinh.' });
        try {
            const pool = await poolPromise;
            const result = await pool.request().input('Khoa', sql.NVarChar, khoa).query(`
                SELECT MaDXT, DotXT FROM dbo.DotXT WHERE LEFT(DotXT, 5) = @Khoa ORDER BY DotXT
            `);
            res.json(result.recordset);
        } catch (err) {
            console.error('API Error fetching admission phases:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách đợt tuyển sinh.' });
        }
    });

    router.get('/admissions', async (req, res) => {
        const { khoa, dxt } = req.query;
        if (!khoa) return res.status(400).json({ message: 'Vui lòng cung cấp Khóa tuyển sinh.' });
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('Khoa', sql.NVarChar, khoa);
            let dxtFilter = '';
            if (dxt && dxt.split(',').filter(Boolean).length > 0) {
                const dxtArray = dxt.split(',');
                const paramNames = dxtArray.map((_, i) => `@dxt${i}`);
                dxtArray.forEach((val, i) => request.input(`dxt${i}`, sql.NVarChar, val));
                dxtFilter = `AND dxt.MaDXT IN (${paramNames.join(',')})`;
            }
            const query = `
                WITH NganhChitieu AS (
                    SELECT ng.MaNG, ng.BacDTHienthi AS BacDT, ng.Dacdiem AS Nganhhoc, CONCAT(LEFT(ng.BacDTViettat, 2), '-', ng.NganhViettat) AS NganhViettat, SUM(dxt_ng.Chitieu) AS Chitieu
                    FROM dbo.DotXTNganhhoc dxt_ng JOIN dbo.Nganhhoc ng ON dxt_ng.MaNG = ng.MaNG JOIN dbo.DotXT dxt ON dxt_ng.MaDXT = dxt.MaDXT
                    WHERE LEFT(dxt.DotXT, 5) = @Khoa ${dxtFilter} AND dxt_ng.Chitieu > 0
                    GROUP BY ng.MaNG, ng.BacDTHienthi, ng.Dacdiem, ng.NganhViettat, ng.BacDTViettat
                ), NguyenVong AS (
                    SELECT nv.MaNG, SUM(CASE WHEN nv.MaNVXT = 1 THEN 1 ELSE 0 END) AS NV1, SUM(CASE WHEN nv.MaNVXT = 2 THEN 1 ELSE 0 END) AS NV2, SUM(CASE WHEN nv.MaNVXT = 3 THEN 1 ELSE 0 END) AS NV3
                    FROM dbo.ThisinhXTNguyenvongXT nv JOIN dbo.ThisinhXT ts ON nv.MaTSXT = ts.MaTSXT JOIN dbo.DotXT dxt ON ts.MaDXT = dxt.MaDXT
                    WHERE LEFT(dxt.DotXT, 5) = @Khoa ${dxtFilter} GROUP BY nv.MaNG
                ), KetQuaTuyenSinh AS (
                    SELECT ts.MaNG, SUM(CASE WHEN ts.Trungtuyen = 1 THEN 1 ELSE 0 END) AS Sum_Trungtuyen, SUM(CASE WHEN ts.Nhaphoc = 1 THEN 1 ELSE 0 END) AS Sum_Nhaphoc, SUM(CASE WHEN ts.Phanlop = 1 THEN 1 ELSE 0 END) AS Sum_Phanlop
                    FROM dbo.ThisinhXT ts JOIN dbo.DotXT dxt ON ts.MaDXT = dxt.MaDXT
                    WHERE LEFT(dxt.DotXT, 5) = @Khoa ${dxtFilter} AND ts.MaNG IS NOT NULL GROUP BY ts.MaNG
                )
                SELECT nct.BacDT, nct.Nganhhoc, nct.NganhViettat, nct.Chitieu, ISNULL(nv.NV1, 0) AS NV1, ISNULL(nv.NV2, 0) AS NV2, ISNULL(nv.NV3, 0) AS NV3,
                       ISNULL(kq.Sum_Trungtuyen, 0) AS Sum_Trungtuyen, ISNULL(kq.Sum_Nhaphoc, 0) AS Sum_Nhaphoc, ISNULL(kq.Sum_Phanlop, 0) AS Sum_Phanlop
                FROM NganhChitieu nct LEFT JOIN NguyenVong nv ON nct.MaNG = nv.MaNG LEFT JOIN KetQuaTuyenSinh kq ON nct.MaNG = kq.MaNG
                ORDER BY nct.BacDT, nct.Nganhhoc;
            `;
            const result = await request.query(query);
            res.json(result.recordset);
        } catch (err) {
            console.error('Admission Statistics API Error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu thống kê.' });
        }
    });

    // === BỔ SUNG: CÁC API MỚI CHO THỐNG KÊ NGƯỜI HỌC ===

    // API 1: Lấy danh sách học kỳ và học kỳ mặc định
     router.get('/student-semesters', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT DISTINCT MaHK, Hocky, Ngaybatdau, Ngayketthuc
                FROM dbo.web_HockyTN
                ORDER BY Ngaybatdau DESC
            `);

            const semesters = result.recordset;
            const now = moment().tz('Asia/Ho_Chi_Minh');
            let defaultSemester = null;

            // ĐIỀU CHỈNH: Cập nhật logic chọn học kỳ mặc định
            if (semesters.length > 0) {
                // 1. Ưu tiên tìm học kỳ đang diễn ra
                const currentSemester = semesters.find(s => now.isBetween(moment(s.Ngaybatdau), moment(s.Ngayketthuc)));
                if (currentSemester) {
                    defaultSemester = currentSemester.MaHK;
                } else {
                    // 2. Nếu không có, tìm học kỳ có ngày bắt đầu gần nhất với ngày hiện tại
                    const semestersWithDiff = semesters.map(s => ({
                        ...s,
                        diff: Math.abs(moment(s.Ngaybatdau).diff(now))
                    }));
                    semestersWithDiff.sort((a, b) => a.diff - b.diff);
                    defaultSemester = semestersWithDiff[0].MaHK;
                }
            }

            res.json({
                semesters: semesters.map(s => ({
                    ...s, // Trả về đầy đủ thông tin để logic cũ (nếu cần) vẫn hoạt động
                    Display: `${s.Hocky} (${moment(s.Ngaybatdau).format('DD/MM/YYYY')} - ${moment(s.Ngayketthuc).format('DD/MM/YYYY')})`
                })),
                defaultSemester: defaultSemester
            });

        } catch (err) {
            console.error('API Error fetching student semesters:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách học kỳ.' });
        }
    });

    // API 2: Lấy danh sách khóa đào tạo theo học kỳ
    router.get('/student-courses', async (req, res) => {
        const { maHK } = req.query;
        if (!maHK) return res.status(400).json({ message: 'Vui lòng cung cấp Mã học kỳ.' });
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('MaHK', sql.NVarChar, maHK)
                .query(`
                    SELECT DISTINCT
                        LEFT(l.MaL, 3) AS MaKH,
                        CONCAT('Khóa 20', SUBSTRING(l.MaL, 2, 2)) AS KhoaDaoTao
                    FROM dbo.web_HockyTN l
                    WHERE l.MaHK = @MaHK
                    ORDER BY KhoaDaoTao
                `);
            res.json(result.recordset);
        } catch (err) {
            console.error('API Error fetching student courses:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách khóa học.' });
        }
    });

// API 3: Lấy dữ liệu thống kê người học chi tiết
    router.get('/student-data', async (req, res) => {
        const { maHK, maKHs } = req.query;
        if (!maHK) return res.status(400).json({ message: 'Vui lòng cung cấp Mã học kỳ.' });

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaHK', sql.NVarChar, maHK);

            let courseFilter = '';
            if (maKHs && maKHs.split(',').filter(Boolean).length > 0) {
                const maKHsArray = maKHs.split(',');
                const paramNames = maKHsArray.map((_, i) => `@maKH${i}`);
                maKHsArray.forEach((val, i) => request.input(`maKH${i}`, sql.NVarChar, val));
                courseFilter = `AND LEFT(l.MaL, 3) IN (${paramNames.join(',')})`;
            }

            const query = `
                WITH LopTrongHocKy AS (
                    SELECT DISTINCT MaL FROM dbo.web_HockyTN WHERE MaHK = @MaHK
                ),
                SinhVienStats AS (
                    SELECT
                        MaL,
                        COUNT(MaSV) AS DanhSach,
                        SUM(CASE WHEN Tinhtrang = 0 THEN 1 ELSE 0 END) AS DangHoc,
                        SUM(CASE WHEN Tinhtrang = 0 AND Gioitinh = 0 THEN 1 ELSE 0 END) AS Nam_DH,
                        SUM(CASE WHEN Tinhtrang = 0 AND Gioitinh = 1 THEN 1 ELSE 0 END) AS Nu_DH,
                        SUM(CASE WHEN Tinhtrang = 0 AND MaDT <> 'KIN' THEN 1 ELSE 0 END) AS DanToc_DH,
                        SUM(CASE WHEN Tinhtrang = 0 AND MaTG <> 'KHO' THEN 1 ELSE 0 END) AS TonGiao_DH,
                        SUM(CASE WHEN Tinhtrang = 1 THEN 1 ELSE 0 END) AS BaoLuu,
                        SUM(CASE WHEN Tinhtrang = 2 THEN 1 ELSE 0 END) AS ThoiHoc,
                        SUM(CASE WHEN Tinhtrang = 3 THEN 1 ELSE 0 END) AS TotNghiep,
                        -- BỔ SUNG: Đếm số nữ cuối khóa (không bị bảo lưu hoặc thôi học)
                        SUM(CASE WHEN Gioitinh = 1 AND Tinhtrang NOT IN (1, 2) THEN 1 ELSE 0 END) AS Nu_CuoiKhoa,
                        SUM(CASE WHEN Noilamviec IS NOT NULL AND Noilamviec <> '' THEN 1 ELSE 0 END) AS ViecLam
                    FROM dbo.web_SinhvienTN
                    WHERE MaL IN (SELECT MaL FROM LopTrongHocKy)
                    GROUP BY MaL
                )
                SELECT
                    LEFT(l.MaL, 3) AS MaKH,
                    CONCAT('Khóa 20', SUBSTRING(l.MaL, 2, 2)) AS Khoa,
                    l.Tenlop,
                    ISNULL(l.SoluongBD, 0) AS DauVao,
                    ISNULL(svs.DanhSach, 0) AS DanhSach,
                    ISNULL(svs.DangHoc, 0) AS DangHoc,
                    ISNULL(svs.Nam_DH, 0) AS Nam_DH,
                    ISNULL(svs.Nu_DH, 0) AS Nu_DH,
                    ISNULL(svs.DanToc_DH, 0) AS DanToc_DH,
                    ISNULL(svs.TonGiao_DH, 0) AS TonGiao_DH,
                    ISNULL(svs.BaoLuu, 0) AS BaoLuu,
                    ISNULL(svs.ThoiHoc, 0) AS ThoiHoc,
                    (ISNULL(svs.DanhSach, 0) - ISNULL(svs.BaoLuu, 0) - ISNULL(svs.ThoiHoc, 0)) AS CuoiKhoa,
                    -- BỔ SUNG: Lấy số nữ cuối khóa
                    ISNULL(svs.Nu_CuoiKhoa, 0) AS Nu_CuoiKhoa,
                    ISNULL(svs.TotNghiep, 0) AS TotNghiep,
                    ISNULL(svs.ViecLam, 0) AS ViecLam,
                    l.Gvcn AS CoVanHocTap,
                    l.BacDTHienthi AS BacDT,
                    l.Dacdiem AS NganhNghe
                FROM
                    dbo.web_LopTN l
                JOIN LopTrongHocKy lhk ON l.MaL = lhk.MaL
                LEFT JOIN SinhVienStats svs ON l.MaL = svs.MaL
                WHERE 1=1 ${courseFilter}
                ORDER BY Khoa, BacDT, Tenlop;
            `;

            const result = await request.query(query);
            res.json(result.recordset);

        } catch (err) {
            console.error('Student Statistics Data API Error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu thống kê người học.' });
        }
    });
	
	// === BỔ SUNG: CÁC API MỚI CHO THỐNG KÊ TỐT NGHIỆP ===

    // API CHO TAB 1: THỐNG KÊ THEO KHÓA

    router.get('/graduation-courses', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT DISTINCT Khoahoc
                FROM dbo.web_LopTN
				WHERE SoluongTN > 0
                ORDER BY Khoahoc DESC
            `);
            res.json(result.recordset.map(r => r.Khoahoc));
        } catch (err) {
            console.error('API Error fetching graduation courses:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách khóa tốt nghiệp.' });
        }
    });

    // ĐIỀU CHỈNH: API lấy dữ liệu thống kê tốt nghiệp theo khóa
    router.get('/graduation-data', async (req, res) => {
        const { khoa } = req.query; // khoa giờ là chuỗi 'Khoá 2022,Khoá 2021'
        if (!khoa || khoa.split(',').filter(Boolean).length === 0) {
            return res.status(400).json({ message: 'Vui lòng cung cấp ít nhất một Khóa đào tạo.' });
        }
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);

            // Xử lý chuỗi các khóa để tạo câu lệnh IN an toàn
            const khoaArray = khoa.split(',');
            const paramNames = khoaArray.map((_, i) => `@khoa${i}`);
            khoaArray.forEach((val, i) => request.input(`khoa${i}`, sql.NVarChar, val));
            const courseFilter = `l.Khoahoc IN (${paramNames.join(',')})`;

            const query = `
                WITH SinhvienAgg AS (
                    SELECT
                        MaL,
                        COUNT(*) AS SolgDS,
                        SUM(CASE WHEN Tinhtrang = 1 THEN 1 ELSE 0 END) AS SolgBL,
                        SUM(CASE WHEN Tinhtrang = 2 THEN 1 ELSE 0 END) AS SolgTH,
                        SUM(CASE WHEN Tinhtrang = 3 THEN 1 ELSE 0 END) AS TotNghiep,
                        SUM(CASE WHEN Tinhtrang = 3 AND Gioitinh = 0 THEN 1 ELSE 0 END) AS Nam,
                        SUM(CASE WHEN Tinhtrang = 3 AND Gioitinh = 1 THEN 1 ELSE 0 END) AS Nu,
                        SUM(CASE WHEN Tinhtrang = 3 AND XeploaiTN = N'Xuất sắc' THEN 1 ELSE 0 END) AS XLTN_XuatSac,
                        SUM(CASE WHEN Tinhtrang = 3 AND XeploaiTN = N'Giỏi' THEN 1 ELSE 0 END) AS XLTN_Gioi,
                        SUM(CASE WHEN Tinhtrang = 3 AND XeploaiTN = N'Khá' THEN 1 ELSE 0 END) AS XLTN_Kha,
                        SUM(CASE WHEN Tinhtrang = 3 AND XeploaiTN = N'T.bình khá' THEN 1 ELSE 0 END) AS XLTN_TBKha,
                        SUM(CASE WHEN Tinhtrang = 3 AND XeploaiTN = N'Trung bình' THEN 1 ELSE 0 END) AS XLTN_TBinh,
                        SUM(CASE WHEN Tinhtrang = 3 AND XeploaiRL = N'Xuất sắc' THEN 1 ELSE 0 END) AS XLRL_XuatSac,
                        SUM(CASE WHEN Tinhtrang = 3 AND XeploaiRL = N'Tốt' THEN 1 ELSE 0 END) AS XLRL_Tot,
                        SUM(CASE WHEN Tinhtrang = 3 AND XeploaiRL = N'Khá' THEN 1 ELSE 0 END) AS XLRL_Kha,
                        SUM(CASE WHEN Tinhtrang = 3 AND XeploaiRL = N'Trung bình' THEN 1 ELSE 0 END) AS XLRL_TBinh,
                        SUM(CASE WHEN Tinhtrang = 3 AND (Noilamviec IS NOT NULL AND Noilamviec <> '') THEN 1 ELSE 0 END) AS ViecLam
                    FROM dbo.web_SinhvienTN
                    GROUP BY MaL
                )
                SELECT
                    l.Khoahoc, l.BacDTHienthi, l.Dacdiem, l.NganhViettat, l.LoaihinhDT, l.Donvi, l.Tenlop, l.Gvcn,
                    l.SoluongBD AS DauVao,
                    ISNULL(s.SolgDS, 0) AS DanhSach,
                    (ISNULL(s.SolgDS, 0) - ISNULL(s.SolgBL, 0) - ISNULL(s.SolgTH, 0)) AS CuoiKhoa,
                    ISNULL(s.TotNghiep, 0) AS TotNghiep, ISNULL(s.Nam, 0) AS Nam, ISNULL(s.Nu, 0) AS Nu,
                    ISNULL(s.XLTN_XuatSac, 0) AS XLTN_XuatSac, ISNULL(s.XLTN_Gioi, 0) AS XLTN_Gioi, ISNULL(s.XLTN_Kha, 0) AS XLTN_Kha,
                    ISNULL(s.XLTN_TBKha, 0) AS XLTN_TBKha, ISNULL(s.XLTN_TBinh, 0) AS XLTN_TBinh,
                    ISNULL(s.XLRL_XuatSac, 0) AS XLRL_XuatSac, ISNULL(s.XLRL_Tot, 0) AS XLRL_Tot, ISNULL(s.XLRL_Kha, 0) AS XLRL_Kha,
                    ISNULL(s.XLRL_TBinh, 0) AS XLRL_TBinh, ISNULL(s.ViecLam, 0) AS ViecLam
                FROM dbo.web_LopTN l
                LEFT JOIN SinhvienAgg s ON l.MaL = s.MaL
                WHERE ${courseFilter} AND l.SoluongTN > 0
                ORDER BY l.Khoahoc, l.BacDTHienthi, l.Tenlop;
            `;
            const result = await request.query(query);
            res.json(result.recordset);
        } catch (err) {
            console.error('Graduation Statistics Data API Error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu thống kê tốt nghiệp.' });
        }
    });
    // BỔ SUNG: API CHO TAB 2: THỐNG KÊ THEO NĂM
   
    // API lấy danh sách năm tốt nghiệp
    router.get('/graduation-years', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT DISTINCT YEAR(Ngayky) as NamTN
                FROM dbo.web_QuyetdinhTN
                ORDER BY NamTN DESC
            `);
            res.json(result.recordset.map(r => r.NamTN));
        } catch (err) {
            console.error('API Error fetching graduation years:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách năm tốt nghiệp.' });
        }
    });

    // API lấy danh sách quyết định TN theo năm
    router.get('/graduation-decisions-by-year', async (req, res) => {
        const { year } = req.query;
        if (!year) {
            return res.status(400).json({ message: 'Vui lòng cung cấp năm tốt nghiệp.' });
        }
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('Year', sql.Int, year);
            // SỬA LỖI: Sử dụng 'request' thay vì 'pool.request()' để thực thi query.
            const result = await request.query(`
                SELECT MaQDTN, So, Ngayky
                FROM dbo.web_QuyetdinhTN
                WHERE YEAR(Ngayky) = @Year
                ORDER BY Ngayky DESC, So DESC
            `);
            res.json(result.recordset.map(r => ({
                MaQDTN: r.MaQDTN,
                Display: `${r.So} (${moment(r.Ngayky).format('DD/MM/YYYY')})`
            })));
        } catch (err) {
            console.error('API Error fetching graduation decisions:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách quyết định tốt nghiệp.' });
        }
    });

    // API lấy dữ liệu thống kê theo quyết định TN
    router.get('/graduation-data-by-decision', async (req, res) => {
        const { maQDTNs } = req.query;
        if (!maQDTNs || maQDTNs.split(',').filter(Boolean).length === 0) {
            return res.status(400).json({ message: 'Vui lòng cung cấp ít nhất một mã quyết định tốt nghiệp.' });
        }
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            const maQDTNsArray = maQDTNs.split(',');
            const paramNames = maQDTNsArray.map((_, i) => `@maQDTN${i}`);
            maQDTNsArray.forEach((val, i) => request.input(`maQDTN${i}`, sql.NVarChar, val));

            const query = `
                WITH SinhvienFiltered AS (
                    SELECT * FROM dbo.web_SinhvienTN
                    WHERE MaQDTN IN (${paramNames.join(',')}) AND Tinhtrang = 3
                ),
                SinhvienAgg AS (
                    SELECT
                        MaL,
                        COUNT(*) AS TotNghiep,
                        SUM(CASE WHEN Gioitinh = 0 THEN 1 ELSE 0 END) AS Nam,
                        SUM(CASE WHEN Gioitinh = 1 THEN 1 ELSE 0 END) AS Nu,
                        SUM(CASE WHEN XeploaiTN = N'Xuất sắc' THEN 1 ELSE 0 END) AS XLTN_XuatSac,
                        SUM(CASE WHEN XeploaiTN = N'Giỏi' THEN 1 ELSE 0 END) AS XLTN_Gioi,
                        SUM(CASE WHEN XeploaiTN = N'Khá' THEN 1 ELSE 0 END) AS XLTN_Kha,
                        SUM(CASE WHEN XeploaiTN = N'T.bình khá' THEN 1 ELSE 0 END) AS XLTN_TBKha,
                        SUM(CASE WHEN XeploaiTN = N'Trung bình' THEN 1 ELSE 0 END) AS XLTN_TBinh,
                        SUM(CASE WHEN XeploaiRL = N'Xuất sắc' THEN 1 ELSE 0 END) AS XLRL_XuatSac,
                        SUM(CASE WHEN XeploaiRL = N'Tốt' THEN 1 ELSE 0 END) AS XLRL_Tot,
                        SUM(CASE WHEN XeploaiRL = N'Khá' THEN 1 ELSE 0 END) AS XLRL_Kha,
                        SUM(CASE WHEN XeploaiRL = N'Trung bình' THEN 1 ELSE 0 END) AS XLRL_TBinh,
                        SUM(CASE WHEN (Noilamviec IS NOT NULL AND Noilamviec <> '') THEN 1 ELSE 0 END) AS ViecLam
                    FROM SinhvienFiltered
                    GROUP BY MaL
                )
                SELECT
                    l.Khoahoc, l.BacDTHienthi, l.Dacdiem, l.NganhViettat, l.LoaihinhDT, l.Donvi, l.Tenlop, l.Gvcn,
                    (SELECT COUNT(*) FROM dbo.web_SinhvienTN sv_ds WHERE sv_ds.MaL = l.MaL) AS DanhSach,
                    ISNULL(s.TotNghiep, 0) AS TotNghiep, ISNULL(s.Nam, 0) AS Nam, ISNULL(s.Nu, 0) AS Nu,
                    ISNULL(s.XLTN_XuatSac, 0) AS XLTN_XuatSac, ISNULL(s.XLTN_Gioi, 0) AS XLTN_Gioi, ISNULL(s.XLTN_Kha, 0) AS XLTN_Kha,
                    ISNULL(s.XLTN_TBKha, 0) AS XLTN_TBKha, ISNULL(s.XLTN_TBinh, 0) AS XLTN_TBinh,
                    ISNULL(s.XLRL_XuatSac, 0) AS XLRL_XuatSac, ISNULL(s.XLRL_Tot, 0) AS XLRL_Tot, ISNULL(s.XLRL_Kha, 0) AS XLRL_Kha,
                    ISNULL(s.XLRL_TBinh, 0) AS XLRL_TBinh, ISNULL(s.ViecLam, 0) AS ViecLam
                FROM dbo.web_LopTN l
                JOIN SinhvienAgg s ON l.MaL = s.MaL
                WHERE s.TotNghiep > 0
                ORDER BY l.Khoahoc, l.BacDTHienthi, l.Tenlop;
            `;
            const result = await request.query(query);
            res.json(result.recordset);
        } catch (err) {
            console.error('Graduation Data by Decision API Error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu thống kê theo quyết định.' });
        }
    });

    return router;
};
