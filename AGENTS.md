# CLAUDE.md

Mini Mall — 微型电商项目，完整闭环：商品浏览 → 注册登录 → 购物车 → 下单（模拟支付）→ 后台管理。

## 技术栈

- **框架:** Next.js 16 (App Router)
- **语言:** TypeScript 5
- **数据库:** SQLite（单文件 `prisma/dev.db`）
- **ORM:** Prisma 7，使用 `@prisma/adapter-better-sqlite3` 驱动
- **样式:** TailwindCSS 4 + `clsx` + `tailwind-merge`（`cn()` 工具函数）
- **认证:** `jose`（JWT）+ httpOnly Cookie + `bcryptjs`
- **校验:** `zod`

## 项目结构

```
src/
├── app/
│   ├── layout.tsx                # 根布局
│   ├── globals.css               # @import "tailwindcss"
│   ├── (store)/                  # 商城主布局（Header+Footer）
│   │   ├── layout.tsx
│   │   ├── page.tsx              # 首页
│   │   ├── products/             # 商品列表 + [slug] 详情
│   │   ├── cart/                 # 购物车
│   │   ├── checkout/             # 结算
│   │   ├── orders/               # 订单列表 + [id] 详情
│   │   └── profile/              # 个人中心
│   ├── (auth)/                   # 认证布局（无 Header，居中卡片）
│   │   ├── login/
│   │   └── register/
│   └── admin/                    # 后台布局（左侧 Sidebar）
│       ├── products/             # 列表 + new + [id]/edit
│       ├── categories/           # 列表 + new
│       └── orders/               # 列表 + [id]
├── components/
│   ├── ui/                       # Button, Input, Select, Card, Badge, Modal, DataTable, Pagination, EmptyState, Loading
│   ├── layout/                   # Header, Footer, AdminSidebar
│   ├── products/                 # ProductCard, ProductGrid, ProductDetail, AddToCartButton, SearchBar, CategoryFilter
│   ├── cart/                     # CartItemRow, CartSummary, CartIcon
│   ├── checkout/                 # CheckoutForm
│   ├── orders/                   # OrderCard, OrderItems, OrderStatusBadge
│   └── auth/                     # LoginForm, RegisterForm
├── lib/
│   ├── prisma.ts                 # PrismaClient 单例（adapter 模式）
│   ├── auth.ts                   # getServerSession()
│   ├── auth-actions.ts           # loginAction, registerAction, logoutAction
│   ├── cart-actions.ts           # addToCart, updateQuantity, remove
│   ├── order-actions.ts          # createOrder, updateOrderStatus
│   ├── product-actions.ts        # createProduct, updateProduct, deleteProduct
│   ├── category-actions.ts       # createCategory, updateCategory, deleteCategory
│   ├── utils.ts                  # formatPrice, slugify, cn, generateOrderNumber
│   └── constants.ts              # ORDER_STATUS, ORDER_STATUS_TRANSITIONS, ROLES, ITEMS_PER_PAGE
├── middleware.ts                  # JWT 验证 + 路由保护
└── types/
    └── index.ts                  # zod schema + ActionResult 类型
```

## 数据库 Schema

6 个模型：`User` → `CartItem` ← `Product` → `Category`；`User` → `Order` → `OrderItem` ← `Product`

**关键约定：**
- ID 用 `@default(cuid())` 而非自增
- **价格统一用整数（分）存储**，展示时用 `formatPrice(cents)` → `¥19.99`
- 角色/状态用 String（SQLite 无原生 enum），应用层 `zod` 校验
- `OrderItem.price` 是下单时价格快照，防止商品改价影响历史订单
- `CartItem` 有 `@@unique([userId, productId])` 复合唯一约束

### 订单状态流转

```
PENDING → PAID → SHIPPED → DELIVERED
任意状态 → CANCELLED
```

定义在 `src/lib/constants.ts` 的 `ORDER_STATUS_TRANSITIONS` 中，更新状态前必须校验合法性。

