/*
 * Đường dẫn file: D:\QLDT-app\client\src\components\ui\input.jsx
 * Thời gian bổ sung: 23/10/2025
 * Tóm tắt những nội dung bổ sung:
 * - Tạo mới file component Input.
 * - Đây là component Input cơ bản, sử dụng Tailwind và 'forwardRef'.
 * - Import và sử dụng hàm 'cn' từ '../lib/utils'.
 * - File này là BẮT BUỘC để 'LichGiangDayPage.jsx' có thể import.
 */

import * as React from "react"
// Bổ sung: Import 'cn' từ file utils
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        // Bổ sung: Đây là các style Tailwind mặc định cho Input
        "flex h-10 w-full rounded-md border border-input bg-background",
        "px-3 py-2 text-sm ring-offset-background",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        // Bổ sung: Định nghĩa màu border
        "border-gray-300 focus-visible:ring-blue-500",
        className // Hợp nhất với bất kỳ class nào được truyền từ bên ngoài
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

// Bổ sung: Export component
export { Input }
