/*
 * Đường dẫn file: D:\QLDT-app\server\routes\danhmuc-lophoc.js
 * Phiên bản cập nhật: 08/10/2025
 * Tóm tắt những nội dung cập nhật:
 * - ĐIỀU CHỈNH: Cập nhật API `GET /data-sources`.
 * - Lọc danh sách giáo viên với điều kiện `MaDV <> '011'`.
 * - Sắp xếp danh sách giáo viên tăng dần theo `Holot`, sau đó đến `Ten`.
 */

const express = require('express');
const sql = require('mssql');
const { canManageLopHoc } = require('./middleware')();

module.exports = function(poolPromise, writeLog) {
    const router = express.Router();

    // API lấy danh sách khóa học
    router.get('/khoa-hoc', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT MaKH, Khoahoc FROM KhoaHoc ORDER BY Khoahoc DESC');
            res.json(result.recordset);
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send({ message: "Lỗi khi lấy danh sách khóa học." });
        }
    });

    // API lấy danh sách lớp học theo mã khóa
    router.get('/lop-hoc/:maKh', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('MaKH', sql.NVarChar, req.params.maKh)
                .query('SELECT * FROM Lop WHERE LEFT(MaL, 3) = @MaKH ORDER BY Tenlop ASC');
            res.json(result.recordset);
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send({ message: "Lỗi khi lấy danh sách lớp học." });
        }
    });

    // API lấy dữ liệu nguồn cho các combobox
    router.get('/data-sources', async (req, res) => {
        try {
            const pool = await poolPromise;
            // ĐIỀU CHỈNH: Cập nhật câu truy vấn cho giáo viên
            const [giaoVienRes, nganhHocRes] = await Promise.all([
                pool.request().query("SELECT MaGV, Holot + ' ' + Ten as HoTen FROM Giaovien WHERE MaDV <> '011' ORDER BY Holot, Ten"),
                pool.request().query("SELECT MaNG, Tennganh FROM Nganhhoc ORDER BY Tennganh")
            ]);
            res.json({
                giaoVien: giaoVienRes.recordset,
                nganhHoc: nganhHocRes.recordset
            });
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send({ message: "Lỗi khi lấy dữ liệu nguồn." });
        }
    });

    // API cập nhật thông tin các lớp học
    router.put('/lop-hoc', canManageLopHoc, async (req, res) => {
        const { updatedLops } = req.body;
        if (!updatedLops || updatedLops.length === 0) {
            return res.status(400).send({ message: 'Không có dữ liệu nào để cập nhật.' });
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);

            for (const lop of updatedLops) {
                const oldResult = await request.query(`SELECT * FROM Lop WHERE MaL = '${lop.MaL}'`);
                const oldData = oldResult.recordset[0];
                
                let newGvcn = oldData.GVCN;

                if (oldData.MaGV !== lop.MaGV) {
                    if (lop.MaGV) {
                        const gvResult = await request.query(`SELECT Holot + ' ' + Ten as HoTen FROM Giaovien WHERE MaGV = '${lop.MaGV}'`);
                        if (gvResult.recordset.length > 0) {
                            newGvcn = gvResult.recordset[0].HoTen;
                        }
                    } else {
                        newGvcn = null;
                    }
                }
                
                // Vì không cho sửa Ngành học trên UI nên không cần cập nhật MaNG
                await request.query(`
                    UPDATE Lop SET
                        Tenlop = N'${lop.Tenlop}',
                        Soluong = ${lop.Soluong || null},
                        MaGV = ${lop.MaGV ? `N'${lop.MaGV}'` : null},
                        GVCN = ${newGvcn ? `N'${newGvcn}'` : null},
                        Khoahoc = N'${lop.Khoahoc}',
                        Lock = ${lop.Lock ? 1 : 0}
                    WHERE MaL = N'${lop.MaL}'
                `);

                const changes = [];
                if (oldData.Tenlop !== lop.Tenlop) changes.push(`Tên lớp: "${oldData.Tenlop}" -> "${lop.Tenlop}"`);
                if (oldData.Soluong != lop.Soluong) changes.push(`SL đầu vào: "${oldData.Soluong || ''}" -> "${lop.Soluong || ''}"`);
                if (oldData.MaGV != lop.MaGV) {
                     const oldGvRes = await pool.request().query(`SELECT Holot + ' ' + Ten as HoTen FROM Giaovien WHERE MaGV = '${oldData.MaGV}'`);
                     const oldGv = oldGvRes.recordset[0]?.HoTen || '';
                     changes.push(`CVHT: "${oldGv}" -> "${newGvcn || ''}"`);
                }
                if (oldData.Khoahoc !== lop.Khoahoc) changes.push(`Khóa học: "${oldData.Khoahoc}" -> "${lop.Khoahoc}"`);
                if (oldData.Lock != lop.Lock) changes.push(`Khóa: "${oldData.Lock ? 'True':'False'}" -> "${lop.Lock ? 'True':'False'}"`);

                if (changes.length > 0) {
                    const logNote = `Cập nhật lớp ${lop.MaL}: ` + changes.join('; ');
                    await writeLog(pool, req.user.maso, 'DM lớp sinh hoạt', 'Chỉnh sửa', logNote);
                }
            }

            await transaction.commit();
            res.status(200).send({ message: 'Cập nhật thành công!' });
        } catch (err) {
            await transaction.rollback();
            console.error('SQL error', err);
            res.status(500).send({ message: 'Lỗi khi cập nhật dữ liệu.' });
        }
    });

    return router;
};

