import browser from 'webextension-polyfill';

export const BASE_URL = 'https://codax.ifi.uzh.ch/api';

const MESSAGES = {
  NO_USERNAME:
    'Could not fetch your GitHub username. Please ensure you have a logged-in GitHub tab open and refresh the page.',
  FETCH_REPOS_FAIL: 'Failed to fetch repositories. Please try again.',
  NO_REPOS_FOUND:
    'No active tracked repositories found. You may not have made a commit to any tracked repository, or you are not part of any tracked repository. Contact your instructor or admin if needed.',
  USER_NOT_REGISTERED:
    'You are not registered in the system. You may not have made a commit to any tracked repository, or you are not part of any tracked repository. Contact your instructor or admin if needed.',
};

// Helper to get the GitHub username
export const getUsername = async () => {
  const {githubUsername} = await browser.storage.local.get('githubUsername');
  if (!githubUsername) {
    throw new Error(MESSAGES.NO_USERNAME);
  }
  return githubUsername;
};

// Fetch repositories from the backend
export const fetchRepositories = async () => {
  try {
    const username = await getUsername();
    const response = await fetch(
      `${BASE_URL}/users/${username}/repos/?rating_active=true`,
      {
        method: 'GET',
      }
    );

    if (response.status === 404) {
      throw new Error(MESSAGES.USER_NOT_REGISTERED);
    }

    if (!response.ok) {
      throw new Error(MESSAGES.FETCH_REPOS_FAIL);
    }

    const data = await response.json();
    if (!data.repositories || data.repositories.length === 0) {
      throw new Error(MESSAGES.NO_REPOS_FOUND);
    }

    return data.repositories;
  } catch (error) {
    console.error('Error fetching repositories:', error.message);
    throw error;
  }
};

export const sendMessageToContentScript = async (
  tabId,
  message,
  retryCount = 5
) => {
  try {
    await browser.tabs.sendMessage(tabId, message);
    console.log('Message sent to content script:', message);
  } catch (error) {
    if (retryCount > 0) {
      console.warn('Content script not ready. Retrying...', error);
      setTimeout(
        () => sendMessageToContentScript(tabId, message, retryCount - 1),
        1000
      );
    } else {
      console.error(
        'Failed to send message to content script after retries:',
        error
      );
    }
  }
};
