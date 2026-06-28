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

type Lang = 'ar' | 'en';

/**
 * Email shell. Customer emails render in Arabic (RTL); admin alerts pass
 * `lang: 'en'` to stay English/LTR. Emails can't rely on webfonts, so the
 * Arabic stack falls back to Tahoma/Arial which ship with most mail clients.
 */
function shell(content: string, preheader = '', lang: Lang = 'ar'): string {
  const rtl = lang === 'ar';
  const dir = rtl ? 'rtl' : 'ltr';
  const align = rtl ? 'right' : 'left';
  const fontStack = rtl
    ? `'Segoe UI','Tahoma',Arial,sans-serif`
    : `'Helvetica Neue',Helvetica,Arial,sans-serif`;

  const tagline = rtl ? 'أزياء جزائرية مصنوعة يدويًا' : 'Algerian Handmade Fashion';
  const footerMade = rtl ? 'صُنع بحبّ على يد حرفيّات جزائريات' : 'Made with love by Algerian artisans';
  const footerNote = rtl
    ? 'وصلتكِ هذه الرسالة لأنّه تمّ تنفيذ طلب أو تحديثه على Maibi.<br>عندكِ سؤال؟ ردّي على هذه الرسالة — يسعدنا دائمًا مساعدتكِ.'
    : "You received this email because an order was placed or updated on Maibi.<br>Questions? Simply reply to this email — we're always happy to help.";

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Maibi</title>
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    body{margin:0;padding:0;background:${WARM};font-family:${fontStack};direction:${dir}}
    img{border:0;outline:none;text-decoration:none;display:block}
    a{color:${PINK};text-decoration:none}
    @media only screen and (max-width:600px){
      .email-body{width:100%!important}
      .email-pad{padding:28px 20px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${WARM};direction:${dir}">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:${WARM}">${preheader}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" dir="${dir}" style="background:${WARM}">
    <tr><td align="center" style="padding:36px 16px 48px">
      <table class="email-body" role="presentation" width="600" cellpadding="0" cellspacing="0" dir="${dir}"
             style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.10)">

        <!-- Header / Logo -->
        <tr>
          <td style="background:linear-gradient(135deg,#F7527F 0%,${PINK} 50%,${PINK_DARK} 100%);padding:32px 40px 28px;text-align:center">
            <div style="margin-bottom:6px">
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:42px;font-weight:700;color:#fff;letter-spacing:.02em;font-style:italic">Maibi</span>
            </div>
            <div style="display:inline-block;background:rgba(255,255,255,.18);border-radius:20px;padding:3px 14px">
              <span style="font-size:11px;color:rgba(255,255,255,.90);letter-spacing:.06em;font-weight:600">${tagline}</span>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td class="email-pad" style="background:#fff;padding:44px 44px 36px;text-align:${align}">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${WARM};border-top:1px solid ${WARM_BORDER};padding:28px 44px 32px;text-align:center">
            <p style="margin:0 0 4px;font-size:13px;color:${INK_SOFT}">${footerMade}</p>
            <p style="margin:0 0 16px;font-size:12px;color:#bbb">© ${new Date().getFullYear()} Maibi &nbsp;·&nbsp; ${tagline}</p>
            <p style="margin:0;font-size:11px;color:#ccc;line-height:1.7">${footerNote}</p>
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

/** Arabic status labels for the coloured status badge. */
const STATUS_LABEL_AR: Record<string, string> = {
  confirmed:     'مؤكّد',
  shipped:       'تمّ الشحن',
  delivered:     'تمّ التوصيل',
  cancelled:     'ملغى',
  pending:       'قيد المراجعة',
  in_review:     'قيد المراجعة',
  quoted:        'تمّ عرض السعر',
  accepted:      'مقبول',
  in_production: 'قيد التصنيع',
  new:           'جديد',
  refunded:      'تمّ الاسترداد',
};

function statusBadge(status: string, lang: Lang = 'ar'): string {
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
  if (lang === 'en') {
    const label = status.replace(/_/g, ' ');
    return `<span style="display:inline-block;padding:5px 16px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:${color};background:${bg}">${label}</span>`;
  }
  // Arabic has no letter case, so drop uppercase/letter-spacing for readability.
  const label = STATUS_LABEL_AR[status] ?? status.replace(/_/g, ' ');
  return `<span style="display:inline-block;padding:5px 16px;border-radius:999px;font-size:12px;font-weight:700;color:${color};background:${bg}">${label}</span>`;
}

function codeBox(code: string, label = 'رقم الطلب'): string {
  return `
    <div style="background:${PINK_LIGHT};border:1.5px solid ${PINK_BORDER};border-radius:14px;padding:18px 20px;margin-bottom:28px;text-align:center">
      <div style="font-size:10.5px;color:${INK_SOFT};text-transform:uppercase;letter-spacing:.1em;font-weight:700;margin-bottom:6px">${label}</div>
      <div style="font-size:24px;font-weight:800;color:${PINK};letter-spacing:.06em;font-family:'Courier New',monospace">${code}</div>
    </div>`;
}

function infoTable(rows: [string, string][]): string {
  const cells = rows.map(([label, value]) => `
    <tr>
      <td style="padding:11px 16px;background:${WARM};border-bottom:1px solid ${WARM_BORDER};font-size:12.5px;color:${INK_SOFT};white-space:nowrap;width:36%;font-weight:600">${label}</td>
      <td style="padding:11px 16px;background:#fff;border-bottom:1px solid ${WARM_BORDER};font-size:13.5px;color:${INK};font-weight:500">${value}</td>
    </tr>`).join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="border-radius:12px;border:1px solid ${WARM_BORDER};overflow:hidden;margin-bottom:28px">
      ${cells}
    </table>`;
}

function itemsTable(
  items: Array<{ name: string; qty: number; size: string; color?: string; price: number }>,
  lang: Lang = 'ar',
): string {
  const L = lang === 'en'
    ? { size: 'Size', color: 'Color', qty: 'Qty', item: 'Item', total: 'Total' }
    : { size: 'القياس', color: 'اللون', qty: 'الكمية', item: 'القطعة', total: 'المجموع' };
  const startAlign = lang === 'en' ? 'left' : 'right';
  const endAlign = lang === 'en' ? 'right' : 'left';
  const rows = items.map(it => `
    <tr>
      <td style="padding:14px 16px;border-bottom:1px solid ${WARM_BORDER};font-size:13.5px;color:${INK}">
        <div style="font-weight:600;margin-bottom:3px">${it.name}</div>
        <div style="font-size:11.5px;color:${INK_SOFT}">${L.size}: ${it.size}${it.color ? ` &nbsp;&middot;&nbsp; ${L.color}: ${it.color}` : ''} &nbsp;&middot;&nbsp; ${L.qty}: ${it.qty}</div>
      </td>
      <td style="padding:14px 16px;border-bottom:1px solid ${WARM_BORDER};font-size:14px;font-weight:700;color:${INK};text-align:${endAlign};white-space:nowrap">
        ${fmtDZD(it.price * it.qty, lang)}
      </td>
    </tr>`).join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="border-radius:12px;border:1px solid ${WARM_BORDER};overflow:hidden;margin-bottom:20px">
      <tr style="background:${WARM}">
        <th style="padding:10px 16px;font-size:11px;color:${INK_SOFT};text-align:${startAlign};font-weight:700;border-bottom:1px solid ${WARM_BORDER}">${L.item}</th>
        <th style="padding:10px 16px;font-size:11px;color:${INK_SOFT};text-align:${endAlign};font-weight:700;border-bottom:1px solid ${WARM_BORDER}">${L.total}</th>
      </tr>
      ${rows}
    </table>`;
}

function totalBlock(subtotal: number, shippingFee: number, total: number, lang: Lang = 'ar'): string {
  const L = lang === 'en'
    ? { subtotal: 'Subtotal', shipping: 'Shipping', total: 'Total' }
    : { subtotal: 'المجموع الفرعي', shipping: 'الشحن', total: 'الإجمالي' };
  const endAlign = lang === 'en' ? 'right' : 'left';
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
      <tr>
        <td style="padding:5px 0;font-size:13px;color:${INK_SOFT}">${L.subtotal}</td>
        <td style="padding:5px 0;font-size:13px;color:${INK_MID};text-align:${endAlign}">${fmtDZD(subtotal, lang)}</td>
      </tr>
      <tr>
        <td style="padding:5px 0;font-size:13px;color:${INK_SOFT}">${L.shipping}</td>
        <td style="padding:5px 0;font-size:13px;color:${INK_MID};text-align:${endAlign}">${fmtDZD(shippingFee, lang)}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:0"><div style="height:1px;background:${WARM_BORDER};margin:10px 0"></div></td>
      </tr>
      <tr>
        <td style="padding:6px 0 0;font-size:16px;font-weight:700;color:${INK}">${L.total}</td>
        <td style="padding:6px 0 0;font-size:18px;font-weight:800;color:${PINK};text-align:${endAlign}">${fmtDZD(total, lang)}</td>
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

function fmtDZD(n: number, lang: Lang = 'ar'): string {
  const suffix = lang === 'en' ? 'DA' : 'دج';
  return new Intl.NumberFormat('fr-DZ').format(n) + '&nbsp;' + suffix;
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
  const deliveryLabel = o.shippingType === 'home' ? 'التوصيل إلى المنزل' : 'مكتب الاستلام (الاستلام من الوكالة)';
  const addressLine = [o.address, o.city, o.wilaya].filter(Boolean).join('، ');

  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">🎉</div>
      ${heading('استلمنا طلبكِ!')}
      <div style="height:8px"></div>
      ${subtext(`مرحبًا <strong>${o.customer}</strong>، شكرًا لتسوّقكِ من Maibi! تمّ استلام طلبكِ وهو الآن بانتظار التأكيد من فريقنا. سنتواصل معكِ قريبًا جدًّا.`)}
    </div>

    ${codeBox(o.code)}
    ${sectionLabel('ما طلبتِه')}
    ${itemsTable(o.items)}
    ${totalBlock(o.subtotal, o.shippingFee, o.total)}

    ${divider()}

    ${sectionLabel('تفاصيل التوصيل')}
    ${infoTable([
      ['نوع التوصيل', deliveryLabel],
      ['العنوان', addressLine || o.wilaya],
      ['الهاتف', o.phone],
      ['طريقة الدفع', o.paymentMethod],
    ])}

    ${callout('⏳', 'سيقوم فريقنا <strong>بمراجعة طلبكِ وتأكيده</strong> خلال ساعات قليلة. وستصلكِ رسالة أخرى بمجرّد تأكيده.', '#92400E', '#FFFBEB', '#F59E0B')}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">عندكِ سؤال؟ ردّي على هذه الرسالة — نحن هنا من أجلكِ. 💬</p>
  `;
  await send(o.email, `استلمنا طلبكِ! ${o.code} — Maibi`, shell(content, `تمّ استلام الطلب ${o.code}! سيؤكّده فريقنا قريبًا.`));
}

/* ── Customer: order confirmed by admin ──────────────────────────────────── */

export async function sendOrderConfirmedCustomer(o: OrderMailData): Promise<void> {
  const deliveryLabel = o.shippingType === 'home' ? 'التوصيل إلى المنزل' : 'مكتب الاستلام (الاستلام من الوكالة)';
  const addressLine = [o.address, o.city, o.wilaya].filter(Boolean).join('، ');

  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">✅</div>
      ${heading('تمّ تأكيد طلبكِ!')}
      <div style="height:8px"></div>
      ${subtext(`خبر سارّ يا <strong>${o.customer}</strong>! أكّد فريقنا طلبكِ وبدأت حرفيّاتنا العمل عليه. سنُعلمكِ بمجرّد شحنه.`)}
    </div>

    <div style="text-align:center;margin-bottom:28px">${statusBadge('confirmed')}</div>

    ${codeBox(o.code)}
    ${sectionLabel('ملخّص الطلب')}
    ${itemsTable(o.items)}
    ${totalBlock(o.subtotal, o.shippingFee, o.total)}

    ${divider()}

    ${sectionLabel('تفاصيل التوصيل')}
    ${infoTable([
      ['نوع التوصيل', deliveryLabel],
      ['العنوان', addressLine || o.wilaya],
      ['الهاتف', o.phone],
      ['طريقة الدفع', o.paymentMethod],
    ])}

    ${o.note ? callout('📝', `<strong>ملاحظة من فريقنا:</strong> ${o.note}`, INK_MID, WARM, WARM_BORDER) : ''}

    ${callout('🚚', 'الوصول المتوقّع خلال <strong>3 إلى 5 أيام عمل</strong>. ستصلكِ رسالة بالشحن بمجرّد مغادرة طلبكِ بين أيدينا.', '#166534', '#F0FDF4', '#86EFAC')}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">شكرًا لدعمكِ الحرفة الجزائرية! 🌸</p>
  `;
  await send(o.email, `تمّ تأكيد الطلب! ${o.code} — Maibi`, shell(content, `طلبكِ ${o.code} مؤكّد وقيد التحضير.`));
}

/* ── Customer: order shipped ─────────────────────────────────────────────── */

export async function sendOrderShippedCustomer(o: OrderMailData): Promise<void> {
  const deliveryLabel = o.shippingType === 'home' ? 'التوصيل إلى المنزل' : 'مكتب الاستلام (الاستلام من الوكالة)';
  const addressLine = [o.address, o.city, o.wilaya].filter(Boolean).join('، ');

  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">📦</div>
      ${heading('طلبكِ في الطريق إليكِ!')}
      <div style="height:8px"></div>
      ${subtext(`طردكِ في طريقه إليكِ يا <strong>${o.customer}</strong>! غلّفت حرفيّاتنا طلبكِ بكلّ عناية وسلّمنه لشركة التوصيل.`)}
    </div>

    <div style="text-align:center;margin-bottom:28px">${statusBadge('shipped')}</div>

    ${codeBox(o.code)}

    ${sectionLabel('تفاصيل التوصيل')}
    ${infoTable([
      ['نوع التوصيل', deliveryLabel],
      ['العنوان', addressLine || o.wilaya],
      ['الهاتف', o.phone],
    ])}

    ${o.note ? callout('📝', `<strong>ملاحظة من فريقنا:</strong> ${o.note}`, INK_MID, WARM, WARM_BORDER) : ''}

    ${callout('🕐', 'الوصول المتوقّع خلال <strong>1 إلى 3 أيام عمل</strong>. يُرجى التأكّد من وجود شخص لاستلام الطرد على العنوان أعلاه.', '#1e40af', '#EFF6FF', '#93C5FD')}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">لا نطيق صبرًا لرؤيتكِ تفتحينه! 🎀<br>أيّ سؤال؟ ردّي على هذه الرسالة وسنساعدكِ فورًا.</p>
  `;
  await send(o.email, `تمّ شحن طلبكِ! ${o.code} — Maibi`, shell(content, `تمّ شحن الطلب ${o.code} — يصل خلال 1 إلى 3 أيام عمل.`));
}

/* ── Customer: order delivered ───────────────────────────────────────────── */

export async function sendOrderDeliveredCustomer(o: OrderMailData): Promise<void> {
  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">🌸</div>
      ${heading('وصل طلبكِ!')}
      <div style="height:8px"></div>
      ${subtext(`نتمنّى أن ينال إعجابكِ يا <strong>${o.customer}</strong>! تمّ توصيل طلبكِ من Maibi. كلّ غرزة صُنعت بعناية — خصّيصًا لكِ.`)}
    </div>

    <div style="text-align:center;margin-bottom:28px">${statusBadge('delivered')}</div>

    ${codeBox(o.code)}
    ${sectionLabel('ملخّص الطلب')}
    ${itemsTable(o.items)}
    ${totalBlock(o.subtotal, o.shippingFee, o.total)}

    ${divider()}

    <div style="text-align:center;margin-bottom:8px">
      <div style="font-size:32px;margin-bottom:10px">⭐</div>
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:${INK}">كيف كانت تجربتكِ؟</h2>
      ${subtext('يسعدنا رأيكِ! <strong>قيّمي طلبكِ ومتجر Maibi</strong> — لن يستغرق سوى دقيقة ويساعدنا على التحسّن باستمرار.')}
      ${ctaButton('⭐ قيّمي طلبكِ', `${ratingLink(o.code)}`)}
    </div>

    ${o.note ? callout('📝', `<strong>ملاحظة من فريقنا:</strong> ${o.note}`, INK_MID, WARM, WARM_BORDER) : ''}

    ${callout('❤️', 'شكرًا لدعمكِ الحرفيّات الجزائريات! شراؤكِ يساعد على إبقاء الحرفة التقليدية حيّة.', PINK, PINK_LIGHT, PINK_BORDER)}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">أحببتِ قطعتكِ من Maibi؟ شاركي الحبّ مع صديقاتكِ. 💕</p>
  `;
  await send(o.email, `وصل طلبكِ! ${o.code} — Maibi`, shell(content, `تمّ توصيل الطلب ${o.code}. قيّمي طلبكِ ومتجر Maibi!`));
}

/* ── Customer: order cancelled ───────────────────────────────────────────── */

export async function sendOrderCancelledCustomer(o: OrderMailData): Promise<void> {
  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">😔</div>
      ${heading('تمّ إلغاء طلبكِ')}
      <div style="height:8px"></div>
      ${subtext(`مرحبًا <strong>${o.customer}</strong>، يؤسفنا إبلاغكِ بأنّه تمّ إلغاء طلبكِ <strong>${o.code}</strong>.`)}
    </div>

    <div style="text-align:center;margin-bottom:28px">${statusBadge('cancelled')}</div>

    ${o.note ? callout('📝', `<strong>السبب:</strong> ${o.note}`, '#7f1d1d', '#FEF2F2', '#FECACA') : ''}

    ${sectionLabel('الطلب الملغى')}
    ${infoTable([
      ['الطلب', o.code],
      ['القطع', o.items.map(i => `${i.name} &times; ${i.qty}`).join('<br>')],
      ['الإجمالي', fmtDZD(o.total)],
      ['طريقة الدفع', o.paymentMethod],
    ])}

    ${callout('💬', 'تظنّين أنّ هذا خطأ؟ ردّي على هذه الرسالة أو تواصلي معنا عبر واتساب — وسنحلّ الأمر فورًا.', INK_MID, WARM, WARM_BORDER)}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">نأمل أن نراكِ مجدّدًا قريبًا. 🌸</p>
  `;
  await send(o.email, `تمّ إلغاء الطلب — ${o.code} | Maibi`, shell(content, `تمّ إلغاء طلبكِ ${o.code}. تواصلي معنا إن احتجتِ مساعدة.`));
}

/* ── Customer: order refunded ────────────────────────────────────────────── */

export async function sendOrderRefundedCustomer(o: OrderMailData): Promise<void> {
  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">💜</div>
      ${heading('استردادكِ في الطريق')}
      <div style="height:8px"></div>
      ${subtext(`مرحبًا <strong>${o.customer}</strong>، باشرنا استرداد قيمة طلبكِ <strong>${o.code}</strong>. نأسف لأنّ الأمور لم تسر كما يجب ونقدّر تفهّمكِ حقًّا.`)}
    </div>

    ${sectionLabel('تفاصيل الاسترداد')}
    ${infoTable([
      ['الطلب', o.code],
      ['مبلغ الاسترداد', fmtDZD(o.total)],
      ['طريقة الدفع الأصلية', o.paymentMethod],
    ])}

    ${callout('📅', 'يستغرق الاسترداد عادةً <strong>3 إلى 7 أيام عمل</strong> حسب مزوّد الدفع الخاصّ بكِ. إن كان لديكِ أيّ سؤال، فقط ردّي على هذه الرسالة.', '#5b21b6', '#EDE9FE', '#C4B5FD')}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">شكرًا لصبركِ — نأمل أن نخدمكِ بشكل أفضل في المرّة القادمة. 🌸</p>
  `;
  await send(o.email, `تمّ تنفيذ الاسترداد — ${o.code} | Maibi`, shell(content, `تمّت مباشرة استرداد قيمة طلبكِ ${o.code}.`));
}

/* ── Customer: new custom order placed ───────────────────────────────────── */

export async function sendCustomOrderPlacedCustomer(o: CustomOrderMailData): Promise<void> {
  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">✨</div>
      ${heading('وصلنا طلبكِ المخصّص!')}
      <div style="height:8px"></div>
      ${subtext(`كم هذا مشوّق يا <strong>${o.customer}</strong>! استلمنا طلبكِ المخصّص. سيراجعه فريق التصميم لدينا بعناية ويعود إليكِ بعرض سعر مخصّص.`)}
    </div>

    ${codeBox(o.code, 'رقم الطلب')}

    ${sectionLabel('تفاصيل الطلب')}
    ${infoTable([
      ['نوع القطعة', o.garmentType],
      ['القياس', o.size],
      ['الألوان', o.colors.join('، ') || '—'],
      ['الميزانية', o.budget || '—'],
      ['الولاية', o.wilaya],
      ['الهاتف', o.phone],
    ])}

    ${o.notes ? callout('💬', `<strong>ملاحظاتكِ:</strong> ${o.notes}`, INK_MID, WARM, WARM_BORDER) : ''}

    ${callout('🎨', 'سيراجع فريق التصميم لدينا طلبكِ <strong>ويرسل لكِ عرض سعر خلال 1 إلى 2 يوم عمل</strong>. سنتواصل معكِ على بيانات الاتصال أدناه.', '#1e40af', '#EFF6FF', '#93C5FD')}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">لا نطيق صبرًا لنصنع شيئًا جميلًا خصّيصًا لكِ. 🌸</p>
  `;
  await send(o.email, `وصلنا طلبكِ المخصّص! ${o.code} — Maibi`, shell(content, `وصلنا الطلب المخصّص ${o.code}. سنرسل عرض سعر خلال 1 إلى 2 يوم.`));
}

/* ── Customer: custom order quoted ──────────────────────────────────────── */

export async function sendCustomOrderQuotedCustomer(o: CustomOrderUpdateMailData): Promise<void> {
  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">📋</div>
      ${heading('عرض سعركِ جاهز!')}
      <div style="height:8px"></div>
      ${subtext(`خبر سارّ يا <strong>${o.customer}</strong>! راجع فريقنا طلبكِ المخصّص وأعدّ لكِ عرض سعر مخصّص.`)}
    </div>

    <div style="text-align:center;margin-bottom:28px">${statusBadge('quoted')}</div>

    ${codeBox(o.code, 'رقم الطلب')}

    ${typeof o.quotedPrice === 'number' ? `
    <div style="background:${PINK_LIGHT};border:1.5px solid ${PINK_BORDER};border-radius:14px;padding:24px 20px;text-align:center;margin-bottom:28px">
      <div style="font-size:11px;color:${INK_SOFT};font-weight:700;margin-bottom:8px">السعر المعروض عليكِ</div>
      <div style="font-size:36px;font-weight:800;color:${PINK};letter-spacing:.02em">${fmtDZD(o.quotedPrice)}</div>
      <div style="font-size:12.5px;color:${INK_SOFT};margin-top:8px">ردّي على هذه الرسالة أو تواصلي معنا عبر واتساب للتأكيد والمتابعة.</div>
    </div>` : ''}

    ${sectionLabel('ملخّص الطلب')}
    ${infoTable([
      ['نوع القطعة', o.garmentType],
      ['القياس', o.size],
      ['الألوان', o.colors.join('، ') || '—'],
      ['الولاية', o.wilaya],
      ['الهاتف', o.phone],
    ])}

    ${o.note ? callout('📝', `<strong>ملاحظة من فريقنا:</strong> ${o.note}`, INK_MID, WARM, WARM_BORDER) : ''}

    ${callout('⏰', 'يُرجى <strong>تأكيد موافقتكِ خلال 48 ساعة</strong> حتى نحجز لكِ مكانكِ ونبدأ التصنيع.', '#92400E', '#FFFBEB', '#F59E0B')}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">متحمّسات لتحقيق رؤيتكِ على أرض الواقع! 🌸</p>
  `;
  await send(o.email, `عرض سعركِ جاهز! ${o.code} — Maibi`, shell(content, `عرض السعر جاهز للطلب المخصّص ${o.code}${typeof o.quotedPrice === 'number' ? ` — ${fmtDZD(o.quotedPrice)}` : ''}.`));
}

/* ── Customer: custom order accepted / in review / in production ─────────── */

export async function sendCustomOrderConfirmedCustomer(o: CustomOrderUpdateMailData): Promise<void> {
  const statusMessages: Record<string, { emoji: string; title: string; body: string; calloutText: string; calloutColor: string; calloutBg: string; calloutBorder: string }> = {
    in_review: {
      emoji: '🔍',
      title: 'طلبكِ قيد المراجعة',
      body: `فريق التصميم لدينا يراجع طلبكِ المخصّص بعناية يا <strong>${o.customer}</strong>. سيكون عرض سعركِ جاهزًا قريبًا جدًّا!`,
      calloutText: 'سنتواصل معكِ خلال <strong>1 إلى 2 يوم عمل</strong> بعرض سعركِ المخصّص.',
      calloutColor: '#1e40af', calloutBg: '#EFF6FF', calloutBorder: '#93C5FD',
    },
    accepted: {
      emoji: '🎉',
      title: 'تمّ قبول طلبكِ المخصّص!',
      body: `خبر رائع يا <strong>${o.customer}</strong>! قبل فريقنا تصميمكِ المخصّص وحرفيّاتنا متشوّقات لتحقيقه على أرض الواقع.`,
      calloutText: 'ستبدأ حرفيّاتنا <strong>بصناعة قطعتكِ</strong> فورًا. وسنبقيكِ على اطّلاع في كلّ خطوة.',
      calloutColor: '#166534', calloutBg: '#F0FDF4', calloutBorder: '#86EFAC',
    },
    in_production: {
      emoji: '🧵',
      title: 'قطعتكِ قيد التصنيع!',
      body: `خبر مشوّق يا <strong>${o.customer}</strong>! بدأت حرفيّاتنا العمل على قطعتكِ المخصّصة. كلّ غرزة تُصنع بعناية وحبّ.`,
      calloutText: 'قطعتكِ الآن <strong>قيد التصنيع</strong>. سنُعلمكِ بمجرّد جاهزيّتها للشحن.',
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

    ${codeBox(o.code, 'رقم الطلب')}

    ${sectionLabel('تفاصيل الطلب')}
    ${infoTable([
      ['نوع القطعة', o.garmentType],
      ['القياس', o.size],
      ['الألوان', o.colors.join('، ') || '—'],
      ['الولاية', o.wilaya],
      ['الهاتف', o.phone],
    ])}

    ${callout('ℹ️', msg.calloutText, msg.calloutColor, msg.calloutBg, msg.calloutBorder)}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">عندكِ سؤال؟ فقط ردّي على هذه الرسالة — يسعدنا دائمًا مساعدتكِ. 💬</p>
  `;

  const subjectMap: Record<string, string> = {
    in_review: `طلبكِ المخصّص قيد المراجعة — ${o.code} | Maibi`,
    accepted:  `تمّ قبول طلبكِ المخصّص! ${o.code} — Maibi`,
    in_production: `قطعتكِ قيد التصنيع! ${o.code} — Maibi`,
  };

  await send(o.email, subjectMap[o.status] ?? `تحديث طلبكِ المخصّص — ${o.code} | Maibi`, shell(content, `حالة الطلب المخصّص ${o.code}: ${STATUS_LABEL_AR[o.status] ?? o.status}.`));
}

/* ── Customer: custom order shipped ─────────────────────────────────────── */

export async function sendCustomOrderShippedCustomer(o: CustomOrderUpdateMailData): Promise<void> {
  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">📦</div>
      ${heading('قطعتكِ المخصّصة في الطريق إليكِ!')}
      <div style="height:8px"></div>
      ${subtext(`الانتظار يكاد ينتهي يا <strong>${o.customer}</strong>! تمّ تغليف قطعتكِ المصنوعة يدويًا بعناية وهي الآن بين أيدي شركة التوصيل.`)}
    </div>

    <div style="text-align:center;margin-bottom:28px">${statusBadge('shipped')}</div>

    ${codeBox(o.code, 'رقم الطلب')}

    ${sectionLabel('قطعتكِ المخصّصة')}
    ${infoTable([
      ['نوع القطعة', o.garmentType],
      ['القياس', o.size],
      ['الألوان', o.colors.join('، ') || '—'],
      ['الولاية', o.wilaya],
      ['الهاتف', o.phone],
    ])}

    ${callout('🕐', 'الوصول المتوقّع خلال <strong>1 إلى 3 أيام عمل</strong>. يُرجى التأكّد من وجود شخص لاستلام الطرد.', '#1e40af', '#EFF6FF', '#93C5FD')}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">لا نطيق صبرًا لرؤيتكِ ترينها! 🎀</p>
  `;
  await send(o.email, `تمّ شحن قطعتكِ المخصّصة! ${o.code} — Maibi`, shell(content, `تمّ شحن الطلب المخصّص ${o.code} — يصل خلال 1 إلى 3 أيام عمل.`));
}

/* ── Customer: custom order delivered ───────────────────────────────────── */

export async function sendCustomOrderDeliveredCustomer(o: CustomOrderUpdateMailData): Promise<void> {
  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">🌸</div>
      ${heading('وصلت قطعتكِ المخصّصة!')}
      <div style="height:8px"></div>
      ${subtext(`نتمنّى أن تنال إعجابكِ تمامًا يا <strong>${o.customer}</strong>! تمّ توصيل قطعتكِ الفريدة من Maibi — مصنوعة خصّيصًا لكِ على يد حرفيّاتنا.`)}
    </div>

    <div style="text-align:center;margin-bottom:28px">${statusBadge('delivered')}</div>

    ${codeBox(o.code, 'رقم الطلب')}

    ${sectionLabel('قطعتكِ المخصّصة')}
    ${infoTable([
      ['نوع القطعة', o.garmentType],
      ['القياس', o.size],
      ['الألوان', o.colors.join('، ') || '—'],
      ['الولاية', o.wilaya],
    ])}

    ${callout('❤️', 'شكرًا لثقتكِ في حرفيّاتنا بتحقيق رؤيتكِ. <strong>يسعدنا أن نسمع رأيكِ</strong> — فقط ردّي على هذه الرسالة! رأيكِ يعني لنا الكثير.', PINK, PINK_LIGHT, PINK_BORDER)}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">شكرًا لدعمكِ الحرفة الجزائرية. 💕</p>
  `;
  await send(o.email, `وصلت قطعتكِ المخصّصة! ${o.code} — Maibi`, shell(content, `تمّ توصيل الطلب المخصّص ${o.code}. شكرًا لتسوّقكِ من Maibi!`));
}

/* ── Customer: custom order cancelled ───────────────────────────────────── */

export async function sendCustomOrderCancelledCustomer(o: CustomOrderUpdateMailData): Promise<void> {
  const content = `
    <div style="text-align:center;margin-bottom:32px">
      <div style="font-size:44px;margin-bottom:16px">😔</div>
      ${heading('تمّ إلغاء الطلب المخصّص')}
      <div style="height:8px"></div>
      ${subtext(`مرحبًا <strong>${o.customer}</strong>، يؤسفنا إبلاغكِ بأنّه تمّ إلغاء طلبكِ المخصّص <strong>${o.code}</strong>.`)}
    </div>

    <div style="text-align:center;margin-bottom:28px">${statusBadge('cancelled')}</div>

    ${(o.note || o.notes) ? callout('📝', `<strong>السبب:</strong> ${o.note || o.notes}`, '#7f1d1d', '#FEF2F2', '#FECACA') : ''}

    ${sectionLabel('الطلب الملغى')}
    ${infoTable([
      ['الطلب', o.code],
      ['نوع القطعة', o.garmentType],
      ['القياس', o.size],
      ['الألوان', o.colors.join('، ') || '—'],
      ['الولاية', o.wilaya],
    ])}

    ${callout('💬', 'عندكِ أسئلة أو ترغبين في تقديم طلب جديد؟ فقط ردّي على هذه الرسالة أو تواصلي معنا مباشرة — يسعدنا دائمًا مساعدتكِ في إيجاد حلّ.', INK_MID, WARM, WARM_BORDER)}

    <p style="margin:24px 0 0;font-size:13px;color:${INK_SOFT};text-align:center;line-height:1.7">نأمل أن نصنع لكِ شيئًا جميلًا قريبًا. 🌸</p>
  `;
  await send(o.email, `تمّ إلغاء الطلب المخصّص — ${o.code} | Maibi`, shell(content, `تمّ إلغاء طلبكِ المخصّص ${o.code}.`));
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
      ${statusBadge('pending', 'en')}
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
    ${itemsTable(o.items, 'en')}
    ${totalBlock(o.subtotal, o.shippingFee, o.total, 'en')}

    ${o.note ? callout('📝', `<strong>Customer note:</strong> ${o.note}`, INK_MID, WARM, WARM_BORDER) : ''}
  `;
  await send(env.ADMIN_EMAIL, `New order ${o.code} — ${fmtDZD(o.total, 'en')} | Maibi`, shell(content, `New order ${o.code} from ${o.customer} (${o.wilaya}) — ${fmtDZD(o.total, 'en')}.`, 'en'));
}

/* ── Admin: new custom order placed ─────────────────────────────────────── */

export async function sendNewCustomOrderAdmin(o: CustomOrderMailData): Promise<void> {
  const content = `
    <div style="margin-bottom:24px">
      <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${INK_SOFT};margin-bottom:8px">New custom order request</div>
      <div style="font-size:28px;font-weight:800;color:${INK};margin-bottom:10px">${o.code}</div>
      ${statusBadge('new', 'en')}
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
  await send(env.ADMIN_EMAIL, `New custom order ${o.code} — ${o.customer} | Maibi`, shell(content, `New custom order ${o.code} from ${o.customer} (${o.wilaya}).`, 'en'));
}
