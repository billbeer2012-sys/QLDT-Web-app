/*
 * Đường dẫn file: D:\QLDT-app\server\routes\dotxettuyen.js
 * Phiên bản cập nhật: 08/10/2025
 * Tóm tắt những nội dung cập nhật:
 * - BỔ SUNG: Thêm 4 API mới để quản lý chức năng "Tổ hợp xét tuyển":
 * 1. GET /tohop-xt/nganh-hoc/:maDxt - Lấy các ngành có chỉ tiêu.
 * 2. GET /tohop-xt/tohop-mon - Lấy tất cả tổ hợp môn.
 * 3. GET /tohop-xt/:maDxt/:maNganh - Lấy các tổ hợp đã gán cho ngành.
 * 4. POST /tohop-xt - Lưu các tổ hợp môn cho ngành và ghi log chi tiết.
 */

const express = require('express');
const sql = require('mssql');
const { canManageDotXT, isAdmin } = require('./middleware')();
const moment = require('moment-timezone');

module.exports = function(poolPromise, writeLog) {
    const router = express.Router();

    const formatSqlDate = (dateString, format) => {
        if (!dateString) return null;
        return moment(dateString, format).toDate();
    };

    // --- API CHO CHỨC NĂNG TỔ HỢP XÉT TUYỂN ---

    // [GET] Lấy danh sách ngành học đã có chỉ tiêu trong một đợt XT
    router.get('/tohop-xt/nganh-hoc/:maDxt', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('MaDXT', sql.NVarChar, req.params.maDxt)
                .query(`
                    SELECT nh.MaNG, nh.Tennganh 
                    FROM Nganhhoc nh
                    JOIN DotXTNganhhoc dxt_nh ON nh.MaNG = dxt_nh.MaNG
                    WHERE dxt_nh.MaDXT = @MaDXT AND dxt_nh.Chitieu > 0
                    ORDER BY nh.Tennganh
                `);
            res.json(result.recordset);
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send({ message: 'Lỗi khi lấy danh sách ngành học.' });
        }
    });

    // [GET] Lấy tất cả tổ hợp môn
    router.get('/tohop-xt/tohop-mon', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT MaTHXT, TohopXT FROM TohopXT ORDER BY MaTHXT');
            res.json(result.recordset);
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send({ message: 'Lỗi khi lấy danh sách tổ hợp môn.' });
        }
    });

    // [GET] Lấy danh sách tổ hợp đã gán cho một ngành trong đợt XT
    router.get('/tohop-xt/:maDxt/:maNganh', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('MaDXT', sql.NVarChar, req.params.maDxt)
                .input('MaNG', sql.NVarChar, req.params.maNganh)
                .query(`
                    SELECT dxt_th.MaTHXT, dxt_th.TT, th.TohopXT
                    FROM DotXTNganhhocTohopXT dxt_th
                    JOIN TohopXT th ON dxt_th.MaTHXT = th.MaTHXT
                    WHERE dxt_th.MaDXT = @MaDXT AND dxt_th.MaNG = @MaNG
                    ORDER BY dxt_th.TT ASC
                `);
            res.json(result.recordset);
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send({ message: 'Lỗi khi lấy danh sách tổ hợp của ngành.' });
        }
    });
    
    // [POST] Lưu danh sách tổ hợp cho ngành
    router.post('/tohop-xt', canManageDotXT, async (req, res) => {
        const { maDxt, maNganh, toHopData, dotXT, tenNganh } = req.body;
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();

            // Lấy dữ liệu cũ để so sánh
            const oldResult = await new sql.Request(transaction)
                .input('MaDXT', sql.NVarChar, maDxt)
                .input('MaNG', sql.NVarChar, maNganh)
                .query(`SELECT th.TohopXT, dxt_th.TT FROM DotXTNganhhocTohopXT dxt_th 
                        JOIN TohopXT th ON dxt_th.MaTHXT = th.MaTHXT
                        WHERE dxt_th.MaDXT = @MaDXT AND dxt_th.MaNG = @MaNG`);
            const oldDataStr = oldResult.recordset.map(item => `${item.TohopXT} (TT:${item.TT})`).join(', ');

            // Xóa các tổ hợp cũ
            await new sql.Request(transaction)
                .input('MaDXT', sql.NVarChar, maDxt)
                .input('MaNG', sql.NVarChar, maNganh)
                .query('DELETE FROM DotXTNganhhocTohopXT WHERE MaDXT = @MaDXT AND MaNG = @MaNG');

            // Thêm các tổ hợp mới
            for (const item of toHopData) {
                if (item.MaTHXT && item.TT) { // Chỉ lưu nếu có chọn tổ hợp và có thứ tự
                    await new sql.Request(transaction)
                        .input('MaDXT', sql.NVarChar, maDxt)
                        .input('MaNG', sql.NVarChar, maNganh)
                        .input('MaTHXT', sql.NVarChar, item.MaTHXT)
                        .input('TT', sql.Int, item.TT)
                        .query('INSERT INTO DotXTNganhhocTohopXT (MaDXT, MaNG, MaTHXT, TT) VALUES (@MaDXT, @MaNG, @MaTHXT, @TT)');
                }
            }
            await transaction.commit();

            // Ghi log
            const newDataStr = toHopData
                .filter(item => item.MaTHXT && item.TT)
                .map(item => `${item.TohopXT} (TT:${item.TT})`).join(', ');

            if (oldDataStr !== newDataStr) {
                const logNote = `Cập nhật tổ hợp XT cho "${dotXT}" - Ngành "${tenNganh}": "${oldDataStr}" -> "${newDataStr}"`;
                await writeLog(pool, req.user.maso, 'QL Đợt XT', 'Cập nhật tổ hợp', logNote);
            }

            res.status(200).send({ message: 'Lưu tổ hợp xét tuyển thành công!' });
        } catch (err) {
            await transaction.rollback();
            console.error('SQL error', err);
            res.status(500).send({ message: 'Lỗi khi lưu dữ liệu.' });
        }
    });

    // --- CÁC API CŨ GIỮ NGUYÊN ---
    router.get('/', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT * FROM DotXT ORDER BY MaDXT DESC');
            res.json(result.recordset);
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send({ message: "Lỗi khi truy vấn CSDL" });
        }
    });
    router.get('/next-id', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query("SELECT MAX(CAST(MaDXT AS INT)) as maxId FROM DotXT");
            const maxId = result.recordset[0].maxId || 0;
            const nextId = (maxId + 1).toString().padStart(3, '0');
            res.json({ nextId });
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send({ message: "Lỗi khi tạo mã Đợt xét tuyển tiếp theo" });
        }
    });
    router.get('/chitieu/:maDxt', async (req, res) => {
        const { maDxt } = req.params;
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('MaDXT', sql.NVarChar, maDxt)
                .query(`
                    SELECT 
                        nh.MaNG, 
                        nh.Tennganh, 
                        dxt_nh.Chitieu
                    FROM Nganhhoc AS nh
                    LEFT JOIN DotXTNganhhoc AS dxt_nh ON nh.MaNG = dxt_nh.MaNG AND dxt_nh.MaDXT = @MaDXT
                    ORDER BY nh.Tennganh ASC
                `);
            res.json(result.recordset);
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send({ message: "Lỗi khi lấy dữ liệu chỉ tiêu." });
        }
    });
    router.post('/chitieu/:maDxt', canManageDotXT, async (req, res) => {
        const { maDxt } = req.params;
        const { chiTieuData, dotXT } = req.body; 
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();
            const oldResult = await new sql.Request(transaction)
                .input('MaDXT', sql.NVarChar, maDxt)
                .query('SELECT MaNG, Chitieu FROM DotXTNganhhoc WHERE MaDXT = @MaDXT');
            const oldDataMap = new Map(oldResult.recordset.map(item => [item.MaNG, item.Chitieu]));

            await new sql.Request(transaction)
                .input('MaDXT', sql.NVarChar, maDxt)
                .query('DELETE FROM DotXTNganhhoc WHERE MaDXT = @MaDXT');

            const changes = [];
            for (const item of chiTieuData) {
                const chiTieu = parseInt(item.Chitieu, 10);
                if (!isNaN(chiTieu) && chiTieu > 0) {
                    await new sql.Request(transaction)
                        .input('MaDXT', sql.NVarChar, maDxt)
                        .input('MaNG', sql.NVarChar, item.MaNG)
                        .input('Chitieu', sql.Int, chiTieu)
                        .query('INSERT INTO DotXTNganhhoc (MaDXT, MaNG, Chitieu) VALUES (@MaDXT, @MaNG, @Chitieu)');
                }
                const oldChiTieu = oldDataMap.get(item.MaNG) || 0;
                const newChiTieu = (!isNaN(chiTieu) && chiTieu > 0) ? chiTieu : 0;
                if (oldChiTieu !== newChiTieu) {
                    changes.push(`${item.Tennganh}: "${oldChiTieu}" -> "${newChiTieu}"`);
                }
            }
            await transaction.commit();
            if (changes.length > 0) {
                const logNote = `Cập nhật chỉ tiêu cho "${dotXT}": ` + changes.join('; ');
                await writeLog(pool, req.user.maso, 'QL Đợt XT', 'Cập nhật chỉ tiêu', logNote);
            }
            res.status(200).send({ message: 'Lưu chỉ tiêu thành công!' });
        } catch (err) {
            await transaction.rollback();
            console.error('SQL error', err);
            res.status(500).send({ message: 'Lỗi khi lưu chỉ tiêu vào CSDL.' });
        }
    });
    router.post('/', canManageDotXT, async (req, res) => {
        const { MaDXT, DotXT, Ma_DXT, Ghichu, Ngayketthuc, NgayXetTuyen, NgayBDthutuc, NgayKTthutuc, NgayNhapHoc, DiadiemNhaphoc, DiadiemThutuc } = req.body;
        if (!DotXT || !Ma_DXT) {
            return res.status(400).json({ message: 'Tên Đợt XT và Mã đợt là các trường bắt buộc.' });
        }
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('MaDXT', sql.NVarChar, MaDXT).input('DotXT', sql.NVarChar, DotXT)
                .input('Ma_DXT', sql.NVarChar, Ma_DXT).input('Ghichu', sql.NVarChar, Ghichu)
                .input('Ngayketthuc', sql.DateTime, formatSqlDate(Ngayketthuc, 'DD/MM/YYYY'))
                .input('NgayXetTuyen', sql.DateTime, formatSqlDate(NgayXetTuyen, 'DD/MM/YYYY'))
                .input('NgayBDthutuc', sql.DateTime, formatSqlDate(NgayBDthutuc, 'DD/MM/YYYY'))
                .input('NgayKTthutuc', sql.DateTime, formatSqlDate(NgayKTthutuc, 'DD/MM/YYYY'))
                .input('NgayNhapHoc', sql.DateTime, formatSqlDate(NgayNhapHoc, 'DD/MM/YYYY HH:mm'))
                .input('DiadiemNhaphoc', sql.NVarChar, DiadiemNhaphoc)
                .input('DiadiemThutuc', sql.NVarChar, DiadiemThutuc)
                .query(`INSERT INTO DotXT (MaDXT, DotXT, Ma_DXT, Ghichu, Ngayketthuc, NgayXetTuyen, NgayBDthutuc, NgayKTthutuc, NgayNhapHoc, DiadiemNhaphoc, DiadiemThutuc) VALUES (@MaDXT, @DotXT, @Ma_DXT, @Ghichu, @Ngayketthuc, @NgayXetTuyen, @NgayBDthutuc, @NgayKTthutuc, @NgayNhapHoc, @DiadiemNhaphoc, @DiadiemThutuc)`);
            await writeLog(pool, req.user.maso, 'QL đợt XT', 'Thêm mới', `Thêm mới Đợt xét tuyển: ${JSON.stringify(req.body)}`);
            res.status(201).send({ message: 'Thêm mới đợt xét tuyển thành công!' });
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send({ message: 'Lỗi khi thêm mới vào CSDL' });
        }
    });
    router.put('/:id', canManageDotXT, async (req, res) => {
        const { id } = req.params;
        const newData = req.body;
        if (!newData.DotXT || !newData.Ma_DXT) {
            return res.status(400).json({ message: 'Tên Đợt XT và Mã đợt là các trường bắt buộc.' });
        }
        try {
            const pool = await poolPromise;
            const oldResult = await pool.request()
                .input('id', sql.NVarChar, id)
                .query('SELECT * FROM DotXT WHERE MaDXT = @id');
            if (oldResult.recordset.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy đợt xét tuyển để cập nhật.' });
            }
            const oldData = oldResult.recordset[0];
            await pool.request()
                .input('id', sql.NVarChar, id).input('DotXT', sql.NVarChar, newData.DotXT)
                .input('Ma_DXT', sql.NVarChar, newData.Ma_DXT).input('Ghichu', sql.NVarChar, newData.Ghichu)
                .input('Ngayketthuc', sql.DateTime, formatSqlDate(newData.Ngayketthuc, 'DD/MM/YYYY'))
                .input('NgayXetTuyen', sql.DateTime, formatSqlDate(newData.NgayXetTuyen, 'DD/MM/YYYY'))
                .input('NgayBDthutuc', sql.DateTime, formatSqlDate(newData.NgayBDthutuc, 'DD/MM/YYYY'))
                .input('NgayKTthutuc', sql.DateTime, formatSqlDate(newData.NgayKTthutuc, 'DD/MM/YYYY'))
                .input('NgayNhapHoc', sql.DateTime, formatSqlDate(newData.NgayNhapHoc, 'DD/MM/YYYY HH:mm'))
                .input('DiadiemNhaphoc', sql.NVarChar, newData.DiadiemNhaphoc)
                .input('DiadiemThutuc', sql.NVarChar, newData.DiadiemThutuc)
                .query(`UPDATE DotXT SET DotXT = @DotXT, Ma_DXT = @Ma_DXT, Ghichu = @Ghichu, Ngayketthuc = @Ngayketthuc, NgayXetTuyen = @NgayXetTuyen, NgayBDthutuc = @NgayBDthutuc, NgayKTthutuc = @NgayKTthutuc, NgayNhapHoc = @NgayNhapHoc, DiadiemNhaphoc = @DiadiemNhaphoc, DiadiemThutuc = @DiadiemThutuc WHERE MaDXT = @id`);
            const changes = [];
            const fieldsToCompare = {
                'DotXT': 'Tên Đợt XT', 'Ma_DXT': 'Mã đợt', 'Ghichu': 'Ghi chú', 
                'Ngayketthuc': 'Hết hạn HS', 'NgayXetTuyen': 'Ngày XT', 'NgayBDthutuc': 'Bắt đầu TT', 
                'NgayKTthutuc': 'Kết thúc TT', 'NgayNhapHoc': 'Ngày nhập học', 
                'DiadiemNhaphoc': 'Địa điểm NH', 'DiadiemThutuc': 'Địa điểm TT'
            };
            for (const key in fieldsToCompare) {
                const oldValue = oldData[key];
                const newValue = newData[key];
                const oldStr = (oldValue instanceof Date) ? moment(oldValue).format(key === 'NgayNhapHoc' ? 'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY') : (oldValue || '').toString().trim();
                const newStr = (newValue || '').toString().trim();
                if (oldStr !== newStr) {
                    changes.push(`${fieldsToCompare[key]}: "${oldStr}" -> "${newStr}"`);
                }
            }
            const logNote = changes.length > 0 ? `ID ${id}: ` + changes.join('; ') : `ID ${id}: Không có thay đổi.`;
            await writeLog(pool, req.user.maso, 'QL Đợt XT', 'Cập nhật', logNote);
            res.status(200).send({ message: 'Cập nhật đợt xét tuyển thành công!' });
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send({ message: 'Lỗi khi cập nhật CSDL' });
        }
    });
    router.delete('/:id', isAdmin, async (req, res) => {
        try {
            const pool = await poolPromise;
            await pool.request().input('id', sql.NVarChar, req.params.id).query('DELETE FROM DotXT WHERE MaDXT = @id');
            await writeLog(pool, req.user.maso, 'QL Đợt XT', 'Xóa', `Xóa Đợt xét tuyển ID: ${req.params.id}`);
            res.status(200).send({ message: 'Xóa đợt xét tuyển thành công!' });
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send({ message: 'Lỗi khi xóa khỏi CSDL' });
        }
    });
    
    return router;
};

