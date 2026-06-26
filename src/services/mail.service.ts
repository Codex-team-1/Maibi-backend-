import { Resend } from 'resend';
import { env } from '../config/env.js';

/* ── Client ──────────────────────────────────────────────────────────────── */

let _client: Resend | null = null;
const client = () => (_client ??= new Resend(env.RESEND_API_KEY));

const FROM = `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`;

async function send(to: string, subject: string, html: string): Promise<void> {
  try {
    const result = await client().emails.send({ from: FROM, to, subject, html });
    if (result.error) {
      console.error('[mail] Resend error sending to', to, ':', result.error);
    } else {
      console.log('[mail] sent to', to, '| id:', result.data?.id, '| subject:', subject);
    }
  } catch (err) {
    console.error('[mail] exception sending to', to, ':', err);
  }
}

/* ── Design tokens ───────────────────────────────────────────────────────── */

const PINK        = '#E8417A';
const PINK_LIGHT  = '#FDF0F5';
const PINK_BORDER = '#F3B8CE';
const PINK_DARK   = '#C4305F';
const INK         = '#1A1A1A';
const INK_MID     = '#4A4A4A';
const INK_SOFT    = '#7A7A7A';
const WARM        = '#FAF7F5';
const WARM_BORDER = '#EDE8E3';

/* ── Shell layout ────────────────────────────────────────────────────────── */

