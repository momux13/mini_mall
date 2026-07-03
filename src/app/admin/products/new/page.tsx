import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/products/ProductForm";

/** 新增商品页 */
export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新增商品</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
