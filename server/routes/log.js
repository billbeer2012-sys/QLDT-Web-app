/*
* Đường dẫn file: D:\QLDT-app\server\routes\log.js
* Phiên bản cập nhật: 24/09/2025 (Sửa lỗi múi giờ)
* Tóm tắt những nội dung cập nhật:
* - SỬA LỖI: Thay đổi cách định dạng thời gian cho nguồn log 'eduman'.
* - Sử dụng `.utc().format()` để lấy giá trị thời gian gốc (đang bị
* hiểu nhầm là UTC) và định dạng nó thành chuỗi, ngăn trình duyệt
* tự động cộng thêm múi giờ địa phương.
*/
const express = require('express');
const sql = require('mssql');
const moment = require('moment-timezone');

module.exports = function(poolPromise) {
    const router = express.Router();

    router.get('/', async (req, res) => {
        const { startDate, endDate, searchTerm, logSource = 'webapp' } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Vui lòng cung cấp ngày bắt đầu và ngày kết thúc.' });
        }

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            
            const inclusiveEndDate = moment(endDate).add(1, 'days').format('YYYY-MM-DD');
            request.input('startDate', sql.Date, startDate);
            request.input('endDate', sql.Date, inclusiveEndDate);

            let query;
            let result;

            if (logSource === 'webapp') {
                // Logic cho Log Web App (giữ nguyên, đã đúng)
                query = `
                    SELECT TOP 1000 Thoigian, MaUser, Cuaso, Congviec, Ghichu 
                    FROM db_LogWebapp
                    WHERE Thoigian >= @startDate AND Thoigian < @endDate
                `;
                if (searchTerm) {
                    request.input('searchTerm', sql.NVarChar, `%${searchTerm}%`);
                    query += ` AND (MaUser LIKE @searchTerm OR Cuaso LIKE @searchTerm OR Congviec LIKE @searchTerm OR Ghichu LIKE @searchTerm)`;
                }
                query += ` ORDER BY Thoigian DESC`;
                result = await request.query(query);

                const formattedResult = result.recordset.map(log => ({
                    ...log,
                    Thoigian: moment.utc(log.Thoigian).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss')
                }));
                res.json(formattedResult);

            } else if (logSource === 'eduman') {
                // Logic cho Log Hệ thống (Nhatky)
                query = `
                    SELECT TOP 1000 Thoigian, MaUser, Cuaso, Congviec, Ghichu 
                    FROM Nhatky
                    WHERE Thoigian >= @startDate AND Thoigian < @endDate
                `;
                if (searchTerm) {
                    request.input('searchTerm', sql.NVarChar, `%${searchTerm}%`);
                    query += ` AND (MaUser LIKE @searchTerm OR Cuaso LIKE @searchTerm OR Congviec LIKE @searchTerm OR Ghichu LIKE @searchTerm)`;
                }
                query += ` ORDER BY Thoigian DESC`;
                result = await request.query(query);

                // BẮT ĐẦU SỬA LỖI MÚI GIỜ
                const formattedResult = result.recordset.map(log => ({
                    ...log,
                    // Lấy giá trị thời gian đang được hiểu là UTC và định dạng nó.
                    // Thao tác này sẽ tạo ra một chuỗi thời gian không có thông tin múi giờ,
                    // ngăn trình duyệt tự động chuyển đổi.
                    Thoigian: moment(log.Thoigian).utc().format('DD/MM/YYYY HH:mm:ss')
                }));
                // KẾT THÚC SỬA LỖI
                res.json(formattedResult);

            } else {
                return res.status(400).json({ message: 'Nguồn log không hợp lệ.' });
            }

        } catch (err) {
            console.error('Get Log API Error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu log.' });
        }
    });

    return router;
};

