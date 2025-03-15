import React from 'react';
import ReactDOM from 'react-dom';
import TaskRatingUI from '../RatingUI/TaskRatingUI';
import '../RatingUI/TaskRatingUI.scss';
import '../RatingUI/CommitFileRatingUI.scss';
import CommitRatingSubmitButton from '../RatingUI/CommitRatingSubmitButton';
import CommitFileRatingUI from '../RatingUI/CommitFileRatingUI';

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
    <TaskRatingUI taskId={taskId} onRated={() => notifyTaskRated(url)} />,
    uiContainer
  );
};

// Extract changed files from GitHub commit page
const extractChangedFiles = () => {
  console.log('Extracting changed files...');

  const fileHeaders = document.querySelectorAll(
    '.DiffFileHeader-module__diff-file-header--TjXyn'
  );
  return Array.from(fileHeaders)
    .map((header) => {
      const fileLink = header.querySelector('h3 a');
      if (!fileLink) return null;

      return {
        filePath: fileLink.innerText.trim(), // Extract the file path
        fileElement: header, // This is where we insert the rating UI
      };
    })
    .filter(Boolean);
};

// Notify background script that a commit was rated
const notifyCommitRated = async (url) => {
  await browser.runtime.sendMessage({type: 'REMOVE_PENDING_RATING', url});
  console.log(`Notified background script about rated commit: ${url}`);
};

const injectCommitRatingSubmitButton = (commitSha, url, ratings) => {
  if (document.getElementById('floating-submit-button')) return; // Prevent duplicates

  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'floating-submit-button';
  document.body.appendChild(buttonContainer);

  ReactDOM.render(
    <CommitRatingSubmitButton
      commitSha={commitSha}
      ratings={ratings}
      onRated={() => notifyCommitRated(url)}
    />,
    buttonContainer
  );
};

const injectCommitRatingUI = (commitSha, url) => {
  console.log('Injecting commit rating UI...');

  // Prevent duplicate UI injection
  if (document.getElementById('commit-rating-ui-container')) return;

  const changedFiles = extractChangedFiles();
  if (!changedFiles.length) return;

  // Initialize ratings state
  const ratings = {};

  changedFiles.forEach(({filePath, fileElement}) => {
    if (!fileElement || fileElement.querySelector('.commit-file-rating-ui'))
      return;

    // Store ratings for validation
    ratings[filePath] = null;

    // Create a container for the rating UI
    const uiContainer = document.createElement('div');
    uiContainer.className = 'commit-file-rating-ui';
    fileElement.appendChild(uiContainer);

    ReactDOM.render(
      <CommitFileRatingUI
        filePath={filePath}
        setRating={(file, rating) => {
          ratings[file] = rating;
        }}
      />,
      uiContainer
    );
  });

  // Inject floating submit button separately
  injectCommitRatingSubmitButton(commitSha, url, ratings);
  console.log(`Injection complete for ${changedFiles.length} file(s)`);
};

const injectCommitRatingInstruction = () => {
  console.log('Injecting rating instruction...');

  const diffContainer = document.querySelector('#diff-content-parent');
  if (!diffContainer) {
    console.warn(
      'Could not find diff container. Instruction message not injected.'
    );
    return;
  }

  // Prevent duplicate message injection
  if (document.getElementById('rating-instruction')) return;

  // Create message element
  const instructionElement = document.createElement('div');
  instructionElement.id = 'rating-instruction';
  instructionElement.className = 'rating-instruction-box';
  instructionElement.innerText =
    'Rate the code complexity of the added lines for each file based on how difficult they are to read, ' +
    'understand, and maintain.\n' +
    'Consider factors such as readability, logic flow, modularity, naming conventions, error handling, and maintainability.' +
    '\nFor files which do not contain any code (e.g comments) you can leave the rating at "No Rating".';

  // Insert before all file diffs
  diffContainer.prepend(instructionElement);
};

// Listen for messages from the background script
browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'INJECT_RATING_UI') {
    const {type, id, url} = message.data;

    if (type === 'task') {
      injectTaskRatingUI(id, url);
    } else if (type === 'commit') {
      injectCommitRatingInstruction();
      setTimeout(() => {
        injectCommitRatingUI(id, url);
      }, 500);
    }
  }
});