function shell(content: string, preheader = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Maibi</title>
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    body{margin:0;padding:0;background:${WARM};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}
    img{border:0;outline:none;text-decoration:none;display:block}
    a{color:${PINK};text-decoration:none}
    @media only screen and (max-width:600px){
      .email-body{width:100%!important}
      .email-pad{padding:28px 20px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${WARM}">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:${WARM}">${preheader}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${WARM}">
    <tr><td align="center" style="padding:36px 16px 48px">
      <table class="email-body" role="presentation" width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.10)">

        <!-- Header / Logo -->
        <tr>
          <td style="background:linear-gradient(135deg,#F7527F 0%,${PINK} 50%,${PINK_DARK} 100%);padding:32px 40px 28px;text-align:center">
            <div style="margin-bottom:6px">
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:42px;font-weight:700;color:#fff;letter-spacing:.02em;font-style:italic">Maibi</span>
            </div>
            <div style="display:inline-block;background:rgba(255,255,255,.18);border-radius:20px;padding:3px 14px">
              <span style="font-size:10px;color:rgba(255,255,255,.90);letter-spacing:.16em;text-transform:uppercase;font-weight:600">Algerian Handmade Fashion</span>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td class="email-pad" style="background:#fff;padding:44px 44px 36px">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${WARM};border-top:1px solid ${WARM_BORDER};padding:28px 44px 32px;text-align:center">
            <p style="margin:0 0 4px;font-size:13px;color:${INK_SOFT}">Made with love by Algerian artisans</p>
            <p style="margin:0 0 16px;font-size:12px;color:#bbb">© ${new Date().getFullYear()} Maibi &nbsp;·&nbsp; Algerian Handmade Fashion</p>
            <p style="margin:0;font-size:11px;color:#ccc;line-height:1.7">You received this email because an order was placed or updated on Maibi.<br>Questions? Simply reply to this email — we're always happy to help.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ── Reusable blocks ─────────────────────────────────────────────────────── */

function heading(text: string): string {
  return `<h1 style="margin:0 0 10px;font-size:26px;font-weight:700;color:${INK};line-height:1.25;letter-spacing:-.3px">${text}</h1>`;
}

function subtext(text: string): string {
  return `<p style="margin:0;font-size:15px;color:${INK_MID};line-height:1.65">${text}</p>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid ${WARM_BORDER};margin:32px 0"/>`;
}

function statusBadge(status: string): string {
  const map: Record<string, [string, string]> = {
    confirmed:     ['#166534', '#DCFCE7'],
    shipped:       ['#1e40af', '#DBEAFE'],
    delivered:     ['#14532d', '#DCFCE7'],
    cancelled:     ['#7f1d1d', '#FEE2E2'],
    pending:       ['#92400E', '#FEF3C7'],
    in_review:     ['#1e40af', '#DBEAFE'],
    quoted:        ['#5b21b6', '#EDE9FE'],
    accepted:      ['#166534', '#DCFCE7'],
    in_production: ['#0e7490', '#CFFAFE'],
    new:           ['#92400E', '#FEF3C7'],
  };
  const [color, bg] = map[status] ?? ['#374151', '#F3F4F6'];
  const label = status.replace(/_/g, ' ');
  return `<span style="display:inline-block;padding:5px 16px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:${color};background:${bg}">${label}</span>`;
}

function codeBox(code: string, label = 'Order number'): string {
  return `
    <div style="background:${PINK_LIGHT};border:1.5px solid ${PINK_BORDER};border-radius:14px;padding:18px 20px;margin-bottom:28px;text-align:center">
      <div style="font-size:10.5px;color:${INK_SOFT};text-transform:uppercase;letter-spacing:.1em;font-weight:700;margin-bottom:6px">${label}</div>
      <div style="font-size:24px;font-weight:800;color:${PINK};letter-spacing:.06em;font-family:'Courier New',monospace">${code}</div>
    </div>`;
}

function infoTable(rows: [string, string][]): string {
  const cells = rows.map(([label, value]) => `
    <tr>
      <td style="padding:11px 16px;background:${WARM};border-bottom:1px solid ${WARM_BORDER};font-size:12.5px;color:${INK_SOFT};white-space:nowrap;width:36%;font-weight:600;text-transform:uppercase;letter-spacing:.04em">${label}</td>
      <td style="padding:11px 16px;background:#fff;border-bottom:1px solid ${WARM_BORDER};font-size:13.5px;color:${INK};font-weight:500">${value}</td>
    </tr>`).join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="border-radius:12px;border:1px solid ${WARM_BORDER};overflow:hidden;margin-bottom:28px">
      ${cells}
    </table>`;
}

function itemsTable(items: Array<{ name: string; qty: number; size: string; color?: string; price: number }>): string {
  const rows = items.map(it => `
    <tr>
      <td style="padding:14px 16px;border-bottom:1px solid ${WARM_BORDER};font-size:13.5px;color:${INK}">
        <div style="font-weight:600;margin-bottom:3px">${it.name}</div>
        <div style="font-size:11.5px;color:${INK_SOFT}">Size: ${it.size}${it.color ? ` &nbsp;&middot;&nbsp; Color: ${it.color}` : ''} &nbsp;&middot;&nbsp; Qty: ${it.qty}</div>
      </td>
      <td style="padding:14px 16px;border-bottom:1px solid ${WARM_BORDER};font-size:14px;font-weight:700;color:${INK};text-align:right;white-space:nowrap">
        ${fmtDZD(it.price * it.qty)}
      </td>
    </tr>`).join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="border-radius:12px;border:1px solid ${WARM_BORDER};overflow:hidden;margin-bottom:20px">
      <tr style="background:${WARM}">
        <th style="padding:10px 16px;font-size:10.5px;color:${INK_SOFT};text-align:left;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid ${WARM_BORDER}">Item</th>
        <th style="padding:10px 16px;font-size:10.5px;color:${INK_SOFT};text-align:right;font-weight:700;letter-spacing:.07em;text-transform:uppercase;border-bottom:1px solid ${WARM_BORDER}">Total</th>
      </tr>
      ${rows}
    </table>`;
}

function totalBlock(subtotal: number, shippingFee: number, total: number): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
      <tr>
        <td style="padding:5px 0;font-size:13px;color:${INK_SOFT}">Subtotal</td>
        <td style="padding:5px 0;font-size:13px;color:${INK_MID};text-align:right">${fmtDZD(subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:5px 0;font-size:13px;color:${INK_SOFT}">Shipping</td>
        <td style="padding:5px 0;font-size:13px;color:${INK_MID};text-align:right">${fmtDZD(shippingFee)}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:0"><div style="height:1px;background:${WARM_BORDER};margin:10px 0"></div></td>
      </tr>
      <tr>
        <td style="padding:6px 0 0;font-size:16px;font-weight:700;color:${INK}">Total</td>
        <td style="padding:6px 0 0;font-size:18px;font-weight:800;color:${PINK};text-align:right">${fmtDZD(total)}</td>
      </tr>
    </table>`;
}

function callout(emoji: string, html: string, color: string, bg: string, border: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <td style="background:${bg};border-left:4px solid ${border};border-radius:10px;padding:16px 20px">
          <span style="font-size:14px;color:${color};line-height:1.65">${emoji}&ensp;${html}</span>
        </td>
      </tr>
    </table>`;
}

function ctaButton(label: string, href = '#'): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0">
      <tr>
        <td style="border-radius:999px;background:${PINK}">
          <a href="${href}" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:.02em">${label}</a>
        </td>
      </tr>
    </table>`;
}

function sectionLabel(text: string): string {
  return `<div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${INK_SOFT};margin-bottom:12px">${text}</div>`;
}

function fmtDZD(n: number): string {
  return new Intl.NumberFormat('fr-DZ').format(n) + '&nbsp;DA';
}

/** Build the storefront rating link for a given order code. */
function ratingLink(code: string): string {
  const base = (env.FRONTEND_URL || env.CORS_ORIGIN).replace(/\/+$/, '');
  return `${base}/rating?order=${encodeURIComponent(code)}`;
}

/* ── Data interfaces ─────────────────────────────────────────────────────── */

export interface OrderMailData {
  code: string;
  customer: string;
  email: string;
  phone: string;
  wilaya: string;
  city?: string | undefined;
  address?: string | undefined;
  shippingType: string;
  paymentMethod: string;
  items: Array<{ name: string; qty: number; size: string; color?: string; price: number }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  note?: string | undefined;
}

export interface CustomOrderMailData {
  code: string;
  customer: string;
  email: string;
  phone: string;
  wilaya: string;
  garmentType: string;
  size: string;
  colors: string[];
  budget: string;
  notes?: string | undefined;
}

export interface CustomOrderUpdateMailData extends CustomOrderMailData {
  status: string;
  quotedPrice?: number | undefined;
  note?: string | undefined;
}

/* ══════════════════════════════════════════════════════════════════════════
   CUSTOMER EMAILS
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Customer: new order placed (status: pending) ────────────────────────── */

export async function sendOrderPlacedCustomer(o: OrderMailData): Promise<void> {
  const deliveryLabel = o.shippingType === 'home' ? 'Home delivery' : 'Stop desk (agency pick-up)';
  const addressLine = [o.address, o.city, o.wilaya].filter(Boolean).join(', ');

  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">🎉</div>
      ${heading('We got your order!')}
      <div style="height:8px"></div>
      ${subtext(`Hi <strong>${o.customer}</strong>, thank you for shopping with Maibi! Your order has been received and is awaiting confirmation from our team. We'll be in touch very soon.`)}
    </div>

    ${codeBox(o.code)}
    ${sectionLabel('What you ordered')}
    ${itemsTable(o.items)}
    ${totalBlock(o.subtotal, o.shippingFee, o.total)}

    ${divider()}

    ${sectionLabel('Delivery details')}
    ${infoTable([
      ['Delivery type', deliveryLabel],
      ['Address', addressLine || o.wilaya],
      ['Phone', o.phone],
      ['Payment', o.paymentMethod],
    ])}

    ${callout('⏳', 'Our team will <strong>review and confirm your order</strong> within a few hours. You\'ll get another email the moment it\'s confirmed.', '#92400E', '#FFFBEB', '#F59E0B')}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">Got a question? Just reply to this email — we\'re here for you. 💬</p>
  `;
  await send(o.email, `We got your order! ${o.code} — Maibi`, shell(content, `Order ${o.code} received! Our team will confirm it shortly.`));
}

/* ── Customer: order confirmed by admin ──────────────────────────────────── */

export async function sendOrderConfirmedCustomer(o: OrderMailData): Promise<void> {
  const deliveryLabel = o.shippingType === 'home' ? 'Home delivery' : 'Stop desk (agency pick-up)';
  const addressLine = [o.address, o.city, o.wilaya].filter(Boolean).join(', ');

  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">✅</div>
      ${heading('Your order is confirmed!')}
      <div style="height:8px"></div>
      ${subtext(`Great news, <strong>${o.customer}</strong>! Our team has confirmed your order and our artisans are getting to work. We'll notify you as soon as it ships.`)}
    </div>

    <div style="text-align:center;margin-bottom:28px">${statusBadge('confirmed')}</div>

    ${codeBox(o.code)}
    ${sectionLabel('Order summary')}
    ${itemsTable(o.items)}
    ${totalBlock(o.subtotal, o.shippingFee, o.total)}

    ${divider()}

    ${sectionLabel('Delivery details')}
    ${infoTable([
      ['Delivery type', deliveryLabel],
      ['Address', addressLine || o.wilaya],
      ['Phone', o.phone],
      ['Payment', o.paymentMethod],
    ])}

    ${callout('🚚', 'Expected delivery in <strong>3–5 business days</strong>. You\'ll receive a shipping notification as soon as your order leaves our hands.', '#166534', '#F0FDF4', '#86EFAC')}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">Thank you for supporting Algerian craftsmanship! 🌸</p>
  `;
  await send(o.email, `Order confirmed! ${o.code} — Maibi`, shell(content, `Your order ${o.code} is confirmed and being prepared.`));
}

/* ── Customer: order shipped ─────────────────────────────────────────────── */

export async function sendOrderShippedCustomer(o: OrderMailData): Promise<void> {
  const deliveryLabel = o.shippingType === 'home' ? 'Home delivery' : 'Stop desk (agency pick-up)';
  const addressLine = [o.address, o.city, o.wilaya].filter(Boolean).join(', ');

  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">📦</div>
      ${heading("It's on its way!")}
      <div style="height:8px"></div>
      ${subtext(`Your package is heading to you, <strong>${o.customer}</strong>! Our artisans have lovingly packed your order and handed it to the carrier.`)}
    </div>

    <div style="text-align:center;margin-bottom:28px">${statusBadge('shipped')}</div>

    ${codeBox(o.code)}

    ${sectionLabel('Delivery details')}
    ${infoTable([
      ['Delivery type', deliveryLabel],
      ['Address', addressLine || o.wilaya],
      ['Phone', o.phone],
    ])}

    ${callout('🕐', 'Expected delivery in <strong>1–3 business days</strong>. Please make sure someone is available to receive your package at the address above.', '#1e40af', '#EFF6FF', '#93C5FD')}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">Can't wait for you to unwrap it! 🎀<br>Any questions? Reply to this email and we'll help right away.</p>
  `;
  await send(o.email, `Your order is shipped! ${o.code} — Maibi`, shell(content, `Order ${o.code} shipped — arriving in 1–3 business days.`));
}

/* ── Customer: order delivered ───────────────────────────────────────────── */

export async function sendOrderDeliveredCustomer(o: OrderMailData): Promise<void> {
  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">🌸</div>
      ${heading('Your order has arrived!')}
      <div style="height:8px"></div>
      ${subtext(`We hope you love it, <strong>${o.customer}</strong>! Your Maibi order has been delivered. Every stitch was made with care — just for you.`)}
    </div>

    <div style="text-align:center;margin-bottom:28px">${statusBadge('delivered')}</div>

    ${codeBox(o.code)}
    ${sectionLabel('Order summary')}
    ${itemsTable(o.items)}
    ${totalBlock(o.subtotal, o.shippingFee, o.total)}

    ${divider()}

    <div style="text-align:center;margin-bottom:8px">
      <div style="font-size:32px;margin-bottom:10px">⭐</div>
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${INK}">How did we do?</h2>
      ${subtext('We\'d love your feedback! <strong>Rate your order and the Maibi store</strong> — it only takes a minute and helps us keep improving.')}
      ${ctaButton('⭐ Rate your order', `${ratingLink(o.code)}`)}
    </div>

    ${callout('❤️', 'Thank you for supporting Algerian artisans! Your purchase helps keep traditional craftsmanship alive.', PINK, PINK_LIGHT, PINK_BORDER)}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">Enjoyed your Maibi piece? Share the love with your friends. 💕</p>
  `;
  await send(o.email, `Your order arrived! ${o.code} — Maibi`, shell(content, `Order ${o.code} delivered. Rate your order & the Maibi store!`));
}

/* ── Customer: order cancelled ───────────────────────────────────────────── */

export async function sendOrderCancelledCustomer(o: OrderMailData): Promise<void> {
  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">😔</div>
      ${heading('Your order has been cancelled')}
      <div style="height:8px"></div>
      ${subtext(`Hi <strong>${o.customer}</strong>, we're sorry to let you know that your order <strong>${o.code}</strong> has been cancelled.`)}
    </div>

    <div style="text-align:center;margin-bottom:28px">${statusBadge('cancelled')}</div>

    ${o.note ? callout('📝', `<strong>Reason:</strong> ${o.note}`, '#7f1d1d', '#FEF2F2', '#FECACA') : ''}

    ${sectionLabel('Cancelled order')}
    ${infoTable([
      ['Order', o.code],
      ['Items', o.items.map(i => `${i.name} &times; ${i.qty}`).join('<br>')],
      ['Total', fmtDZD(o.total)],
      ['Payment', o.paymentMethod],
    ])}

    ${callout('💬', 'Think this is a mistake? Just reply to this email or reach out to us on WhatsApp — we\'ll sort it out right away.', INK_MID, WARM, WARM_BORDER)}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">We hope to see you again soon. 🌸</p>
  `;
  await send(o.email, `Order cancelled — ${o.code} | Maibi`, shell(content, `Your order ${o.code} has been cancelled. Contact us if you need help.`));
}

/* ── Customer: order refunded ────────────────────────────────────────────── */

export async function sendOrderRefundedCustomer(o: OrderMailData): Promise<void> {
  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">💜</div>
      ${heading('Your refund is on its way')}
      <div style="height:8px"></div>
      ${subtext(`Hi <strong>${o.customer}</strong>, we've initiated a refund for your order <strong>${o.code}</strong>. We're sorry things didn't work out and truly appreciate your understanding.`)}
    </div>

    ${sectionLabel('Refund details')}
    ${infoTable([
      ['Order', o.code],
      ['Refund amount', fmtDZD(o.total)],
      ['Original payment', o.paymentMethod],
    ])}

    ${callout('📅', 'Refunds typically take <strong>3–7 business days</strong> to appear depending on your payment provider. If you have any questions, just reply to this email.', '#5b21b6', '#EDE9FE', '#C4B5FD')}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">Thank you for your patience — we hope to serve you better next time. 🌸</p>
  `;
  await send(o.email, `Refund processed — ${o.code} | Maibi`, shell(content, `Your refund for order ${o.code} has been initiated.`));
}

/* ── Customer: new custom order placed ───────────────────────────────────── */

export async function sendCustomOrderPlacedCustomer(o: CustomOrderMailData): Promise<void> {
  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">✨</div>
      ${heading('Your custom request is in!')}
      <div style="height:8px"></div>
      ${subtext(`How exciting, <strong>${o.customer}</strong>! We've received your custom order request. Our design team will review it carefully and get back to you with a personalised quote.`)}
    </div>

    ${codeBox(o.code, 'Request number')}

    ${sectionLabel('Request details')}
    ${infoTable([
      ['Garment', o.garmentType],
      ['Size', o.size],
      ['Colors', o.colors.join(', ') || '—'],
      ['Budget', o.budget || '—'],
      ['Wilaya', o.wilaya],
      ['Phone', o.phone],
    ])}

    ${o.notes ? callout('💬', `<strong>Your notes:</strong> ${o.notes}`, INK_MID, WARM, WARM_BORDER) : ''}

    ${callout('🎨', 'Our design team will review your request and <strong>send you a quote within 1–2 business days</strong>. We\'ll reach out at the contact details below.', '#1e40af', '#EFF6FF', '#93C5FD')}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">We can't wait to create something beautiful just for you. 🌸</p>
  `;
  await send(o.email, `Custom request received! ${o.code} — Maibi`, shell(content, `Custom order ${o.code} received. We'll send a quote within 1–2 days.`));
}

/* ── Customer: custom order quoted ──────────────────────────────────────── */

export async function sendCustomOrderQuotedCustomer(o: CustomOrderUpdateMailData): Promise<void> {
  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">📋</div>
      ${heading('Your quote is ready!')}
      <div style="height:8px"></div>
      ${subtext(`Good news, <strong>${o.customer}</strong>! Our team has reviewed your custom order and prepared a personalised quote for you.`)}
    </div>

    <div style="text-align:center;margin-bottom:28px">${statusBadge('quoted')}</div>

    ${codeBox(o.code, 'Request number')}

    ${typeof o.quotedPrice === 'number' ? `
    <div style="background:${PINK_LIGHT};border:1.5px solid ${PINK_BORDER};border-radius:14px;padding:24px 20px;text-align:center;margin-bottom:28px">
      <div style="font-size:10.5px;color:${INK_SOFT};text-transform:uppercase;letter-spacing:.1em;font-weight:700;margin-bottom:8px">Your quoted price</div>
      <div style="font-size:36px;font-weight:800;color:${PINK};letter-spacing:.02em">${fmtDZD(o.quotedPrice)}</div>
      <div style="font-size:12.5px;color:${INK_SOFT};margin-top:8px">Reply to this email or contact us on WhatsApp to confirm and proceed.</div>
    </div>` : ''}

    ${sectionLabel('Request summary')}
    ${infoTable([
      ['Garment', o.garmentType],
      ['Size', o.size],
      ['Colors', o.colors.join(', ') || '—'],
      ['Wilaya', o.wilaya],
      ['Phone', o.phone],
    ])}

    ${o.note ? callout('📝', `<strong>Note from our team:</strong> ${o.note}`, INK_MID, WARM, WARM_BORDER) : ''}

    ${callout('⏰', 'Please <strong>confirm your acceptance within 48 hours</strong> so we can reserve your spot and begin production.', '#92400E', '#FFFBEB', '#F59E0B')}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">We're excited to bring your vision to life! 🌸</p>
  `;
  await send(o.email, `Your quote is ready! ${o.code} — Maibi`, shell(content, `Quote ready for custom order ${o.code}${typeof o.quotedPrice === 'number' ? ` — ${fmtDZD(o.quotedPrice)}` : ''}.`));
}

/* ── Customer: custom order accepted / in review / in production ─────────── */

export async function sendCustomOrderConfirmedCustomer(o: CustomOrderUpdateMailData): Promise<void> {
  const statusMessages: Record<string, { emoji: string; title: string; body: string; calloutText: string; calloutColor: string; calloutBg: string; calloutBorder: string }> = {
    in_review: {
      emoji: '🔍',
      title: 'Your request is under review',
      body: `Our design team is carefully reviewing your custom order, <strong>${o.customer}</strong>. We'll have your quote ready very soon!`,
      calloutText: 'We\'ll contact you within <strong>1–2 business days</strong> with your personalised quote.',
      calloutColor: '#1e40af', calloutBg: '#EFF6FF', calloutBorder: '#93C5FD',
    },
    accepted: {
      emoji: '🎉',
      title: 'Your custom order is accepted!',
      body: `Wonderful news, <strong>${o.customer}</strong>! Your custom design has been accepted by our team and our artisans are eager to bring it to life.`,
      calloutText: 'Our artisans will <strong>begin crafting your piece</strong> right away. We\'ll keep you updated at every step.',
      calloutColor: '#166534', calloutBg: '#F0FDF4', calloutBorder: '#86EFAC',
    },
    in_production: {
      emoji: '🧵',
      title: "Your piece is being crafted!",
      body: `Exciting news, <strong>${o.customer}</strong>! Our artisans have started working on your custom piece. Every stitch is being done with care and love.`,
      calloutText: 'Your piece is now <strong>in production</strong>. We\'ll notify you as soon as it\'s ready to ship.',
      calloutColor: '#0e7490', calloutBg: '#CFFAFE', calloutBorder: '#67E8F9',
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const msg = (statusMessages[o.status] ?? statusMessages['accepted'])!;

  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">${msg.emoji}</div>
      ${heading(msg.title)}
      <div style="height:8px"></div>
      ${subtext(msg.body)}
    </div>

    <div style="text-align:center;margin-bottom:28px">${statusBadge(o.status)}</div>

    ${codeBox(o.code, 'Request number')}

    ${sectionLabel('Request details')}
    ${infoTable([
      ['Garment', o.garmentType],
      ['Size', o.size],
      ['Colors', o.colors.join(', ') || '—'],
      ['Wilaya', o.wilaya],
      ['Phone', o.phone],
    ])}

    ${callout('ℹ️', msg.calloutText, msg.calloutColor, msg.calloutBg, msg.calloutBorder)}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">Questions? Just reply to this email — we're always happy to help. 💬</p>
  `;

  const subjectMap: Record<string, string> = {
    in_review: `Your custom request is being reviewed — ${o.code} | Maibi`,
    accepted:  `Custom order accepted! ${o.code} — Maibi`,
    in_production: `Your piece is in production! ${o.code} — Maibi`,
  };

  await send(o.email, subjectMap[o.status] ?? `Custom order update — ${o.code} | Maibi`, shell(content, `Custom order ${o.code} status: ${o.status.replace(/_/g, ' ')}.`));
}

/* ── Customer: custom order shipped ─────────────────────────────────────── */

export async function sendCustomOrderShippedCustomer(o: CustomOrderUpdateMailData): Promise<void> {
  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">📦</div>
      ${heading('Your custom piece is on its way!')}
      <div style="height:8px"></div>
      ${subtext(`The wait is almost over, <strong>${o.customer}</strong>! Your handmade piece has been carefully packed and is now in the hands of the carrier.`)}
    </div>

    <div style="text-align:center;margin-bottom:28px">${statusBadge('shipped')}</div>

    ${codeBox(o.code, 'Request number')}

    ${sectionLabel('Your custom piece')}
    ${infoTable([
      ['Garment', o.garmentType],
      ['Size', o.size],
      ['Colors', o.colors.join(', ') || '—'],
      ['Wilaya', o.wilaya],
      ['Phone', o.phone],
    ])}

    ${callout('🕐', 'Expected delivery in <strong>1–3 business days</strong>. Please make sure someone is available to receive your package.', '#1e40af', '#EFF6FF', '#93C5FD')}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">Can't wait for you to see it! 🎀</p>
  `;
  await send(o.email, `Your custom piece is shipped! ${o.code} — Maibi`, shell(content, `Custom order ${o.code} shipped — arriving in 1–3 business days.`));
}

/* ── Customer: custom order delivered ───────────────────────────────────── */

export async function sendCustomOrderDeliveredCustomer(o: CustomOrderUpdateMailData): Promise<void> {
  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">🌸</div>
      ${heading('Your custom piece has arrived!')}
      <div style="height:8px"></div>
      ${subtext(`We hope you absolutely love it, <strong>${o.customer}</strong>! Your one-of-a-kind Maibi piece has been delivered — made especially for you by our artisans.`)}
    </div>

    <div style="text-align:center;margin-bottom:28px">${statusBadge('delivered')}</div>

    ${codeBox(o.code, 'Request number')}

    ${sectionLabel('Your custom piece')}
    ${infoTable([
      ['Garment', o.garmentType],
      ['Size', o.size],
      ['Colors', o.colors.join(', ') || '—'],
      ['Wilaya', o.wilaya],
    ])}

    ${callout('❤️', 'Thank you for trusting our artisans with your vision. <strong>We\'d love to hear what you think</strong> — just reply to this email! Your feedback means the world to us.', PINK, PINK_LIGHT, PINK_BORDER)}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">Thank you for supporting Algerian craftsmanship. 💕</p>
  `;
  await send(o.email, `Your custom piece arrived! ${o.code} — Maibi`, shell(content, `Custom order ${o.code} delivered. Thank you for shopping with Maibi!`));
}

/* ── Customer: custom order cancelled ───────────────────────────────────── */

export async function sendCustomOrderCancelledCustomer(o: CustomOrderUpdateMailData): Promise<void> {
  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">😔</div>
      ${heading('Custom order cancelled')}
      <div style="height:8px"></div>
      ${subtext(`Hi <strong>${o.customer}</strong>, we're sorry to let you know that your custom order request <strong>${o.code}</strong> has been cancelled.`)}
    </div>

    <div style="text-align:center;margin-bottom:28px">${statusBadge('cancelled')}</div>

    ${(o.note || o.notes) ? callout('📝', `<strong>Reason:</strong> ${o.note || o.notes}`, '#7f1d1d', '#FEF2F2', '#FECACA') : ''}

    ${sectionLabel('Cancelled request')}
    ${infoTable([
      ['Request', o.code],
      ['Garment', o.garmentType],
      ['Size', o.size],
      ['Colors', o.colors.join(', ') || '—'],
      ['Wilaya', o.wilaya],
    ])}

    ${callout('💬', 'Have questions or want to submit a new request? Just reply to this email or contact us directly — we\'re always happy to help find a solution.', INK_MID, WARM, WARM_BORDER)}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">We hope to create something beautiful for you soon. 🌸</p>
  `;
  await send(o.email, `Custom order cancelled — ${o.code} | Maibi`, shell(content, `Your custom order ${o.code} has been cancelled.`));
}

/* ══════════════════════════════════════════════════════════════════════════
   ADMIN EMAILS
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Admin: new regular order placed ────────────────────────────────────── */

export async function sendNewOrderAdmin(o: OrderMailData): Promise<void> {
  const content = `
    <div style="margin-bottom:24px">
      <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${INK_SOFT};margin-bottom:8px">New order received</div>
      <div style="font-size:28px;font-weight:800;color:${INK};margin-bottom:10px">${o.code}</div>
      ${statusBadge('pending')}
    </div>

    ${sectionLabel('Customer info')}
    ${infoTable([
      ['Customer', o.customer],
      ['Email', o.email],
      ['Phone', o.phone],
      ['Wilaya', o.wilaya],
      ['Delivery', o.shippingType === 'home' ? 'Home delivery' : 'Stop desk'],
      ['Payment', o.paymentMethod],
    ])}

    ${sectionLabel('Order items')}
    ${itemsTable(o.items)}
    ${totalBlock(o.subtotal, o.shippingFee, o.total)}

    ${o.note ? callout('📝', `<strong>Customer note:</strong> ${o.note}`, INK_MID, WARM, WARM_BORDER) : ''}
  `;
  await send(env.ADMIN_EMAIL, `New order ${o.code} — ${fmtDZD(o.total)} | Maibi`, shell(content, `New order ${o.code} from ${o.customer} (${o.wilaya}) — ${fmtDZD(o.total)}.`));
}

/* ── Admin: new custom order placed ─────────────────────────────────────── */

export async function sendNewCustomOrderAdmin(o: CustomOrderMailData): Promise<void> {
  const content = `
    <div style="margin-bottom:24px">
      <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${INK_SOFT};margin-bottom:8px">New custom order request</div>
      <div style="font-size:28px;font-weight:800;color:${INK};margin-bottom:10px">${o.code}</div>
      ${statusBadge('new')}
    </div>

    ${sectionLabel('Customer info')}
    ${infoTable([
      ['Customer', o.customer],
      ['Email', o.email],
      ['Phone', o.phone],
      ['Wilaya', o.wilaya],
    ])}

    ${sectionLabel('Request details')}
    ${infoTable([
      ['Garment', o.garmentType],
      ['Size', o.size],
      ['Colors', o.colors.join(', ') || '—'],
      ['Budget', o.budget || '—'],
    ])}

    ${o.notes ? callout('💬', `<strong>Customer notes:</strong> ${o.notes}`, INK_MID, WARM, WARM_BORDER) : ''}
  `;
  await send(env.ADMIN_EMAIL, `New custom order ${o.code} — ${o.customer} | Maibi`, shell(content, `New custom order ${o.code} from ${o.customer} (${o.wilaya}).`));
}
