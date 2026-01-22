import { createContext, useContext, useEffect, useState, useRef, useMemo, type ReactNode } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const ENGAGEMENT_KEY = "@lactosefree_app:engagement";
const LAST_NOTIFICATION_KEY = "@lactosefree_app:last_notification";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  scheduleEngagementNotifications: () => Promise<void>;
  trackEngagement: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const notificationMessages = [
  {
    title: "Como estão as receitas? 🍰",
    body: "Esperamos que esteja gostando das nossas receitas sem lactose!",
  },
  {
    title: "Dica do dia! 💡",
    body: "Você sabia que leite de amêndoas é ótimo para bolos?",
  },
  {
    title: "Novos cardápios disponíveis! 📝",
    body: "Confira nossas novas receitas sem lactose adicionadas hoje.",
  },
  {
    title: "Hora de cozinhar! 👨‍🍳",
    body: "Que tal preparar algo delicioso sem lactose hoje?",
  },
  {
    title: "Inspiração culinária! ✨",
    body: "Temos receitas perfeitas para seu almoço ou jantar.",
  },
  {
    title: "Sugestão especial! 🌟",
    body: "Brownie de chocolate vegano é perfeito para a sobremesa!",
  },
  {
    title: "Não esqueça! 🔔",
    body: "Explore nossas receitas de pães caseiros sem lactose.",
  },
  {
    title: "Sua opinião importa! 💬",
    body: "Qual foi sua receita favorita desta semana?",
  },
];

export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(
    null
  );
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === "web") {
      console.log("Push notifications are not supported on web");
      return null;
    }

    let token: string | undefined;

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return null;
    }

    try {
      token = (
        await Notifications.getExpoPushTokenAsync()
      ).data;
      console.log("Expo push token:", token);
    } catch (error) {
      console.log("Push notifications not configured - using local notifications only");
      console.log("Error details:", error);
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }

  async function trackEngagement() {
    try {
      const engagementData = await AsyncStorage.getItem(ENGAGEMENT_KEY);
      let engagement = engagementData ? JSON.parse(engagementData) : { count: 0, lastUpdate: Date.now() };
      
      engagement.count += 1;
      engagement.lastUpdate = Date.now();
      
      await AsyncStorage.setItem(ENGAGEMENT_KEY, JSON.stringify(engagement));
      console.log("Engagement tracked:", engagement);
    } catch (error) {
      console.error("Error tracking engagement:", error);
    }
  }

  async function scheduleEngagementNotifications() {
    if (Platform.OS === "web") {
      console.log("Notifications not supported on web");
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const engagementData = await AsyncStorage.getItem(ENGAGEMENT_KEY);
      const engagement = engagementData ? JSON.parse(engagementData) : { count: 0 };

      const messageIndex = engagement.count % notificationMessages.length;
      const selectedMessage = notificationMessages[messageIndex];

      const threeDaysInSeconds = 3 * 24 * 60 * 60;

      const trigger: Notifications.TimeIntervalTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: threeDaysInSeconds,
        repeats: true,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: selectedMessage.title,
          body: selectedMessage.body,
          data: { engagement: engagement.count },
          sound: true,
        },
        trigger,
      });

      await AsyncStorage.setItem(
        LAST_NOTIFICATION_KEY,
        JSON.stringify({ date: Date.now(), message: selectedMessage })
      );

      console.log("Notification scheduled for 3 days from now");
    } catch (error) {
      console.error("Error scheduling notifications:", error);
    }
  }

  async function cancelAllNotifications() {
    if (Platform.OS === "web") {
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("All notifications cancelled");
    } catch (error) {
      console.error("Error cancelling notifications:", error);
    }
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    if (Platform.OS !== "web") {
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          console.log("Notification received:", notification);
          setNotification(notification);
        });

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log("Notification response:", response);
        });
    }

    scheduleEngagementNotifications();

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      expoPushToken,
      notification,
      scheduleEngagementNotifications,
      trackEngagement,
      cancelAllNotifications,
    }),
    [expoPushToken, notification]
  );

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
