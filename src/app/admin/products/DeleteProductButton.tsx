"use client";

import { useState, useTransition } from "react";
import { deleteProductAction } from "@/lib/product-actions";

interface DeleteProductButtonProps {
  id: string;
  name: string;
}

/** 删除商品按钮（Client Component）——带确认 */
export default function DeleteProductButton({
  id,
  name,
}: DeleteProductButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!confirm(`确定要删除「${name}」吗？此操作不可撤销。`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteProductAction(id);
      if (!result.success) {
        setError(result.error);
      }
    });
  };

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-red-600 hover:text-red-700 text-xs disabled:opacity-30"
      >
        {isPending ? "删除中..." : "删除"}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </>
  );
}
