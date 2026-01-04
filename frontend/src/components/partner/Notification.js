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
  const userId = localStorage.getItem("userId");  // or get it however you prefer

  // Fetch notifications from backend using your service
  const fetchNotifications = React.useCallback(async () => {
    try {
      if (!userId) throw new Error("User not authenticated");
      const data = await notificationService.getUserNotifications(userId);

      // Transform backend data to match component expectations
      const formattedData = Array.isArray(data) ? data.map(n => ({
        ...n,
        // Ensure keys match what the UI expects
        message: n.message || n.title, // Fallback if message is empty
        time: n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Just now',
        read: n.status === 'READ',
        type: n.type ? n.type.toLowerCase() : 'info'
      })) : [];

      setNotifications(formattedData);
      console.log("notifications:", formattedData)
    } catch (e) {
      // fallback mock data
      console.error("Error fetching notifications:", e);
      // Keep existing mock data as fallback if needed, or set empty
    }
  }, [userId]);

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
          {tabList.map(t => (
            <button
              key={t.key}
              className={`notification-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div className="notification-actions">
            <button className="notification-action mark-read" onClick={markAllAsRead}>Mark all as read</button>
            <button className="notification-action" onClick={clearAll}>Clear all</button>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 36px 36px 36px' }}>
        <div className="notification-card">
          <div className="notification-card-header">
            <div className="notification-card-title">Your Notification</div>
            <div className="notification-card-desc">Stay updated with important notice</div>
          </div>
          <div className="notification-list">
            {filtered.length === 0 && (
              <div className="notification-empty">No notifications</div>
            )}
            {filtered.map(n => (
              <div key={n.id} className="notification-item">
                <span className={`notification-dot${n.read ? ' read' : ' unread'}`}></span>
                <div>
                  <div className="notification-message">{n.message}</div>
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