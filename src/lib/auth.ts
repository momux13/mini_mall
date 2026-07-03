import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET 环境变量未设置，请检查 .env 文件");
}
// 拒绝弱密钥/占位符，防止生产环境中使用默认值导致 JWT 可被伪造
if (secret.includes("change-in-production") || secret.length < 32) {
  throw new Error(
    "JWT_SECRET 不安全：请使用强随机密钥（运行: openssl rand -base64 48 生成）"
  );
}
const JWT_SECRET = new TextEncoder().encode(secret);

const COOKIE_NAME = "token";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 天

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/** 哈希密码 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** 验证密码 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** 签发 JWT 并写入 httpOnly Cookie */
export async function setSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** 从 Cookie 读取并验证 JWT，返回 SessionUser 或 null */
export async function getServerSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

/** 获取当前用户完整信息（含 DB 最新数据） */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, role: true },
  });
  return user ?? null;
}

/** 清除 Session Cookie */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** 要求管理员权限，否则抛出错误（用于后台接口保护） */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("无权限访问");
  }
  return session;
}
