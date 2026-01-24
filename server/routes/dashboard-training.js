/*
 * Đường dẫn file: D:\QLDT-app\server\routes\dashboard-training.js
 * Phiên bản cập nhật: 22/01/2026
 * Tóm tắt:
 * - API endpoint mới cho Dashboard tiến độ đào tạo
 * - GET /years: Lấy danh sách năm học
 * - GET /stats: Lấy thống kê theo năm học (cả 2 học kỳ)
 * - CẬP NHẬT: Logic xác định năm học mặc định theo tháng hiện tại
 */
const express = require('express');
const sql = require('mssql');
const moment = require('moment-timezone');

module.exports = function (poolPromise, authenticateToken) {
    const router = express.Router();

    // ========================================
    // API 1: Lấy danh sách năm học
    // GET /api/qdt/dashboard-training/years
    // ========================================
    router.get('/years', authenticateToken, async (req, res) => {
        try {
            const pool = await poolPromise;

            // Lấy danh sách các năm học từ bảng Hocky
            // MaHK có định dạng: "251" = Năm 25 (2025-2026), HK 1
            const result = await pool.request().query(`
                SELECT DISTINCT 
                    LEFT(MaHK, 2) AS NamHoc,
                    '20' + LEFT(MaHK, 2) + ' - 20' + CAST(CAST(LEFT(MaHK, 2) AS INT) + 1 AS VARCHAR) AS Label
                FROM Hocky
                WHERE Sotuan > 0
                ORDER BY NamHoc DESC
            `);

            const years = result.recordset.map(row => ({
                namHoc: row.NamHoc,
                label: row.Label
            }));

            // CẬP NHẬT: Xác định năm học mặc định theo tháng hiện tại
            // Nếu tháng >= 9: Năm học = Năm hiện tại - (Năm hiện tại + 1)
            // Nếu tháng < 9: Năm học = (Năm hiện tại - 1) - Năm hiện tại
            const now = moment().tz('Asia/Ho_Chi_Minh');
            const currentMonth = now.month() + 1; // moment month is 0-indexed
            const currentYear = now.year();

            let defaultYearNum;
            if (currentMonth >= 9) {
                // Từ tháng 9 trở đi: năm học bắt đầu từ năm hiện tại
                defaultYearNum = currentYear % 100; // Lấy 2 số cuối (2026 -> 26)
            } else {
                // Trước tháng 9: năm học bắt đầu từ năm trước
                defaultYearNum = (currentYear - 1) % 100; // (2026 - 1) % 100 = 25
            }

            const defaultYearStr = defaultYearNum.toString().padStart(2, '0');

            // Kiểm tra xem năm học mặc định có trong danh sách không
            let defaultYear = years.find(y => y.namHoc === defaultYearStr)?.namHoc;
            // Nếu không có, fallback về năm đầu tiên trong danh sách
            if (!defaultYear && years.length > 0) {
                defaultYear = years[0].namHoc;
            }

            res.json({
                years: years,
                defaultYear: defaultYear
            });

        } catch (err) {
            console.error('Dashboard Training - Get Years Error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách năm học.' });
        }
    });

    // ========================================
    // API 2: Lấy thống kê tiến độ đào tạo theo năm học
    // GET /api/qdt/dashboard-training/stats?namHoc=25
    // ========================================
    router.get('/stats', authenticateToken, async (req, res) => {
        const { namHoc } = req.query;

        if (!namHoc) {
            return res.status(400).json({ message: 'Vui lòng cung cấp tham số namHoc.' });
        }

        try {
            const pool = await poolPromise;
            const today = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');

            // Lấy danh sách học kỳ trong năm học
            const semestersResult = await pool.request()
                .input('NamHoc', sql.NVarChar, namHoc + '%')
                .query(`
                    SELECT MaHK, Hocky 
                    FROM Hocky 
                    WHERE MaHK LIKE @NamHoc AND Sotuan > 0
                    ORDER BY MaHK ASC
                `);

            const semesters = [];

            for (const semester of semestersResult.recordset) {
                const maHK = semester.MaHK;
                const hocKyLabel = semester.Hocky;

                // Truy vấn thống kê theo từng đơn vị cho học kỳ này
                const statsResult = await pool.request()
                    .input('MaHK', sql.NVarChar, maHK)
                    .input('Today', sql.Date, today)
                    .query(`
                        SELECT 
                            DV.MaDV,
                            DV.Donvi AS TenDV,
                            COUNT(DISTINCT LHP.MaLHP) AS TotalClasses,
                            ISNULL(SUM(LHP.Tongsotiet), 0) AS TotalPlannedHours,
                            ISNULL((
                                SELECT SUM(TKB.Sotiet) 
                                FROM TKB 
                                WHERE TKB.MaLHP IN (SELECT MaLHP FROM LopHP WHERE MaHK = @MaHK AND MaDV = DV.MaDV)
                                  AND TKB.Hieuluc = 1
                            ), 0) AS TotalScheduledHours,
                            ISNULL((
                                SELECT SUM(TKB.Sotiet) 
                                FROM TKB 
                                WHERE TKB.MaLHP IN (SELECT MaLHP FROM LopHP WHERE MaHK = @MaHK AND MaDV = DV.MaDV)
                                  AND TKB.Hieuluc = 1
                                  AND TKB.Ngay <= @Today
                            ), 0) AS TotalCompletedHours
                        FROM LopHP LHP
                        INNER JOIN Donvi DV ON LHP.MaDV = DV.MaDV
                        WHERE LHP.MaHK = @MaHK
                        GROUP BY DV.MaDV, DV.Donvi
                        ORDER BY DV.Donvi
                    `);

                const units = statsResult.recordset.map(row => ({
                    maDV: row.MaDV,
                    tenDV: row.TenDV,
                    totalClasses: row.TotalClasses,
                    totalPlannedHours: row.TotalPlannedHours,
                    totalScheduledHours: row.TotalScheduledHours,
                    totalCompletedHours: row.TotalCompletedHours
                }));

                // Tính tổng summary cho học kỳ
                const summary = {
                    totalClasses: units.reduce((sum, u) => sum + u.totalClasses, 0),
                    totalPlannedHours: units.reduce((sum, u) => sum + u.totalPlannedHours, 0),
                    totalScheduledHours: units.reduce((sum, u) => sum + u.totalScheduledHours, 0),
                    totalCompletedHours: units.reduce((sum, u) => sum + u.totalCompletedHours, 0)
                };

                semesters.push({
                    maHK: maHK,
                    hocKyLabel: hocKyLabel,
                    units: units,
                    summary: summary
                });
            }

            // Tạo label năm học
            const namHocLabel = `20${namHoc} - 20${parseInt(namHoc) + 1}`;

            res.json({
                namHocLabel: namHocLabel,
                semesters: semesters
            });

        } catch (err) {
            console.error('Dashboard Training - Get Stats Error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy thống kê đào tạo.' });
        }
    });

    return router;
};
