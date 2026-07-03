import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";

/** 订单管理列表（RSC） */
export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">订单管理</h1>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium">订单号</th>
                <th className="text-left px-4 py-3 font-medium">用户</th>
                <th className="text-right px-4 py-3 font-medium">金额</th>
                <th className="text-center px-4 py-3 font-medium">状态</th>
                <th className="text-left px-4 py-3 font-medium">时间</th>
                <th className="text-right px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.user.name}
                    <br />
                    <span className="text-xs text-gray-400">{order.user.email}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 font-medium">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-700 text-xs"
                    >
                      详情
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    暂无订单数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
