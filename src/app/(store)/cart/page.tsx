import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import EmptyState from "@/components/ui/EmptyState";
import CartItemRow from "@/components/cart/CartItemRow";
import CartSummary from "@/components/cart/CartSummary";

/** 购物车页面——RSC 获取数据，Client 组件处理交互 */
export default async function CartPage() {
  const session = await getServerSession();

  // 理论上 middleware 已拦截，但 RSC 层再次确认
  if (!session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          title="请先登录"
          description="登录后即可查看购物车"
        />
      </div>
    );
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          imageUrl: true,
          stock: true,
          isPublished: true,
          category: { select: { slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 过滤掉已下架商品
  const validItems = items.filter((item) => item.product.isPublished);

  if (validItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          title="购物车是空的"
          description="去逛逛商品，把喜欢的加入购物车吧"
        />
      </div>
    );
  }

  const totalAmount = validItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">购物车</h1>

      {/* 商品列表 */}
      <div className="bg-white rounded-lg border border-gray-200 px-4">
        {validItems.map((item) => (
          <CartItemRow
            key={item.id}
            id={item.id}
            productName={item.product.name}
            productImageUrl={item.product.imageUrl}
            categorySlug={item.product.category.slug}
            price={item.product.price}
            quantity={item.quantity}
            stock={item.product.stock}
          />
        ))}
      </div>

      {/* 底部汇总 */}
      <CartSummary
        totalAmount={totalAmount}
        itemCount={validItems.reduce((sum, i) => sum + i.quantity, 0)}
      />
    </div>
  );
}
