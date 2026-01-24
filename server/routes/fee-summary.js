/*
 * D:\QLDT-app\server\routes\fee-summary.js
 * File mới - Cập nhật: 04/09/2025
 * Tóm tắt: File này định nghĩa các API endpoint cho chức năng "Tổng hợp các khoản thu".
 * - SỬA LỖI & TỐI ƯU: Thay thế logic `CHARINDEX` bằng phương pháp tạo tham số động
 * cho mệnh đề `IN` trong SQL. Cách này an toàn, tương thích rộng rãi và hiệu quả hơn.
 * - BỔ SUNG: Thêm trường `Hocphi.Ghichu` vào các câu lệnh SELECT để lấy dữ liệu ghi chú.
 * - SỬA LỖI: Khắc phục lỗi "duplicate exposed names" trong câu lệnh SQL của API thống kê.
 * - BỔ SUNG: Thêm bộ API mới cho Tab 2 "Khoản thu khác", truy vấn đến bảng `Khoanthu`.
 */
const express = require('express');
const sql = require('mssql');
const moment = require('moment-timezone');

module.exports = function(poolPromise) {
    const router = express.Router();

    // =================================================================
    // --- LOGIC CHUNG CHO TAB 1: HỌC PHÍ, LỆ PHÍ THI ---
    // =================================================================
    const getSortClause_Tab1 = (key, direction) => {
        const dir = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        switch (key) {
            case 'KhoanThu': return `ORDER BY KhoanthuHK.Khoanthu ${dir}, Hocky.Hocky DESC, Lop.Tenlop ASC, Sinhvien.Ten ASC, Sinhvien.Holot ASC, Hocphi.Ngaynop DESC`;
            
			//case 'NgayThu': return `ORDER BY Hocphi.Ngaynop ${dir}, KhoanthuHK.Khoanthu ASC, Hocky.Hocky DESC, Lop.Tenlop ASC, Sinhvien.Ten ASC, Sinhvien.Holot ASC`;
			case 'NgayThu': return `ORDER BY Hocphi.Ngaynop DESC, Hocphi.SoCT DESC`;
            case 'NguoiNop': return `ORDER BY Sinhvien.Ten ${dir}, Sinhvien.Holot ${dir}, Hocky.Hocky DESC, KhoanthuHK.Khoanthu ASC, Hocphi.Ngaynop DESC`;
            case 'TenLop': return `ORDER BY Lop.Tenlop ${dir}, Sinhvien.Ten ASC, Sinhvien.Holot ASC, Hocky.Hocky DESC, KhoanthuHK.Khoanthu ASC, Hocphi.Ngaynop DESC`;
            case 'HocKy': return `ORDER BY Hocky.Hocky ${dir}, KhoanthuHK.Khoanthu ASC, Lop.Tenlop ASC, Sinhvien.Ten ASC, Sinhvien.Holot ASC, Hocphi.Ngaynop DESC`;
            default: return 'ORDER BY Hocphi.Ngaynop DESC, Hocphi.SoCT DESC';
        }
    };

    const baseQuery_Tab1 = `FROM Hocphi INNER JOIN Sinhvien ON Hocphi.MaSV = Sinhvien.MaSV INNER JOIN KhoanthuHK ON Hocphi.MaKT = KhoanthuHK.MaKT LEFT JOIN Lop ON Sinhvien.MaL = Lop.MaL LEFT JOIN Hocky ON Hocphi.MaHK = Hocky.MaHK`;

    const buildWhereClauseAndParams_Tab1 = (request, startDate, endDate, feeTypeIds, searchTerm) => {
        let whereClause = `WHERE Hocphi.Ngaynop BETWEEN @startDate AND @endDate`;
        if (feeTypeIds && feeTypeIds.length > 0) {
            const feeTypeIdsArray = feeTypeIds.split(',');
            const paramNames = feeTypeIdsArray.map((id, index) => {
                const paramName = `maKT${index}`;
                request.input(paramName, sql.NVarChar, id);
                return `@${paramName}`;
            });
            whereClause += ` AND Hocphi.MaKT IN (${paramNames.join(',')})`;
        }
        if (searchTerm) {
            request.input('searchTermWildcard', sql.NVarChar, `%${searchTerm}%`);
            whereClause += ` AND (KhoanthuHK.Khoanthu LIKE @searchTermWildcard OR CONVERT(nvarchar, Hocphi.SoCT) LIKE @searchTermWildcard OR Hocphi.Lydo LIKE @searchTermWildcard OR Hocphi.Hinhthucthanhtoan LIKE @searchTermWildcard OR (Sinhvien.Holot + ' ' + Sinhvien.Ten) LIKE @searchTermWildcard OR Lop.Tenlop LIKE @searchTermWildcard OR Sinhvien.Maso LIKE @searchTermWildcard OR Sinhvien.MaTS LIKE @searchTermWildcard OR Hocphi.MaUser LIKE @searchTermWildcard OR Hocky.Hocky LIKE @searchTermWildcard OR Hocphi.Ghichu LIKE @searchTermWildcard)`;
        }
        return whereClause;
    };

    router.get('/fee-types', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT MaKT, Khoanthu FROM KhoanthuHK ORDER BY Khoanthu');
            res.json(result.recordset);
        } catch (err) { res.status(500).json({ message: 'Lỗi server khi tải danh sách khoản thu.' }); }
    });

    router.get('/', async (req, res) => {
        const { startDate, endDate, feeTypeIds, searchTerm, page = 1, pageSize = 15, sortKey = 'NgayThu', sortDirection = 'desc' } = req.query;
        if (!startDate || !endDate) return res.status(400).json({ message: 'Vui lòng cung cấp khoảng thời gian.' });
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('startDate', sql.DateTime, moment(startDate).startOf('day').toDate());
            request.input('endDate', sql.DateTime, moment(endDate).endOf('day').toDate());
            const whereClause = buildWhereClauseAndParams_Tab1(request, startDate, endDate, feeTypeIds, searchTerm);
            const sortClause = getSortClause_Tab1(sortKey, sortDirection);
            const dataQuery = `SELECT Hocphi.Ngaynop AS NgayThu, Hocphi.SoCT AS SoPhieu, Hocphi.Sotienthu AS SoTienThu, Hocphi.Lydo AS LyDoThu, Hocphi.Hinhthucthanhtoan AS HinhThucThu, Hocphi.MaUser AS NguoiThu, (ISNULL(Sinhvien.Holot, '') + ' ' + ISNULL(Sinhvien.Ten, '')) AS NguoiNop, Sinhvien.Ngaysinh AS NgaySinh, Sinhvien.Maso AS MaSo, Sinhvien.MaTS AS MaTuyensinh, Lop.Tenlop AS TenLop, Hocky.Hocky AS HocKy, KhoanthuHK.Khoanthu AS KhoanThu, Hocphi.Ghichu AS GhiChu ${baseQuery_Tab1} ${whereClause} ${sortClause} OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;`;
            request.input('offset', sql.Int, (parseInt(page) - 1) * parseInt(pageSize));
            request.input('pageSize', sql.Int, parseInt(pageSize));
            const dataResult = await request.query(dataQuery);
            const countQuery = `SELECT COUNT(*) as total ${baseQuery_Tab1} ${whereClause}`;
            const countResult = await request.query(countQuery);
            res.json({ data: dataResult.recordset, total: countResult.recordset[0].total });
        } catch (err) { res.status(500).json({ message: 'Lỗi server khi tải dữ liệu tổng hợp.' }); }
    });
    
    router.get('/stats', async (req, res) => {
        const { startDate, endDate, feeTypeIds } = req.query;
        if (!startDate || !endDate) return res.status(400).json({ message: 'Vui lòng cung cấp khoảng thời gian.' });
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('startDate', sql.DateTime, moment(startDate).startOf('day').toDate());
            request.input('endDate', sql.DateTime, moment(endDate).endOf('day').toDate());
            const whereClause = buildWhereClauseAndParams_Tab1(request, startDate, endDate, feeTypeIds, null);
            const statsQuery = `SELECT KhoanthuHK.Khoanthu, COUNT(*) as SoLanThu, SUM(CONVERT(bigint, Hocphi.Sotienthu)) as TongTien ${baseQuery_Tab1} ${whereClause} GROUP BY KhoanthuHK.Khoanthu ORDER BY KhoanthuHK.Khoanthu;`;
            const statsResult = await request.query(statsQuery);
            res.json(statsResult.recordset);
        } catch(err) { res.status(500).json({ message: 'Lỗi server khi tải thống kê.' }); }
    });

    router.get('/export', async (req, res) => {
        const { startDate, endDate, feeTypeIds, searchTerm, sortKey = 'NgayThu', sortDirection = 'desc' } = req.query;
        if (!startDate || !endDate) return res.status(400).json({ message: 'Vui lòng cung cấp khoảng thời gian.' });
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('startDate', sql.DateTime, moment(startDate).startOf('day').toDate());
            request.input('endDate', sql.DateTime, moment(endDate).endOf('day').toDate());
            const whereClause = buildWhereClauseAndParams_Tab1(request, startDate, endDate, feeTypeIds, searchTerm);
            const sortClause = getSortClause_Tab1(sortKey, sortDirection);
            const exportQuery = `SELECT Hocphi.Ngaynop AS NgayThu, Hocphi.SoCT AS SoPhieu, Hocphi.Sotienthu AS SoTienThu, Hocphi.Lydo AS LyDoThu, Hocphi.Hinhthucthanhtoan AS HinhThucThu, Hocphi.MaUser AS NguoiThu, (ISNULL(Sinhvien.Holot, '') + ' ' + ISNULL(Sinhvien.Ten, '')) AS NguoiNop, Sinhvien.Ngaysinh AS NgaySinh, Sinhvien.Maso AS MaSo, Sinhvien.MaTS AS MaTuyensinh, Lop.Tenlop AS TenLop, Hocky.Hocky AS HocKy, KhoanthuHK.Khoanthu AS KhoanThu, Hocphi.Ghichu AS GhiChu ${baseQuery_Tab1} ${whereClause} ${sortClause};`;
            const result = await request.query(exportQuery);
            res.json(result.recordset);
        } catch (err) { res.status(500).json({ message: 'Lỗi server khi xuất dữ liệu.' }); }
    });

    // =================================================================
    // --- LOGIC CHUNG CHO TAB 2: KHOẢN THU KHÁC ---
    // =================================================================
    const getSortClause_Tab2 = (key, direction) => {
        const dir = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        switch (key) {
            case 'KhoanThu': return `ORDER BY Khoanthu.Khoanthu ${dir}, Lop.Tenlop ASC, Sinhvien.Ten ASC, Sinhvien.Holot ASC, Hocphi.Ngaynop DESC`;
            //case 'NgayThu': return `ORDER BY Hocphi.Ngaynop ${dir}, Khoanthu.Khoanthu ASC, Lop.Tenlop ASC, Sinhvien.Ten ASC, Sinhvien.Holot ASC`;
			case 'NgayThu': return `ORDER BY Hocphi.Ngaynop DESC, Hocphi.SoCT DESC`;
            case 'NguoiNop': return `ORDER BY Sinhvien.Ten ${dir}, Sinhvien.Holot ${dir}, Khoanthu.Khoanthu ASC, Hocphi.Ngaynop DESC`;
            case 'TenLop': return `ORDER BY Lop.Tenlop ${dir}, Sinhvien.Ten ASC, Sinhvien.Holot ASC, Khoanthu.Khoanthu ASC, Hocphi.Ngaynop DESC`;
            default: return 'ORDER BY Hocphi.Ngaynop DESC, Hocphi.SoCT DESC';
        }
    };

    const baseQuery_Tab2 = `FROM Hocphi INNER JOIN Sinhvien ON Hocphi.MaSV = Sinhvien.MaSV INNER JOIN Khoanthu ON Hocphi.MaKT = Khoanthu.MaKT LEFT JOIN Lop ON Sinhvien.MaL = Lop.MaL`;

    const buildWhereClauseAndParams_Tab2 = (request, startDate, endDate, feeTypeIds, searchTerm) => {
        let whereClause = `WHERE Hocphi.Ngaynop BETWEEN @startDate AND @endDate`;
        if (feeTypeIds && feeTypeIds.length > 0) {
            const feeTypeIdsArray = feeTypeIds.split(',');
            const paramNames = feeTypeIdsArray.map((id, index) => {
                const paramName = `maKT_other_${index}`;
                request.input(paramName, sql.NVarChar, id);
                return `@${paramName}`;
            });
            whereClause += ` AND Hocphi.MaKT IN (${paramNames.join(',')})`;
        }
        if (searchTerm) {
            request.input('searchTermWildcard_other', sql.NVarChar, `%${searchTerm}%`);
            whereClause += ` AND (Khoanthu.Khoanthu LIKE @searchTermWildcard_other OR CONVERT(nvarchar, Hocphi.SoCT) LIKE @searchTermWildcard_other OR Hocphi.Lydo LIKE @searchTermWildcard_other OR Hocphi.Hinhthucthanhtoan LIKE @searchTermWildcard_other OR (Sinhvien.Holot + ' ' + Sinhvien.Ten) LIKE @searchTermWildcard_other OR Sinhvien.Maso LIKE @searchTermWildcard OR Sinhvien.MaTS LIKE @searchTermWildcard OR Lop.Tenlop LIKE @searchTermWildcard_other OR Hocphi.MaUser LIKE @searchTermWildcard_other OR Hocphi.Ghichu LIKE @searchTermWildcard_other)`;
        }
        return whereClause;
    };

    router.get('/other-fee-types', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT MaKT, Khoanthu FROM Khoanthu ORDER BY Khoanthu');
            res.json(result.recordset);
        } catch (err) { res.status(500).json({ message: 'Lỗi server khi tải danh sách khoản thu khác.' }); }
    });

    router.get('/other-fees', async (req, res) => {
        const { startDate, endDate, feeTypeIds, searchTerm, page = 1, pageSize = 15, sortKey = 'NgayThu', sortDirection = 'desc' } = req.query;
        if (!startDate || !endDate) return res.status(400).json({ message: 'Vui lòng cung cấp khoảng thời gian.' });
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('startDate', sql.DateTime, moment(startDate).startOf('day').toDate());
            request.input('endDate', sql.DateTime, moment(endDate).endOf('day').toDate());
            const whereClause = buildWhereClauseAndParams_Tab2(request, startDate, endDate, feeTypeIds, searchTerm);
            const sortClause = getSortClause_Tab2(sortKey, sortDirection);
            const dataQuery = `SELECT Hocphi.Ngaynop AS NgayThu, Hocphi.SoCT AS SoPhieu, Hocphi.Sotienthu AS SoTienThu, Hocphi.Lydo AS LyDoThu, Hocphi.Hinhthucthanhtoan AS HinhThucThu, Hocphi.MaUser AS NguoiThu, (ISNULL(Sinhvien.Holot, '') + ' ' + ISNULL(Sinhvien.Ten, '')) AS NguoiNop, Sinhvien.Ngaysinh AS NgaySinh, Sinhvien.Maso AS MaSo, Sinhvien.MaTS AS MaTuyensinh, Lop.Tenlop AS TenLop, Khoanthu.Khoanthu AS KhoanThu, Hocphi.Ghichu AS GhiChu ${baseQuery_Tab2} ${whereClause} ${sortClause} OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;`;
            request.input('offset', sql.Int, (parseInt(page) - 1) * parseInt(pageSize));
            request.input('pageSize', sql.Int, parseInt(pageSize));
            const dataResult = await request.query(dataQuery);
            const countQuery = `SELECT COUNT(*) as total ${baseQuery_Tab2} ${whereClause}`;
            const countResult = await request.query(countQuery);
            res.json({ data: dataResult.recordset, total: countResult.recordset[0].total });
        } catch (err) { res.status(500).json({ message: 'Lỗi server khi tải dữ liệu khoản thu khác.' }); }
    });

    router.get('/other-stats', async (req, res) => {
        const { startDate, endDate, feeTypeIds } = req.query;
        if (!startDate || !endDate) return res.status(400).json({ message: 'Vui lòng cung cấp khoảng thời gian.' });
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('startDate', sql.DateTime, moment(startDate).startOf('day').toDate());
            request.input('endDate', sql.DateTime, moment(endDate).endOf('day').toDate());
            const whereClause = buildWhereClauseAndParams_Tab2(request, startDate, endDate, feeTypeIds, null);
            const statsQuery = `SELECT Khoanthu.Khoanthu, COUNT(*) as SoLanThu, SUM(CONVERT(bigint, Hocphi.Sotienthu)) as TongTien ${baseQuery_Tab2} ${whereClause} GROUP BY Khoanthu.Khoanthu ORDER BY Khoanthu.Khoanthu;`;
            const statsResult = await request.query(statsQuery);
            res.json(statsResult.recordset);
        } catch(err) { res.status(500).json({ message: 'Lỗi server khi tải thống kê khoản thu khác.' }); }
    });
    
    router.get('/other-export', async (req, res) => {
        const { startDate, endDate, feeTypeIds, searchTerm, sortKey = 'NgayThu', sortDirection = 'desc' } = req.query;
        if (!startDate || !endDate) return res.status(400).json({ message: 'Vui lòng cung cấp khoảng thời gian.' });
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('startDate', sql.DateTime, moment(startDate).startOf('day').toDate());
            request.input('endDate', sql.DateTime, moment(endDate).endOf('day').toDate());
            const whereClause = buildWhereClauseAndParams_Tab2(request, startDate, endDate, feeTypeIds, searchTerm);
            const sortClause = getSortClause_Tab2(sortKey, sortDirection);
            const exportQuery = `SELECT Hocphi.Ngaynop AS NgayThu, Hocphi.SoCT AS SoPhieu, Hocphi.Sotienthu AS SoTienThu, Hocphi.Lydo AS LyDoThu, Hocphi.Hinhthucthanhtoan AS HinhThucThu, Hocphi.MaUser AS NguoiThu, (ISNULL(Sinhvien.Holot, '') + ' ' + ISNULL(Sinhvien.Ten, '')) AS NguoiNop, Sinhvien.Ngaysinh AS NgaySinh, Sinhvien.Maso AS MaSo, Sinhvien.MaTS AS MaTuyensinh, Lop.Tenlop AS TenLop, Khoanthu.Khoanthu AS KhoanThu, Hocphi.Ghichu AS GhiChu ${baseQuery_Tab2} ${whereClause} ${sortClause};`;
            const result = await request.query(exportQuery);
            res.json(result.recordset);
        } catch (err) { res.status(500).json({ message: 'Lỗi server khi xuất dữ liệu khoản thu khác.' }); }
    });

    return router;
};
