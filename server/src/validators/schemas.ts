import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
});

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(1, 'Şifre zorunludur'),
});

export const projectSchema = z.object({
  name: z.string().min(1, 'Proje adı zorunludur').max(100),
  description: z.string().max(500).optional(),
});

export const siteSchema = z.object({
  name: z.string().min(1, 'Site adı zorunludur').max(100),
  code: z
    .string()
    .min(2, 'Site kodu en az 2 karakter olmalıdır')
    .max(5)
    .transform((val) => val.toUpperCase()),
});

export const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Cihaz adı zorunludur').max(200),
  ipAddress: z.string().max(100).optional().default(''),
  serialNumber: z.string().max(100).optional().default(''),
});
