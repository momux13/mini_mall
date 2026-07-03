"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession, hashPassword } from "@/lib/auth";
import type { ActionResult } from "@/types";

/** 更新个人资料 */
export async function updateProfileAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session) {
    return { success: false, error: "请先登录" };
  }

  const name = formData.get("name") as string;
  const password = formData.get("password") as string;

  if (!name || name.length < 2) {
    return { success: false, error: "姓名至少 2 个字符" };
  }

  const updateData: { name: string; password?: string } = { name };

  if (password) {
    if (password.length < 6) {
      return { success: false, error: "密码至少 6 位" };
    }
    updateData.password = await hashPassword(password);
  }

  await prisma.user.update({
    where: { id: session.id },
    data: updateData,
  });

  revalidatePath("/profile");
  return { success: true };
}
