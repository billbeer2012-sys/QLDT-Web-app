/*
* Đường dẫn file: D:\QLDT-app\client\src\main.jsx
* Phiên bản cập nhật: 13/09/2025
* Tóm tắt những nội dung cập nhật:
* - Thêm thuộc tính `basename` vào component <BrowserRouter>.
* - Điều này giúp React Router hiểu rằng tất cả các đường dẫn bên trong ứng dụng
* đều bắt đầu bằng '/qldt', khắc phục lỗi chuyển hướng sai sau khi đăng nhập.
*/
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

// Bổ sung: Khai báo basename cho production
const basename = import.meta.env.PROD ? '/qldt' : '/';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BỔ SUNG THUỘC TÍNH `basename` */}
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
