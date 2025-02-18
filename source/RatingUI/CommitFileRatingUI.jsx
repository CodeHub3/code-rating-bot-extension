import React, {useState, useEffect} from 'react';
import './CommitFileRatingUI.scss';

const CommitFileRatingUI = ({filePath, setRating}) => {
  const [selectedRating, setSelectedRating] = useState(null);

  const handleRatingSelection = (value) => {
    setSelectedRating(value);
    setRating(filePath, value);
  };

  return (
    <div className="commit-file-rating">
      <p>
        Rate changes in <strong>{filePath}</strong>:
      </p>
      <div className="rating-buttons">
        {Array.from({length: 10}, (_, i) => (
          <button
            key={i + 1}
            className={`rating-btn ${
              selectedRating === i + 1 ? 'selected' : ''
            }`}
            type="button"
            onClick={() => handleRatingSelection(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CommitFileRatingUI;
