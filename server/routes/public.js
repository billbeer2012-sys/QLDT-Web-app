/*
* Đường dẫn file: D:\QLDT-app\server\routes\public.js
* Thời gian cập nhật: 13/09/2025


*/
const express = require('express');
const sql = require('mssql');
const moment = require('moment-timezone');

// --- BỔ SUNG: Hàm tiện ích để loại bỏ dấu tiếng Việt ---
function removeDiacritics(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

// --- Hàm hỗ trợ cho TKB ---
function calculateWeeks(startDate, endDate) {
   const weeks = [];
   let current = moment(startDate).tz('Asia/Ho_Chi_Minh').startOf('isoWeek');
   let weekNumber = 1;

   while (current.isBefore(moment(endDate).tz('Asia/Ho_Chi_Minh'))) {
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

	// --- BỔ SUNG API MỚI: Tra cứu học phí sinh viên ---
    router.get('/search-tuition', async (req, res) => {
        const searchTerm = req.query.searchTerm || '';
        if (!searchTerm) {
            return res.status(400).json({ error: 'Vui lòng nhập Mã số sinh viên hoặc Số CCCD.' });
        }

        try {
            const pool = await poolPromise;
            
            // Lấy học kỳ mới nhất có thông báo học phí
            const latestHkResult = await pool.request().query('SELECT TOP 1 MaHK FROM db_ThongbaoHocphiHK ORDER BY MaHK DESC');
            if (latestHkResult.recordset.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy thông tin học phí cho học kỳ hiện tại.' });
            }
            const latestMaHK = latestHkResult.recordset[0].MaHK;

            const request = new sql.Request(pool);
            request.input('searchTerm', sql.NVarChar, searchTerm);
            request.input('latestMaHK', sql.NVarChar, latestMaHK);

            const query = `
                SELECT
                    sv.Maso, sv.Holot, sv.Ten, sv.Noisinh, sv.SoCMND,
                    '20' + SUBSTRING(l.MaL, 2, 2) AS KhoaHoc,
                    ng.Dacdiem AS NganhHoc, ng.BacDTHienthi AS BacDaoTao, l.Tenlop,
                    hp.HocphiQD, hp.Miengiam, hp.Phainop,
                    ISNULL(dn.DaNop, 0) AS DaNop,
                    tb.Ngayketthuc AS HanNop,
                    tb.SoTB, tb.NgayTB,
                    hk.Hocky,
                    ba.BankID, ba.AccountNo, ba.AccountName, ba.BankName
                FROM Sinhvien sv
                JOIN Lop l ON sv.MaL = l.MaL
                JOIN Nganhhoc ng ON l.MaNG = ng.MaNG
                JOIN db_SinhvienHocphiHK hp ON sv.MaSV = hp.MaSV
                JOIN db_ThongbaoHocphiHK tb ON hp.MaHK = tb.MaHK
                JOIN Hocky hk ON tb.MaHK = hk.MaHK
                LEFT JOIN db_BankAccountNo ba ON tb.BankID = ba.BankID
                LEFT JOIN (
                    SELECT MaSV, MaHK, SUM(Sotienthu) as DaNop
                    FROM Hocphi
                    WHERE MaKT = '555'
                    GROUP BY MaSV, MaHK
                ) dn ON sv.MaSV = dn.MaSV AND hp.MaHK = dn.MaHK
                WHERE
                    (sv.Maso = @searchTerm OR sv.SoCMND = @searchTerm)
                    AND hp.MaKT = '555'
                    AND hp.MaHK = @latestMaHK;
            `;
            
            const result = await request.query(query);

            if (result.recordset.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy thông tin học phí của sinh viên này cho học kỳ hiện tại.' });
            }

            const data = result.recordset[0];
            const conLai = data.Phainop - data.DaNop;
            const hoTenKhongDau = removeDiacritics(`${data.Holot} ${data.Ten}`);
            const hocKyKhongDau = removeDiacritics(data.Hocky);

            const responseData = {
                // Personal Info
                maso: data.Maso,
                hoTen: `${data.Holot} ${data.Ten}`,
                noiSinh: data.Noisinh,
                khoaHoc: data.KhoaHoc,
                nganhHoc: data.NganhHoc,
                bacDaoTao: data.BacDaoTao,
                tenLop: data.Tenlop,
                imageUrl: `https://camauvkc.edu.vn/Images/HinhSV/${data.Maso}.jpg`,
                // Fee Info
                hocKy: data.Hocky,
                soThongBao: data.SoTB,
                ngayThongBao: data.NgayTB ? moment(data.NgayTB).format('DD/MM/YYYY') : 'N/A',
                hanNop: data.HanNop ? moment(data.HanNop).format('DD/MM/YYYY') : 'N/A',
                hocPhiQD: data.HocphiQD || 0,
                mienGiam: data.Miengiam || 0,
                phaiNop: data.Phainop || 0,
                daNop: data.DaNop || 0,
                conLai: conLai,
                // Payment Info
                isOverdue: data.HanNop ? moment(data.HanNop).isBefore(moment().startOf('day')) : false,
                bankInfo: {
                    bankId: data.BankID,
                    accountNo: data.AccountNo,
                    accountName: data.AccountName,
                    bankName: data.BankName,
                    qrAccountName: data.AccountName ? data.AccountName.replace(/ /g, '%20') : '',
                    qrContent: `${data.Maso}%20${hoTenKhongDau.replace(/ /g, '%20')}%20Hp%20${hocKyKhongDau.replace(/ /g, '%20')}`
                },
                // Raw content for display
                noiDungChuyenKhoan: `${data.Maso}-${hoTenKhongDau}-Hp ${data.Hocky}`
            };

            res.json(responseData);

        } catch (err) {
            console.error('Lỗi truy vấn tra cứu học phí:', err);
            res.status(500).json({ error: 'Lỗi server khi truy vấn dữ liệu.' });
        }
    });

    
    // --- API: Tra cứu thông tin thí sinh xét tuyển (giữ nguyên) ---
    router.get('/search', async (req, res) => {
        const searchTerm = req.query.searchTerm || '';

        if (!searchTerm) {
            return res.status(400).json({ error: 'Vui lòng nhập thông tin tìm kiếm (Mã thí sinh hoặc họ tên hoặc CCCD).' });
        }

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            
            let query = `
                SELECT 
                    ts.MaTSXT, ts.Maso, ts.Holot, ts.Ten, 
                    ts.Ngaysinh, ts.Noisinh, ts.Gioitinh, ts.SoCMND,
                    dtcs.DTCS, 
                    kv.Khuvuc, 
                    ts.DiemUT, ts.TongDXT, ts.Trungtuyen, 
                    dxt.DotXT, dxt.NgayXetTuyen, 
                    ng.Dacdiem AS NganhNghe, ng.BacDTHienthi AS TrinhDo,
                    (SELECT DiemUT FROM DTCS WHERE MaDTCS = ts.MaDTCS) as UTDT,
                    (SELECT DiemUT FROM Khuvuc WHERE MaKV = ts.MaKV) as UTKV
                FROM ThisinhXT ts
                LEFT JOIN DotXT dxt ON ts.MaDXT = dxt.MaDXT
                LEFT JOIN Nganhhoc ng ON ts.MaNG = ng.MaNG
                LEFT JOIN DTCS dtcs ON ts.MaDTCS = dtcs.MaDTCS
                LEFT JOIN Khuvuc kv ON ts.MaKV = kv.MaKV        
                WHERE (
                    ts.Maso = @SearchTermAsMaSo OR ts.SoCMND = @SearchTermAsCMND OR
                    LOWER(CONCAT(ts.Holot, N' ', ts.Ten)) LIKE LOWER(@SearchTermAsHoTen)
                )
            `;  
                    
            request.input('SearchTermAsMaSo', sql.NVarChar, searchTerm);
			request.input('SearchTermAsCMND', sql.NVarChar, searchTerm);
            request.input('SearchTermAsHoTen', sql.NVarChar, `%${searchTerm.trim()}%`);

            const result = await request.query(query);

            if (result.recordset.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy thông tin phù hợp. Hãy kiểm tra dữ liệu cần tìm!' });
            }
            
            const maTSXT = result.recordset[0].MaTSXT;

            const nguyenVongQuery = `
                SELECT 
                    nv.MaNVXT, nv.MaNG,
                    nv.TongDXT, nv.Trungtuyen,
                    ng.Dacdiem AS NganhNghe, ng.BacDTHienthi AS TrinhDo
                FROM ThisinhXTNguyenvongXT nv
                INNER JOIN Nganhhoc ng ON nv.MaNG = ng.MaNG
                WHERE nv.MaTSXT = @MaTSXT
                ORDER BY nv.MaNVXT
            `;
            const nguyenVongResult = await new sql.Request(pool).input('MaTSXT', sql.NVarChar, maTSXT).query(nguyenVongQuery);  
                    
            const monXetTuyenQuery = `
                SELECT 
                    mxt.MonXT, ts_mxt.Diem
                FROM ThisinhXTMonXT ts_mxt
                INNER JOIN MonXT mxt ON ts_mxt.MaMXT = mxt.MaMXT
                WHERE ts_mxt.MaTSXT = @MaTSXT
            `;  
            const monXetTuyenResult = await new sql.Request(pool).input('MaTSXT', sql.NVarChar, maTSXT).query(monXetTuyenQuery);  

            const formattedData = result.recordset.map(item => ({
                MaSo: item.Maso,
                HoTen: `${item.Holot} ${item.Ten}`,
                GioiTinh: item.Gioitinh ? 'Nữ' : 'Nam',
                NgaySinh: moment(item.Ngaysinh).format('DD/MM/YYYY'),
                NoiSinh: item.Noisinh,
                DTCS: `${item.DTCS} (Đ.ƯT: ${item.UTDT || 0})`,
                MaKV: `${item.Khuvuc} (Đ.ƯT: ${item.UTKV || 0})`,
                TongDUT: parseFloat((item.UTDT || 0) + (item.UTKV || 0)).toFixed(2),
                DiemUT: parseFloat(item.DiemUT || 0).toFixed(2),
                TongDXT: parseFloat(item.TongDXT || 0).toFixed(2),
                DotXT: item.DotXT,
                NgayXetTuyen: moment(item.NgayXetTuyen).format('DD/MM/YYYY'),
                TrungTuyen: item.Trungtuyen,
                NganhNghe: item.NganhNghe,
                TrinhDo: item.TrinhDo,
                NguyenVong: nguyenVongResult.recordset.map(nv => ({
                                MaNVXT: nv.MaNVXT,
                                NganhNghe: nv.NganhNghe,
                                TrinhDo: nv.TrinhDo,
                                DiemXT: parseFloat(nv.TongDXT || 0).toFixed(2),
                                Trungtuyen: nv.Trungtuyen
                        })),
                MonXetTuyen: monXetTuyenResult.recordset.map(mxt => ({
                                MonXT: mxt.MonXT,
                                Diem: parseFloat(mxt.Diem || 0).toFixed(1)
                        }))
            }));

            res.json(formattedData);
            
        } catch (err) {
            console.error('Lỗi truy vấn tra cứu thí sinh:', err);
            res.status(500).json({ error: 'Lỗi khi truy vấn cơ sở dữ liệu.' }); 
        }
    });

    // --- API: Tra cứu thông tin sinh viên (giữ nguyên) ---
    router.get('/search-student', async (req, res) => {
        const searchTerm = req.query.searchTerm || '';
        if (!searchTerm) {
            return res.status(400).json({ error: 'Vui lòng nhập thông tin tìm kiếm.' });
        }

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);

            const query = `
                WITH MaxEndDate AS (
                    SELECT 
                        MaL, 
                        MAX(Ngayketthuc) AS MaxNgayKetThuc
                    FROM web_HockyTN
                    GROUP BY MaL
                )
                SELECT 
                    sv.Maso, sv.Holot, sv.Ten, sv.Ngaysinh, sv.Noisinh, sv.Tinhtrang, sv.SoCMND,
                    lop.Khoahoc, lop.Dacdiem, lop.BacDTHienthi, lop.Tenlop, lop.LoaihinhDT,
                    med.MaxNgayKetThuc
                FROM web_SinhvienTN sv
                JOIN web_LopTN lop ON sv.MaL = lop.MaL
                LEFT JOIN MaxEndDate med ON sv.MaL = med.MaL
                WHERE (
                    sv.Maso = @SearchTerm OR sv.SoCMND = @SearchTermCMND OR
                    LOWER(CONCAT(sv.Holot, N' ', sv.Ten)) LIKE LOWER(@SearchTermLike)
                )
                ORDER BY sv.Ten, sv.Holot;
            `;

            request.input('SearchTerm', sql.NVarChar, searchTerm);
			request.input('SearchTermCMND', sql.NVarChar, searchTerm);
            request.input('SearchTermLike', sql.NVarChar, `%${searchTerm.trim()}%`);

            const result = await request.query(query);

            if (result.recordset.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy sinh viên.' });
            }
            
            const students = result.recordset.map(student => {
                const today = moment();
                const endDate = student.MaxNgayKetThuc ? moment(student.MaxNgayKetThuc) : null;

                let ketThucKhoa = '-';
                if (endDate) {
                    ketThucKhoa = moment(endDate).format('DD/MM/YYYY');
                    if (moment(endDate).add(30, 'days').isAfter(today)) {
                        ketThucKhoa += " (dự kiến)";
                    }
                }
                
                let tinhTrangSV = { text: 'Không xác định', colorClass: 'text-gray-500 bg-gray-100' };
                const tinhtrangCode = student.Tinhtrang;

                if (tinhtrangCode === 0) {
                    if (endDate && moment(endDate).add(30, 'days').isAfter(today)) {
                        tinhTrangSV = { text: 'ĐANG HỌC', colorClass: 'text-blue-800 bg-blue-100' };
                    } else {
                        tinhTrangSV = { text: 'CHƯA TỐT NGHIỆP', colorClass: 'text-yellow-800 bg-yellow-100' };
                    }
                } else if (tinhtrangCode === 1) {
                    tinhTrangSV = { text: 'BẢO LƯU', colorClass: 'text-purple-800 bg-purple-100' };
                } else if (tinhtrangCode === 2) {
                    tinhTrangSV = { text: 'THÔI HỌC', colorClass: 'text-red-800 bg-red-100' };
                } else if (tinhtrangCode === 3) {
                    tinhTrangSV = { text: 'TỐT NGHIỆP', colorClass: 'text-green-800 bg-green-100' };
                }
                
                return {
                    maso: student.Maso,
                    hoTen: `${student.Holot} ${student.Ten}`.toUpperCase(),
                    ngaySinh: student.Ngaysinh ? moment(student.Ngaysinh).format('DD/MM/YYYY') : 'N/A',
                    noiSinh: student.Noisinh,
                    khoaHoc: student.Khoahoc,
                    nganhHoc: student.Dacdiem,
                    bacDaoTao: student.BacDTHienthi,
                    tenLop: student.Tenlop,
                    loaiHinhDT: student.LoaihinhDT,
                    ketThucKhoa: ketThucKhoa,
                    tinhTrang: tinhTrangSV,
                    imageUrl: `https://camauvkc.edu.vn/Images/HinhSV/${student.Maso}.jpg`
                };
            });

            res.json(students);

        } catch (err) {
            console.error('Lỗi truy vấn tra cứu sinh viên:', err);
            res.status(500).json({ error: 'Lỗi khi truy vấn cơ sở dữ liệu.' });
        }
    });

    // --- BỔ SUNG API MỚI: Tra cứu sinh viên tốt nghiệp ---
	router.get('/search-graduates', async (req, res) => {
        const searchTerm = req.query.searchTerm || '';
        if (!searchTerm) {
            return res.status(400).json({ error: 'Vui lòng nhập thông tin tìm kiếm.' });
        }

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            const searchTermLike = `%${searchTerm.trim()}%`;

            const query = `
                SELECT 
                    sv.Maso, sv.Holot, sv.Ten, sv.Gioitinh, sv.Noisinh, sv.SoCMND, sv.Sohieu, sv.Sovaoso, 
                    sv.Ngayky AS NgayKyBang, sv.XeploaiRL, sv.XeploaiTN,
                    lop.Khoahoc, lop.Dacdiem, lop.BacDTHienthi, lop.Tenlop, lop.LoaihinhDT,
                    qd.So AS SoQuyetDinh, qd.Ngayky AS NgayKyQuyetDinh
                FROM web_SinhvienTN sv
                JOIN web_LopTN lop ON sv.MaL = lop.MaL
                LEFT JOIN web_QuyetdinhTN qd ON sv.MaQDTN = qd.MaQDTN
                WHERE 
                    sv.Tinhtrang = 3 AND (
                        sv.Maso LIKE @searchTermLike OR
						sv.SoCMND LIKE @searchTermLike OR
                        LOWER(CONCAT(sv.Holot, N' ', sv.Ten)) LIKE LOWER(@searchTermLike) OR
                        sv.Sohieu LIKE @searchTermLike OR
                        sv.Sovaoso LIKE @searchTermLike OR
                        qd.So LIKE @searchTermLike
                    )
                ORDER BY sv.Ten, sv.Holot;
            `;

            request.input('searchTermLike', sql.NVarChar, searchTermLike);
            const result = await request.query(query);

            if (result.recordset.length === 0) {
                return res.status(404).json({ error: 'Không tìm thấy dữ liệu phù hợp.' });
            }

            const graduates = result.recordset.map(sv => ({
                maso: sv.Maso,
                hoTen: `${sv.Holot} ${sv.Ten}`,
                gioitinh: sv.Gioitinh,
                noiSinh: sv.Noisinh,
                soHieu: sv.Sohieu,
                soVaoSo: sv.Sovaoso,
                ngayKyBang: sv.NgayKyBang ? moment(sv.NgayKyBang).format('DD/MM/YYYY') : 'N/A',
                xepLoaiRL: sv.XeploaiRL, // Cập nhật: Lấy Xếp loại RL
                xepLoaiTN: sv.XeploaiTN, // Giữ nguyên Xếp loại TN
                khoaHoc: sv.Khoahoc,
                nganhHoc: sv.Dacdiem,
                bacDaoTao: sv.BacDTHienthi,
                tenLop: sv.Tenlop,
                loaiHinhDT: sv.LoaihinhDT,
                soQuyetDinh: sv.SoQuyetDinh,
                ngayKyQuyetDinh: sv.NgayKyQuyetDinh ? moment(sv.NgayKyQuyetDinh).format('DD/MM/YYYY') : 'N/A',
                imageUrl: `https://camauvkc.edu.vn/Images/HinhSV/${sv.Maso}.jpg`
            }));

            res.json(graduates);

        } catch (err) {
            console.error('Lỗi truy vấn tra cứu sinh viên tốt nghiệp:', err);
            res.status(500).json({ error: 'Lỗi server khi truy vấn dữ liệu.' });
        }
    });

    // --- API Lấy danh sách học kỳ cho TKB ---
    router.get('/hocky', async (req, res) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .query(`SELECT MaHK, Hocky, Ngaybatdau, Ngayketthuc FROM Hocky WHERE Sotuan>0 ORDER BY MaHK DESC`);
            
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
                        .map(s => ({ ...s, diff: Math.abs(moment(s.Ngaybatdau).diff(now)) }))
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
            console.error(err);
            res.status(500).send('Server error');
        }
    });

    // --- API: Lấy danh sách tuần theo học kỳ cho TKB (giữ nguyên) ---
    router.get('/tuan', async (req, res) => {
        const { mahk } = req.query;
        if (!mahk) {
            return res.status(400).json({ msg: 'Vui lòng cung cấp Mã học kỳ (mahk).' });
        }
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('mahk', sql.NVarChar, mahk)
                .query(`
                    SELECT MIN(TKB.Ngay) as StartDate, MAX(TKB.Ngay) as EndDate 
                    FROM TKB 
                    INNER JOIN LopHP ON TKB.MaLHP = LopHP.MaLHP 
                    WHERE LopHP.MaHK = @mahk AND TKB.Hieuluc = 1
                `);
            const { StartDate, EndDate } = result.recordset[0];
            if (!StartDate || !EndDate) {
                return res.json([]);
            }
            res.json(calculateWeeks(StartDate, EndDate));
        } catch (err) {
            console.error(err);
            res.status(500).send('Server error');
        }
    });

    /*/ --- API: Lấy dữ liệu Thời khóa biểu (theo kiểu group Đơn vị) ---
    router.get('/tkb', async (req, res) => {
        const { startDate, endDate, groupBy = 'lop' } = req.query; 

        if (!startDate || !endDate) {
            return res.status(400).json({ msg: 'Vui lòng cung cấp ngày bắt đầu và kết thúc.' });
        }

        try {
            const pool = await poolPromise;
            
            let orderByClause = '';
            switch (groupBy) {
                case 'gv': orderByClause = 'ORDER BY Donvi.Donvi, Giaovien.Ten, Giaovien.Holot, TKB_CTE.Ngay, TKB_CTE.Tiet'; break;
                case 'hp': orderByClause = 'ORDER BY Donvi.Donvi, Hocphan.Hocphan, TKB_CTE.Ngay, TKB_CTE.Tiet'; break;
                case 'phong': orderByClause = 'ORDER BY Donvi.Donvi, Phonghoc.Tenphong, TKB_CTE.Ngay, TKB_CTE.Tiet'; break;
                default: orderByClause = 'ORDER BY Donvi.Donvi, LopHP.Tenlop, TKB_CTE.Ngay, TKB_CTE.Tiet'; break;
            }

            const tkbQuery = `
                WITH TKB_CTE AS (
                    SELECT *, SUM(TKB.Sotiet) OVER (PARTITION BY TKB.MaLHP ORDER BY TKB.Ngay, TKB.Tiet) as SoTietTichLuy
                    FROM TKB WHERE TKB.Hieuluc = 1
                )
                SELECT 
                    Hocky.MaHK, Hocky.Hocky, Donvi.Donvi, LopHP.Tenlop, LopHP.MaLHP, 
                    Hocphan.Viettat AS TenHP, Hocphan.Hocphan, Phonghoc.Tenphong, 
                    (Giaovien.Holot + ' ' + Giaovien.Ten) AS HoTenGV, 
                    TKB_CTE.Ngay, TKB_CTE.Tiet, TKB_CTE.Sotiet, TKB_CTE.Ghichu, TKB_CTE.Hieuluc,
                    LopHP.Tongsotiet, TKB_CTE.SoTietTichLuy
                FROM Hocphan 
                INNER JOIN (Giaovien INNER JOIN ((LopHP INNER JOIN Hocky ON LopHP.MaHK = Hocky.MaHK) 
                INNER JOIN TKB_CTE ON LopHP.MaLHP = TKB_CTE.MaLHP) ON Giaovien.MaGV = TKB_CTE.MaGV) ON Hocphan.MaHP = LopHP.MaHP
                INNER JOIN Donvi ON LopHP.MaDV = Donvi.MaDV
                INNER JOIN Phonghoc ON TKB_CTE.MaPH = Phonghoc.MaPH
                WHERE (TKB_CTE.Ngay BETWEEN @startDate AND @endDate)
                ${orderByClause};
            `;

            const result = await pool.request()
                .input('startDate', sql.Date, startDate)
                .input('endDate', sql.Date, endDate)
                .query(tkbQuery);

            const groupedData = result.recordset.reduce((acc, item) => {
                let donviGroup = acc.find(d => d.donvi === item.Donvi);
                if (!donviGroup) {
                    donviGroup = { donvi: item.Donvi, subGroups: [] };
                    acc.push(donviGroup);
                }

                let groupKey;
                switch(groupBy) {
                    case 'gv': groupKey = item.HoTenGV; break;
                    case 'hp': groupKey = item.Hocphan; break;
                    case 'phong': groupKey = item.Tenphong; break;
                    default: groupKey = item.Tenlop; break;
                }
                
                let subGroup = donviGroup.subGroups.find(g => g.name === groupKey);
                if (!subGroup) {
                    subGroup = { name: groupKey, schedule: [] };
                    donviGroup.subGroups.push(subGroup);
                }
                subGroup.schedule.push(item);
                return acc;
            }, []);

            res.json(groupedData);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });
*/

