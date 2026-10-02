import { ReviewRepository, Review } from '../repositories/review.repository';

export class ReviewService {
  private reviewRepository: ReviewRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
  }

  async addReview(reviewData: Review) {
    // Basic validation
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    try {
      // Create the review
      const reviewId = await this.reviewRepository.createReview(reviewData);

      // Recalculate stats
      const stats = await this.reviewRepository.getReviewStatsForCombo(reviewData.combo_id);
      
      // Update combo table with new stats
      await this.reviewRepository.updateComboStats(
        reviewData.combo_id,
        stats.average_rating,
        stats.review_count
      );

      return { success: true, reviewId, stats };
    } catch (error: any) {
      // Handle unique constraint violation (user already reviewed)
      if (error.code === 'SQLITE_CONSTRAINT' || error.code === 'ER_DUP_ENTRY') {
        throw new Error('You have already reviewed this combo.');
      }
      throw error;
    }
  }

  async getComboReviews(comboId: number) {
    return this.reviewRepository.getReviewsByComboId(comboId);
  }
}