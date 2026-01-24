/*
* D:\QLDT-app\server\routes\activity-log.js
* File mới: Xử lý các yêu cầu ghi log chung từ client.
*/
const express = require('express');
const sql = require('mssql');

module.exports = function(poolPromise, writeLog) {
    const router = express.Router();

    // API: Ghi lại một hành động từ client
    // POST /api/qdt/log-action
    router.post('/', async (req, res) => {
        const { Cuaso, Congviec, Ghichu } = req.body;
        const MaUser = req.user.maso; // Lấy từ token đã xác thực

        if (!MaUser || !Cuaso || !Congviec || !Ghichu) {
            return res.status(400).json({ message: 'Thiếu thông tin để ghi log.' });
        }

        try {
            const pool = await poolPromise;
            await writeLog(pool, MaUser, Cuaso, Congviec, Ghichu);
            res.status(200).json({ message: 'Log action recorded.' });
        } catch (err) {
            console.error('Record Log Action API Error:', err);
            res.status(500).json({ message: 'Lỗi server khi ghi log.' });
        }
    });

    return router;
};
