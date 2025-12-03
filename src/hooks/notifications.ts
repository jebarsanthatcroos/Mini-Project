'use client';

import { useSession } from 'next-auth/react';
import { useState, useCallback, useEffect } from 'react';
import {
  Notification,
  NotificationPreferences,
  NotificationsResponse,
  MarkAsReadData,
  CreateNotificationData,
} from '@/types/notifications';

export function useNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (page: number = 1, limit: number = 20) => {
      if (!session?.user?.id) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/notifications?page=${page}&limit=${limit}`
        );
        const result: NotificationsResponse = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch notifications');
        }

        if (result.success && result.data) {
          setNotifications(result.data as Notification[]);

          // Calculate unread count
          const unread = (result.data as Notification[]).filter(
            n => !n.read
          ).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch notifications'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [session?.user?.id]
  );

  // Fetch notification preferences
  const fetchPreferences = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/notifications/preferences');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch preferences');
      }

      if (result.success && result.data) {
        setPreferences(result.data);
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
    }
  }, [session?.user?.id]);

  // Mark notifications as read/unread
  const markAsRead = useCallback(
    async (notificationIds: string[], read: boolean = true) => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/notifications/mark-read', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notificationIds,
            read,
          } as MarkAsReadData),
        });

        const result: NotificationsResponse = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update notifications');
        }

        if (result.success) {
          // Update local state
          setNotifications(prev =>
            prev.map(notification =>
              notificationIds.includes(notification.id)
                ? { ...notification, read }
                : notification
            )
          );

          // Update unread count
          if (read) {
            setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
          } else {
            setUnreadCount(prev => prev + notificationIds.length);
          }
        }
      } catch (err) {
        console.error('Error marking notifications as read:', err);
      }
    },
    [session?.user?.id]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!session?.user?.id) return;

    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;

    const notificationIds = unreadNotifications.map(n => n.id);
    await markAsRead(notificationIds, true);
  }, [session?.user?.id, notifications, markAsRead]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: 'DELETE',
        });

        const result: NotificationsResponse = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to delete notification');
        }

        if (result.success) {
          // Remove from local state
          setNotifications(prev => prev.filter(n => n.id !== notificationId));

          // Update unread count if the deleted notification was unread
          const deletedNotification = notifications.find(
            n => n.id === notificationId
          );
          if (deletedNotification && !deletedNotification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      } catch (err) {
        console.error('Error deleting notification:', err);
      }
    },
    [session?.user?.id, notifications]
  );

  // Update preferences
  const updatePreferences = useCallback(
    async (newPreferences: Partial<NotificationPreferences>) => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/notifications/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPreferences),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update preferences');
        }

        if (result.success && result.data) {
          setPreferences(result.data);
          return true;
        }

        return false;
      } catch (err) {
        console.error('Error updating preferences:', err);
        return false;
      }
    },
    [session?.user?.id]
  );

  // Create notification (for testing or admin use)
  const createNotification = useCallback(
    async (data: CreateNotificationData) => {
      try {
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result: NotificationsResponse = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create notification');
        }

        return result.success;
      } catch (err) {
        console.error('Error creating notification:', err);
        return false;
      }
    },
    []
  );

  // Initial data fetch
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [session?.user?.id, fetchNotifications, fetchPreferences]);

  return {
    notifications,
    unreadCount,
    preferences,
    isLoading,
    error,
    fetchNotifications,
    fetchPreferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    createNotification,
  };
}
