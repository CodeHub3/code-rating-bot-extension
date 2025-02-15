import React, {useState} from 'react';
import './CommitRatingUI.scss';

const CommitRatingUI = ({commitId}) => {
  const [rating, setRating] = useState(null);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      setError('Please select a rating before submitting.');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/commits/${commitId}/submit_rating/`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({rating}),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit rating.');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (submitted) {
    return <div className="success-message">Thank you for your rating!</div>;
  }

  return (
    <div className="rating-ui-container">
      <h3>Rate This Commit</h3>
      <p>Please rate the quality of this commit:</p>
      <div className="rating-scale">
        {Array.from({length: 10}, (_, i) => i + 1).map((value) => (
          <button
            key={value}
            type="button"
            className={`rating-button ${rating === value ? 'selected' : ''}`}
            onClick={() => setRating(value)}
          >
            {value}
          </button>
        ))}
      </div>
      {error && <div className="error-message">{error}</div>}
      <button type="button" className="submit-button" onClick={handleSubmit}>
        Submit Rating
      </button>
    </div>
  );
};

export default CommitRatingUI;
