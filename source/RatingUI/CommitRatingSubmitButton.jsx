import React, {useState} from 'react';
import './CommitRatingSubmitButton.scss';
import {BASE_URL, getUsername} from '../utils';

const CommitRatingSubmitButton = ({commitSha, ratings, onRated}) => {
  const [feedback, setFeedback] = useState({type: '', message: ''});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent multiple clicks
    setIsSubmitting(true);

    setFeedback({type: 'loading', message: 'Submitting ratings...'});

    try {
      const response = await fetch(
        `${BASE_URL}/commits/${commitSha}/submit_rating/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            github_username: await getUsername(),
            file_ratings: Object.entries(ratings).map(([filePath, rating]) => ({
              file_path: filePath,
              rating,
            })),
          }),
        }
      );

      if (!response.ok) {
        setFeedback({
          type: 'error',
          message: `Error submitting ratings. Please try again. ${response.status}`,
        });
        throw new Error('Failed to submit ratings.');
      }

      setFeedback({
        type: 'success',
        message: 'Ratings submitted successfully!',
      });

      onRated();
      setTimeout(() => {
        window.location.reload(); // Refresh after submission
      }, 2000);
    } catch (err) {
      console.error('Error submitting ratings:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="commit-rating-submit-container">
      {feedback.message && (
        <p className={`submit-feedback ${feedback.type}`}>{feedback.message}</p>
      )}
      <button
        className={`commit-rating-submit-btn ${isSubmitting ? 'disabled' : ''}`}
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        Submit All Ratings
      </button>
    </div>
  );
};

export default CommitRatingSubmitButton;
