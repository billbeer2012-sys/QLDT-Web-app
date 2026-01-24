/*
 * D:\QLDT-app\server\routes\admissions.js
 * Phiên bản cập nhật: 03/10/2025
 * Tóm tắt những nội dung cập nhật:
 * - BỔ SUNG GHI LOG: API PATCH /applicant/:maTSXT/update-field giờ đây sẽ
 * tiếp nhận thông tin log từ frontend và gọi hàm `writeLog` để ghi lại
 * hành động cập nhật trực tiếp vào database.
 */
const express = require('express');
const sql = require('mssql');
const moment = require('moment-timezone');
const https = require('https');

module.exports = function(poolPromise, writeLog) {
    const router = express.Router();

    
	// --- CÁC API CHO TRANG DANH SÁCH CHÍNH ---
    router.get('/periods', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT MaDXT, DotXT, Ghichu, Ma_DXT, NgayXetTuyen, NgayNhapHoc, NgayBDthutuc, NgayKTthutuc, DiadiemNhaphoc, DiadiemThutuc
                FROM DotXT
                ORDER BY MaDXT DESC
            `);
            res.json(result.recordset);
        } catch (err) {
            console.error("Get Admission Periods Error:", err);
            res.status(500).json({ message: "Lỗi server khi lấy danh sách đợt tuyển sinh." });
        }
    });

    router.get('/applicants', async (req, res) => {
        const {
            maDXT,
            page = 1,
            pageSize = 15,
            searchTerm = '',
            trungTuyenYes,
            trungTuyenNo,
            sortKey = 'Maso',
            sortDirection = 'asc'
        } = req.query;

        if (!maDXT) return res.status(400).json({ message: "Thiếu Mã đợt xét tuyển." });

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaDXT', sql.NVarChar, maDXT);
            
            const pageNum = parseInt(page, 10);
            const pageSizeNum = parseInt(pageSize, 10);
            const offset = (pageNum - 1) * pageSizeNum;
            request.input('Offset', sql.Int, offset);
            request.input('PageSize', sql.Int, pageSizeNum);

           // let whereClause = `WHERE ts.MaDXT = @MaDXT AND (ts.Holot IS NOT NULL AND ts.Holot <> '') AND (ts.Ten IS NOT NULL AND ts.Ten <> '')`;
            let whereClause = `WHERE ts.MaDXT = @MaDXT`;
			if (searchTerm) {
                whereClause += ` AND (ts.Holot + ' ' + ts.Ten LIKE @SearchTerm OR ts.Maso LIKE @SearchTerm)`;
                request.input('SearchTerm', sql.NVarChar, `%${searchTerm}%`);
            }

            const trungTuyenFilter = [];
            if (trungTuyenYes === 'true') trungTuyenFilter.push(1);
            if (trungTuyenNo === 'true') trungTuyenFilter.push(0);
            
            if (trungTuyenFilter.length === 1) {
                whereClause += trungTuyenFilter[0] === 1 ? ` AND ts.Trungtuyen = 1` : ` AND (ts.Trungtuyen = 0 OR ts.Trungtuyen IS NULL)`;
            }

            const allowedSortKeys = ['Maso', 'Holot', 'Ten', 'Tennganh', 'NV1', 'NV2', 'NV3'];
            const safeSortKey = allowedSortKeys.includes(sortKey) ? sortKey : 'Maso';
            const safeSortDirection = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

            let orderByClause = '';
            switch (safeSortKey) {
                case 'Ten':
                    orderByClause = `ORDER BY ts.Ten ${safeSortDirection}, ts.Holot ASC`;
                    break;
                case 'Holot':
                    orderByClause = `ORDER BY ts.Holot ${safeSortDirection}, ts.Ten ASC`;
                    break;
                case 'Tennganh':
                    orderByClause = `ORDER BY ng.Tennganh ${safeSortDirection}, ts.Ten ASC, ts.Holot ASC`;
                    break;
                case 'NV1':
                    orderByClause = `ORDER BY Aspirations.NV1 ${safeSortDirection}, ts.Ten ASC, ts.Holot ASC`;
                    break;
                case 'NV2':
                    orderByClause = `ORDER BY Aspirations.NV2 ${safeSortDirection}, ts.Ten ASC, ts.Holot ASC`;
                    break;
                case 'NV3':
                    orderByClause = `ORDER BY Aspirations.NV3 ${safeSortDirection}, ts.Ten ASC, ts.Holot ASC`;
                    break;
                case 'Maso':
                default:
                    orderByClause = `ORDER BY ts.Maso ${safeSortDirection}`;
                    break;
            }

            const totalQuery = `SELECT COUNT(*) as total FROM ThisinhXT ts ${whereClause}`;
            
            const dataQuery = `
                WITH AspirationsCTE AS (
                    SELECT 
                        MaTSXT,
                        [1] AS NV1,
                        [2] AS NV2,
                        [3] AS NV3
                    FROM (
                        SELECT 
                            nv.MaTSXT, 
                            nv.MaNVXT, 
                            ng.Tennganh
                        FROM ThisinhXTNguyenvongXT nv
                        JOIN Nganhhoc ng ON nv.MaNG = ng.MaNG
                    ) AS SourceTable
                    PIVOT (
                        MAX(Tennganh)
                        FOR MaNVXT IN ([1], [2], [3])
                    ) AS PivotTable
                )
                SELECT
                    ts.MaTSXT, ts.Trungtuyen, ts.Maso, ts.Holot, ts.Ten, ts.Gioitinh, ts.Ngaysinh,
                    ts.Noisinh, kv.Khuvuc, d.DTCS, ts.Dienthoai, ts.Fld01 as TrinhdoVH,
                    ts.NamTN, thpt.TruongTHPT, dt.Dantoc, ts.Diachi, ts.Hokhau, tg.Tongiao,
                    ts.SoCMND, ts.NgaycapCMND, ts.NoicapCMND, ts.Email, ts.Ghichu,
                    ts.DiemUT, ts.TongDXT, ng.Tennganh,
                    ts.Nhaphoc, ts.Phanlop, qd.So AS SoQuyetdinh, qd.Ngayky AS NgaykyQuyetdinh,
                    ng.Dacdiem, ng.BacDTHienthi,
                    Aspirations.NV1, Aspirations.NV2, Aspirations.NV3
                FROM ThisinhXT ts
                LEFT JOIN Khuvuc kv ON ts.MaKV = kv.MaKV
                LEFT JOIN DTCS d ON ts.MaDTCS = d.MaDTCS
                LEFT JOIN TruongTHPT thpt ON ts.MaTHPT = thpt.MaTHPT
                LEFT JOIN Dantoc dt ON ts.MaDT = dt.MaDT
				LEFT JOIN Tongiao tg ON ts.MaTG = tg.MaTG
                LEFT JOIN Nganhhoc ng ON ts.MaNG = ng.MaNG
                LEFT JOIN QuyetdinhTT qd ON ts.MaQDTT = qd.MaQDTT
                LEFT JOIN AspirationsCTE Aspirations ON ts.MaTSXT = Aspirations.MaTSXT
                ${whereClause}
                ${orderByClause}
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
            `;

            const [totalResult, dataResult] = await Promise.all([
                request.query(totalQuery),
                request.query(dataQuery)
            ]);
            
            res.json({
                applicants: dataResult.recordset,
                total: totalResult.recordset[0].total
            });
        } catch (err) {
            console.error("Get Applicants Error:", err);
            res.status(500).json({ message: "Lỗi server khi lấy danh sách thí sinh." });
        }
    });

    router.delete('/applicant/:maTSXT', async (req, res) => {
        const { maTSXT } = req.params;
        const currentUser = req.user.maso;
    
        try {
            const pool = await poolPromise;
            
            const permCheckReq = new sql.Request(pool);
            permCheckReq.input('MaGV', sql.NVarChar, req.user.maGV);
            const permResult = await permCheckReq.query('SELECT isAdmin FROM Giaovien WHERE MaGV = @MaGV');
            
            if (!permResult.recordset[0] || permResult.recordset[0].isAdmin !== 1) {
                return res.status(403).json({ message: 'Truy cập bị từ chối. Yêu cầu quyền Admin.' });
            }
    
            const transaction = new sql.Transaction(pool);
            try {
                await transaction.begin();
    
                const getInfoReq = new sql.Request(transaction);
                getInfoReq.input('MaTSXT', sql.NVarChar, maTSXT);
                const infoResult = await getInfoReq.query('SELECT Maso, Holot, Ten, Trungtuyen FROM ThisinhXT WHERE MaTSXT = @MaTSXT');
    
                if (infoResult.recordset.length === 0) {
                    await transaction.rollback();
                    return res.status(404).json({ message: 'Không tìm thấy thí sinh.' });
                }
    
                const applicantInfo = infoResult.recordset[0];
                if (applicantInfo.Trungtuyen === 1) {
                    await transaction.rollback();
                    return res.status(400).json({ message: 'Không thể xóa thí sinh đã trúng tuyển.' });
                }
    
                const request = new sql.Request(transaction);
                request.input('MaTSXT', sql.NVarChar, maTSXT);
    
                await request.query('DELETE FROM ThisinhXTMonXT WHERE MaTSXT = @MaTSXT');
                await request.query('DELETE FROM ThisinhXTNguyenvongXT WHERE MaTSXT = @MaTSXT');
                await request.query('DELETE FROM db_ThisinhXTnopHoso WHERE MaTSXT = @MaTSXT');
                await request.query('DELETE FROM ThisinhXT WHERE MaTSXT = @MaTSXT');
    
                await transaction.commit();
    
                const logGhichu = `Xóa TS: ${applicantInfo.Maso} - ${applicantInfo.Holot} ${applicantInfo.Ten}`;
                await writeLog(pool, currentUser, 'DS thí sinh', 'Xóa thí sinh', logGhichu);
    
                res.json({ message: 'Xóa thí sinh thành công!' });
    
            } catch (transactionErr) {
                await transaction.rollback();
                console.error("Delete Applicant Transaction Error:", transactionErr);
                res.status(500).json({ message: "Lỗi server trong quá trình xóa thí sinh." });
            }
        } catch (permErr) {
            console.error("Delete Applicant Permission Check Error:", permErr);
            res.status(500).json({ message: "Lỗi server khi kiểm tra quyền." });
        }
    });

    router.get('/stats', async (req, res) => {
        const { maDXT } = req.query;
        if (!maDXT) return res.status(400).json({ message: "Thiếu Mã đợt xét tuyển." });

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaDXT', sql.NVarChar, maDXT);

            const periodDetailsQuery = request.query(`SELECT Ghichu, Ngayketthuc, NgayXettuyen FROM DotXT WHERE MaDXT = @MaDXT`);
            const generalStatsQuery = request.query(`SELECT COUNT(*) as TotalApplicants, SUM(CASE WHEN Trungtuyen = 1 THEN 1 ELSE 0 END) as TotalSuccessful FROM ThisinhXT WHERE MaDXT = @MaDXT AND (Holot IS NOT NULL AND Holot <> '') AND (Ten IS NOT NULL AND Ten <> '')`);
            const majorStatsQuery = request.query(`SELECT ng.Tennganh, COUNT(ts.MaTSXT) as SuccessfulCount FROM ThisinhXT ts JOIN Nganhhoc ng ON ts.MaNG = ng.MaNG WHERE ts.MaDXT = @MaDXT AND ts.Trungtuyen = 1 GROUP BY ng.Tennganh ORDER BY ng.Tennganh`);
            
            const [periodDetailsResult, generalStatsResult, majorStatsResult] = await Promise.all([
                periodDetailsQuery, generalStatsQuery, majorStatsQuery
            ]);

            res.json({
                details: periodDetailsResult.recordset[0] || {},
                general: generalStatsResult.recordset[0] || { TotalApplicants: 0, TotalSuccessful: 0 },
                byMajor: majorStatsResult.recordset || []
            });
        } catch (err) {
            console.error("Get Admission Stats Error:", err);
            res.status(500).json({ message: "Lỗi server khi lấy dữ liệu thống kê." });
        }
    });

    router.get('/export', async (req, res) => {
        // CẬP NHẬT: Nhận thêm tham số sắp xếp
        const { maDXT, searchTerm = '', trungTuyenYes, trungTuyenNo, sortKey = 'Maso', sortDirection = 'asc' } = req.query;
        if (!maDXT) return res.status(400).json({ message: "Thiếu Mã đợt xét tuyển." });

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaDXT', sql.NVarChar, maDXT);
            
            let whereClause = `WHERE ts.MaDXT = @MaDXT AND (ts.Holot IS NOT NULL AND ts.Holot <> '') AND (ts.Ten IS NOT NULL AND ts.Ten <> '')`;
            if (searchTerm) {
                whereClause += ` AND (ts.Holot + ' ' + ts.Ten LIKE @SearchTerm OR ts.Maso LIKE @SearchTerm)`;
                request.input('SearchTerm', sql.NVarChar, `%${searchTerm}%`);
            }
            
            const trungTuyenFilter = [];
            if (trungTuyenYes === 'true') trungTuyenFilter.push(1);
            if (trungTuyenNo === 'true') trungTuyenFilter.push(0);

            if (trungTuyenFilter.length === 1) {
                whereClause += trungTuyenFilter[0] === 1 ? ` AND ts.Trungtuyen = 1` : ` AND (ts.Trungtuyen = 0 OR ts.Trungtuyen IS NULL)`;
            }

            // CẬP NHẬT: Xây dựng mệnh đề ORDER BY động
            const allowedSortKeys = ['Maso', 'Holot', 'Ten', 'Tennganh', 'NV1', 'NV2', 'NV3'];
            const safeSortKey = allowedSortKeys.includes(sortKey) ? sortKey : 'Maso';
            const safeSortDirection = sortDirection.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

            let orderByClause = '';
            switch (safeSortKey) {
                case 'Ten':
                    orderByClause = `ORDER BY ts.Ten ${safeSortDirection}, ts.Holot ASC`;
                    break;
                case 'Holot':
                    orderByClause = `ORDER BY ts.Holot ${safeSortDirection}, ts.Ten ASC`;
                    break;
                case 'Tennganh':
                    orderByClause = `ORDER BY ng.Tennganh ${safeSortDirection}, ts.Ten ASC, ts.Holot ASC`;
                    break;
                case 'NV1':
                    orderByClause = `ORDER BY Aspirations.NV1 ${safeSortDirection}, ts.Ten ASC, ts.Holot ASC`;
                    break;
                case 'NV2':
                    orderByClause = `ORDER BY Aspirations.NV2 ${safeSortDirection}, ts.Ten ASC, ts.Holot ASC`;
                    break;
                case 'NV3':
                    orderByClause = `ORDER BY Aspirations.NV3 ${safeSortDirection}, ts.Ten ASC, ts.Holot ASC`;
                    break;
                case 'Maso':
                default:
                    orderByClause = `ORDER BY ts.Maso ${safeSortDirection}`;
                    break;
            }
            
            const exportQuery = `
                WITH AspirationsCTE AS (
                    SELECT 
                        MaTSXT,
                        [1] AS NV1,
                        [2] AS NV2,
                        [3] AS NV3
                    FROM (
                        SELECT 
                            nv.MaTSXT, 
                            nv.MaNVXT, 
                            ng.Tennganh
                        FROM ThisinhXTNguyenvongXT nv
                        JOIN Nganhhoc ng ON nv.MaNG = ng.MaNG
                    ) AS SourceTable
                    PIVOT (
                        MAX(Tennganh)
                        FOR MaNVXT IN ([1], [2], [3])
                    ) AS PivotTable
                )
                SELECT
                    ts.MaTSXT, ts.Trungtuyen, ts.Maso, ts.Holot, ts.Ten, ts.Gioitinh, ts.Ngaysinh,
                    ts.Noisinh, kv.Khuvuc, d.DTCS, ts.Dienthoai, ts.Fld01 as TrinhdoVH,
                    ts.NamTN, thpt.TruongTHPT, dt.Dantoc, ts.Diachi, ts.Hokhau,
                    ts.SoCMND, ts.NgaycapCMND, ts.NoicapCMND, ts.Email, ts.Ghichu,
                    ts.DiemUT, ts.TongDXT, ng.Tennganh,
                    ts.Nhaphoc, ts.Phanlop, qd.So AS SoQuyetdinh, qd.Ngayky AS NgaykyQuyetdinh,
                    Aspirations.NV1, Aspirations.NV2, Aspirations.NV3
                FROM ThisinhXT ts
                LEFT JOIN Khuvuc kv ON ts.MaKV = kv.MaKV
                LEFT JOIN DTCS d ON ts.MaDTCS = d.MaDTCS
                LEFT JOIN TruongTHPT thpt ON ts.MaTHPT = thpt.MaTHPT
                LEFT JOIN Dantoc dt ON ts.MaDT = dt.MaDT
                LEFT JOIN Nganhhoc ng ON ts.MaNG = ng.MaNG
                LEFT JOIN QuyetdinhTT qd ON ts.MaQDTT = qd.MaQDTT
                LEFT JOIN AspirationsCTE Aspirations ON ts.MaTSXT = Aspirations.MaTSXT
                ${whereClause}
                ${orderByClause}
            `;
            const result = await request.query(exportQuery);
            res.json(result.recordset);
        } catch (err) {
            console.error("Export Applicants Error:", err);
            res.status(500).json({ message: "Lỗi server khi xuất danh sách thí sinh." });
        }
    });
    
	
	// =================================================================
    // BỔ SUNG: API LẤY DỮ LIỆU CHO CÁC COMBOBOX (IN-LINE EDITING)
    // =================================================================
    router.get('/lookups-admissions', async (req, res) => {
        try {
            const pool = await poolPromise;
            const [
                danTocRes,
                tonGiaoRes,
                tinhThanhRes,
                noiCapCCCDRes,
                trinhDoVHRes,
            ] = await Promise.all([
                pool.request().query('SELECT MaDT, Dantoc FROM Dantoc ORDER BY TT'),
                pool.request().query('SELECT MaTG, Tongiao FROM Tongiao ORDER BY TT'),
                pool.request().query("SELECT DISTINCT Tinhthanh FROM Tinhthanh ORDER BY Tinhthanh"),
                pool.request().query('SELECT NoicapCMND FROM db_NoicapCMND ORDER BY NoicapCMND'),
                pool.request().query('SELECT TrinhdoVH FROM db_TrinhdoVanhoa ORDER BY TrinhdoVH'),
            ]);

            res.json({
                danToc: danTocRes.recordset,
                tonGiao: tonGiaoRes.recordset,
                tinhThanh: tinhThanhRes.recordset.map(item => item.Tinhthanh),
                noiCapCCCD: noiCapCCCDRes.recordset.map(item => item.NoicapCMND),
                trinhDoVanHoa: trinhDoVHRes.recordset.map(item => item.TrinhdoVH),
            });
        } catch (err) {
            console.error('SQL error on /lookups-admissions', err);
            res.status(500).send({ message: 'Lỗi khi truy vấn dữ liệu', error: err.message });
        }
    });
	// =================================================================
    // BỔ SUNG: API CẬP NHẬT TRỰC TIẾP TỪNG TRƯỜNG DỮ LIỆU CỦA THÍ SINH
    // =================================================================
    router.patch('/applicant/:maTSXT/update-field', async (req, res) => {
        const { maTSXT } = req.params;
        // BỔ SUNG GHI LOG: Nhận thêm `logPayload` từ request body
        const { field, value, logPayload } = req.body;
        const { isAdmin, isTuyensinh, maso: currentUserMaso } = req.user;

        // 1. Phân quyền
        if (!isAdmin && !isTuyensinh) {
            return res.status(403).json({ message: 'Không có quyền thực hiện chức năng này.' });
        }

        // 2. Xác định các cột được phép chỉnh sửa
        const editableFields = [
            'Holot', 'Ten', 'Dienthoai', 'NamTN', 'Diachi', 'Hokhau', 'SoCMND', 'Email', 'Ghichu',
            'Gioitinh',
            'Ngaysinh', 'NgaycapCMND',
            'MaDT', 'MaTG',
            'Noisinh', 'NoicapCMND', 'Fld01'
        ];

        if (!editableFields.includes(field)) {
            return res.status(400).json({ message: `Trường '${field}' không được phép chỉnh sửa.` });
        }

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaTSXT', sql.NVarChar, maTSXT);

            let finalValue = value;
            if (value === null || value === '' || value === 'null') {
                finalValue = null;
            }
            
            // 3. Xử lý các kiểu dữ liệu khác nhau
            if (field === 'Gioitinh') {
                request.input('Value', sql.Bit, finalValue);
            } else if (field === 'Ngaysinh' || field === 'NgaycapCMND') {
                if (finalValue === null) {
                    request.input('Value', sql.DateTime, null);
                } else {
                    const date = moment(finalValue, 'YYYY-MM-DD');
                    if (!date.isValid()) {
                        return res.status(400).json({ message: 'Định dạng ngày không hợp lệ.' });
                    }
                    request.input('Value', sql.DateTime, date.toDate());
                }
            } else if (field === 'NamTN') {
                 request.input('Value', sql.Int, finalValue);
            }
            else {
                request.input('Value', sql.NVarChar, finalValue);
            }

            // 4. Thực thi câu lệnh cập nhật
            const query = `UPDATE ThisinhXT SET [${field}] = @Value WHERE MaTSXT = @MaTSXT`;
            await request.query(query);

            // BỔ SUNG GHI LOG: Ghi log sau khi cập nhật thành công
            if (logPayload) {
                try {
                    const getMasoReq = new sql.Request(pool);
                    getMasoReq.input('MaTSXT', sql.NVarChar, maTSXT);
                    const masoResult = await getMasoReq.query('SELECT Maso FROM ThisinhXT WHERE MaTSXT = @MaTSXT');
                    const maso = masoResult.recordset[0]?.Maso || maTSXT;

                    const { columnLabel, oldDisplayValue, newDisplayValue } = logPayload;
                    const cuaso = 'Danh sách thí sinh';
                    const congviec = `Cập nhật trực tiếp: ${columnLabel}`;
                    const ghichu = `TS: ${maso} | Cột: '${columnLabel}' | ${oldDisplayValue} -> ${newDisplayValue}`;
                    
                    await writeLog(pool, currentUserMaso, cuaso, congviec, ghichu);
                } catch (logErr) {
                    // Nếu ghi log lỗi, không làm ảnh hưởng đến kết quả trả về cho người dùng
                    console.error("Lỗi khi ghi log cập nhật trực tiếp:", logErr);
                }
            }

            res.status(200).json({ message: 'Cập nhật thành công' });
        } catch (err) {
            console.error("Inline Applicant Update API Error:", err);
            res.status(500).json({ message: 'Lỗi server khi cập nhật dữ liệu thí sinh.' });
        }
    });

	// BỔ SUNG API MỚI: Lấy số phiếu thu tiếp theo cho tuyển sinh
    router.get('/next-receipt-number', async (req, res) => {
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            // Giả định rằng phiếu thu tuyển sinh có MaLPT = '002'
            request.input('MaLPT', sql.NVarChar, '002');

            const result = await request.query(`
                SELECT ISNULL(MAX(SoCT), 0) + 1 as nextSoCT 
                FROM Hocphi 
                WHERE MaLPT = @MaLPT
            `);

            res.json({ nextSoCT: result.recordset[0].nextSoCT });
        } catch (err) {
            console.error("Get Next Receipt Number (Admissions) Error:", err);
            res.status(500).json({ message: "Lỗi server khi lấy số phiếu thu mới." });
        }
    });
	
    router.get('/receipts-summary', async (req, res) => {
        const { maDXT } = req.query;
        if (!maDXT) return res.status(400).json({ message: "Thiếu Mã đợt xét tuyển." });
    
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaDXT', sql.NVarChar, maDXT);
    
            const result = await request.query(`
                WITH ApplicantFees AS (
                    SELECT 
                        h.MaSV, kt.Khoanthu, SUM(h.Sotien) as TotalAmount
                    FROM Hocphi h JOIN Khoanthu kt ON h.MaKT = kt.MaKT
                    WHERE h.MaHK = '000' AND h.MaSV LIKE 'XT%'
                    GROUP BY h.MaSV, kt.Khoanthu
                )
                SELECT 
                    ts.Maso, ts.Holot, ts.Ten, ts.Trungtuyen, ts.Phanlop, ng.Tennganh,
                    af.Khoanthu, af.TotalAmount
                FROM ThisinhXT ts
                LEFT JOIN Nganhhoc ng ON ts.MaNG = ng.MaNG
                LEFT JOIN ApplicantFees af ON 'XT' + ts.MaTSXT = af.MaSV
                WHERE ts.MaDXT = @MaDXT AND (ts.Holot IS NOT NULL AND ts.Holot <> '') AND (ts.Ten IS NOT NULL AND ts.Ten <> '')
                ORDER BY ts.Maso ASC
            `);
    
            const applicants = {};
            const feeTypes = new Set();
    
            result.recordset.forEach(row => {
                if (!applicants[row.Maso]) {
                    applicants[row.Maso] = {
                        'Maso': row.Maso, 'Holot': row.Holot, 'Ten': row.Ten,
                        'Trungtuyen': row.Trungtuyen, 'Tennganh': row.Tennganh, 'Phanlop': row.Phanlop,
                    };
                }
                if (row.Khoanthu) {
                    applicants[row.Maso][row.Khoanthu] = row.TotalAmount;
                    feeTypes.add(row.Khoanthu);
                }
            });
    
            const sortedFeeTypes = Array.from(feeTypes).sort();
            const finalData = Object.values(applicants).map(app => {
                const newApp = {...app};
                sortedFeeTypes.forEach(fee => { if (!newApp[fee]) newApp[fee] = 0; });
                return newApp;
            });
    
            res.json({data: finalData, feeTypes: sortedFeeTypes});
        } catch (err) {
            console.error("Get Receipts Summary Error:", err);
            res.status(500).json({ message: "Lỗi server khi lấy danh sách thu." });
        }
    });

    router.get('/other-fee-types', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT MaKT, Khoanthu, Lydo FROM Khoanthu ORDER BY MaKT');
            res.json(result.recordset);
        } catch (err) {
            res.status(500).json({ message: "Lỗi server khi lấy danh sách khoản thu." });
        }
    });

    router.get('/other-fee-history', async (req, res) => {
        const { maTSXT, maKT } = req.query;
        if (!maTSXT || !maKT) {
            return res.status(400).json({ message: "Thiếu thông tin để lấy lịch sử thu." });
        }
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            const maSVWithPrefix = 'XT' + maTSXT;
            request.input('MaSV', sql.NVarChar, maSVWithPrefix); 
            request.input('MaKT', sql.NVarChar, maKT);
            const result = await request.query(`
                SELECT Lan, SoCT, Sotien, Ngaynop, MaUser, Lydo, Ghichu
                FROM Hocphi
                WHERE MaSV = @MaSV AND MaHK = '000' AND MaKT = @MaKT
                ORDER BY Ngaynop DESC;
            `);
            const formattedData = result.recordset.map(item => ({
                ...item,
                Ngaynop: item.Ngaynop ? moment(item.Ngaynop).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY') : null
            }));
            res.json(formattedData);
        } catch (err) {
            res.status(500).json({ message: "Lỗi server khi lấy lịch sử thu khoản khác." });
        }
    });

    router.post('/save-other-fee', async (req, res) => {
        const payload = req.body;
        const MaUser = req.user.maso;
        const maSVWithPrefix = 'XT' + payload.MaSV;

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            
            const checkStudentRequest = new sql.Request(transaction);
            checkStudentRequest.input('MaSV', sql.NVarChar, maSVWithPrefix);
            const studentResult = await checkStudentRequest.query('SELECT COUNT(*) as count FROM Sinhvien WHERE MaSV = @MaSV');

            if (studentResult.recordset[0].count === 0) {
                const applicantInfoRequest = new sql.Request(transaction);
                applicantInfoRequest.input('MaTSXT', sql.NVarChar, payload.MaSV);
                const applicantInfo = await applicantInfoRequest.query('SELECT Maso, Holot, Ten, Fld01 FROM ThisinhXT WHERE MaTSXT = @MaTSXT');
                
                if (applicantInfo.recordset.length > 0) {
                    const { Maso, Holot, Ten, Fld01 } = applicantInfo.recordset[0];
                    const insertStudentRequest = new sql.Request(transaction);
                    insertStudentRequest.input('MaSV', sql.NVarChar, maSVWithPrefix);
                    insertStudentRequest.input('Maso', sql.NVarChar, Maso);
                    insertStudentRequest.input('Holot', sql.NVarChar, Holot);
                    insertStudentRequest.input('Ten', sql.NVarChar, Ten);
                    insertStudentRequest.input('MaSVgoc', sql.NVarChar, maSVWithPrefix);
					insertStudentRequest.input('TrinhdoVH', sql.NVarChar, Fld01);
					insertStudentRequest.input('Maso', sql.NVarChar, MaTS);
                    await insertStudentRequest.query(`
                        INSERT INTO Sinhvien (MaSV, Maso, Holot, Ten, MaSVgoc, TrinhdoVH, MaTS)
                        VALUES (@MaSV, @Maso, @Holot, @Ten, @MaSVgoc, @TrinhdoVH, @Maso)
                    `);
                }
            }

            const request = new sql.Request(transaction);
            const ngaynopSql = moment(payload.Ngaynop, 'DD/MM/YYYY').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
            
            request.input('MaSV', sql.NVarChar, maSVWithPrefix);
            request.input('MaHK', sql.NVarChar, payload.MaHK);
            request.input('MaKT', sql.NVarChar, payload.MaKT);
            request.input('Lan', sql.Int, payload.Lan);
            request.input('Lydo', sql.NVarChar, payload.Lydo);
            request.input('SoCT', sql.Int, payload.SoCT);
            request.input('Thue', sql.Int, payload.Thue);
            request.input('Sotien', sql.Int, payload.Sotien);
            request.input('Sotienthu', sql.Int, payload.Sotienthu);
            request.input('Ngaynop', sql.DateTime, ngaynopSql);
            request.input('MaUser', sql.NVarChar, MaUser);
            request.input('Ghichu', sql.NVarChar, payload.Ghichu);
            request.input('MaLPT', sql.NVarChar, payload.MaLPT);
            request.input('Hinhthucthanhtoan', sql.NVarChar, payload.Hinhthucthanhtoan);

            await request.query(`
                INSERT INTO Hocphi (MaSV, MaHK, MaKT, Lan, Lydo, SoCT, Thue, Sotien, Sotienthu, Ngaynop, MaUser, Ghichu, MaLPT, Hinhthucthanhtoan) 
                VALUES (@MaSV, @MaHK, @MaKT, @Lan, @Lydo, @SoCT, @Thue, @Sotien, @Sotienthu, @Ngaynop, @MaUser, @Ghichu, @MaLPT, @Hinhthucthanhtoan)
            `);
            
            await transaction.commit();
            res.status(201).json({ message: 'Lưu phiếu thu thành công!' });

        } catch (err) {
            await transaction.rollback();
            console.error("Save Other Fee Error:", err);
            res.status(500).json({ message: 'Lỗi server khi lưu phiếu thu khoản khác.' });
        }
    });

    router.get('/form-dependencies', async (req, res) => {
        try {
            const pool = await poolPromise;
            const [
                noiSinhRes, danTocRes, tonGiaoRes, dtcsRes, trinhDoRes, truongPTRes, noiCapRes, tiepCanRes, khuvucRes
            ] = await Promise.all([
                pool.request().query("SELECT DISTINCT Tinhthanh as TenTinh FROM Tinhthanh ORDER BY Tinhthanh"),
                pool.request().query("SELECT MaDT, Dantoc FROM Dantoc ORDER BY TT, MaDT"),
                pool.request().query("SELECT MaTG, Tongiao FROM Tongiao ORDER BY TT, MaTG"),
                pool.request().query("SELECT MaDTCS, DTCS, DiemUT FROM DTCS ORDER BY TT, MaDTCS"),
                pool.request().query("SELECT TrinhdoVH FROM db_TrinhdoVanhoa ORDER BY TrinhdoVH"),
                pool.request().query("SELECT MaTHPT, TruongTHPT, MaKV FROM TruongTHPT ORDER BY TruongTHPT"),
                pool.request().query("SELECT NoicapCMND FROM db_NoicapCMND ORDER BY NoicapCMND"),
                pool.request().query("SELECT MaTiepCan, TenTiepCan FROM db_TiepCan ORDER BY TenTiepCan"),
                pool.request().query("SELECT MaKV, DiemUT FROM Khuvuc")
            ]);
            
            res.json({
                noiSinhList: noiSinhRes.recordset.map(r => r.TenTinh),
                danTocList: danTocRes.recordset,
                tonGiaoList: tonGiaoRes.recordset,
                dtcsList: dtcsRes.recordset,
                trinhDoList: trinhDoRes.recordset.map(r => r.TrinhdoVH),
                truongPTList: truongPTRes.recordset,
                noiCapList: noiCapRes.recordset.map(r => r.NoicapCMND),
                tiepCanList: tiepCanRes.recordset,
                khuvucList: khuvucRes.recordset
            });
        } catch (err) {
            console.error("Get Form Dependencies Error:", err);
            res.status(500).json({ message: "Lỗi server khi tải dữ liệu." });
        }
    });

     router.get('/aspirations-dependencies', async (req, res) => {
        const { maDXT, maTSXT } = req.query;
        if (!maDXT) return res.status(400).json({ message: "Thiếu Mã đợt xét tuyển." });

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaDXT', sql.NVarChar, maDXT);
            if (maTSXT) request.input('MaTSXT', sql.NVarChar, maTSXT);

            const queries = [
                request.query(`
                    SELECT DISTINCT n.MaNG, n.Tennganh, n.Dacdiem, n.BacDTHienthi 
                    FROM Nganhhoc n 
                    JOIN DotXTNganhhocTohopXT dnt ON n.MaNG = dnt.MaNG 
                    WHERE dnt.MaDXT = @MaDXT ORDER BY n.Tennganh
                `),
                request.query(`
                    SELECT DISTINCT t.MaTHXT, t.TohopXT, t.Kyhieu 
                    FROM TohopXT t 
                    JOIN DotXTNganhhocTohopXT dnt ON t.MaTHXT = dnt.MaTHXT 
                    WHERE dnt.MaDXT = @MaDXT ORDER BY t.TohopXT
                `),
                request.query(`SELECT MaTCXT, TieuchiXT FROM TieuchiXT ORDER BY MaTCXT`),
                request.query(`SELECT MaNG, MaTHXT FROM DotXTNganhhocTohopXT WHERE MaDXT = @MaDXT`),
                request.query(`
                    SELECT ttm.MaTHXT, m.MaMXT, m.MonXT 
                    FROM TohopXTMonXT ttm 
                    JOIN MonXT m ON ttm.MaMXT = m.MaMXT 
                    ORDER BY ttm.MaTHXT, ttm.TT
                `),
                maTSXT ? request.query(`SELECT * FROM ThisinhXTNguyenvongXT WHERE MaTSXT = @MaTSXT ORDER BY MaNVXT`) : Promise.resolve({ recordset: [] }),
                maTSXT ? request.query(`SELECT * FROM ThisinhXTMonXT WHERE MaTSXT = @MaTSXT`) : Promise.resolve({ recordset: [] })
            ];

            const results = await Promise.all(queries);

            res.json({
                nganhHocList: results[0].recordset,
                toHopList: results[1].recordset,
                tieuChiList: results[2].recordset,
                nganhToHopMapping: results[3].recordset,
                toHopMonMapping: results[4].recordset,
                existingAspirations: results[5].recordset,
                existingScores: results[6].recordset,
            });

        } catch (err) {
            console.error("Get Aspirations Dependencies Error:", err);
            res.status(500).json({ message: "Lỗi server khi tải dữ liệu nguyện vọng." });
        }
    });

    router.get('/applicant/:maTSXT', async (req, res) => {
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaTSXT', sql.NVarChar, req.params.maTSXT);
            const result = await request.query(`
                SELECT ts.*, hs.Ghichu as GhichuHoSo, hs.* FROM ThisinhXT ts
                LEFT JOIN db_ThisinhXTnopHoso hs ON ts.MaTSXT = hs.MaTSXT
                WHERE ts.MaTSXT = @MaTSXT
            `);
            
            if (result.recordset.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy thí sinh." });
            }
            res.json(result.recordset[0]);
        } catch (err) {
            console.error("Get Applicant Details Error:", err);
            res.status(500).json({ message: "Lỗi server khi lấy chi tiết thí sinh." });
        }
    });

    router.post('/applicant', async (req, res) => {
        const { aspirations, scores, ...applicantData } = req.body;
        const currentUser = req.user.maso;
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();
            
            const checkCounterReq = new sql.Request(transaction);
            checkCounterReq.input('MaDXT', sql.NVarChar, applicantData.MaDXT);
            const counterRes = await checkCounterReq.query("SELECT COUNT(*) as count FROM DB_DotXTCounters WHERE MaDXT = @MaDXT");
            if (counterRes.recordset[0].count === 0) {
                const initCounterReq = new sql.Request(transaction);
                initCounterReq.input('MaDXT', sql.NVarChar, applicantData.MaDXT);
                await initCounterReq.query("INSERT INTO DB_DotXTCounters (MaDXT, SoCuoi) VALUES (@MaDXT, 0)");
            }

            const syncCounterReq = new sql.Request(transaction);
            syncCounterReq.input('MaDXT', sql.NVarChar, applicantData.MaDXT);
            const maxSoCuoiRes = await syncCounterReq.query(`
                SELECT MAX(CAST(RIGHT(MaTSXT, 4) AS INT)) as maxSo 
                FROM ThisinhXT 
                WHERE MaDXT = @MaDXT
            `);
            const maxSoThucTe = maxSoCuoiRes.recordset[0].maxSo || 0;
            if (maxSoThucTe > 0) {
                const updateCounterReq = new sql.Request(transaction);
                updateCounterReq.input('MaDXT', sql.NVarChar, applicantData.MaDXT);
                updateCounterReq.input('maxSoThucTe', sql.Int, maxSoThucTe);
                await updateCounterReq.query(`
                    UPDATE DB_DotXTCounters 
                    SET SoCuoi = @maxSoThucTe 
                    WHERE MaDXT = @MaDXT AND SoCuoi < @maxSoThucTe
                `);
            }

            const getNextNumReq = new sql.Request(transaction);
            getNextNumReq.input('MaDXT', sql.NVarChar, applicantData.MaDXT);
            const nextNumRes = await getNextNumReq.query(`UPDATE DB_DotXTCounters SET SoCuoi = SoCuoi + 1 OUTPUT inserted.SoCuoi WHERE MaDXT = @MaDXT;`);
            const soMoi = nextNumRes.recordset[0].SoCuoi;
			
			 //Định dạng số có 4 chữ số
            const soMoiDaDinhDang = String(soMoi).padStart(4, '0');
            //Định dạng số có 3 chữ số
            const soMoiDaDinhDangMaso = String(soMoi).padStart(3, '0');
			
			 const getPrefixReq = new sql.Request(transaction);
            getPrefixReq.input('MaDXT', sql.NVarChar, applicantData.MaDXT);
            const prefixRes = await getPrefixReq.query("SELECT Ma_DXT FROM DotXT WHERE MaDXT = @MaDXT");
            if(prefixRes.recordset.length === 0) throw new Error("Không tìm thấy Mã_DXT cho Đợt tuyển sinh này.");
            const maPrefix = prefixRes.recordset[0].Ma_DXT;
            const newMaTSXT = applicantData.MaDXT + soMoiDaDinhDang;
            const newMaso = maPrefix + soMoiDaDinhDangMaso; //nếu cần 4 số thì thay đổi giá trị này thành soMoiDaDinhDang

            const requestTS = new sql.Request(transaction);
            requestTS.input('MaTSXT', sql.NVarChar, newMaTSXT);
            requestTS.input('Maso', sql.NVarChar, newMaso);
            requestTS.input('MaDXT', sql.NVarChar, applicantData.MaDXT);
            requestTS.input('Holot', sql.NVarChar, applicantData.Holot);
            requestTS.input('Ten', sql.NVarChar, applicantData.Ten);
            requestTS.input('Gioitinh', sql.Bit, applicantData.Gioitinh);
            requestTS.input('Ngaysinh', sql.Date, applicantData.Ngaysinh || null);
            requestTS.input('Noisinh', sql.NVarChar, applicantData.Noisinh);
            requestTS.input('MaDT', sql.NVarChar, applicantData.MaDT);
            requestTS.input('MaTG', sql.NVarChar, applicantData.MaTG);
            requestTS.input('MaDTCS', sql.NVarChar, applicantData.MaDTCS);
            requestTS.input('Dienthoai', sql.NVarChar, applicantData.Dienthoai);
            requestTS.input('Email', sql.NVarChar, applicantData.Email);
            requestTS.input('Diachi', sql.NVarChar, applicantData.Diachi);
            requestTS.input('Hokhau', sql.NVarChar, applicantData.Hokhau);
            requestTS.input('Fld01', sql.NVarChar, applicantData.Fld01);
            requestTS.input('NamTN', sql.Int, applicantData.NamTN || null);
            requestTS.input('MaTHPT', sql.NVarChar, applicantData.MaTHPT);
            requestTS.input('MaKV', sql.NVarChar, applicantData.MaKV);
            requestTS.input('SoCMND', sql.NVarChar, applicantData.SoCMND);
            requestTS.input('NgaycapCMND', sql.Date, applicantData.NgaycapCMND || null);
            requestTS.input('NoicapCMND', sql.NVarChar, applicantData.NoicapCMND || null);
            requestTS.input('Ghichu', sql.NVarChar, applicantData.Ghichu);
            
            await requestTS.query(`
                INSERT INTO ThisinhXT (MaTSXT, Maso, MaDXT, Holot, Ten, Gioitinh, Ngaysinh, Noisinh, MaDT, MaTG, MaDTCS, Dienthoai, Email, Diachi, Hokhau, Fld01, NamTN, MaTHPT, MaKV, SoCMND, NgaycapCMND, NoicapCMND, Ghichu) 
                VALUES (@MaTSXT, @Maso, @MaDXT, @Holot, @Ten, @Gioitinh, @Ngaysinh, @Noisinh, @MaDT, @MaTG, @MaDTCS, @Dienthoai, @Email, @Diachi, @Hokhau, @Fld01, @NamTN, @MaTHPT, @MaKV, @SoCMND, @NgaycapCMND, @NoicapCMND, @Ghichu)
            `);

            const requestHS = new sql.Request(transaction);
            requestHS.input('MaTSXT', sql.NVarChar, newMaTSXT);
            requestHS.input('hs1', sql.Bit, applicantData.hs1); requestHS.input('hs2', sql.Bit, applicantData.hs2); requestHS.input('hs3', sql.Bit, applicantData.hs3);
            requestHS.input('hs4', sql.Bit, applicantData.hs4); requestHS.input('hs5', sql.Bit, applicantData.hs5); requestHS.input('hs6', sql.Bit, applicantData.hs6);
            requestHS.input('hs7', sql.Bit, applicantData.hs7);
            requestHS.input('hs8', sql.Bit, applicantData.hs8);
            requestHS.input('hs9', sql.Bit, applicantData.hs9);
            requestHS.input('hs11', sql.Bit, applicantData.hs11);
            requestHS.input('hs12', sql.Bit, applicantData.hs12);
            requestHS.input('hs13', sql.NVarChar, applicantData.hs13);
            requestHS.input('hs14', sql.Bit, applicantData.hs14);
            requestHS.input('hs15', sql.Bit, applicantData.hs15);
            requestHS.input('hs16', sql.Bit, applicantData.hs16);
            requestHS.input('NopOnline', sql.Bit, applicantData.NopOnline);
            requestHS.input('SoDT', sql.NVarChar, applicantData.SoDT);
            requestHS.input('MaTiepCan', sql.NVarChar, applicantData.MaTiepCan || null);
            requestHS.input('GhiChu', sql.NVarChar, applicantData.GhichuHoSo);
            requestHS.input('NguoiNhan', sql.NVarChar, currentUser);
            requestHS.input('NgayNhan', sql.DateTime, moment().tz('Asia/Ho_Chi_Minh').toDate());
            
            await requestHS.query(`
                INSERT INTO db_ThisinhXTnopHoso (MaTSXT, hs1, hs2, hs3, hs4, hs5, hs6, hs7, hs8, hs9, hs11, hs12, hs13, hs14, hs15, hs16, NopOnline, SoDT, MaTiepCan, GhiChu, NguoiNhan, NgayNhan)
                VALUES (@MaTSXT, @hs1, @hs2, @hs3, @hs4, @hs5, @hs6, @hs7, @hs8, @hs9, @hs11, @hs12, @hs13, @hs14, @hs15, @hs16, @NopOnline, @SoDT, @MaTiepCan, @GhiChu, @NguoiNhan, @NgayNhan)
            `);
            
            let totalScore = 0;
            if (scores && scores.length > 0) {
                for (const score of scores) {
                    const diemValue = parseFloat(String(score.Diem).replace(',', '.')) || 0;
                    totalScore += diemValue;
                    const insertScoreReq = new sql.Request(transaction);
                    insertScoreReq.input('MaTSXT', sql.NVarChar, newMaTSXT);
                    insertScoreReq.input('MaMXT', sql.NVarChar, score.MaMXT);
                    insertScoreReq.input('Diem', sql.Real, diemValue);
                    insertScoreReq.input('Ghichu', sql.NVarChar, score.Ghichu);
                    await insertScoreReq.query(`INSERT INTO ThisinhXTMonXT (MaTSXT, MaMXT, Diem, Ghichu) VALUES (@MaTSXT, @MaMXT, @Diem, @Ghichu)`);
                }
            }

            const getBonusReq = new sql.Request(transaction);
            getBonusReq.input('MaKV', sql.NVarChar, applicantData.MaKV);
            getBonusReq.input('MaDTCS', sql.NVarChar, applicantData.MaDTCS);
            const bonusRes = await getBonusReq.query(`
                SELECT 
                    (SELECT DiemUT FROM Khuvuc WHERE MaKV = @MaKV) as DiemUT_KV,
                    (SELECT DiemUT FROM DTCS WHERE MaDTCS = @MaDTCS) as DiemUT_DTCS
            `);
            const priorityBonus = (bonusRes.recordset[0].DiemUT_KV || 0) + (bonusRes.recordset[0].DiemUT_DTCS || 0);
            
            let DiemUT = priorityBonus;
            if (totalScore >= 22.5) {
                DiemUT = ((30 - totalScore) / 7.5) * priorityBonus;
            }
            DiemUT = Math.round(DiemUT * 100) / 100;
            
            if (aspirations && aspirations.length > 0) {
                for (const aspiration of aspirations) {
                    if (!aspiration.MaNG) continue;
                    
                    const TongDXT = Math.round((totalScore + DiemUT) * 100) / 100;
                    const DTBXT = Math.round(((totalScore / 3) + DiemUT) * 100) / 100;

                    const insertAspirationReq = new sql.Request(transaction);
                    insertAspirationReq.input('MaTSXT', sql.NVarChar, newMaTSXT);
                    insertAspirationReq.input('MaNVXT', sql.Int, aspiration.MaNVXT);
                    insertAspirationReq.input('MaNG', sql.NVarChar, aspiration.MaNG);
                    insertAspirationReq.input('MaTHXT', sql.NVarChar, aspiration.MaTHXT);
                    insertAspirationReq.input('MaTCXT', sql.NVarChar, aspiration.MaTCXT || null);
                    insertAspirationReq.input('TongDXT', sql.Real, TongDXT);
                    insertAspirationReq.input('DTBXT', sql.Real, DTBXT);
                    await insertAspirationReq.query(`
                        INSERT INTO ThisinhXTNguyenvongXT (MaTSXT, MaNVXT, MaNG, MaTHXT, MaTCXT, TongDXT, DTBXT) 
                        VALUES (@MaTSXT, @MaNVXT, @MaNG, @MaTHXT, @MaTCXT, @TongDXT, @DTBXT)
                    `);
                }
            }

            const finalUpdateReq = new sql.Request(transaction);
            finalUpdateReq.input('MaTSXT', sql.NVarChar, newMaTSXT);
            finalUpdateReq.input('DiemUT', sql.Real, DiemUT);
            finalUpdateReq.input('DiemXT', sql.Real, Math.round((totalScore + DiemUT) * 100) / 100);
            finalUpdateReq.input('Mon1', sql.Real, parseFloat(String(scores[0]?.Diem).replace(',', '.')) || 0);
            finalUpdateReq.input('Mon2', sql.Real, parseFloat(String(scores[1]?.Diem).replace(',', '.')) || 0);
            finalUpdateReq.input('Mon3', sql.Real, parseFloat(String(scores[2]?.Diem).replace(',', '.')) || 0);

            await finalUpdateReq.query(`UPDATE ThisinhXT SET DiemUT = @DiemUT WHERE MaTSXT = @MaTSXT`);
            await finalUpdateReq.query(`UPDATE db_ThisinhXTnopHoso SET DiemUT = @DiemUT, DiemXT = @DiemXT, Mon1 = @Mon1, Mon2 = @Mon2, Mon3 = @Mon3 WHERE MaTSXT = @MaTSXT`);

            await transaction.commit();
            await writeLog(pool, currentUser, 'DS thí sinh', 'Thêm mới', `Thêm mới TS: ${newMaso}`);
            res.status(201).json({ message: 'Thêm mới thí sinh thành công!', newApplicant: { ...applicantData, MaTSXT: newMaTSXT, Maso: newMaso }});
        } catch (err) {
            await transaction.rollback();
            console.error("Add Applicant Error:", err);
            res.status(500).json({ message: err.message || "Lỗi server khi thêm thí sinh." });
        }
    });

    router.put('/applicant/:maTSXT', async(req, res) => {
        const { aspirations, scores, ...applicantData } = req.body;
        const { maTSXT } = req.params;
        const currentUser = req.user.maso;
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            const requestTS = new sql.Request(transaction);
            requestTS.input('MaTSXT', sql.NVarChar, maTSXT);
            requestTS.input('Holot', sql.NVarChar, applicantData.Holot);
            requestTS.input('Ten', sql.NVarChar, applicantData.Ten);
            requestTS.input('Gioitinh', sql.Bit, applicantData.Gioitinh);
            requestTS.input('Ngaysinh', sql.Date, applicantData.Ngaysinh || null);
            requestTS.input('Noisinh', sql.NVarChar, applicantData.Noisinh);
            requestTS.input('MaDT', sql.NVarChar, applicantData.MaDT);
            requestTS.input('MaTG', sql.NVarChar, applicantData.MaTG);
            requestTS.input('MaDTCS', sql.NVarChar, applicantData.MaDTCS);
            requestTS.input('Dienthoai', sql.NVarChar, applicantData.Dienthoai);
            requestTS.input('Email', sql.NVarChar, applicantData.Email);
            requestTS.input('Diachi', sql.NVarChar, applicantData.Diachi);
            requestTS.input('Hokhau', sql.NVarChar, applicantData.Hokhau);
            requestTS.input('Fld01', sql.NVarChar, applicantData.Fld01);
            requestTS.input('NamTN', sql.Int, applicantData.NamTN || null);
            requestTS.input('MaTHPT', sql.NVarChar, applicantData.MaTHPT);
            requestTS.input('MaKV', sql.NVarChar, applicantData.MaKV);
            requestTS.input('SoCMND', sql.NVarChar, applicantData.SoCMND);
            requestTS.input('NgaycapCMND', sql.Date, applicantData.NgaycapCMND || null);
            requestTS.input('NoicapCMND', sql.NVarChar, applicantData.NoicapCMND || null);
            requestTS.input('Ghichu', sql.NVarChar, applicantData.Ghichu);

            await requestTS.query(`
                UPDATE ThisinhXT SET
                    Holot = @Holot, Ten = @Ten, Gioitinh = @Gioitinh, Ngaysinh = @Ngaysinh, Noisinh = @Noisinh,
                    MaDT = @MaDT, MaTG = @MaTG, MaDTCS = @MaDTCS, Dienthoai = @Dienthoai, Email = @Email,
                    Diachi = @Diachi, Hokhau = @Hokhau, Fld01 = @Fld01, NamTN = @NamTN, MaTHPT = @MaTHPT,
                    MaKV = @MaKV, SoCMND = @SoCMND, NgaycapCMND = @NgaycapCMND, NoicapCMND = @NoicapCMND, Ghichu = @Ghichu
                WHERE MaTSXT = @MaTSXT
            `);

            const checkHosoReq = new sql.Request(transaction);
            checkHosoReq.input('MaTSXT', sql.NVarChar, maTSXT);
            const hosoResult = await checkHosoReq.query("SELECT COUNT(*) as count FROM db_ThisinhXTnopHoso WHERE MaTSXT = @MaTSXT");

            const requestHS = new sql.Request(transaction);
            requestHS.input('MaTSXT', sql.NVarChar, maTSXT);
            requestHS.input('hs1', sql.Bit, applicantData.hs1); requestHS.input('hs2', sql.Bit, applicantData.hs2); requestHS.input('hs3', sql.Bit, applicantData.hs3);
            requestHS.input('hs4', sql.Bit, applicantData.hs4);
            requestHS.input('hs5', sql.Bit, applicantData.hs5);
            requestHS.input('hs6', sql.Bit, applicantData.hs6);
            requestHS.input('hs7', sql.Bit, applicantData.hs7);
            requestHS.input('hs8', sql.Bit, applicantData.hs8);
            requestHS.input('hs9', sql.Bit, applicantData.hs9);
            requestHS.input('hs11', sql.Bit, applicantData.hs11);
            requestHS.input('hs12', sql.Bit, applicantData.hs12);
            requestHS.input('hs13', sql.NVarChar, applicantData.hs13);
            requestHS.input('hs14', sql.Bit, applicantData.hs14);
            requestHS.input('hs15', sql.Bit, applicantData.hs15);
            requestHS.input('hs16', sql.Bit, applicantData.hs16);
            requestHS.input('NopOnline', sql.Bit, applicantData.NopOnline);
            requestHS.input('SoDT', sql.NVarChar, applicantData.SoDT);
            requestHS.input('MaTiepCan', sql.NVarChar, applicantData.MaTiepCan || null);
            requestHS.input('GhiChu', sql.NVarChar, applicantData.GhichuHoSo);
            requestHS.input('NguoiSua', sql.NVarChar, currentUser);
            requestHS.input('NgaySua', sql.DateTime, moment().tz('Asia/Ho_Chi_Minh').toDate());

            if (hosoResult.recordset[0].count > 0) {
                await requestHS.query(`
                    UPDATE db_ThisinhXTnopHoso SET 
                        hs1=@hs1, hs2=@hs2, hs3=@hs3, hs4=@hs4, hs5=@hs5, hs6=@hs6, hs7=@hs7, hs8=@hs8, hs9=@hs9, 
                        hs11=@hs11, hs12=@hs12, hs13=@hs13, hs14=@hs14, hs15=@hs15, hs16=@hs16, 
                        NopOnline=@NopOnline, SoDT=@SoDT, MaTiepCan=@MaTiepCan, GhiChu=@GhiChu,
                        NguoiSua=@NguoiSua, NgaySua=@NgaySua
                    WHERE MaTSXT = @MaTSXT
                `);
            } else {
                requestHS.input('NguoiNhan', sql.NVarChar, currentUser);
                requestHS.input('NgayNhan', sql.DateTime, moment().tz('Asia/Ho_Chi_Minh').toDate());
                await requestHS.query(`
                    INSERT INTO db_ThisinhXTnopHoso (MaTSXT, hs1, hs2, hs3, hs4, hs5, hs6, hs7, hs8, hs9, hs11, hs12, hs13, hs14, hs15, hs16, NopOnline, SoDT, MaTiepCan, GhiChu, NguoiNhan, NgayNhan)
                    VALUES (@MaTSXT, @hs1, @hs2, @hs3, @hs4, @hs5, @hs6, @hs7, @hs8, @hs9, @hs11, @hs12, @hs13, @hs14, @hs15, @hs16, @NopOnline, @SoDT, @MaTiepCan, @GhiChu, @NguoiNhan, @NgayNhan)
                `);
            }

            const deleteAspirationsReq = new sql.Request(transaction);
            deleteAspirationsReq.input('MaTSXT', sql.NVarChar, maTSXT);
            await deleteAspirationsReq.query(`DELETE FROM ThisinhXTNguyenvongXT WHERE MaTSXT = @MaTSXT`);
            
            const deleteScoresReq = new sql.Request(transaction);
            deleteScoresReq.input('MaTSXT', sql.NVarChar, maTSXT);
            await deleteScoresReq.query(`DELETE FROM ThisinhXTMonXT WHERE MaTSXT = @MaTSXT`);

            let totalScore = 0;
            if (scores && scores.length > 0) {
                 for (const score of scores) {
                    const diemValue = parseFloat(String(score.Diem).replace(',', '.')) || 0;
                    totalScore += diemValue;
                    const insertScoreReq = new sql.Request(transaction);
                    insertScoreReq.input('MaTSXT', sql.NVarChar, maTSXT);
                    insertScoreReq.input('MaMXT', sql.NVarChar, score.MaMXT);
                    insertScoreReq.input('Diem', sql.Real, diemValue);
                    insertScoreReq.input('Ghichu', sql.NVarChar, score.Ghichu);
                    await insertScoreReq.query(`INSERT INTO ThisinhXTMonXT (MaTSXT, MaMXT, Diem, Ghichu) VALUES (@MaTSXT, @MaMXT, @Diem, @Ghichu)`);
                }
            }
            
            const getBonusReq = new sql.Request(transaction);
            getBonusReq.input('MaKV', sql.NVarChar, applicantData.MaKV);
            getBonusReq.input('MaDTCS', sql.NVarChar, applicantData.MaDTCS);
            const bonusRes = await getBonusReq.query(`
                SELECT 
                    (SELECT DiemUT FROM Khuvuc WHERE MaKV = @MaKV) as DiemUT_KV,
                    (SELECT DiemUT FROM DTCS WHERE MaDTCS = @MaDTCS) as DiemUT_DTCS
            `);
            const priorityBonus = (bonusRes.recordset[0].DiemUT_KV || 0) + (bonusRes.recordset[0].DiemUT_DTCS || 0);
            
            let DiemUT = priorityBonus;
            if (totalScore >= 22.5) {
                DiemUT = ((30 - totalScore) / 7.5) * priorityBonus;
            }
            DiemUT = Math.round(DiemUT * 100) / 100;
            
            if (aspirations && aspirations.length > 0) {
                 for (const aspiration of aspirations) {
                    if (!aspiration.MaNG) continue;
                    
                    const TongDXT = Math.round((totalScore + DiemUT) * 100) / 100;
                    const DTBXT = Math.round(((totalScore / 3) + DiemUT) * 100) / 100;

                    const insertAspirationReq = new sql.Request(transaction);
                    insertAspirationReq.input('MaTSXT', sql.NVarChar, maTSXT);
                    insertAspirationReq.input('MaNVXT', sql.Int, aspiration.MaNVXT);
                    insertAspirationReq.input('MaNG', sql.NVarChar, aspiration.MaNG);
                    insertAspirationReq.input('MaTHXT', sql.NVarChar, aspiration.MaTHXT);
                    insertAspirationReq.input('MaTCXT', sql.NVarChar, aspiration.MaTCXT || null);
                    insertAspirationReq.input('TongDXT', sql.Real, TongDXT);
                    insertAspirationReq.input('DTBXT', sql.Real, DTBXT);
                    await insertAspirationReq.query(`
                        INSERT INTO ThisinhXTNguyenvongXT (MaTSXT, MaNVXT, MaNG, MaTHXT, MaTCXT, TongDXT, DTBXT) 
                        VALUES (@MaTSXT, @MaNVXT, @MaNG, @MaTHXT, @MaTCXT, @TongDXT, @DTBXT)
                    `);
                }
            }
            
            const finalUpdateReq = new sql.Request(transaction);
            finalUpdateReq.input('MaTSXT', sql.NVarChar, maTSXT);
            finalUpdateReq.input('DiemUT', sql.Real, DiemUT);
            finalUpdateReq.input('DiemXT', sql.Real, Math.round((totalScore + DiemUT) * 100) / 100);
            finalUpdateReq.input('Mon1', sql.Real, parseFloat(String(scores[0]?.Diem).replace(',', '.')) || 0);
            finalUpdateReq.input('Mon2', sql.Real, parseFloat(String(scores[1]?.Diem).replace(',', '.')) || 0);
            finalUpdateReq.input('Mon3', sql.Real, parseFloat(String(scores[2]?.Diem).replace(',', '.')) || 0);

            await finalUpdateReq.query(`UPDATE ThisinhXT SET DiemUT = @DiemUT WHERE MaTSXT = @MaTSXT`);
            await finalUpdateReq.query(`UPDATE db_ThisinhXTnopHoso SET DiemUT = @DiemUT, DiemXT = @DiemXT, Mon1 = @Mon1, Mon2 = @Mon2, Mon3 = @Mon3 WHERE MaTSXT = @MaTSXT`);

            await transaction.commit();
            await writeLog(pool, currentUser, 'DS thí sinh', 'Cập nhật', `Cập nhật TS: ${applicantData.Maso}`);
            res.json({ message: 'Cập nhật thông tin thành công!' });
        } catch(err) {
            await transaction.rollback();
            console.error("Update Applicant Error:", err);
            res.status(500).json({ message: "Lỗi server khi cập nhật." });
        }
    });
    
    // --- API CHO XÉT TUYỂN VÀ NHẬP HỌC ---
    router.put('/applicant/:maTSXT/set-admission', async (req, res) => {
        const { maTSXT } = req.params;
        const { maNVXT } = req.body;
        const currentUser = req.user.maso;

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            const getMasoReq = new sql.Request(transaction);
            getMasoReq.input('MaTSXT', sql.NVarChar, maTSXT);
            const masoResult = await getMasoReq.query('SELECT Maso FROM ThisinhXT WHERE MaTSXT = @MaTSXT');
            const maso = masoResult.recordset[0]?.Maso || maTSXT;

            const request = new sql.Request(transaction);
            request.input('MaTSXT', sql.NVarChar, maTSXT);
            request.input('MaNVXT', sql.Int, maNVXT);
            request.input('NguoiXT', sql.NVarChar, currentUser);
            request.input('NgayXT', sql.DateTime, moment().tz('Asia/Ho_Chi_Minh').toDate());
            
            await request.query(`UPDATE ThisinhXTNguyenvongXT SET Trungtuyen = NULL WHERE MaTSXT = @MaTSXT`);

            if (maNVXT) {
                const aspirationResult = await request.query(`SELECT * FROM ThisinhXTNguyenvongXT WHERE MaTSXT = @MaTSXT AND MaNVXT = @MaNVXT`);
                if (aspirationResult.recordset.length === 0) {
                    throw new Error("Nguyện vọng không hợp lệ.");
                }
                const chosenAspiration = aspirationResult.recordset[0];

                await request.query(`UPDATE ThisinhXTNguyenvongXT SET Trungtuyen = 1 WHERE MaTSXT = @MaTSXT AND MaNVXT = @MaNVXT`);
                
                const updateTSRequest = new sql.Request(transaction);
                updateTSRequest.input('MaTSXT', sql.NVarChar, maTSXT);
                updateTSRequest.input('Trungtuyen', sql.Int, 1);
                updateTSRequest.input('MaNG', sql.NVarChar, chosenAspiration.MaNG);
                updateTSRequest.input('MaTHXT', sql.NVarChar, chosenAspiration.MaTHXT);
                updateTSRequest.input('MaTCXT', sql.NVarChar, chosenAspiration.MaTCXT);
                updateTSRequest.input('TongDXT', sql.Real, chosenAspiration.TongDXT);
                updateTSRequest.input('DTBXT', sql.Real, chosenAspiration.DTBXT);
                await updateTSRequest.query(`
                    UPDATE ThisinhXT SET Trungtuyen = @Trungtuyen, MaNG = @MaNG, MaTHXT = @MaTHXT, MaTCXT = @MaTCXT, TongDXT = @TongDXT, DTBXT = @DTBXT
                    WHERE MaTSXT = @MaTSXT
                `);
            } else {
                const updateTSRequest = new sql.Request(transaction);
                updateTSRequest.input('MaTSXT', sql.NVarChar, maTSXT);
                await updateTSRequest.query(`
                    UPDATE ThisinhXT SET Trungtuyen = NULL, MaNG = NULL, MaTHXT = NULL, MaTCXT = NULL, TongDXT = NULL, DTBXT = NULL
                    WHERE MaTSXT = @MaTSXT
                `);
            }

            const updateLogRequest = new sql.Request(transaction);
            updateLogRequest.input('MaTSXT', sql.NVarChar, maTSXT);
            updateLogRequest.input('NguoiXT', sql.NVarChar, currentUser);
            updateLogRequest.input('NgayXT', sql.DateTime, moment().tz('Asia/Ho_Chi_Minh').toDate());
            await updateLogRequest.query(`UPDATE db_ThisinhXTnopHoso SET NguoiXT = @NguoiXT, NgayXT = @NgayXT WHERE MaTSXT = @MaTSXT`);

            await transaction.commit();
            await writeLog(pool, currentUser, 'DS thí sinh', 'Xét tuyển', `Xét tuyển TS: ${maso}, NV ${maNVXT || 'Bỏ'}`);
            res.json({ message: "Cập nhật trạng thái trúng tuyển thành công!" });

        } catch (err) {
            await transaction.rollback();
            console.error("Set Admission Error:", err);
            res.status(500).json({ message: err.message || "Lỗi server khi xét trúng tuyển." });
        }
    });

    router.put('/applicant/:maTSXT/set-enrollment', async (req, res) => {
        const { maTSXT } = req.params;
        const { isEnrolled } = req.body;
        const currentUser = req.user.maso;
        
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            const getMasoReq = new sql.Request(transaction);
            getMasoReq.input('MaTSXT', sql.NVarChar, maTSXT);
            const masoResult = await getMasoReq.query('SELECT Maso FROM ThisinhXT WHERE MaTSXT = @MaTSXT');
            const maso = masoResult.recordset[0]?.Maso || maTSXT;

            const request = new sql.Request(transaction);
            request.input('MaTSXT', sql.NVarChar, maTSXT);
            request.input('Nhaphoc', sql.Int, isEnrolled ? 1 : null);
            request.input('NguoiRasoat', sql.NVarChar, currentUser);
            request.input('NgayRasoat', sql.DateTime, moment().tz('Asia/Ho_Chi_Minh').toDate());

            await request.query(`UPDATE ThisinhXT SET Nhaphoc = @Nhaphoc WHERE MaTSXT = @MaTSXT`);
            await request.query(`UPDATE db_ThisinhXTnopHoso SET NguoiRasoat = @NguoiRasoat, NgayRasoat = @NgayRasoat WHERE MaTSXT = @MaTSXT`);
            
            await transaction.commit();
            await writeLog(pool, currentUser, 'DS thí sinh', 'XN nhập học', `XN nhập học TS: ${maso}: ${isEnrolled ? 'Có' : 'Không'}`);
            res.json({ message: "Cập nhật trạng thái nhập học thành công!" });

        } catch (err) {
            await transaction.rollback();
            console.error("Set Enrollment Error:", err);
            res.status(500).json({ message: "Lỗi server khi xác nhận nhập học." });
        }
    });

	  //--XỬ LÝ QR CODE VietQR --
    router.get('/qr-code', (req, res) => {
        const { addInfo } = req.query;
        if (!addInfo) {
            return res.status(400).json({ message: 'Thiếu thông tin cho mã QR.' });
        }

        const qrUrl = `https://api.vietqr.io/image/970436-1023082986-UDfMaKR.jpg?accountName=TRUONG%20CD%20NGHE%20VIET%20NAM%20HAN%20QUOC%20CA%20MAU&amount=30000&addInfo=${addInfo}`;

        https.get(qrUrl, (qrRes) => {
            if (qrRes.statusCode !== 200) {
                console.error(`VietQR API returned status code: ${qrRes.statusCode}`);
                return res.status(qrRes.statusCode).json({ message: 'Không thể lấy ảnh QR từ VietQR.' });
            }

            const chunks = [];
            qrRes.on('data', (chunk) => {
                chunks.push(chunk);
            });

            qrRes.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const base64Image = buffer.toString('base64');
                const contentType = qrRes.headers['content-type']; 
                const format = contentType ? contentType.split('/')[1].toUpperCase() : 'JPEG';
                
                res.json({
                    base64: base64Image,
                    format: format
                });
            });

        }).on('error', (e) => {
            console.error(`Lỗi khi gọi API VietQR: ${e.message}`);
            res.status(500).json({ message: 'Lỗi server khi tạo mã QR.' });
        });
    });

    return router;
};

