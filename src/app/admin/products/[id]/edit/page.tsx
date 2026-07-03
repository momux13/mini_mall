import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/products/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

/** 编辑商品页 */
export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">编辑商品</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <ProductForm
          initialData={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            stock: product.stock,
            imageUrl: product.imageUrl,
            categoryId: product.categoryId,
            isPublished: product.isPublished,
          }}
          categories={categories}
        />
      </div>
    </div>
  );
}
