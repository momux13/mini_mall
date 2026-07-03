import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import ProductImage from "./ProductImage";

interface ProductCardProps {
  slug: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  categoryName?: string;
  categorySlug?: string;
}

/** 根据名称生成稳定的背景色 */
function getColorClass(name: string): string {
  const colors = [
    "from-blue-100 to-indigo-100 text-blue-500",
    "from-pink-100 to-rose-100 text-pink-500",
    "from-green-100 to-emerald-100 text-green-500",
    "from-amber-100 to-orange-100 text-amber-500",
    "from-purple-100 to-violet-100 text-purple-500",
    "from-cyan-100 to-sky-100 text-cyan-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/** 商品卡片（RSC + Client 图片组件） */
export default function ProductCard({
  slug,
  name,
  price,
  imageUrl,
  categoryName,
  categorySlug,
}: ProductCardProps) {
  const colorClass = getColorClass(name);

  return (
    <Link
      href={`/products/${slug}`}
      className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all"
    >
      {/* 商品图片 */}
      <div className="aspect-square">
        <ProductImage
          src={imageUrl ?? null}
          alt={name}
          categorySlug={categorySlug}
          colorClass={colorClass}
          className="h-full"
        />
      </div>

      {/* 商品信息 */}
      <div className="p-4">
        {categoryName && (
          <p className="text-xs text-blue-600 mb-1">{categoryName}</p>
        )}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {name}
        </h3>
        <p className="mt-2 text-lg font-bold text-red-600">
          {formatPrice(price)}
        </p>
      </div>
    </Link>
  );
}
