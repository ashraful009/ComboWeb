import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '../../components/Header/Header';
import { fetchComboById } from '../../api/combo.api';
import { fetchComboReviews, submitReview } from '../../api/review.api';
import { useCartStore } from '../../store/cart.store';
import { useAuthStore } from '../../store/auth.store';
import './ComboDetail.css';

export const ComboDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const addItem = useCartStore(state => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' }); // Form state

  const { data: combo, isLoading: isComboLoading } = useQuery({
    queryKey: ['combo', id],
    queryFn: () => id ? fetchComboById(id) : Promise.reject('No ID'),
    enabled: !!id,
  });

  const { data: reviews = [], isLoading: isReviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => id ? fetchComboReviews(id) : Promise.reject('No ID'),
    enabled: !!id,
  });

  const submitReviewMutation = useMutation({
    mutationFn: (newReviewData: { rating: number; comment: string }) => 
      id ? submitReview(id, newReviewData) : Promise.reject('No ID'),
    onSuccess: () => {
      alert('Review submitted successfully!');
      setNewReview({ rating: 5, comment: '' });
      queryClient.invalidateQueries({ queryKey: ['combo', id] });
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to submit review');
    }
  });

  if (isComboLoading || isReviewsLoading) return <div className="container" style={{ padding: '40px' }}>Loading...</div>;
  if (!combo) return <div className="container" style={{ padding: '40px' }}>Combo not found</div>;

  const handleQtyChange = (delta: number) => {
    setQuantity(prev => {
      const newQty = prev + delta;
      if (newQty < 1) return 1;
      if (newQty > maxStock) return maxStock;
      return newQty;
    });
  };

  const handleAddToCart = () => {
    if (combo) {
      const imageUrl = combo.images && combo.images.length > 0 
        ? (combo.images.find((i: any) => i.is_primary)?.image_url || combo.images[0].image_url) 
        : undefined;
      addItem({
        comboId: combo.id,
        comboName: combo.name,
        quantity: quantity,
        basePrice: combo.base_price_paisa,
        finalPrice: combo.final_price_paisa,
        image: imageUrl
      });
      alert('Added to cart!');
    }
  };

  const formatPrice = (paisa: number) => (paisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

  const handleBuyNow = () => {
    if (combo) {
      const imageUrl = combo.images && combo.images.length > 0 
        ? (combo.images.find((i: any) => i.is_primary)?.image_url || combo.images[0].image_url) 
        : undefined;
      addItem({
        comboId: combo.id,
        comboName: combo.name,
        quantity: quantity,
        basePrice: combo.base_price_paisa,
        finalPrice: combo.final_price_paisa,
        image: imageUrl
      });
      navigate('/cart');
    }
  };

  const finalPriceVal = combo.final_price_paisa;
  let basePriceVal = combo.base_price_paisa;
  
  if (basePriceVal <= finalPriceVal) {
    basePriceVal = Math.round(finalPriceVal * 1.15);
  }

  const discountPercent = Math.round(((basePriceVal - finalPriceVal) / basePriceVal) * 100);

  const maxStock = combo.stock_qty || 18;
  const avgRating = Number(combo.average_rating || 0);
  const starsDisplay = '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating));

  return (
    <>
      <Header />
      <div className="container breadcrumbs">
        <Link to="/">Home</Link> &gt; <Link to="/">Combos</Link> &gt; <span>{combo.name}</span>
      </div>

      <div className="container combo-detail-main">
        {/* Left Column: Images */}
        <div className="combo-gallery">
          <div className="main-image" style={{ padding: 0 }}>
            {combo.images && combo.images.length > 0 ? (
              <img src={combo.images.find((i: any) => i.is_primary)?.image_url || combo.images[0].image_url} alt={combo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <span className="placeholder-icon">📦</span>
                <div className="image-overlay-text">PRIMARY IMAGE<br/>(High Quality Bundle Shot)</div>
              </>
            )}
          </div>
          {combo.images && combo.images.length > 1 && (
            <div className="thumbnail-list">
              {combo.images.map((img: any, idx: number) => (
                <div key={idx} className={`thumb ${img.is_primary ? 'active' : ''}`} style={{ padding: 0 }}>
                  <img src={img.image_url} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="combo-info">
          <h1 className="combo-title-large">{combo.name}</h1>
          <div className="combo-meta">
            <span className="star-rating">
              <span className="stars">{starsDisplay}</span>
              <span className="rating-count">({avgRating.toFixed(1)}/5 from {combo.review_count || 0} reviews)</span>
            </span>
            <span className="divider">|</span>
            <span>SKU: {combo.slug}</span>
            <span className="divider">|</span>
            <span className="stock-status">Status: In Stock ({maxStock} packs available)</span>
          </div>

          <div className="price-box" style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '25px' }}>
            <div className="price-row" style={{ color: '#6b7280', textDecoration: 'line-through', marginBottom: '5px' }}>
              <span className="price-label">Regular Price:</span>
              <span className="price-value">BDT {formatPrice(basePriceVal)}</span>
            </div>
            <div className="price-row final-price" style={{ color: 'var(--primary-green)', fontSize: '28px', fontWeight: '800', marginTop: '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span className="price-value">BDT {formatPrice(finalPriceVal)}</span>
                <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '15px', fontWeight: 'bold' }}>
                  {discountPercent}% OFF
                </span>
              </div>
            </div>
          </div>

          <div className="included-items-box">
            <div className="included-header">INCLUDED ITEMS (Pre-built only &bull; Single items not sold)</div>
            <ul className="included-list">
              {combo.items && combo.items.length > 0 ? (
                combo.items.map((item: any, idx: number) => (
                  <li key={idx}>
                    <span className="item-name">{item.name}</span>
                    <span className="item-qty">
                      - {item.quantity} {item.unit_type && item.unit_type !== 'unit' ? item.unit_type : ''}
                    </span>
                  </li>
                ))
              ) : (
                <li style={{ color: 'var(--text-gray)', listStyle: 'none' }}>No items listed for this bundle.</li>
              )}
            </ul>
          </div>

          <div className="action-row">
            <div className="quantity-selector">
              <span className="qty-label">QUANTITY:</span>
              <div className="qty-controls">
                <button onClick={() => handleQtyChange(-1)}>-</button>
                <input type="text" value={quantity} readOnly />
                <button onClick={() => handleQtyChange(1)}>+</button>
              </div>
              <span className="qty-max">(Max: {maxStock})</span>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-add-cart" onClick={handleAddToCart}>ADD BUNDLE TO CART</button>
            <button className="btn-buy-now" onClick={handleBuyNow}>BUY NOW</button>
          </div>

          <div className="delivery-note">
            ℹ️ Delivered in tamper-evident sealed packaging within 24 hours.
          </div>
        </div>
      </div>

      <div className="container description-box">
        <h3>DESCRIPTION & PACK INFO</h3>
        <p>{combo.description}</p>
      </div>

      <div className="container reviews-box">
        <h3>CUSTOMER REVIEWS & RATINGS</h3>
        
        <div className="reviews-grid">
          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="reviewer-name">{review.full_name}</span>
                    <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="review-stars">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  <div className="review-comment">{review.comment}</div>
                </div>
              ))
            ) : (
              <p>No reviews yet. Be the first to review!</p>
            )}
          </div>

          <div className="review-form-container">
            <h4>Write a Review</h4>
            <div className="review-form">
              <div className="form-group">
                <label>Rating:</label>
                <select 
                  value={newReview.rating} 
                  onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                  className="rating-select"
                >
                  <option value="5">★★★★★ (5/5) - Excellent</option>
                  <option value="4">★★★★☆ (4/5) - Very Good</option>
                  <option value="3">★★★☆☆ (3/5) - Average</option>
                  <option value="2">★★☆☆☆ (2/5) - Poor</option>
                  <option value="1">★☆☆☆☆ (1/5) - Terrible</option>
                </select>
              </div>
              <div className="form-group">
                <label>Comment:</label>
                <textarea 
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  placeholder="Share your experience with this combo pack..."
                  rows={4}
                ></textarea>
              </div>
              <button 
                disabled={submitReviewMutation.isPending}
                onClick={() => {
                  if (!token) {
                    alert('Please login to submit a review.');
                    return;
                  }
                  if (!id) return;
                  submitReviewMutation.mutate(newReview);
                }}
              >
                {submitReviewMutation.isPending ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};