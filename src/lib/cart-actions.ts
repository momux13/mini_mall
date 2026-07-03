"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import type { ActionResult } from "@/types";

/** 加入购物车 */
export async function addToCartAction(
  productId: string,
  quantity: number = 1
): Promise<ActionResult<{ count: number }>> {
  const session = await getServerSession();
  if (!session) {
    return { success: false, error: "请先登录" };
  }

  // 校验数量合法性，防止负数/零值注入
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { success: false, error: "数量必须为正整数" };
  }

  // 检查商品是否存在且已上架
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product || !product.isPublished) {
    return { success: false, error: "商品不存在或已下架" };
  }

  // 检查库存
  const existingCartItem = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: session.id, productId } },
  });
  const currentQty = existingCartItem?.quantity ?? 0;
  if (currentQty + quantity > product.stock) {
    return {
      success: false,
      error: `库存不足，当前库存 ${product.stock} 件，购物车已有 ${currentQty} 件`,
    };
  }

  // upsert：同商品存在则 increment 数量
  await prisma.cartItem.upsert({
    where: {
      userId_productId: { userId: session.id, productId },
    },
    update: { quantity: { increment: quantity } },
    create: { userId: session.id, productId, quantity },
  });

  revalidatePath("/cart");

  // 统计当前购物车商品数
  const count = await prisma.cartItem.count({
    where: { userId: session.id },
  });

  return { success: true, data: { count } };
}

/** 更新购物车商品数量 */
export async function updateCartQuantityAction(
  cartItemId: string,
  quantity: number
): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session) {
    return { success: false, error: "请先登录" };
  }

  if (quantity < 1) {
    return { success: false, error: "数量不能小于 1" };
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });
  if (!item || item.userId !== session.id) {
    return { success: false, error: "购物车商品不存在" };
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  revalidatePath("/cart");
  return { success: true };
}

/** 从购物车移除商品 */
export async function removeFromCartAction(
  cartItemId: string
): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session) {
    return { success: false, error: "请先登录" };
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });
  if (!item || item.userId !== session.id) {
    return { success: false, error: "购物车商品不存在" };
  }

  await prisma.cartItem.delete({ where: { id: cartItemId } });

  revalidatePath("/cart");
  return { success: true };
}
