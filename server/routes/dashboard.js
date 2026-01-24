/*
* Đường dẫn file: D:\QLDT-app\server\routes\dashboard.js
* Phiên bản cập nhật: 16/09/2025
* Tóm tắt những nội dung cập nhật:
* - GỠ BỎ middleware `authenticateToken` khỏi API `POST /record-visit`.
* - Điều này cho phép hệ thống ghi nhận lượt truy cập từ cả người dùng
* chưa đăng nhập, giúp thống kê chính xác hơn.
*/
const express = require('express');
const sql = require('mssql');
const moment = require('moment-timezone');

module.exports = function(poolPromise, authenticateToken, isAdmin) {
    const router = express.Router();

    // SỬA ĐỔI: Gỡ bỏ middleware `authenticateToken`
    router.post('/record-visit', async (req, res) => {
        try {
            const pool = await poolPromise;
            const today = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');

            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                // 1. Cập nhật tổng lượt truy cập
                await new sql.Request(transaction)
                    .query(`
                        MERGE db_SystemStats AS target
                        USING (SELECT 'TotalVisits' AS StatKey) AS source
                        ON target.StatKey = source.StatKey
                        WHEN MATCHED THEN
                            UPDATE SET StatValue = StatValue + 1
                        WHEN NOT MATCHED THEN
                            INSERT (StatKey, StatValue) VALUES ('TotalVisits', 1);
                    `);

                // 2. Cập nhật lượt truy cập hàng ngày
                await new sql.Request(transaction)
                    .input('Today', sql.Date, today)
                    .query(`
                        MERGE db_DailyStats AS target
                        USING (SELECT @Today AS StatDate) AS source
                        ON target.StatDate = source.StatDate
                        WHEN MATCHED THEN
                            UPDATE SET VisitCount = VisitCount + 1
                        WHEN NOT MATCHED THEN
                            INSERT (StatDate, VisitCount) VALUES (@Today, 1);
                    `);
                
                await transaction.commit();
                res.sendStatus(200);

            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            console.error('Record Visit API Error:', err);
            res.sendStatus(500);
        }
    });

    // API lấy các số liệu cho dashboard (giữ nguyên, vẫn cần admin)
    router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
        try {
            const pool = await poolPromise;
            const today = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
            const yesterday = moment().subtract(1, 'day').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');

            const visitsResult = await pool.request().query("SELECT StatValue FROM db_SystemStats WHERE StatKey = 'TotalVisits'");
            const totalVisits = visitsResult.recordset[0]?.StatValue || 0;

            const todayVisitsResult = await pool.request()
                .input('Today', sql.Date, today)
                .query("SELECT VisitCount FROM db_DailyStats WHERE StatDate = @Today");
            const todaysVisits = todayVisitsResult.recordset[0]?.VisitCount || 0;

            const yesterdayVisitsResult = await pool.request()
                .input('Yesterday', sql.Date, yesterday)
                .query("SELECT VisitCount FROM db_DailyStats WHERE StatDate = @Yesterday");
            const yesterdaysVisits = yesterdayVisitsResult.recordset[0]?.VisitCount || 0;

            const fiveMinutesAgo = moment().subtract(5, 'minutes').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
            const onlineResult = await pool.request()
                .input('FiveMinutesAgo', sql.DateTime, fiveMinutesAgo)
                .query(`
                    SELECT MaUser, HoTen, LastSeen, IPAddress, DeviceInfo 
                    FROM db_UserActivity 
                    WHERE LastSeen > @FiveMinutesAgo
                    ORDER BY LastSeen DESC
                `);

            res.json({
                totalVisits: totalVisits,
                todaysVisits: todaysVisits,
                yesterdaysVisits: yesterdaysVisits,
                onlineUsers: {
                    count: onlineResult.recordset.length,
                    users: onlineResult.recordset.map(u => ({...u, LastSeen: moment(u.LastSeen).tz('Asia/Ho_Chi_Minh')}))
                }
            });

        } catch (err) {
            console.error('Get Dashboard Stats API Error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu dashboard.' });
        }
    });

    return router;
};

