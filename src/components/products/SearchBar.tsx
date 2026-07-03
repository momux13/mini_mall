"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";

interface SearchBarProps {
  /** 搜索框占位文字 */
  placeholder?: string;
}

/** 搜索栏（Client Component）— 按回车或点击按钮触发搜索 */
export default function SearchBar({
  placeholder = "搜索商品...",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");

  /** 提交搜索——通过 URL params 跳转 */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    // 保留当前分类筛选
    const category = searchParams.get("category");
    if (category) params.set("category", category);
    if (value.trim()) {
      params.set("q", value.trim());
    }
    const qs = params.toString();
    router.push(`/products${qs ? `?${qs}` : ""}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-4 pr-12 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        搜索
      </button>
    </form>
  );
}
