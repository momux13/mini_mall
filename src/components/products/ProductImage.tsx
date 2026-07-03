"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CATEGORY_EMOJI } from "@/lib/constants";

interface ProductImageProps {
  src: string | null;
  alt: string;
  /** 分类 slug，用于选择 emoji */
  categorySlug?: string;
  /** 根据名称生成稳定的背景色 */
  colorClass: string;
  className?: string;
}

/** 商品图片（Client Component），加载失败或图片为空时显示分类 emoji */
export default function ProductImage({
  src,
  alt,
  categorySlug,
  colorClass,
  className,
}: ProductImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    const emoji = categorySlug ? CATEGORY_EMOJI[categorySlug] ?? "📦" : "📦";
    return (
      <div
        className={cn(
          "bg-gradient-to-br flex flex-col items-center justify-center gap-2",
          colorClass,
          className
        )}
      >
        <span className="text-4xl">{emoji}</span>
        <span className="text-xs opacity-50 px-2 text-center line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      <img
        src={src}
        alt={alt}
        onError={() => setError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
