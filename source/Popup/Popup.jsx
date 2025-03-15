import React, {useState, useEffect, useCallback} from 'react';
import browser from 'webextension-polyfill';
import {fetchRepositories, getUsername, BASE_URL} from '../utils';
import './styles.scss';

const Popup = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [username, setUsername] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);

  // Fetch user's GitHub username & stored email
  const fetchUserDetails = useCallback(async () => {
    try {
      const user = await getUsername();
      if (!user) {
        setError('Failed to retrieve username.');
        return;
      }

      setUsername(user);

      const response = await fetch(`${BASE_URL}/public/users/${user}/`);
      if (!response.ok) throw new Error('Failed to fetch user details.');

      const userData = await response.json();
      if (userData.exists) {
        if (userData.email) {
          setEmail(userData.email);
          setEmailStatus('verified');
        } else {
          setEmailStatus('missing');
        }
      } else {
        setError('User does not exist in the system.');
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Error fetching user details.');
    }
  }, []);

  // Fetch repositories
  const loadRepositories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const repos = await fetchRepositories();
      setRepositories(repos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch repositories & user details when the popup loads
  useEffect(() => {
    const fetchData = async () => {
      await fetchUserDetails();
      await loadRepositories();
    };
    fetchData();
  }, [fetchUserDetails, loadRepositories]);

  // Handle email submission
  const handleEmailSubmit = useCallback(async () => {
    if (!newEmail.includes('@') || !newEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${BASE_URL}/public/users/${username}/update-email/`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email: newEmail}),
        }
      );

      if (!response.ok) throw new Error('Failed to update email.');

      setEmail(newEmail);
      setEmailStatus('verified');
      setNewEmail('');
      setSuccessMessage(true);

      // Show success message for 2 seconds, then return to normal view
      setTimeout(() => {
        setSuccessMessage(false);
        setIsSubmitting(false);
        setUpdatingEmail(false);
      }, 2000);
    } catch (err) {
      console.error('Error updating email:', err);
      setError('Failed to update email.');
      setIsSubmitting(false);
    }
  }, [newEmail, username]);

  return (
    <section id="popup">
      <h2>Tracked Repositories & Pending Ratings</h2>

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="success-message">
          <p>Email updated successfully!</p>
        </div>
      )}

      <div className="content-container">
        {/* Email Entry (Only shown if missing OR being updated) */}
        {(emailStatus === 'missing' || updatingEmail) && !successMessage && (
          <div className="email-container">
            <p>
              {updatingEmail
                ? 'Update your email:'
                : 'Please enter your email to continue:'}
            </p>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder={email || 'Enter your email'}
              className="email-input"
            />
            <div className="email-buttons">
              <button
                onClick={handleEmailSubmit}
                type="button"
                className="email-submit-button"
                disabled={
                  !newEmail.trim() ||
                  !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(newEmail) ||
                  isSubmitting
                }
              >
                Save Email
              </button>
              {updatingEmail && (
                <button
                  type="button"
                  className="back-button"
                  onClick={() => setUpdatingEmail(false)}
                >
                  Back
                </button>
              )}
            </div>
          </div>
        )}

        {loading && <p className="loading">Loading repositories...</p>}

        {!loading && !error && repositories.length === 0 && (
          <p className="no-repos">
            No tracked repositories available at the moment.
          </p>
        )}

        {/* Repo List (Only shown when email is verified) */}
        {!loading &&
          emailStatus !== 'missing' &&
          !error &&
          !isSubmitting &&
          !updatingEmail &&
          repositories.length > 0 && (
            <ul className="repo-list">
              {repositories.map((repo) => (
                <li key={repo.name} className="repo-item">
                  <h3 className="repo-name">{repo.name}</h3>
                  {repo.pending_commits.length > 0 ||
                  repo.pending_tasks.length > 0 ? (
                    <>
                      {repo.pending_commits.map((commit) => (
                        <div
                          key={commit.commit_hash}
                          className="commit-task-item"
                        >
                          <p>
                            Pending rating for commit: &#34;
                            {commit.message.split('\n')[0]}&#34;
                          </p>
                          <a
                            href={commit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="commit-link"
                          >
                            View Commit
                          </a>
                        </div>
                      ))}
                      {repo.pending_tasks.map((task) => (
                        <div key={task.github_id} className="commit-task-item">
                          <p>Pending rating for task: &#34;{task.title}&#34;</p>
                          <a
                            href={task.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="task-link"
                          >
                            View Task
                          </a>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="no-pending-ratings">No pending ratings.</p>
                  )}
                </li>
              ))}
            </ul>
          )}
      </div>

      {!updatingEmail && !isSubmitting && emailStatus !== 'missing' && (
        <div className="button-group">
          <button
            className="refresh-button"
            type="button"
            onClick={loadRepositories}
          >
            Refresh
          </button>
          <button
            className="email-update-button"
            type="button"
            onClick={() => setUpdatingEmail(true)}
          >
            Change Email
          </button>
        </div>
      )}
    </section>
  );
};

export default Popup;
