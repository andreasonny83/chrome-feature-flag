var savedFeatures = [];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action == "update_features") {
    updateFeatures(request.features);
    sendResponse({update_features: savedFeatures});
  }
  else if (request.action == "delete_feature") {
    deleteFeature(request.featureName);
    sendResponse({delete_features: 'done'});
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
