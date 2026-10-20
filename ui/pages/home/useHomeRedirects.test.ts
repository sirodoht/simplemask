import { renderHook, act } from '@testing-library/react';
import {
  ENVIRONMENT_TYPE_POPUP,
  ENVIRONMENT_TYPE_FULLSCREEN,
} from '../../../shared/constants/app';
import {
  useRedirectAfterDefaultPage,
  usePendingRedirectRoute,
  type PendingRedirectRoute,
} from './useHomeRedirects';

// ---------------------------------------------------------------------------
// useRedirectAfterDefaultPage
// ---------------------------------------------------------------------------

describe('useRedirectAfterDefaultPage', () => {
  it('does nothing when redirectAfterDefaultPage is undefined', () => {
    const navigate = jest.fn();
    const clearRedirectAfterDefaultPage = jest.fn();

    renderHook(() =>
      useRedirectAfterDefaultPage({ navigate, clearRedirectAfterDefaultPage }),
    );

    expect(navigate).not.toHaveBeenCalled();
    expect(clearRedirectAfterDefaultPage).not.toHaveBeenCalled();
  });

  it('does nothing when shouldRedirect is false', () => {
    const navigate = jest.fn();
    const clearRedirectAfterDefaultPage = jest.fn();

    renderHook(() =>
      useRedirectAfterDefaultPage({
        redirectAfterDefaultPage: { shouldRedirect: false, path: '/foo' },
        navigate,
        clearRedirectAfterDefaultPage,
      }),
    );

    expect(navigate).not.toHaveBeenCalled();
    expect(clearRedirectAfterDefaultPage).not.toHaveBeenCalled();
  });

  it('navigates and clears when shouldRedirect is true', () => {
    const navigate = jest.fn();
    const clearRedirectAfterDefaultPage = jest.fn();

    renderHook(() =>
      useRedirectAfterDefaultPage({
        redirectAfterDefaultPage: { shouldRedirect: true, path: '/foo' },
        navigate,
        clearRedirectAfterDefaultPage,
      }),
    );

    expect(navigate).toHaveBeenCalledWith('/foo');
    expect(clearRedirectAfterDefaultPage).toHaveBeenCalled();
  });

  it('navigates again when redirectAfterDefaultPage updates to a new value', () => {
    const navigate = jest.fn();
    const clearRedirectAfterDefaultPage = jest.fn();

    const { rerender } = renderHook(
      ({ path }: { path: string }) =>
        useRedirectAfterDefaultPage({
          redirectAfterDefaultPage: { shouldRedirect: true, path },
          navigate,
          clearRedirectAfterDefaultPage,
        }),
      { initialProps: { path: '/foo' } },
    );

    expect(navigate).toHaveBeenCalledTimes(1);

    act(() => {
      rerender({ path: '/bar' });
    });

    expect(navigate).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenLastCalledWith('/bar');
  });
});

// ---------------------------------------------------------------------------
// usePendingRedirectRoute
// ---------------------------------------------------------------------------

