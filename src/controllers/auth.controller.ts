import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../services/token.service.js';
import { validated } from '../middlewares/validate.js';
import type { LoginBody } from '../validators/auth.schema.js';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = validated<LoginBody>(req);

  const admin = await Admin.findOne({ email: email.toLowerCase() });
  // Constant-ish failure path: compare even when not found is overkill here;
  // a generic message avoids leaking which field was wrong.
  if (!admin || !(await bcrypt.compare(String(password), admin.passwordHash))) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const token = signToken({ id: String(admin._id), email: admin.email });
  res.json({
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name, phone: admin.phone ?? '' },
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  const admin = await Admin.findById(req.admin!.id).lean();
  if (!admin) throw AppError.notFound('Admin not found');
  res.json({
    id: String(admin._id),
    email: admin.email,
    name: admin.name,
    phone: admin.phone ?? '',
  });
}
