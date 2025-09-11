
"use client"

import Header from "./Header"
import Footer from "./Footer"
import NotificationsPage from "./notifications-page"
import "../styles/notification-page-complete.css"

const NotificationPageComplete = () => {
  return (
    <div className="notification-page-wrapper">
      <Header hasNotifications={true} isLoggedIn={true} user={{ name: "John Doe" }} />

      <main className="main-content">
        <NotificationsPage />
      </main>

      <Footer />
    </div>
  )
}

export default NotificationPageComplete
