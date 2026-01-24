/*
* D:\QLDT-app\server\routes\schedule-builder.js
* Cập nhật: 22/09/2025
* Tóm tắt những nội dung cập nhật (bổ sung):
* - Bổ sung API endpoint mới `/semesters` để lấy danh sách học kỳ và xác định học kỳ mặc định từ server, tương tự trang "Xem TKB".
*/
const express = require('express');
const sql = require('mssql');
const moment = require('moment-timezone');

// --- HÀM HỖ TRỢ ---

const updateLopHPSummary = async (pool, MaLHP) => {
   try {
       const request = new sql.Request(pool);
       request.input('MaLHP', sql.NVarChar, MaLHP);

       const hocKyInfo = await request.query(`
           SELECT hk.Ngaybatdau 
           FROM Hocky hk
           JOIN LopHP lhp ON hk.MaHK = lhp.MaHK
           WHERE lhp.MaLHP = @MaLHP
       `);
       const semesterStartDate = hocKyInfo.recordset[0]?.Ngaybatdau;
       if (!semesterStartDate) return;

       const tkbResult = await request.query(`
           SELECT t.Ngay, t.Tiet, t.Sotiet, p.Tenphong 
           FROM TKB t
           JOIN Phonghoc p ON t.MaPH = p.MaPH
           WHERE t.MaLHP = @MaLHP AND t.Hieuluc = 1 
           ORDER BY t.Ngay, t.Tiet
       `);

       if (tkbResult.recordset.length === 0) {
           await request.query(`UPDATE LopHP SET TKB = NULL, Tuanhoc = NULL WHERE MaLHP = @MaLHP`);
           return;
       }

       const allWeeks = new Set();
       const tkbSummaryParts = [];

       tkbResult.recordset.forEach(entry => {
           const weekNumber = Math.floor(moment(entry.Ngay).diff(moment(semesterStartDate), 'days') / 7) + 1;
           allWeeks.add(weekNumber);
           
           const endTiet = entry.Tiet + entry.Sotiet - 1;
           const tkbPart = `T${weekNumber}(${entry.Tiet}-${endTiet})${entry.Tenphong}`;
           tkbSummaryParts.push(tkbPart);
       });

       const tkbString = tkbSummaryParts.join(', ');

       const sortedWeeks = Array.from(allWeeks).sort((a, b) => a - b);
       let tuanHocString = '';
       if (sortedWeeks.length > 0) {
           const ranges = [];
           let start = sortedWeeks[0];
           let end = sortedWeeks[0];
           for (let i = 1; i < sortedWeeks.length; i++) {
               if (sortedWeeks[i] === end + 1) {
                   end = sortedWeeks[i];
               } else {
                   ranges.push(start === end ? `${start}` : `${start}-${end}`);
                   start = sortedWeeks[i];
                   end = sortedWeeks[i];
               }
           }
           ranges.push(start === end ? `${start}` : `${start}-${end}`);
           tuanHocString = ranges.join(',');
       }

       const updateRequest = new sql.Request(pool);
       updateRequest.input('MaLHP', sql.NVarChar, MaLHP);
       updateRequest.input('TKB', sql.NVarChar, tkbString);
       updateRequest.input('Tuanhoc', sql.NVarChar, tuanHocString);
       await updateRequest.query(`UPDATE LopHP SET TKB = @TKB, Tuanhoc = @Tuanhoc WHERE MaLHP = @MaLHP`);

   } catch (error) {
       console.error(`Lỗi khi cập nhật TKB/Tuanhoc cho MaLHP ${MaLHP}:`, error);
   }
};

