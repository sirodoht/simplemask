import { rpcErrors } from '@metamask/rpc-errors';
import type {
  JsonRpcEngineCallbackError,
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type {
  Json,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from '@metamask/utils';
import { ERC20 } from '@metamask/controller-utils';
import { MESSAGE_TYPE } from '../../../../../shared/constants/app';

export type HandleWatchAssetRequest = (
  options: Record<string, string | Record<string, Json>>,
) => Promise<void>;

type WatchAssetParams = { options: Record<string, Json>; type: string };

type RequestExtras = Partial<{ origin: string; networkClientId: string }>;

export type WatchAssetRequest = JsonRpcRequest<WatchAssetParams> &
  RequestExtras;

export type WatchAssetHooks = {
  handleWatchAssetRequest: HandleWatchAssetRequest;
};

type WatchAssetConstraint = MethodHandler<
  WatchAssetHooks,
  never,
  WatchAssetParams,
  true,
  RequestExtras
>;

export const watchAssetHandler = {
  implementation: watchAssetImplementation,
  hookNames: {
    handleWatchAssetRequest: true,
  },
} satisfies WatchAssetConstraint;

const watchAssetHandlers = {
  [MESSAGE_TYPE.WATCH_ASSET]: watchAssetHandler,
  [MESSAGE_TYPE.WATCH_ASSET_LEGACY]: watchAssetHandler,
};

export default watchAssetHandlers;

/**
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The json-rpc-engine 'next' callback.
 * @param end - The json-rpc-engine 'end' callback.
 * @param options
 * @param options.handleWatchAssetRequest - The wallet_watchAsset method implementation.
 */
async function watchAssetImplementation(
  req: WatchAssetRequest,
  res: PendingJsonRpcResponse<true>,
  _next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  { handleWatchAssetRequest }: WatchAssetHooks,
): Promise<void> {
  try {
    const { params, origin, networkClientId } = req;
    if (!params) {
      return end(rpcErrors.invalidParams());
    }
    const { options: asset, type } = params;

    if (type !== ERC20) {
      return end(
        rpcErrors.invalidParams({
          message: `Asset type ${type} not supported`,
        }),
      );
    }

    await handleWatchAssetRequest({
      asset,
      type,
      origin: origin ?? '',
      networkClientId: networkClientId ?? '',
    });
    res.result = true;
    return end();
  } catch (error: unknown) {
    return end(error as JsonRpcEngineCallbackError);
  }
}
