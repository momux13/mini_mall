import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";

/** 结算页——确认订单信息 + 填写收货地址 */
export default async function CheckoutPage() {
  const session = await getServerSession();
  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState title="请先登录" description="登录后即可结算" />
      </div>
    );
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.id },
    include: {
      product: {
        select: { id: true, name: true, slug: true, price: true, stock: true, isPublished: true },
      },
    },
  });

  const validItems = items.filter((i) => i.product.isPublished);

  if (validItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState
          title="购物车是空的"
          description={
            <>
              <Link href="/products" className="text-blue-600 hover:text-blue-700">
                去逛逛商品
              </Link>
              ，把喜欢的加入购物车吧
            </>
          }
        />
      </div>
    );
  }

  const totalAmount = validItems.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );
  const itemCount = validItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">确认订单</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* 左侧：收货信息 */}
        <div className="md:col-span-3">
          <h2 className="text-lg font-medium mb-4">收货信息</h2>
          <CheckoutForm itemCount={itemCount} />
        </div>

        {/* 右侧：订单摘要 */}
        <div className="md:col-span-2">
          <h2 className="text-lg font-medium mb-4">订单摘要</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="space-y-2">
              {validItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate flex-1 mr-2">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="text-gray-900 font-medium">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
              <span className="text-sm font-medium text-gray-700">合计</span>
              <span className="text-lg font-bold text-red-600">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
