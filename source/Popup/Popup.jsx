import React, {useState, useEffect} from 'react';
import browser from 'webextension-polyfill';
import {fetchRepositories} from '../utils';

import './styles.scss';

const openWebPage = (url) => browser.tabs.create({url});

const Popup = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const loadRepositories = async () => {
    try {
      setLoading(true);
      setError(null);
      const repos = await fetchRepositories(); // Use the utility to fetch repositories
      setRepositories(repos);
    } catch (err) {
      setError(err.message); // Set the error message from the utility
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setRepositories([]);
    setError(null);
    loadRepositories();
  };

  const handleRefresh = async () => {
    await fetchRepositories();
    await browser.runtime.sendMessage({type: 'UPDATE_PENDING_RATINGS'});
  };

  useEffect(() => {
    loadRepositories();
    browser.runtime.sendMessage({type: 'UPDATE_PENDING_RATINGS'});
  }, []);

  return (
    <section id="popup">
      <h2>Tracked Repositories & Pending Ratings</h2>

      {loading && <p className="loading">Loading...</p>}
      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button className="retry-button" type="button" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && repositories.length === 0 && (
        <p className="no-repos">
          No tracked repositories available at the moment.
        </p>
      )}

      {!loading && !error && repositories.length > 0 && (
        <ul className="repo-list">
          {repositories.map((repo) => (
            <li key={repo.name} className="repo-item">
              <h3 className="repo-name">{repo.name}</h3>
              {repo.pending_commits.length > 0 ||
              repo.pending_tasks.length > 0 ? (
                <>
                  {repo.pending_commits.map((commit) => (
                    <div key={commit.commit_hash} className="commit-task-item">
                      <p>
                        Pending rating for commit: &#39;{commit.message}&#39;
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
                      <p>Pending rating for task: &#39;{task.title}&#39;</p>
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
      <div className="button-group">
        <button
          className="refresh-button"
          type="button"
          onClick={handleRefresh}
        >
          Refresh
        </button>
        <button
          className="options-button"
          onClick={() => openWebPage('options.html')}
        >
          Options
        </button>
        <button
          className="info-button"
          type="button"
          onClick={() => setShowInfo(!showInfo)}
        >
          Info
        </button>
      </div>

      {showInfo && (
        <div className="info-modal">
          <h3>Extension Information</h3>
          <p>
            This extension helps you track pending commit and task ratings on
            GitHub.
          </p>
          <ul>
            <li>
              Use the refresh button to update your tracked repositories and
              pending ratings.
            </li>
            <li>Options allow you to set your preferences and details.</li>
            <li>
              Injected UIs help you rate tasks and commits directly on GitHub
              pages.
            </li>
          </ul>
          <button type="button" onClick={() => setShowInfo(false)}>
            Close
          </button>
        </div>
      )}
    </section>
  );
};

export default Popup;
