/**
 * Feature Flags - Google Chrome extension
 *
 * @license MIT - http://andreasonny.mit-license.org/2016
 * @copyright 2016 @andreasonny83
 * @link https://github.com/andreasonny83/chrome-feature-flag
 */
(function(window) {
  'use strict';

  var features = [];
  var savedFeatures = [];
  var currentDomain = '';
  var busy = false;

  window.onload = function() {
    if (!window.PRODUCTION) {
      document.getElementById('development').classList.add('show');
    }

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

  function addFeatureFlag(e, injectFeature) {
    var featureInput = document.querySelector('#feature-name');
    var featureName;
    var now = new Date();
    var exHours = 1;
    var expires = new Date(now.getTime() +
      (exHours * 60 * 60 * 1000)).toUTCString();

    if (injectFeature) {
      featureName = injectFeature;
    } else {
      e.preventDefault();
      featureName = featureInput.value;
    }

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

  /**
   * Completely remove a feature flag
   * remove the cookie information and delete the key from the saved features.
   *
   * @param  {String} targetFeature   The feature to deactivate
   *
   */
  function deleteFeature(targetFeature) {
    var index = features.indexOf(targetFeature);

    if (index !== -1) {
      features.splice(index, 1);
    }

    // remove the saved feature flag
    index = savedFeatures.indexOf(targetFeature);

    if (index !== -1) {
      savedFeatures.splice(index, 1);
    }

    chrome.runtime.sendMessage({action: 'delete_feature', featureName: targetFeature}, function(response) {
      updateFeatureFlag();
    });
  }

  /**
   * Deactivate the feature flag but keep it in the saved features array
   *
   * @param  {String} targetFeature   The feature to deactivate
   *
   */
  function deactivateFeature(targetFeature) {
    var index = features.indexOf(targetFeature);

    if (index === -1) {
      return;
    }

    features.splice(index, 1);

    updateFeatureFlag();
  }

  function toggleFeature(feature) {
    if (!savedFeatures[feature]) {
      savedFeatures.push(feature);
    }

    var switchName = ['switch-', feature].join('');
    var switcClasses = document.getElementById(switchName).classList;
    var isChecked = Array.prototype.indexOf.call(switcClasses, 'is-checked') !== -1;

    if (isChecked) {
      addFeatureFlag(null, feature);
    } else {
      deactivateFeature(feature);
    }
  }


  function toggleAction(feature) {
    setTimeout(function() {
      toggleFeature(feature);
    }, 500);
  }

  function populateFeaturesList(list, saved) {
    saved = saved || false;

    var feature;
    var listContainer = document.getElementById('features-list');

    for (feature in list) {
      // moving on if the feature is already in list
      if (document.getElementById('feature-' + list[feature])) {
        continue;
      }

      var li_element = document.createElement('li');
      var mdl_primary = document.createElement('span');
      var mdl_switch = document.createElement('label');
      var input = document.createElement('input');
      var span = document.createElement('span');
      var textNode = document.createTextNode(list[feature]);
      var mdl_item = document.createElement('span');
      var button = document.createElement('button');
      var italic = document.createElement('i');
      var deleteText = document.createTextNode('delete');

      // Creating the material switch
      span.className = 'mdl-switch__label';
      mdl_switch.id = 'switch-' + list[feature];
      mdl_switch.className = 'mdl-switch mdl-js-switch mdl-js-ripple-effect';
      mdl_switch.setAttribute('for', 'list-switch-' + list[feature]);
      input.setAttribute('type', 'checkbox');
      input.setAttribute('id', 'list-switch-' + list[feature]);
      input.className = 'mdl-switch__input';
      mdl_primary.className = 'mdl-list__item-primary-content';

      if (!saved) {
        input.setAttribute('checked', 'true');
      }

      // Creating the delete button
      italic.className = 'material-icons';
      mdl_item.className = 'mdl-list__item-secondary-action';
      button.className = 'mdl-button mdl-js-button mdl-button--icon';
      button.id = 'delete-' + list[feature];

      // Adding EventListeners avoiding the infamous asynchronous loop problem
      (function(feature) {
        button.addEventListener('click', function() {
          deleteFeature(feature);
        });
        input.addEventListener('click', function() {
          componentHandler.upgradeElement(mdl_switch);
          toggleAction(feature);
        });
      })(list[feature]);

      // Creating a new list element
      li_element.className = 'busy busy__hide busy--set mdl-list__item';
      li_element.id = 'feature-' + list[feature];

      span.appendChild(textNode);
      italic.appendChild(deleteText);
      button.appendChild(italic);
      mdl_item.appendChild(button);
      mdl_switch.appendChild(span);
      mdl_switch.appendChild(input);
      mdl_primary.appendChild(mdl_switch);
      li_element.appendChild(mdl_primary);
      li_element.appendChild(mdl_item);
      listContainer.appendChild(li_element);

      // updating the DOM
      componentHandler.upgradeElement(mdl_switch);
      componentHandler.upgradeElement(mdl_item);
    }
  }

  function updateFeatureFlags() {
    var featureName;
    var listContainer = document.getElementById('features-list');
    var tmpl;
    var listedFeatures;
    var i;

    // display active feature flags on the list
    populateFeaturesList(features);

    chrome.runtime.sendMessage({action: 'update_features', features: features}, function(response) {
      savedFeatures = [];
      savedFeatures = response.update_features;

      populateFeaturesList(savedFeatures, true);

      // remove feature flags from the list
      listedFeatures = listContainer.querySelectorAll('.mdl-list__item');

      for (i = 0; i < listedFeatures.length; i++) {
        featureName = listedFeatures[i].id.split('feature-')[1] || null;

        if (!featureName) {
          continue;
        }

        if (features.indexOf(featureName) === -1 && savedFeatures.indexOf(featureName) === -1) {
          // the feature flag is not present in the cookie any more
          listedFeatures[i].remove();
        }
      }
    });
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
