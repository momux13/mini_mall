import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateOrderNumber } from "../src/lib/utils";

const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 开始填充种子数据...");

  // ── 清空已有数据 ──
  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ── 用户 ──
  const adminHash = await bcrypt.hash("admin123", 12);
  const userHash = await bcrypt.hash("test123", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@minimall.com",
      name: "管理员",
      password: adminHash,
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "user@test.com",
      name: "测试用户",
      password: userHash,
      role: "CUSTOMER",
    },
  });

  console.log(`  ✓ 创建用户: ${admin.email} (ADMIN), ${customer.email} (CUSTOMER)`);

  // ── 分类 ──
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: "电子产品", slug: "electronics", description: "手机、电脑、数码配件" },
    }),
    prisma.category.create({
      data: { name: "服装鞋帽", slug: "clothing", description: "男装、女装、鞋类、配饰" },
    }),
    prisma.category.create({
      data: { name: "食品饮料", slug: "food", description: "零食、饮品、食材" },
    }),
    prisma.category.create({
      data: { name: "图书教育", slug: "books", description: "书籍、文具、教育用品" },
    }),
    prisma.category.create({
      data: { name: "家居生活", slug: "home", description: "家具、厨具、日用品" },
    }),
    prisma.category.create({
      data: { name: "运动户外", slug: "sports", description: "运动装备、户外用品" },
    }),
  ]);

  console.log(`  ✓ 创建 ${categories.length} 个分类`);

  // ── 商品 ──
  const productsData = [
    { name: "无线蓝牙耳机 Pro", slug: "wireless-earbuds-pro", description: "高品质降噪蓝牙耳机，续航 30 小时，IPX5 防水", price: 29900, stock: 100, category: "electronics" },
    { name: "机械键盘 RGB 87键", slug: "mechanical-keyboard-rgb", description: "Cherry MX 青轴，全键无冲，RGB 背光", price: 45900, stock: 50, category: "electronics" },
    { name: "USB-C 扩展坞 12合1", slug: "usbc-hub-12in1", description: "双 HDMI + VGA + 千兆网口 + SD/TF 读卡器", price: 25900, stock: 80, category: "electronics" },
    { name: "纯棉圆领短袖 T 恤", slug: "cotton-crewneck-tshirt", description: "100% 新疆长绒棉，柔软透气，多色可选", price: 7900, stock: 200, category: "clothing" },
    { name: "轻薄羽绒服 秋冬新款", slug: "light-down-jacket", description: "90% 白鸭绒填充，轻薄保暖，可收纳", price: 39900, stock: 60, category: "clothing" },
    { name: "休闲运动鞋 男女同款", slug: "casual-sneakers-unisex", description: "EVA 缓震中底，飞织鞋面，透气舒适", price: 25900, stock: 120, category: "clothing" },
    { name: "有机绿茶 明前龙井 250g", slug: "organic-longjin-tea", description: "杭州西湖产区，明前采摘，手工炒制", price: 12800, stock: 40, category: "food" },
    { name: "每日坚果混合装 750g", slug: "daily-mixed-nuts", description: "腰果、杏仁、核桃、蔓越莓科学配比", price: 8900, stock: 150, category: "food" },
    { name: "云南精品咖啡豆 500g", slug: "yunnan-specialty-coffee", description: "海拔 1200m 以上种植，中深烘焙，醇厚回甘", price: 9900, stock: 80, category: "food" },
    { name: "深入理解计算机系统", slug: "csapp-book", description: "计算机科学经典教材，系统级编程入门必读", price: 13900, stock: 30, category: "books" },
    { name: "TypeScript 编程实战", slug: "typescript-in-action", description: "从入门到全栈，涵盖类型系统与工程实践", price: 8900, stock: 60, category: "books" },
    { name: "简约笔记本 A5 皮面", slug: "minimalist-notebook-a5", description: "PU 皮封面，192 页道林纸，适合日常记录", price: 3900, stock: 200, category: "books" },
    { name: "智能台灯 LED 护眼", slug: "smart-led-desk-lamp", description: "无频闪、无蓝光危害，无极调光调色温", price: 19900, stock: 70, category: "home" },
    { name: "不锈钢保温杯 500ml", slug: "stainless-thermos-500ml", description: "316 不锈钢内胆，12 小时保温，真空断热", price: 12900, stock: 90, category: "home" },
    { name: "北欧风陶瓷花瓶三件套", slug: "nordic-ceramic-vase-set", description: "手工制作，简约北欧风格，适合客厅装饰", price: 6900, stock: 45, category: "home" },
    { name: "瑜伽垫 TPE 环保 6mm", slug: "yoga-mat-tpe-6mm", description: "双面防滑，环保无味，含收纳绑带", price: 10900, stock: 80, category: "sports" },
    { name: "运动水壶 750ml 防摔", slug: "sports-water-bottle-750ml", description: "Tritan 材质，防漏锁扣，单手开盖", price: 5900, stock: 150, category: "sports" },
    { name: "跳绳 高速轴承 钢丝绳", slug: "speed-jump-rope-steel", description: "钢丝内芯 + PVC 包裹，铝合金手柄，轴承旋转", price: 3900, stock: 100, category: "sports" },
  ];

  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

  const products = [];
  for (const p of productsData) {
    const { category: catSlug, ...rest } = p;
    const product = await prisma.product.create({
      data: {
        ...rest,
        isPublished: true,
        categoryId: categoryMap.get(catSlug)!,
      },
    });
    products.push(product);
  }

  console.log(`  ✓ 创建 ${products.length} 个商品`);

  // ── 示例订单 ──
  await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      status: "DELIVERED",
      totalAmount: products[0].price * 1 + products[3].price * 2,
      shippingName: "测试用户",
      shippingAddress: "上海市浦东新区张江高科技园区 100 号",
      shippingPhone: "13800138000",
      userId: customer.id,
      items: {
        create: [
          { productId: products[0].id, quantity: 1, price: products[0].price },
          { productId: products[3].id, quantity: 2, price: products[3].price },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      status: "SHIPPED",
      totalAmount: products[6].price * 1 + products[15].price * 1,
      shippingName: "测试用户",
      shippingAddress: "上海市浦东新区张江高科技园区 100 号",
      shippingPhone: "13800138000",
      note: "请放快递柜",
      userId: customer.id,
      items: {
        create: [
          { productId: products[6].id, quantity: 1, price: products[6].price },
          { productId: products[15].id, quantity: 1, price: products[15].price },
        ],
      },
    },
  });

  console.log("  ✓ 创建 2 个示例订单");
  console.log("\n✅ 种子数据填充完成！");
  console.log("   管理员: admin@minimall.com / admin123");
  console.log("   测试用户: user@test.com / test123");
}

main()
  .catch((e) => {
    console.error("❌ 种子数据填充失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
