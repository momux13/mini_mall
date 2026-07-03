import Link from "next/link";
import { getServerSession } from "@/lib/auth";
import LogoutButton from "./LogoutButton";
import CartIcon from "@/components/cart/CartIcon";

/** 商城头部导航——根据登录状态显示不同菜单 */
export default async function Header() {
  const session = await getServerSession();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          🛒 Mini Mall
        </Link>

        {/* 主导航 */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/products" className="hover:text-blue-600 transition-colors">
            全部商品
          </Link>
          {session && (
            <>
              <Link href="/cart" className="hover:text-blue-600 transition-colors">
                购物车
              </Link>
              <Link href="/orders" className="hover:text-blue-600 transition-colors">
                我的订单
              </Link>
            </>
          )}
        </nav>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <CartIcon />
              <Link
                href="/profile"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                {session.name}
              </Link>
              {session.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  后台管理
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="text-sm px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
