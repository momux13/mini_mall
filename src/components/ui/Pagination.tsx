"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

/** 分页导航（Client Component） */
export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  /** 生成页码并跳转 */
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    router.push(`/products${qs ? `?${qs}` : ""}`);
  };

  // 生成页码列表（含省略号）
  const pages: (number | "...")[] = [];
  const delta = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="分页导航">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          "px-3 py-2 text-sm rounded-md border border-gray-200",
          "hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        上一页
      </button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={cn(
              "px-3 py-2 text-sm rounded-md border",
              page === currentPage
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-200 hover:bg-gray-100"
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          "px-3 py-2 text-sm rounded-md border border-gray-200",
          "hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        )}
      >
        下一页
      </button>
    </nav>
  );
}
