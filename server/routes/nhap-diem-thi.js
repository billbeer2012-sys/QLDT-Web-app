/*
* D:\QLDT-app\server\routes\nhap-diem-thi.js
* Cập nhật: 15/11/2025
* Tóm tắt:
* Sửa đổi từ Xem lịch thi
*/
const express = require('express');
const sql = require('mssql');

module.exports = function(poolPromise) {
    const router = express.Router();

    // API: Lấy danh sách học kỳ (Không thay đổi)
    router.get('/semesters', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT MaHK, Hocky, Ngaybatdau, Ngayketthuc 
                FROM Hocky 
                WHERE Sotuan > 0 
                ORDER BY Ngaybatdau DESC
            `);
            res.json(result.recordset);
        } catch (err) {
            console.error("API Get Semesters Error:", err);
            res.status(500).json({ message: "Lỗi server khi lấy danh sách học kỳ." });
        }
    });

    // API: Lấy danh sách lịch thi
    router.get('/list', async (req, res) => {
        const { maHK, startDate, endDate, searchTerm } = req.query;

        if (!maHK) {
            return res.status(400).json({ message: "Vui lòng cung cấp mã học kỳ." });
        }

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaHK', sql.NVarChar, maHK);
            
            let searchQuery = '';
            if (searchTerm) {
                searchQuery = `
                    AND (
                        ptx.Lanthi LIKE @SearchTerm OR
                        hp.Hocphan LIKE @SearchTerm OR
                        CONVERT(NVARCHAR, ptx.Ngay, 103) LIKE @SearchTerm OR
                        (cb1.Holot + ' ' + cb1.Ten) LIKE @SearchTerm OR
                        (cb2.Holot + ' ' + cb2.Ten) LIKE @SearchTerm
                    )
                `;
                request.input('SearchTerm', sql.NVarChar, `%${searchTerm}%`);
            }
            
            const finalQuery = `
                WITH PhongthiX AS (
                    SELECT pt0.MaPT0 AS MaPTX, 'Gk' AS Lanthi, SUBSTRING(pt0.MaPT0, 1, 3) AS MaHK, SUBSTRING(pt0.MaPT0, 4, 4) AS MaHP, pt0.Ngay, pt0.Gio, pt0.Phut, pt0.Thoigian, pt0.MaGV1, pt0.MaGV2, pt0.MaPH, pt0.Ghichu, pt0.Phongthi, (SELECT COUNT(*) FROM SinhvienLopHP slhp WHERE slhp.MaPT0 = pt0.MaPT0) as SLSV FROM Phongthi0 pt0
                    UNION ALL
                    SELECT pt1.MaPT1 AS MaPTX, 'L1' AS Lanthi, SUBSTRING(pt1.MaPT1, 1, 3) AS MaHK, SUBSTRING(pt1.MaPT1, 4, 4) AS MaHP, pt1.Ngay, pt1.Gio, pt1.Phut, pt1.Thoigian, pt1.MaGV1, pt1.MaGV2, pt1.MaPH, pt1.Ghichu, pt1.Phongthi, (SELECT COUNT(*) FROM SinhvienLopHP slhp WHERE slhp.MaPT1 = pt1.MaPT1) as SLSV FROM Phongthi1 pt1
                    UNION ALL
                    SELECT pt2.MaPT2 AS MaPTX, 'L2' AS Lanthi, SUBSTRING(pt2.MaPT2, 1, 3) AS MaHK, SUBSTRING(pt2.MaPT2, 4, 4) AS MaHP, pt2.Ngay, pt2.Gio, pt2.Phut, pt2.Thoigian, pt2.MaGV1, pt2.MaGV2, pt2.MaPH, pt2.Ghichu, pt2.Phongthi, (SELECT COUNT(*) FROM SinhvienLopHP slhp WHERE slhp.MaPT2 = pt2.MaPT2) as SLSV FROM Phongthi2 pt2
                )
                SELECT
                    ptx.MaPTX, ptx.Lanthi, ptx.Ngay, ptx.Gio, ptx.Phut, ptx.Thoigian, ptx.Ghichu,
                    ptx.Phongthi, ptx.SLSV, hp.Hocphan AS TenHocPhan, ph.Tenphong AS DiaDiemThi,
                    (cb1.Holot + ' ' + cb1.Ten) AS CBCoiThi1,
                    (cb2.Holot + ' ' + cb2.Ten) AS CBCoiThi2
                FROM PhongthiX ptx
                LEFT JOIN Hocphan hp ON ptx.MaHP = hp.MaHP
                LEFT JOIN Phonghoc ph ON ptx.MaPH = ph.MaPH
                LEFT JOIN Giaovien cb1 ON ptx.MaGV1 = cb1.MaGV
                LEFT JOIN Giaovien cb2 ON ptx.MaGV2 = cb2.MaGV
                WHERE 
                    ptx.MaHK = @MaHK
                    ${startDate ? 'AND ptx.Ngay >= @StartDate' : ''}
                    ${endDate ? 'AND ptx.Ngay <= @EndDate' : ''}
                    ${searchQuery}
                ORDER BY ptx.Ngay DESC, ptx.Gio DESC;
            `;

            if (startDate) request.input('StartDate', sql.Date, startDate);
            if (endDate) request.input('EndDate', sql.Date, endDate);

            const result = await request.query(finalQuery);
            res.json(result.recordset);
        } catch (err) {
            console.error("API Get Exam Schedule Error:", err);
            res.status(500).json({ message: "Lỗi server khi lấy dữ liệu lịch thi." });
        }
    });

    return router;
};