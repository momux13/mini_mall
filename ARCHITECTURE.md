# Mini Mall — 架构设计方案

## Context

全新微型电商项目，技术栈：Next.js 16 (App Router) + TypeScript + Prisma + SQLite + TailwindCSS 4。目标是实现完整的电商闭环：商品浏览 → 注册登录 → 购物车 → 下单支付 → 后台管理。

**环境：** Node.js v24.18.0 / npm 11.16.0 / macOS

> **Prisma 版本说明：** 你指定的是 Prisma 5，但当前最新稳定版是 Prisma 7.x。Prisma 5（`prisma@5.22.0` + `@prisma/client@5.22.0`）Schema 语法完全兼容，只是 Client API 有少量新增。方案默认用 Prisma 7，如果需要严格使用 Prisma 5 可以 pin 版本。

---

## 1. 目录结构

```
mini_mall/
├── .env                          # DATABASE_URL, JWT_SECRET
├── next.config.ts                # serverExternalPackages: ["@prisma/client", "bcryptjs"]
├── postcss.config.mjs
├── tsconfig.json
│
├── prisma/
│   ├── schema.prisma             # 6 个模型
│   ├── seed.ts                   # 管理员 + 分类 + 商品 + 示例订单
│   └── db.ts                     # PrismaClient 单例
│
├── public/images/                # 静态商品图片
│
└── src/
    ├── middleware.ts              # JWT 验证 + 路由保护
    ├── app/
    │   ├── layout.tsx             # 根布局
    │   ├── page.tsx               # 首页
    │   ├── globals.css
    │   ├── (store)/               # 商城主布局组（Header + Footer）
    │   │   ├── layout.tsx
    │   │   ├── page.tsx           # 首页（精选商品 + 分类导航）
    │   │   ├── products/
    │   │   │   ├── page.tsx       # 商品列表（搜索/分类/分页）
    │   │   │   └── [slug]/page.tsx # 商品详情
    │   │   ├── cart/page.tsx      # 购物车
    │   │   ├── checkout/page.tsx  # 结算
    │   │   ├── orders/
    │   │   │   ├── page.tsx       # 订单列表
    │   │   │   └── [id]/page.tsx  # 订单详情
    │   │   └── profile/page.tsx   # 个人中心
    │   ├── (auth)/                # 认证布局组（居中卡片，无 Header）
    │   │   ├── layout.tsx
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   └── admin/                 # 后台管理（Sidebar 布局）
    │       ├── layout.tsx         # 权限门控
    │       ├── page.tsx           # Dashboard 统计
    │       ├── products/
    │       │   ├── page.tsx       # 商品列表
    │       │   ├── new/page.tsx   # 新建商品
    │       │   └── [id]/edit/page.tsx # 编辑商品
    │       ├── categories/
    │       │   ├── page.tsx       # 分类列表
    │       │   └── new/page.tsx   # 新建分类
    │       └── orders/
    │           ├── page.tsx       # 订单列表
    │           └── [id]/page.tsx  # 订单详情 + 状态更新
    │
    ├── components/
    │   ├── ui/                    # Button, Input, Select, Card, Badge, Modal, DataTable, Pagination, EmptyState, Loading
    │   ├── layout/               # Header, Footer, AdminSidebar
    │   ├── products/             # ProductCard, ProductGrid, ProductDetail, AddToCartButton, SearchBar, CategoryFilter
    │   ├── cart/                 # CartItemRow, CartSummary, CartIcon
    │   ├── checkout/             # CheckoutForm
    │   ├── orders/               # OrderCard, OrderItems, OrderStatusBadge
    │   └── auth/                 # LoginForm, RegisterForm
    │
    ├── lib/
    │   ├── prisma.ts             # PrismaClient 单例
    │   ├── auth.ts               # getServerSession(), requireAdmin()
    │   ├── auth-actions.ts       # loginAction, registerAction, logoutAction
    │   ├── cart-actions.ts       # addToCart, updateQuantity, remove
    │   ├── order-actions.ts      # createOrder, updateOrderStatus
    │   ├── product-actions.ts    # createProduct, updateProduct, deleteProduct
    │   ├── category-actions.ts   # createCategory, updateCategory, deleteCategory
    │   ├── utils.ts              # formatPrice, slugify, cn()
    │   └── constants.ts          # ORDER_STATUS, ROLES, ITEMS_PER_PAGE
    │
    └── types/
        └── index.ts              # Server Action 返回类型等
```

约 **65 个文件**。

---

## 2. 数据库 Schema（Prisma）

