"use client";

import { logoutAction } from "@/lib/auth-actions";

/** 退出登录按钮（Client Component） */
export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="text-sm text-gray-500 hover:text-red-600 transition-colors"
      >
        退出
      </button>
    </form>
  );
}
