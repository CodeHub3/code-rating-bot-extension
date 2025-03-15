import React, {useState} from 'react';
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
        Rate the Code Complexity of the added lines in <strong>{filePath}</strong>:
      </p>

      <div className="rating-container">
        <div className="rating-buttons">
          <div className="likert-scale">
            {Array.from({length: 7}, (_, i) => (
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
          <button
            key={0}
            className={`rating-btn no-rating ${
              selectedRating === null ? 'selected' : ''
            }`}
            type="button"
            onClick={() => handleRatingSelection(null)}
          >
            No Rating
          </button>
        </div>
        <div className="complexity-labels">
          <span className="low">Low Complexity</span>
          <span className="high">High Complexity</span>
        </div>
      </div>
    </div>
  );
};

export default CommitFileRatingUI;
