import type { Request, Response } from 'express';
import { createOrderFromCheckout } from '../services/order.service.js';
import { toOrderDTO } from '../utils/serialize.js';
import { validated } from '../middlewares/validate.js';
import type { CheckoutBody } from '../validators/order.schema.js';
import { sendOrderPlacedCustomer, sendNewOrderAdmin } from '../services/mail.service.js';

export async function createOrder(req: Request, res: Response): Promise<void> {
  const order = await createOrderFromCheckout(validated<CheckoutBody>(req));
  const dto = order.toObject();
  res.status(201).json(toOrderDTO(dto, { admin: false }));

  // Fire-and-forget emails after response is sent
  const mailData = {
    code: dto.code,
    customer: dto.customer,
    email: dto.email,
    phone: dto.phone,
    wilaya: dto.wilaya,
    city: dto.city,
    address: dto.address,
    shippingType: dto.shippingType,
    paymentMethod: dto.paymentMethod,
    items: dto.items,
    subtotal: dto.subtotal,
    shippingFee: dto.shippingFee,
    total: dto.total,
  };
  sendOrderPlacedCustomer(mailData);
  sendNewOrderAdmin(mailData);
}
