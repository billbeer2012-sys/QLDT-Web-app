/*
* Đường dẫn file: D:\QLDT-app\server\routes\activity.js
* Phiên bản cập nhật: 30/08/2025 (Lần 3)
* Tóm tắt những nội dung cập nhật:
* - SỬA LỖI: Đồng bộ hoàn toàn logic lấy định danh người dùng từ file 'auth.js'.
* - Bổ sung hàm `getCharacteristicIdentifier` và import thư viện 'crypto'.
* - Cập nhật route '/heartbeat' để sử dụng `getCharacteristicIdentifier` thay vì
* chỉ dùng `getBestIp`. Điều này đảm bảo cột 'Địa chỉ IP' trên Dashboard
* sẽ hiển thị đúng giá trị đặc trưng (IP công khai, GA Client ID, hoặc Fingerprint).
*/
const express = require('express');
const sql = require('mssql');
const moment = require('moment-timezone');
const useragent = require('useragent');
const crypto = require('crypto'); // BỔ SUNG: Import thư viện crypto

// --- START: BỔ SUNG CÁC HÀM HELPER (Đồng bộ hoàn toàn từ auth.js) ---

/**
 * Kiểm tra xem một địa chỉ IP có nằm trong dải IP nội bộ hay không.
 * @param {string} ip - Địa chỉ IP cần kiểm tra.
 * @returns {boolean} - True nếu là IP nội bộ, ngược lại là false.
 */
const isPrivateIp = (ip) => {
    if (!ip) return false;
    const privateRanges = [
        /^(::f{4}:)?10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/i,
        /^(::f{4}:)?127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/i,
        /^(::f{4}:)?172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/i,
        /^(::f{4}:)?192\.168\.\d{1,3}\.\d{1,3}$/i,
        /^fe80:/i, /^::1$/, /^fc00:/i
    ];
    return privateRanges.some(range => range.test(ip));
};

/**
 * Lấy địa chỉ IP tốt nhất có thể từ các header của request.
 * @param {object} req - Đối tượng request của Express.
 * @returns {string} - Địa chỉ IP tốt nhất tìm được, hoặc 'Unknown'.
 */
const getBestIp = (req) => {
    const headersToCheck = ['cf-connecting-ip', 'x-real-ip', 'x-forwarded-for'];
    let ips = [];

    for (const header of headersToCheck) {
        const value = req.headers[header];
        if (value) {
            ips = ips.concat(value.split(',').map(ip => ip.trim()));
        }
    }
    ips.push(req.ip, req.socket.remoteAddress);

    const publicIps = [];
    const privateIps = [];

    for (const ipStr of ips) {
        if (ipStr) {
            const ip = ipStr.split(':')[0];
            if (ip) {
                isPrivateIp(ip) ? privateIps.push(ip) : publicIps.push(ip);
            }
        }
    }
    return publicIps[0] || privateIps[0] || 'Unknown';
};

/**
 * Lấy một giá trị định danh đặc trưng cho người dùng.
 * @param {object} req - Đối tượng request của Express.
 * @returns {string} - Một chuỗi định danh người dùng.
 */
const getCharacteristicIdentifier = (req) => {
    const ip = getBestIp(req);
    if (ip !== 'Unknown' && !isPrivateIp(ip)) {
        return ip;
    }

    const cookieHeader = req.headers['cookie'];
    if (cookieHeader) {
        const gaCookie = cookieHeader.split(';').find(c => c.trim().startsWith('_ga='));
        if (gaCookie) {
            const parts = gaCookie.split('.');
            if (parts.length >= 3) {
                const clientId = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
                return `GA:${clientId}`;
            }
        }
    }
    
    const userAgent = req.headers['user-agent'] || '';
    const hash = crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex');
    return `FP:${hash.substring(0, 12)}`;
};

// --- END: BỔ SUNG CÁC HÀM HELPER ---


module.exports = function(poolPromise, authenticateToken) {
    const router = express.Router();

    router.post('/heartbeat', authenticateToken, async (req, res) => {
        const maso = req.user.maso;
        let userInfo;
        try {
            const pool = await poolPromise;
            const userResult = await pool.request().input('Maso', sql.NVarChar, maso).query("SELECT Holot, Ten FROM Giaovien WHERE Maso = @Maso");
            if (userResult.recordset.length > 0) {
                const user = userResult.recordset[0];
                userInfo = `${user.Holot} ${user.Ten}`;
            }
        } catch (e) {
            console.error("Heartbeat - User info query error:", e);
        }

        try {
            const pool = await poolPromise;
            const request = new sql.Request(pool);
            const now = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
            
            // SỬA LỖI: Sử dụng hàm logic đầy đủ để lấy định danh đặc trưng
            const identifier = getCharacteristicIdentifier(req);
            const agent = useragent.parse(req.headers['user-agent']);
            const deviceInfo = `${agent.os.toString()} - ${agent.toAgent()} (${agent.device.family})`;

            request.input('MaUser', sql.NVarChar, maso);
            request.input('LastSeen', sql.DateTime, now);
            request.input('HoTen', sql.NVarChar, userInfo || maso);
            request.input('UserType', sql.NVarChar, 'Giaovien');
            request.input('IPAddress', sql.NVarChar, identifier); // Cập nhật giá trị này
            request.input('DeviceInfo', sql.NVarChar, deviceInfo);

            await request.query(`
                MERGE INTO db_UserActivity AS Target
                USING (VALUES (@MaUser)) AS Source (MaUser)
                ON Target.MaUser = Source.MaUser
                WHEN MATCHED THEN
                    UPDATE SET LastSeen = @LastSeen, HoTen = @HoTen, IPAddress = @IPAddress, DeviceInfo = @DeviceInfo
                WHEN NOT MATCHED THEN
                    INSERT (MaUser, LastSeen, HoTen, UserType, IPAddress, DeviceInfo)
                    VALUES (@MaUser, @LastSeen, @HoTen, @UserType, @IPAddress, @DeviceInfo);
            `);
            
            res.sendStatus(200);
        } catch (err) {
            console.error('Heartbeat API Error:', err);
            res.sendStatus(500);
        }
    });

    return router;
};

