/*
 * Đường dẫn file: D:\QLDT-app\server\routes\credit-class-management.js
 * Cập nhật: 07/11/2025
 * Tóm tắt:
 * - Bổ sung API endpoint mới GET /evaluation-forms (giữ nguyên).
 * - BỔ SUNG: API endpoint mới GET /student-positions để lấy DS Chức vụ SV.
 * - BỔ SUNG: API endpoint mới PUT /students/update-positions để cập nhật Chức vụ SV (có log).
 * - CẬP NHẬT: API GET /students/:classId để bổ sung MaCVSV.
 */
const express = require('express');
const sql = require('mssql');
const moment = require('moment');

module.exports = function(poolPromise, writeLog) {
    const router = express.Router();
	// Middleware check quyền
    const canDeleteStudents = (req, res, next) => {
        const { user } = req;
        if (user.isAdmin || user.isXepTKB || user.nhapDiem) { next(); } 
        else { res.status(403).json({ message: 'Bạn không có quyền thực hiện chức năng này.' }); }
    };
    
    const canUpdateStudents = (req, res, next) => {
        const { user } = req;
        if (user.isAdmin || user.isXepTKB || user.nhapDiem) { next(); }
        else { res.status(403).json({ message: 'Bạn không có quyền thực hiện chức năng này.' }); }
    };

    const canUpdateClasses = (req, res, next) => {
        const { user } = req;
        if (user.isAdmin || user.isKhaothi) { next(); }
        else { res.status(403).json({ message: 'Bạn không có quyền thực hiện chức năng này.' }); }
    };
	// API lấy cấu trúc cây thư mục (Giữ nguyên)
    router.get('/tree', async (req, res) => {
        const { user } = req;
        let filterClause = '';
        if (user.isXepTKB && !user.isAdmin && !user.isKhaothi) {
            filterClause = `WHERE LHP.MaDV = '${user.maDV}'`;
        } else if (user.nhapDiem && !user.isAdmin && !user.isKhaothi && !user.isXepTKB) {
            filterClause = `WHERE LHP.MaGV = '${user.maGV}'`;
        }
        
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT 
                    LHP.MaHK, LHP.MaLHP, LHP.Tenlop, LHP.MaDV, DV.Donvi, LHP.MaHP, HP.Hocphan, HP.Viettat as ViettatHP, LHP.MaGV, GV.Viettat as ViettatGV,
                    (SELECT COUNT(*) FROM SinhvienLopHP WHERE MaLHP = LHP.MaLHP) as StudentCount
                FROM LopHP LHP
                LEFT JOIN Donvi DV ON LHP.MaDV = DV.MaDV
                LEFT JOIN Hocphan HP ON LHP.MaHP = HP.MaHP
                LEFT JOIN Giaovien GV ON LHP.MaGV = GV.MaGV
                ${filterClause}
                ORDER BY LHP.MaHK DESC, DV.Donvi, HP.Viettat, LHP.Tenlop
            `);
            
            const tree = [];
            const namHocMap = new Map();

            result.recordset.forEach(row => {
                if (!row.MaHK || !row.Donvi || !row.Hocphan) return;
                const nam = parseInt(row.MaHK.substring(0, 2));
                const namHocId = `nh_${nam}`;
                const namHocName = `20${nam} - 20${nam + 1}`;

                if (!namHocMap.has(namHocId)) {
                    namHocMap.set(namHocId, { id: namHocId, name: namHocName, level: 1, children: [], params: { namHoc: nam } });
                    tree.push(namHocMap.get(namHocId));
                }
                const namHocNode = namHocMap.get(namHocId);

                const hocKyId = `hk_${row.MaHK}`;
                let hocKyNode = namHocNode.children.find(c => c.id === hocKyId);
                if (!hocKyNode) {
                    const ky = row.MaHK.slice(-1);
                    hocKyNode = { id: hocKyId, name: `Học kỳ ${ky}`, level: 2, children: [], params: { maHK: row.MaHK } };
                    namHocNode.children.push(hocKyNode);
                }

                const donViId = `dv_${row.MaHK}_${row.MaDV}`;
                let donViNode = hocKyNode.children.find(c => c.id === donViId);
                if (!donViNode) {
                    donViNode = { id: donViId, name: row.Donvi, level: 3, children: [], params: { maHK: row.MaHK, maDV: row.MaDV } };
                    hocKyNode.children.push(donViNode);
                }

                const hocPhanId = `hp_${row.MaHK}_${row.MaDV}_${row.MaHP}`;
                let hocPhanNode = donViNode.children.find(c => c.id === hocPhanId);
                if (!hocPhanNode) {
                    hocPhanNode = { id: hocPhanId, name: row.Hocphan, level: 4, children: [], params: { maHK: row.MaHK, maDV: row.MaDV, maHP: row.MaHP } };
                    donViNode.children.push(hocPhanNode);
                }

                const lopHPId = `lhp_${row.MaLHP}`;
                let lopHPNode = hocPhanNode.children.find(c => c.id === lopHPId);
                if (!lopHPNode) {
                    lopHPNode = { id: lopHPId, name: row.Tenlop, level: 5, count: row.StudentCount, params: { maLHP: row.MaLHP, viettatHP: row.ViettatHP, viettatGV: row.ViettatGV } };
                    hocPhanNode.children.push(lopHPNode);
                }
            });
            
            tree.forEach(nh => {
                nh.children.sort((a, b) => a.params.maHK.localeCompare(b.params.maHK));
                nh.children.forEach(hk => {
                    hk.children.sort((a,b) => a.name.localeCompare(b.name));
                    hk.children.forEach(dv => {
                        dv.count = dv.children.length;
                        dv.children.forEach(hp => {
                            hp.count = hp.children.length;
                            hp.children.sort((a,b) => a.name.localeCompare(b.name));
                        })
                        dv.children.sort((a,b) => a.name.localeCompare(b.name));
                    })
                })
            });

            res.json(tree);
        } catch (err) {
            console.error('API get tree error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu cây.' });
        }
    });
	// API lấy danh sách lớp học phần (Giữ nguyên logic)
    router.get('/classes', async (req, res) => {
        // --- Giữ nguyên logic gốc ---
        const { maHK, maDV, maHP, sortBy, sortOrder } = req.query;
        const { user } = req;
        
        let whereClauses = [];
        if (maHK) whereClauses.push(`LHP.MaHK = '${maHK}'`);
        if (maDV) whereClauses.push(`LHP.MaDV = '${maDV}'`);
        if (maHP) whereClauses.push(`LHP.MaHP = '${maHP}'`);
        
        if (user.isXepTKB && !user.isAdmin && !user.isKhaothi) {
            whereClauses.push(`LHP.MaDV = '${user.maDV}'`);
        } else if (user.nhapDiem && !user.isAdmin && !user.isKhaothi && !user.isXepTKB) {
            whereClauses.push(`LHP.MaGV = '${user.maGV}'`);
        }

        const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        
        const sortMappings = {
            DonviQuanLy: ['DV.Donvi'],
            Tenlop: ['LHP.Tenlop'],
            TenHocPhan: ['HP.Hocphan'],
			ViettatHP: ['HP.Viettat'],
            Giangvien: ['GV.Ten', 'GV.Holot'],
            LockDK: ['LHP.LockDK'],
            LockDiemdanh: ['LHP.LockDiemdanh'],
            LockXetthi: ['LHP.LockXetthi'],
            NhapdiemKiemtra: ['LHP.NhapdiemKiemtra'],
            LockND: ['LHP.LockND'],
            Daxacnhan: ['LHP.Daxacnhan'],
            Dacongbo: ['LHP.Dacongbo'],
            DaxacnhanL2: ['LHP.DaxacnhanL2'],
            DacongboL2: ['LHP.DacongboL2'],
			PhieuDanhgia: ['PDG.PhieuDanhgia']
        };

        const defaultSort = ['DV.Donvi', 'LHP.Tenlop', 'HP.Hocphan'];
        let orderByClause = `ORDER BY ${defaultSort.join(', ')}`;

        if (sortBy && sortMappings[sortBy]) {
            const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
            const primarySort = sortMappings[sortBy].map(col => `${col} ${order}`);
            
            const tieBreakers = {
                DonviQuanLy: ['LHP.Tenlop', 'HP.Hocphan'],
                Tenlop: ['GV.Ten', 'GV.Holot'],
                TenHocPhan: ['GV.Ten', 'GV.Holot'],
                ViettatHP: ['GV.Ten', 'GV.Holot'],
				Giangvien: ['LHP.Tenlop']
            };

            let finalSortOrder = [...primarySort];
            const tieBreakerList = tieBreakers[sortBy] || defaultSort;
            
            tieBreakerList.forEach(tb => {
                if (!primarySort.some(ps => ps.startsWith(tb))) {
                    finalSortOrder.push(tb);
                }
            });
            orderByClause = `ORDER BY ${finalSortOrder.join(', ')}`;
        }
        // --- Kết thúc logic gốc ---
        
        try {
            const pool = await poolPromise;
            // Cập nhật: Tái cấu trúc truy vấn, sử dụng CTEs (22/10/2025)
            const result = await pool.request().query(`
                WITH SVLHP_Counts AS (
                    SELECT MaLHP, COUNT(*) as SoLuongSV FROM SinhvienLopHP GROUP BY MaLHP
                ),
                TKB_Info AS (
                    SELECT MaLHP, MIN(Ngay) as NgayBatDau, MAX(Ngay) as NgayKetThuc, SUM(Sotiet) as TongSoTiet 
                    FROM TKB GROUP BY MaLHP
                ),
                -- Bổ sung: CTE for NgayThiL1
                NgayThi_CTE AS (
                    SELECT 
                        sv_lhp.MaLHP, 
                        MIN(p1.Ngay) as NgayThiL1
                    FROM SinhvienLopHP sv_lhp 
                    LEFT JOIN Phongthi1 p1 ON sv_lhp.MaPT1 = p1.MaPT1
                    WHERE p1.Ngay IS NOT NULL
                    GROUP BY sv_lhp.MaLHP
                ),
                -- Bổ sung: CTE for SLgDGHP
                DanhGia_CTE AS (
                    SELECT MaLHP, COUNT(DISTINCT MaSV) as SLgDGHP
                    FROM KetquaDanhgia
                    GROUP BY MaLHP
                )
                SELECT 
                    LHP.*, 
                    DV.Donvi as DonviQuanLy, 
                    HP.Hocphan as TenHocPhan, 
                    HP.Viettat as ViettatHP, 
                    (GV.Holot + ' ' + GV.Ten) as Giangvien, 
                    CT2.Congthuc as CotNhapDiem, 
                    KND.Kieunhapdiem, 
                    PDG.PhieuDanhgia,
                    TKB_Info.NgayBatDau,
                    TKB_Info.NgayKetThuc,
                    ISNULL(TKB_Info.TongSoTiet, 0) as GioTKB,
                    ISNULL(SVLHP_Counts.SoLuongSV, 0) as SLgDanhSach,
                    -- Bổ sung: Lấy từ CTE
                    NgayThi_CTE.NgayThiL1,
                    ISNULL(DanhGia_CTE.SLgDGHP, 0) AS SLgDGHP

                FROM LopHP LHP
                LEFT JOIN Donvi DV ON LHP.MaDV = DV.MaDV
                LEFT JOIN Hocphan HP ON LHP.MaHP = HP.MaHP
                LEFT JOIN Giaovien GV ON LHP.MaGV = GV.MaGV
                LEFT JOIN Congthuc2 CT2 ON LHP.MaCT2 = CT2.MaCT2
                LEFT JOIN Kieunhapdiem KND ON LHP.MaKND = KND.MaKND
                LEFT JOIN PhieuDanhgia PDG ON LHP.MaPDGCK = PDG.MaPDG
                LEFT JOIN SVLHP_Counts ON LHP.MaLHP = SVLHP_Counts.MaLHP
                LEFT JOIN TKB_Info ON LHP.MaLHP = TKB_Info.MaLHP
                -- Bổ sung: JOIN với CTEs
                LEFT JOIN NgayThi_CTE ON LHP.MaLHP = NgayThi_CTE.MaLHP
                LEFT JOIN DanhGia_CTE ON LHP.MaLHP = DanhGia_CTE.MaLHP
                ${whereClause}
                ${orderByClause}
            `);
            // Kết thúc Cập nhật (22/10/2025)
            res.json(result.recordset);
        } catch (err) {
            console.error('API get classes error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách lớp học phần.' });
        }
    });
	// API lấy danh sách sinh viên của một lớp
    router.get('/students/:classId', async (req, res) => {
        const { classId } = req.params;
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('MaLHP', sql.NVarChar, classId)
                .query(`
                    SELECT 
                        SV.MaSV, SV.Tinhtrang, SV.Maso, SV.Holot, SV.Ten, SV.Gioitinh, SV.Ngaysinh, SV.Noisinh,
                        DT.Dantoc, SV.Diachi, SV.Dienthoai, SV.SoCMND, SV.TrinhdoVH, DTCS.DTCS, SV.Miengiam, L.Tenlop AS LopSH, 
                        
                        -- BỔ SUNG: Lấy cả MaCVSV (để update) và ChucvuSV (để hiển thị)
                        SVLHP.MaCVSV,
                        CVSV.ChucvuSV,
                        
                        SVLHP.ThiL1, SVLHP.CT1, SVLHP.DHP1, SVLHP.ThiL2, SVLHP.CT2, SVLHP.DHP2, SVLHP.DHP, SVLHP.DHPBon, SVLHP.DHPChu, SVLHP.GhichuXetThi,
                        KQ.C11, KQ.C12, KQ.C13, KQ.C14, KQ.C15, KQ.C21, KQ.C22, KQ.C23, KQ.C24, KQ.C25, KQ.TBHS,
                        LHP.MaCT2, LHP.Tongsotiet, LHP.Daxacnhan,
                        ISNULL(DD.SoGioNghi, 0) AS SoGioNghi,
                        CASE 
                            WHEN LHP.Tongsotiet > 0 THEN CAST(ISNULL(DD.SoGioNghi, 0) AS FLOAT) * 100 / LHP.Tongsotiet
                            ELSE 0 
                        END AS TyLeNghi
                    FROM SinhvienLopHP SVLHP
                    LEFT JOIN Sinhvien SV ON SVLHP.MaSV = SV.MaSV
                    LEFT JOIN Dantoc DT ON SV.MaDT = DT.MaDT
                    LEFT JOIN DTCS ON SV.MaDTCS = DTCS.MaDTCS
                    LEFT JOIN Lop L ON SV.MaL = L.MaL
                    LEFT JOIN ChucvuSV CVSV ON SVLHP.MaCVSV = CVSV.MaCVSV
                    LEFT JOIN KetquaLopHP2 KQ ON SVLHP.MaSV = KQ.MaSV AND SVLHP.MaLHP = KQ.MaLHP
                    LEFT JOIN LopHP LHP ON SVLHP.MaLHP = LHP.MaLHP
                    LEFT JOIN (
                        SELECT MaSV, MaLHP, SUM(Sotietvang) as SoGioNghi 
                        FROM Diemdanh 
                        GROUP BY MaSV, MaLHP
                    ) DD ON SVLHP.MaSV = DD.MaSV AND SVLHP.MaLHP = DD.MaLHP
                    WHERE SVLHP.MaLHP = @MaLHP
                    ORDER BY SV.Tinhtrang ASC, SV.Ten ASC, SV.Holot ASC, SV.Ngaysinh ASC;
                `);
            res.json(result.recordset);
        } catch (err) {
            console.error('API get students error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách sinh viên.' });
        }
    });
	// API lấy danh sách phiếu đánh giá (Giữ nguyên)
    router.get('/evaluation-forms', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT MaPDG, PhieuDanhgia FROM PhieuDanhgia ORDER BY PhieuDanhgia');
            res.json(result.recordset);
        } catch (err) {
            console.error('API get evaluation forms error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách phiếu đánh giá.' });
        }
    });

    // BỔ SUNG: API mới để lấy danh sách Chức vụ Sinh viên
    router.get('/student-positions', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query('SELECT MaCVSV, ChucvuSV FROM ChucvuSV ORDER BY TT');
            res.json(result.recordset);
        } catch (err) {
            console.error('API get student positions error:', err);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách chức vụ sinh viên.' });
        }
    });

	// API cập nhật thông tin lớp học phần (hàng loạt - Giữ nguyên)
    router.put('/classes', canUpdateClasses, async (req, res) => {
        const { updates, context } = req.body;
        if (!updates || !Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ message: 'Không có dữ liệu cập nhật.' });
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            
            const columnHeaderMap = {
                MaPDGCK: "Đánh giá HP",
                DanhgiatungayCK: "ĐG từ ngày",
                DanhgiadenngayCK: "ĐG đến ngày",
                GhichuDGCK: "ĐG ghi chú",
                LockDK: "Khoá đăng ký",
                LockDiemdanh: "Khoá điểm danh",
                LockXetthi: "Khoá xét thi",
                NhapdiemKiemtra: "Đã nhập điểm",
                LockND: "Khóa nhập điểm",
                Daxacnhan: "Đã xác nhận",
                Dacongbo: "Đã công bố",
                DaxacnhanL2: "Đã XN lần 2",
                DacongboL2: "Đã CB lần 2",
                LockDGCK: "ĐG khóa",
                NhapdiemKiemtraL1: "Cho nhập KT L1",
                NhapdiemKiemtraL2: "Cho nhập KT L2",
                NhapdiemThiL1: "Cho nhập THI L1",
                NhapdiemThiL2: "Cho nhập THI L2",
            };

            for (const update of updates) {
                const { MaLHP, ...fieldsToUpdate } = update;
                if (!MaLHP || Object.keys(fieldsToUpdate).length === 0) continue;

                const oldRecordRequest = new sql.Request(transaction);
                const oldRecordResult = await oldRecordRequest.input('MaLHP', sql.NVarChar, MaLHP).query(`SELECT * FROM LopHP WHERE MaLHP = @MaLHP`);
                const oldRecord = oldRecordResult.recordset[0];

                let setClauses = [];
                const request = new sql.Request(transaction);
                request.input('MaLHP', sql.NVarChar, MaLHP);

                for (const field in fieldsToUpdate) {
                    setClauses.push(`${field} = @${field}`);
                    const value = fieldsToUpdate[field];
                    
                    const fieldSchema = oldRecordResult.recordset.columns[field];

                    if (fieldSchema.type === sql.Bit) {
                        request.input(field, sql.Bit, value);
                    } else if (fieldSchema.type === sql.Int) {
                         request.input(field, sql.Int, value ? 1 : 0);
                    } else if (fieldSchema.type === sql.DateTime) {
                        request.input(field, sql.DateTime, value ? new Date(value) : null);
                    } else {
                        request.input(field, sql.NVarChar, value);
                    }
                }

                if (setClauses.length > 0) {
                    const query = `UPDATE LopHP SET ${setClauses.join(', ')} WHERE MaLHP = @MaLHP`;
                    await request.query(query);

                    for (const field in fieldsToUpdate) {
                        let oldValue = oldRecord[field];
                        let newValue = fieldsToUpdate[field];

                        if (typeof oldValue === 'boolean') oldValue = oldValue ? 1: 0;
                        if (typeof newValue === 'boolean') newValue = newValue ? 1 : 0;
                        
                        if (oldValue instanceof Date) oldValue = moment(oldValue).format('YYYY-MM-DD');
                        if (moment(newValue, 'YYYY-MM-DD', true).isValid()) newValue = moment(newValue).format('YYYY-MM-DD');

                        if (String(oldValue) !== String(newValue)) {
                            const congviec = `Thay đổi giá trị: ${columnHeaderMap[field] || field}`;
                            const ghichu = updates.length > 1 && context ? `${context} / ${MaLHP}: ${oldValue} -> ${newValue}` : `${MaLHP}: ${oldValue} -> ${newValue}`;
                            await writeLog(pool, req.user.maso, 'Danh sách Lớp HP', congviec, ghichu);
                        }
                    }
                }
            }
            await transaction.commit();
            res.json({ message: 'Cập nhật thành công!' });

        } catch (err) {
            await transaction.rollback();
            console.error('API update classes error:', err);
            res.status(500).json({ message: 'Lỗi server khi cập nhật lớp học phần.' });
        }
    });

    // BỔ SUNG: API mới để cập nhật Chức vụ SV (hàng loạt)
    router.put('/students/update-positions', canUpdateStudents, async (req, res) => {
        const { updates } = req.body; // updates = [{ MaSV, MaCVSV, MaLHP }, ...]
        if (!updates || !Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ message: 'Không có dữ liệu cập nhật.' });
        }
    
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
    
        try {
            await transaction.begin();
    
            // Tạo một map Chức vụ SV để tra cứu tên
            const cvsvRequest = new sql.Request(transaction);
            const cvsvResult = await cvsvRequest.query('SELECT MaCVSV, ChucvuSV FROM ChucvuSV');
            const cvsvMap = new Map(cvsvResult.recordset.map(item => [item.MaCVSV, item.ChucvuSV]));
            cvsvMap.set(null, "Không"); // Thêm giá trị cho null/bỏ chọn
    
            for (const update of updates) {
                const { MaSV, MaCVSV, MaLHP } = update;
                const newMaCVSV = MaCVSV || null; // Đảm bảo giá trị null nếu rỗng
    
                // 1. Lấy thông tin cũ
                const oldRecordRequest = new sql.Request(transaction);
                const oldRecordResult = await oldRecordRequest
                    .input('MaSV', sql.NVarChar, MaSV)
                    .input('MaLHP', sql.NVarChar, MaLHP)
                    .query('SELECT SVLHP.MaCVSV, SV.Maso FROM SinhvienLopHP SVLHP JOIN Sinhvien SV ON SVLHP.MaSV = SV.MaSV WHERE SVLHP.MaSV = @MaSV AND SVLHP.MaLHP = @MaLHP');
                
                if (oldRecordResult.recordset.length === 0) continue; // Bỏ qua nếu SV không tồn tại
                
                const oldMaCVSV = oldRecordResult.recordset[0].MaCVSV;
                const maSoSV = oldRecordResult.recordset[0].Maso;
    
                // 2. Chỉ cập nhật và log nếu có thay đổi
                if (oldMaCVSV !== newMaCVSV) {
                    const updateRequest = new sql.Request(transaction);
                    await updateRequest
                        .input('MaCVSV', sql.NVarChar, newMaCVSV)
                        .input('MaSV', sql.NVarChar, MaSV)
                        .input('MaLHP', sql.NVarChar, MaLHP)
                        .query('UPDATE SinhvienLopHP SET MaCVSV = @MaCVSV WHERE MaSV = @MaSV AND MaLHP = @MaLHP');
    
                    // 3. Ghi log
                    const oldChucVuName = cvsvMap.get(oldMaCVSV) || "Không";
                    const newChucVuName = cvsvMap.get(newMaCVSV) || "Không";
                    const ghichu = `SV: ${maSoSV} (LHP: ${MaLHP}): ${oldChucVuName} -> ${newChucVuName}`;
                    
                    await writeLog(pool, req.user.maso, 'QL lớp học phần', 'Cập nhật Chức vụ SV', ghichu);
                }
            }
    
            await transaction.commit();
            res.json({ message: 'Cập nhật chức vụ sinh viên thành công!' });
    
        } catch (err) {
            await transaction.rollback();
            console.error('API update student positions error:', err);
            res.status(500).json({ message: 'Lỗi server khi cập nhật chức vụ sinh viên.' });
        }
    });

	// API cập nhật thứ tự sinh viên (Giữ nguyên)
    router.put('/students/order', canUpdateStudents, async (req, res) => {
        const { studentOrder, maLHP } = req.body;
        if (!studentOrder || !Array.isArray(studentOrder) || !maLHP) {
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            
            for (const student of studentOrder) {
                const request = new sql.Request(transaction);
                await request
                    .input('TT', sql.Int, student.TT)
                    .input('MaSV', sql.NVarChar, student.MaSV)
                    .input('MaLHP', sql.NVarChar, maLHP)
                    .query('UPDATE SinhvienLopHP SET TT = @TT WHERE MaSV = @MaSV AND MaLHP = @MaLHP');
            }

            await transaction.commit();
            
            try {
                await writeLog(pool, req.user.maso, `QL Lớp HP - ${maLHP}`, 'Sắp xếp sinh viên', `Cập nhật thứ tự cho ${studentOrder.length} sinh viên.`);
            } catch (logErr) {
                console.error("Lỗi ghi log sắp xếp sinh viên:", logErr);
            }

            res.json({ message: 'Đã cập nhật thứ tự sinh viên thành công.' });
        } catch (err) {
            await transaction.rollback();
            console.error('API update student order error:', err);
            res.status(500).json({ message: 'Lỗi server khi cập nhật thứ tự.' });
        }
    });
	// API xóa sinh viên khỏi lớp (Giữ nguyên)
    router.delete('/students', canDeleteStudents, async (req, res) => {
        const { studentIds, maLHP } = req.body;
        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0 || !maLHP) {
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            const request = new sql.Request(transaction);

            const studentsInfoResult = await request.query(`
                SELECT MaSV, Maso, Holot, Ten FROM Sinhvien WHERE MaSV IN (${studentIds.map(id => `'${id}'`).join(',')})
            `);
            const studentsInfo = studentsInfoResult.recordset;

            const preCheckRequest = new sql.Request(transaction);
            preCheckRequest.input('MaLHP', sql.NVarChar, maLHP);
            const checkResult = await preCheckRequest.query(`
                SELECT LHP.Daxacnhan, SVLHP.MaSV, SVLHP.CT1
                FROM SinhvienLopHP SVLHP
                JOIN LopHP LHP ON SVLHP.MaLHP = LHP.MaLHP
                WHERE SVLHP.MaLHP = @MaLHP AND SVLHP.MaSV IN (${studentIds.map(id => `'${id}'`).join(',')})
            `);

            for (const record of checkResult.recordset) {
                if (record.Daxacnhan === 1) {
                    await transaction.rollback();
                    return res.status(403).json({ message: `Không thể xóa vì lớp học phần đã được xác nhận.` });
                }
                if (record.CT1 !== null) {
                    const student = studentsInfo.find(s => s.MaSV === record.MaSV);
                    await transaction.rollback();
                    return res.status(403).json({ message: `Không thể xóa sinh viên ${student.Holot} ${student.Ten} vì đã có điểm thi.` });
                }
            }

            const studentIdsString = studentIds.map(id => `'${id}'`).join(',');
            const maLHPInput = `'${maLHP}'`;

            await request.query(`DELETE FROM Diemdanh WHERE MaSV IN (${studentIdsString}) AND MaLHP = ${maLHPInput}`);
            await request.query(`DELETE FROM KetquaLopHP2 WHERE MaSV IN (${studentIdsString}) AND MaLHP = ${maLHPInput}`);
            await request.query(`DELETE FROM Dangkyhoc WHERE MaSV IN (${studentIdsString}) AND MaLHP = ${maLHPInput}`);
            const deletedResult = await request.query(`DELETE FROM SinhvienLopHP WHERE MaSV IN (${studentIdsString}) AND MaLHP = ${maLHPInput}`);

            await transaction.commit();
            
            try {
                const deletedStudentsLog = studentsInfo.map(s => `${s.Maso} - ${s.Holot} ${s.Ten}`).join('; ');
                await writeLog(pool, req.user.maso, `QL Lớp HP - ${maLHP}`, 'Xóa sinh viên', `Đã xóa: ${deletedStudentsLog}`);
            } catch (logErr) {
                console.error("Lỗi ghi log xóa sinh viên:", logErr);
            }

            res.json({ message: `Đã xóa thành công ${deletedResult.rowsAffected[0]} sinh viên.` });

        } catch (err) {
            await transaction.rollback();
            console.error('API delete students error:', err);
            res.status(500).json({ message: 'Lỗi server khi xóa sinh viên.' });
        }
    });

    return router;
};