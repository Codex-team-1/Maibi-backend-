import { z } from 'zod';

export const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginBody = z.infer<typeof loginBody>;

export const profileBody = z
  .object({
    name: z.string().trim().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().trim().optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z.string().min(6).optional(),
  })
  .refine((d) => !d.newPassword || d.currentPassword, {
    message: 'currentPassword is required to set a new password',
    path: ['currentPassword'],
  });
export type ProfileBody = z.infer<typeof profileBody>;
