import { Mockttp } from 'mockttp';

/**
 * Mock GET /v2/supportedNetworks for the Token API and the Tokens API.
 *
 * Rpc token detection calls `token.api`. TokenDataSource calls `tokens.api`.
 * Both use this chain list to decide which networks can be enriched.
 *
 * @param mockServer - The mock server instance.
 * @returns The mocked endpoints, one per host.
 */
export const mockTokensV2SupportedNetworks = async (mockServer: Mockttp) => {
  const supportedNetworks = {
    fullSupport: [
      'eip155:1',
      'eip155:137',
      'eip155:56',
      'eip155:1337',
      'eip155:42161',
      'eip155:10',
      'eip155:8453',
    ],
    partialSupport: [],
  };

  return Promise.all(
    [
      'https://token.api.cx.metamask.io/v2/supportedNetworks',
      'https://tokens.api.cx.metamask.io/v2/supportedNetworks',
    ].map((url) =>
      mockServer.forGet(url).always().thenJson(200, supportedNetworks),
    ),
  );
};

/**
 * Mock GET /v3/assets for the Tokens API.
 *
 * The TokenDataSource calls this endpoint to fetch asset metadata
 * (assetsInfo) for assets whose metadata is missing. Provides symbol,
 * decimals, and name for the EVM assets used in these tests.
 *
 * @param mockServer - The mock server instance.
 */
export const mockTokensV3Assets = (mockServer: Mockttp) =>
  mockServer
    .forGet(/https:\/\/tokens\.api\.cx\.metamask\.io\/v3\/assets/u)
    .always()
    .thenCallback((request) => {
      const url = new URL(request.url);
      const assetIds = url.searchParams.getAll('assetIds').join(',');

      const results = [];

      if (
        assetIds.includes(
          'eip155:1/erc20:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        )
      ) {
        results.push({
          assetId: 'eip155:1/erc20:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          name: 'USD Coin',
          symbol: 'USDC',
          decimals: 6,
          occurrences: 3,
        });
      }
      if (
        assetIds.includes(
          'eip155:1/erc20:0xdAC17F958D2ee523a2206206994597C13D831ec7',
        )
      ) {
        results.push({
          assetId: 'eip155:1/erc20:0xdAC17F958D2ee523a2206206994597C13D831ec7',
          name: 'Tether USD',
          symbol: 'USDT',
          decimals: 6,
          occurrences: 3,
        });
      }

      if (assetIds.includes('eip155:1')) {
        results.push({
          assetId: 'eip155:1/slip44:60',
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          iconUrl:
            'https://static.cx.metamask.io/api/v2/tokenIcons/assets/eip155/1337/slip44/60.png',
          coingeckoId: 'ethereum',
        });
      }

      if (assetIds.includes('eip155:1337')) {
        results.push({
          assetId: 'eip155:1337/slip44:1',
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          iconUrl:
            'https://static.cx.metamask.io/api/v2/tokenIcons/assets/eip155/1337/slip44/60.png',
          coingeckoId: 'ethereum',
        });
      }

      if (assetIds.includes('TUPM7K8REVzD2UdV4R5fe5M8XbnR2DdoJ6')) {
        results.push({
          assetId: 'tron:728126428/trc20:TUPM7K8REVzD2UdV4R5fe5M8XbnR2DdoJ6',
          name: 'HTX',
          symbol: 'HTX',
          decimals: 18,
        });
      }

      if (assetIds.includes('TBwoSTyywvLrgjSgaatxrBhxt3DGpVuENh')) {
        results.push({
          assetId: 'tron:728126428/trc20:TBwoSTyywvLrgjSgaatxrBhxt3DGpVuENh',
          name: 'SEED',
          symbol: 'SEED',
          decimals: 6,
        });
      }

      if (assetIds.includes('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t')) {
        results.push({
          assetId: 'tron:728126428/trc20:TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
          name: 'Tether USD',
          symbol: 'USDT',
          decimals: 6,
        });
      }

      if (assetIds.includes('TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz')) {
        results.push({
          assetId: 'tron:728126428/trc20:TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz',
          name: 'Decentralized USD',
          symbol: 'USDD',
          decimals: 18,
        });
      }

      if (assetIds.includes('trc10:1005074')) {
        results.push({
          assetId: 'tron:728126428/trc10:1005074',
          name: 'GasFreeTransferSolution',
          symbol: 'GasFree4uCOM',
          decimals: 6,
        });
      }

      return { statusCode: 200, json: results };
    });
