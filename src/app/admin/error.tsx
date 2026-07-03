"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** 后台管理错误边界 */
export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Admin Error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-full py-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-300 mb-4">出错了</h1>
        <p className="text-gray-500 mb-6">
          后台页面加载出现问题
        </p>
        <button
          onClick={reset}
          className="px-5 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  );
}