const writeLog1 = async (pool, MaUser, Cuaso, Congviec, Ghichu) => {
   try {
       const logRequest = new sql.Request(pool);
       // Lấy thời gian hiện tại theo múi giờ Việt Nam
        const thoigianVN = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');

       logRequest.input('Thoigian', sql.DateTime, thoigianVN);
       logRequest.input('MaUser', sql.NVarChar, MaUser);
       logRequest.input('Cuaso', sql.NVarChar, Cuaso);
       logRequest.input('Congviec', sql.NVarChar, Congviec);
       logRequest.input('Ghichu', sql.NVarChar, Ghichu);
       await logRequest.query(`
           INSERT INTO db_LogWebapp (Thoigian, MaUser, Cuaso, Congviec, Ghichu)
           VALUES (@Thoigian, @MaUser, @Cuaso, @Congviec, @Ghichu)
       `);
   } catch (error) {
       console.error("!!! Lỗi khi ghi nhật ký:", error);
   }
};

const validateTkbEntry = async (pool, entryData, mode) => {
   const { MaLHP, Ngay, MaGV, MaPH, originalData } = entryData;
   const Tiet = parseInt(entryData.Tiet, 10);
   const Sotiet = parseInt(entryData.Sotiet, 10);

   if (isNaN(Tiet) || isNaN(Sotiet)) {
       return { isValid: false, message: 'Tiết và Số tiết phải là giá trị số hợp lệ.' };
   }

   const tietEnd = Tiet + Sotiet - 1;

   if ((Tiet <= 6 && tietEnd > 6) || (Tiet > 6 && tietEnd > 12)) {
       return { isValid: false, message: 'Số tiết không được xếp qua các buổi (Sáng/Chiều).' };
   }

   const request = new sql.Request(pool);
   request.input('MaLHP', sql.NVarChar, MaLHP);
   request.input('Ngay', sql.Date, Ngay);
   request.input('TietStart', sql.Int, Tiet);
   request.input('TietEnd', sql.Int, tietEnd);
   request.input('MaGV', sql.NVarChar, MaGV);
   request.input('MaPH', sql.NVarChar, MaPH);
   
   // BỔ SUNG: Lấy Tenlop để kiểm tra xung đột
    const tenlopResult = await request.query(`SELECT Tenlop FROM LopHP WHERE MaLHP = @MaLHP`);
    if (tenlopResult.recordset.length === 0) {
        return { isValid: false, message: 'Không tìm thấy lớp học phần.' };
    }
    const tenlop = tenlopResult.recordset[0].Tenlop;
    request.input('Tenlop', sql.NVarChar, tenlop);

   const tongTietResult = await request.query(`
       SELECT lhp.Tongsotiet, (SELECT ISNULL(SUM(Sotiet), 0) FROM TKB WHERE MaLHP = @MaLHP AND Hieuluc = 1) as DaXep
       FROM LopHP lhp WHERE lhp.MaLHP = @MaLHP
   `);

   let soTietDaXep = tongTietResult.recordset[0]?.DaXep || 0;
   const tongSoTietLHP = tongTietResult.recordset[0]?.Tongsotiet || 0;

   if (mode === 'edit') {
       soTietDaXep -= (parseInt(originalData.Sotiet, 10) || 0);
   }

   if (soTietDaXep + Sotiet > tongSoTietLHP) {
       return { isValid: false, message: `Tổng số tiết (${soTietDaXep + Sotiet}) vượt quá tổng số tiết của lớp học phần (${tongSoTietLHP}).` };
   }
   
   let excludeCondition = '';
   if (mode === 'edit') {
       request.input('OriginalNgay', sql.Date, originalData.Ngay);
       request.input('OriginalTiet', sql.Int, originalData.Tiet);
       excludeCondition = 'AND NOT (TKB.MaLHP = @MaLHP AND TKB.Ngay = @OriginalNgay AND TKB.Tiet = @OriginalTiet)';
   }

   // CẬP NHẬT: Bổ sung UNION ALL để kiểm tra xung đột Tên lớp
   const conflictResult = await request.query(`
       SELECT 'GV' as Type, (gv.Holot + N' ' + gv.Ten) as Name, lhp.Tenlop
       FROM TKB JOIN Giaovien gv ON TKB.MaGV = gv.MaGV JOIN LopHP lhp ON TKB.MaLHP = lhp.MaLHP
       WHERE TKB.Ngay = @Ngay AND TKB.Tiet <= @TietEnd AND (TKB.Tiet + TKB.Sotiet - 1) >= @TietStart AND TKB.MaGV = @MaGV AND TKB.Hieuluc = 1 ${excludeCondition}
       UNION ALL
       SELECT 'PH' as Type, ph.Tenphong as Name, lhp.Tenlop
       FROM TKB JOIN Phonghoc ph ON TKB.MaPH = ph.MaPH JOIN LopHP lhp ON TKB.MaLHP = lhp.MaLHP
       WHERE TKB.Ngay = @Ngay AND TKB.Tiet <= @TietEnd AND (TKB.Tiet + TKB.Sotiet - 1) >= @TietStart AND TKB.MaPH = @MaPH AND TKB.Hieuluc = 1 ${excludeCondition}
       UNION ALL
       SELECT 'LOP' as Type, lhp_conflict.Tenlop as Name, lhp_conflict.Tenlop
       FROM TKB
       JOIN LopHP lhp_conflict ON TKB.MaLHP = lhp_conflict.MaLHP
       WHERE TKB.Ngay = @Ngay AND TKB.Tiet <= @TietEnd AND (TKB.Tiet + TKB.Sotiet - 1) >= @TietStart
       AND lhp_conflict.Tenlop = @Tenlop
       AND TKB.MaLHP <> @MaLHP
       AND TKB.Hieuluc = 1 ${excludeCondition}
   `);

   if (conflictResult.recordset.length > 0) {
       const gvConflict = conflictResult.recordset.find(c => c.Type === 'GV');
       const phConflict = conflictResult.recordset.find(c => c.Type === 'PH');
       const lopConflict = conflictResult.recordset.find(c => c.Type === 'LOP');
       let message = 'Xung đột lịch: ';
       if (gvConflict) message += `Giảng viên [${gvConflict.Name}] đã có lịch dạy lớp [${gvConflict.Tenlop}]. `;
       if (phConflict) message += `Phòng [${phConflict.Name}] đã được lớp [${phConflict.Tenlop}] sử dụng. `;
       if (lopConflict) message += `Lớp [${lopConflict.Name}] đã có lịch học khác cùng thời điểm.`;
       return { isValid: false, message: message.trim() };
   }

   return { isValid: true, message: 'Hợp lệ' };
};


