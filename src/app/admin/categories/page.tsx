import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteCategoryButton from "./DeleteCategoryButton";

/** 分类管理列表（RSC） */
export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">分类管理</h1>
        <Link
          href="/admin/categories/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          + 新增分类
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">名称</th>
              <th className="text-left px-4 py-3 font-medium">标识</th>
              <th className="text-left px-4 py-3 font-medium">描述</th>
              <th className="text-center px-4 py-3 font-medium">商品数</th>
              <th className="text-right px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {cat.name}
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                  {cat.slug}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {cat.description || "—"}
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {cat._count.products}
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteCategoryButton
                    id={cat.id}
                    name={cat.name}
                    productCount={cat._count.products}
                  />
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  暂无分类数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
