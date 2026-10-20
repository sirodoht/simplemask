import { getEnabledNetworks } from './multichain';

describe('getEnabledNetworks', () => {
  it('excludes saved non-EVM namespaces and preserves custom EVM networks', () => {
    const evm = { '0x1': true, '0x539': false, '0x1234': true };
    const state = {
      metamask: {
        enabledNetworkMap: {
          eip155: evm,
          solana: { mainnet: true },
          bip122: { mainnet: true },
          tron: { mainnet: true },
          stellar: { pubnet: true },
        },
      },
    };
    const result = getEnabledNetworks(state);
    expect(result).toStrictEqual({ eip155: evm });
    expect(result.eip155).toBe(evm);
    expect(getEnabledNetworks(state)).toBe(result);
    expect(state.metamask.enabledNetworkMap.solana.mainnet).toBe(true);
  });

  it('preserves the reference for an EVM-only map', () => {
    const enabledNetworkMap = { eip155: { '0x1': true } };
    expect(getEnabledNetworks({ metamask: { enabledNetworkMap } })).toBe(
      enabledNetworkMap,
    );
  });
});