function calculateWeeksFromSemester(startDate, endDate) {
  const weeks = [];
  let current = moment(startDate).tz('Asia/Ho_Chi_Minh').startOf('isoWeek');
  let weekNumber = 1;

  while (current.isSameOrBefore(moment(endDate).tz('Asia/Ho_Chi_Minh'))) {
      const weekStart = current.clone();
      const weekEnd = current.clone().endOf('isoWeek');
      weeks.push({
          week: weekNumber,
          label: `Tuần ${weekNumber}: ${weekStart.format('DD/MM/YYYY')} - ${weekEnd.format('DD/MM/YYYY')}`,
          value: `${weekStart.format('YYYY-MM-DD')}_${weekEnd.format('YYYY-MM-DD')}`
      });
      current.add(1, 'week');
      weekNumber++;
  }
  return weeks;
}


module.exports = function(poolPromise) {
   const router = express.Router();

    // BỔ SUNG: API lấy danh sách học kỳ và xác định học kỳ mặc định
    router.get('/semesters', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT MaHK, Hocky, Ngaybatdau, Ngayketthuc
                FROM Hocky
                WHERE Sotuan > 0 
                ORDER BY MaHK DESC
            `);

            const semesters = result.recordset;
            let defaultSemesterId = null;

            if (semesters.length > 0) {
                const now = moment().tz('Asia/Ho_Chi_Minh');
                const currentSemester = semesters.find(s => 
                    s.Ngaybatdau && s.Ngayketthuc && now.isBetween(moment(s.Ngaybatdau), moment(s.Ngayketthuc), null, '[]')
                );

                if (currentSemester) {
                    defaultSemesterId = currentSemester.MaHK;
                } else {
                    const futureSemesters = semesters
                        .map(s => ({
                            ...s,
                            diff: Math.abs(moment(s.Ngaybatdau).diff(now))
                        }))
                        .sort((a, b) => a.diff - b.diff);

                    if (futureSemesters.length > 0) {
                        defaultSemesterId = futureSemesters[0].MaHK;
                    }
                }
            }
            
            if (!defaultSemesterId && semesters.length > 0) {
                defaultSemesterId = semesters[0].MaHK;
            }

            res.json({
                semesters: semesters.map(s => ({ MaHK: s.MaHK, Hocky: s.Hocky })),
                defaultSemester: defaultSemesterId
            });

        } catch (err) {
            console.error("Get Semesters for Builder Error:", err);
            res.status(500).send('Server error when fetching semesters for builder.');
        }
    });

   router.get('/donvi', async (req, res) => {
       try {
           const pool = await poolPromise;
           const result = await pool.request().query(`SELECT MaDV, Donvi FROM Donvi WHERE Daotao = 1 ORDER BY Donvi`);
           res.json(result.recordset);
       } catch (err) {
           res.status(500).json({ message: "Lỗi server khi lấy danh sách đơn vị." });
       }
   });

   router.get('/hocphan', async (req, res) => {
       const { maDV, maHK } = req.query;
       if (!maDV || !maHK) return res.status(400).json({ message: "Thiếu mã đơn vị hoặc mã học kỳ." });
       try {
           const pool = await poolPromise;
           const result = await pool.request()
               .input('MaDV', sql.NVarChar, maDV)
               .input('MaHK', sql.NVarChar, maHK)
               .query(`SELECT DISTINCT hp.MaHP, hp.Hocphan FROM Hocphan hp JOIN LopHP lhp ON hp.MaHP = lhp.MaHP WHERE lhp.MaDV = @MaDV AND lhp.MaHK = @MaHK ORDER BY hp.Hocphan`);
           res.json(result.recordset);
       } catch (err) {
           res.status(500).json({ message: "Lỗi server khi lấy danh sách học phần." });
       }
   });

   router.get('/lophp', async (req, res) => {
       const { maHP, maHK, maDV } = req.query;
       if (!maHP || !maHK || !maDV) return res.status(400).json({ message: "Thiếu mã học phần, mã học kỳ, hoặc mã đơn vị." });
       try {
           const pool = await poolPromise;
           const result = await pool.request()
               .input('MaHP', sql.NVarChar, maHP)
               .input('MaHK', sql.NVarChar, maHK)
               .input('MaDV', sql.NVarChar, maDV)
               .query(`SELECT MaLHP, Tenlop, MaGV, Tongsotiet FROM LopHP WHERE MaHP = @MaHP AND MaHK = @MaHK AND MaDV = @MaDV ORDER BY Tenlop`);
           res.json(result.recordset);
       } catch (err) {
           res.status(500).json({ message: "Lỗi server khi lấy danh sách lớp học phần." });
       }
   });

   router.get('/weeks-by-semester', async (req, res) => {
       const { mahk } = req.query;
       if (!mahk) {
           return res.status(400).json({ message: 'Vui lòng cung cấp Mã học kỳ (mahk).' });
       }
       try {
           const pool = await poolPromise;
           const result = await pool.request()
               .input('mahk', sql.NVarChar, mahk)
               .query(`SELECT Ngaybatdau, Ngayketthuc FROM Hocky WHERE MaHK = @mahk`);

           if (result.recordset.length === 0) {
               return res.status(404).json({ message: 'Không tìm thấy thông tin cho học kỳ đã chọn.' });
           }
           const { Ngaybatdau, Ngayketthuc } = result.recordset[0];
           if (!Ngaybatdau || !Ngayketthuc) return res.json([]);
           
           res.json(calculateWeeksFromSemester(Ngaybatdau, Ngayketthuc));
       } catch (err) {
           res.status(500).json({ message: 'Lỗi server khi lấy danh sách tuần.' });
       }
   });

   router.get('/tkb-data', async (req, res) => {
       const { maGV, tenlop, maLHP, startDate, endDate } = req.query;
       if (!tenlop || !maLHP || !startDate || !endDate) {
           return res.status(400).json({ message: 'Thiếu thông tin Tên lớp, Mã LHP hoặc ngày.' });
       }
       try {
           const pool = await poolPromise;
           const request = pool.request();
           
           request.input('Tenlop', sql.NVarChar, tenlop);
           request.input('MaLHP', sql.NVarChar, maLHP);
           request.input('StartDate', sql.Date, startDate);
           request.input('EndDate', sql.Date, endDate);

           let orConditions = ["(lhp.Tenlop = @Tenlop AND lhp.MaLHP <> @MaLHP)"];
           if (maGV && maGV !== 'null' && maGV !== 'undefined') {
               request.input('MaGV', sql.NVarChar, maGV);
               orConditions.push("t.MaGV = @MaGV");
           }
           orConditions.push("t.MaLHP = @MaLHP"); 

           const query = `
               SELECT 
                   t.MaLHP, t.Ngay, t.Tiet, t.Sotiet, t.Ghichu, t.MaGV, t.MaPH,
                   ISNULL(gv.Holot + N' ' + gv.Ten, 'N/A') as HoTenGV,
                   ph.Tenphong,
                   hp.Viettat as TenHP,
                   lhp.Tenlop,
                   lhp.Tongsotiet,
                   (SELECT SUM(ISNULL(Sotiet, 0)) FROM TKB WHERE MaLHP = t.MaLHP AND Hieuluc = 1) as SoTietTichLuy
               FROM TKB t
               JOIN LopHP lhp ON t.MaLHP = lhp.MaLHP
               JOIN Hocphan hp ON lhp.MaHP = hp.MaHP
               LEFT JOIN Giaovien gv ON t.MaGV = gv.MaGV
               JOIN Phonghoc ph ON t.MaPH = ph.MaPH
               WHERE t.Ngay BETWEEN @StartDate AND @EndDate AND t.Hieuluc = 1
               AND (${orConditions.join(' OR ')})
           `;

           const result = await request.query(query);
           res.json(result.recordset);
       } catch (err) {
           console.error(err);
           res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu TKB.' });
       }
   });
   
   router.get('/resources', async (req, res) => {
       const { ngay, tietStart, soTiet, excludeMaLHP, excludeTiet } = req.query;
       if (!ngay || !tietStart || !soTiet) return res.status(400).json({ message: 'Thiếu thông tin ngày/tiết để kiểm tra phòng trống.' });
       
       const tietEnd = parseInt(tietStart, 10) + parseInt(soTiet, 10) - 1;

       try {
           const pool = await poolPromise;
           const request = new sql.Request(pool);
           request.input('Ngay', sql.Date, ngay);
           request.input('TietStart', sql.Int, tietStart);
           request.input('TietEnd', sql.Int, tietEnd);
           
           let excludeCondition = '';
           if (excludeMaLHP && excludeTiet) {
               request.input('ExcludeMaLHP', sql.NVarChar, excludeMaLHP);
               request.input('ExcludeTiet', sql.Int, excludeTiet);
               excludeCondition = 'AND NOT (TKB.MaLHP = @ExcludeMaLHP AND TKB.Ngay = @Ngay AND TKB.Tiet = @ExcludeTiet)';
           }

           const [teachersResult, roomsResult] = await Promise.all([
               pool.request().query(`SELECT MaGV, Holot + N' ' + Ten as HoTen FROM Giaovien ORDER BY Ten, Holot`),
               request.query(`
                   SELECT MaPH, Tenphong FROM Phonghoc 
                   WHERE MaPH NOT IN (
                       SELECT MaPH FROM TKB WHERE Ngay = @Ngay AND Tiet <= @TietEnd AND (Tiet + Sotiet - 1) >= @TietStart AND Hieuluc = 1 ${excludeCondition}
                   ) ORDER BY Tenphong
               `)
           ]);
           res.json({ teachers: teachersResult.recordset, rooms: roomsResult.recordset });
       } catch (err) {
           res.status(500).json({ message: "Lỗi server khi lấy tài nguyên." });
       }
   });

   // --- POST/PUT/DELETE APIs ---

   const handleSaveRequest = async (req, res, mode) => {
       const MaUser = req.user.maso;
       const entryData = req.body;
       const pool = await poolPromise;
       try {
           const validation = await validateTkbEntry(pool, entryData, mode);
           if (!validation.isValid) {
               return res.status(400).json({ message: validation.message });
           }

           const request = new sql.Request(pool);
           request.input('MaLHP', sql.NVarChar, entryData.MaLHP).input('Ngay', sql.Date, entryData.Ngay).input('Tiet', sql.Int, entryData.Tiet).input('Sotiet', sql.Int, entryData.Sotiet).input('MaPH', sql.NVarChar, entryData.MaPH).input('MaGV', sql.NVarChar, entryData.MaGV).input('Ghichu', sql.NVarChar, entryData.Ghichu);

           if (mode === 'add') {
               await request.query(`INSERT INTO TKB (MaLHP, Ngay, Tiet, Sotiet, MaPH, MaGV, Ghichu, Hieuluc) VALUES (@MaLHP, @Ngay, @Tiet, @Sotiet, @MaPH, @MaGV, @Ghichu, 1)`);
           } else {
               request.input('OriginalNgay', sql.Date, entryData.originalData.Ngay).input('OriginalTiet', sql.Int, entryData.originalData.Tiet);
               await request.query(`UPDATE TKB SET Ngay = @Ngay, Tiet = @Tiet, Sotiet = @Sotiet, MaPH = @MaPH, MaGV = @MaGV, Ghichu = @Ghichu WHERE MaLHP = @MaLHP AND Ngay = @OriginalNgay AND Tiet = @OriginalTiet`);
           }

           await updateLopHPSummary(pool, entryData.MaLHP);
           const buoi = parseInt(entryData.Tiet, 10) <= 6 ? 'Sáng' : 'Chiều';
           const logInfoResult = await request.query(`SELECT lhp.Tenlop, hp.Viettat, ISNULL(gv.Holot + N' ' + gv.Ten, 'N/A') as HoTenGV, ph.Tenphong FROM LopHP lhp JOIN Hocphan hp ON lhp.MaHP = hp.MaHP LEFT JOIN Giaovien gv ON gv.MaGV = @MaGV JOIN Phonghoc ph ON ph.MaPH = @MaPH WHERE lhp.MaLHP = @MaLHP`);
           const { Tenlop, Viettat, HoTenGV, Tenphong } = logInfoResult.recordset[0];
           const ghichuLog = `TKB: ${moment(entryData.Ngay).format('DD/MM/YYYY')} (${buoi}), ${Tenlop} (${entryData.Sotiet} tiết), ${Viettat}, ${HoTenGV}, ${Tenphong}`;
           const cuaso = mode === 'add' ? 'Thêm Lịch học' : 'Sửa Lịch học';
           await writeLog1(pool, MaUser, 'Xây dựng TKB', cuaso, ghichuLog);

           res.status(mode === 'add' ? 201 : 200).json({ message: 'Lưu thành công!' });
       } catch (err) {
           res.status(500).json({ message: 'Lưu thất bại do lỗi server.' });
       }
   };

   router.post('/tkb', (req, res) => handleSaveRequest(req, res, 'add'));
   router.put('/tkb', (req, res) => handleSaveRequest(req, res, 'edit'));

   router.post('/tkb/batch', async (req, res) => {
       const MaUser = req.user.maso;
       const { MaLHP, entries } = req.body;
       if (!MaLHP || !Array.isArray(entries) || entries.length === 0) {
           return res.status(400).json({ message: "Dữ liệu dán không hợp lệ." });
       }

       const pool = await poolPromise;
       const transaction = new sql.Transaction(pool);
       try {
           await transaction.begin();
           
           const lhpInfoReq = new sql.Request(transaction);
           lhpInfoReq.input('MaLHP', sql.NVarChar, MaLHP);
           const lhpInfo = await lhpInfoReq.query(`SELECT Tongsotiet, (SELECT ISNULL(SUM(Sotiet), 0) FROM TKB WHERE MaLHP = @MaLHP AND Hieuluc = 1) as DaXep FROM LopHP WHERE MaLHP = @MaLHP`);
           
           const { Tongsotiet, DaXep } = lhpInfo.recordset[0];
           const pastedHours = entries.reduce((sum, entry) => sum + entry.Sotiet, 0);

           if (DaXep + pastedHours > Tongsotiet) {
               await transaction.rollback();
               return res.status(400).json({ message: `Dán thất bại: Tổng số tiết (${DaXep + pastedHours}) sẽ vượt quá giới hạn (${Tongsotiet}) của lớp.` });
           }

           for (const entry of entries) {
               const validation = await validateTkbEntry(pool, { ...entry, MaLHP }, 'add');
               if (!validation.isValid) {
                   await transaction.rollback();
                   return res.status(400).json({ message: `Dán thất bại: Xung đột lịch tại ngày ${moment(entry.Ngay).format('DD/MM')}. ${validation.message}` });
               }
           }

           for (const entry of entries) {
               const insertReq = new sql.Request(transaction);
               insertReq.input('MaLHP', sql.NVarChar, MaLHP).input('Ngay', sql.Date, entry.Ngay).input('Tiet', sql.Int, entry.Tiet).input('Sotiet', sql.Int, entry.Sotiet).input('MaPH', sql.NVarChar, entry.MaPH).input('MaGV', sql.NVarChar, entry.MaGV).input('Ghichu', sql.NVarChar, entry.Ghichu);
               await insertReq.query(`INSERT INTO TKB (MaLHP, Ngay, Tiet, Sotiet, MaPH, MaGV, Ghichu, Hieuluc) VALUES (@MaLHP, @Ngay, @Tiet, @Sotiet, @MaPH, @MaGV, @Ghichu, 1)`);
           }

           await transaction.commit();
           
           await updateLopHPSummary(pool, MaLHP);
           const logInfoReq = new sql.Request(pool);
           logInfoReq.input('MaLHP', sql.NVarChar, MaLHP);
           const logInfo = await logInfoReq.query(`SELECT Tenlop FROM LopHP WHERE MaLHP = @MaLHP`);
           const ghichuLog = `Dán ${entries.length} buổi học cho lớp ${logInfo.recordset[0].Tenlop}.`;
           await writeLog1(pool, MaUser, 'Xây dựng TKB', 'Dán TKB', ghichuLog);

           res.status(201).json({ message: 'Dán lịch học thành công!' });

       } catch (err) {
           await transaction.rollback();
           console.error("Batch Paste TKB Error:", err);
           res.status(500).json({ message: 'Dán lịch học thất bại do lỗi server.' });
       }
   });

   router.delete('/tkb', async (req, res) => {
       const { MaLHP, Ngay, Tiet } = req.body;
       const MaUser = req.user.maso;
       const pool = await poolPromise;
       try {
           const request = new sql.Request(pool);
           request.input('MaLHP', sql.NVarChar, MaLHP).input('Ngay', sql.Date, Ngay).input('Tiet', sql.Int, Tiet);
           
           const logInfoResult = await request.query(`SELECT TKB.Sotiet, lhp.Tenlop, hp.Viettat, ISNULL(gv.Holot + N' ' + gv.Ten, 'N/A') as HoTenGV, ph.Tenphong FROM TKB JOIN LopHP lhp ON TKB.MaLHP = lhp.MaLHP JOIN Hocphan hp ON lhp.MaHP = hp.MaHP LEFT JOIN Giaovien gv ON TKB.MaGV = gv.MaGV JOIN Phonghoc ph ON TKB.MaPH = ph.MaPH WHERE TKB.MaLHP = @MaLHP AND TKB.Ngay = @Ngay AND TKB.Tiet = @Tiet`);
           if (logInfoResult.recordset.length > 0) {
               const { Sotiet, Tenlop, Viettat, HoTenGV, Tenphong } = logInfoResult.recordset[0];
               const buoi = parseInt(Tiet, 10) <= 6 ? 'Sáng' : 'Chiều';
               const ghichuLog = `TKB: ${moment(Ngay).format('DD/MM/YYYY')} (${buoi}), ${Tenlop} (${Sotiet} tiết), ${Viettat}, ${HoTenGV}, ${Tenphong}`;
               
               await request.query(`DELETE FROM TKB WHERE MaLHP = @MaLHP AND Ngay = @Ngay AND Tiet = @Tiet`);
               await writeLog1(pool, MaUser, 'Xây dựng TKB', 'Xóa TKB', ghichuLog);
               await updateLopHPSummary(pool, MaLHP);
           } else {
               await request.query(`DELETE FROM TKB WHERE MaLHP = @MaLHP AND Ngay = @Ngay AND Tiet = @Tiet`);
               await updateLopHPSummary(pool, MaLHP);
           }
           
           res.status(200).json({ message: 'Xóa buổi học thành công!' });
       } catch (err) {
           res.status(500).json({ message: 'Xóa buổi học thất bại do lỗi server.' });
       }
   });

    // BỔ SUNG: API xuất TKB của đơn vị ra Excel
    router.get('/export', async (req, res) => {
        const { maDV, startDate, endDate } = req.query;
        if (!maDV || !startDate || !endDate) {
            return res.status(400).json({ message: 'Thiếu thông tin Đơn vị hoặc Tuần để xuất file.' });
        }

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaDV', sql.NVarChar, maDV);
            request.input('StartDate', sql.Date, startDate);
            request.input('EndDate', sql.Date, endDate);

            const result = await request.query(`
                SELECT
                    dv.Donvi AS N'Đơn vị',
                    t.Ngay AS N'Ngày dạy',
                    CASE 
                        WHEN t.Tiet <= 6 THEN N'Sáng'
                        ELSE N'Chiều'
                    END AS N'Buổi',
                    t.Sotiet AS N'Số tiết',
                    lhp.Tenlop AS N'Tên lớp HP',
                    hp.Viettat AS N'Tên học phần',
                    ISNULL(gv.Holot + N' ' + gv.Ten, 'N/A') AS N'Họ tên giảng viên',
                    ph.Tenphong AS N'Tên phòng dạy',
                    t.Ghichu AS N'Ghi chú'
                FROM TKB t
                JOIN LopHP lhp ON t.MaLHP = lhp.MaLHP
                JOIN Donvi dv ON lhp.MaDV = dv.MaDV
                JOIN Hocphan hp ON lhp.MaHP = hp.MaHP
                LEFT JOIN Giaovien gv ON t.MaGV = gv.MaGV
                JOIN Phonghoc ph ON t.MaPH = ph.MaPH
                WHERE lhp.MaDV = @MaDV
                  AND t.Ngay BETWEEN @StartDate AND @EndDate
                  AND t.Hieuluc = 1
                ORDER BY
                    [Ngày dạy] ASC,
                    CASE WHEN t.Tiet <= 6 THEN 1 ELSE 2 END ASC, -- Sáng (1) trước Chiều (2)
                    [Tên lớp HP] ASC;
            `);

            // Định dạng lại ngày trước khi gửi về client
            const formattedData = result.recordset.map(row => ({
                ...row,
                'Ngày dạy': moment(row['Ngày dạy']).format('DD/MM/YYYY')
            }));

            res.json(formattedData);

        } catch (err) {
            console.error("Export TKB Error:", err);
            res.status(500).json({ message: "Lỗi server khi xuất dữ liệu TKB." });
        }
    });

   return router;
};
