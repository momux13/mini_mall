import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: {
    slug: string;
    name: string;
    _count?: { products?: number };
  }[];
  /** 当前选中分类 slug */
  active?: string;
  /** 当前搜索词，切换分类时保留 */
  query?: string;
}

/** 分类筛选标签栏（RSC）— 保留当前搜索词 */
export default function CategoryFilter({
  categories,
  active,
  query,
}: CategoryFilterProps) {
  /** 构建分类链接，保留搜索词参数 */
  const buildHref = (categorySlug?: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (categorySlug) params.set("category", categorySlug);
    const qs = params.toString();
    return `/products${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* 全部 */}
      <Link
        href={buildHref()}
        className={cn(
          "px-4 py-2 text-sm rounded-full border transition-colors",
          !active
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600"
        )}
      >
        全部
      </Link>

      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={buildHref(cat.slug)}
          className={cn(
            "px-4 py-2 text-sm rounded-full border transition-colors",
            active === cat.slug
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600"
          )}
        >
          {cat.name}
          {cat._count?.products != null && (
            <span className="ml-1 text-xs opacity-70">({cat._count.products})</span>
          )}
        </Link>
      ))}
    </div>
  );
}
