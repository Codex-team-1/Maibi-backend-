import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { AppError } from '../utils/AppError.js';
import { validated } from '../middlewares/validate.js';
import type { ProfileBody } from '../validators/auth.schema.js';

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const body = validated<ProfileBody>(req);
  const admin = await Admin.findById(req.admin!.id);
  if (!admin) throw AppError.notFound('Admin not found');

  if (body.name !== undefined) admin.name = body.name;
  if (body.email !== undefined) admin.email = body.email.toLowerCase();
  if (body.phone !== undefined) admin.phone = body.phone;

  if (body.newPassword) {
    const ok = await bcrypt.compare(String(body.currentPassword), admin.passwordHash);
    if (!ok) throw AppError.badRequest('Current password is incorrect');
    admin.passwordHash = await bcrypt.hash(body.newPassword, 10);
  }

  await admin.save();
  res.json({ id: admin.id, email: admin.email, name: admin.name, phone: admin.phone ?? '' });
}
