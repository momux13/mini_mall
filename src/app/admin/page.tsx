import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

/** 后台管理控制台——数据概览 */
export default async function AdminDashboardPage() {
  const [productCount, orderCount, userCount, paidOrders, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      // 只统计已支付/已发货/已送达的订单营收
      prisma.order.findMany({
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
        select: { totalAmount: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }),
    ]);

  const revenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const stats = [
    { label: "商品总数", value: productCount },
    { label: "订单总数", value: orderCount },
    { label: "用户总数", value: userCount },
    {
      label: "总营收",
      value: formatPrice(revenue),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">控制台</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* 最近订单 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-700">最近订单</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-2 font-medium">订单号</th>
                <th className="text-left px-4 py-2 font-medium">用户</th>
                <th className="text-left px-4 py-2 font-medium">金额</th>
                <th className="text-left px-4 py-2 font-medium">状态</th>
                <th className="text-left px-4 py-2 font-medium">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-900 font-mono text-xs">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {order.user.name}
                  </td>
                  <td className="px-4 py-2 text-gray-900">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
