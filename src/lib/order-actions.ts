"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { ORDER_STATUS_TRANSITIONS } from "@/lib/constants";
import type { OrderStatus } from "@/lib/constants";
import type { ActionResult } from "@/types";

/** 从购物车创建订单——事务中：创建订单 + 订单项 + 扣库存 + 清空购物车 */
export async function createOrderAction(
  shippingName: string,
  shippingAddress: string,
  shippingPhone?: string,
  note?: string
): Promise<ActionResult<{ orderId: string }>> {
  const session = await getServerSession();
  if (!session) {
    return { success: false, error: "请先登录" };
  }

  // 获取购物车所有商品
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.id },
    include: {
      product: { select: { id: true, name: true, price: true, stock: true, isPublished: true } },
    },
  });

  if (cartItems.length === 0) {
    return { success: false, error: "购物车是空的" };
  }

  // 检查库存
  const insufficientStock = cartItems.filter(
    (item) => item.quantity > item.product.stock
  );
  if (insufficientStock.length > 0) {
    const names = insufficientStock
      .map((i) => `${i.product.name}（库存 ${i.product.stock}，购物车 ${i.quantity}）`)
      .join("、");
    return { success: false, error: `以下商品库存不足：${names}` };
  }

  // 计算总价
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // 事务：创建订单 + 订单项 + 扣库存 + 清空购物车
  const order = await prisma.$transaction(async (tx) => {
    // 1. 创建订单
    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: "PENDING",
        totalAmount,
        shippingName,
        shippingAddress,
        shippingPhone: shippingPhone || null,
        note: note || null,
        userId: session.id,
      },
    });

    // 2. 创建订单项 + 扣库存
    for (const item of cartItems) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price, // 下单时价格快照
        },
      });
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // 3. 清空购物车
    await tx.cartItem.deleteMany({
      where: { userId: session.id },
    });

    return order;
  });

  revalidatePath("/orders");
  revalidatePath("/cart");
  redirect(`/orders/${order.id}`);
}

/** 更新订单状态（模拟支付等操作） */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string
): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session) {
    return { success: false, error: "请先登录" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return { success: false, error: "订单不存在" };
  }

  // 权限：只有订单所属用户或管理员可以修改
  if (order.userId !== session.id && session.role !== "ADMIN") {
    return { success: false, error: "无权限操作" };
  }

  // 管理员专属操作：发货(SHIPPED)、送达(DELIVERED) 禁止用户自行操作
  const adminOnlyStatuses: OrderStatus[] = ["SHIPPED", "DELIVERED"];
  if (
    adminOnlyStatuses.includes(newStatus as OrderStatus) &&
    session.role !== "ADMIN"
  ) {
    return { success: false, error: "无权限操作" };
  }

  // 校验状态流转合法性
  const currentStatus = order.status as OrderStatus;
  const allowedTransitions =
    ORDER_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowedTransitions.includes(newStatus as OrderStatus)) {
    return {
      success: false,
      error: `不允许从「${currentStatus}」变更为「${newStatus}」`,
    };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  return { success: true };
}
