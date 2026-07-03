# Mini Mall — 微型电商

完整电商闭环：商品浏览 → 注册登录 → 购物车 → 下单（模拟支付）→ 后台管理。

## 技术栈

Next.js 16 · TypeScript 5 · Prisma 7 · SQLite · TailwindCSS 4 · jose (JWT) · bcryptjs · zod

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库 + 种子数据
npm run db:migrate
npm run db:seed

# 3. 启动开发服务器
npm run dev
```

浏览器打开 **http://localhost:3000** 即可访问。

## 账户信息

种子数据 (`prisma/seed.ts`) 创建两个账户：

| 角色 | 邮箱 | 密码 | 说明 |
|:---|:---|:---|:---|
| 管理员 | `admin@minimall.com` | `admin123` | 可访问后台管理所有功能 |
| 普通用户 | `user@test.com` | `test123` | 浏览、购物车、下单 |

> 也可以通过 `/register` 注册新账户，默认角色为普通用户。

## 页面导航

### 🛍️ 商城前台（所有访客可浏览）

| 路径 | 页面 | 说明 |
|:---|:---|:---|
| `/` | 首页 | 商品展示 + 分类筛选 + 搜索 |
| `/products` | 商品列表 | 分页浏览，支持搜索和分类过滤 |
| `/products/[slug]` | 商品详情 | 规格说明 + 加入购物车 |

### 🔐 需登录

| 路径 | 页面 | 说明 |
|:---|:---|:---|
| `/login` | 登录 | 已登录用户自动跳转到首页 |
| `/register` | 注册 | |
| `/cart` | 购物车 | 修改数量 / 移除 / 去结算 |
| `/checkout` | 结算 | 填写收货信息，确认下单 |
| `/orders` | 我的订单 | 订单列表 |
| `/orders/[id]` | 订单详情 | 查看明细 + 模拟支付 |
| `/profile` | 个人中心 | 修改姓名和密码 |

### 🛡️ 后台管理（仅管理员）

| 路径 | 页面 | 说明 |
|:---|:---|:---|
| `/admin` | 仪表盘 | 订单、用户、商品统计概览 |
| `/admin/products` | 商品管理 | 列表 + 新增 + 编辑 + 删除 |
| `/admin/categories` | 分类管理 | 列表 + 新增 + 删除 |
| `/admin/orders` | 订单管理 | 查看所有订单 + 状态变更 |

## 订单流程

```
用户下单 → PENDING（待支付）
           │
           ▼ 用户点击"模拟支付"
          PAID（已支付）
           │
           ▼ 管理员操作
          SHIPPED（已发货）
           │
           ▼ 管理员操作
          DELIVERED（已送达）

任意状态 → CANCELLED（已取消）
```

> 发货(SHIPPED)和送达(DELIVERED)操作仅管理员可执行，普通用户只能支付和取消。

## 命令速查

```bash
npm run dev           # 启动开发服务器 (http://localhost:3000)
npm run build         # 生产构建
npm run db:migrate    # 执行数据库迁移
npm run db:seed       # 填充种子数据
npm run db:studio     # Prisma Studio 可视化管理数据 (http://localhost:5555)
```

## 项目结构

```
src/
├── app/
│   ├── (store)/      # 商城前台：首页、商品、购物车、结算、订单、个人中心
│   ├── (auth)/       # 认证页面：登录、注册
│   └── admin/        # 后台管理：商品/分类/订单 CRUD
├── components/
│   ├── ui/           # EmptyState, Loading, Pagination
│   ├── layout/       # Header, Footer, AdminSidebar, LogoutButton
│   ├── products/     # ProductCard, ProductGrid, ProductForm, ProductImage 等
│   ├── cart/         # CartItemRow, CartSummary, CartIcon
│   ├── checkout/     # CheckoutForm
│   ├── orders/       # OrderCard, OrderItems, OrderStatusBadge
│   └── auth/         # LoginForm, RegisterForm
├── lib/              # Server Actions, auth, utils, constants, prisma
├── middleware.ts     # JWT 验证 + 路由保护
└── types/            # Zod Schema + ActionResult 类型
```

## 数据库

- **类型：** SQLite，单文件 `prisma/dev.db`
- **模型：** User, Product, Category, CartItem, Order, OrderItem（6 个）
- **价格：** 以"分"为单位的整数存储（`¥19.99` → `1999`），展示用 `formatPrice()`
- **ID：** cuid 字符串，非自增整数

详细架构见 [ARCHITECTURE.md](./ARCHITECTURE.md)，编码规范见 [CLAUDE.md](./CLAUDE.md)。
