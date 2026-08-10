# Changelog

## 1.1.0 - 2026.08.10
* migrated extension to Manifest V3
* replaced `browser_action` with `action`, background page with a service worker
* replaced `chrome.tabs.executeScript` with `chrome.scripting.executeScript`
* replaced `chrome.app.getDetails()` with `chrome.runtime.getManifest()`
* dropped broad `http://*/*` and `https://*/*` host permissions in favor of `optional_host_permissions`, requested per-site on demand via a new "Enable for this site" prompt (avoids Chrome Web Store extended review)
* moved saved/disabled feature persistence to `chrome.storage.local`, written from the background service worker so it survives popup close and service worker restarts
* fixed the "reset" and "toggle off" actions wiping the entire saved feature list instead of just deactivating a flag
* fixed switch toggle state not visually syncing after Reset or when a feature flips between active/saved-only
* fixed newly-added saved features being permanently hidden by a busy-spinner CSS race
* upgraded build toolchain from Gulp 3 to Gulp 5
* fixed binary asset corruption during build (icons copied and zipped as UTF-8 text)
* fixed invalid `pattern` regex on the feature name input under Chrome's newer `v`-flag regex parsing
* removed dead CDN reference in the demo project (Material Design Lite now bundled locally)
* slimmed the feature list scrollbar to remove excess right-hand padding

## 1.0.0 - 2016.04.25
* feature switches implementation
* theme updated
* development mode
* new icon for development mode
* background script implemented in `manifest.json`
* Gulp task optimize to remove the development mode on build
* Gulp code optimized
* code refactoring

## 0.2.4 - 2016.04.14
* introducing feature switches
* some code optimization

## 0.2.3 - 2016.04.06
* add changelog in footer area
* main.js code refactoring
* features-list styles updated
* extra characters bug fixed in index.html
* spinning weel while fetching new data

## 0.2.2 - 2016.04.03
* gulp task created to automate the deployment process
* documentation updated

## 0.2.1 - 2016.04.02
* new material icon
* screenshots in the Google Chrome market
* footer social buttons

## 0.2.0 - 2016.04.02
* new material design UI
* documentation updated
* demo sandbox inside the extension
* other minor code change

## 0.1.1 - 2016.03.31
* delay before adding features fixed
* demo page for testing the Crome Extension
* code refactoring and other minor improvements

## 0.0.8 - 2016.03.30
* update the features only once the previous task has terminated
* vertical scroll on the features table when the feature are more then 3
* minor code refactoring

## 0.0.7 - 2016.02.25
* the feature table is rendered only if at least one feature is present in the list
* other minor improvements

## 0.0.6 - 2016.02.25
* introducing "Delete feature"

## 0.0.5 - 2016.02.25
* footer implementation

## 0.0.3 - 2016.02.20
* updateFeatureFlags bug fixed

## 0.0.2 - 2016.02.20
* list all the activated features in a table

## 0.0.1 - 2016.02.19
* first version
