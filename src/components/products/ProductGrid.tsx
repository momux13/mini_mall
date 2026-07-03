import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: {
    slug: string;
    name: string;
    price: number;
    imageUrl?: string | null;
    categoryName?: string;
    categorySlug?: string;
  }[];
}

/** 商品网格（RSC） */
export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.slug} {...product} />
      ))}
    </div>
  );
}
