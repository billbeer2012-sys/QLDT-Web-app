/*
 * Đường dẫn file: D:\QLDT-app\server\routes\fee-notification.js
 * Thời gian tạo: 20/09/2025
 * Tóm tắt:
 * - API GET /settings: Lấy thông tin record đầu tiên từ bảng db_ThongbaoHocphiHK.
 * - API GET /semesters: Lấy danh sách học kỳ để hiển thị trong combobox.
 * - API GET /banks: Lấy danh sách tài khoản ngân hàng để hiển thị trong combobox.
 * - API PUT /settings: Cập nhật thông tin cho record đầu tiên của bảng.
 */
const express = require('express');
const sql = require('mssql');

module.exports = function(poolPromise) {
    const router = express.Router();

    // API để lấy thông tin thiết lập hiện tại (luôn là record đầu tiên)
    router.get('/settings', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT TOP 1 * FROM db_ThongbaoHocphiHK');

            if (result.recordset.length > 0) {
                res.json(result.recordset[0]);
            } else {
                // Trả về một object rỗng có cấu trúc nếu không có dữ liệu
                res.status(404).json({
                    message: 'Không tìm thấy thông tin thiết lập thông báo học phí.',
                    data: { MaHK: '', SoTB: '', NgayTB: null, NgayBatdau: null, NgayKetthuc: null, BankID: '', Ghichu: '' }
                });
            }
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send({ message: 'Lỗi server khi lấy dữ liệu thiết lập' });
        }
    });

    // API để lấy danh sách học kỳ
    router.get('/semesters', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT MaHK, Hocky FROM Hocky WHERE Sotuan>0 ORDER BY MaHK DESC');
            res.json(result.recordset);
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send({ message: 'Lỗi server khi lấy danh sách học kỳ' });
        }
    });

    // API để lấy danh sách tài khoản ngân hàng
    router.get('/banks', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT BankID, BankName, AccountNo FROM db_BankAccountNo ORDER BY BankName');
            res.json(result.recordset);
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send({ message: 'Lỗi server khi lấy danh sách ngân hàng' });
        }
    });

    // API để cập nhật thông tin thiết lập
    router.put('/settings', async (req, res) => {
        const { MaHK, SoTB, NgayTB, NgayBatdau, NgayKetthuc, BankID, Ghichu } = req.body;

        if (!MaHK || !SoTB || !NgayTB || !NgayBatdau || !NgayKetthuc || !BankID) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc.' });
        }

        try {
            const pool = await poolPromise;
            await pool.request()
                .input('MaHK', sql.NVarChar, MaHK)
                .input('SoTB', sql.NVarChar, SoTB)
                .input('NgayTB', sql.DateTime, NgayTB)
                .input('NgayBatdau', sql.DateTime, NgayBatdau)
                .input('NgayKetthuc', sql.DateTime, NgayKetthuc)
                .input('BankID', sql.NVarChar, BankID)
                .input('Ghichu', sql.NVarChar, Ghichu)
                .query(`
                    UPDATE TOP (1) db_ThongbaoHocphiHK 
                    SET 
                        MaHK = @MaHK, 
                        SoTB = @SoTB, 
                        NgayTB = @NgayTB, 
                        NgayBatdau = @NgayBatdau, 
                        NgayKetthuc = @NgayKetthuc, 
                        BankID = @BankID, 
                        Ghichu = @Ghichu
                `);
            res.status(200).json({ message: 'Cập nhật thông tin thành công!' });
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send({ message: 'Lỗi server khi cập nhật dữ liệu' });
        }
    });

    return router;
};
