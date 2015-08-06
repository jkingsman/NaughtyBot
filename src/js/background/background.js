var tabData = {},
  requestDomain;

// get the entry count and display it, and store the list
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  requestDomain = request.domain; // get into single var to use in JSON
  if (request.type === 'site-check') {
    // we're checking if we have a site already stored
    chrome.tabs.sendMessage(sender.tab.id, {
      type: 'site-check-response',
      hasSite: tabData.hasOwnProperty(requestDomain)
    });

  } else if (request.type === 'site-data-add') {
    tabData.requestDomain = [];
    /** adding a site we've never seen
     * since we have pretty standard data, we can be
     * lazy about type checking and just use toString()
     * to check array identical-ish-ness
     */
    if (request.paths.toString() !== ['/'].toString()) {
      /**
       * if they block the whole site and/or we have an
       * artifact from a "Disallow: ", which will get cast
       * to "/" by our leading-slash-adding code in the content script,
       * so we only want to add things that aren't the entire blocked site ("/")
       */
      for (var i = 0; i < request.paths.length; i++) {
        tabData.requestDomain.push({
          id: i,
          url: request.paths[i],
          code: 'unknown'
        });
      }
    }

    sendResponse(); // trigger callbacks once we're done

  } else if (request.type === 'set-badge') {
    // set the badge
    if (tabData.requestDomain.length > 0) {
      chrome.browserAction.setBadgeText({
        text: String(tabData.requestDomain.length),
        tabId: sender.tab.id
      });
    }

  } else if (request.type === 'get-data') {
    // get and reply with the data for the current tab
    sendResponse({
      type: 'provide-data',
      count: tabData.requestDomain.length,
      data: tabData.requestDomain
    });
  } else if (request.type === 'query-endpoint') {
    // get and reply with the data for the current tab
    if (request.id == -1) {
      // we're supposed to query all
      for (var endpoint in tabData.requestDomain) {
        checkEndpoint(requestDomain, endpoint);
      }
    } else {
      checkEndpoint(requestDomain, request.id);
    }
  }
});

function checkEndpoint(requestDomain, requestID) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', requestDomain + tabData.requestDomain[requestID].url, true);

  xhr._requestDomain = requestDomain;
  xhr._id = requestID;

  xhr.onload = function(e) {
    var requestDomain = this._requestDomain; // create local copy
    var requestID = this._id; // create local copy
    if (xhr.readyState === 4) {
      tabData.requestDomain[requestID].code = xhr.status;
    }
  };

  xhr.send(null);
}
