// Function to pause media playback on specified tab
// function pauseMedia(tabId) {
//   chrome.scripting.executeScript(
//     {
//       target: { tabId: tabId },
//       func: function () {
//         var media = document.querySelector('video, audio');
//         if (media) {
//           media.pause();
//         }
//       },
//     },
//     () => {
//       if (chrome.runtime.lastError) {
//         console.error(chrome.runtime.lastError.message);
//       }
//     }
//   );
// }
let currentTabId = null;

// Function to pause or resume media playback on specified tab
function controlMedia(tabId, action) {
  if (!tabId) {
    console.error('Invalid tabId provided');
    return;
  }

  const func =
    action === 'pause'
      ? function () {
          var media = document.querySelector('video, audio');
          if (media) media.pause();
        }
      : function () {
          var media = document.querySelector('video, audio');
          if (media) media.play();
        };

  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      func: func,
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      }
    }
  );
}

// Listen for tab changes within the current window
chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
      return;
    }

    if (!tab.url.startsWith('chrome://')) {
      if (currentTabId !== null && currentTabId !== activeInfo.tabId) {
        controlMedia(currentTabId, 'pause');
      }
      controlMedia(activeInfo.tabId, 'play');
      currentTabId = activeInfo.tabId;
    } else {
      console.error('Cannot access chrome:// URLs');
    }
  });
});

// Listen for window focus changes
chrome.windows.onFocusChanged.addListener(function (windowId) {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    if (currentTabId !== null) {
      controlMedia(currentTabId, 'pause');
    }
  } else {
    chrome.tabs.query({ active: true, windowId: windowId }, function (tabs) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }
      if (tabs.length > 0) {
        const tab = tabs[0];
        if (!tab.url.startsWith('chrome://')) {
          if (currentTabId !== tab.id) {
            if (currentTabId !== null) {
              controlMedia(currentTabId, 'pause');
            }
            controlMedia(tab.id, 'play');
          }
          currentTabId = tab.id;
        } else {
          console.error('Cannot access chrome:// URLs');
        }
      }
    });
  }
});
