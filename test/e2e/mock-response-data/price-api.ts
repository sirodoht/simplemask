import { Mockttp } from 'mockttp';

const PRICE_API_URL = 'https://price.api.cx.metamask.io';

export const mockCurrencyExchangeRates = (mockServer: Mockttp) =>
  mockServer
    .forGet(`${PRICE_API_URL}/v1/exchange-rates`)
    .withQuery({
      baseCurrency: 'usd',
    })
    .thenJson(200, {
      btc: {
        name: 'Bitcoin',
        ticker: 'btc',
        value: 0.0000108733338912803,
        currencyType: 'crypto',
      },
      eth: {
        name: 'Ether',
        ticker: 'eth',
        value: 0.000319654269735859,
        currencyType: 'crypto',
      },
      usd: {
        name: 'US Dollar',
        ticker: 'usd',
        value: 1,
        currencyType: 'fiat',
      },
      eur: {
        name: 'Euro',
        ticker: 'eur',
        value: 0.85707100459917,
        currencyType: 'fiat',
      },
    });

export const mockFiatExchangeRates = (mockServer: Mockttp) =>
  mockServer.forGet(`${PRICE_API_URL}/v1/exchange-rates/fiat`).thenJson(200, {
    usd: {
      name: 'US Dollar',
      ticker: 'usd',
      value: 1,
      currencyType: 'fiat',
    },
    eur: {
      name: 'Euro',
      ticker: 'eur',
      value: 0.857113000723512,
      currencyType: 'fiat',
    },
    gbp: {
      name: 'British Pound Sterling',
      ticker: 'gbp',
      value: 0.742282005695906,
      currencyType: 'fiat',
    },
    jpy: {
      name: 'Japanese Yen',
      ticker: 'jpy',
      value: 158.871251486357,
      currencyType: 'fiat',
    },
    cad: {
      name: 'Canadian Dollar',
      ticker: 'cad',
      value: 1.38828300232555,
      currencyType: 'fiat',
    },
  });

// Mock for supported vs currencies (main currencies only)
export const mockSupportedVsCurrencies = (mockServer: Mockttp) =>
  mockServer
    .forGet(`${PRICE_API_URL}/v1/supportedVsCurrencies`)
    .thenJson(200, [
      'btc',
      'eth',
      'usd',
      'eur',
      'gbp',
      'jpy',
      'cad',
      'aud',
      'chf',
      'cny',
    ]);

// Mock for price API supported networks (/v2/supportedNetworks)
export const mockPriceApiSupportedNetworks = (mockServer: Mockttp) =>
  mockServer.forGet(`${PRICE_API_URL}/v2/supportedNetworks`).thenJson(200, {
    fullSupport: [
      'eip155:1',
      'eip155:10',
      'eip155:56',
      'eip155:100',
      'eip155:137',
      'eip155:250',
      'eip155:324',
      'eip155:8453',
      'eip155:42161',
      'eip155:43114',
      'eip155:59144',
    ],
    partialSupport: {
      spotPricesV2: [
        'eip155:1284',
        'eip155:1285',
        'eip155:42220',
        'eip155:534352',
        'eip155:81457',
        'eip155:1313161554',
        'eip155:1666600000',
      ],
      spotPricesV3: [
        'eip155:1284',
        'eip155:1285',
        'eip155:42220',
        'eip155:534352',
        'eip155:81457',
        'eip155:1313161554',
        'eip155:1666600000',
      ],
    },
  });
