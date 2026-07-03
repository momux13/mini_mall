import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import DeleteProductButton from "./DeleteProductButton";

/** 商品管理列表（RSC） */
export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">商品管理</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          + 新增商品
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium">名称</th>
                <th className="text-left px-4 py-3 font-medium">分类</th>
                <th className="text-right px-4 py-3 font-medium">价格</th>
                <th className="text-right px-4 py-3 font-medium">库存</th>
                <th className="text-center px-4 py-3 font-medium">状态</th>
                <th className="text-right px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-gray-900 font-medium">{p.name}</span>
                    <span className="text-gray-400 text-xs ml-1">/{p.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.category.name}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 font-medium">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {p.stock}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.isPublished ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                        已上架
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                        未上架
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-blue-600 hover:text-blue-700 text-xs"
                      >
                        编辑
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    暂无商品数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
