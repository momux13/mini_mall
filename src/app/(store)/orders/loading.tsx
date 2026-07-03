/** 订单列表加载骨架屏 */
export default function OrdersLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-32 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-5 bg-gray-200 rounded w-16" />
            </div>
            <div className="flex justify-between">
              <div className="h-5 bg-gray-200 rounded w-20" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
