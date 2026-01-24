/*
 * Đường dẫn file: D:\QLDT-app\client\src\components\ui\checkbox.jsx
 * Thời gian bổ sung: 23/10/2025
 * Tóm tắt những nội dung bổ sung:
 * - Tạo mới component Checkbox (dựa trên Radix UI + shadcn/ui).
 * - Component này là phụ trợ, được sử dụng bởi DropdownMenuCheckboxItem.
 */

import React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils'; // (Sử dụng file utils đã tạo trước đó)

const Checkbox = React.forwardRef(
  ({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn('flex items-center justify-center text-current')}
      >
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
