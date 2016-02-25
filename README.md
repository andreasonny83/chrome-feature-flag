# Chrome Feature Flags

A Chrome extension for managing websites feature flags

## Usage

This is a Chrome extension for managing with a website hiiden features.

The target website must support this feature flag implementation in order to enable/disable some hidden features.

This plug-in simply set a cookie named `features` with the variables passed in the input box.
The `reset` button removes all the existing featured already stored in the cookie and set the `features` to `reset`.
The client website should ideally recognise this information and clean the `features` cookie whenever its value is set to `reset`.

## License

[MIT License](https://github.com/andreasonny83/chrome-feature-flag/blob/master/LICENSE) © Andrea SonnY

## Changelog
### 0.0.3
* updateFeatureFlags bug fixed<br>
2016.02.20

### 0.0.2
* list all the activated features in a table<br>
2016.02.20

### 0.0.1
* first version<br>
2016.02.19