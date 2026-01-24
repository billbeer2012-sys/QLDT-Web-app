/*
* Đường dẫn file: D:\QLDT-app\server\routes\middleware.js
* Phiên bản cập nhật: 07/10/2025 (Sửa lỗi Toàn bộ hệ thống)
* Tóm tắt những nội dung cập nhật:
* - TÁI CẤU TRÚC HOÀN TOÀN: Loại bỏ tất cả các truy vấn đến CSDL.
* - Các hàm kiểm tra quyền giờ đây sẽ đọc trực tiếp thông tin quyền hạn
* (đã được chuẩn hóa thành true/false) từ JWT token.
* - Đây là giải pháp triệt để, giúp tăng tốc độ, bảo mật và sửa lỗi
* không đăng nhập được trên mọi môi trường.
*/

const jwt = require('jsonwebtoken');

// ---Module không cần 'poolPromise' nữa
module.exports = function() {

    // --- Middleware kiểm tra JWT token - Kiểm tra user đăng nhập
    const authenticateToken = (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null) {
            return res.status(401).json({ message: 'Yêu cầu đăng nhập.' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.error("JWT Verification Error:", err.message);
                return res.status(403).json({ message: 'Phiên làm việc đã hết hạn hoặc không hợp lệ.' });
            }
            req.user = user; // user ở đây chính là payload đã được chuẩn hóa của token
            next();
        });
    };

    // --- CÁC HÀM KIỂM TRA QUYỀN (KHÔNG QUERY DB) ---
	//--Quyền Admin
    const isAdmin = (req, res, next) => {
        if (req.user && req.user.isAdmin === true) {
            next();
        } else {
            res.status(403).json({ message: 'Truy cập bị từ chối. Yêu cầu quyền Admin.' });
        }
    };
	//--Quyền Admin và XepTKB (CBCC)
    const canBuildTKB = (req, res, next) => {
        if (req.user && (req.user.isAdmin === true || req.user.isXepTKB === true)) {
            next();
        } else {
            es.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này.' });
        }
    };

    //--Quyền truy cập Tổng hợp Khoản thu: Admin or kế toán or CBCC
    const canManageFees = (req, res, next) => {
        if (req.user && (req.user.isAdmin === true || req.user.isKetoan === true || req.user.isXepTKB === true)) {
            next();
        } else {
            es.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này.' });
        }
    };
    //--Quyền truy cập Lớp Học phần: Admin, GV, Khaothi, CBCC
    const canManageCreditClasses = (req, res, next) => {
        if (req.user && (req.user.isAdmin === true || req.user.isKhaothi === true || req.user.isXepTKB === true || req.user.nhapDiem === true)) {
            next();
        } else {
            res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này.' });
        }
    };
	
    //--Quyền truy cập Update Việc làm: Admin, HSSV 
    const workInfoUpdater = (req, res, next) => {
        if (req.user && (req.user.isAdmin === true || req.user.isHssv === true)) {
            next();
        } else {
            es.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này.' });
        }
    };
	//--Quyền truy cập: Admin, Kế toán 
	const canManageTuitionFee = (req, res, next) => {
        if (req.user && (req.user.isAdmin === true || req.user.isKetoan === true)) {
            next();
        } else {
            res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này.' });
        }
    };
	// BỔ SUNG: kiểm tra quyền (isAdmin OR (isXepTKB OR isTuyensinh))quản lý Đợt xét tuyển
	const canManageDotXT = (req, res, next) => {
		const user = req.user;
		if (user && (user.isAdmin || (user.isXepTKB && user.isTuyensinh))) {
			next();
		} else {
			return res.status(403).json({ message: 'Yêu cầu quyền Admin, hoặc quyền Xếp TKB và Tuyển sinh.' });
		}
	};
	// BỔ SUNG: Middleware kiểm tra quyền quản lý danh mục lớp học
    const canManageLopHoc = (req, res, next) => {
        const user = req.user;
        if (user && (user.isAdmin || (user.isXepTKB && user.isKhaothi))) {
            next();
        } else {
            return res.status(403).json({ message: 'Yêu cầu quyền Admin, hoặc quyền Xếp TKB và Khảo thí.' });
        }
    };
	
    return {
        authenticateToken,
        isAdmin,
        canBuildTKB,
        canManageFees,
        canManageCreditClasses,
        workInfoUpdater,
		canManageTuitionFee,
		canManageDotXT,
		canManageLopHoc
    };
};

