import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import cloudinary from '../config/cloudinary';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { AppError } from '../utils/appError';

const router = Router();

router.post('/', authenticate, upload.single('image'), catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('No image file provided', 400, 'NO_FILE');
  }

  // Upload to Cloudinary using upload_stream
  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'combo_packs' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(req.file!.buffer);
  });

  sendResponse(res, {
    message: 'Image uploaded successfully',
    data: { url: (uploadResult as any).secure_url },
  });
}));

export { router as uploadRouter };
