import React, {useEffect, useState} from 'react';
import './CommitRatingSubmitButton.scss';
import {getUsername} from '../utils';

const checkAllFilesRated = (ratings) => {
  return Object.values(ratings).every((rating) => rating !== null);
};

const CommitRatingSubmitButton = ({commitSha, ratings, onRated}) => {
  const [disabled, setDisabled] = useState(true);
  const [feedback, setFeedback] = useState({type: '', message: ''});

  useEffect(() => {
    setDisabled(!checkAllFilesRated(ratings)); // Enable/disable button based on ratings
  }, [ratings]);

  const handleSubmit = async () => {
    setFeedback({type: 'loading', message: 'Submitting ratings...'});

    try {
      const response = await fetch(
        `http://localhost:8000/api/commits/${commitSha}/submit_rating/`,
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
    }
  };

  return (
    <div className="commit-rating-submit-container">
      <button
        // className={`commit-rating-submit-btn ${disabled ? 'disabled' : ''}`} TODO
        className={`commit-rating-submit-btn`}
        type="button"
        onClick={handleSubmit}
        // disabled={disabled}
      >
        Submit All Ratings
      </button>

      {feedback.message && (
        <p className={`submit-feedback ${feedback.type}`}>{feedback.message}</p>
      )}
    </div>
  );
};

export default CommitRatingSubmitButton;
