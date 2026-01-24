/*
* D:\QLDT-app\server\routes\permissions.js
* Cập nhật: 20/08/2025
* Bổ sung người dùng isVC
*/
const express = require('express');
const sql = require('mssql');

module.exports = function(poolPromise) {
    const router = express.Router();

    // GET: Lấy danh sách đơn vị
    router.get('/donvi', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(
                `SELECT MaDV, Donvi FROM Donvi ORDER BY Donvi`
            );
            res.json(result.recordset);
        } catch (err) {
            res.status(500).json({ message: "Lỗi server khi lấy danh sách đơn vị." });
        }
    });

    // GET: Lấy danh sách người dùng
    router.get('/users', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(
                `SELECT MaGV, Maso, Holot, Ten, Matkhau, MaDV, isAdmin, Nhapdiem, isXepTKB, isKhaothi, isHssv, isTuyensinh, isKetoan, isVC
                 FROM Giaovien WHERE MaGV <> '011_373' ORDER BY MaDV, Ten, Holot`
            );
            res.json(result.recordset);
        } catch (err) {
            res.status(500).json({ message: "Lỗi server khi lấy danh sách người dùng." });
        }
    });

    // POST: Cập nhật quyền
    router.post('/update', async (req, res) => {
        const usersToUpdate = req.body; // Expects an array of users
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);
            
            for (const user of usersToUpdate) {
                await request.query`
                    UPDATE Giaovien 
                    SET 
                        isAdmin = ${user.isAdmin}, Nhapdiem = ${user.Nhapdiem},
                        isXepTKB = ${user.isXepTKB}, isKhaothi = ${user.isKhaothi},
                        isHssv = ${user.isHssv}, isTuyensinh = ${user.isTuyensinh}, isKetoan= ${user.isKetoan}, isVC= ${user.isVC}
                    WHERE MaGV = ${user.MaGV}
                `;
            }
            
            await transaction.commit();
            res.status(200).json({ message: 'Cập nhật quyền thành công!' });
        } catch (err) {
            await transaction.rollback();
            res.status(500).json({ message: 'Cập nhật quyền thất bại.' });
        }
    });

    // POST: Reset mật khẩu
    router.post('/reset-password', async (req, res) => {
        const { maGV } = req.body;
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('MaGV', sql.NVarChar, maGV)
                .query(`UPDATE Giaovien SET Matkhau = 'vkc1234@' WHERE MaGV = @MaGV`);
            res.status(200).json({ message: 'Reset mật khẩu thành công!' });
        } catch (err) {
            res.status(500).json({ message: 'Reset mật khẩu thất bại.' });
        }
    });

    return router;
};