// --- CẬP NHẬT: API Lấy dữ liệu Thời khóa biểu ---
    router.get('/tkb', async (req, res) => {
        // CẬP NHẬT: Thêm searchTerm, bỏ groupBy
        const { startDate, endDate, searchTerm } = req.query; 

        if (!startDate || !endDate) {
            return res.status(400).json({ msg: 'Vui lòng cung cấp ngày bắt đầu và kết thúc.' });
        }

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('startDate', sql.Date, startDate);
            request.input('endDate', sql.Date, endDate);
            
            // CẬP NHẬT: Thêm điều kiện tìm kiếm
            let searchCondition = '';
            if (searchTerm) {
                request.input('searchTerm', sql.NVarChar, `%${searchTerm}%`);
                searchCondition = `
                    AND (
                        (Giaovien.Holot + N' ' + Giaovien.Ten) LIKE @searchTerm OR
                        Hocphan.Hocphan LIKE @searchTerm OR
                        Hocphan.Viettat LIKE @searchTerm OR
                        Phonghoc.Tenphong LIKE @searchTerm
                    )
                `;
            }
            
            // CẬP NHẬT: Sắp xếp cố định theo Tên lớp HP
            const orderByClause = 'ORDER BY LopHP.Tenlop, TKB_CTE.Ngay, TKB_CTE.Tiet';

            const tkbQuery = `
                WITH TKB_CTE AS (
                    SELECT *, SUM(TKB.Sotiet) OVER (PARTITION BY TKB.MaLHP ORDER BY TKB.Ngay, TKB.Tiet) as SoTietTichLuy
                    FROM TKB WHERE TKB.Hieuluc = 1
                )
                SELECT 
                    Hocky.MaHK, Hocky.Hocky, Donvi.Donvi, LopHP.Tenlop, LopHP.MaLHP, 
                    Hocphan.Viettat AS TenHP, Hocphan.Hocphan, Phonghoc.Tenphong, 
                    (Giaovien.Holot + N' ' + Giaovien.Ten) AS HoTenGV, 
                    TKB_CTE.Ngay, TKB_CTE.Tiet, TKB_CTE.Sotiet, TKB_CTE.Ghichu, TKB_CTE.Hieuluc,
                    LopHP.Tongsotiet, TKB_CTE.SoTietTichLuy
                FROM Hocphan 
                INNER JOIN (Giaovien INNER JOIN ((LopHP INNER JOIN Hocky ON LopHP.MaHK = Hocky.MaHK) 
                INNER JOIN TKB_CTE ON LopHP.MaLHP = TKB_CTE.MaLHP) ON Giaovien.MaGV = TKB_CTE.MaGV) ON Hocphan.MaHP = LopHP.MaHP
                INNER JOIN Donvi ON LopHP.MaDV = Donvi.MaDV
                INNER JOIN Phonghoc ON TKB_CTE.MaPH = Phonghoc.MaPH
                WHERE (TKB_CTE.Ngay BETWEEN @startDate AND @endDate)
                ${searchCondition}
                ${orderByClause};
            `;

            const result = await request.query(tkbQuery);

            // CẬP NHẬT: Gom nhóm lại theo Tên lớp HP
            const groupedData = result.recordset.reduce((acc, item) => {
                let group = acc.find(g => g.name === item.Tenlop);
                if (!group) {
                    group = { name: item.Tenlop, schedule: [] };
                    acc.push(group);
                }
                group.schedule.push(item);
                return acc;
            }, []);

            res.json(groupedData);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });



    return router;
};
