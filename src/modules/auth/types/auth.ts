import { z } from 'zod';
export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const sessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().positive(),
  user: userSchema,
});
export type AuthSession = z.infer<typeof sessionSchema>;
export interface LoginRequest {
  email: string;
  password: string;
}
