"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/auth-actions";
import type { ActionResult } from "@/types";

/** 登录表单（Client Component） */
export default function LoginForm() {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(loginAction, null);

  return (
    <div>
      <h1 className="text-xl font-semibold text-center mb-6">登录</h1>

      <form action={formAction} className="space-y-4">
        {/* 邮箱 */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            邮箱
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="请输入邮箱地址"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* 密码 */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="请输入密码"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* 错误提示 */}
        {state && !state.success && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
            {state.error}
          </p>
        )}

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {pending ? "登录中..." : "登录"}
        </button>
      </form>

      {/* 跳转注册 */}
      <p className="mt-4 text-center text-sm text-gray-500">
        还没有账号？
        <Link href="/register" className="text-blue-600 hover:text-blue-700 ml-1">
          立即注册
        </Link>
      </p>
    </div>
  );
}
