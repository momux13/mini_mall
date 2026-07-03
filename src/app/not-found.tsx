import Link from "next/link";

/** 404 页面 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-xl font-medium text-gray-900 mb-2">
          页面未找到
        </h2>
        <p className="text-gray-500 mb-6">
          您访问的页面不存在或已下架
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
