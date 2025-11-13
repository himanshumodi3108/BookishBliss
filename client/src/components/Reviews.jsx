import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';
import { Card, Button, Textarea, Label, Spinner } from 'flowbite-react';
import apiClient from '../utils/api';
import showToast from '../utils/toast';
import { FaStar } from 'react-icons/fa';

const Reviews = ({ bookId }) => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/reviews/book/${bookId}`);
      setReviews(data.reviews || []);
      setAverageRating(parseFloat(data.averageRating) || 0);
    } catch (error) {
      showToast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast.warning('Please login to submit a review');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post('/reviews', {
        bookId,
        rating,
        comment
      });
      showToast.success('Review submitted successfully!');
      setComment('');
      setRating(5);
      fetchReviews();
    } catch (error) {
      showToast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className='mt-8'>
      <h3 className='text-2xl font-bold mb-4'>Reviews</h3>
      
      {averageRating > 0 && (
        <div className='mb-6 p-4 bg-gray-50 rounded'>
          <div className='flex items-center gap-2'>
            <span className='text-3xl font-bold'>{averageRating.toFixed(1)}</span>
            <div className='flex'>{renderStars(Math.round(averageRating))}</div>
            <span className='text-gray-600'>({reviews.length} reviews)</span>
          </div>
        </div>
      )}

      {user && (
        <Card className='mb-6'>
          <h4 className='font-bold mb-4'>Write a Review</h4>
          <form onSubmit={handleSubmitReview} className='space-y-4'>
            <div>
              <Label>Rating</Label>
              <div className='flex gap-1'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className='text-2xl'
                  >
                    <FaStar
                      className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="comment">Your Review</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share your thoughts about this book..."
              />
            </div>
            
            <Button type="submit" disabled={submitting} className='bg-blue-700'>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <Spinner />
      ) : reviews.length === 0 ? (
        <p className='text-gray-600'>No reviews yet. Be the first to review!</p>
      ) : (
        <div className='space-y-4'>
          {reviews.map((review) => (
            <Card key={review._id}>
              <div className='flex items-start justify-between mb-2'>
                <div>
                  <p className='font-semibold'>{review.userEmail}</p>
                  <div className='flex items-center gap-1 mt-1'>
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p className='text-sm text-gray-500'>
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              {review.comment && (
                <p className='text-gray-700 mt-2'>{review.comment}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;

