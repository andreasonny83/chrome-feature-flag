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

## Developing

This project uses Npm and Gulp for generating a distribution package.

Prepare your environment cloning this repository on your local machine, then open a terminal pointing to your project root directory and install all the dependencies with:

    npm install

Now you can start developing your `Chrome Feature Flags` editng the source files inside the `src` folder.
Once done, run:

    gulp

This will create a distribution `dist` folder inside your project root directory. Gulp will also create a zipped distribution file inside your `dist` folder to use inside the Chrome web store if you need to deploy the extension to the global market.

You can use this generated `dist` directly inside your Google Chrome.
Just open Chrome, click on Settings, then go to the Extensions tab and tick the `developer mode` checkbox. Now you can simply drag your `dist` folder inside to add your extension to Chrome.


## Developing with Chrome Dev Editor

We recommend to use Chrome Dev Editor while you're in development mode.

1. Install [Chrome Dev Editor](https://chrome.google.com/webstore/detail/chrome-dev-editor/pnoffddplpippgcfjdhbmhkofpnaalpg) on your machine.
2. Open your local copy of `Chrome Feature Flags`, navigate inside the `src` folder and start writing new code.
3. Once done, just click the `Run` button to see your Chrome extension appearing on your Google Chrome browser.
4. When you're happy with that, run the `gulp` command in your terminal to release a new distribution version.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :sunglasses:

## Changelog

Changelog available [here](https://github.com/andreasonny83/chrome-feature-flag/blob/master/CHANGELOG.md)

## License

[MIT License](https://github.com/andreasonny83/chrome-feature-flag/blob/master/LICENSE) © Andrea SonnY
