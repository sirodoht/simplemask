import { ERC20, ERC721, ERC1155 } from '@metamask/controller-utils';
import { rpcErrors } from '@metamask/rpc-errors';
import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import { PendingJsonRpcResponse } from '@metamask/utils';
import { MESSAGE_TYPE } from '../../../../../shared/constants/app';
import { HandleWatchAssetRequest, watchAssetHandler } from './watch-asset';

describe('watchAssetHandler', () => {
  let mockEnd: jest.MockedFunction<JsonRpcEngineEndCallback>;
  let mockHandleWatchAssetRequest: jest.MockedFunction<HandleWatchAssetRequest>;

  beforeEach(() => {
    mockEnd = jest.fn();
    mockHandleWatchAssetRequest = jest.fn();
  });

  for (const type of [ERC721, ERC1155]) {
    it(`rejects ${type} watch requests without creating an approval`, async () => {
      const req = {
        id: '1',
        jsonrpc: '2.0' as const,
        method: MESSAGE_TYPE.WATCH_ASSET,
        params: {
          options: {
            address: '0x1234',
            tokenId: 'testTokenId',
          },
          type,
        },
        origin: 'testOrigin',
        networkClientId: 'networkClientId1',
      };

      const res = {
        id: '1',
        jsonrpc: '2.0' as const,
      } as PendingJsonRpcResponse<true>;

      await watchAssetHandler.implementation(
        req,
        res,
        () => undefined,
        mockEnd,
        {
          handleWatchAssetRequest: mockHandleWatchAssetRequest,
        },
      );

      expect(mockHandleWatchAssetRequest).not.toHaveBeenCalled();
      expect(res.result).toBeUndefined();
      expect(mockEnd).toHaveBeenCalledWith(
        rpcErrors.invalidParams({
          message: `Asset type ${type} not supported`,
        }),
      );
    });
  }

  it('should handle valid input for type ERC20 correctly', async () => {
    const req = {
      id: '1',
      jsonrpc: '2.0' as const,
      method: MESSAGE_TYPE.WATCH_ASSET,
      params: {
        options: {
          address: '0x1234',
          symbol: 'TEST',
          decimals: 18,
          tokenId: 'testTokenId',
        },
        type: ERC20,
      },
      origin: 'testOrigin',
      networkClientId: 'networkClientId1',
    };

    const res = {
      id: '1',
      jsonrpc: '2.0' as const,
    } as PendingJsonRpcResponse<true>;

    await watchAssetHandler.implementation(req, res, () => undefined, mockEnd, {
      handleWatchAssetRequest: mockHandleWatchAssetRequest,
    });

    expect(mockHandleWatchAssetRequest).toHaveBeenCalledWith({
      asset: req.params.options,
      type: req.params.type,
      origin: req.origin,
      networkClientId: req.networkClientId,
    });
    expect(res.result).toStrictEqual(true);
    expect(mockEnd).toHaveBeenCalledWith();
  });

  it('should return invalidParams when params are missing', async () => {
    const req = {
      id: '1',
      jsonrpc: '2.0' as const,
      method: MESSAGE_TYPE.WATCH_ASSET,
      origin: 'testOrigin',
    };

    const res = {
      id: '1',
      jsonrpc: '2.0' as const,
    } as PendingJsonRpcResponse<true>;

    await watchAssetHandler.implementation(req, res, () => undefined, mockEnd, {
      handleWatchAssetRequest: mockHandleWatchAssetRequest,
    });

    expect(mockHandleWatchAssetRequest).not.toHaveBeenCalled();
    expect(mockEnd).toHaveBeenCalledWith(rpcErrors.invalidParams());
  });
});
