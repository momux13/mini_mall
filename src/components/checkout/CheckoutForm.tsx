"use client";

import { useState, useTransition } from "react";
import { createOrderAction } from "@/lib/order-actions";

interface CheckoutFormProps {
  itemCount: number;
}

/** 结算表单（Client Component）——收货信息 + 提交订单 */
export default function CheckoutForm({
  itemCount,
}: CheckoutFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;
    const note = formData.get("note") as string;

    if (!name || name.length < 2) {
      setError("请输入收货人姓名");
      return;
    }
    if (!address || address.length < 5) {
      setError("请输入详细收货地址");
      return;
    }

    startTransition(async () => {
      const result = await createOrderAction(
        name,
        address,
        phone || undefined,
        note || undefined
      );
      if (!result.success) {
        setError(result.error);
      }
      // 成功时 redirect 在 createOrderAction 中处理
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 收货人 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          收货人
        </label>
        <input
          name="name"
          type="text"
          required
          placeholder="请输入收货人姓名"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* 收货地址 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          收货地址
        </label>
        <input
          name="address"
          type="text"
          required
          placeholder="请输入详细地址"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* 联系电话 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          联系电话
        </label>
        <input
          name="phone"
          type="tel"
          placeholder="请输入联系电话（选填）"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* 备注 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          备注
        </label>
        <textarea
          name="note"
          rows={2}
          placeholder="如有特殊要求请注明（选填）"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
      </div>

      {/* 错误提示 */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      {/* 提交 */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? "提交中..." : `提交订单（共 ${itemCount} 件）`}
      </button>
    </form>
  );
}
