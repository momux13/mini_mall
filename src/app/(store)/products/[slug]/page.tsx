import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import ProductImage from "@/components/products/ProductImage";
import AddToCartButton from "@/components/products/AddToCartButton";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** 商品详情页——展示完整商品信息 */
export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: { select: { name: true, slug: true } } },
  });

  if (!product || !product.isPublished) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 面包屑 */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">
          首页
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-blue-600"
        >
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* 商品详情 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左侧图片 */}
        <div className="aspect-square rounded-lg overflow-hidden">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            categorySlug={product.category.slug}
            colorClass="from-blue-100 to-indigo-100 text-blue-600"
            className="h-full rounded-lg"
          />
        </div>

        {/* 右侧信息 */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

          <Link
            href={`/products?category=${product.category.slug}`}
            className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            {product.category.name}
          </Link>

          {/* 价格 */}
          <p className="mt-6 text-3xl font-bold text-red-600">
            {formatPrice(product.price)}
          </p>

          {/* 描述 */}
          <div className="mt-6">
            <h2 className="text-sm font-medium text-gray-900 mb-2">
              商品描述
            </h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* 库存 */}
          <div className="mt-6">
            <span className="text-sm text-gray-500">
              库存：
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium">
                  {product.stock} 件
                </span>
              ) : (
                <span className="text-red-600 font-medium">暂时缺货</span>
              )}
            </span>
          </div>

          {/* 加入购物车按钮 */}
          <AddToCartButton productId={product.id} stock={product.stock} />
        </div>
      </div>
    </div>
  );
}
