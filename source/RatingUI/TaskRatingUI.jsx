import React, {useState, useEffect} from 'react';
import browser from 'webextension-polyfill';
import './TaskRatingUI.scss';
import {getUsername} from '../utils';

const TaskRatingUI = ({taskId, onRated}) => {
  const [rating, setRating] = useState(null);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {}, []);

  const handleRating = (value) => {
    setRating(value);
    setError(null); // Clear any previous error
  };

  const submitRating = async () => {
    if (!rating) {
      setError('Please select a rating before submitting.');
      return;
    }
    const githubUsername = await getUsername();
    setIsSubmitting(true);
    setError(null);

    try {
      const success = await browser.runtime.sendMessage({
        type: 'SUBMIT_TASK_RATING',
        taskId,
        githubUsername,
        rating: parseInt(rating, 10),
      });

      if (success) {
        setSubmitted(true);
        onRated();
        setTimeout(() => window.location.reload(), 2000);
      } else {
        throw new Error('Failed to submit rating.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="task-rating-ui">
        <p className="success-message">
          Your rating has been submitted successfully!
        </p>
      </div>
    );
  }

  return (
    <div className="task-rating-ui">
      <h3>Rate This Task</h3>
      <p>
        Review all related commits for this task and assess the overall
        difficulty of completing it. Consider factors such as complexity, scope,
        and required effort before selecting your rating:
      </p>
      <div className="rating-scale">
        {Array.from({length: 7}, (_, i) => i + 1).map((value) => (
          <button
            key={value}
            type="button"
            className={`rating-button ${rating === value ? 'selected' : ''}`}
            onClick={() => handleRating(value)}
            disabled={isSubmitting}
          >
            {value}
          </button>
        ))}
      </div>

      {error && <p className="error-message">{error}</p>}

      <button
        className="submit-button"
        type="button"
        onClick={submitRating}
        disabled={!rating || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
      </button>
    </div>
  );
};

export default TaskRatingUI;
