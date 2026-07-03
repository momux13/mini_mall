import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import OrderCard from "@/components/orders/OrderCard";
import EmptyState from "@/components/ui/EmptyState";

/** 我的订单列表 */
export default async function OrdersPage() {
  const session = await getServerSession();
  if (!session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState title="请先登录" description="登录后即可查看订单" />
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">我的订单</h1>

      {orders.length === 0 ? (
        <EmptyState
          title="暂无订单"
          description="去逛逛商品，下单后这里会显示订单信息"
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              id={order.id}
              orderNumber={order.orderNumber}
              status={order.status}
              totalAmount={order.totalAmount}
              createdAt={order.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
