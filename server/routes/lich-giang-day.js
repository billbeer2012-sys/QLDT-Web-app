/*
 * Đường dẫn file: D:\QLDT-app\server\routes\lich-giang-day.js
 * Thời gian cập nhật: 28/01/2026
 * Tóm tắt những nội dung cập nhật:
 * - KẾT HỢP: Lịch giảng dạy + Lịch coi thi
 * - Thay đổi Hocphan.Viettat thành Hocphan.Hocphan
 * - Thêm trường isExam để phân biệt dữ liệu lịch thi
 * - Lịch thi: Tách thành 2 dòng cho CBCoiThi1 và CBCoiThi2
 */

const express = require('express');
const sql = require('mssql');
const moment = require('moment-timezone');

module.exports = (poolPromise) => {
    const router = express.Router();

    const sortableColumns = {
        NgayDay: 'NgayDay',
        Buoi: 'Buoi',
        GiangVien: 'GiangVien',
        TenLopHP: 'TenLopHP',
        TenHocPhan: 'TenHocPhan',
        SoGio: 'SoGio',
        PhongHoc: 'PhongHoc',
        GhiChu: 'GhiChu',
        DonVi: 'DonVi',
    };

    /**
     * API GET Lịch giảng dạy + coi thi
     * [GET] /
     */
    router.get('/', async (req, res) => {
        const {
            tuNgay: clientTuNgay,
            denNgay: clientDenNgay,
            searchTerm = '',
            sortBy = 'NgayDay',
            sortDirection = 'ASC',
        } = req.query;

        const today = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
        const tuNgay = clientTuNgay || today;
        // Mặc định denNgay = tuNgay + 3 ngày nếu không được truyền
        const denNgay = clientDenNgay || moment(tuNgay).add(3, 'days').format('YYYY-MM-DD');

        const primarySortColumn = sortableColumns[sortBy] || 'NgayDay';
        const primarySortOrder = sortDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        try {
            const pool = await poolPromise;
            const request = pool.request();

            request.input('tuNgay', sql.Date, tuNgay);
            request.input('denNgay', sql.Date, denNgay);
            request.input('searchTerm', sql.NVarChar, `%${searchTerm}%`);

            // Query 1: Lịch giảng dạy (TKB)
            const teachingQuery = `
                WITH TeachingData AS (
                    SELECT
                        TKB.Ngay AS NgayDay,
                        CASE
                            WHEN TKB.Tiet <= 6 THEN N'Sáng'
                            WHEN TKB.Tiet >= 7 AND TKB.Tiet <= 12 THEN N'Chiều'
                            ELSE N'Tối'
                        END AS Buoi,
                        (Giaovien.Holot + ' ' + Giaovien.Ten) AS GiangVien,
                        LopHP.Tenlop AS TenLopHP,
                        Hocphan.Hocphan AS TenHocPhan,
                        TKB.Sotiet AS SoGio,
                        ISNULL(Nhomphong.Nhomphong + N': ', N'') + Phonghoc.Tenphong AS PhongHoc,
                        TKB.Ghichu AS GhiChu,
                        Donvi.Donvi AS DonVi,
                        LopHP.Tongsotiet AS TongSoTietHP,
                        TKB.MaLHP,
                        0 AS isExam,
                        SUM(ISNULL(TKB.Sotiet, 0)) OVER (
                            PARTITION BY TKB.MaLHP 
                            ORDER BY TKB.Ngay, TKB.Tiet
                            ROWS UNBOUNDED PRECEDING
                        ) AS daDayCumulative,
                        TKB.Tiet AS SortTiet,
                        Giaovien.Ten AS SortTen,
                        Giaovien.Holot AS SortHolot
                    FROM TKB
                    LEFT JOIN Giaovien ON TKB.MaGV = Giaovien.MaGV
                    LEFT JOIN Donvi ON Giaovien.MaDV = Donvi.MaDV
                    LEFT JOIN Phonghoc ON TKB.MaPH = Phonghoc.MaPH
                    LEFT JOIN Nhomphong ON Phonghoc.MaNP = Nhomphong.MaNP
                    LEFT JOIN LopHP ON TKB.MaLHP = LopHP.MaLHP
                    LEFT JOIN Hocphan ON LopHP.MaHP = Hocphan.MaHP
                    WHERE TKB.HieuLuc = 1
                )
                SELECT * FROM TeachingData
                WHERE NgayDay BETWEEN @tuNgay AND @denNgay
                AND (
                    GiangVien LIKE @searchTerm
                    OR TenLopHP LIKE @searchTerm
                    OR TenHocPhan LIKE @searchTerm
                    OR PhongHoc LIKE @searchTerm
                    OR GhiChu LIKE @searchTerm
                    OR DonVi LIKE @searchTerm
                )
            `;

            // Query 2: Lịch coi thi (Phongthi0, Phongthi1, Phongthi2)
            // Sẽ trả về 2 dòng cho mỗi phòng thi (1 cho CBCoiThi1, 1 cho CBCoiThi2)
            const examQuery = `
                WITH PhongthiAll AS (
                    -- Phongthi0 (Giữa kỳ)
                    SELECT 
                        pt0.MaPT0 AS MaPTX, 
                        'Gk' AS Lanthi,
                        pt0.Ngay, pt0.Gio, pt0.Phut, pt0.Thoigian,
                        pt0.MaGV1, pt0.MaGV2, pt0.MaPH,
                        pt0.Ghichu, pt0.Phongthi,
                        SUBSTRING(pt0.MaPT0, 4, 4) AS MaHP,
                        (SELECT COUNT(*) FROM SinhvienLopHP slhp WHERE slhp.MaPT0 = pt0.MaPT0) as SLSV
                    FROM Phongthi0 pt0
                    UNION ALL
                    -- Phongthi1 (Lần 1)
                    SELECT 
                        pt1.MaPT1 AS MaPTX, 
                        'L1' AS Lanthi,
                        pt1.Ngay, pt1.Gio, pt1.Phut, pt1.Thoigian,
                        pt1.MaGV1, pt1.MaGV2, pt1.MaPH,
                        pt1.Ghichu, pt1.Phongthi,
                        SUBSTRING(pt1.MaPT1, 4, 4) AS MaHP,
                        (SELECT COUNT(*) FROM SinhvienLopHP slhp WHERE slhp.MaPT1 = pt1.MaPT1) as SLSV
                    FROM Phongthi1 pt1
                    UNION ALL
                    -- Phongthi2 (Lần 2)
                    SELECT 
                        pt2.MaPT2 AS MaPTX, 
                        'L2' AS Lanthi,
                        pt2.Ngay, pt2.Gio, pt2.Phut, pt2.Thoigian,
                        pt2.MaGV1, pt2.MaGV2, pt2.MaPH,
                        pt2.Ghichu, pt2.Phongthi,
                        SUBSTRING(pt2.MaPT2, 4, 4) AS MaHP,
                        (SELECT COUNT(*) FROM SinhvienLopHP slhp WHERE slhp.MaPT2 = pt2.MaPT2) as SLSV
                    FROM Phongthi2 pt2
                )
                -- Tách thành 2 dòng: 1 cho CBCoiThi1, 1 cho CBCoiThi2
                SELECT 
                    pta.Ngay AS NgayDay,
                    CASE WHEN pta.Gio < 12 THEN N'Sáng' ELSE N'Chiều' END AS Buoi,
                    (gv.Holot + ' ' + gv.Ten) AS GiangVien,
                    pta.Phongthi AS TenLopHP,
                    hp.Hocphan AS TenHocPhan,
                    ROUND(CAST(pta.Thoigian AS FLOAT) / 45, 0) AS SoGio,
                    ISNULL(np.Nhomphong + N': ', N'') + ph.Tenphong AS PhongHoc,
                    N'CBCT ' + CAST(cb.CBNum AS NVARCHAR) + N' - Giờ thi: ' + 
                        RIGHT('0' + CAST(pta.Gio AS VARCHAR), 2) + ':' + RIGHT('0' + CAST(pta.Phut AS VARCHAR), 2) + 
                        N' (' + CAST(pta.Thoigian AS NVARCHAR) + N'p) - Lần thi: ' + pta.Lanthi + 
                        N' - SL: ' + CAST(pta.SLSV AS NVARCHAR) + N'sv' AS GhiChu,
                    dv.Donvi AS DonVi,
                    NULL AS TongSoTietHP,
                    NULL AS MaLHP,
                    1 AS isExam,
                    NULL AS daDayCumulative,
                    CASE WHEN pta.Gio < 12 THEN 1 ELSE 7 END AS SortTiet,
                    gv.Ten AS SortTen,
                    gv.Holot AS SortHolot
                FROM PhongthiAll pta
                CROSS APPLY (
                    SELECT 1 AS CBNum, pta.MaGV1 AS MaGV WHERE pta.MaGV1 IS NOT NULL
                    UNION ALL
                    SELECT 2 AS CBNum, pta.MaGV2 AS MaGV WHERE pta.MaGV2 IS NOT NULL
                ) cb
                LEFT JOIN Giaovien gv ON cb.MaGV = gv.MaGV
                LEFT JOIN Donvi dv ON gv.MaDV = dv.MaDV
                LEFT JOIN Hocphan hp ON pta.MaHP = hp.MaHP
                LEFT JOIN Phonghoc ph ON pta.MaPH = ph.MaPH
                LEFT JOIN Nhomphong np ON ph.MaNP = np.MaNP
                WHERE pta.Ngay BETWEEN @tuNgay AND @denNgay
                AND (
                    (gv.Holot + ' ' + gv.Ten) LIKE @searchTerm
                    OR pta.Phongthi LIKE @searchTerm
                    OR hp.Hocphan LIKE @searchTerm
                    OR ph.Tenphong LIKE @searchTerm
                    OR dv.Donvi LIKE @searchTerm
                )
            `;

            // Execute both queries
            const [teachingResult, examResult] = await Promise.all([
                request.query(teachingQuery),
                pool.request()
                    .input('tuNgay', sql.Date, tuNgay)
                    .input('denNgay', sql.Date, denNgay)
                    .input('searchTerm', sql.NVarChar, `%${searchTerm}%`)
                    .query(examQuery)
            ]);

            // Combine results
            let combinedData = [
                ...teachingResult.recordset,
                ...examResult.recordset
            ];

            // Sort: NgayDay ASC, Buoi DESC (Sáng > Chiều), GiangVien ASC
            combinedData.sort((a, b) => {
                // Primary sort: NgayDay
                const dateA = new Date(a.NgayDay);
                const dateB = new Date(b.NgayDay);
                if (dateA < dateB) return primarySortOrder === 'ASC' ? -1 : 1;
                if (dateA > dateB) return primarySortOrder === 'ASC' ? 1 : -1;

                // Secondary sort: Buoi (Sáng first, then Chiều)
                const buoiOrder = { 'Sáng': 1, 'Chiều': 2, 'Tối': 3 };
                const buoiA = buoiOrder[a.Buoi] || 4;
                const buoiB = buoiOrder[b.Buoi] || 4;
                if (buoiA !== buoiB) return buoiA - buoiB;

                // Tertiary sort: GiangVien ASC
                const gvA = (a.GiangVien || '').toLowerCase();
                const gvB = (b.GiangVien || '').toLowerCase();
                return gvA.localeCompare(gvB, 'vi');
            });

            res.status(200).json(combinedData);
        } catch (error) {
            console.error('Lỗi khi lấy lịch giảng dạy + coi thi:', error);
            res.status(500).json({
                message: 'Lỗi máy chủ nội bộ khi truy vấn dữ liệu.',
                error: error.message,
            });
        }
    });

    return router;
};
