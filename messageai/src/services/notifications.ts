import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Phase 3.1: Priority types for notifications
export type MessagePriority = 'urgent' | 'high' | 'normal' | 'low';

/**
 * Configure notification behavior
 * Phase 3.1: Enhanced with priority-based handling
 */
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Extract priority from notification data
    const priority = notification.request.content.data?.priority as MessagePriority | undefined;
    
    // Urgent and high priority messages always show alert and play sound
    // Even if the app is in focus
    const isHighPriority = priority === 'urgent' || priority === 'high';
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: isHighPriority ? true : true, // Always play sound for now
      shouldSetBadge: true,
      priority: isHighPriority ? Notifications.AndroidNotificationPriority.MAX : Notifications.AndroidNotificationPriority.DEFAULT,
    };
  },
});

/**
 * Request notification permissions from the user
 * Phase 3.1: Enhanced with priority-based notification channels
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }
    
    // For Android, create priority-based notification channels (Phase 3.1)
    if (Platform.OS === 'android') {
      // URGENT: Maximum importance, distinctive vibration, red light
      await Notifications.setNotificationChannelAsync('urgent', {
        name: 'Urgent Messages',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500, 250, 500], // Long, distinctive pattern
        lightColor: '#FF3B30', // Red
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true, // Bypass Do Not Disturb for urgent messages
      });
      
      // HIGH: High importance, strong vibration, orange light
      await Notifications.setNotificationChannelAsync('high', {
        name: 'High Priority Messages',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 400, 200, 400], // Strong pattern
        lightColor: '#FF9500', // Orange
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
      
      // NORMAL: Default importance, standard vibration
      await Notifications.setNotificationChannelAsync('normal', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250], // Standard pattern
        lightColor: '#007AFF', // Blue
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
      
      // LOW: Low importance, minimal vibration
      await Notifications.setNotificationChannelAsync('low', {
        name: 'Low Priority Messages',
        importance: Notifications.AndroidImportance.LOW,
        vibrationPattern: [0, 200], // Single short vibration
        lightColor: '#34C759', // Green
        sound: undefined, // No sound for low priority
        enableVibrate: true,
        showBadge: true,
      });
      
      // Keep default channel for backwards compatibility
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#007AFF',
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Show a local notification (for testing or foreground messages)
 * Phase 3.1: Enhanced with priority-based channels and styling
 */
export async function showLocalNotification(
  title: string,
  body: string,
  data?: any,
  priority?: MessagePriority
): Promise<void> {
  try {
    const messagePriority = priority || 'normal';
    
    // Add priority emoji to title for visual distinction
    let enhancedTitle = title;
    if (messagePriority === 'urgent') {
      enhancedTitle = `🚨 ${title}`;
    } else if (messagePriority === 'high') {
      enhancedTitle = `⚠️ ${title}`;
    } else if (messagePriority === 'low') {
      enhancedTitle = `📌 ${title}`;
    }
    
    // Determine the appropriate notification channel and sound
    const channelId = Platform.OS === 'android' ? messagePriority : 'default';
    const playSound = messagePriority !== 'low'; // Low priority = no sound
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: enhancedTitle,
        body,
        data: {
          ...data,
          priority: messagePriority, // Include priority in data for handler
        },
        sound: playSound,
        priority: messagePriority === 'urgent' || messagePriority === 'high' 
          ? Notifications.AndroidNotificationPriority.MAX 
          : Notifications.AndroidNotificationPriority.DEFAULT,
        // iOS-specific
        badge: 1,
        // Android-specific
        ...(Platform.OS === 'android' && {
          channelId,
          color: messagePriority === 'urgent' ? '#FF3B30' 
               : messagePriority === 'high' ? '#FF9500'
               : messagePriority === 'low' ? '#34C759'
               : '#007AFF',
        }),
      },
      trigger: null, // Show immediately
    });
    
    console.log(`[Notifications] Shown ${messagePriority} priority notification:`, enhancedTitle);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

/**
 * Set up notification received listener (when app is in foreground)
 */
export function subscribeToNotifications(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Set up notification response listener (when user taps on notification)
 */
export function subscribeToNotificationResponses(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get notification badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set notification badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}

