/** 购物车加载骨架屏 */
export default function CartLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-24 mb-6" />
      <div className="bg-white rounded-lg border border-gray-200 px-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
            <div className="w-24 h-8 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
