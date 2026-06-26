import type { UploadApiResponse } from 'cloudinary';
import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';

export interface UploadResult {
  url: string;
  publicId: string;
}

/** Stream a buffer to Cloudinary and return { url, publicId }. */
export function uploadBuffer(buffer: Buffer, folder = env.CLOUDINARY_FOLDER): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
      (err: Error | undefined, result: UploadApiResponse | undefined) => {
        if (err || !result) return reject(err ?? new Error('Cloudinary upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

/** Upload many buffers in parallel; preserves order. */
export function uploadMany(buffers: Buffer[], folder?: string): Promise<UploadResult[]> {
  return Promise.all(buffers.map((b) => uploadBuffer(b, folder)));
}

/** Best-effort delete by publicId. */
export async function destroyByPublicId(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // non-fatal
  }
}

/** Best-effort delete by secure URL (derives publicId). */
export async function destroyByUrl(url: string): Promise<void> {
  const publicId = publicIdFromUrl(url);
  if (!publicId) return;
  await destroyByPublicId(publicId);
}

function publicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match?.[1] ?? null;
}
