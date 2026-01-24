/*
* Đường dẫn file: D:\QLDT-app\client\vite.config.js
* Phiên bản cập nhật: 12/09/2025 (Sửa lỗi base path)
* Tóm tắt những nội dung cập nhật:
* - Chuyển đổi cấu hình thành một hàm để nhận 'mode' (development/production).
* - Thiết lập 'base' một cách linh động:
* + Dùng '/qldt/' cho môi trường 'production'.
* + Dùng '/' cho môi trường 'development'.
* - Khắc phục lỗi "did you mean to visit /qldt/web_app_qldt/" khi chạy dev server.
*/
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    // SỬA LỖI: Cấu hình 'base' linh động theo môi trường
    base: mode === 'production' ? '/qldt/' : '/',
    plugins: [react()],
    server: {
      https: {
        key: fs.readFileSync(path.resolve(__dirname, '../server/ssl/private.key')),
        cert: fs.readFileSync(path.resolve(__dirname, '../server/ssl/cert.crt')),
      },
      port: 5173, 
    }
  }
})

