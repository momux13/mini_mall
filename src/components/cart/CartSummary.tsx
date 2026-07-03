import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface CartSummaryProps {
  totalAmount: number;
  itemCount: number;
}

/** 购物车底部汇总（RSC 兼容） */
export default function CartSummary({
  totalAmount,
  itemCount,
}: CartSummaryProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">
          共 {itemCount} 件商品
        </span>
        <span className="text-sm text-gray-500">合计</span>
      </div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-2xl font-bold text-red-600">
          {formatPrice(totalAmount)}
        </span>
      </div>
      <Link
        href="/checkout"
        className="block w-full py-3 bg-blue-600 text-white text-center font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        提交订单
      </Link>
    </div>
  );
}