describe('usePendingRedirectRoute', () => {
  it('does nothing when pendingRedirectRoute is null', () => {
    const setRedirectAfterDefaultPage = jest.fn();
    const clearPendingRedirectRoute = jest.fn();

    renderHook(() =>
      usePendingRedirectRoute({
        pendingRedirectRoute: null,
        setRedirectAfterDefaultPage,
        clearPendingRedirectRoute,
      }),
    );

    expect(setRedirectAfterDefaultPage).not.toHaveBeenCalled();
    expect(clearPendingRedirectRoute).not.toHaveBeenCalled();
  });

  it('redirects and clears when route has no environmentType restriction', () => {
    const setRedirectAfterDefaultPage = jest.fn();
    const clearPendingRedirectRoute = jest.fn();

    renderHook(() =>
      usePendingRedirectRoute({
        pendingRedirectRoute: { path: '/shield-plan' },
        setRedirectAfterDefaultPage,
        clearPendingRedirectRoute,
      }),
    );

    expect(setRedirectAfterDefaultPage).toHaveBeenCalledWith({
      path: '/shield-plan',
    });
    expect(clearPendingRedirectRoute).toHaveBeenCalled();
  });

  it('appends search when route includes a search query', () => {
    const setRedirectAfterDefaultPage = jest.fn();
    const clearPendingRedirectRoute = jest.fn();

    renderHook(() =>
      usePendingRedirectRoute({
        pendingRedirectRoute: {
          path: '/shield-plan',
          search: '?source=checkout',
        },
        setRedirectAfterDefaultPage,
        clearPendingRedirectRoute,
      }),
    );

    expect(setRedirectAfterDefaultPage).toHaveBeenCalledWith({
      path: '/shield-plan?source=checkout',
    });
    expect(clearPendingRedirectRoute).toHaveBeenCalled();
  });

  it('redirects when environmentType matches the current env', () => {
    const setRedirectAfterDefaultPage = jest.fn();
    const clearPendingRedirectRoute = jest.fn();

    renderHook(() =>
      usePendingRedirectRoute({
        envType: ENVIRONMENT_TYPE_POPUP,
        pendingRedirectRoute: {
          path: '/shield-plan',
          environmentType: ENVIRONMENT_TYPE_POPUP,
        },
        setRedirectAfterDefaultPage,
        clearPendingRedirectRoute,
      }),
    );

    expect(setRedirectAfterDefaultPage).toHaveBeenCalledWith({
      path: '/shield-plan',
    });
    expect(clearPendingRedirectRoute).toHaveBeenCalled();
  });

  it('does not redirect but still clears when environmentType does not match', () => {
    const setRedirectAfterDefaultPage = jest.fn();
    const clearPendingRedirectRoute = jest.fn();

    renderHook(() =>
      usePendingRedirectRoute({
        envType: ENVIRONMENT_TYPE_FULLSCREEN,
        pendingRedirectRoute: {
          path: '/shield-plan',
          environmentType: ENVIRONMENT_TYPE_POPUP,
        },
        setRedirectAfterDefaultPage,
        clearPendingRedirectRoute,
      }),
    );

    expect(setRedirectAfterDefaultPage).not.toHaveBeenCalled();
    expect(clearPendingRedirectRoute).toHaveBeenCalled();
  });

  it('fires when pendingRedirectRoute transitions from null to a value', () => {
    const setRedirectAfterDefaultPage = jest.fn();
    const clearPendingRedirectRoute = jest.fn();

    const { rerender } = renderHook(
      ({ route }: { route: { path: string } | null }) =>
        usePendingRedirectRoute({
          pendingRedirectRoute: route,
          setRedirectAfterDefaultPage,
          clearPendingRedirectRoute,
        }),
      { initialProps: { route: null as { path: string } | null } },
    );

    expect(setRedirectAfterDefaultPage).not.toHaveBeenCalled();
    expect(clearPendingRedirectRoute).not.toHaveBeenCalled();

    act(() => {
      rerender({ route: { path: '/shield-plan' } });
    });

    expect(setRedirectAfterDefaultPage).toHaveBeenCalledWith({
      path: '/shield-plan',
    });
    expect(clearPendingRedirectRoute).toHaveBeenCalled();
  });

  it('does not redirect again after pending route is cleared on remount', () => {
    const setRedirectAfterDefaultPage = jest.fn();
    const clearPendingRedirectRoute = jest.fn();
    const route = { path: '/shield-plan' };

    const { rerender } = renderHook(
      ({ pending }: { pending: { path: string } | null }) =>
        usePendingRedirectRoute({
          pendingRedirectRoute: pending,
          setRedirectAfterDefaultPage,
          clearPendingRedirectRoute,
        }),
      { initialProps: { pending: route as PendingRedirectRoute | null } },
    );

    expect(setRedirectAfterDefaultPage).toHaveBeenCalledTimes(1);
    expect(clearPendingRedirectRoute).toHaveBeenCalledTimes(1);

    act(() => {
      rerender({ pending: null });
    });

    expect(setRedirectAfterDefaultPage).toHaveBeenCalledTimes(1);
    expect(clearPendingRedirectRoute).toHaveBeenCalledTimes(1);
  });
});
