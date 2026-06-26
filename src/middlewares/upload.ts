import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

function makeUpload(limits: { fileSize: number; files: number }) {
  return multer({
    storage: multer.memoryStorage(),
    limits,
    fileFilter(_req, file, cb) {
      if (ALLOWED.has(file.mimetype)) cb(null, true);
      else cb(AppError.badRequest('Only JPEG, PNG, or WebP images are allowed'));
    },
  });
}

const productUpload = makeUpload({ fileSize: 5 * 1024 * 1024, files: 10 });
const referenceUpload = makeUpload({ fileSize: 5 * 1024 * 1024, files: 1 });

/** Wraps a multer middleware so errors are forwarded to next() instead of thrown. */
function wrapMulter(
  handler: (req: Request, res: Response, cb: (err?: unknown) => void) => void,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        return next(AppError.badRequest(err.message));
      }
      return next(err);
    });
  };
}

/** Up to 10 product images under the `images` field. */
export const productPhotosUpload = wrapMulter(
  productUpload.array('images', 10),
);

/** A single optional custom-order reference image under `referenceImage`. */
export const referenceImageUpload = wrapMulter(
  referenceUpload.single('referenceImage'),
);
