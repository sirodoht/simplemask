import shouldInjectProvider from '../../shared/lib/provider-injection';
import {
  destroyStreams,
  initStreams,
  setupExtensionStreams,
} from './streams/provider-stream';
import {
  isDetectedPhishingSite,
  initPhishingStreams,
} from './streams/phishing-stream';

const start = () => {
  if (isDetectedPhishingSite) {
    initPhishingStreams();
    return;
  }

  if (shouldInjectProvider()) {
    initStreams();

    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        console.warn('BFCached page has become active. Restoring the streams.');
        setupExtensionStreams();
      }
    });

    window.addEventListener('pagehide', (event) => {
      if (event.persisted) {
        console.warn('Page may become BFCached. Destroying the streams.');
        destroyStreams();
      }
    });
  }
};

start();
