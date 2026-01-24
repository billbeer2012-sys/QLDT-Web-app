/*
* Đường dẫn file: D:\QLDT-app\server\routes\update-work-info.js
* Cập nhật: 18/09/2025 (Tái cấu trúc lần 2 - Quay lại Bảng tạm)
* Tóm tắt:
* - LOẠI BỎ: Hoàn toàn phương án sử dụng Stored Procedure và TVP để tăng tính linh hoạt.
* - SỬA LỖI 500: Thay đổi cách cập nhật. Thay vì dùng bulk insert vào bảng tạm,
* code sẽ xây dựng một câu lệnh UPDATE động bằng cách sử dụng mệnh đề CASE.
* Cách này ổn định hơn và không yêu cầu thay đổi cấu trúc database.
* - Giữ nguyên transaction để đảm bảo an toàn dữ liệu.
*/

const express = require('express');
const sql = require('mssql');

module.exports = function(poolPromise) {
    const router = express.Router();

    router.post('/students', async (req, res) => {
        const studentData = req.body.students;

        if (!studentData || !Array.isArray(studentData) || studentData.length === 0) {
            return res.status(400).json({ message: 'Không có dữ liệu sinh viên được cung cấp.' });
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();
            const request = new sql.Request(transaction);

            // Bước 1: Lấy danh sách tất cả Maso từ dữ liệu gửi lên
            const masoList = studentData.map(s => s.Maso);
            
            // Tạo tham số cho danh sách Maso
            const masoParams = masoList.map((_, i) => `@maso${i}`).join(',');
            masoList.forEach((maso, i) => {
                request.input(`maso${i}`, sql.NVarChar, maso);
            });

            // Bước 2: Kiểm tra sự tồn tại của tất cả Maso trong một lần truy vấn
            const checkResult = await request.query(`
                SELECT Maso FROM Sinhvien WHERE Maso IN (${masoParams})
            `);

            const existingMasos = new Set(checkResult.recordset.map(r => r.Maso));
            const nonExistentMasos = masoList.filter(m => !existingMasos.has(m));

            if (nonExistentMasos.length > 0) {
                await transaction.rollback();
                return res.status(400).json({
                    message: 'Cập nhật thất bại. Các mã sinh viên sau không tồn tại trong hệ thống',
                    details: nonExistentMasos.join(', ')
                });
            }

            // Bước 3: Xây dựng câu lệnh UPDATE động với mệnh đề CASE
            // Cách này an toàn và hiệu quả hơn việc lặp và gọi UPDATE nhiều lần.
            let updateQuery = 'UPDATE Sinhvien SET Noilamviec = CASE Maso ';
            
            studentData.forEach((student, i) => {
                const masoParamName = `updateMaso${i}`;
                const noilamviecParamName = `updateNoilamviec${i}`;
                request.input(masoParamName, sql.NVarChar, student.Maso);
                request.input(noilamviecParamName, sql.NVarChar, student.Noilamviec);
                updateQuery += `WHEN @${masoParamName} THEN @${noilamviecParamName} `;
            });

            updateQuery += `END WHERE Maso IN (${masoParams})`;

            const updateResult = await request.query(updateQuery);

            await transaction.commit();
            
            res.status(200).json({
                message: `Cập nhật thành công thông tin việc làm cho ${updateResult.rowsAffected[0]} sinh viên.`,
                updatedCount: updateResult.rowsAffected[0]
            });

        } catch (error) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error("Lỗi khi rollback transaction:", rollbackError);
            }
            console.error("Lỗi trong quá trình cập nhật:", error);
            res.status(500).json({ message: 'Đã xảy ra lỗi ở máy chủ khi đang cập nhật.', details: error.message });
        }
    });

    return router;
};

