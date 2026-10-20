import log from 'loglevel';
import type { Runtime } from 'webextension-polyfill';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '#shared/constants/metametrics';
import type { FlattenedBackgroundStateProxy } from '#shared/types';
import { createEventBuilder, trackEvent } from '../../controllers/analytics';
import { onUpdate } from '../../on-update';
import type ExtensionPlatform from '../../platforms/extension';

type OnUpdateController = Parameters<typeof onUpdate>[0];
type OnUpdatePlatform = Parameters<typeof onUpdate>[1];

type InstallLifecycleController = OnUpdateController & {
  getState: () => Pick<
    FlattenedBackgroundStateProxy,
    'consentDecisionMade' | 'optedIn'
  >;
};

type InstallLifecyclePlatform = OnUpdatePlatform &
  Pick<ExtensionPlatform, 'openExtensionInBrowser'>;

export type InstallLifecycleDependencies = {
  controller: InstallLifecycleController;
  platform: InstallLifecyclePlatform;
  isInitialized: Promise<void>;
  requestSafeReload: () => void;
};
/**
 * Queue the installation event according to the user's analytics choice.
 * @param controller - Consent state provider.
 */
function addAppInstalledEvent(
  controller: Pick<InstallLifecycleController, 'getState'>,
): void {
  const { consentDecisionMade, optedIn } = controller.getState();
  if (consentDecisionMade === true && optedIn === false) {
    return;
  }
  trackEvent(
    createEventBuilder(MetaMetricsEventName.AppInstalled)
      .addCategory(MetaMetricsEventCategory.App)
      .addProperties({})
      .build(),
  );
}

/**
 * Trigger actions that should happen only upon initial install (e.g. open tab for
 * onboarding).
 *
 * @param deps - Install lifecycle dependencies.
 */
async function onInstall(deps: InstallLifecycleDependencies): Promise<void> {
  log.debug('First install detected');

  if (!process.env.IN_TEST && !process.env.METAMASK_DEBUG) {
    deps.platform.openExtensionInBrowser();
  }

  await deps.isInitialized;

  addAppInstalledEvent(deps.controller);
}

/**
 * Handles the runtime.onInstalled event.
 *
 * @param detailsTuple - Tuple containing a single installation details object.
 * @param detailsTuple."0"
 * @param deps - Install lifecycle dependencies.
 */
export async function handleOnInstalled(
  [details]: [Runtime.OnInstalledDetailsType],
  deps: InstallLifecycleDependencies,
): Promise<void> {
  if (details.reason === 'install') {
    await onInstall(deps);
  } else if (details.reason === 'update') {
    const { previousVersion } = details;
    if (!previousVersion || previousVersion === deps.platform.getVersion()) {
      return;
    }
    await deps.isInitialized;
    onUpdate(
      deps.controller,
      deps.platform,
      previousVersion,
      deps.requestSafeReload,
    );
  }
}

/**
 * Trigger actions that should happen only when an update is available.
 *
 * @param details - Event details from runtime.onUpdateAvailable.
 * @param deps - Install lifecycle dependencies.
 */
export async function onUpdateAvailable(
  details: Runtime.OnUpdateAvailableDetailsType,
  deps: InstallLifecycleDependencies,
): Promise<void> {
  await deps.isInitialized;
  log.info('An update is available', details?.version);
  deps.controller.appStateController.setPendingExtensionVersion(
    details?.version ?? null,
  );
}
