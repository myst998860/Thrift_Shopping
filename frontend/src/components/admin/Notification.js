import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/admin/Notification.css';
import { notificationService } from '../../services/api';

const tabList = [
  { key: 'all', label: 'All notifications' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
];

const Notification = () => {
  const [tab, setTab] = React.useState('all');
  const [notifications, setNotifications] = React.useState([]);

  // Assume userId is available here
  const userId = sessionStorage.getItem("userId");  // or get it however you prefer

  // Fetch notifications from backend using your service
  const fetchNotifications = React.useCallback(async () => {
    try {
      if (!userId) throw new Error("User not authenticated");
      const data = await notificationService.getUserNotifications(userId);

      // Transform backend data to match component expectations
      const formattedData = Array.isArray(data) ? data.map(n => ({
        ...n,
        title: n.title || "Notification",
        message: n.message || "",
        time: n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now',
        read: n.status?.toUpperCase() === 'READ',
        type: n.type ? n.type.toLowerCase() : 'info'
      })) : [];

      setNotifications(formattedData);
      console.log("notifications:", formattedData)
    } catch (e) {
      console.error("Error fetching notifications:", e);
    }
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

  const tabsWithCounts = [
    { key: 'all', label: 'All notifications', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'read', label: 'Read', count: readCount },
  ];

  const markAsRead = async (id) => {
    try {
      if (!userId) return;
      await notificationService.markAsRead(id, userId);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const filtered = notifications.filter(n => {
    if (tab === 'all') return true;
    if (tab === 'unread') return !n.read;
    if (tab === 'read') return n.read;
    return true;
  });

  const markAllAsRead = async () => {
    try {
      if (!userId) return;
      await notificationService.markAllAsRead(userId);
      fetchNotifications();
    } catch {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  const clearAll = async () => {
    try {
      if (!userId) return;
      await notificationService.clearAllNotifications(userId);
      fetchNotifications();
    } catch {
      setNotifications([]);
    }
  };

  return (
    <div className="notification-container">
      <div className="notification-header">
        <h2 className="notification-title">Notifications</h2>
        <div className="notification-tabs">
          {tabsWithCounts.map(t => (
            <button
              key={t.key}
              className={`notification-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.count > 0 && <span className="notification-tab-badge">{t.count}</span>}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div className="notification-actions">
            <button className="notification-action mark-read" onClick={markAllAsRead}>Mark all as read</button>
            <button className="notification-action" onClick={clearAll}>Clear all</button>
          </div>
        </div>
      </div>
      <div className="notification-list-wrapper">
        <div className="notification-card-container">
          <h2 className="notification-card-title-main">Your Notifications</h2>
          <div className="notification-list">
            {filtered.length === 0 && (
              <div className="notification-empty">No notifications</div>
            )}
            {filtered.map(n => (
              <div
                key={n.id}
                className={`notification-item ${n.read ? 'read' : 'unread'}`}
                onClick={() => !n.read && markAsRead(n.id)}
                style={{ cursor: !n.read ? 'pointer' : 'default' }}
              >
                <div className="notification-content">
                  <div className="notification-message-title">{n.title}</div>
                  <div className="notification-message-body">{n.message}</div>
                  <div className="notification-time">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;

