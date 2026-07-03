export const ORDER_STATUS = {
  PENDING: "待支付",
  PAID: "已支付",
  SHIPPED: "已发货",
  DELIVERED: "已送达",
  CANCELLED: "已取消",
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS;

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["CANCELLED"],
  CANCELLED: [],
};

export const ROLES = {
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ITEMS_PER_PAGE = 9;

/** 分类 slug 到 emoji 的映射，供页面和组件统一使用 */
export const CATEGORY_EMOJI: Record<string, string> = {
  electronics: "💻",
  clothing: "👕",
  food: "🍜",
  books: "📚",
  home: "🏠",
  sports: "⚽",
};
