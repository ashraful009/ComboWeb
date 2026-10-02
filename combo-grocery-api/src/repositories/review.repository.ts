import { db } from '../config/db';

export interface Review {
  id?: number;
  combo_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  is_approved?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class ReviewRepository {
  async createReview(review: Review) {
    const [id] = await db('reviews').insert(review);
    return id;
  }

  async getReviewsByComboId(comboId: number) {
    return db('reviews')
      .join('users', 'reviews.user_id', 'users.id')
      .where('combo_id', comboId)
      .andWhere('is_approved', true)
      .select(
        'reviews.id',
        'reviews.rating',
        'reviews.comment',
        'reviews.created_at',
        db.raw("CONCAT(users.first_name, ' ', users.last_name) as full_name")
      )
      .orderBy('reviews.created_at', 'desc');
  }

  async getReviewStatsForCombo(comboId: number) {
    const result = await db('reviews')
      .where('combo_id', comboId)
      .andWhere('is_approved', true)
      .sum('rating as total_rating')
      .count('id as review_count')
      .first();

    const reviewCount = parseInt(result?.review_count?.toString() || '0');
    const totalRating = parseFloat(result?.total_rating?.toString() || '0');
    
    return {
      average_rating: reviewCount > 0 ? (totalRating / reviewCount) : 0,
      review_count: reviewCount
    };
  }

  async updateComboStats(comboId: number, averageRating: number, reviewCount: number) {
    await db('combos')
      .where('id', comboId)
      .update({
        average_rating: averageRating,
        review_count: reviewCount
      });
  }
}