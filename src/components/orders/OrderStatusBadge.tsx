import { cn } from "@/lib/utils";
import { ORDER_STATUS } from "@/lib/constants";
import type { OrderStatus } from "@/lib/constants";

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

/** 状态对应的颜色方案 */
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PAID: "bg-blue-100 text-blue-700 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-700 border-purple-200",
  DELIVERED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
};

/** 订单状态标签（RSC 兼容） */
export default function OrderStatusBadge({
  status,
  className,
}: OrderStatusBadgeProps) {
  const label = ORDER_STATUS[status as OrderStatus] ?? status;
  const color = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        color,
        className
      )}
    >
      {label}
    </span>
  );
}
