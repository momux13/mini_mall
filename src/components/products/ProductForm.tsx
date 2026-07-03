"use client";

import { useActionState } from "react";
import { createProductAction, updateProductAction } from "@/lib/product-actions";
import type { ActionResult } from "@/types";

interface ProductFormProps {
  /** 编辑模式时的初始数据 */
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    categoryId: string;
    isPublished: boolean;
  };
  /** 分类列表用于下拉选择 */
  categories: { id: string; name: string }[];
}

/** 商品表单（Client Component）——新建/编辑共用 */
export default function ProductForm({
  initialData,
  categories,
}: ProductFormProps) {
  const action = initialData
    ? updateProductAction.bind(null, initialData.id)
    : createProductAction;

  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(action, null);

  return (
    <form action={formAction} className="space-y-4">
      {/* 商品名称 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          商品名称
        </label>
        <input
          name="name"
          type="text"
          required
          defaultValue={initialData?.name}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* 商品标识 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          商品标识（slug）
        </label>
        <input
          name="slug"
          type="text"
          required
          defaultValue={initialData?.slug}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
        />
      </div>

      {/* 描述 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          描述
        </label>
        <textarea
          name="description"
          rows={3}
          required
          defaultValue={initialData?.description}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
      </div>

      {/* 价格 + 库存 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            价格（元）
          </label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={initialData ? (initialData.price / 100).toFixed(2) : ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            库存
          </label>
          <input
            name="stock"
            type="number"
            min="0"
            required
            defaultValue={initialData?.stock ?? 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* 分类 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          分类
        </label>
        <select
          name="categoryId"
          required
          defaultValue={initialData?.categoryId}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option value="">请选择分类</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 图片 URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          图片 URL（可选）
        </label>
        <input
          name="imageUrl"
          type="text"
          defaultValue={initialData?.imageUrl ?? ""}
          placeholder="https://picsum.photos/seed/slug/400/400"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* 上架状态 */}
      <div className="flex items-center gap-2">
        <input
          id="isPublished"
          name="isPublished"
          type="checkbox"
          value="true"
          defaultChecked={initialData?.isPublished}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isPublished" className="text-sm text-gray-700">
          上架（用户可见）
        </label>
      </div>

      {/* 错误提示 */}
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
        {pending ? "保存中..." : initialData ? "保存修改" : "创建商品"}
      </button>
    </form>
  );
}
