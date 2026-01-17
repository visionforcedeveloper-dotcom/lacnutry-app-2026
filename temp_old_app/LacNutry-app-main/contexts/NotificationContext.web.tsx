import { createContext, useContext, useMemo, type ReactNode } from "react";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: null;
  scheduleEngagementNotifications: () => Promise<void>;
  trackEngagement: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useMemo(() => ({
    expoPushToken: null,
    notification: null,
    scheduleEngagementNotifications: async () => {
      console.log('[Web] Notificações não disponíveis na web');
    },
    trackEngagement: async () => {
      console.log('[Web] Tracking de engajamento desabilitado na web');
    },
    cancelAllNotifications: async () => {
      console.log('[Web] Cancelamento de notificações não necessário na web');
    },
  }), []);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }

  return context;
}

























