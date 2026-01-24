/*
 * Đường dẫn file: D:\QLDT-app\server\routes\auth.js
 * CẬP NHẬT 22/01/2026: Sửa lỗi captcha fail lần đầu do session chưa kịp lưu
 */
const express = require('express');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const useragent = require('useragent');
const crypto = require('crypto');
const passport = require('passport');

// --- HÀM HỖ TRỢ (Giữ nguyên) ---
const isPrivateIp = (ip) => {
    if (!ip) return false;
    const privateRanges = [
        /^(::f{4}:)?10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/i, /^(::f{4}:)?127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/i,
        /^(::f{4}:)?172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/i, /^(::f{4}:)?192\.168\.\d{1,3}\.\d{1,3}$/i,
        /^fe80:/i, /^::1$/, /^fc00:/i
    ];
    return privateRanges.some(range => range.test(ip));
};
const getBestIp = (req) => {
    const headersToCheck = ['cf-connecting-ip', 'x-real-ip', 'x-forwarded-for'];
    let ips = [];
    for (const header of headersToCheck) {
        const value = req.headers[header];
        if (value) { ips = ips.concat(value.split(',').map(ip => ip.trim())); }
    }
    ips.push(req.ip, req.socket.remoteAddress);
    const publicIps = [], privateIps = [];
    for (const ipStr of ips) {
        if (ipStr) {
            const ip = ipStr.split(':')[0];
            if (ip) { isPrivateIp(ip) ? privateIps.push(ip) : publicIps.push(ip); }
        }
    }
    return publicIps[0] || privateIps[0] || 'Unknown';
};
const getCharacteristicIdentifier = (req) => {
    const ip = getBestIp(req);
    if (ip !== 'Unknown' && !isPrivateIp(ip)) return ip;
    const cookieHeader = req.headers['cookie'];
    if (cookieHeader) {
        const gaCookie = cookieHeader.split(';').find(c => c.trim().startsWith('_ga='));
        if (gaCookie) {
            const parts = gaCookie.split('.');
            if (parts.length >= 3) { return `GA:${parts[parts.length - 2]}.${parts[parts.length - 1]}`; }
        }
    }
    const userAgent = req.headers['user-agent'] || '';
    const hash = crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex');
    return `FP:${hash.substring(0, 12)}`;
};

