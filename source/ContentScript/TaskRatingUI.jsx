import React, {useState, useEffect} from 'react';
import './TaskRatingUI.scss';

const TaskRatingUI = ({taskId, taskUrl, onRated}) => {
  const [rating, setRating] = useState(null);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');

  // Fetch GitHub username from local storage
  useEffect(() => {
    const fetchUsername = async () => {
      const result = await browser.storage.local.get('githubUsername');
      if (result.githubUsername) {
        setGithubUsername(result.githubUsername);
      } else {
        setError("GitHub username not found. Please ensure you're logged in.");
      }
    };
    fetchUsername();
  }, []);

  const handleRating = (value) => {
    setRating(value);
    setError(null); // Clear any previous error
  };

  const submitRating = async () => {
    if (!rating) {
      setError('Please select a rating before submitting.');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/tasks/${taskId}/submit_rating/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            github_username: githubUsername,
            rating: parseInt(rating, 10),
          }),
        }
      );

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(
          responseData.error || 'Failed to submit rating. Please try again.'
        );
      }

      setSubmitted(true);
      onRated();
    } catch (err) {
      setError(err.message);
    }
  };

  if (submitted) {
    return <div className="success-message">Thank you for your rating!</div>;
  }

  return (
    <div className="rating-ui-container">
      <h3>Rate This Task</h3>
      <p>Please rate the difficulty of this task:</p>
      <div className="rating-scale">
        {Array.from({length: 10}, (_, i) => i + 1).map((value) => (
          <button
            key={value}
            type="button"
            className={`rating-button ${rating === value ? 'selected' : ''}`}
            onClick={() => handleRating(value)}
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
        disabled={!rating}
      >
        Submit Rating
      </button>
    </div>
  );
};

export default TaskRatingUI;
