import type { Request, Response } from 'express';
import { CustomOrder } from '../models/CustomOrder.js';
import { nextCustomCode } from '../services/counter.service.js';
import { uploadBuffer } from '../services/cloudinary.service.js';
import { toCustomOrderDTO } from '../utils/serialize.js';
import { validated } from '../middlewares/validate.js';
import { env } from '../config/env.js';
import type { CustomOrderSubmit } from '../validators/customOrder.schema.js';
import { sendCustomOrderPlacedCustomer, sendNewCustomOrderAdmin } from '../services/mail.service.js';

export async function submitCustomOrder(req: Request, res: Response): Promise<void> {
  const data = validated<CustomOrderSubmit>(req);

  let referenceImageUrl: string | undefined;
  if (req.file) {
    const uploaded = await uploadBuffer(req.file.buffer, `${env.CLOUDINARY_FOLDER}/custom-orders`);
    referenceImageUrl = uploaded.url;
  }

  const code = await nextCustomCode();
  const doc = await CustomOrder.create({
    code,
    customer: data.customer,
    email: data.email,
    phone: data.phone,
    wilaya: data.wilaya,
    garmentType: data.garmentType,
    size: data.size,
    colors: data.colors,
    notes: data.notes,
    budget: data.budget,
    referenceImage: Boolean(referenceImageUrl),
    ...(referenceImageUrl ? { referenceImageUrl } : {}),
    status: 'new',
  });

  const dto = doc.toObject();
  res.status(201).json(toCustomOrderDTO(dto, { admin: false }));

  // Fire-and-forget emails after response is sent
  const mailData = {
    code: dto.code,
    customer: dto.customer,
    email: dto.email,
    phone: dto.phone,
    wilaya: dto.wilaya,
    garmentType: dto.garmentType,
    size: dto.size,
    colors: dto.colors ?? [],
    budget: dto.budget ?? '',
    notes: dto.notes || undefined,
  };
  sendCustomOrderPlacedCustomer(mailData);
  sendNewCustomOrderAdmin(mailData);
}
