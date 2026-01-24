/*
 * Đường dẫn file: D:\QLDT-app\server\routes\lich-giang-day.js
 * Thời gian cập nhật: 27/10/2025
 * Tóm tắt những nội dung cập nhật:
 * - SỬA LỖI (Tính lũy kế 'Đã dạy'):
 * 1. Thay đổi hoàn toàn logic SQL.
 * 2. Sử dụng Window Function 'SUM... OVER...' trong CTE 'TeachingData'.
 * 3. 'daDayCumulative' (lũy kế) được tính trên *toàn bộ* TKB (đã lọc HieuLuc = 1),
 * *trước khi* áp dụng bộ lọc 'NgayDay' (Từ ngày - Đến ngày).
 * 4. Đảm bảo giá trị lũy kế luôn chính xác, bất kể bộ lọc ngày.
 */

const express = require('express');
const sql = require('mssql');
const moment = require('moment-timezone');

module.exports = (poolPromise) => {
    const router = express.Router();

    // (sortableColumns giữ nguyên, 'DaDay' không thể sắp xếp)
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
     * API GET Lịch giảng dạy giảng viên
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
        const denNgay = clientDenNgay || today;

        // (Logic sắp xếp giữ nguyên)
        const primarySortColumn = sortableColumns[sortBy] || 'NgayDay';
        const primarySortOrder = sortDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        
        const primarySort = `${primarySortColumn} ${primarySortOrder}`;

        const secondarySortList = [
            'NgayDay ASC',
            'SortTiet ASC',
            'SortTen ASC',
            'SortHolot ASC',
            'TenLopHP ASC'
        ];

        const filteredSecondarySort = secondarySortList.filter(sortKey => {
            const sortColumnName = sortKey.split(' ')[0];
            return sortColumnName !== primarySortColumn;
        });

        const orderByClause = [primarySort, ...filteredSecondarySort].join(', ');
        
        try {
            const pool = await poolPromise;
            const request = pool.request();

            request.input('tuNgay', sql.Date, tuNgay);
            request.input('denNgay', sql.Date, denNgay);
            request.input('searchTerm', sql.NVarChar, `%${searchTerm}%`);

            // SỬA LỖI: Cập nhật câu lệnh SQL
            const query = `
                /* * CTE 'TeachingData' sẽ tính toán *toàn bộ* dữ liệu
                 * và giá trị lũy kế (daDayCumulative) *trước khi* lọc.
                 */
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
                        Hocphan.Viettat AS TenHocPhan,
                        TKB.Sotiet AS SoGio,
                        Phonghoc.Tenphong AS PhongHoc,
                        TKB.Ghichu AS GhiChu,
                        Donvi.Donvi AS DonVi,
                        LopHP.Tongsotiet AS TongSoTietHP,
                        TKB.MaLHP,

                        /* * SỬA LỖI: Tính lũy kế bằng Window Function
                         * Tính tổng Sotiet, phân nhóm theo MaLHP, sắp xếp theo Ngay và Tiet.
                         * ROWS UNBOUNDED PRECEDING đảm bảo nó tính từ dòng đầu tiên.
                         */
                        SUM(ISNULL(TKB.Sotiet, 0)) OVER (
                            PARTITION BY TKB.MaLHP 
                            ORDER BY TKB.Ngay, TKB.Tiet
                            ROWS UNBOUNDED PRECEDING
                        ) AS daDayCumulative,

                        -- Alias các cột dùng để sort phụ
                        TKB.Tiet AS SortTiet,
                        Giaovien.Ten AS SortTen,
                        Giaovien.Holot AS SortHolot
                    FROM
                        TKB
                    LEFT JOIN
                        Giaovien ON TKB.MaGV = Giaovien.MaGV
                    LEFT JOIN
                        Donvi ON Giaovien.MaDV = Donvi.MaDV
                    LEFT JOIN
                        Phonghoc ON TKB.MaPH = Phonghoc.MaPH
                    LEFT JOIN
                        LopHP ON TKB.MaLHP = LopHP.MaLHP
                    LEFT JOIN
                        Hocphan ON LopHP.MaHP = Hocphan.MaHP
                    WHERE 
                        TKB.HieuLuc = 1 -- Tính lũy kế chỉ dựa trên các tiết có hiệu lực
                )
                /* * Lọc (Tìm kiếm và Ngày) ở bước NGOÀI CÙNG
                 * sau khi giá trị 'daDayCumulative' đã được tính
                 */
                SELECT
                    NgayDay,
                    Buoi,
                    GiangVien,
                    TenLopHP,
                    TenHocPhan,
                    SoGio,
                    PhongHoc,
                    GhiChu,
                    DonVi,
                    TongSoTietHP,
                    MaLHP,
                    daDayCumulative, -- Lấy giá trị lũy kế đã tính

                    -- Các cột sort-phụ (DB cần để ORDER BY)
                    SortTiet,
                    SortTen,
                    SortHolot
                FROM
                    TeachingData
                WHERE
                    /* Lọc ngày dạy ở đây */
                    NgayDay BETWEEN @tuNgay AND @denNgay
                    AND
                    /* Lọc tìm kiếm ở đây */
                    (
                        GiangVien LIKE @searchTerm
                        OR TenLopHP LIKE @searchTerm
                        OR TenHocPhan LIKE @searchTerm
                        OR PhongHoc LIKE @searchTerm
                        OR GhiChu LIKE @searchTerm
                        OR DonVi LIKE @searchTerm
                    )
                ORDER BY
                    ${orderByClause}
            `;

            const result = await request.query(query);
            res.status(200).json(result.recordset);
        } catch (error) {
            console.error('Lỗi khi lấy lịch giảng dạy:', error);
            res.status(500).json({
                message: 'Lỗi máy chủ nội bộ khi truy vấn dữ liệu.',
                error: error.message,
            });
        }
    });

    return router;
};

