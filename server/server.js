/*
* Đường dẫn file: D:\QLDT-app\server\server.js
* Phiên bản cập nhật: 22/01/2026
 * Tóm tắt những nội dung cập nhật:
 * Bổ sung "Dashboard Tiến độ đào tạo"
*/

// --- 1. IMPORT CÁC THƯ VIỆN CẦN THIẾT ---
require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const moment = require('moment-timezone');
const session = require('express-session');
const svgCaptcha = require('svg-captcha');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// ---2. ĐỊNH DANH PHIÊN BẢN ỨNG DỤNG ---
const DEPLOYMENT_VERSION = "2.2.10_260122";


// --- 3. CẤU HÌNH VÀ KẾT NỐI DATABASE ---
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const poolPromise = sql.connect(dbConfig).then(pool => {
    console.log('[OK] Database connected successfully!');
    return pool;
}).catch(err => {
    console.error('!!! DATABASE CONNECTION FAILED !!!');
    console.error(err);
    process.exit(1);
});


// --- 4. KHỞI TẠO ỨNG DỤNG VÀ CẤU HÌNH CƠ BẢN ---
const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

const allowedOrigins = [
    'https://localhost:5173',
    'http://localhost:5173',
    'https://camauvkc.edu.vn',
];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error(`CORS Error: Origin ${origin} not allowed.`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.set('trust proxy', 1)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: 1 * 24 * 60 * 60 * 1000 // 1 ngày
    }
}));
app.use(passport.initialize());
app.use(passport.session());


// --- Passport Strategy Configuration ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/qdt/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            const pool = await poolPromise;
            const result = await pool.request()
                .input('Email', sql.NVarChar, email)
                .query(`SELECT * FROM Giaovien WHERE Email = @Email`);
            if (result.recordset.length > 0) {
                const user = result.recordset[0];
                const permissions = {
                    isAdmin: user.isAdmin, isKetoan: user.isKetoan, isXepTKB: user.isXepTKB,
                    isKhaothi: user.isKhaothi, isHssv: user.isHssv, isTuyensinh: user.isTuyensinh,
                    isVC: user.isVC, nhapDiem: user.Nhapdiem
                };
                return done(null, { ...user, permissions });
            } else {
                return done(null, false);
            }
        } catch (err) {
            return done(err, false);
        }
    }
));
passport.serializeUser((user, done) => {
    done(null, user.MaGV);
});
passport.deserializeUser(async (id, done) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().input('MaGV', sql.NVarChar, id).query('SELECT * FROM Giaovien WHERE MaGV = @MaGV');
        done(null, result.recordset[0]);
    } catch (err) {
        done(err, null);
    }
});


// --- 5. API ROUTES ---
const apiRouter = express.Router();
app.use('/api/qdt', apiRouter);

apiRouter.get('/version', (req, res) => {
    res.json({ version: DEPLOYMENT_VERSION });
});

// --- 5.1. Import tất cả middleware từ file chuyên dụng
const {
    authenticateToken,
    isAdmin,
    canBuildTKB,
    canManageFees,
    canManageCreditClasses,
    workInfoUpdater,
    canManageTuitionFee,
    canManageDotXT,
    canManageLopHoc
} = require('./routes/middleware')(poolPromise);

// --- 5.2. Import và sử dụng các router con--------
const calculateWeeks = require('./utils/weekCalculator');
// Import hàm writeLog chuẩn từ utils: Dùng để ghi log tập trung
const { writeLog } = require('./utils/logger');

const authRouter = require('./routes/auth')(poolPromise, JWT_SECRET, svgCaptcha, authenticateToken, writeLog, passport);
const scheduleRouter = require('./routes/schedule')(poolPromise, calculateWeeks);
const permissionsRouter = require('./routes/permissions')(poolPromise);
const scheduleBuilderRouter = require('./routes/schedule-builder')(poolPromise);
const logRouter = require('./routes/log')(poolPromise);
const classManagementRouter = require('./routes/class-management')(poolPromise);
const activityLogRouter = require('./routes/activity-log')(poolPromise, writeLog); // Ghi log tập trung
const admissionsRouter = require('./routes/admissions')(poolPromise, writeLog);

const examScheduleRouter = require('./routes/exam-schedule')(poolPromise);
const statisticsRouter = require('./routes/statistics')(poolPromise);
const activityRouter = require('./routes/activity')(poolPromise, authenticateToken);
const dashboardRouter = require('./routes/dashboard.js')(poolPromise, authenticateToken, isAdmin);
const feeSummaryRouter = require('./routes/fee-summary')(poolPromise);
const creditClassManagementRouter = require('./routes/credit-class-management')(poolPromise, writeLog);
const updateWorkInfoRoutes = require('./routes/update-work-info')(poolPromise);
const userRouter = require('./routes/user')(poolPromise, authenticateToken, writeLog);
const classFeeManagementRoutes = require('./routes/class-fee-management')(poolPromise, writeLog);
const feeNotificationRoutes = require('./routes/fee-notification')(poolPromise); // Thiết lập TB Học phí
const dotXetTuyenRoutes = require('./routes/dotxettuyen')(poolPromise, writeLog); // DM Đợt xét tuyển
const danhMucLopHocRoutes = require('./routes/danhmuc-lophoc')(poolPromise, writeLog); //DM lớp sinh hoạt
const lichgiangdayRoutes = require('./routes/lich-giang-day')(poolPromise); // Lịch giảng dạy
const nhapdiemthiRoutes = require('./routes/nhap-diem-thi')(poolPromise); // Nhập điểm thi
// BỔ SUNG 22/01/2026: Dashboard tiến độ đào tạo
const dashboardTrainingRouter = require('./routes/dashboard-training')(poolPromise, authenticateToken);