module.exports = function (poolPromise, JWT_SECRET, svgCaptcha, authenticateToken, writeLog, passport) {
    const router = express.Router();
    const CLIENT_BASE_URL = process.env.CLIENT_URL || 'https://localhost:5173';

    // --- GOOGLE OAUTH ROUTES (Giữ nguyên) ---
    router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    router.get('/google/callback',
        (req, res, next) => {
            passport.authenticate('google', { session: false }, (err, user, info) => {
                if (err) {
                    console.error("Passport authenticate error:", err);
                    return res.redirect(`${CLIENT_BASE_URL}/login?error=google-auth-failed`);
                }
                if (!user) {
                    const message = info.message || 'Email Google không tồn tại trong hệ thống.';
                    console.warn("Google Auth Failed:", message);
                    return res.redirect(`${CLIENT_BASE_URL}/login?error=google-auth-failed&message=${encodeURIComponent(message)}`);
                }
                req.user = user;
                next();
            })(req, res, next);
        },
        async (req, res) => {
            const userPayload = {
                maGV: req.user.MaGV, maso: req.user.Maso, hoTen: `${req.user.Holot} ${req.user.Ten}`,
                chucVu: req.user.Chucvu, donVi: req.user.Donvi, ...req.user.permissions
            };
            const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1d' });

            try {
                const pool = await poolPromise;
                const identifier = getCharacteristicIdentifier(req);
                const agent = useragent.parse(req.headers['user-agent']);
                const deviceInfo = `${agent.os.family} - ${agent.family} (${agent.device.family})`;
                const logNote = `Login (Google). Device: ${deviceInfo}. ID: ${identifier}`;
                await writeLog(pool, userPayload.maso, 'Login', 'Đăng nhập Google', logNote);
            } catch (logErr) {
                console.error("Lỗi ghi log khi đăng nhập Google:", logErr);
            }

            const frontendCallbackUrl = `${CLIENT_BASE_URL}/auth/callback?token=${token}`;
            res.redirect(frontendCallbackUrl);
        }
    );

    // --- CAPTCHA & PASSWORD ROUTES ---
    // CẬP NHẬT 22/01/2026: Sửa lỗi captcha fail lần đầu do session chưa kịp lưu
    router.get('/captcha', (req, res) => {
        try {
            if (!req.session) { return res.status(500).send("Lỗi session trên server."); }
            const captcha = svgCaptcha.create({ size: 4, ignoreChars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', noise: 1 });
            req.session.captcha = captcha.text;

            // BỔ SUNG: Đảm bảo session được lưu trước khi trả response
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).send("Lỗi lưu session.");
                }
                res.type('svg').status(200).send(captcha.data);
            });
        } catch (error) {
            console.error('Captcha generation error:', error);
            res.status(500).send("Không thể tạo mã xác thực.");
        }
    });

    // BẮT ĐẦU SỬA LỖI: Tái cấu trúc API Đăng nhập
    router.post('/login', async (req, res) => {
        const { username, password, captcha } = req.body;

        if (!req.session || !req.session.captcha || !captcha || captcha.toLowerCase() !== req.session.captcha.toLowerCase()) {
            if (req.session) req.session.captcha = null;
            return res.status(400).json({ message: 'Mã Captcha không chính xác.' });
        }
        req.session.captcha = null;

        if (!username || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập Tên người dùng và Mật khẩu.' });
        }

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('Maso', sql.NVarChar, username);

            const result = await request.query(`
                SELECT
                    Giaovien.MaGV, Giaovien.Maso, Giaovien.Holot, Giaovien.Ten, Giaovien.MaCV,
                    Giaovien.MaDV, Giaovien.Matkhau, Giaovien.isAdmin, Giaovien.isXepTKB,
                    Giaovien.isKhaothi, Giaovien.isHssv, Giaovien.isTuyensinh, Giaovien.isKetoan, Giaovien.Nhapdiem, Giaovien.isVC,
                    Chucvu.Chucvu, Donvi.Donvi
                FROM Giaovien
                LEFT JOIN Chucvu ON Giaovien.MaCV = Chucvu.MaCV
                LEFT JOIN Donvi ON Giaovien.MaDV = Donvi.MaDV
                WHERE Giaovien.Maso = @Maso
            `);

            if (result.recordset.length === 0) {
                return res.status(401).json({ message: 'Tên người dùng không tồn tại.' });
            }

            const user = result.recordset[0];
            if (password !== user.Matkhau) {
                return res.status(401).json({ message: 'Mật khẩu không chính xác.' });
            }

            // 1. Tạo Payload và Token NGAY LẬP TỨC
            const payload = {
                maGV: user.MaGV, maso: user.Maso, maCV: user.MaCV, maDV: user.MaDV,
                isAdmin: user.isAdmin === 1, isKhaothi: user.isKhaothi === 1,
                isXepTKB: user.isXepTKB === 1, isKetoan: user.isKetoan === 1,
                isHssv: user.isHssv === 1, isTuyensinh: user.isTuyensinh === 1,
                isVC: user.isVC === 1, nhapDiem: user.Nhapdiem === 1
            };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

            // 2. Ghi log (giờ đã có thể ghi an toàn)
            try {
                const identifier = getCharacteristicIdentifier(req);
                const agent = useragent.parse(req.headers['user-agent']);
                const deviceInfo = `${agent.os.toString()} - ${agent.toAgent()} (${agent.device.family})`;
                const logNote = `Login: ${identifier} | ${deviceInfo}`;
                await writeLog(pool, user.Maso, 'Login', 'Đăng nhập Password', logNote);
            } catch (logErr) {
                console.error("Lỗi ghi log đăng nhập:", logErr);
                // Không chặn quá trình đăng nhập nếu ghi log thất bại
            }

            // 3. Gửi phản hồi duy nhất về client
            res.json({
                message: `Chào mừng ${user.Holot} ${user.Ten} quay trở lại!`,
                token,
                user: {
                    maGV: user.MaGV, maso: user.Maso, hoTen: `${user.Holot} ${user.Ten}`,
                    chucVu: user.Chucvu, donVi: user.Donvi, maCV: user.MaCV, maDV: user.MaDV,
                    isAdmin: user.isAdmin, isXepTKB: user.isXepTKB, isKhaothi: user.isKhaothi,
                    isHssv: user.isHssv, isTuyensinh: user.isTuyensinh, isKetoan: user.isKetoan,
                    isVC: user.isVC, nhapDiem: user.Nhapdiem
                    //...payload // Gửi kèm tất cả các quyền
                }
            });

        } catch (err) {
            console.error('Login API Error:', err);
            res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
        }
    });
    // KẾT THÚC SỬA LỖI

    // API: Đổi mật khẩu (Giữ nguyên)
    router.post('/change-password', authenticateToken, async (req, res) => {
        const { oldPassword, newPassword } = req.body;
        const maGV = req.user.maGV;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
        }

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            request.input('MaGV', sql.NVarChar, maGV);
            const result = await request.query('SELECT Matkhau FROM Giaovien WHERE MaGV = @MaGV');

            if (result.recordset.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
            }
            const user = result.recordset[0];
            if (oldPassword !== user.Matkhau) {
                return res.status(400).json({ message: 'Mật khẩu cũ không chính xác.' });
            }
            const updateRequest = new sql.Request(pool);
            updateRequest.input('NewPassword', sql.NVarChar, newPassword);
            updateRequest.input('MaGV', sql.NVarChar, maGV);
            await updateRequest.query('UPDATE Giaovien SET Matkhau = @NewPassword WHERE MaGV = @MaGV');

            try {
                await writeLog(pool, req.user.maso, 'Đổi mật khẩu', 'Đổi mật khẩu', 'Thành công');
            } catch (logErr) {
                console.error("Lỗi ghi log đổi mật khẩu:", logErr);
            }

            res.json({ message: 'Đổi mật khẩu thành công!' });
        } catch (err) {
            console.error('Change Password API Error:', err);
            res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu.' });
        }
    });

    return router;
};

