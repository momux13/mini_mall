"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { categorySchema } from "@/types";
import type { ActionResult } from "@/types";

/** 创建分类（管理员） */
export async function createCategoryAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "无权限操作" };
  }

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string || slugify(name);
  const description = formData.get("description") as string;

  const parsed = categorySchema.safeParse({ name, description });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // 检查唯一性
  const existing = await prisma.category.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) {
    return {
      success: false,
      error: existing.name === name ? "分类名称已存在" : "分类标识已存在",
    };
  }

  await prisma.category.create({
    data: { name, slug, description: description || null },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

/** 删除分类（管理员）——仅无商品关联时允许删除 */
export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "无权限操作" };
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!category) {
    return { success: false, error: "分类不存在" };
  }

  if (category._count.products > 0) {
    return {
      success: false,
      error: `该分类下有 ${category._count.products} 件商品，无法删除`,
    };
  }

  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/categories");
  return { success: true };
}
