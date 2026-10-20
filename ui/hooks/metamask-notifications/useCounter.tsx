import { useSelector } from 'react-redux';
import {
  selectIsMetamaskNotificationsEnabled,
  getOnChainMetamaskNotificationsReadCount,
  getOnChainMetamaskNotificationsUnreadCount,
  getSnapNotificationsReadCount,
  getSnapNotificationsUnreadCount,
} from '../../selectors/metamask-notifications/metamask-notifications';

const useSnapNotificationsCount = () => {
  const unreadSnapNotificationsCount = useSelector(
    getSnapNotificationsUnreadCount,
  );
  const readSnapNotificationsCount = useSelector(getSnapNotificationsReadCount);
  return { unreadSnapNotificationsCount, readSnapNotificationsCount };
};

const useWalletNotificationCount = () => {
  const isMetamaskNotificationsEnabled = useSelector(
    selectIsMetamaskNotificationsEnabled,
  );

  const onChainMetamaskNotificationsUnreadCount = useSelector(
    getOnChainMetamaskNotificationsUnreadCount,
  );

  const onChainMetamaskNotificationsReadCount = useSelector(
    getOnChainMetamaskNotificationsReadCount,
  );

  return isMetamaskNotificationsEnabled
    ? {
        onChainMetamaskNotificationsUnreadCount,
        onChainMetamaskNotificationsReadCount,
      }
    : {
        onChainMetamaskNotificationsUnreadCount: 0,
        onChainMetamaskNotificationsReadCount: 0,
      };
};

export function useUnreadNotificationsCounter() {
  const { unreadSnapNotificationsCount } = useSnapNotificationsCount();
  const { onChainMetamaskNotificationsUnreadCount } =
    useWalletNotificationCount();

  const notificationsUnreadCount =
    unreadSnapNotificationsCount + onChainMetamaskNotificationsUnreadCount;

  return {
    notificationsUnreadCount,
  };
}

export function useReadNotificationsCounter() {
  const { readSnapNotificationsCount } = useSnapNotificationsCount();
  const { onChainMetamaskNotificationsReadCount } =
    useWalletNotificationCount();

  const notificationsReadCount =
    readSnapNotificationsCount + onChainMetamaskNotificationsReadCount;

  return {
    notificationsReadCount,
  };
}
