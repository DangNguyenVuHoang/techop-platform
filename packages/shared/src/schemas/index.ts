import { z } from "zod";
import { LEAD_STATUSES, POST_STATUSES, ROLE_IDS } from "../types/enums.js";
import { normalizeEmail, normalizePhoneE164 } from "../utils/normalizers.js";

export const loginSchema = z.object({
  email: z.string().trim().email("Email không đúng định dạng").toLowerCase(),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(12, "Mật khẩu mới phải có ít nhất 12 ký tự"),
});

export const createUserSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ").toLowerCase(),
  password: z.string().min(12, "Mật khẩu tối thiểu 12 ký tự"),
  fullName: z.string().trim().min(2, "Họ và tên tối thiểu 2 ký tự").max(120),
  phone: z.string().trim().max(40).optional(),
  roleId: z.enum(ROLE_IDS),
});

export const ingestLeadSchema = z
  .object({
    fullName: z.string().trim().min(2, "Họ và tên tối thiểu 2 ký tự").max(150),
    phone: z.string().trim().max(40).optional().default(""),
    email: z.string().trim().max(255).optional().default(""),
    company: z.string().trim().max(255).optional().default(""),
    serviceSlug: z.string().trim().max(120).optional().default(""),
    budgetRange: z.string().trim().max(120).optional().default(""),
    message: z.string().trim().max(3000).optional().default(""),
    utmSource: z.string().trim().max(150).optional(),
    utmMedium: z.string().trim().max(150).optional(),
    utmCampaign: z.string().trim().max(150).optional(),
    utmContent: z.string().trim().max(150).optional(),
    utmTerm: z.string().trim().max(150).optional(),
    landingPage: z.string().trim().max(1000).optional(),
    referrer: z.string().trim().max(1000).optional(),
    externalEventId: z.string().trim().max(255).optional(),
    customFields: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((val, ctx) => {
    const phoneOk = val.phone ? normalizePhoneE164(val.phone) !== null : false;
    const emailOk = val.email ? normalizeEmail(val.email) !== null : false;

    if (val.phone && !phoneOk) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Số điện thoại không đúng định dạng.",
      });
    }
    if (val.email && !emailOk) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Email không đúng định dạng.",
      });
    }
    if (!phoneOk && !emailOk) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Cần ít nhất số điện thoại hoặc email hợp lệ.",
      });
    }
  });

export const updateLeadSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  lostReason: z.string().trim().max(500).nullable().optional(),
  internalNotes: z.string().max(5000).optional(),
  followUpAt: z.string().datetime({ offset: true }).nullable().optional(),
});

export const postInputSchema = z
  .object({
    siteKey: z.string().trim().min(2).max(50).default("techop_vn"),
    title: z.string().trim().min(3, "Tiêu đề cần ít nhất 3 ký tự").max(255),
    slug: z
      .string()
      .trim()
      .min(3)
      .max(255)
      .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và dấu gạch ngang"),
    summary: z.string().trim().max(1000).optional().default(""),
    content: z.string().min(10, "Nội dung cần ít nhất 10 ký tự"),
    coverImage: z.string().optional().default(""),
    categoryId: z.string().uuid().nullable().optional(),
    status: z.enum(POST_STATUSES).default("DRAFT"),
    scheduledAt: z.string().datetime({ offset: true }).nullable().optional(),
    metaTitle: z.string().max(255).optional().default(""),
    metaDescription: z.string().max(500).optional().default(""),
    canonicalUrl: z.string().optional().default(""),
    readingTime: z.string().optional().default("5 phút đọc"),
    tags: z.array(z.string().trim().min(1)).optional().default([]),
  })
  .superRefine((val, ctx) => {
    if (val.status === "SCHEDULED" && !val.scheduledAt) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledAt"],
        message: "Vui lòng chọn thời gian xuất bản dự kiến.",
      });
    }
  });

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2, "Tên danh mục cần ít nhất 2 ký tự").max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và gạch ngang"),
  description: z.string().trim().max(500).optional().default(""),
});
