import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

/** 购物车图标——Header 中使用，显示商品数量角标 */
export default async function CartIcon() {
  const session = await getServerSession();
  if (!session) return null;

  const count = await prisma.cartItem.count({
    where: { userId: session.id },
  });

  return (
    <Link href="/cart" className="relative p-1" aria-label="购物车">
      <svg
        className="w-6 h-6 text-gray-600 hover:text-blue-600 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold px-1">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