## 核心架构原则

### RSC vs Client 组件

- **RSC（默认）：** 所有页面默认是 Server Component，直接 `prisma.model.findMany()` 读数据
- **Client：** 仅在有事件处理/`useState`/`useEffect`/浏览器 API 时加 `"use client"`
  - 所有表单组件、按钮交互、SearchBar、CartIcon 等
  - `useActionState` + Server Action 是表单调用的标准模式

### 数据变更：Server Actions Only

**所有写操作统一用 Server Actions（`"use server"`）**，不设 Route Handlers（无外部 API 需求）。

Action 文件集中在 `src/lib/*-actions.ts`，返回类型为 `ActionResult<T>`：
```typescript
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };
```

Action 内部调用 `revalidatePath()` 刷新缓存。

### 认证（JWT + httpOnly Cookie）

- **库：** `jose`（同时兼容 Edge middleware 和 Node.js RSC）
- **Session 获取：** `getServerSession()` 读取 cookie 中的 JWT，解密返回 `{ id, email, name, role }`
- **路由保护：** `middleware.ts` 验证 JWT
  - `/cart`、`/checkout`、`/orders`、`/profile` 需登录
  - `/admin/*` 需 `role === "ADMIN"`
- 已登录用户访问 `/login`、`/register` 自动重定向到 `/`

### 购物车

- 纯 DB 持久化，需登录
- `addToCartAction` 使用 `prisma.cartItem.upsert()`，同商品存在则 increment 数量
- 下单后清空购物车

## 开发命令

```bash
npm run dev           # 启动开发服务器
npm run db:migrate    # prisma migrate dev
npm run db:seed       # 填充种子数据
npm run db:studio     # prisma studio 可视化管理数据
npm run build         # 生产构建
```

## Prisma 7 注意事项

- Schema 文件不再含 `url`，连接 URL 在项目根目录的 `prisma.config.ts` 中
- PrismaClient 使用 adapter 模式初始化（见 `src/lib/prisma.ts`）：
  ```typescript
  import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
  const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
  const prisma = new PrismaClient({ adapter });
  ```
- `better-sqlite3` 是原生模块，已加入 `next.config.ts` 的 `serverExternalPackages`

## 种子数据

`prisma/seed.ts` 创建：
- 管理员 `admin@minimall.com` / `admin123`
- 测试用户 `user@test.com` / `test123`
- 6 个分类（电子产品、服装鞋帽、食品饮料、图书教育、家居生活、运动户外）
- 18 个商品（每分类 3 个）
- 2 个示例订单（DELIVERED + SHIPPED）

## 命名约定

| 类别 | 约定 | 示例 |
|---|---|---|
| 文件名 | kebab-case | `add-to-cart-button.tsx` |
| 组件名 | PascalCase | `AddToCartButton` |
| 函数/变量 | camelCase | `getServerSession`, `formatPrice` |
| 类型/接口 | PascalCase | `ActionResult`, `OrderStatus` |
| Server Action | `*Action` 后缀 | `loginAction`, `createOrderAction` |
| 数据库字段 | camelCase | `orderNumber`, `totalAmount` |
| 路由 | kebab-case 文件夹 | `[slug]`, `[id]/edit` |
| 分类/商品标识 | 英文 slug | `electronics`, `wireless-earbuds-pro` |

## 参考文档

完整的架构设计见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

<!-- superpowers-zh:begin (do not edit between these markers) -->
# Superpowers-ZH 中文增强版

本项目已安装 superpowers-zh 技能框架（20 个 skills）。

## 核心规则

1. **收到任务时，先检查是否有匹配的 skill** — 哪怕只有 1% 的可能性也要检查
2. **设计先于编码** — 收到功能需求时，先用 brainstorming skill 做需求分析
3. **测试先于实现** — 写代码前先写测试（TDD）
4. **验证先于完成** — 声称完成前必须运行验证命令

