import 'emoji-log';
import browser from 'webextension-polyfill';

let pendingRatings = [];

browser.runtime.onInstalled.addListener(() => {
  console.emoji('🦄', 'extension installed');
});

// Helper to fetch pending ratings from the backend
const fetchPendingRatings = async () => {
  try {
    const {githubUsername} = await browser.storage.local.get('githubUsername');
    if (!githubUsername) {
      console.warn('GitHub username not found in storage.');
      return;
    }

    const response = await fetch(
      `http://localhost:8000/api/users/${githubUsername}/pending_ratings`
    );

    if (!response.ok) {
      console.error('Failed to fetch pending ratings:', response.statusText);
      return;
    }

    const data = await response.json();
    pendingRatings = [
      ...data.pending_commits.map((commit) => ({
        id: commit.commit_hash,
        type: 'commit',
        url: commit.url,
      })),
      ...data.pending_tasks.map((task) => ({
        id: task.number,
        type: 'task',
        url: task.url,
      })),
    ];

    console.log('Updated pending ratings:', pendingRatings);
  } catch (error) {
    console.error('Error fetching pending ratings:', error.message);
  }
};

// Check if the current page matches a pending task or commit
const checkPendingRatings = (url) => {
  const matchedRating = pendingRatings.find((rating) => rating.url === url);
  return matchedRating || null;
};

// Remove a rated task or commit
const removeFromPendingRatings = (url) => {
  pendingRatings = pendingRatings.filter((rating) => rating.url !== url);
  console.log(`Removed rated item from pending ratings: ${url}`);
};

// Monitor tab updates and URL changes
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (
    changeInfo.status === 'complete' &&
    tab.url &&
    tab.url.includes('github.com')
  ) {
    console.log(`GitHub tab detected: ${tab.url}`);
    const matchedRating = checkPendingRatings(tab.url);
    if (matchedRating) {
      console.log(
        `Injecting UI for ${matchedRating.type} with ID: ${matchedRating.id}`
      );
      browser.tabs
        .sendMessage(tabId, {
          type: 'INJECT_RATING_UI',
          data: matchedRating,
        })
        .catch((error) => {
          console.warn('Failed to send message to content script:', error);
        });
    }
  }
});

// Listen for messages from popup or content script
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'UPDATE_PENDING_RATINGS') {
    await fetchPendingRatings();
    sendResponse({success: true});
  } else if (message.type === 'REMOVE_PENDING_RATING') {
    removeFromPendingRatings(message.url);
    sendResponse({success: true});
  } else if (message.type === 'SET_USERNAME' && message.username) {
    // Store the username in local storage
    browser.storage.local.set({githubUsername: message.username});
    sendResponse({success: true});
  } else if (message.type === 'GET_USERNAME') {
    // Retrieve the username from local storage
    const result = await browser.storage.local.get('githubUsername');
    if (result.githubUsername) {
      sendResponse({success: true, username: result.githubUsername});
    } else {
      sendResponse({success: false, error: 'No username found.'});
    }
  }
  return true; // Indicate async response
});

fetchPendingRatings();

// Fetch ratings when GitHub pages are loaded or refreshed
browser.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await browser.tabs.get(activeInfo.tabId);
  if (tab.url && tab.url.includes('github.com')) {
    console.log('Tab activated on GitHub, refreshing pending ratings...');
    await fetchPendingRatings();
  }
});