价格统一用**整数（分）**存储，避免 SQLite REAL 类型浮点精度问题。

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String                     // bcrypt hash
  role      String   @default("CUSTOMER")  // "CUSTOMER" | "ADMIN"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  cartItems CartItem[]
  orders    Order[]
}

model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  products Product[]
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String
  price       Int                  // 分（1999 = ¥19.99）
  imageUrl    String?
  stock       Int      @default(0)
  isPublished Boolean  @default(false)
  categoryId  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  category   Category    @relation(fields: [categoryId], references: [id])
  cartItems  CartItem[]
  orderItems OrderItem[]
}

model CartItem {
  id        String   @id @default(cuid())
  quantity  Int      @default(1)
  userId    String
  productId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
}

model Order {
  id              String   @id @default(cuid())
  orderNumber     String   @unique   // "MM-20260703-XXXX"
  status          String   @default("PENDING")
  totalAmount     Int                 // 分
  shippingName    String
  shippingAddress String
  shippingPhone   String?
  note            String?
  userId          String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user  User        @relation(fields: [userId], references: [id])
  items OrderItem[]
}

model OrderItem {
  id        String   @id @default(cuid())
  quantity  Int
  price     Int                 // 下单时价格快照（分）
  productId String
  orderId   String
  createdAt DateTime @default(now())

  product Product @relation(fields: [productId], references: [id])
  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
}
```

**关系：** User 1:N CartItem N:1 Product ← 1:N Category；User 1:N Order 1:N OrderItem N:1 Product

**关键设计决策：**
- `cuid()` 代替自增 ID（SQLite 自增在迁移中不够可靠）
- 角色/状态用 String 不用 enum（SQLite 无原生 enum，应用层 zod 校验）
- `OrderItem.price` 是下单时的快照，防止商品改价后历史订单金额变化
- `CartItem` 的 `@@unique([userId, productId])` 保证同用户同商品只有一条记录

---

## 3. 路由设计

### 公开路由（(store) 组）

| 路由 | RSC/Client | 数据获取方式 |
|---|---|---|
| `/` | **RSC** | `prisma.product.findMany()` 精选 + `prisma.category.findMany()` |
| `/products` | **RSC** | searchParams: category/q/page → `prisma.product.findMany()` + count |
| `/products/[slug]` | **RSC** | `prisma.product.findUnique({ include: { category: true } })` |
| `/search` | **RSC** | searchParams.q → `prisma.product.findMany({ where: { name: { contains } } })` |

### 需登录路由（(store) 组，middleware 保护）

| 路由 | RSC/Client | 数据获取方式 |
|---|---|---|
| `/cart` | **RSC 包装 → Client CartView** | RSC 获取 cartItems → 传 props 给 Client |
| `/checkout` | **Client** | CartItem[] 从服务端传入 + createOrderAction |
| `/orders` | **RSC** | `prisma.order.findMany({ where: { userId } })` |
| `/orders/[id]` | **RSC** | `prisma.order.findUnique({ include: { items, user } })` |
| `/profile` | **RSC 包装 → Client** | `prisma.user.findUnique()` → 传 props 给 ProfileForm |

### 认证路由（(auth) 组，已登录用户重定向到 /）

| 路由 | 组件类型 |
|---|---|
| `/login` | **Client** (LoginForm via useActionState) |
| `/register` | **Client** (RegisterForm via useActionState) |

### 后台路由（admin 组，middleware + layout 双重门控）

| 路由 | RSC/Client | 数据获取方式 |
|---|---|---|
| `/admin` | **RSC** | 聚合统计：product/order/user count + 总营收 |
| `/admin/products` | **RSC** | `prisma.product.findMany({ include: { category } })` |
| `/admin/products/new` | **Client** | ProductForm + createProductAction |
| `/admin/products/[id]/edit` | **RSC 包装 → Client** | product + categories → ProductForm initialData |
| `/admin/categories` | **RSC** | `prisma.category.findMany({ include: { _count } })` |
| `/admin/categories/new` | **Client** | CategoryForm + createCategoryAction |
| `/admin/orders` | **RSC** | `prisma.order.findMany({ include: { user } })` |
| `/admin/orders/[id]` | **RSC + Client island** | order detail + StatusUpdateForm |

---

## 4. 认证方案

**选型：** `jose`（JWT）+ httpOnly Cookie

| 库 | 用途 |
|---|---|
| `jose` | JWT 签名/验证，同时支持 Edge Runtime（middleware）和 Node.js Runtime（RSC/Server Actions） |
| `bcryptjs` | 密码哈希，纯 JS 实现无需编译 |

**流程：**
1. 用户注册/登录 → Server Action 验证凭据 → 签发 JWT（7 天过期）→ 写入 httpOnly cookie `token`
2. 后续请求 → `middleware.ts` 读取 cookie 验证 JWT → 保护 `/cart`、`/checkout`、`/orders`、`/admin/*`
3. RSC 页面 → `getServerSession()` 读取 cookie 解密 → 返回 `{ id, email, name, role }` 用于 DB 查询
4. admin 路由 → middleware 检查 `role === "ADMIN"` + layout 层二次检查（防御纵深）

---

## 5. 购物车策略

**纯 DB 持久化，需登录才能使用。** 不实现 guest cart（mini 项目简化）。

- `addToCartAction` → `prisma.cartItem.upsert()`（存在则 increment quantity）
- `updateCartQuantityAction` → `prisma.cartItem.update()`
- `removeFromCartAction` → `prisma.cartItem.delete()`
- 每次操作后 `revalidatePath("/cart")`

下单时 `createOrderAction`：创建 Order + OrderItem（价格快照）→ 清空购物车 → 跳转订单详情。

---

## 6. 后台管理

- **布局：** 左侧固定 Sidebar（Dashboard/商品/分类/订单） + 右侧内容区
- **商品 CRUD：** ProductForm（Client）→ createProductAction / updateProductAction / deleteProductAction
- **分类 CRUD：** 删除前检查是否有商品关联
- **订单管理：** 状态流转 `PENDING → PAID → SHIPPED → DELIVERED`，任意状态可 `CANCELLED`

**所有数据变更统一使用 Server Actions**，不设 Route Handlers（无外部 API 需求）。

---

## 7. RSC vs Client 组件划分原则

| 场景 | 类型 |
|---|---|
| 静态展示、无状态、无事件 | **RSC** (ProductCard, Footer, Badge, OrderItems) |
| 从 DB 读取数据并渲染 | **RSC** (大部分 page.tsx) |
| 有事件处理或 useState/useEffect | **Client** (SearchBar, AddToCartButton, 所有表单) |
| 使用浏览器 API (useRouter, localStorage) | **Client** (CartIcon, UserMenu) |
| 需要 forwardRef | **Client** (Input, Select) |

---

## 8. 实施顺序（8 个阶段）

| 阶段 | 内容 | 文件数 |
|---|---|---|
| **Phase 1: 脚手架** | `create-next-app` + Prisma schema + seed + 工具函数 | ~8 |
| **Phase 2: 认证** | JWT 签发/验证 + 登录/注册页面 + middleware | ~8 |
| **Phase 3: UI 基础设施** | 通用组件 + Header/Footer + Admin 布局 | ~15 |
| **Phase 4: 商品浏览** | 首页 + 列表（搜索/分类/分页）+ 详情 | ~10 |
| **Phase 5: 购物车** | 加购 + 购物车页面 + 结算 + 下单 | ~9 |
| **Phase 6: 订单管理** | 用户订单列表 + 详情 | ~5 |
| **Phase 7: 后台管理** | 商品/分类 CRUD + 订单状态管理 + Dashboard | ~12 |
| **Phase 8: 完善** | Profile + Loading/Empty/Error 状态 + 响应式 | ~10 |

**总计约 77 个文件，每个阶段可独立验证。**

---

## 9. 关键依赖

### 生产依赖
- `next` ^16.x, `react` ^19.x, `@prisma/client` ^7.x（或 ^5.22.0）
- `jose` ^6.x（JWT），`bcryptjs` ^3.x（密码），`zod` ^3.x（校验）

### 开发依赖
- `prisma`, `typescript`, `tailwindcss` ^4.x, `@tailwindcss/postcss`, `postcss`, `tsx`

---

## 10. 验证方式

每个 Phase 完成后手动验证：

1. **Phase 1：** `npx prisma migrate dev` + `npx prisma db seed` → `npx prisma studio` 查看数据
2. **Phase 2：** 注册 → 登录 → 查看 cookie → 访问 /cart 确认重定向到 /login
3. **Phase 3：** `npm run dev` → 首页能看到 Header/Footer
4. **Phase 4：** 浏览商品列表 → 搜索 → 分类筛选 → 分页 → 商品详情
5. **Phase 5：** 登录 → 加购 → 修改数量 → 结算 → 下单 → 清空购物车
6. **Phase 6：** 查看订单列表 → 订单详情
7. **Phase 7：** admin 登录 → 商品 CRUD → 分类 CRUD → 修改订单状态
8. **Phase 8：** 空列表 → Loading 骨架屏 → 移动端响应式

使用 `webapp-testing` skill 可通过 Playwright 进行端到端验证。
