/**
* the list of saved feature flags
*
* @type {Array}
*/
var savedFeatures = [];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action == 'update_features') {
    updateFeatures(request.features);
    sendResponse({update_features: savedFeatures});
  }
  else if (request.action == 'delete_feature') {
    deleteFeature(request.featureName);
    sendResponse({delete_features: 'done'});
  }
});

/**
 * everytime a Chrome page is loaded/refreshed,
 * spread a message containing the page URL to the Feature Flags extension
 */
chrome.tabs.onUpdated.addListener(function(tabId, _changeInfo, tab) {
  var tabURL = tab && tab.url ? tab.url : null;
  var changeInfo = _changeInfo.url;

  // If an URL exists and is not empty
  if(!!tabURL) {
    chrome.runtime.sendMessage({action: 'tab_refresh', tabId: tabURL});
  }
});


// remove a saved feature flag
function deleteFeature(feature) {
  index = savedFeatures.indexOf(feature);

  if (index !== -1) {
    savedFeatures.splice(index, 1);
  }
}

// update the feature flags
function updateFeatures(features) {
  var i;

  for(i = 0; i < features.length; i++) {
    if (savedFeatures.indexOf(features[i]) !== -1) {
      continue;
    }

    savedFeatures.push(features[i]);
  }
}
