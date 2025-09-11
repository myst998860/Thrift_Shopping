"use client"

import { useState, useEffect } from "react"
import { notificationService } from "../../services/api"
import { jwtDecode } from "jwt-decode"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

import "../../styles/notification-page.css"

dayjs.extend(relativeTime)

// Transform backend notification object to frontend shape
const transformNotification = (notif) => {
  return {
    id: notif.id,
    text: notif.message || notif.title || "No message",
    type: notif.type ? notif.type.toLowerCase() : "info",
    read: notif.status === "READ" || notif.readAt !== null,
    time: notif.createdAt ? dayjs(notif.createdAt).fromNow() : "Unknown time",
  }
}

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState("all")
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Decode userId from JWT token stored in localStorage
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("jwtToken")
    if (!token) return null
    try {
      const decoded = jwtDecode(token)
      return decoded.userId || decoded.id || decoded.sub // adjust based on your token structure
    } catch {
      return null
    }
  }

  useEffect(() => {
    const userId = getUserIdFromToken()
    if (!userId) {
      setError("User not authenticated")
      setLoading(false)
      return
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const response = await notificationService.getUserNotifications(userId)
        console.log("Notifications fetched:", response)

        const notificationList = Array.isArray(response)
          ? response.map(transformNotification)
          : []

        setNotifications(notificationList)
        setError(null)
      } catch (error) {
        console.error("Error fetching notifications:", error)

        // Use mock data if API fails
        const mockNotifications = [
          {
            id: 1,
            text: "Your booking for grand ballroom has been confirmed",
            time: "Just now",
            type: "success",
            read: false,
          },
          {
            id: 2,
            text: "Payment of NPR 30,000 has been processed successfully",
            time: "1 min ago",
            type: "success",
            read: false,
          },
          {
            id: 3,
            text: "Reminder: your event at Grand Ballroom is scheduled for May 25, 2025.",
            time: "2 min ago",
            type: "warning",
            read: false,
          },
          {
            id: 4,
            text: "Please complete your profile information to improve your recommendations.",
            time: "3 days ago",
            type: "warning",
            read: true,
          },
          {
            id: 5,
            text: "New venue added in kathmandu. Check them out!",
            time: "1 week ago",
            type: "warning",
            read: true,
          },
        ]
        setNotifications(mockNotifications)
        setError("Could not connect to notification service. Showing cached notifications.")
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      console.log("All notifications marked as read")

      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    } catch (error) {
      console.error("Error marking all as read:", error)
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    }
  }

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      console.log("Notification marked as read:", id)

      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )
    }
  }

  const clearAll = () => {
    setNotifications([])
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "unread") return !notification.read
    if (activeTab === "read") return notification.read
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="notifications-container">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
            fontSize: "18px",
            color: "#666",
          }}
        >
          Loading notifications...
        </div>
      </div>
    )
  }

  return (
    <div className="notifications-container">
      {error && (
        <div
          style={{
            background: "#fff3cd",
            color: "#856404",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "4px",
            border: "1px solid #ffeaa7",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div className="header">
        <h1 className="title">Notifications</h1>
        <div className="header-buttons">
          <button onClick={markAllAsRead} disabled={unreadCount === 0} className="mark-all-btn">
            Mark all as read
          </button>
          <button onClick={clearAll} disabled={notifications.length === 0} className="clear-all-btn">
            Clear all
          </button>
        </div>
      </div>

      <div className="tab-navigation">
        <button onClick={() => setActiveTab("all")} className={`tab-button ${activeTab === "all" ? "active" : ""}`}>
          All notifications
          {notifications.length > 0 && <span className="tab-count gray">{notifications.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab("unread")}
          className={`tab-button ${activeTab === "unread" ? "active" : ""}`}
        >
          Unread
          {unreadCount > 0 && <span className="tab-count red">{unreadCount}</span>}
        </button>
        <button onClick={() => setActiveTab("read")} className={`tab-button ${activeTab === "read" ? "active" : ""}`}>
          Read
          {notifications.filter((n) => n.read).length > 0 && (
            <span className="tab-count gray">{notifications.filter((n) => n.read).length}</span>
          )}
        </button>
      </div>

      <div className="notifications-card">
        <div className="card-header">
          <h2 className="card-title">Your Notifications</h2>
          <p className="card-subtitle">Stay updated with important notices</p>
        </div>
        <div className="card-content">
          {filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <p>No notifications to show</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`notification-item ${!notification.read ? "unread" : "read"}`}
              >
                <div className={`notification-dot ${notification.type}`} />
                <div className="notification-content">
                  <div className="notification-text-container">
                    <p className="notification-text">{notification.text}</p>
                    {!notification.read && <div className="unread-indicator" />}
                  </div>
                  <p className="notification-time">{notification.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationsPage