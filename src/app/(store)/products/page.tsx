import { prisma } from "@/lib/prisma";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import ProductGrid from "@/components/products/ProductGrid";
import SearchBar from "@/components/products/SearchBar";
import CategoryFilter from "@/components/products/CategoryFilter";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
}

/** 商品列表页——支持搜索、分类筛选、分页 */
export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const categorySlug = params.category || "";
  const page = Math.max(1, parseInt(params.page || "1"));

  // 构建查询条件
  const where = {
    isPublished: true,
    ...(query
      ? { name: { contains: query } }
      : {}),
    ...(categorySlug
      ? { category: { slug: categorySlug } }
      : {}),
  };

  // 并行获取商品、总数、分类
  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const productItems = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    price: p.price,
    imageUrl: p.imageUrl,
    categoryName: p.category.name,
    categorySlug: p.category.slug,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 页面标题 */}
      <h1 className="text-2xl font-bold mb-6">全部商品</h1>

      {/* 搜索 + 分类筛选 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <SearchBar />
      </div>

      <CategoryFilter
        categories={categories}
        active={categorySlug}
        query={query}
      />

      {/* 结果概览 */}
      <div className="mt-6 mb-4 text-sm text-gray-500">
        {query && (
          <span>
            搜索 &quot;{query}&quot; —{" "}
          </span>
        )}
        共 {total} 件商品
      </div>

      {/* 商品网格 */}
      {productItems.length > 0 ? (
        <>
          <ProductGrid products={productItems} />
          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      ) : (
        <EmptyState
          title="没有找到商品"
          description={query ? `未搜索到与 "${query}" 相关的商品` : "暂无上架商品"}
        />
      )}
    </div>
  );
}
