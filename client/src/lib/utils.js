/*
 * Đường dẫn file: D:\QLDT-app\client\src\lib\utils.js
 * Thời gian bổ sung: 23/10/2025
 * Tóm tắt những nội dung bổ sung:
 * - Tạo mới file tiện ích.
 * - Cung cấp hàm 'cn' để hợp nhất các class Tailwind một cách an toàn.
 * - Sử dụng 'clsx' và 'tailwind-merge' (đã có trong dự án).
 */

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
