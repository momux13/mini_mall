import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS, ORDER_STATUS_TRANSITIONS } from "@/lib/constants";
import type { OrderStatus } from "@/lib/constants";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import OrderItems from "@/components/orders/OrderItems";
import AdminStatusUpdate from "./AdminStatusUpdate";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

/** 后台订单详情——含状态流转操作 */
export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { name: true, slug: true, imageUrl: true } },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const currentStatus = order.status as OrderStatus;
  const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus] ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">订单详情</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：订单信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              基本信息
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                订单号：<span className="font-mono text-gray-900">{order.orderNumber}</span>
              </p>
              <p>
                状态：<OrderStatusBadge status={order.status} />
              </p>
              <p>
                下单时间：
                {new Date(order.createdAt).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* 商品明细 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              商品明细
            </h2>
            <OrderItems items={order.items} />
          </div>
        </div>

        {/* 右侧：用户 + 金额 + 操作 */}
        <div className="space-y-6">
          {/* 用户信息 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              用户信息
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{order.user.name}</p>
              <p className="text-xs text-gray-400">{order.user.email}</p>
            </div>
          </div>

          {/* 收货信息 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-medium text-gray-700 mb-3">
              收货信息
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>收货人：{order.shippingName}</p>
              <p>地址：{order.shippingAddress}</p>
              {order.shippingPhone && <p>电话：{order.shippingPhone}</p>}
              {order.note && <p>备注：{order.note}</p>}
            </div>
          </div>

          {/* 金额 + 状态操作 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">合计</span>
              <span className="text-xl font-bold text-red-600">
                {formatPrice(order.totalAmount)}
              </span>
            </div>

            {/* 状态流转按钮 */}
            {allowedTransitions.length > 0 && (
              <AdminStatusUpdate
                orderId={order.id}
                currentStatus={currentStatus}
                allowedTransitions={allowedTransitions}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
