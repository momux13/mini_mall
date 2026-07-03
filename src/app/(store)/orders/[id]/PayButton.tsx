"use client";

import { useState, useTransition } from "react";
import { updateOrderStatusAction } from "@/lib/order-actions";

interface PayButtonProps {
  orderId: string;
}

/** 模拟支付按钮（Client Component） */
export default function PayButton({ orderId }: PayButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handlePay = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, "PAID");
      if (result.success) {
        setMessage({ type: "success", text: "支付成功！" });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={isPending}
        className="w-full py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? "处理中..." : "模拟支付"}
      </button>
      {message && (
        <p
          className={`mt-2 text-sm text-center ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
