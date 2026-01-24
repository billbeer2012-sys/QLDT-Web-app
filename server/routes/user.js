/*
* Đường dẫn file: D:\QLDT-app\server\routes\user.js
* Phiên bản: 13/09/2025
* Tóm tắt:
* - File mới chứa các API endpoint liên quan đến người dùng.
* - GET /profile: Lấy thông tin chi tiết của người dùng đang đăng nhập.
* - PUT /profile: Cập nhật thông tin cá nhân (Chuyên ngành, Điện thoại, Email).
*/

const express = require('express');
const sql = require('mssql');

module.exports = function(poolPromise, authenticateToken, writeLog) {
    const router = express.Router();

    // Middleware authenticateToken sẽ được áp dụng cho tất cả các route trong file này
    router.use(authenticateToken);

    // API: Lấy thông tin cá nhân của người dùng hiện tại
    router.get('/profile', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('MaGV', sql.NVarChar, req.user.maGV)
                .query(`
                    SELECT Maso, Holot, Ten, Chuyennganh, Dienthoai, Email
                    FROM Giaovien
                    WHERE MaGV = @MaGV
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng.' });
            }

            res.json(result.recordset[0]);

        } catch (error) {
            console.error('API Error fetching user profile:', error);
            res.status(500).json({ message: 'Lỗi server khi lấy thông tin cá nhân.' });
        }
    });

    // API: Cập nhật thông tin cá nhân
    router.put('/profile', async (req, res) => {
        const { chuyenNganh, dienThoai, email } = req.body;
        const { maGV, maso } = req.user;

        if (!chuyenNganh || !dienThoai || !email) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin.' });
        }

        try {
            const pool = await poolPromise;
            await pool.request()
                .input('MaGV', sql.NVarChar, maGV)
                .input('Chuyennganh', sql.NVarChar, chuyenNganh)
                .input('Dienthoai', sql.NVarChar, dienThoai)
                .input('Email', sql.NVarChar, email)
                .query(`
                    UPDATE Giaovien
                    SET Chuyennganh = @Chuyennganh, Dienthoai = @Dienthoai, Email = @Email
                    WHERE MaGV = @MaGV
                `);

            // Ghi log hành động
            try {
                const logNote = `Cập nhật: Chuyên ngành, ĐT, Email.`;
                await writeLog(pool, maso, 'Cập nhật thông tin', 'Lưu thay đổi', logNote);
            } catch (logErr) {
                console.error("Lỗi ghi log khi cập nhật thông tin:", logErr);
            }

            res.json({ message: 'Cập nhật thông tin thành công!' });

        } catch (error) {
            console.error('API Error updating user profile:', error);
            res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin.' });
        }
    });

    return router;
};
