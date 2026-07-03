import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import OrderStatusBadge from "./OrderStatusBadge";

interface OrderCardProps {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: Date;
}

/** 订单列表卡片（RSC） */
export default function OrderCard({
  id,
  orderNumber,
  status,
  totalAmount,
  createdAt,
}: OrderCardProps) {
  return (
    <Link
      href={`/orders/${id}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm hover:border-blue-200 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">
          {orderNumber}
        </span>
        <OrderStatusBadge status={status} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-red-600">
          {formatPrice(totalAmount)}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(createdAt).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </Link>
  );
}
