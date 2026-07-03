"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/lib/cart-actions";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
}

/** 加入购物车按钮（Client Component） */
export default function AddToCartButton({
  productId,
  stock,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleAdd = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await addToCartAction(productId, 1);
      if (result.success) {
        setMessage({ type: "success", text: "已加入购物车" });
      } else {
        if (result.error === "请先登录") {
          router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
          return;
        }
        setMessage({ type: "error", text: result.error });
      }
    });
  };

  if (stock <= 0) {
    return (
      <button
        disabled
        className="w-full md:w-auto px-8 py-3 bg-gray-300 text-gray-500 text-lg font-medium rounded-lg cursor-not-allowed"
      >
        暂时缺货
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handleAdd}
        disabled={isPending}
        className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? "添加中..." : "加入购物车"}
      </button>

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
