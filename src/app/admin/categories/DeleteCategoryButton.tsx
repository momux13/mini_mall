"use client";

import { useState, useTransition } from "react";
import { deleteCategoryAction } from "@/lib/category-actions";

interface DeleteCategoryButtonProps {
  id: string;
  name: string;
  productCount: number;
}

/** 删除分类按钮（Client Component）——带确认 + 商品数检查 */
export default function DeleteCategoryButton({
  id,
  name,
  productCount,
}: DeleteCategoryButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (productCount > 0) {
      setError(`该分类下有 ${productCount} 件商品，无法删除`);
      return;
    }
    if (!confirm(`确定要删除分类「${name}」吗？`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteCategoryAction(id);
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
