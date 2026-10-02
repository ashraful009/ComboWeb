import { Request, Response } from 'express';
import { ReviewService } from '../services/review.service';
import { sendResponse } from '../utils/sendResponse';

const reviewService = new ReviewService();

export const addReview = async (req: Request, res: Response) => {
  try {
    const comboIdStr = req.params.comboId as string;
    const { rating, comment } = req.body;
    const userId = (req as any).user.id; // assuming authenticate middleware sets req.user

    const result = await reviewService.addReview({
      combo_id: parseInt(comboIdStr),
      user_id: userId,
      rating,
      comment
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const comboIdStr = req.params.comboId as string;
    const reviews = await reviewService.getComboReviews(parseInt(comboIdStr));
    sendResponse(res, { message: 'Reviews retrieved successfully', data: reviews });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};