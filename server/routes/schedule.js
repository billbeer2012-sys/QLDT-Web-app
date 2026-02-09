/*
* Đường dẫn file: D:\QLDT-app\server\routes\schedule.js
* Thời gian cập nhật: 28/01/2026
* Tóm tắt những nội dung cập nhật:
* - Thêm Học vị cho Giảng viên.
* - Thêm nhóm phòng sau tên phòng
* - Địn dạng màu nền cho các ô thời khóa biểu: Lý thuyết, Thực hành, Trực tuyến
*/
const express = require('express');
const sql = require('mssql');
const moment = require('moment-timezone'); // Bổ sung moment

module.exports = function (poolPromise, calculateWeeks) {
    const router = express.Router();

    // CẬP NHẬT: API Lấy danh sách học kỳ
    router.get('/semesters', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT DISTINCT MaHK, Hocky, Ngaybatdau, Ngayketthuc
                FROM Hocky
                WHERE Sotuan > 0 
                ORDER BY MaHK DESC
            `);

            const semesters = result.recordset;
            let defaultSemesterId = null;

            if (semesters.length > 0) {
                const now = moment().tz('Asia/Ho_Chi_Minh');
                const currentSemester = semesters.find(s =>
                    s.Ngaybatdau && s.Ngayketthuc && now.isBetween(moment(s.Ngaybatdau), moment(s.Ngayketthuc), null, '[]')
                );

                if (currentSemester) {
                    defaultSemesterId = currentSemester.MaHK;
                } else {
                    const futureSemesters = semesters
                        .map(s => ({ ...s, diff: Math.abs(moment(s.Ngaybatdau).diff(now)) }))
                        .sort((a, b) => a.diff - b.diff);
                    if (futureSemesters.length > 0) {
                        defaultSemesterId = futureSemesters[0].MaHK;
                    }
                }
            }
            if (!defaultSemesterId && semesters.length > 0) {
                defaultSemesterId = semesters[0].MaHK;
            }

            res.json({
                semesters: semesters.map(s => ({ MaHK: s.MaHK, Hocky: s.Hocky })),
                defaultSemester: defaultSemesterId
            });

        } catch (err) {
            console.error("Get Semesters Error:", err);
            res.status(500).send('Server error when fetching semesters.');
        }
    });

    // API: Lấy danh sách tuần theo học kỳ (giữ nguyên)
    router.get('/weeks', async (req, res) => {
        const { mahk } = req.query;
        if (!mahk) {
            return res.status(400).json({ msg: 'Vui lòng cung cấp Mã học kỳ (mahk).' });
        }
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('mahk', sql.NVarChar, mahk)
                .query(`
                    SELECT MIN(TKB.Ngay) as StartDate, MAX(TKB.Ngay) as EndDate 
                    FROM TKB 
                    INNER JOIN LopHP ON TKB.MaLHP = LopHP.MaLHP 
                    WHERE LopHP.MaHK = @mahk AND TKB.Hieuluc = 1
                `);
            const { StartDate, EndDate } = result.recordset[0];
            if (!StartDate || !EndDate) {
                return res.json([]); // Trả về mảng rỗng nếu không có TKB
            }
            res.json(calculateWeeks(StartDate, EndDate));
        } catch (err) {
            console.error("Get Weeks Error:", err);
            res.status(500).send('Server error when fetching weeks.');
        }
    });

    // CẬP NHẬT: API Lấy dữ liệu thời khóa biểu chi tiết
    router.get('/data', async (req, res) => {
        const { startDate, endDate, searchTerm } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ msg: 'Vui lòng cung cấp ngày bắt đầu và kết thúc.' });
        }

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('startDate', sql.Date, startDate);
            request.input('endDate', sql.Date, endDate);

            let searchCondition = '';
            if (searchTerm) {
                request.input('searchTerm', sql.NVarChar, `%${searchTerm}%`);
                searchCondition = `
                    AND (
                        (Giaovien.Holot + N' ' + Giaovien.Ten) LIKE @searchTerm OR
                        Hocphan.Hocphan LIKE @searchTerm OR
                        Hocphan.Viettat LIKE @searchTerm OR
                        Phonghoc.Tenphong LIKE @searchTerm
                    )
                `;
            }

            const orderByClause = 'ORDER BY LopHP.Tenlop, TKB_CTE.Ngay, TKB_CTE.Tiet';


            const tkbQuery = `
                WITH TKB_CTE AS (
                    SELECT *, 
                           SUM(TKB.Sotiet) OVER (PARTITION BY TKB.MaLHP ORDER BY TKB.Ngay, TKB.Tiet) as SoTietTichLuy
                    FROM TKB WHERE TKB.Hieuluc = 1
                )
                SELECT 
                    Donvi.Donvi, 
                    LopHP.Tenlop, 
                    Hocphan.Viettat AS TenHP, 
                    Hocphan.Hocphan, 
                    Phonghoc.Tenphong,
                    Nhomphong.Nhomphong,
                    Phonghoc.MaLP,
                    ISNULL(Hocvi.Viettat + N' ', N'') + Giaovien.Holot + N' ' + Giaovien.Ten AS HoTenGV, 
                    TKB_CTE.Ngay, TKB_CTE.Tiet, TKB_CTE.Sotiet, TKB_CTE.Ghichu,
                    LopHP.Tongsotiet, 
                    TKB_CTE.SoTietTichLuy
                FROM Hocphan 
                INNER JOIN (Giaovien INNER JOIN ((LopHP INNER JOIN Hocky ON LopHP.MaHK = Hocky.MaHK) 
                INNER JOIN TKB_CTE ON LopHP.MaLHP = TKB_CTE.MaLHP) ON Giaovien.MaGV = TKB_CTE.MaGV) ON Hocphan.MaHP = LopHP.MaHP
                INNER JOIN Donvi ON LopHP.MaDV = Donvi.MaDV
                INNER JOIN Phonghoc ON TKB_CTE.MaPH = Phonghoc.MaPH
                LEFT JOIN Hocvi ON Giaovien.MaHV = Hocvi.MaHV
                LEFT JOIN Nhomphong ON Phonghoc.MaNP = Nhomphong.MaNP
                WHERE (TKB_CTE.Ngay BETWEEN @startDate AND @endDate)
                ${searchCondition}
                ${orderByClause};
            `;

            const result = await request.query(tkbQuery);

            // Gom nhóm dữ liệu theo Tenlop
            const groupedData = result.recordset.reduce((acc, item) => {
                let group = acc.find(g => g.name === item.Tenlop);
                if (!group) {
                    group = { name: item.Tenlop, schedule: [] };
                    acc.push(group);
                }
                group.schedule.push(item);
                return acc;
            }, []);

            res.json(groupedData);

        } catch (err) {
            console.error("Get Schedule Data Error:", err.message);
            res.status(500).send('Server Error when fetching schedule data.');
        }
    });

    return router;
};

