"use client";

import { useState, useTransition } from "react";
import { updateOrderStatusAction } from "@/lib/order-actions";
import { ORDER_STATUS } from "@/lib/constants";
import type { OrderStatus } from "@/lib/constants";

interface AdminStatusUpdateProps {
  orderId: string;
  currentStatus: OrderStatus;
  allowedTransitions: OrderStatus[];
}

/** 后台订单状态流转按钮组（Client Component） */
export default function AdminStatusUpdate({
  orderId,
  currentStatus,
  allowedTransitions,
}: AdminStatusUpdateProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleTransition = (newStatus: OrderStatus) => {
    const label = ORDER_STATUS[newStatus];
    if (!confirm(`确定将订单状态变更为「${label}」吗？`)) return;

    setMessage(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, newStatus);
      if (result.success) {
        setMessage({ type: "success", text: `已变更为「${label}」` });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">状态操作</p>
      <div className="flex flex-wrap gap-2">
        {allowedTransitions.map((status) => (
          <button
            key={status}
            onClick={() => handleTransition(status)}
            disabled={isPending}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-30 transition-colors"
          >
            {ORDER_STATUS[status]}
          </button>
        ))}
      </div>
      {message && (
        <p
          className={`mt-2 text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
