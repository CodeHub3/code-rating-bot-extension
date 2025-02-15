import React, {useState} from 'react';
import './styles.scss';

const Options = ({updateUserDetails}) => {
  const [email, setEmail] = useState('');
  const [experience, setExperience] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      await updateUserDetails({email, experience, additionalInfo});
      setMessage('Your details were successfully saved!');
    } catch (error) {
      setMessage('Error: Could not save your details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-form">
      <h2>User Profile Settings</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </label>
        <label>
          Coding Experience (in years):
          <input
            type="number"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Enter years of experience"
            min="0"
            max="50"
            required
          />
        </label>
        <label>
          Additional Information:
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Add anything you'd like to share..."
          />
        </label>
        <button className="submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        {message && <p className="info-message">{message}</p>}
      </form>
    </div>
  );
};

export default Options;
