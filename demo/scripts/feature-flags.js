/**
 * Copyright 2016 andreasonny83. All Rights Reserved.
 *
 * Licensed under the MIT License
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://andreasonny.mit-license.org/
 *
 */
var featureFlags = (function(document, undefined) {
  'use strict';

  var reg = new RegExp('(?:(?:^|.*;\\s*)features\\s*\\=\\s*([^;]*).*$)|^.*$');
  var module = {};
  var features = null;

  function resetFeatures() {
    features = [];
    document.cookie = 'features=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    deactivateFeatures();
  }

  function deactivateFeatures() {
    var matches;
    var index;
    var el;

    matches = document.querySelectorAll(
      '.feature-flag'
    );

    for (index = 0; index < matches.length; index++) {
      el = matches[index];

      el.classList.remove('feature-flag--active');
    }

    return activateFeatures();
  }

  function activateFeatures() {
    var matches;
    var el;
    var i;
    var index;

    // exit if there are no feature flags in the cookies
    if (!features || !features.length) {
      return;
    }

    for (i = 0; i < features.length; ++i) {
      // If a reset flag is found in the cookie,
      // reset all the feature flags
      if (features[i] === 'reset') {
        return resetFeatures();
      }

      // find all the elements in the page matching the selected feature flag
      matches = document.querySelectorAll(
        '.feature-flag.feature-flag--' + features[i]
      );

      for (index = 0; index < matches.length; index++) {
        el = matches[index];

        // exit if there are no features to activate
        if (!el || /feature-flag--active/.test(el.getAttribute('class'))) {
          continue;
        }

        // activate the element
        el.classList.add('feature-flag--active');
      }
    }
  }

  function get() {
    var myCookie = document.cookie.replace(reg, '$1');

    features = myCookie ? myCookie.split(',') : null;

    return features;
  }

  function init() {
    get();
    activateFeatures();
  }

  return {
    init: init,
    update: init
  };
}(document));
