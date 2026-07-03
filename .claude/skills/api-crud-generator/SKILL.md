---
name: api-crud-generator
version: 2.0
description: 根据 Prisma 模型生成标准 Server Actions + 前端管理页面（适配 Mini Mall 架构）
trigger: ["生成CRUD", "生成接口", "生成管理页面"]
---

# API CRUD 生成器

## 功能说明
根据指定的 Prisma 模型，自动生成符合本项目管理后台规范的标准 CRUD 代码：
1. **Server Actions**（`src/lib/*-actions.ts`）：create / update / delete 操作
2. **前端管理页面**：数据列表页 + 创建/编辑表单
3. **zod 校验**：根据需要补充校验 schema

## 项目技术约定

- **后端变更：** Server Actions Only（`"use server"`），不设 Route Handlers
- **数据读取：** RSC 页面直接调用 `prisma.model.findMany()`
- **表单提交：** Client Component + `useActionState` + Server Action
- **返回类型：** `ActionResult<T>`（来自 `src/types/index.ts`）
- **缓存：** Action 内部 `revalidatePath()` 刷新
- **价格约定：** 整数（分）存储，展示用 `formatPrice()`（`src/lib/utils.ts`）
- **ID 约定：** `cuid()`，非自增
- **UI 文案：** 全部中文
- **代码注释：** 中文
- **样式：** TailwindCSS 4 + `cn()` 工具函数
- **状态流转：** 订单模型需校验 `ORDER_STATUS_TRANSITIONS`（`src/lib/constants.ts`）

## 目录约定

```
根据模型类型生成到对应的 admin 路由目录下：

admin/products/        → 页面文件
lib/product-actions.ts → Server Actions

admin/categories/        → 页面文件
lib/category-actions.ts  → Server Actions

admin/orders/            → 页面文件
lib/order-actions.ts     → Server Actions
```

## 执行步骤

### 第 1 步：确认模型信息
询问用户：
- 要生成的模型名称（如 Product、Category、Order）
- 是否需要单独的管理页面，还是将 list/new/edit 放在一起

### 第 2 步：生成 Server Actions
在 `src/lib/<model>-actions.ts` 中生成，遵循以下模式：

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { productSchema } from "@/types";
import type { ActionResult } from "@/types";

export async function createProductAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  // 1. 权限检查：getServerSession() → role === "ADMIN"
  // 2. zod 校验：productSchema.safeParse()
  // 3. 数据库操作：prisma.model.create()
  // 4. revalidatePath("/admin/...")
  // 5. redirect("/admin/...") 或 return { success: true }
}
```

**生成 3 个 Action：** `create*Action`、`update*Action`、`delete*Action`

**各模型特殊处理：**
- **Product：** `price` 是整数（分），表单输入需 `z.coerce.number()`；关联 categoryId 下拉
- **Category：** `slug` 自动从 name 生成（调用 `slugify()`）；删除前检查 `_count.products`
- **Order：** 只有 `updateOrderStatusAction`，需校验 `ORDER_STATUS_TRANSITIONS`
- **User：** 密码用 `bcryptjs.hash()`，绝不通过列表 API 返回 password 字段

### 第 3 步：生成前端管理页面

**列表页（RSC）：**
```typescript
// src/app/admin/<model>/page.tsx
// Server Component，直接 prisma.model.findMany()
// 传递数据给 DataTable Client 组件
```

**新建页（Client）：**
```typescript
"use client";
// src/app/admin/<model>/new/page.tsx
// useActionState + Server Action
// 表单包含模型所有可编辑字段
```

**编辑页（RSC 包装 → Client 表单）：**
```typescript
// src/app/admin/<model>/[id]/edit/page.tsx
// RSC: prisma.model.findUnique(id) + 关联数据
// Client: ProductForm initialData={product}
```

### 第 4 步：补充 zod schema（如需要）
在 `src/types/index.ts` 中补充对应模型的校验 schema，如：
```typescript
export const productSchema = z.object({
  name: z.string().min(1, "请输入商品名称"),
  price: z.coerce.number().min(1, "价格必须大于 0"),
  // ...
});
```

### 第 5 步：确认并验证
- 列出所有生成和修改的文件
- 确认路径和命名符合项目规范
- 提醒验证方式：
  - `npm run dev` 启动后访问对应 admin 路由
  - 测试新增、编辑、删除操作
  - 确认 `revalidatePath` 生效

## 生成清单模板

```
生成的文件：
  ✓ src/lib/<model>-actions.ts   — create/update/delete Server Actions
  ✓ src/app/admin/<model>/page.tsx            — 列表页（RSC）
  ✓ src/app/admin/<model>/new/page.tsx        — 新建页（Client）
  ✓ src/app/admin/<model>/[id]/edit/page.tsx  — 编辑页（RSC + Client）
  
修改的文件：
  Δ src/types/index.ts           — 补充校验 schema（如需要）
```

## 注意事项
- 不生成 route.ts 文件（本项目使用 Server Actions）
- 不生成客户端 fetch 调用（使用 useActionState）
- 列表页数据获取在 RSC 中直接调 prisma，不通过 Action
- 所有表单校验同时做服务端（zod in Action）和客户端（zod schema 复用）
- 关联数据（如 ProductForm 中的 Category 下拉）从 RSC 传入
