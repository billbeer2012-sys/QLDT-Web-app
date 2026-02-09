/*
 * Đường dẫn file: server/routes/exam-room-management.js
 * Phiên bản cập nhật: 07/02/2026
 * Tóm tắt:
 * - Module API mới cho chức năng "Tạo Phòng Thi Học Phần"
 * - Module API mới cho chức năng "TXếp lịch thi"
 */

const express = require('express');
const sql = require('mssql');
const router = express.Router();

module.exports = function (poolPromise, writeLog) {

    // Middleware kiểm tra quyền Admin hoặc Khảo thí
    const canManageExamRooms = (req, res, next) => {
        const { user } = req;
        // SỬA LỖI 05/02/2026: Sử dụng === true thay vì === -1
        if (user && (user.isAdmin === true || user.isKhaothi === true)) {
            next();
        } else {
            res.status(403).json({ message: 'Bạn không có quyền thực hiện chức năng này.' });
        }
    };

    // Helper: Lấy tên table và field dựa trên examType
    const getExamTableInfo = (examType) => {
        const type = parseInt(examType);
        switch (type) {
            case 0: return { table: 'Phongthi0', pkField: 'MaPT0', svField: 'MaPT0', suffix: 'GK' };
            case 1: return { table: 'Phongthi1', pkField: 'MaPT1', svField: 'MaPT1', suffix: 'L1' };
            case 2: return { table: 'Phongthi2', pkField: 'MaPT2', svField: 'MaPT2', suffix: 'L2' };
            default: throw new Error('Loại kỳ thi không hợp lệ');
        }
    };

    // ========================================
    // GET /eligible-students - Danh sách sinh viên đủ điều kiện dự thi (chưa xếp phòng)
    // ========================================
    router.get('/eligible-students', canManageExamRooms, async (req, res) => {
        const { maHK, maDV, maHP, examType } = req.query;
        if (!maHK || !maDV || !maHP || examType === undefined) {
            return res.status(400).json({ message: 'Thiếu tham số bắt buộc.' });
        }

        try {
            const { svField } = getExamTableInfo(examType);
            const thiField = `ThiL${examType}`;

            const pool = await poolPromise;
            const result = await pool.request()
                .input('MaHK', sql.NVarChar, maHK)
                .input('MaDV', sql.NVarChar, maDV)
                .input('MaHP', sql.NVarChar, maHP)
                .query(`
                    SELECT 
                        SV.Maso, SV.Holot, SV.Ten, SV.Ngaysinh, SV.Gioitinh,
                        SVLHP.MaSV, SVLHP.MaLHP,
                        LHP.Tenlop AS TenLHP,
                        L.Tenlop AS LopSH
                    FROM SinhvienLopHP SVLHP
                    JOIN Sinhvien SV ON SVLHP.MaSV = SV.MaSV
                    JOIN LopHP LHP ON SVLHP.MaLHP = LHP.MaLHP
                    LEFT JOIN Lop L ON SV.MaL = L.MaL
                    WHERE LHP.MaHK = @MaHK 
                      AND LHP.MaDV = @MaDV 
                      AND LHP.MaHP = @MaHP
                      AND SVLHP.${thiField} = 1
                      AND (SVLHP.${svField} IS NULL OR SVLHP.${svField} = '')
                    ORDER BY LHP.Tenlop ASC, SV.Ten ASC, SV.Holot ASC
                `);

            res.json(result.recordset);
        } catch (err) {
            console.error('API eligible-students error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách sinh viên.' });
        }
    });

    // ========================================
    // GET /exam-rooms - Danh sách phòng thi
    // ========================================
    router.get('/exam-rooms', canManageExamRooms, async (req, res) => {
        const { maHK, maDV, maHP, examType } = req.query;
        if (!maHK || !maDV || !maHP || examType === undefined) {
            return res.status(400).json({ message: 'Thiếu tham số bắt buộc.' });
        }

        try {
            const { table, pkField, svField } = getExamTableInfo(examType);

            const pool = await poolPromise;
            const result = await pool.request()
                .input('MaHK', sql.NVarChar, maHK)
                .input('MaHP', sql.NVarChar, maHP)
                .query(`
                    SELECT 
                        PT.${pkField} AS MaPT,
                        PT.Phongthi AS TenPhongthi,
                        PT.Ngay AS Ngaythi,
                        CONCAT(ISNULL(PT.Gio, 0), ':', RIGHT('0' + CAST(ISNULL(PT.Phut, 0) AS VARCHAR), 2)) AS Giothi,
                        PT.Thoigian AS Thoigianthi,
                        PT.MaGV1,
                        PT.MaGV2,
                        GV1.Viettat AS CBCoithi1,
                        GV2.Viettat AS CBCoithi2,
                        PH.Tenphong AS Diadiem,
                        NP.Nhomphong,
                        (SELECT COUNT(*) FROM SinhvienLopHP SVLHP 
                         JOIN LopHP LHP2 ON SVLHP.MaLHP = LHP2.MaLHP
                         WHERE SVLHP.${svField} = PT.${pkField}
                           AND LHP2.MaHK = @MaHK AND LHP2.MaHP = @MaHP) AS SoLuong
                    FROM ${table} PT
                    LEFT JOIN Giaovien GV1 ON PT.MaGV1 = GV1.MaGV
                    LEFT JOIN Giaovien GV2 ON PT.MaGV2 = GV2.MaGV
                    LEFT JOIN Phonghoc PH ON PT.MaPH = PH.MaPH
                    LEFT JOIN Nhomphong NP ON PH.MaNP = NP.MaNP
                    WHERE PT.${pkField} LIKE @MaHK + @MaHP + '%'
                    ORDER BY PT.${pkField} ASC
                `);

            res.json(result.recordset);
        } catch (err) {
            console.error('API exam-rooms error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách phòng thi.' });
        }
    });

    // ========================================
    // GET /assigned-students - Danh sách sinh viên đã xếp vào phòng thi
    // ========================================
    router.get('/assigned-students', canManageExamRooms, async (req, res) => {
        const { maPT, examType, maHK, maHP } = req.query;
        if (!maPT || examType === undefined) {
            return res.status(400).json({ message: 'Thiếu tham số bắt buộc.' });
        }

        try {
            const { svField } = getExamTableInfo(examType);

            const pool = await poolPromise;
            const result = await pool.request()
                .input('MaPT', sql.NVarChar, maPT)
                .input('MaHK', sql.NVarChar, maHK)
                .input('MaHP', sql.NVarChar, maHP)
                .query(`
                    SELECT 
                        SV.Maso, SV.Holot, SV.Ten, SV.Ngaysinh, SV.Gioitinh,
                        SVLHP.MaSV, SVLHP.MaLHP,
                        LHP.Tenlop AS TenLHP,
                        L.Tenlop AS LopSH
                    FROM SinhvienLopHP SVLHP
                    JOIN Sinhvien SV ON SVLHP.MaSV = SV.MaSV
                    JOIN LopHP LHP ON SVLHP.MaLHP = LHP.MaLHP
                    LEFT JOIN Lop L ON SV.MaL = L.MaL
                    WHERE SVLHP.${svField} = @MaPT
                      AND LHP.MaHK = @MaHK
                      AND LHP.MaHP = @MaHP
                    ORDER BY LHP.Tenlop ASC, SV.Ten ASC, SV.Holot ASC
                `);

            res.json(result.recordset);
        } catch (err) {
            console.error('API assigned-students error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách sinh viên đã xếp phòng.' });
        }
    });

    // ========================================
    // POST /exam-rooms - Tạo phòng thi mới
    // ========================================
    router.post('/exam-rooms', canManageExamRooms, async (req, res) => {
        const { maHK, maHP, examType } = req.body;
        if (!maHK || !maHP || examType === undefined) {
            return res.status(400).json({ message: 'Thiếu tham số bắt buộc.' });
        }

        try {
            const { table, pkField, suffix } = getExamTableInfo(examType);

            const pool = await poolPromise;

            // Lấy thông tin Học phần để tạo tên phòng thi
            const hpResult = await pool.request()
                .input('MaHP', sql.NVarChar, maHP)
                .query('SELECT Viettat FROM Hocphan WHERE MaHP = @MaHP');

            if (hpResult.recordset.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy học phần.' });
            }
            const viettatHP = hpResult.recordset[0].Viettat || '';

            // Lấy MaKND và MaCT từ LopHP (lấy từ lớp HP đầu tiên của học phần này trong học kỳ)
            const lhpResult = await pool.request()
                .input('MaHK', sql.NVarChar, maHK)
                .input('MaHP', sql.NVarChar, maHP)
                .query('SELECT TOP 1 MaKND, MaCT2 FROM LopHP WHERE MaHK = @MaHK AND MaHP = @MaHP');

            const maKND = lhpResult.recordset.length > 0 ? lhpResult.recordset[0].MaKND : null;
            const maCT = lhpResult.recordset.length > 0 ? lhpResult.recordset[0].MaCT2 : null;

            // Tìm số thứ tự tiếp theo cho MaPT
            const prefixMaPT = maHK + maHP;
            const maxResult = await pool.request()
                .input('Prefix', sql.NVarChar, prefixMaPT)
                .query(`SELECT MAX(RIGHT(${pkField}, 2)) AS MaxNum FROM ${table} WHERE ${pkField} LIKE @Prefix + '%'`);

            let nextNum = 1;
            if (maxResult.recordset[0].MaxNum) {
                nextNum = parseInt(maxResult.recordset[0].MaxNum) + 1;
            }
            const numStr = nextNum.toString().padStart(2, '0');

            // Tạo MaPT và Tên phòng thi
            const newMaPT = prefixMaPT + numStr;
            const tenPhongthi = `P${numStr}-${viettatHP.substring(0, 40)}-${suffix}`;

            // INSERT vào table (bao gồm MaCT)
            await pool.request()
                .input('MaPT', sql.NVarChar, newMaPT)
                .input('Phongthi', sql.NVarChar, tenPhongthi)
                .input('MaKND', sql.Int, maKND)
                .input('MaCT', sql.NVarChar, maCT)
                .query(`INSERT INTO ${table} (${pkField}, Phongthi, MaKND, MaCT) VALUES (@MaPT, @Phongthi, @MaKND, @MaCT)`);

            // Ghi log (sử dụng maso)
            await writeLog(pool, req.user.maso, 'Tạo phòng thi', 'Tạo mới', `${tenPhongthi} (${newMaPT})`);

            res.json({
                message: 'Tạo phòng thi thành công!',
                maPT: newMaPT,
                tenPhongthi: tenPhongthi
            });
        } catch (err) {
            console.error('API create exam-room error:', err);
            res.status(500).json({ message: 'Lỗi server khi tạo phòng thi.' });
        }
    });

    // ========================================
    // DELETE /exam-rooms/:maPT - Xóa phòng thi
    // ========================================
    router.delete('/exam-rooms/:maPT', canManageExamRooms, async (req, res) => {
        const { maPT } = req.params;
        const { examType, maHK, maHP } = req.query;

        if (!maPT || examType === undefined) {
            return res.status(400).json({ message: 'Thiếu tham số bắt buộc.' });
        }

        try {
            const { table, pkField, svField } = getExamTableInfo(examType);

            const pool = await poolPromise;

            // Kiểm tra còn sinh viên trong phòng thi không
            const countResult = await pool.request()
                .input('MaPT', sql.NVarChar, maPT)
                .input('MaHK', sql.NVarChar, maHK)
                .input('MaHP', sql.NVarChar, maHP)
                .query(`
                    SELECT COUNT(*) AS SoLuong 
                    FROM SinhvienLopHP SVLHP
                    JOIN LopHP LHP ON SVLHP.MaLHP = LHP.MaLHP
                    WHERE SVLHP.${svField} = @MaPT
                      AND LHP.MaHK = @MaHK AND LHP.MaHP = @MaHP
                `);

            if (countResult.recordset[0].SoLuong > 0) {
                return res.status(400).json({
                    message: 'Không thể xóa phòng thi vì còn sinh viên trong phòng. Vui lòng xóa sinh viên trước.'
                });
            }

            // Lấy tên phòng thi để ghi log
            const ptResult = await pool.request()
                .input('MaPT', sql.NVarChar, maPT)
                .query(`SELECT Phongthi FROM ${table} WHERE ${pkField} = @MaPT`);

            const tenPhongthi = ptResult.recordset.length > 0 ? ptResult.recordset[0].Phongthi : maPT;

            // Xóa phòng thi
            await pool.request()
                .input('MaPT', sql.NVarChar, maPT)
                .query(`DELETE FROM ${table} WHERE ${pkField} = @MaPT`);

            // Ghi log (sử dụng maso)
            await writeLog(pool, req.user.maso, 'Tạo phòng thi', 'Xóa', `${tenPhongthi} (${maPT})`);

            res.json({ message: 'Xóa phòng thi thành công!' });
        } catch (err) {
            console.error('API delete exam-room error:', err);
            res.status(500).json({ message: 'Lỗi server khi xóa phòng thi.' });
        }
    });

    // ========================================
    // PUT /exam-rooms/:maPT/name - Đổi tên phòng thi (inline edit)
    // ========================================
    router.put('/exam-rooms/:maPT/name', canManageExamRooms, async (req, res) => {
        const { maPT } = req.params;
        const { newName, examType } = req.body;

        if (!maPT || !newName || examType === undefined) {
            return res.status(400).json({ message: 'Thiếu tham số bắt buộc.' });
        }

        try {
            const { table, pkField } = getExamTableInfo(examType);

            const pool = await poolPromise;

            // Lấy tên cũ để ghi log
            const oldResult = await pool.request()
                .input('MaPT', sql.NVarChar, maPT)
                .query(`SELECT Phongthi FROM ${table} WHERE ${pkField} = @MaPT`);

            const oldName = oldResult.recordset.length > 0 ? oldResult.recordset[0].Phongthi : '';

            // Update tên mới
            await pool.request()
                .input('MaPT', sql.NVarChar, maPT)
                .input('NewName', sql.NVarChar, newName)
                .query(`UPDATE ${table} SET Phongthi = @NewName WHERE ${pkField} = @MaPT`);

            // Ghi log (sử dụng maso)
            await writeLog(pool, req.user.maso, 'Tạo phòng thi', 'Đổi tên', `${oldName} → ${newName}`);

            res.json({ message: 'Đổi tên phòng thi thành công!' });
        } catch (err) {
            console.error('API rename exam-room error:', err);
            res.status(500).json({ message: 'Lỗi server khi đổi tên phòng thi.' });
        }
    });

    // ========================================
    // POST /assign-students - Thêm sinh viên vào phòng thi
    // ========================================
    router.post('/assign-students', canManageExamRooms, async (req, res) => {
        const { students, maPT, examType, maHK, maHP, tenPhongthi } = req.body;
        // students = [{ MaSV, MaLHP }, ...]

        if (!students || !Array.isArray(students) || students.length === 0 || !maPT || examType === undefined) {
            return res.status(400).json({ message: 'Thiếu tham số bắt buộc hoặc danh sách sinh viên rỗng.' });
        }

        try {
            const { svField } = getExamTableInfo(examType);

            const pool = await poolPromise;
            const transaction = new sql.Transaction(pool);

            await transaction.begin();

            try {
                for (const student of students) {
                    const updateRequest = new sql.Request(transaction);
                    await updateRequest
                        .input('MaPT', sql.NVarChar, maPT)
                        .input('MaSV', sql.NVarChar, student.MaSV)
                        .input('MaLHP', sql.NVarChar, student.MaLHP)
                        .query(`UPDATE SinhvienLopHP SET ${svField} = @MaPT WHERE MaSV = @MaSV AND MaLHP = @MaLHP`);
                }

                await transaction.commit();

                // Ghi log (sử dụng maso)
                const maSVList = students.map(s => s.MaSV).join(', ');
                await writeLog(pool, req.user.maso, 'Tạo phòng thi', 'Thêm SV vào phòng',
                    `${students.length} SV vào ${tenPhongthi || maPT}: ${maSVList.substring(0, 100)}...`);

                res.json({ message: `Đã thêm ${students.length} sinh viên vào phòng thi thành công!` });
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            console.error('API assign-students error:', err);
            res.status(500).json({ message: 'Lỗi server khi thêm sinh viên vào phòng thi.' });
        }
    });

    // ========================================
    // POST /unassign-students - Xóa sinh viên khỏi phòng thi
    // ========================================
    router.post('/unassign-students', canManageExamRooms, async (req, res) => {
        const { students, examType, maHK, maHP, tenPhongthi, maPT } = req.body;
        // students = [{ MaSV, MaLHP }, ...]

        if (!students || !Array.isArray(students) || students.length === 0 || examType === undefined) {
            return res.status(400).json({ message: 'Thiếu tham số bắt buộc hoặc danh sách sinh viên rỗng.' });
        }

        try {
            const { table, pkField, svField } = getExamTableInfo(examType);

            const pool = await poolPromise;

            // Kiểm tra nếu phòng thi đã có ngày thi thì không cho xóa SV
            if (maPT) {
                const ptResult = await pool.request()
                    .input('MaPT', sql.NVarChar, maPT)
                    .query(`SELECT Ngay FROM ${table} WHERE ${pkField} = @MaPT`);

                if (ptResult.recordset.length > 0 && ptResult.recordset[0].Ngay) {
                    return res.status(400).json({
                        message: 'Không thể xóa sinh viên khỏi phòng thi đã xếp lịch thi. Vui lòng hủy lịch thi trước.'
                    });
                }
            }

            const transaction = new sql.Transaction(pool);

            await transaction.begin();

            try {
                for (const student of students) {
                    const updateRequest = new sql.Request(transaction);
                    await updateRequest
                        .input('MaSV', sql.NVarChar, student.MaSV)
                        .input('MaLHP', sql.NVarChar, student.MaLHP)
                        .query(`UPDATE SinhvienLopHP SET ${svField} = NULL WHERE MaSV = @MaSV AND MaLHP = @MaLHP`);
                }

                await transaction.commit();

                // Ghi log (sử dụng maso)
                const maSVList = students.map(s => s.MaSV).join(', ');
                await writeLog(pool, req.user.maso, 'Tạo phòng thi', 'Xóa SV khỏi phòng',
                    `${students.length} SV từ ${tenPhongthi || 'phòng thi'}: ${maSVList.substring(0, 100)}...`);

                res.json({ message: `Đã xóa ${students.length} sinh viên khỏi phòng thi thành công!` });
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            console.error('API unassign-students error:', err);
            res.status(500).json({ message: 'Lỗi server khi xóa sinh viên khỏi phòng thi.' });
        }
    });

    // ========================================
    // GET /course-info - Lấy thông tin học phần cho tiêu đề trang
    // ========================================
    router.get('/course-info', canManageExamRooms, async (req, res) => {
        const { maHK, maDV, maHP } = req.query;
        if (!maHK || !maDV || !maHP) {
            return res.status(400).json({ message: 'Thiếu tham số bắt buộc.' });
        }

        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('MaHK', sql.NVarChar, maHK)
                .input('MaDV', sql.NVarChar, maDV)
                .input('MaHP', sql.NVarChar, maHP)
                .query(`
                    SELECT 
                        HP.Hocphan AS TenHP,
                        HP.Viettat AS ViettatHP,
                        HK.Hocky AS TenHK,
                        DV.Donvi AS TenDV
                    FROM Hocphan HP
                    CROSS JOIN Hocky HK
                    CROSS JOIN Donvi DV
                    WHERE HP.MaHP = @MaHP AND HK.MaHK = @MaHK AND DV.MaDV = @MaDV
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy thông tin học phần.' });
            }

            res.json(result.recordset[0]);
        } catch (err) {
            console.error('API course-info error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy thông tin học phần.' });
        }
    });

    // ========================================
    // PHẦN 2: API CHO TRANG XẾP LỊCH THI (Part 4 & Part 5)
    // ========================================

    // Helper: Tính Tiết bắt đầu từ Giờ và Phút
    const calculateTiet = (gio, phut) => {
        const g = parseInt(gio);
        const p = parseInt(phut) || 0;
        const baseHour = g >= 13 ? 13 : 7;
        const baseTiet = g >= 13 ? 7 : 1;
        const minutesFromBase = (g - baseHour) * 60 + p;
        return baseTiet + Math.floor(minutesFromBase / 50);
    };

    // Helper: Tính số tiết từ thời gian (phút)
    const calculateSotiet = (thoigian) => {
        return Math.ceil(parseInt(thoigian) / 50);
    };

    // ========================================
    // GET /schedule/room-groups - Lấy danh sách Nhóm phòng
    // ========================================
    router.get('/schedule/room-groups', canManageExamRooms, async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query(`SELECT MaNP, Nhomphong FROM Nhomphong ORDER BY Nhomphong`);
            res.json(result.recordset);
        } catch (err) {
            console.error('API room-groups error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách nhóm phòng.' });
        }
    });

    // ========================================
    // GET /schedule/available-rooms - Phòng còn trống theo ngày/giờ
    // ========================================
    router.get('/schedule/available-rooms', canManageExamRooms, async (req, res) => {
        const { maNP, ngay, tiet, sotiet, examType, excludeMaPT } = req.query;

        try {
            const pool = await poolPromise;
            const request = pool.request();

            let query = `
                SELECT PH.MaPH, PH.Tenphong, PH.Socho
                FROM Phonghoc PH
                WHERE 1=1
            `;

            // Lọc theo nhóm phòng
            if (maNP) {
                request.input('MaNP', sql.NVarChar, maNP);
                query += ` AND PH.MaNP = @MaNP`;
            }

            // Nếu có ngày và tiết, loại trừ phòng đã xếp lịch
            if (ngay && tiet && sotiet) {
                const t = parseInt(tiet);
                const s = parseInt(sotiet);
                const tietEnd = t + s - 1;

                request.input('Ngay', sql.Date, ngay);
                request.input('TietStart', sql.Int, t);
                request.input('TietEnd', sql.Int, tietEnd);

                // Loại trừ phòng đã xếp trong TKB
                query += `
                    AND PH.MaPH NOT IN (
                        SELECT MaPH FROM TKB 
                        WHERE Ngay = @Ngay 
                          AND Tiet <= @TietEnd 
                          AND (Tiet + Sotiet - 1) >= @TietStart
                          AND Hieuluc = 1
                    )
                `;

                // Loại trừ phòng đã xếp lịch thi
                if (examType !== undefined) {
                    const { table, pkField } = getExamTableInfo(examType);
                    let excludeClause = '';
                    if (excludeMaPT) {
                        request.input('ExcludeMaPT', sql.NVarChar, excludeMaPT);
                        excludeClause = `AND ${pkField} <> @ExcludeMaPT`;
                    }
                    query += `
                        AND PH.MaPH NOT IN (
                            SELECT MaPH FROM ${table}
                            WHERE Ngay = @Ngay 
                              AND Tiet <= @TietEnd 
                              AND (Tiet + Sotiet - 1) >= @TietStart
                              AND MaPH IS NOT NULL
                              ${excludeClause}
                        )
                    `;
                }
            }

            query += ` ORDER BY PH.Tenphong`;
            const result = await request.query(query);
            res.json(result.recordset);
        } catch (err) {
            console.error('API available-rooms error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách phòng.' });
        }
    });

    // ========================================
    // GET /schedule/available-teachers - GV còn trống theo ngày/giờ
    // ========================================
    router.get('/schedule/available-teachers', canManageExamRooms, async (req, res) => {
        const { ngay, tiet, sotiet, examType, excludeMaPT } = req.query;

        try {
            const pool = await poolPromise;
            const request = pool.request();

            let query = `
                SELECT GV.MaGV, GV.Hoten, GV.Viettat
                FROM Giaovien GV
                WHERE GV.Dangnhap = 1
            `;

            // Nếu có ngày và tiết, loại trừ GV đã có lịch
            if (ngay && tiet && sotiet) {
                const t = parseInt(tiet);
                const s = parseInt(sotiet);
                const tietEnd = t + s - 1;

                request.input('Ngay', sql.Date, ngay);
                request.input('TietStart', sql.Int, t);
                request.input('TietEnd', sql.Int, tietEnd);

                // Loại trừ GV đã dạy trong TKB
                query += `
                    AND GV.MaGV NOT IN (
                        SELECT MaGV FROM TKB 
                        WHERE Ngay = @Ngay 
                          AND Tiet <= @TietEnd 
                          AND (Tiet + Sotiet - 1) >= @TietStart
                          AND Hieuluc = 1
                    )
                `;

                // Loại trừ GV đã coi thi
                if (examType !== undefined) {
                    const { table, pkField } = getExamTableInfo(examType);
                    let excludeClause = '';
                    if (excludeMaPT) {
                        request.input('ExcludeMaPT', sql.NVarChar, excludeMaPT);
                        excludeClause = `AND ${pkField} <> @ExcludeMaPT`;
                    }
                    query += `
                        AND GV.MaGV NOT IN (
                            SELECT MaGV1 FROM ${table}
                            WHERE Ngay = @Ngay 
                              AND Tiet <= @TietEnd 
                              AND (Tiet + Sotiet - 1) >= @TietStart
                              AND MaGV1 IS NOT NULL
                              ${excludeClause}
                        )
                        AND GV.MaGV NOT IN (
                            SELECT MaGV2 FROM ${table}
                            WHERE Ngay = @Ngay 
                              AND Tiet <= @TietEnd 
                              AND (Tiet + Sotiet - 1) >= @TietStart
                              AND MaGV2 IS NOT NULL
                              ${excludeClause}
                        )
                    `;
                }
            }

            query += ` ORDER BY GV.Ten, GV.Holot`;
            const result = await request.query(query);
            res.json(result.recordset);
        } catch (err) {
            console.error('API available-teachers error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách giảng viên.' });
        }
    });

    // ========================================
    // POST /schedule/check-student-conflicts - Kiểm tra SV trùng lịch
    // ========================================
    router.post('/schedule/check-student-conflicts', canManageExamRooms, async (req, res) => {
        const { maPT, ngay, tiet, sotiet, examType, maHK, maHP } = req.body;

        if (!maPT || !ngay || !tiet || !sotiet || examType === undefined) {
            return res.status(400).json({ message: 'Thiếu tham số bắt buộc.' });
        }

        try {
            const { table, pkField, svField } = getExamTableInfo(examType);
            const t = parseInt(tiet);
            const s = parseInt(sotiet);
            const tietEnd = t + s - 1;

            const pool = await poolPromise;

            // Lấy danh sách MaSV của phòng thi hiện tại
            const svResult = await pool.request()
                .input('MaPT', sql.NVarChar, maPT)
                .query(`
                    SELECT DISTINCT SVLHP.MaSV 
                    FROM SinhvienLopHP SVLHP 
                    WHERE SVLHP.${svField} = @MaPT
                `);

            if (svResult.recordset.length === 0) {
                return res.json({ hasConflict: false, conflicts: [] });
            }

            const studentIds = svResult.recordset.map(r => r.MaSV);
            const conflicts = [];

            // Kiểm tra trùng lịch học (TKB)
            const tkbRequest = pool.request();
            tkbRequest.input('Ngay', sql.Date, ngay);
            tkbRequest.input('TietStart', sql.Int, t);
            tkbRequest.input('TietEnd', sql.Int, tietEnd);

            studentIds.forEach((maSV, i) => {
                tkbRequest.input(`SV${i}`, sql.NVarChar, maSV);
            });

            const tkbConflict = await tkbRequest.query(`
                SELECT 
                    COUNT(DISTINCT SVLHP.MaSV) as SoLuong,
                    LHP.Tenlop,
                    HP.Hocphan,
                    'Lịch học' as LoaiTrung
                FROM TKB
                JOIN LopHP LHP ON TKB.MaLHP = LHP.MaLHP
                JOIN Hocphan HP ON LHP.MaHP = HP.MaHP
                JOIN SinhvienLopHP SVLHP ON TKB.MaLHP = SVLHP.MaLHP
                WHERE TKB.Ngay = @Ngay
                  AND TKB.Tiet <= @TietEnd
                  AND (TKB.Tiet + TKB.Sotiet - 1) >= @TietStart
                  AND TKB.Hieuluc = 1
                  AND SVLHP.MaSV IN (${studentIds.map((_, i) => `@SV${i}`).join(',')})
                GROUP BY LHP.Tenlop, HP.Hocphan
            `);

            tkbConflict.recordset.forEach(r => {
                conflicts.push({
                    type: 'Lịch học',
                    count: r.SoLuong,
                    tenlop: r.Tenlop,
                    hocphan: r.Hocphan
                });
            });

            // Kiểm tra trùng lịch thi (PhongthiX)
            // Kiểm tra cả 3 loại phòng thi
            for (let pt = 0; pt <= 2; pt++) {
                const ptInfo = getExamTableInfo(pt);

                // Tạo request mới cho mỗi loại phòng thi
                const ptRequest = pool.request();
                ptRequest.input('Ngay', sql.Date, ngay);
                ptRequest.input('TietStart', sql.Int, t);
                ptRequest.input('TietEnd', sql.Int, tietEnd);
                ptRequest.input('ExcludeMaPT', sql.NVarChar, maPT);

                studentIds.forEach((maSV, i) => {
                    ptRequest.input(`SV${i}`, sql.NVarChar, maSV);
                });

                const ptConflict = await ptRequest.query(`
                    SELECT 
                        COUNT(DISTINCT SVLHP.MaSV) as SoLuong,
                        PT.Phongthi,
                        HP.Hocphan,
                        'Lịch thi' as LoaiTrung
                    FROM ${ptInfo.table} PT
                    JOIN SinhvienLopHP SVLHP ON SVLHP.${ptInfo.svField} = PT.${ptInfo.pkField}
                    JOIN LopHP LHP ON SVLHP.MaLHP = LHP.MaLHP
                    JOIN Hocphan HP ON LHP.MaHP = HP.MaHP
                    WHERE PT.Ngay = @Ngay
                      AND PT.Tiet <= @TietEnd
                      AND (PT.Tiet + PT.Sotiet - 1) >= @TietStart
                      AND PT.${ptInfo.pkField} <> @ExcludeMaPT
                      AND SVLHP.MaSV IN (${studentIds.map((_, i) => `@SV${i}`).join(',')})
                    GROUP BY PT.Phongthi, HP.Hocphan
                `);

                ptConflict.recordset.forEach(r => {
                    conflicts.push({
                        type: 'Lịch thi',
                        count: r.SoLuong,
                        tenlop: r.Phongthi,
                        hocphan: r.Hocphan
                    });
                });
            }

            res.json({
                hasConflict: conflicts.length > 0,
                conflicts
            });
        } catch (err) {
            console.error('API check-student-conflicts error:', err);
            res.status(500).json({ message: 'Lỗi server khi kiểm tra trùng lịch.' });
        }
    });

    // ========================================
    // PUT /schedule/update/:maPT - Cập nhật lịch thi
    // ========================================
    router.put('/schedule/update/:maPT', canManageExamRooms, async (req, res) => {
        const { maPT } = req.params;
        const { examType, ngay, gio, phut, thoigian, maPH, maGV1, maGV2, ghichu } = req.body;

        if (!maPT || examType === undefined || !ngay || gio === undefined || phut === undefined || !thoigian) {
            return res.status(400).json({ message: 'Thiếu tham số bắt buộc.' });
        }

        try {
            const { table, pkField } = getExamTableInfo(examType);
            const tiet = calculateTiet(gio, phut);
            const sotiet = calculateSotiet(thoigian);

            const pool = await poolPromise;

            // Lấy tên phòng thi để ghi log
            const ptResult = await pool.request()
                .input('MaPT', sql.NVarChar, maPT)
                .query(`SELECT Phongthi FROM ${table} WHERE ${pkField} = @MaPT`);

            const tenPhongthi = ptResult.recordset[0]?.Phongthi || maPT;

            // Lấy tên phòng học và GV để ghi log
            let tenPhong = '', tenGV1 = '', tenGV2 = '';
            if (maPH) {
                const phResult = await pool.request()
                    .input('MaPH', sql.NVarChar, maPH)
                    .query(`SELECT Tenphong FROM Phonghoc WHERE MaPH = @MaPH`);
                tenPhong = phResult.recordset[0]?.Tenphong || '';
            }
            if (maGV1) {
                const gv1Result = await pool.request()
                    .input('MaGV', sql.NVarChar, maGV1)
                    .query(`SELECT Holot + ' ' + Ten AS Hoten FROM Giaovien WHERE MaGV = @MaGV`);
                tenGV1 = gv1Result.recordset[0]?.Hoten || '';
            }
            if (maGV2) {
                const gv2Result = await pool.request()
                    .input('MaGV', sql.NVarChar, maGV2)
                    .query(`SELECT Holot + ' ' + Ten AS Hoten FROM Giaovien WHERE MaGV = @MaGV`);
                tenGV2 = gv2Result.recordset[0]?.Hoten || '';
            }

            // Cập nhật lịch thi
            await pool.request()
                .input('MaPT', sql.NVarChar, maPT)
                .input('Ngay', sql.Date, ngay)
                .input('Gio', sql.Int, parseInt(gio))
                .input('Phut', sql.Int, parseInt(phut))
                .input('Thoigian', sql.Int, parseInt(thoigian))
                .input('Tiet', sql.Int, tiet)
                .input('Sotiet', sql.Int, sotiet)
                .input('MaPH', sql.NVarChar, maPH || null)
                .input('MaGV1', sql.NVarChar, maGV1 || null)
                .input('MaGV2', sql.NVarChar, maGV2 || null)
                .input('Ghichu', sql.NVarChar, ghichu || null)
                .query(`
                    UPDATE ${table} SET
                        Ngay = @Ngay,
                        Gio = @Gio,
                        Phut = @Phut,
                        Thoigian = @Thoigian,
                        Tiet = @Tiet,
                        Sotiet = @Sotiet,
                        MaPH = @MaPH,
                        MaGV1 = @MaGV1,
                        MaGV2 = @MaGV2,
                        Ghichu = @Ghichu
                    WHERE ${pkField} = @MaPT
                `);

            // Ghi log
            const ngayFormat = new Date(ngay).toLocaleDateString('vi-VN');
            const ghichuLog = `${tenPhongthi}, Ngày: ${ngayFormat}, Giờ: ${gio}:${phut}, Thời gian: ${thoigian}', Phòng: ${tenPhong}, CB1: ${tenGV1}, CB2: ${tenGV2}`;
            await writeLog(pool, req.user.maso, 'Cập nhật lịch coi thi', 'Lưu thành công', ghichuLog);

            res.json({ message: 'Cập nhật lịch thi thành công!' });
        } catch (err) {
            console.error('API schedule/update error:', err);
            res.status(500).json({ message: 'Lỗi server khi cập nhật lịch thi.' });
        }
    });

    // ========================================
    // PUT /schedule/clear/:maPT - Xóa lịch thi (xóa các trường liên quan)
    // ========================================
    router.put('/schedule/clear/:maPT', canManageExamRooms, async (req, res) => {
        const { maPT } = req.params;
        const { examType } = req.body;

        if (!maPT || examType === undefined) {
            return res.status(400).json({ message: 'Thiếu tham số bắt buộc.' });
        }

        try {
            const { table, pkField } = getExamTableInfo(examType);

            const pool = await poolPromise;

            // Lấy tên phòng thi để ghi log
            const ptResult = await pool.request()
                .input('MaPT', sql.NVarChar, maPT)
                .query(`SELECT Phongthi FROM ${table} WHERE ${pkField} = @MaPT`);

            const tenPhongthi = ptResult.recordset[0]?.Phongthi || maPT;

            // Xóa các trường lịch thi
            await pool.request()
                .input('MaPT', sql.NVarChar, maPT)
                .query(`
                    UPDATE ${table} SET
                        Ngay = NULL,
                        Gio = NULL,
                        Phut = NULL,
                        Thoigian = NULL,
                        Tiet = NULL,
                        Sotiet = NULL,
                        MaPH = NULL,
                        MaGV1 = NULL,
                        MaGV2 = NULL,
                        Ghichu = NULL
                    WHERE ${pkField} = @MaPT
                `);

            // Ghi log
            await writeLog(pool, req.user.maso, 'Cập nhật lịch coi thi', 'Xóa dữ liệu lịch coi thi', `Phòng thi: ${tenPhongthi}`);

            res.json({ message: 'Xóa lịch thi thành công!' });
        } catch (err) {
            console.error('API schedule/clear error:', err);
            res.status(500).json({ message: 'Lỗi server khi xóa lịch thi.' });
        }
    });

    return router;
};
