"use client";

import { useTransition } from "react";
import { updateCartQuantityAction, removeFromCartAction } from "@/lib/cart-actions";
import { formatPrice } from "@/lib/utils";
import ProductImage from "@/components/products/ProductImage";
import { getColorClass } from "@/components/products/ProductCard";

interface CartItemRowProps {
  id: string;
  productName: string;
  productImageUrl: string | null;
  categorySlug: string;
  price: number;
  quantity: number;
  stock: number;
}

/** 购物车单项（Client Component）——数量调整、删除 */
export default function CartItemRow({
  id,
  productName,
  productImageUrl,
  categorySlug,
  price,
  quantity,
  stock,
}: CartItemRowProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (newQty: number) => {
    if (newQty < 1 || newQty > stock) return;
    startTransition(async () => {
      await updateCartQuantityAction(id, newQty);
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      await removeFromCartAction(id);
    });
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* 商品图片 */}
      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
        <ProductImage
          src={productImageUrl}
          alt={productName}
          categorySlug={categorySlug}
          colorClass={getColorClass(productName)}
          className="h-full"
        />
      </div>

      {/* 商品信息 */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {productName}
        </h3>
        <p className="mt-1 text-sm font-bold text-red-600">
          {formatPrice(price)}
        </p>
      </div>

      {/* 数量控制 */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleUpdate(quantity - 1)}
          disabled={isPending || quantity <= 1}
          className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
        >
          −
        </button>
        <span className="w-10 text-center text-sm font-medium">
          {quantity}
        </span>
        <button
          onClick={() => handleUpdate(quantity + 1)}
          disabled={isPending || quantity >= stock}
          className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
        >
          +
        </button>
      </div>

      {/* 小计 */}
      <div className="w-24 text-right">
        <p className="text-sm font-bold text-gray-900">
          {formatPrice(price * quantity)}
        </p>
        {quantity >= stock && (
          <p className="text-xs text-orange-500 mt-0.5">已达库存上限</p>
        )}
      </div>

      {/* 删除 */}
      <button
        onClick={handleRemove}
        disabled={isPending}
        className="text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
        title="删除"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
