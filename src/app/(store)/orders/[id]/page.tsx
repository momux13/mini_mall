import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import OrderItems from "@/components/orders/OrderItems";
import PayButton from "./PayButton";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

/** 订单详情页 */
export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const session = await getServerSession();

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
        请先登录
      </div>
    );
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, slug: true, imageUrl: true },
          },
        },
      },
    },
  });

  if (!order || order.userId !== session.id) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 订单头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">订单详情</h1>
          <p className="text-sm text-gray-500 mt-1">{order.orderNumber}</p>
        </div>
        <OrderStatusBadge status={order.status} className="text-sm px-3 py-1" />
      </div>

      {/* 订单时间 */}
      <p className="text-sm text-gray-400 mb-6">
        下单时间：
        {new Date(order.createdAt).toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      {/* 商品明细 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">商品明细</h2>
        <OrderItems items={order.items} />
      </div>

      {/* 收货信息 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">收货信息</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p>收货人：{order.shippingName}</p>
          <p>地址：{order.shippingAddress}</p>
          {order.shippingPhone && <p>电话：{order.shippingPhone}</p>}
          {order.note && <p>备注：{order.note}</p>}
        </div>
      </div>

      {/* 合计 + 操作 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            共 {order.items.reduce((s, i) => s + i.quantity, 0)} 件
          </span>
          <span className="text-xl font-bold text-red-600">
            {formatPrice(order.totalAmount)}
          </span>
        </div>

        {/* 模拟支付按钮 */}
        {order.status === "PENDING" && (
          <PayButton orderId={order.id} />
        )}
      </div>
    </div>
  );
}
