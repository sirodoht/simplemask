import { memo, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { DEFAULT_ROUTE } from '../../helpers/constants/routes';
import { selectIsNetworkMenuOpen } from '../../selectors';
import { toggleNetworkMenu } from '../../store/actions';
import { useDispatch } from '../../store/hooks';

import { HomeQueryParams } from '../../../shared/lib/deep-links/routes/home';

export type HomeDeepLinkQrCode = {
  deeplinkUrl: string;
  descriptionKey: string;
  titleKey: string;
};

type HomeDeepLinkActionsProps = Record<string, never>;

/**
 * Reusable hook to handle deep link actions for the home route.
 */
export const useHomeDeepLinkEffects = () => {
  const { pathname } = useLocation();
  const isHomeRoute = pathname === DEFAULT_ROUTE;

  const [searchParams, setSearchParams] = useSearchParams();
  const isNetworkMenuOpen = useSelector(selectIsNetworkMenuOpen);
  const dispatch = useDispatch();

  const openNetworkSelectorModal = useCallback(() => {
    if (!isNetworkMenuOpen) {
      dispatch(toggleNetworkMenu());
    }
  }, [dispatch, isNetworkMenuOpen]);

  const deepLinkHandlers: Record<
    HomeQueryParams,
    {
      isValidParam: (param?: string) => boolean;
      action: (param: string) => void;
    }
  > = useMemo(
    () => ({
      [HomeQueryParams.OpenNetworkSelector]: {
        isValidParam: (param?: string) => param?.toLowerCase() === 'true',
        action: openNetworkSelectorModal,
      },
    }),
    [openNetworkSelectorModal],
  );

  const clearDeepLinkParams = useCallback(() => {
    setSearchParams((params) => {
      Object.keys(deepLinkHandlers).forEach((key) => {
        params.delete(key);
      });
      return params;
    });
  }, [setSearchParams, deepLinkHandlers]);

  const handleDeepLinkAction = useCallback(
    (action: (param: string) => void, param: string) => {
      clearDeepLinkParams();
      action(param);
    },
    [clearDeepLinkParams],
  );

  useEffect(() => {
    if (!isHomeRoute) {
      return;
    }

    for (const [key, value] of searchParams.entries()) {
      const deepLink = deepLinkHandlers[key as HomeQueryParams];
      if (deepLink?.isValidParam(value)) {
        handleDeepLinkAction(deepLink.action, value);
        break;
      }
    }
  }, [deepLinkHandlers, handleDeepLinkAction, isHomeRoute, searchParams]);
};

/**
 * Ghost component that manages the useHomeDeepLinkEffects.
 * Dispatches deep-link QR code data to Redux so
 * DeeplinkQrCodeModalContainer can render it independently.
 */
export const HomeDeepLinkActions = memo(() => {
  useHomeDeepLinkEffects();
  return null;
});
