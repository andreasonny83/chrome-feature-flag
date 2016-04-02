# Chrome Feature Flags

A Chrome extension for managing websites feature flags

Demo website available at: [sonnywebdesign.com/feature-flag-demo](http://sonnywebdesign.com/feature-flag-demo).

![Feature flag hero](https://raw.githubusercontent.com/andreasonny83/chrome-feature-flag/master/doc/featureflag-hero.0.2.0.jpg)

## Usage

This is a Chrome extension for managing with a website hidden features.

The target website must support this feature flag implementation in order to enable/disable some hidden features.

This plug-in simply set a cookie named `features` with the variables passed in the input box.
The `reset` button removes all the existing featured already stored in the cookie and set the `features` to `reset`.
The client website should ideally recognize this information and clean the `features` cookie whenever its value is set to `reset`.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :sunglasses:

## License

[MIT License](https://github.com/andreasonny83/chrome-feature-flag/blob/master/LICENSE) © Andrea SonnY
