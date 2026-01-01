import React, { useState } from 'react';

interface ReviewModalProps {
  productId: string;
  productName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ productId, productName, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      onClose();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-background-light dark:bg-background-dark rounded-t-3xl md:rounded-3xl w-full max-w-lg">
        <div className="sticky top-0 bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark p-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-text-main dark:text-white">Write a Review</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Name */}
          <div>
            <p className="text-sm text-text-subtle mb-1">Reviewing</p>
            <p className="font-bold text-text-main dark:text-white">{productName}</p>
          </div>

          {/* Rating Stars */}
          <div>
            <p className="text-sm font-medium text-text-main dark:text-white mb-2">Your Rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <span 
                    className={`material-symbols-outlined text-4xl ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                    style={{ fontVariationSettings: star <= (hoveredRating || rating) ? '"FILL" 1' : '"FILL" 0' }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-text-subtle mt-2">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block">
              <span className="text-sm font-medium text-text-main dark:text-white mb-2 block">
                Your Review (Optional)
              </span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                maxLength={500}
                className="w-full rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4 focus:ring-2 focus:ring-primary focus:border-primary dark:text-white resize-none"
              />
              <p className="text-xs text-text-subtle mt-1">{comment.length}/500 characters</p>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border border-border-light dark:border-border-dark text-text-main dark:text-white font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 h-12 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">send</span>
                  Submit Review
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
