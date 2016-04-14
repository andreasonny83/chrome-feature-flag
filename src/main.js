/**
 * Feature Flags - Google Chrome extension
 *
 * @license MIT - http://andreasonny.mit-license.org/2016
 * @copyright 2016 @andreasonny83
 * @link https://github.com/andreasonny83/chrome-feature-flag
 */
(function(window, undefined) {
  'use strict';

  var features = null;
  var savedFeatures = [
    {}
  ];
  var currentDomain = '';
  var busy = false;

  window.onload = function() {
    document.getElementById('cookieForm')
      .addEventListener('submit', addFeatureFlag);
    document.getElementById('resetBtn')
      .addEventListener('click', resetFeatureFlag);
    document.getElementById('github')
      .addEventListener('click', gitHubRepo);
    document.getElementById('author')
      .addEventListener('click', gitHubProfile);
    document.getElementById('changelog')
      .addEventListener('click', changelog);
    document.getElementById('license')
      .addEventListener('click', gitHubLicense);
    document.getElementById('demo')
      .addEventListener('click', demoSandbox);
    document.getElementById('footer-github')
      .addEventListener('click', gitHubRepo);
    document.getElementById('footer-google')
      .addEventListener('click', googlePlus);
    document.getElementById('footer-email')
      .addEventListener('click', email);

    document.getElementById('version').innerHTML = chrome.app.getDetails().version;

    readCookie(updateFeatureFlags);
  };

  function gitHubRepo() {
    var url = 'https://github.com/andreasonny83/chrome-feature-flag';
    chrome.tabs.create({
      url: url
    });
  }

  function gitHubProfile() {
    var url = 'https://github.com/andreasonny83';
    chrome.tabs.create({
      url: url
    });
  }

  function gitHubLicense() {
    var url = 'http://andreasonny.mit-license.org/2016';
    chrome.tabs.create({
      url: url
    });
  }

  function demoSandbox() {
    var url = 'http://sonnywebdesign.com/feature-flag-demo/';
    chrome.tabs.create({
      url: url
    });
  }

  function changelog() {
    var url = 'https://github.com/andreasonny83/chrome-feature-flag/blob/master/CHANGELOG.md';
    chrome.tabs.create({
      url: url
    });
  }

  function googlePlus() {
    var url = 'https://plus.google.com/u/0/+AndreaSonny';
    chrome.tabs.create({
      url: url
    });
  }

  function email() {
    var url = 'mailto:andreasonny83@gmail.com';
    chrome.tabs.create({
      url: url
    });
  }

  /**
   * Display a spinning weel while fetching the updated cookies.
   *
   * @param {bool} state  The busy state to define.
   */
  function setBusy(state) {
    var busyElements = document.querySelectorAll('.busy');

    busy = state;

    for (var i = 0; i < busyElements.length; i++) {
      if (busy && busyElements[i].className.indexOf('busy--set') < 0) {
        // add a 'busy--set' class to the element
        busyElements[i].classList.add('busy--set');
      }
      else if (!busy && busyElements[i].className.indexOf('busy--set') !== -1) {
        // remove the 'busy--set' class to the element
        busyElements[i].classList.remove('busy--set');
      }
    }
  }

  function readCookie(cb) {
    if (busy) {
      return false;
    }

    setBusy(true);

    readCookieInit(cb);

    setTimeout(function() {
      readCookieInit(cb);
      setBusy(false);
      document.querySelector('#feature-name').focus();
    }, 1000);
  }

  function readCookieInit(cb) {
    var activeTab;
    var resetIndex;
    features = '';

    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(arrayOfTabs) {
      activeTab = arrayOfTabs[0];
      currentDomain = activeTab && arrayOfTabs[0].url ? arrayOfTabs[0].url : currentDomain;

      chrome.cookies.get({
        'url': currentDomain,
        'name': 'features'
      }, function(cookie) {
        features = (cookie && cookie.value) ? cookie.value.split(',') : '';

        resetIndex = features.indexOf('reset');

        if (resetIndex !== -1) {
          features.splice(resetIndex, 1);
        }

        return cb();
      });
    });
  }

  function addFeatureFlag(e) {
    var featureInput = document.querySelector('#feature-name');
    var featureName = featureInput.value;
    var now = new Date();
    var exHours = 1;
    var expires = new Date(now.getTime() +
      (exHours * 60 * 60 * 1000)).toUTCString();

    e.preventDefault();

    // exit if we are still editing the page cookies
    if (busy) {
      return false;
    }

    // the feature is empty or already active, moving on
    if (featureName.length < 1 || features.indexOf(featureName) !== -1 || /\s+/.test(featureName)) {
      return false;
    }

    // Reset the input field
    featureInput.value = '';

    featureName = features && features !== '' && features.length > 0 ? features + ',' + featureName : featureName;

    sendCookie(featureName, expires);
  }

  function updateFeatureFlag() {
    var now = new Date();
    var exHours = 1;
    var expires = new Date(now.getTime() +
      (exHours * 60 * 60 * 1000)).toUTCString();

    sendCookie(features, expires);
  }

  function resetFeatureFlag(e) {
    var now = new Date();
    var expires = new Date(now.getTime() + 10000).toUTCString();

    e.preventDefault();

    // exit if we are still editing the page cookies
    if (busy) {
      return false;
    }

    sendCookie('reset', expires);
  }

  function deleteFeature(event) {
    var targetFeature = document.getElementById(event.target.id) ? document.getElementById(event.target.id).getAttribute('data-feature') : null;

    // if the target element is the icon inside the button,
    // try to find the 'data-feature' in the parent node
    if (!targetFeature && !document.getElementById(event.target.parentNode.id)) {
      // if the parent node doesn't have a 'data-feature' either, do nothing
      return;
    } else {
      targetFeature = document.getElementById(event.target.parentNode.id).getAttribute('data-feature');
    }

    var index = features.indexOf(targetFeature);

    if (index === -1) {
      return;
    }

    features.splice(index, 1);

    updateFeatureFlag();
  }

  function toggleFeature(feature) {
    var el = document.getElementById(feature);

    if (!savedFeatures[feature]) {
      savedFeatures[feature] = {};
    }

    savedFeatures[feature].checked = el.checked;
    savedFeatures[feature].name = feature;
    console.log(savedFeatures);
  }

  function updateFeatureFlags() {
    var feature;
    var featureName;
    var listContainer = document.getElementById('features-list');
    var tmpl;
    var listedFeatures;
    var i;

    // add new feature flags in the list
    for (feature in features) {
      // moving on if the feature is already in list
      if (document.getElementById('feature-' + features[feature])) {
        continue;
      }

      tmpl = document.getElementById('list-element-template').cloneNode(true);
      tmpl.id = 'feature-' + features[feature];
      tmpl.querySelector('.feature__name').innerHTML = features[feature];
      tmpl.querySelector('.switch').id = 'list-switch-' + features[feature];
      // tmpl.querySelector('.switch__label').setAttribute('for', 'list-switch-' + features[feature]);
      tmpl.querySelector('.mdl-button').id = 'delete-' + features[feature];
      tmpl.querySelector('.mdl-button').setAttribute('data-feature', features[feature]);

      tmpl.querySelector('.mdl-button')
        .addEventListener('click', deleteFeature);

      tmpl.querySelector('.switch')
        .addEventListener('click', function() {
          toggleFeature('list-switch-' + features[feature])
        });

      // componentHandler.upgradeDom();
      listContainer.appendChild(tmpl);
    }

    // remove feature flags from the list
    listedFeatures = document.getElementById('features-list').querySelectorAll('.mdl-list__item');

    for (i = 0; i < listedFeatures.length; i++) {
      featureName = listedFeatures[i].id.split('feature-')[1] || null;

      if (!featureName) {
        continue;
      }

      if (features.indexOf(featureName) < 0) {
        // the feature flag is not present in the cookie any more
        listedFeatures[i].remove();
      }
    }

    // add saved feature flags in the list
    // for (feature in savedFeatures) {
    //   console.log(feature);
    //   // moving on if the feature is already in list
    //   if (document.getElementById('feature-' + features[feature])) {
    //     continue;
    //   }
    //
    //   tmpl = document.getElementById('list-element-template').cloneNode(true);
    //   tmpl.id = 'feature-' + feature.name;
    //   tmpl.querySelector('.feature__name').innerHTML = features[feature];
    //   tmpl.querySelector('.switch').id = 'list-switch-' + features[feature];
    //   tmpl.querySelector('.switch__label').setAttribute('for', 'list-switch-' + features[feature]);
    //   tmpl.querySelector('.mdl-button').id = 'delete-' + features[feature];
    //   tmpl.querySelector('.mdl-button').setAttribute('data-feature', features[feature]);
    //
    //   tmpl.querySelector('.mdl-button')
    //     .addEventListener('click', deleteFeature);
    //
    //   tmpl.querySelector('.switch')
    //     .addEventListener('click', function() {
    //       toggleFeature('list-switch-' + features[feature])
    //     });
    //
    //   // componentHandler.upgradeDom();
    //   listContainer.appendChild(tmpl);
    // }
  }

  /**
   *  sendCookie
   *
   *  @param {String} featureName   feature flag name
   *  @param {String} expires       cookie expiration time in seconds
   */
  function sendCookie(featureName, expires) {
    chrome.tabs.executeScript({
      code: 'document.cookie="features=' + featureName +
        '; expires=' + expires + '; path=/";'
    }, function() {
      // Reload the page as the cookie has been injected
      chrome.tabs.reload();

      // Read the cookies to update the feature flag list
      readCookie(updateFeatureFlags);
    });
  }
})(window || self);
