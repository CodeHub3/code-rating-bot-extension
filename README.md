# Rate Code – GitHub Rating Assistant

**Rate Code** is a browser extension that enhances GitHub by allowing users to rate commits and tasks directly within the platform. It is designed for educational and research purposes, making it easier to collect structured feedback on code changes and development tasks.

---

## Features

- Adds a rating interface to GitHub commit and issue pages
- Supports rating individual files in a commit and full tasks
- Detects pending ratings automatically and injects UI
- Submits ratings to a secure backend for analysis
- Works in both Chrome and Firefox (Manifest V3)

---

## Quick Start

Ensure you have

- [Node.js](https://nodejs.org) 10 or later installed
- [Yarn](https://yarnpkg.com) v1 or v2 installed

Then run the following:

- `yarn install` to install dependencies.
- `yarn run dev:chrome` to start the development server for chrome extension
- `yarn run dev:firefox` to start the development server for firefox addon
- `yarn run dev:opera` to start the development server for opera extension
- `yarn run build:chrome` to build chrome extension
- `yarn run build:firefox` to build firefox addon
- `yarn run build:opera` to build opera extension
- `yarn run build` builds and packs extensions all at once to extension/ directory

### Development

- `yarn install` to install dependencies.
- To watch file changes in development

  - Chrome
    - `yarn run dev:chrome`
  - Firefox
    - `yarn run dev:firefox`
  - Opera
    - `yarn run dev:opera`

- **Load extension in browser**

- ### Chrome

  - Go to the browser address bar and type `chrome://extensions`
  - Check the `Developer Mode` button to enable it.
  - Click on the `Load Unpacked Extension…` button.
  - Select your extension’s extracted directory.

- ### Firefox

  - Load the Add-on via `about:debugging` as temporary Add-on.
  - Choose the `manifest.json` file in the extracted directory

- ### Opera

  - Load the extension via `opera:extensions`
  - Check the `Developer Mode` and load as unpacked from extension’s extracted directory.

### Production

- `yarn run build` builds the extension for all the browsers to `extension/BROWSER` directory respectively.

Note: By default the `manifest.json` is set with version `0.0.0`. The webpack loader will update the version in the build with that of the `package.json` version. In order to release a new version, update version in `package.json` and run script.

### Data Usage

The extension stores the GitHub username and user-provided email locally using the browser’s extension storage. No data is transmitted to third parties. Ratings are sent securely to the configured backend for research and analysis purposes only.

## License

MIT © [Nikolin Lotter]
