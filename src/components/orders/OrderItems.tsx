import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface OrderItemData {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    slug: string;
    imageUrl: string | null;
  } | null;
}

interface OrderItemsProps {
  items: OrderItemData[];
}

/** 订单商品明细列表（RSC） */
export default function OrderItems({ items }: OrderItemsProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
        >
          {/* 商品图占位 */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
            {item.product ? item.product.name[0] : "?"}
          </div>

          <div className="flex-1 min-w-0">
            {item.product ? (
              <Link
                href={`/products/${item.product.slug}`}
                className="text-sm text-gray-900 hover:text-blue-600 truncate block"
              >
                {item.product.name}
              </Link>
            ) : (
              <span className="text-sm text-gray-400">商品已下架</span>
            )}
            <p className="text-xs text-gray-500 mt-0.5">
              {formatPrice(item.price)} × {item.quantity}
            </p>
          </div>

          <div className="text-sm font-medium text-gray-900">
            {formatPrice(item.price * item.quantity)}
          </div>
        </div>
      ))}
    </div>
  );
}
