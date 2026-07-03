"use client";

import { useActionState } from "react";
import { createCategoryAction } from "@/lib/category-actions";
import type { ActionResult } from "@/types";

/** 分类表单（Client Component） */
export default function CategoryForm() {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(createCategoryAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {/* 分类名称 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          分类名称
        </label>
        <input
          name="name"
          type="text"
          required
          placeholder="例如：电子产品"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* 分类标识 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          分类标识（slug，留空自动生成）
        </label>
        <input
          name="slug"
          type="text"
          placeholder="例如：electronics"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
        />
      </div>

      {/* 描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          描述（可选）
        </label>
        <textarea
          name="description"
          rows={2}
          placeholder="简要描述该分类"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
      </div>

      {/* 错误 */}
      {state && !state.success && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          {state.error}
        </p>
      )}

      {/* 提交 */}
      <button
        type="submit"
        disabled={pending}
        className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {pending ? "创建中..." : "创建分类"}
      </button>
    </form>
  );
}
