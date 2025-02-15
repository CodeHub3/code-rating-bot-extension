import React from 'react';
import ReactDOM from 'react-dom';
import TaskRatingUI from './TaskRatingUI';
import CommitRatingUI from './CommitRatingUI';

console.log('Content script loaded');

// Extract username from the DOM when the page loads
(() => {
  const metaTag = document.querySelector('meta[name="user-login"]');
  const username = metaTag ? metaTag.content : null;

  if (username) {
    console.log('Extracted username from DOM:', username);
    browser.runtime
      .sendMessage({type: 'SET_USERNAME', username})
      .catch((error) => {
        console.error('Error sending username to background script:', error);
      });
  } else {
    console.warn('GitHub username not found on the page.');
  }
})();

// Notify the background script that a task was rated
const notifyTaskRated = async (url) => {
  await browser.runtime.sendMessage({type: 'REMOVE_PENDING_RATING', url});
  console.log(`Notified background script about rated task: ${url}`);
};

// Helper function to inject Task Rating UI
const injectTaskRatingUI = (taskId, url) => {
  console.log(`Injecting Task Rating UI for task ID: ${taskId}`);
  // Find the DOM element to inject into
  const metadataContainer = document.querySelector(
    '[data-testid="issue-metadata-fixed"]'
  );
  if (
    !metadataContainer ||
    document.getElementById('task-rating-ui-container')
  ) {
    console.warn('Task metadata container not found. UI not injected.');
    return;
  }

  // Create a container for the React component
  const uiContainer = document.createElement('div');
  uiContainer.id = 'task-rating-ui-container';
  metadataContainer.appendChild(uiContainer);

  // Render the React component into the container
  ReactDOM.render(
    <TaskRatingUI
      taskId={taskId}
      taskUrl={url}
      onRated={() => notifyTaskRated(url)}
    />,
    uiContainer
  );
};

// Helper to inject Commit Rating UI
const injectCommitRatingUI = (commitId) => {
  const commitContainer = document.querySelector('.commit.full-commit');

  if (
    !commitContainer ||
    document.getElementById('commit-rating-ui-container')
  ) {
    return;
  }

  const uiContainer = document.createElement('div');
  uiContainer.id = 'commit-rating-ui-container';
  commitContainer.appendChild(uiContainer);

  ReactDOM.render(<CommitRatingUI commitId={commitId} />, uiContainer);
};

// Listen for messages from the background script
browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'INJECT_RATING_UI') {
    const {type, id, url} = message.data;

    if (type === 'task') {
      injectTaskRatingUI(id, url);
    } else if (type === 'commit') {
      injectCommitRatingUI(id, url);
    }
  }
});
