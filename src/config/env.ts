import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Validated, typed environment. Parsed once at boot — if anything is missing or
 * malformed the process logs the issues and exits, so the rest of the code can
 * treat `env` as guaranteed-correct.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  PRO_MONGODB_URI: z.string().min(1, 'PRO_MONGODB_URI is required'),
  DEV_MONGODB_URI: z.string().optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(6, 'ADMIN_PASSWORD must be at least 6 characters'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_FOLDER: z.string().default('maibi'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  FRONTEND_URL: z.string().optional(),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  EMAIL_FROM: z.string().email().default('onboarding@resend.dev'),
  EMAIL_FROM_NAME: z.string().default('Maibi'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`   • ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
