"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** 导航链接配置 */
const LINKS = [
  { href: "/admin", label: "控制台", exact: true },
  { href: "/admin/products", label: "商品管理" },
  { href: "/admin/categories", label: "分类管理" },
  { href: "/admin/orders", label: "订单管理" },
];

/** 后台管理系统侧边栏（Client Component）——高亮当前路由 */
export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-gray-900 text-white min-h-screen flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-700">
        <Link href="/admin" className="text-lg font-bold text-white">
          🛒 后台管理
        </Link>
      </div>

      {/* 导航 */}
      <nav className="px-2 py-4 space-y-1">
        {LINKS.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                active
                  ? "bg-gray-700 text-white font-medium"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* 返回前台 */}
      <div className="px-2 mt-4">
        <Link
          href="/"
          className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white rounded-md transition-colors"
        >
          ← 返回商城
        </Link>
      </div>
    </aside>
  );
}