// --- 5.3. Gắn các router vào đường dẫn tương ứng-------
apiRouter.use('/auth', authRouter);
apiRouter.use('/schedule', scheduleRouter);
// Gắn router "Phân quyền" mới với middleware isAdmin bảo vệ
apiRouter.use('/permissions', authenticateToken, isAdmin, permissionsRouter);
apiRouter.use('/schedule-builder', authenticateToken, canBuildTKB, scheduleBuilderRouter);
// Gắn router "Xem Log" mới với middleware isAdmin bảo vệ
apiRouter.use('/log', authenticateToken, isAdmin, logRouter);
// Sử dụng route "QL Lớp SH" - Ai cũng có thể mở
apiRouter.use('/class-management', authenticateToken, classManagementRouter);
// Ghi log tập trung 
apiRouter.use('/log-action', authenticateToken, activityLogRouter);
// Sử dụng route "Tuyển sinh" - Ai cũng có thể mở
apiRouter.use('/admissions', authenticateToken, admissionsRouter);
apiRouter.use('/exam-schedule', authenticateToken, examScheduleRouter);
apiRouter.use('/statistics', authenticateToken, statisticsRouter);
apiRouter.use('/activity', activityRouter);
apiRouter.use('/dashboard', dashboardRouter);
// Gắn router "Tổng hợp khoản thu" KHÔNG bảo vệ (với middleware canManageFees)
apiRouter.use('/fee-summary', authenticateToken, feeSummaryRouter);
// Gắn router "QL lớp HP" mới với middleware canManageCreditClasses bảo vệ
apiRouter.use('/credit-class-management', authenticateToken, canManageCreditClasses, creditClassManagementRouter);
// Gắn router "Update việc làm" mới với middleware workInfoUpdater bảo vệ
apiRouter.use('/update-work-info', authenticateToken, workInfoUpdater, updateWorkInfoRoutes);
apiRouter.use('/user', userRouter);
// Sử dụng route "Khoản thu Lớp SH" - Ai cũng có thể mở
apiRouter.use('/class-fee-management', authenticateToken, classFeeManagementRoutes);
// Gắn router "Thiết lập TB Học phí" mới với middleware isAdmin bảo vệ
apiRouter.use('/fee-notification', authenticateToken, isAdmin, feeNotificationRoutes);
// "DM đợt xét tuyển"  
apiRouter.use('/dot-xet-tuyen', authenticateToken, dotXetTuyenRoutes);
// BỔ SUNG: "DM lớp sinh hoạt"  
apiRouter.use('/danhmuc-lophoc', authenticateToken, danhMucLopHocRoutes);
// Sử dụng route "Lịch giảng dạy" - Ai cũng có thể mở
apiRouter.use('/lich-giang-day', authenticateToken, lichgiangdayRoutes);
// Sử dụng route "Nhập điểm thi" 
apiRouter.use('/nhap-diem-thi', authenticateToken, canManageCreditClasses, nhapdiemthiRoutes);
// BỔ SUNG 22/01/2026: Dashboard tiến độ đào tạo - Mọi người dùng đăng nhập đều xem được
apiRouter.use('/dashboard-training', dashboardTrainingRouter);

// --- 6. API DÀNH CHO CÁC TRANG HTML ĐỘC LẬP ---
/* 	- Tra cứu người học
    - Tra cứu bảng cấp
    - Tra cứu thí sinh
    - Tra cứu học phí
    - Xem Thời khóa biểu
*/
const publicRouter = require('./routes/public')(poolPromise);
app.use('/api/public', publicRouter);

// =================================================================
// --- 7. KHỞI ĐỘNG SERVER HTTPS ---
try {
    const sslOptions = {
        key: fs.readFileSync('ssl/private.key', 'utf8'),
        cert: fs.readFileSync('ssl/cert.crt', 'utf8')
    };
    https.createServer(sslOptions, app).listen(port, () => {
        console.log(`[SUCCESS] HTTPS Server is running on port ${port}`);
    });
} catch (sslError) {
    console.error('!!! SSL Certificate Error !!!', sslError.message);
    console.log('--- Starting server in HTTP mode instead ---');
    app.listen(port, () => {
        console.log(`[SUCCESS] HTTP Server is running on port ${port}`);
    });
}

