import { useEffect } from 'react';
import type { NavigateFunction } from 'react-router-dom';

export type PendingRedirectRoute = {
  path: string;
  search?: string;
  environmentType?: string;
};

export type RedirectAfterDefaultPage = {
  shouldRedirect?: boolean;
  path?: string;
};

/**
 * Navigates immediately when `redirectAfterDefaultPage` is set and cleared in
 * the same tick — e.g. after a pending deeplink or perps-resume is resolved.
 * @param options0
 * @param options0.redirectAfterDefaultPage
 * @param options0.navigate
 * @param options0.clearRedirectAfterDefaultPage
 */
export function useRedirectAfterDefaultPage({
  redirectAfterDefaultPage,
  navigate,
  clearRedirectAfterDefaultPage,
}: {
  redirectAfterDefaultPage?: RedirectAfterDefaultPage;
  navigate?: NavigateFunction;
  clearRedirectAfterDefaultPage?: () => void;
}) {
  useEffect(() => {
    if (
      redirectAfterDefaultPage?.shouldRedirect &&
      redirectAfterDefaultPage.path
    ) {
      const { path } = redirectAfterDefaultPage;
      clearRedirectAfterDefaultPage?.();
      navigate?.(path);
    }
  }, [redirectAfterDefaultPage, navigate, clearRedirectAfterDefaultPage]);
}

/**
 * When `pendingRedirectRoute` is set, evaluates whether the route applies to the
 * current environment and, if so, schedules a redirect via
 * `setRedirectAfterDefaultPage`. Always clears the pending entry so StrictMode
 * remounts cannot replay the same redirect.
 * @param options0
 * @param options0.pendingRedirectRoute
 * @param options0.envType
 * @param options0.setRedirectAfterDefaultPage
 * @param options0.clearPendingRedirectRoute
 */
export function usePendingRedirectRoute({
  pendingRedirectRoute,
  envType,
  setRedirectAfterDefaultPage,
  clearPendingRedirectRoute,
}: {
  pendingRedirectRoute?: PendingRedirectRoute | null;
  envType?: string;
  setRedirectAfterDefaultPage?: (redirect: { path: string }) => void;
  clearPendingRedirectRoute?: () => void;
}) {
  useEffect(() => {
    if (!pendingRedirectRoute) {
      return;
    }

    const { path, search, environmentType } = pendingRedirectRoute;
    clearPendingRedirectRoute?.();

    const shouldRedirect = !environmentType || environmentType === envType;
    if (shouldRedirect) {
      setRedirectAfterDefaultPage?.({
        path: search ? `${path}${search}` : path,
      });
    }
  }, [
    pendingRedirectRoute,
    envType,
    setRedirectAfterDefaultPage,
    clearPendingRedirectRoute,
  ]);
}
