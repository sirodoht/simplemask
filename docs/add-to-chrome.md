## Add Custom Build to Chrome

![Load dev build](./load-dev-build-chrome.gif)

- Create a local build of MetaMask using your preferred method.
  - You can find build instructions in the [readme](https://github.com/MetaMask/metamask-extension#readme).
- Open `Settings` > `Extensions`.
  - Or go straight to [chrome://extensions](chrome://extensions).
- Check "Developer mode".
- At the top, click `Load Unpacked Extension`.
- Navigate to your `metamask-extension/dist/chrome` folder.
- Click `Select`.

The extension uses English regardless of the browser's language settings.

Your dev build is now added to Chrome, and you can click `Inspect views
background.html` in its card on the extension settings page to view its dev console.
