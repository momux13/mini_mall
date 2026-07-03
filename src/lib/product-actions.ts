"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { productSchema } from "@/types";
import type { ActionResult } from "@/types";

/** 创建商品（管理员） */
export async function createProductAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "无权限操作" };
  }

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    imageUrl: formData.get("imageUrl"),
    categoryId: formData.get("categoryId"),
    isPublished: formData.get("isPublished") === "true",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  // 检查 slug 唯一性
  const existing = await prisma.product.findUnique({
    where: { slug: data.slug },
  });
  if (existing) {
    return { success: false, error: "商品标识已存在" };
  }

  await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: Math.round(data.price * 100), // 元 → 分
      stock: data.stock,
      imageUrl: data.imageUrl || null,
      categoryId: data.categoryId,
      isPublished: data.isPublished ?? false,
    },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

/** 更新商品（管理员） */
export async function updateProductAction(
  id: string,
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "无权限操作" };
  }

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    imageUrl: formData.get("imageUrl"),
    categoryId: formData.get("categoryId"),
    isPublished: formData.get("isPublished") === "true",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  // 检查 slug 唯一性（排除自身）
  const existing = await prisma.product.findFirst({
    where: { slug: data.slug, id: { not: id } },
  });
  if (existing) {
    return { success: false, error: "商品标识已存在" };
  }

  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: Math.round(data.price * 100), // 元 → 分
      stock: data.stock,
      imageUrl: data.imageUrl || null,
      categoryId: data.categoryId,
      isPublished: data.isPublished ?? false,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  redirect("/admin/products");
}

/** 删除商品（管理员） */
export async function deleteProductAction(id: string): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "无权限操作" };
  }

  // 检查是否有关联的订单项
  const orderItemCount = await prisma.orderItem.count({
    where: { productId: id },
  });

  if (orderItemCount > 0) {
    return {
      success: false,
      error: `该商品已有关联的订单记录（${orderItemCount} 条），不可删除`,
    };
  }

  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  return { success: true };
}
