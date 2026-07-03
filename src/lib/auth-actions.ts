"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, setSession, clearSession } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/types";
import type { ActionResult } from "@/types";

/** 注册 */
export async function registerAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  // 1. 校验输入
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  // 2. 检查邮箱唯一性
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "该邮箱已被注册" };
  }

  // 3. 创建用户
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  // 4. 签发 session
  await setSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  redirect("/");
}

/** 登录 */
export async function loginAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  // 1. 校验输入
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  // 2. 查找用户 + 验证密码
  // 防撞库：不区分"用户不存在"和"密码错误"
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.password))) {
    return { success: false, error: "邮箱或密码错误" };
  }

  // 3. 签发 session
  await setSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  redirect("/");
}

/** 退出登录 */
export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/");
}
