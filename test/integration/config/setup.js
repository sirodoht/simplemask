// Polyfill setImmediate which jsdom removes but tsx/cjs needs
globalThis.setImmediate =
  globalThis.setImmediate || ((fn, ...args) => setTimeout(fn, 0, ...args));

require('@babel/register');
require('tsx/cjs');
const v8 = require('v8');
const fs = require('node:fs/promises');
const path = require('path');

require('../../helpers/setup-helper');

// Fetch
const { default: fetch, Headers, Request, Response } = require('node-fetch');

Object.assign(window, { fetch, Headers, Request, Response });
// some of our libraries currently assume that `fetch` is globally available,
// so we need to assign this for tests to run
global.fetch = fetch;

global.metamask = {};

const structuredClone = (obj) => {
  return v8.deserialize(v8.serialize(obj));
};

global.structuredClone = structuredClone;

// Mock DOM measurements for virtualizer
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  value: 800,
});
