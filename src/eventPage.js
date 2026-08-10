var SAVED_FEATURES_KEY = 'savedFeatures';

// Persisting savedFeatures here, rather than directly from the popup,
// decouples the chrome.storage.local write from the popup's lifecycle.
// The popup can close (e.g. because it triggered a tab reload) right
// after sending a message - the write below still runs to completion
// in this service worker regardless.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action == "update_features") {
    updateFeatures(request.features, function(savedFeatures) {
      sendResponse({update_features: savedFeatures});
    });
    return true;
  }
  else if (request.action == "delete_feature") {
    deleteFeature(request.featureName, function(savedFeatures) {
      sendResponse({delete_features: savedFeatures});
    });
    return true;
  }
});

function getSavedFeatures(cb) {
  chrome.storage.local.get([SAVED_FEATURES_KEY], function(result) {
    cb(result[SAVED_FEATURES_KEY] || []);
  });
}

function setSavedFeatures(savedFeatures, cb) {
  var value = {};
  value[SAVED_FEATURES_KEY] = savedFeatures;

  chrome.storage.local.set(value, cb);
}

// remove a saved feature flag
function deleteFeature(feature, cb) {
  getSavedFeatures(function(savedFeatures) {
    var index = savedFeatures.indexOf(feature);

    if (index !== -1) {
      savedFeatures.splice(index, 1);
    }

    setSavedFeatures(savedFeatures, function() {
      cb(savedFeatures);
    });
  });
}

// update the feature flags
function updateFeatures(features, cb) {
  getSavedFeatures(function(savedFeatures) {
    if (!features || features.length === 0) {
      return cb(savedFeatures);
    }

    var i;

    for (i = 0; i < features.length; i++) {
      if (savedFeatures.indexOf(features[i]) !== -1) {
        continue;
      }

      savedFeatures.push(features[i]);
    }

    setSavedFeatures(savedFeatures, function() {
      cb(savedFeatures);
    });
  });
}
