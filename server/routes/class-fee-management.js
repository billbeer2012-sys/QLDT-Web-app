/*
 * Đường dẫn file: D:\QLDT-app\server\routes\class-fee-management.js
 * Thời gian hoàn thiện: 07/01/2026
 * Tóm tắt những nội dung cập nhật:
 * router.get('/subjects-for-resit': Bo sung dieu kien hien thi Mon thi lai, hoc lai CT1<5
 */

const express = require('express');
const sql = require('mssql');
const moment = require('moment-timezone');

module.exports = function(poolPromise, writeLog) {
    const router = express.Router();

    // --- API GỐC ---

    // API lấy danh sách Khóa học
    router.get('/courses-for-fees', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT DISTINCT SUBSTRING(MaL, 2, 2) as CourseYear 
                FROM Lop 
                WHERE MaL LIKE 'C[0-9][0-9]%'
                ORDER BY CourseYear DESC
            `);
            const courses = result.recordset.map(item => ({
                value: item.CourseYear,
                label: `Khóa 20${item.CourseYear}`
            }));
            res.json(courses);
        } catch (err) {
            console.error("Get Courses for Fees Error:", err);
            res.status(500).json({ message: "Lỗi server khi lấy danh sách khóa học." });
        }
    });

    // API lấy danh sách Lớp học theo Khóa
    router.get('/classes-for-fees', async (req, res) => {
        const { courseYear } = req.query;
        if (!courseYear) return res.status(400).json({ message: "Thiếu thông tin năm của khóa học." });
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('Pattern', sql.NVarChar, `C${courseYear}%`);
            const result = await request.query(`SELECT MaL, Tenlop FROM Lop WHERE MaL LIKE @Pattern ORDER BY Tenlop ASC`);
            res.json(result.recordset);
        } catch (err) {
            console.error("Get Classes for Fees Error:", err);
            res.status(500).json({ message: "Lỗi server khi lấy danh sách lớp." });
        }
    });
    
    // API lấy danh sách Học kỳ theo Lớp
    router.get('/semesters', async (req, res) => {
        const { maLop } = req.query;
        if (!maLop) return res.status(400).json({ message: "Thiếu Mã lớp." });
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaL', sql.NVarChar, maLop);
            const result = await request.query(`
                SELECT MaHK, Hocky, Ngaybatdau, Ngayketthuc FROM web_HockyTN 
                WHERE MaL = @MaL AND Ngaybatdau IS NOT NULL ORDER BY Ngaybatdau
            `);
            const semesters = result.recordset;
            let defaultSemester = '';
            if (semesters.length > 0) {
                const now = moment().tz('Asia/Ho_Chi_Minh');
                const currentSemester = semesters.find(s => now.isBetween(moment(s.Ngaybatdau), moment(s.Ngayketthuc)));
                defaultSemester = currentSemester ? currentSemester.MaHK : semesters[0].MaHK;
            }
            res.json({ semesters, defaultSemester });
        } catch (error) {
            res.status(500).json({ message: "Lỗi máy chủ khi tải học kỳ." });
        }
    });

    // API lấy chi tiết các lần thu (cho tooltip)
    router.get('/fee-details', async (req, res) => {
        const { maSV, maHK, maKT } = req.query;
        if (!maSV || !maHK || !maKT) return res.status(400).json({ message: 'Thiếu thông tin.' });
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaSV', sql.NVarChar, maSV);
            request.input('MaHK', sql.NVarChar, maHK);
            request.input('MaKT', sql.NVarChar, maKT);

            let query;
            
            // BẮT ĐẦU CẬP NHẬT TRUY VẤN
            if (maKT === '000') {
                query = `
                    DECLARE @StartDate DATETIME, @EndDate DATETIME;
                    SELECT @StartDate = Ngaybatdau - 60, @EndDate = Ngayketthuc
                    FROM Hocky
                    WHERE MaHK = @MaHK;

                    SELECT SoCT, Lydo, Ngaynop, Sotienthu
                    FROM Hocphi
                    WHERE MaSV = @MaSV
                      AND MaHK = '000'
                      AND Ngaynop BETWEEN @StartDate AND @EndDate
                    ORDER BY Ngaynop ASC;
                `;
            } else {
                query = `
                    SELECT SoCT, Lydo, Ngaynop, Sotienthu FROM Hocphi
                    WHERE MaSV = @MaSV AND MaHK = @MaHK AND MaKT = @MaKT ORDER BY Ngaynop ASC
                `;
            }
            // KẾT THÚC CẬP NHẬT TRUY VẤN

            const result = await request.query(query);
            res.json(result.recordset);
        } catch (error) {
            console.error('SQL error in /fee-details:', error);
            res.status(500).json({ message: "Lỗi máy chủ khi lấy chi tiết." });
        }
    });

    // API lấy dữ liệu học phí chính của sinh viên
    router.get('/student-fees', async (req, res) => {
        const { maLop, maHK } = req.query;
        if (!maLop || !maHK) return res.status(400).json({ message: 'Thiếu Mã lớp hoặc Mã học kỳ.' });
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaL', sql.NVarChar, maLop);
            request.input('MaHK', sql.NVarChar, maHK);
            const query = `
                WITH LastHocphi_555 AS ( 
                    SELECT MaSV, SoCT, Lydo, Hinhthucthanhtoan, MaUser AS NguoiThu, ROW_NUMBER() OVER(PARTITION BY MaSV ORDER BY Ngaynop DESC) as rn 
                    FROM Hocphi 
                    WHERE MaHK = @MaHK AND MaKT = '555' 
                ),
                AggHocphi_555 AS ( 
                    SELECT MaSV, SUM(Sotienthu) AS HP_DaThu, COUNT(*) AS SoLanThu, MAX(Ngaynop) AS NgayThuHP_Last 
                    FROM Hocphi 
                    WHERE MaHK = @MaHK AND MaKT = '555' GROUP BY MaSV 
                ), 
                AggHocphi_666 AS ( 
                    SELECT MaSV, SUM(Sotienthu) AS Thu_HPHL, COUNT(*) AS SoLanThu 
                    FROM Hocphi 
                    WHERE MaHK = @MaHK AND MaKT = '666' GROUP BY MaSV 
                ), 
                AggHocphi_777 AS ( 
                    SELECT MaSV, SUM(Sotienthu) AS Thu_LPTL, COUNT(*) AS SoLanThu 
                    FROM Hocphi 
                    WHERE MaHK = @MaHK AND MaKT = '777' GROUP BY MaSV 
                ),
				-- BẮT ĐẦU SỬA LỖI LOGIC TÍNH TỔNG
				AggHocphi_Other AS ( 
                    SELECT hp.MaSV, SUM(hp.Sotienthu) AS Thu_Khac, COUNT(*) AS SoLanThuKhac 
                    FROM Hocphi hp 
                    CROSS JOIN (SELECT Ngaybatdau, Ngayketthuc FROM Hocky WHERE MaHK = @MaHK) AS SelectedSemester 
                    WHERE hp.MaHK = '000' -- Chỉ lấy các khoản thu có MaHK là '000'
                      AND hp.Ngaynop BETWEEN SelectedSemester.Ngaybatdau -60 AND SelectedSemester.Ngayketthuc 
                    GROUP BY hp.MaSV
                )
				-- KẾT THÚC SỬA LỖI LOGIC
				
                SELECT 
                    sv.MaSV, sv.Tinhtrang, sv.Maso, sv.Holot, sv.Ten, sv.Gioitinh, sv.Ngaysinh,
                    ISNULL(shk.HocphiQD, 0) AS HocphiQD, 
                    ISNULL(shk.Miengiam, 0) AS Miengiam, 
                    ISNULL(shk.Phainop, 0) AS Phainop,
                    ISNULL(hp555.HP_DaThu, 0) AS HP_DaThu, 
                    hp555.NgayThuHP_Last,
                    ISNULL(shk.Phainop, 0) - ISNULL(hp555.HP_DaThu, 0) AS HP_ConNo,
                    ISNULL(hp555.SoLanThu, 0) AS SoLanThuHP,
                    lastHP.SoCT, lastHP.Lydo, lastHP.Hinhthucthanhtoan, lastHP.NguoiThu,
                    ISNULL(hp666.Thu_HPHL, 0) AS Thu_HPHL, 
                    ISNULL(hp666.SoLanThu, 0) AS SoLanThuHPHL,
                    ISNULL(hp777.Thu_LPTL, 0) AS Thu_LPTL, 
                    ISNULL(hp777.SoLanThu, 0) AS SoLanThuLPTL,
					ISNULL(hpOther.Thu_Khac, 0) AS Thu_Khac,
					ISNULL(hpOther.SoLanThuKhac, 0) AS SoLanThuKhac
                FROM Sinhvien sv
                LEFT JOIN db_SinhvienHocphiHK shk ON sv.MaSV = shk.MaSV AND shk.MaHK = @MaHK AND shk.MaKT = '555'
                LEFT JOIN AggHocphi_555 hp555 ON sv.MaSV = hp555.MaSV
                LEFT JOIN AggHocphi_666 hp666 ON sv.MaSV = hp666.MaSV
                LEFT JOIN AggHocphi_777 hp777 ON sv.MaSV = hp777.MaSV
				LEFT JOIN AggHocphi_Other hpOther ON sv.MaSV = hpOther.MaSV
                LEFT JOIN LastHocphi_555 lastHP ON sv.MaSV = lastHP.MaSV AND lastHP.rn = 1
                WHERE sv.MaL = @MaL 
                ORDER BY sv.Tinhtrang, sv.Ten, sv.Holot;
            `;
            const result = await request.query(query);
            res.json(result.recordset);
        } catch (error) {
            console.error('SQL error in /student-fees:', error);
            res.status(500).json({ message: "Lỗi máy chủ khi truy vấn khoản thu." });
        }
    });

     // SỬA LỖI: API cập nhật một ô học phí (In-line editing)
    router.patch('/student-fee', async (req, res) => {
        const { maSV, maso, maHK, fieldName, newValue, oldValue } = req.body;
        if (!maSV || !maHK || !fieldName || newValue === undefined) return res.status(400).json({ message: "Thiếu thông tin." });
        if (!['HocphiQD', 'Miengiam', 'Phainop'].includes(fieldName)) return res.status(400).json({ message: "Trường dữ liệu không hợp lệ." });
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);
            request.input('MaHK', sql.NVarChar, maHK);
            request.input('MaSV', sql.NVarChar, maSV);
            request.input('NewValue', sql.Int, newValue);

            // BƯỚC 1: LOẠI BỎ KIỂM TRA KHÓA NGOẠI
            // Không cần kiểm tra với db_ThongbaoHocphiHK nữa

            // BƯỚC 2: THỰC HIỆN MERGE VỚI KHÓA CHÍNH MỚI
            const mergeQuery = `
                MERGE db_SinhvienHocphiHK AS target
                USING (SELECT @MaSV AS MaSV, @MaHK AS MaHK) AS source
                ON (target.MaSV = source.MaSV AND target.MaHK = source.MaHK)
                WHEN MATCHED THEN
                    UPDATE SET ${fieldName} = @NewValue
                WHEN NOT MATCHED BY TARGET THEN
                    INSERT (MaSV, MaHK, MaKT, ${fieldName})
                    VALUES (@MaSV, @MaHK, '555', @NewValue);
            `;
            await request.query(mergeQuery);
            
            await writeLog(transaction, req.user.maso, 'Khoản thu Lớp SH', 'In-line Editing', `SV: ${maso}, HK: ${maHK}, ${fieldName}: ${oldValue} -> ${newValue}`);
            await transaction.commit();
            res.json({ message: "Cập nhật thành công!" });
        } catch (err) {
            await transaction.rollback();
            console.error("SQL error in PATCH /student-fee:", err);
            res.status(500).json({ message: err.originalError?.info?.message || 'Lỗi server khi cập nhật học phí.' });
        }
    });
    
     // API cập nhật một ô học phí (In-line editing)
    router.patch('/student-fee', async (req, res) => {
        const { maSV, maso, maHK, fieldName, newValue, oldValue } = req.body;
        if (!maSV || !maHK || !fieldName || newValue === undefined) return res.status(400).json({ message: "Thiếu thông tin." });
        if (!['HocphiQD', 'Miengiam', 'Phainop'].includes(fieldName)) return res.status(400).json({ message: "Trường dữ liệu không hợp lệ." });
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);
            request.input('MaHK', sql.NVarChar, maHK);
            request.input('MaSV', sql.NVarChar, maSV);
            request.input('NewValue', sql.Int, newValue);

            const mergeQuery = `
                MERGE db_SinhvienHocphiHK AS target
                USING (SELECT @MaSV AS MaSV, @MaHK AS MaHK, '555' AS MaKT) AS source
                ON (target.MaSV = source.MaSV AND target.MaHK = source.MaHK AND target.MaKT = source.MaKT)
                WHEN MATCHED THEN
                    UPDATE SET ${fieldName} = @NewValue
                WHEN NOT MATCHED BY TARGET THEN
                    INSERT (MaSV, MaHK, MaKT, ${fieldName})
                    VALUES (@MaSV, @MaHK, '555', @NewValue);
            `;
            await request.query(mergeQuery);
            
            await writeLog(transaction, req.user.maso, 'Khoản thu Lớp SH', 'In-line Editing', `SV: ${maso}, HK: ${maHK}, ${fieldName}: ${oldValue} -> ${newValue}`);
            await transaction.commit();
            res.json({ message: "Cập nhật thành công!" });
        } catch (err) {
            await transaction.rollback();
            console.error("SQL error in PATCH /student-fee:", err);
            res.status(500).json({ message: err.originalError?.info?.message || 'Lỗi server khi cập nhật học phí.' });
        }
    });
    
    // API cập nhật hàng loạt (Paste from Excel)
    router.patch('/student-fees/batch-update', async (req, res) => {
        const { maHK, updates } = req.body;
        if (!maHK || !Array.isArray(updates) || updates.length === 0) return res.status(400).json({ message: "Dữ liệu không hợp lệ." });
        
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        
        try {
            await transaction.begin();
            
            // BẮT ĐẦU SỬA LỖI: Khai báo TVP với đúng tên Type trên SQL Server
            const tvp = new sql.Table('FeeUpdateType');
            // KẾT THÚC SỬA LỖI

            // Định nghĩa cấu trúc cột cho TVP, phải khớp với Type trên SQL Server
            tvp.columns.add('MaSV', sql.NVarChar(15));
            tvp.columns.add('HocphiQD', sql.Int);
            tvp.columns.add('Miengiam', sql.Int);
            tvp.columns.add('Phainop', sql.Int);
            
            updates.forEach(u => {
                const hocphiQD = u.HocphiQD !== undefined ? u.HocphiQD : null;
                const miengiam = u.Miengiam !== undefined ? u.Miengiam : null;
                const phainop = u.Phainop !== undefined ? u.Phainop : null;
                
                if (hocphiQD !== null || miengiam !== null || phainop !== null) {
                    tvp.rows.add(u.MaSV, hocphiQD, miengiam, phainop);
                }
            });
            
            if (tvp.rows.length === 0) {
                await transaction.rollback();
                return res.status(400).json({ message: "Không có dữ liệu hợp lệ để cập nhật." });
            }
            
            const request = new sql.Request(transaction);
            request.input('MaHK', sql.NVarChar, maHK);

            // BẮT ĐẦU SỬA LỖI: Truyền thẳng đối tượng TVP vào request
            request.input('FeeData', tvp);
            // KẾT THÚC SỬA LỖI
            
            const batchQuery = `
                ;WITH FinalSource AS (
                    SELECT
                        s.MaSV,
                        CAST(CASE WHEN ISNULL(s.HocphiQD, 0) < 0 THEN 0 ELSE COALESCE(s.HocphiQD, t.HocphiQD, 0) END AS BIGINT) AS Safe_HocphiQD,
                        CAST(CASE WHEN ISNULL(s.Miengiam, 0) < 0 THEN 0 ELSE COALESCE(s.Miengiam, t.Miengiam, 0) END AS BIGINT) AS Safe_Miengiam,
                        CASE WHEN ISNULL(s.Phainop, -1) >= 0 THEN s.Phainop ELSE NULL END AS Source_Phainop
                    FROM @FeeData s
                    LEFT JOIN db_SinhvienHocphiHK t ON s.MaSV = t.MaSV AND t.MaHK = @MaHK AND t.MaKT = '555'
                )
                MERGE INTO db_SinhvienHocphiHK AS Target
                USING (
                    SELECT
                        MaSV,
                        Safe_HocphiQD,
                        Safe_Miengiam,
                        COALESCE(
                            Source_Phainop, 
                            CASE 
                                WHEN (Safe_HocphiQD - Safe_Miengiam) < 0 THEN 0 
                                ELSE (Safe_HocphiQD - Safe_Miengiam) 
                            END
                        ) AS Safe_Phainop
                    FROM FinalSource
                ) AS Source
                ON (Target.MaSV = Source.MaSV AND Target.MaHK = @MaHK AND Target.MaKT = '555')
                
                WHEN MATCHED THEN
                    UPDATE SET
                        Target.HocphiQD = CASE WHEN Source.Safe_HocphiQD > 2147483647 THEN 2147483647 ELSE Source.Safe_HocphiQD END,
                        Target.Miengiam = CASE WHEN Source.Safe_Miengiam > 2147483647 THEN 2147483647 ELSE Source.Safe_Miengiam END,
                        Target.Phainop = CASE WHEN Source.Safe_Phainop > 2147483647 THEN 2147483647 ELSE Source.Safe_Phainop END
                
                WHEN NOT MATCHED BY TARGET THEN
                    INSERT (MaSV, MaHK, MaKT, HocphiQD, Miengiam, Phainop)
                    VALUES (
                        Source.MaSV, @MaHK, '555',
                        CASE WHEN Source.Safe_HocphiQD > 2147483647 THEN 2147483647 ELSE Source.Safe_HocphiQD END,
                        CASE WHEN Source.Safe_Miengiam > 2147483647 THEN 2147483647 ELSE Source.Safe_Miengiam END,
                        CASE WHEN Source.Safe_Phainop > 2147483647 THEN 2147483647 ELSE Source.Safe_Phainop END
                    );
            `;

            await request.query(batchQuery);
            
            await writeLog(transaction, req.user.maso, 'Khoản thu Lớp SH', 'Paste from Excel', `Cập nhật hàng loạt ${tvp.rows.length} sinh viên cho HK: ${maHK}.`);
            await transaction.commit();
            res.json({ message: `Đã cập nhật thành công ${tvp.rows.length} sinh viên.` });
        } catch (err) {
            console.error("SQL Transaction Error in /student-fees/batch-update:", err);
            await transaction.rollback();
            const originalErrorMessage = err.originalError?.info?.message || 'Lỗi server khi cập nhật hàng loạt.';
            res.status(500).json({ message: originalErrorMessage });
        }
    });
	
	
    // --- APIs CHO CÁC MODAL ---
    
    // API Lưu phiếu thu học phí học kỳ
    router.post('/semester-fee', async (req, res) => {
        const { maSV, maHK, lan, lyDo, soCT, soTien, ngayNop, ghiChu, hinhThuc } = req.body;
        if (!maSV || !maHK || !lan || !lyDo || !soCT || !soTien) return res.status(400).json({ message: 'Thiếu thông tin cần thiết.' });
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            const ngayNopSql = moment(ngayNop, 'DD/MM/YYYY').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
            request.input('MaSV', sql.NVarChar, maSV).input('MaHK', sql.NVarChar, maHK).input('MaKT', sql.NVarChar, '555').input('Lan', sql.Int, lan).input('Lydo', sql.NVarChar, lyDo).input('SoCT', sql.Int, soCT).input('Sotien', sql.Int, soTien).input('Sotienthu', sql.Int, soTien).input('Ngaynop', sql.DateTime, ngayNopSql).input('MaUser', sql.NVarChar, req.user.maso).input('Ghichu', sql.NVarChar, ghiChu).input('Hinhthucthanhtoan', sql.NVarChar, hinhThuc).input('MaLPT', sql.NVarChar, '001');
            await request.query(`INSERT INTO Hocphi (MaSV, MaHK, MaKT, Lan, Lydo, SoCT, Thue, Sotien, Sotienthu, Ngaynop, MaUser, Ghichu, MaLPT, Hinhthucthanhtoan) VALUES (@MaSV, @MaHK, @MaKT, @Lan, @Lydo, @SoCT, 0, @Sotien, @Sotienthu, @Ngaynop, @MaUser, @Ghichu, @MaLPT, @Hinhthucthanhtoan)`);
            res.status(201).json({ message: 'Lưu phiếu thu thành công!' });
        } catch (err) { res.status(500).json({ message: 'Lỗi server khi lưu phiếu thu.' }); }
    });

    // API lấy danh sách học phần để thu HP học lại / thi lại
    router.get('/subjects-for-resit', async (req, res) => {
        const { maSV } = req.query;
        if (!maSV) return res.status(400).json({ message: "Thiếu Mã sinh viên." });
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaSV', sql.NVarChar, maSV);
            const result = await request.query(`SELECT slhp.MaLHP, lhp.MaHK + ': ' + hp.Hocphan + ' (' + CAST(ISNULL(slhp.DHP,0) AS NVARCHAR(10)) + ')' AS DisplayText, hp.Hocphan, lhp.SoTC, lhp.Tongsotiet, slhp.DHP, slhp.DHPBon, slhp.DHPChu FROM SinhvienLopHP slhp JOIN LopHP lhp ON slhp.MaLHP = lhp.MaLHP JOIN Hocphan hp ON lhp.MaHP = hp.MaHP WHERE slhp.MaSV = @MaSV AND (slhp.DHPBon <= 1 OR slhp.CT1 < 5 OR slhp.ThiL1 = 0) ORDER BY lhp.MaHK ASC, hp.Hocphan ASC;`);
            res.json(result.recordset);
        } catch (err) { res.status(500).json({ message: "Lỗi server khi lấy danh sách học phần." }); }
    });

    // API Lưu phiếu thu học lại / thi lại
    router.post('/resit-fee', async (req, res) => {
        const payload = req.body;
        if (!payload.maSV || !payload.maHK || !payload.maKT || !payload.soTien) return res.status(400).json({ message: 'Thiếu thông tin.' });
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            const ngayNopSql = moment(payload.ngayNop, 'DD/MM/YYYY').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
            request.input('MaSV', sql.NVarChar, payload.maSV).input('MaHK', sql.NVarChar, payload.maHK).input('MaKT', sql.NVarChar, payload.maKT).input('Lan', sql.Int, payload.lan).input('Lydo', sql.NVarChar, payload.lyDo).input('SoCT', sql.Int, payload.soCT).input('Sotien', sql.Int, payload.soTien).input('Sotienthu', sql.Int, payload.soTien).input('Ngaynop', sql.DateTime, ngayNopSql).input('MaUser', sql.NVarChar, req.user.maso).input('Ghichu', sql.NVarChar, payload.ghiChu).input('Hinhthucthanhtoan', sql.NVarChar, payload.hinhThuc).input('MaLPT', sql.NVarChar, payload.maKT === '666' ? '001' : '002');
            const lanthiColumn = payload.lanthi ? ', Lanthi' : '';
            const lanthiValue = payload.lanthi ? ', @Lanthi' : '';
            if(payload.lanthi) request.input('Lanthi', sql.Int, payload.lanthi);
            await request.query(`INSERT INTO Hocphi (MaSV, MaHK, MaKT, Lan, Lydo, SoCT, Thue, Sotien, Sotienthu, Ngaynop, MaUser, Ghichu, MaLPT, Hinhthucthanhtoan ${lanthiColumn}) VALUES (@MaSV, @MaHK, @MaKT, @Lan, @Lydo, @SoCT, 0, @Sotien, @Sotienthu, @Ngaynop, @MaUser, @Ghichu, @MaLPT, @Hinhthucthanhtoan ${lanthiValue})`);
            res.status(201).json({ message: 'Lưu phiếu thu thành công!' });
        } catch (err) { res.status(500).json({ message: 'Lỗi server khi lưu phiếu thu.' }); }
    });

    // API lấy danh sách các loại khoản thu khác
    router.get('/other-fee-types', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`SELECT MaKT, Khoanthu, Lydo FROM Khoanthu ORDER BY Khoanthu ASC`);
            res.json(result.recordset);
        } catch (err) { res.status(500).json({ message: "Lỗi server khi lấy danh sách khoản thu khác." }); }
    });

    // API lấy lịch sử thu của một khoản thu khác
    router.get('/other-fee-history', async (req, res) => {
        const { maSV, maKT } = req.query;
        if (!maSV || !maKT) return res.status(400).json({ message: "Thiếu thông tin." });
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool).input('MaSV', sql.NVarChar, maSV).input('MaKT', sql.NVarChar, maKT);
            const result = await request.query(`SELECT Lan, SoCT, Sotien, Ngaynop, MaUser, Lydo, Ghichu FROM Hocphi WHERE MaSV = @MaSV AND MaHK = '000' AND MaKT = @MaKT ORDER BY Ngaynop DESC;`);
            const formattedData = result.recordset.map(item => ({...item, Ngaynop: item.Ngaynop ? moment(item.Ngaynop).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY') : null }));
            res.json(formattedData);
        } catch (err) { res.status(500).json({ message: "Lỗi server khi lấy lịch sử." }); }
    });

    // API lưu phiếu thu "Khoản thu khác"
    router.post('/other-fee', async (req, res) => {
        const payload = req.body;
        if (!payload.maSV || !payload.maKT || !payload.soTien) return res.status(400).json({ message: 'Thiếu thông tin.' });
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            const ngayNopSql = moment(payload.ngayNop, 'DD/MM/YYYY').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
            request.input('MaSV', sql.NVarChar, payload.maSV).input('MaHK', sql.NVarChar, '000').input('MaKT', sql.NVarChar, payload.maKT).input('Lan', sql.Int, payload.lan).input('Lydo', sql.NVarChar, payload.lyDo).input('SoCT', sql.Int, payload.soCT).input('Sotien', sql.Int, payload.soTien).input('Sotienthu', sql.Int, payload.soTien).input('Ngaynop', sql.DateTime, ngayNopSql).input('MaUser', sql.NVarChar, req.user.maso).input('Ghichu', sql.NVarChar, payload.ghiChu).input('Hinhthucthanhtoan', sql.NVarChar, payload.hinhThuc).input('MaLPT', sql.NVarChar, '002');
            await request.query(`INSERT INTO Hocphi (MaSV, MaHK, MaKT, Lan, Lydo, SoCT, Thue, Sotien, Sotienthu, Ngaynop, MaUser, Ghichu, MaLPT, Hinhthucthanhtoan) VALUES (@MaSV, @MaHK, @MaKT, @Lan, @Lydo, @SoCT, 0, @Sotien, @Sotienthu, @Ngaynop, @MaUser, @Ghichu, @MaLPT, @Hinhthucthanhtoan)`);
            res.status(201).json({ message: 'Lưu phiếu thu thành công!' });
        } catch (err) { res.status(500).json({ message: 'Lỗi server khi lưu phiếu thu.' }); }
    });
	
	// API lấy lịch sử thu học phí học kỳ
    router.get('/tuition-history', async (req, res) => {
        const { maSV, maHK, maKT } = req.query;
        if (!maSV || !maHK || !maKT) {
            return res.status(400).json({ message: "Thiếu thông tin Mã sinh viên hoặc Mã học kỳ." });
        }
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaSV', sql.NVarChar, maSV);
            request.input('MaHK', sql.NVarChar, maHK);
            request.input('MaKT', sql.NVarChar, maKT);
            const result = await request.query(`
                SELECT Lan, SoCT, Sotien, Ngaynop, MaUser, Ghichu
                FROM Hocphi
                WHERE MaSV = @MaSV AND MaHK = @MaHK AND MaKT = @MaKT
                ORDER BY Lan ASC
            `);
            res.json(result.recordset);
        } catch (err) {
            console.error('Error fetching tuition history:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy lịch sử thu học phí.' });
        }
    });

    // API lấy số phiếu thu tiếp theo theo loại
    router.get('/next-receipt-number-by-type', async (req, res) => {
        const { maLPT } = req.query;
        if (!maLPT) {
            return res.status(400).json({ message: "Thiếu thông tin loại phiếu thu." });
        }
        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaLPT', sql.NVarChar, maLPT);
            const result = await request.query('SELECT MAX(SoCT) as maxSoCT FROM Hocphi WHERE MaLPT = @MaLPT');
            const nextSoCT = (result.recordset[0].maxSoCT || 0) + 1;
            res.json({ nextSoCT });
        } catch (err) {
            console.error('Error fetching next receipt number:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy số phiếu thu.' });
        }
    });
    return router;
};

