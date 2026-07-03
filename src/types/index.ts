import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少 6 位"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "姓名至少 2 个字符"),
    email: z.string().email("请输入有效的邮箱地址"),
    password: z.string().min(6, "密码至少 6 位"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次密码不一致",
    path: ["confirmPassword"],
  });

export const productSchema = z.object({
  name: z.string().min(1, "请输入商品名称"),
  slug: z.string().min(1, "请输入商品标识"),
  description: z.string().min(1, "请输入商品描述"),
  price: z.coerce.number().min(1, "价格必须大于 0"),
  stock: z.coerce.number().min(0, "库存不能为负数"),
  imageUrl: z.string().url("请输入有效的图片链接").optional().or(z.literal("")),
  categoryId: z.string().min(1, "请选择分类"),
  isPublished: z.coerce.boolean().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "请输入分类名称"),
  description: z.string().optional(),
});

export const checkoutSchema = z.object({
  shippingName: z.string().min(2, "请输入收货人姓名"),
  shippingAddress: z.string().min(5, "请输入详细地址"),
  shippingPhone: z.string().optional(),
  note: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };
