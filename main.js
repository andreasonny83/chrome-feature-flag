var features      = null,
    currentDomain = '',
    busy          = false,
    featureID     = 0;

window.onload = function() {
  document.getElementById('cookieForm').addEventListener('submit', addFeatureFlag);
  document.getElementById('resetBtn').addEventListener('click', resetFeatureFlag);
  document.getElementById('github').addEventListener('click', gitHubRepo);
  document.getElementById('profile').addEventListener('click', gitHubProfile);
  
  readCookie(updateFeatureFlags);
};

function gitHubRepo() {
  var url = "https://github.com/andreasonny83/chrome-feature-flag";
  chrome.tabs.create({ url: url });
}

function gitHubProfile() {
  var url = "https://github.com/andreasonny83";
  chrome.tabs.create({ url: url });
}

function readCookie(cb) {
  if (busy) return false;
  
  busy = true;
  readCookieInit(cb);

  setTimeout(function() {
    readCookieInit(cb);
    busy = false;
  }, 1000);
}

function readCookieInit(cb) {
  features = '';

  chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {
    var activeTab = arrayOfTabs[0];
    currentDomain = activeTab && arrayOfTabs[0].url ? arrayOfTabs[0].url : currentDomain;
    
      chrome.cookies.get({
          'url': currentDomain,
          'name': 'features'
        }, function(cookie) {
          features = (cookie && cookie.value) ? cookie.value.split(',') : '';

          var resetIndex = features.indexOf('reset');
          
          if (resetIndex !== -1) {
            features.splice(resetIndex, 1);
          }
    
          return cb();
        });
  });
}

function addFeatureFlag(e) {
  var featureName = document.querySelector('#feature-name').value,
      now = new Date(),
      exHours = 1,
      expires = new Date(now.getTime() + (exHours*60*60*1000)).toUTCString();
  
  e.preventDefault();

  // exit if we are still editing the page cookies
  if (busy) return false;

  // the feature is already active, moving on
  if (features && features !== '' && features.indexOf(featureName) !== -1) {
    return;
  }
  
  featureName = features && features !== '' && features.length > 0 ? features + ',' + featureName : featureName;

  document.querySelector('#feature-name').value = '';
  
  sendCookie(featureName, expires);
}

function updateFeatureFlag() {
  var now = new Date(),
      exHours = 1,
      expires = new Date(now.getTime() + (exHours*60*60*1000)).toUTCString();

  sendCookie(features, expires);
}

function resetFeatureFlag(e) {
  var now = new Date(),
      expires = new Date(now.getTime() + 10000).toUTCString();

  e.preventDefault();

  // exit if we are still editing the page cookies
  if (busy) return false;
  
  sendCookie('reset', expires);
}

function deleteFeature(event) {
  var targetFeature = document.getElementById(event.target.id).getAttribute('data-feature');
  var index = features.indexOf(targetFeature);

  features.splice(index, 1);

  updateFeatureFlag();
}

function updateFeatureFlags() {
  var table, i, y, row, cell1, cell2, featureName;
  
  table = document.getElementById("features-table");
  
  if (features.length > 0) {
    table.innerHTML = '<thead><tr><th>Feature name</th><th>Delete</th></tr></thead><tbody></tbody>';
  } else {
    table.innerHTML = '';
  }

  var tableRef = table.getElementsByTagName('tbody')[0];

  for (y in features) {
    row = tableRef.insertRow();
    cell1 = row.insertCell(0);
    cell2 = row.insertCell(1);
    featureName = 'delete-feature-' + featureID;
  
    cell1.innerHTML = features[y];
    cell2.innerHTML = '<a id="' + featureName +'" data-feature="' + features[y] + '" href="#">delete</a>';
    
    document.getElementById(featureName).addEventListener('click', deleteFeature);
    featureID += 1;
  }
}

/**
 *  sendCookie
 * 
 *  @param {String} featureName   feature flag name
 *  @param {String} expires       cookie expiration time in seconds
 */
function sendCookie(featureName, expires) {
  chrome.tabs.executeScript({
     code: 'document.cookie="features=' + featureName + '; expires=' + expires + '; path=/";'
    }, function() {
      // Reload the page as the cookie has been injected
      chrome.tabs.reload();
      table = document.getElementById("features-table").innerHTML = '';

      // Read the cookies to update the feature flag list
      readCookie(updateFeatureFlags);
    });
}

// chrome.cookies.onChanged.addListener(function(tab) {
//   readCookie(updateFeatureFlags);
// });