## 可用 Skills

Skills 位于 `.claude/skills/` 目录，每个 skill 有独立的 `SKILL.md` 文件。

- **brainstorming**: 在任何创造性工作之前必须使用此技能——创建功能、构建组件、添加功能或修改行为。在实现之前先探索用户意图、需求和设计。
- **chinese-code-review**: 中文 review 沟通参考——话术模板、分级标注（必须修复/建议修改/仅供参考）、国内团队常见反模式应对。仅在用户显式 /chinese-code-review 时调用，不要根据上下文自动触发。
- **chinese-commit-conventions**: 中文 commit 与 changelog 配置参考——Conventional Commits 中文适配、commitlint/husky/commitizen 中文模板、conventional-changelog 中文配置。仅在用户显式 /chinese-commit-conventions 时调用，不要根据上下文自动触发。
- **chinese-documentation**: 中文文档排版参考——中英文空格、全半角标点、术语保留、链接格式、中文文案排版指北约定。仅在用户显式 /chinese-documentation 时调用，不要根据上下文自动触发。
- **chinese-git-workflow**: 国内 Git 平台配置参考——Gitee、Coding.net、极狐 GitLab、CNB 的 SSH/HTTPS/凭据/CI 接入差异与镜像同步配置。仅在用户显式 /chinese-git-workflow 时调用，不要根据上下文自动触发。
- **dispatching-parallel-agents**: 当面对 2 个以上可以独立进行、无共享状态或顺序依赖的任务时使用
- **executing-plans**: 当你有一份书面实现计划需要在单独的会话中执行，并设有审查检查点时使用
- **finishing-a-development-branch**: 当实现完成、所有测试通过、需要决定如何集成工作时使用——通过提供合并、PR 或清理等结构化选项来引导开发工作的收尾
- **mcp-builder**: MCP 服务器构建方法论 — 系统化构建生产级 MCP 工具，让 AI 助手连接外部能力
- **receiving-code-review**: 收到代码审查反馈后、实施建议之前使用，尤其当反馈不明确或技术上有疑问时——需要技术严谨性和验证，而非敷衍附和或盲目执行
- **requesting-code-review**: 完成任务、实现重要功能或合并前使用，用于验证工作成果是否符合要求
- **subagent-driven-development**: 当在当前会话中执行包含独立任务的实现计划时使用
- **systematic-debugging**: 遇到任何 bug、测试失败或异常行为时使用，在提出修复方案之前执行
- **test-driven-development**: 在实现任何功能或修复 bug 时使用，在编写实现代码之前
- **using-git-worktrees**: 当需要开始与当前工作区隔离的功能开发，或在执行实现计划之前使用——通过原生工具或 git worktree 回退机制确保隔离工作区存在
- **using-superpowers**: 在开始任何对话时使用——确立如何查找和使用技能，要求在任何响应（包括澄清性问题）之前调用 Skill 工具
- **verification-before-completion**: 在宣称工作完成、已修复或测试通过之前使用，在提交或创建 PR 之前——必须运行验证命令并确认输出后才能声称成功；始终用证据支撑断言
- **workflow-runner**: 在 Claude Code / OpenClaw / Cursor 中直接运行 agency-orchestrator YAML 工作流——无需 API key，使用当前会话的 LLM 作为执行引擎。当用户提供 .yaml 工作流文件或要求多角色协作完成任务时触发。
- **writing-plans**: 当你有规格说明或需求用于多步骤任务时使用，在动手写代码之前
- **writing-skills**: 当创建新技能、编辑现有技能或在部署前验证技能是否有效时使用

## 如何使用

当任务匹配某个 skill 时，使用 `Skill` 工具加载对应 skill 并严格遵循其流程。绝不要用 Read 工具读取 SKILL.md 文件。

如果你认为哪怕只有 1% 的可能性某个 skill 适用于你正在做的事情，你必须调用该 skill 检查。
<!-- superpowers-zh:end -->
