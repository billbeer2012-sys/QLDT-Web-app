/*
 * Đường dẫn file: D:\QLDT-app\client\src\components\ui\button.jsx
 * Thời gian bổ sung: 23/10/2025
 * Tóm tắt những nội dung bổ sung:
 * - Tạo mới file component Button.
 * - Đây là component Button cơ bản, sử dụng Tailwind và 'forwardRef'.
 * - Import và sử dụng hàm 'cn' từ '../lib/utils'.
 * - File này là BẮT BUỘC để 'LichGiangDayPage.jsx' có thể import.
 */

import * as React from "react"
// Bổ sung: Import 'cn' từ file utils
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <button
      className={cn(
        // Bổ sung: Đây là các style Tailwind mặc định cho Button
        "inline-flex items-center justify-center rounded-md text-sm font-medium",
        "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "bg-blue-600 text-white hover:bg-blue-700", // Style mặc định (thay vì 'cva')
        "h-10 px-4 py-2", // Size mặc định
        className // Hợp nhất với bất kỳ class nào được truyền từ bên ngoài
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

// Bổ sung: Export component
export { Button }
