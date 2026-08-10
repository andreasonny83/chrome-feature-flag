/**
 * Feature Flags - Google Chrome extension
 *
 * @copyright 2026 @andreasonny83
 * @link https://github.com/andreasonny83/chrome-feature-flag
 */
(function(window, undefined) {
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
    document.getElementById('grantAccess')
      .addEventListener('click', requestHostPermission);
    document.getElementById('github')
      .addEventListener('click', gitHubRepo);
    document.getElementById('author')
      .addEventListener('click', gitHubProfile);
    document.getElementById('changelog')
      .addEventListener('click', changelog);
    document.getElementById('license')
      .addEventListener('click', gitHubLicense);
    document.getElementById('footer-github')
      .addEventListener('click', gitHubRepo);
    document.getElementById('footer-email')
      .addEventListener('click', email);

    document.getElementById('version').innerHTML = chrome.runtime.getManifest().version;

    readCookie(function(done) {
      updateFeatureFlags(done);
    });
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
    var url = 'http://andreasonny.mit-license.org/2026';
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

  /**
   * Ensure the extension has host permission for the given tab URL,
   * prompting the user to grant it if it hasn't been granted yet.
   * cookies API access requires an actual host permission grant;
   * activeTab alone does not cover it.
   *
   * @param  {String}   url   The tab URL to request permission for.
   * @param  {Function} cb    Called with (granted: bool).
   */
  // chrome.permissions.request() must be called synchronously inside a
  // real click handler - it cannot be triggered from nested chrome.* API
  // callbacks, even if those callbacks originated from a click. So this
  // only checks for the permission; requesting it happens in
  // requestHostPermission(), wired to the #grantAccess button click.
  var pendingPermissionOrigin = null;

  function getOriginPattern(url) {
    try {
      return new URL(url).origin + '/*';
    } catch (e) {
      return null;
    }
  }

  function hasHostPermission(url, cb) {
    var origin = getOriginPattern(url);

    if (!origin) {
      return cb(false);
    }

    chrome.permissions.contains({origins: [origin]}, cb);
  }

  function showPermissionPrompt(url) {
    pendingPermissionOrigin = getOriginPattern(url);
    document.getElementById('permission-request').style.display = '';
  }

  function hidePermissionPrompt() {
    pendingPermissionOrigin = null;
    document.getElementById('permission-request').style.display = 'none';
  }

  function requestHostPermission(e) {
    e.preventDefault();

    if (!pendingPermissionOrigin) {
      return;
    }

    chrome.permissions.request({origins: [pendingPermissionOrigin]}, function(granted) {
      if (granted) {
        hidePermissionPrompt();
        readCookie(function(done) {
          updateFeatureFlags(done);
        });
      }
    });
  }

  /**
   * Merge the currently active features into the persisted saved features
   * list. The actual chrome.storage.local write happens in eventPage.js
   * (the background service worker), not here - that way the write still
   * completes even if this popup closes (e.g. from a tab reload) right
   * after sending the message.
   *
   * @param  {Array}    activeFeatures  Features currently active in the cookie.
   * @param  {Function} cb              Called with the updated saved features array.
   */
  function updateSavedFeatures(activeFeatures, cb) {
    chrome.runtime.sendMessage({action: 'update_features', features: activeFeatures}, function(response) {
      cb(response.update_features);
    });
  }

  /**
   * Remove a feature from the persisted saved features list.
   *
   * @param  {String}   targetFeature   The feature to forget.
   * @param  {Function} cb              Called with the updated saved features array.
   */
  function deleteSavedFeature(targetFeature, cb) {
    chrome.runtime.sendMessage({action: 'delete_feature', featureName: targetFeature}, function(response) {
      cb(response.delete_features);
    });
  }

  /**
   * @param {Function} cb  Called with a `done` callback once the cookie has
   *                       been read. `cb` must call `done()` once it has
   *                       finished its own (possibly async) work updating
   *                       the UI, so the busy spinner isn't cleared - and
   *                       elements created afterwards left permanently
   *                       hidden by the .busy__hide.busy--set CSS rule -
   *                       before that work actually completes.
   */
  function readCookie(cb) {
    if (busy) {
      return false;
    }

    setBusy(true);

    readCookieInit(function() {
      cb(function() {
        setBusy(false);
        document.querySelector('#feature-name').focus();
      });
    });
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

      hasHostPermission(currentDomain, function(granted) {
        if (!granted) {
          features = '';
          showPermissionPrompt(currentDomain);
          return cb();
        }

        hidePermissionPrompt();

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

    deleteSavedFeature(targetFeature, function() {
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

  /**
   * Sync an already-rendered switch's visual state (checked/unchecked) with
   * whether the feature is currently active. Needed because
   * populateFeaturesList() skips re-creating elements that already exist -
   * without this, a feature deactivated via Reset (or toggled off) keeps
   * showing as "on" in the popup even though it's no longer active.
   *
   * @param {String}  feature  The feature name.
   * @param {Boolean} active   Whether the feature should show as active.
   */
  function syncSwitchState(feature, active) {
    var input = document.getElementById('list-switch-' + feature);
    var mdlSwitch = document.getElementById('switch-' + feature);

    if (!input || !mdlSwitch) {
      return;
    }

    input.checked = active;

    if (active) {
      mdlSwitch.classList.add('is-checked');
    } else {
      mdlSwitch.classList.remove('is-checked');
    }
  }

  function populateFeaturesList(list, saved) {
    saved = saved || false;

    var feature;
    var listContainer = document.getElementById('features-list');

    for (feature in list) {
      // sync the switch state if the feature is already in the list,
      // since it may have flipped between active and saved-only. Checked
      // against the current active `features` array (not the `saved` flag
      // of this pass), since `list` here may be `savedFeatures`, which
      // includes both active and inactive feature names.
      if (document.getElementById('feature-' + list[feature])) {
        syncSwitchState(list[feature], features.indexOf(list[feature]) !== -1);
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

  function updateFeatureFlags(cb) {
    var featureName;
    var listContainer = document.getElementById('features-list');
    var tmpl;
    var listedFeatures;
    var i;

    // display active feature flags on the list
    populateFeaturesList(features);

    updateSavedFeatures(features, function(updatedSavedFeatures) {
      savedFeatures = updatedSavedFeatures;

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

      if (cb) {
        cb();
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
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(arrayOfTabs) {
      var tabId = arrayOfTabs[0].id;

      chrome.scripting.executeScript({
        target: {tabId: tabId},
        func: setCookie,
        args: [featureName, expires]
      }, function() {
        // Persist the updated feature list *before* reloading. Reloading
        // closes the popup immediately (Chrome closes action popups
        // whenever the tab they're anchored to navigates), which can cut
        // off the chrome.storage write mid-flight and randomly drop a
        // saved feature if it happens the other way around.
        readCookie(function(done) {
          updateFeatureFlags(function() {
            done();
            chrome.tabs.reload(tabId);
          });
        });
      });
    });
  }

  function setCookie(featureName, expires) {
    document.cookie = 'features=' + featureName + '; expires=' + expires + '; path=/';
  }
})(window || self);
