import React, {useState} from 'react';
import browser from 'webextension-polyfill';
import './CommitRatingSubmitButton.scss';
import {getUsername} from '../utils';

const CommitRatingSubmitButton = ({commitSha, ratings, onRated}) => {
  const [feedback, setFeedback] = useState({type: '', message: ''});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent multiple clicks
    setIsSubmitting(true);

    setFeedback({type: 'loading', message: 'Submitting ratings...'});

    try {
      const success = await browser.runtime.sendMessage({
        type: 'SUBMIT_COMMIT_RATING',
        commitSha,
        fileRatings: Object.entries(ratings).map(([filePath, rating]) => ({
          file_path: filePath,
          rating,
        })),
        githubUsername: await getUsername(),
      });
      if (success) {
        setFeedback({
          type: 'success',
          message: 'Ratings submitted successfully!',
        });
        onRated();
        setTimeout(() => window.location.reload(), 2000);
      } else {
        throw new Error('Failed to submit ratings.');
      }
    } catch (err) {
      setFeedback({type: 'error', message: err.message});
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
