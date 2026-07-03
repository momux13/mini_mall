"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/profile-actions";
import type { ActionResult } from "@/types";

interface ProfileFormProps {
  name: string;
  email: string;
}

/** 个人资料编辑表单（Client Component） */
export default function ProfileForm({ name, email }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(updateProfileAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {/* 邮箱（只读） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          邮箱
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-500"
        />
      </div>

      {/* 姓名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          姓名
        </label>
        <input
          name="name"
          type="text"
          required
          defaultValue={name}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* 新密码（可选） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          新密码（留空不修改）
        </label>
        <input
          name="password"
          type="password"
          placeholder="至少 6 位"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* 反馈 */}
      {state && (
        <p
          className={`text-sm px-3 py-2 rounded-md ${
            state.success
              ? "text-green-600 bg-green-50"
              : "text-red-600 bg-red-50"
          }`}
        >
          {state.success ? "保存成功" : state.error}
        </p>
      )}

      {/* 提交 */}
      <button
        type="submit"
        disabled={pending}
        className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {pending ? "保存中..." : "保存修改"}
      </button>
    </form>
  );
}
