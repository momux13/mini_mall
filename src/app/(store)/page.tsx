import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORY_EMOJI } from "@/lib/constants";
import ProductGrid from "@/components/products/ProductGrid";

/** 首页——精选商品 + 分类导航 */
export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    // 精选商品：最新发布的 9 个已上架商品
    prisma.product.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 9,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    }),
  ]);

  const products = featuredProducts.map((p) => ({
    slug: p.slug,
    name: p.name,
    price: p.price,
    imageUrl: p.imageUrl,
    categoryName: p.category.name,
    categorySlug: p.category.slug,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero 区域 */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          🛒 欢迎来到 Mini Mall
        </h1>
        <p className="text-gray-500 text-lg">
          微型电商练习项目，从浏览到下单，完整闭环
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/products"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            浏览商品
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            注册账号
          </Link>
        </div>
      </div>

      {/* 分类导航卡片 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">商品分类</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <span className="text-2xl mb-2">
                {CATEGORY_EMOJI[cat.slug] ?? "📦"}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {cat.name}
              </span>
              <span className="text-xs text-gray-400 mt-0.5">
                {cat._count.products} 件
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 精选商品 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">精选商品</h2>
          <Link
            href="/products"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            查看全部 →
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>
    </div>
  );
}
