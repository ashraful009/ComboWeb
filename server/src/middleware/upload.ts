import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

let storage: multer.StorageEngine;

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'freshagro',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    } as Record<string, unknown>,
  });
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, '../../../uploads'));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const randomName = crypto.randomBytes(16).toString('hex');
      cb(null, `${randomName}${ext}`);
    },
  });
}

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('INVALID_FILE_TYPE', 400, 'Only JPG, PNG and WebP images are allowed'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});
