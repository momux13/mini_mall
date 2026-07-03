import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET 环境变量未设置，请检查 .env 文件");
}
const JWT_SECRET = new TextEncoder().encode(secret);

/** 需要登录的路由前缀 */
const PROTECTED_ROUTES = ["/cart", "/checkout", "/orders", "/profile"];

/** 需要管理员权限的路由前缀 */
const ADMIN_ROUTES = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 静态资源跳过
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  /** 302 重定向到登录页 */
  const redirectToLogin = () => {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // 登录成功后回到原页面
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  };

  /** 302 重定向到首页 */
  const redirectToHome = () => {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  };

  // ── 管理员路由：需要 token + ADMIN 角色 ──
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!token) return redirectToLogin();
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role !== "ADMIN") return redirectToHome();
    } catch {
      return redirectToLogin();
    }
    return NextResponse.next();
  }

  // ── 需要登录的路由 ──
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!token) return redirectToLogin();
    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      return redirectToLogin();
    }
    return NextResponse.next();
  }

  // ── 已登录用户访问 /login、/register 自动跳转首页 ──
  if (pathname === "/login" || pathname === "/register") {
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return redirectToHome();
      } catch {
        // Token 无效，允许继续访问登录/注册页
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
