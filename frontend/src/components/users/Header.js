"use client"
import { useState, useEffect } from "react"
import { useCart } from "../../context/CartContext"
import "../../styles/Header.css"
import { useUserSession } from "../../context/UserSessionContext"
import { notificationService } from "../../services/api"


// SVG Icons (keeping all existing icons)
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
)

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
  </svg>
)

const ProfileMenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const LogoutMenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16,17 21,12 16,7"></polyline>
    <line x1="21" x2="9" y1="12" y2="12"></line>
  </svg>
)

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" x2="20" y1="12" y2="12"></line>
    <line x1="4" x2="20" y1="6" y2="6"></line>
    <line x1="4" x2="20" y1="18" y2="18"></line>
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>
)

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
)

const ServiceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12,6 12,12 16,14"></polyline>
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>
)

// Brand logo (green circle with heart)
const BrandLogo = () => (
  <svg viewBox="0 0 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#1e7e34" />
    <path
      d="M22.4 10.8c-1.5-1.5-3.9-1.5-5.4 0l-.7.7-.7-.7c-1.5-1.5-3.9-1.5-5.4 0-1.5 1.5-1.5 3.9 0 5.4l6.1 6.1 6.1-6.1c1.5-1.5 1.5-3.9 0-5.4z"
      fill="#fff"
    />
  </svg>
)

// Sample data for search (keeping existing)
const globalSearchData = {
  venues: [
    {
      id: 1,
      title: "Grand Ballroom",
      description: "Large venue for 500+ guests",
      location: "Downtown",
      price: "NPR 50,000/day",
    },
    {
      id: 2,
      title: "Conference Room A",
      description: "Meeting room for up to 20 people",
      location: "Business District",
      price: "NPR 5,000/day",
    },
  ],
  services: [
    {
      id: 1,
      title: "Wedding Planning",
      description: "Complete wedding coordination",
      category: "Wedding",
      price: "NPR 15,000",
    },
    {
      id: 2,
      title: "Catering Service",
      description: "Full meal service for events",
      category: "Food",
      price: "NPR 800/person",
    },
  ],
}

export default function Header({ hasNotifications = true, isLoggedIn = false, user = null, onLogout }) {
  // Always call hooks at the top
  const { user: sessionUser, isUserLoggedIn, logout, loading } = useUserSession()

  // State management
  const [recentSearches, setRecentSearches] = useState(["Grand Ballroom", "Wedding Planning", "Conference Room"])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false)
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { count: cartCount } = useCart()

  // Notification states
  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifError, setNotifError] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Helper to get userId from localStorage
  const getUserId = () => {
    return localStorage.getItem("userId")
  }

  // Helper to format notification time
  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? "s" : ""} ago`
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? "s" : ""} ago`
  }

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (notificationDropdownOpen && isUserLoggedIn) {
      const userId = getUserId()
      if (!userId) return

      setNotifLoading(true)
      setNotifError(null)

      notificationService
        .getUserNotifications(userId)
        .then((data) => {
          console.log("Fetched notifications:", data)
          setNotifications(Array.isArray(data) ? data : [])
        })
        .catch((err) => {
          console.error("Error fetching notifications:", err)
          setNotifError("Failed to load notifications")
        })
        .finally(() => setNotifLoading(false))
    }
  }, [notificationDropdownOpen, isUserLoggedIn])

  // Fetch unread count on component mount and periodically
  useEffect(() => {
    if (isUserLoggedIn) {
      const userId = getUserId()
      if (!userId) return

      const fetchUnreadCount = () => {
        notificationService
          .getUnreadCount(userId)
          .then((data) => {
            setUnreadCount(data.count || 0)
          })
          .catch((err) => {
            console.error("Error fetching unread count:", err)
          })
      }

      fetchUnreadCount()

      // Poll for unread count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [isUserLoggedIn])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest(".profile-container")) {
        setProfileDropdownOpen(false)
      }
      if (notificationDropdownOpen && !event.target.closest(".notification-container")) {
        setNotificationDropdownOpen(false)
      }
      if (searchDropdownOpen && !event.target.closest(".global-search-wrapper")) {
        setSearchDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [profileDropdownOpen, notificationDropdownOpen, searchDropdownOpen])

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMobileMenuOpen])

  if (loading) return null

  console.log("Header isLoggedIn:", isUserLoggedIn)

  // Event handlers
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLogout = async () => {
    try {
      logout()
      setProfileDropdownOpen(false)
      // Clear notification state on logout
      setNotifications([])
      setUnreadCount(0)
      window.location.href = "/login"
      console.log("Logged out successfully")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleSignInClick = () => {
    window.location.href = "/login"
  }

  const handleNavigation = (path) => {
    window.location.href = path
    setIsMobileMenuOpen(false)
  }

  // Notification handlers
  const handleMarkAllAsRead = async () => {
    const userId = getUserId()
    if (!userId) return

    try {
      await notificationService.markAllAsRead(userId)
      // Update local state to mark all as read
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })))
      setUnreadCount(0)
      console.log("All notifications marked as read")
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    const userId = getUserId()
    if (!userId) return

    try {
      await notificationService.markAsRead(notificationId, userId)
      // Update local state
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, status: "READ" } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
      console.log("Notification marked as read")
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleDeleteNotification = async (notificationId) => {
    const userId = getUserId()
    if (!userId) return

    try {
      await notificationService.deleteNotification(notificationId, userId)
      // Remove from local state
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      // Update unread count if it was unread
      const notification = notifications.find((n) => n.id === notificationId)
      if (notification && notification.status === "UNREAD") {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
      console.log("Notification deleted")
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const handleViewAllNotifications = () => {
    handleNavigation("/notifications")
  }

  // Search functionality (keeping existing)
  const handleGlobalSearch = (query, type = null) => {
    console.log("Global search:", query, type ? `in ${type}` : "")
    if (query && !recentSearches.includes(query)) {
      setRecentSearches((prev) => [query, ...prev.slice(0, 4)])
    }
    setSearchDropdownOpen(false)
    setSearchQuery("")
    if (type === "venues") {
      handleNavigation("/venues")
    } else {
      handleNavigation(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const removeRecentSearch = (searchTerm) => {
    setRecentSearches((prev) => prev.filter((term) => term !== searchTerm))
  }

  const filterGlobalResults = (query) => {
    if (!query.trim()) return null
    const results = {}
    const searchLower = query.toLowerCase()

    const venueResults = globalSearchData.venues.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.location.toLowerCase().includes(searchLower),
    )
    if (venueResults.length > 0) results.venues = venueResults.slice(0, 3)

    const serviceResults = globalSearchData.services.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower),
    )
    if (serviceResults.length > 0) results.services = serviceResults.slice(0, 3)

    return Object.keys(results).length > 0 ? results : null
  }

  const renderSearchComponent = () => {
    const searchResults = filterGlobalResults(searchQuery)
    return (
      <div className="global-search-wrapper">
        <button className="search-trigger-btn" onClick={() => setSearchDropdownOpen(!searchDropdownOpen)}>
          <SearchIcon />
        </button>
        <div className={`search-results-panel ${searchDropdownOpen ? "active" : ""}`}>
          <div className="search-input-section">
            <input
              type="text"
              placeholder="Search venues, services..."
              className="search-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleGlobalSearch(searchQuery)}
              autoFocus
            />
          </div>
          <div className="search-results-content">
            {searchQuery ? (
              searchResults ? (
                <>
                  {searchResults.venues && (
                    <div className="search-category">
                      <h4 className="search-category-header">Venues</h4>
                      {searchResults.venues.map((venue) => (
                        <button
                          key={venue.id}
                          className="search-option"
                          onClick={() => handleGlobalSearch(venue.title, "venues")}
                        >
                          <MapPinIcon className="search-option-icon" />
                          <div className="search-option-details">
                            <p className="search-option-title">{venue.title}</p>
                            <p className="search-option-desc">{venue.description}</p>
                            <p className="search-option-meta">
                              {venue.location} • {venue.price}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.services && (
                    <div className="search-category">
                      <h4 className="search-category-header">Services</h4>
                      {searchResults.services.map((service) => (
                        <button
                          key={service.id}
                          className="search-option"
                          onClick={() => handleGlobalSearch(service.title, "services")}
                        >
                          <ServiceIcon className="search-option-icon" />
                          <div className="search-option-details">
                            <p className="search-option-title">{service.title}</p>
                            <p className="search-option-desc">{service.description}</p>
                            <p className="search-option-meta">
                              {service.category} • {service.price}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="search-empty-state">No results found for "{searchQuery}"</div>
              )
            ) : (
              <>
                {recentSearches.length > 0 && (
                  <div className="search-category">
                    <h4 className="search-category-header">Recent Searches</h4>
                    {recentSearches.map((search, index) => (
                      <div key={index} className="search-option" onClick={() => handleGlobalSearch(search)}>
                        <div className="recent-search-entry">
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <ClockIcon className="search-option-icon" />
                            <span className="search-option-title">{search}</span>
                          </div>
                          <button
                            className="recent-search-delete"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeRecentSearch(search)
                            }}
                          >
                            <XIcon style={{ width: "12px", height: "12px" }} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="search-category">
                  <h4 className="search-category-header">Popular Venues</h4>
                  {globalSearchData.venues.map((venue) => (
                    <button
                      key={venue.id}
                      className="search-option"
                      onClick={() => handleGlobalSearch(venue.title, "venues")}
                    >
                      <MapPinIcon className="search-option-icon" />
                      <div className="search-option-details">
                        <p className="search-option-title">{venue.title}</p>
                        <p className="search-option-desc">{venue.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="search-actions-bar">
            <button className="search-view-all-btn" onClick={() => handleGlobalSearch(searchQuery || "all results")}>
              {searchQuery ? `See all results for "${searchQuery}"` : "View all categories"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <nav className="navbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", background: "#fff", borderBottom: "1px solid #e9ecef" }}>
      {/* Left: Brand */}
      <div className="navbar-left" style={{ display: "flex", alignItems: "center", gap: 10 }} onClick={() => handleNavigation("/home")}>
        <BrandLogo />
        <span style={{ color: "#1e7e34", fontWeight: 700, fontSize: 20, cursor: "pointer" }}>ThriftGood</span>
      </div>

      {/* Center: Nav items */}
      <div className="navbar-center" style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <span className="nav-link" style={{ cursor: "pointer" }} onClick={() => handleNavigation("/home")}>
          Home
        </span>
        <span className="nav-link" style={{ cursor: "pointer" }} onClick={() => handleNavigation("/venues")}>
          Shop
        </span>
        <span className="nav-link" style={{ cursor: "pointer" }} onClick={() => handleNavigation("/programs")}>
          Programs
        </span>
        <span className="nav-link" style={{ cursor: "pointer" }} onClick={() => handleNavigation("/donate")}>
          Donate
        </span>
      </div>

      {/* Right: Icons */}
      <div className="navbar-right" style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Notifications */}
        <div className="notification-container" style={{ position: "relative" }}>
          <button
            className="notification-icon"
            style={{ background: "transparent", border: 0, cursor: "pointer", position: "relative" }}
            onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span
                className="notification-badge"
                style={{ position: "absolute", top: -6, right: -6, background: "#dc3545", color: "#fff", fontSize: 10, width: 18, height: 18, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Existing dropdown retained */}
          <div className={`notification-dropdown ${notificationDropdownOpen ? "active" : ""}`}>
            <div className="notification-header">
              <h3 className="notification-title">Notifications</h3>
              {unreadCount > 0 && (
                <button className="mark-all-read" onClick={handleMarkAllAsRead}>
                  Mark all as read
                </button>
              )}
            </div>

            <div className="notification-list">
              {notifLoading ? (
                <div className="notification-loading">Loading notifications...</div>
              ) : notifError ? (
                <div className="no-notifications">{notifError}</div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.status === "UNREAD" ? "unread" : ""}`}
                    onClick={() => notification.status === "UNREAD" && handleMarkAsRead(notification.id)}
                  >
                    <div className={`notification-dot ${notification.status === "UNREAD" ? "blue" : "green"}`}></div>
                    <div className="notification-content">
                      <p className="notification-text">{notification.message || notification.title || notification.content}</p>
                      <p className="notification-time">{formatNotificationTime(notification.createdAt)}</p>
                    </div>
                    <button
                      className="notification-clear"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNotification(notification.id)
                      }}
                    >
                      <XIcon style={{ width: "12px", height: "12px" }} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-notifications">No new notifications</div>
              )}
            </div>

            <div className="notification-footer">
              <button className="view-all-button" onClick={handleViewAllNotifications}>
                View all notifications
              </button>
            </div>
          </div>
        </div>

        {/* Cart */}
        <button
          aria-label="Cart"
          onClick={() => handleNavigation("/cart")}
          style={{ background: "transparent", border: 0, cursor: "pointer", position: "relative" }}
        >
          {/* Reuse BellIcon as simple cart placeholder with small tweak: use existing MenuIcon as cart icon substitute would look odd; keep BellIcon for now if no cart icon present. */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="17" cy="21" r="1"></circle>
            <path d="M5 6h16l-1.5 9h-13z"></path>
            <path d="M5 6l-1-3H2"></path>
          </svg>
          {cartCount > 0 && (
            <span style={{ position: "absolute", top: -6, right: -6, background: "#74c044", color: "#fff", fontSize: 10, width: 18, height: 18, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {cartCount}
            </span>
          )}
        </button>

        {/* User icon */}
        {isUserLoggedIn ? (
          <div className="profile-container" style={{ position: "relative" }}>
            <button className="profile-icon" style={{ background: "transparent", border: 0, cursor: "pointer" }} onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
              <UserIcon />
            </button>
            <div className={`profile-dropdown ${profileDropdownOpen ? "active" : ""}`}>
              <button className="dropdown-item" onClick={() => handleNavigation("/profile/user")}>
                <ProfileMenuIcon />
                Profile
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={handleLogout}>
                <LogoutMenuIcon />
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button aria-label="Sign in" onClick={handleSignInClick} style={{ background: "transparent", border: 0, cursor: "pointer" }}>
              <UserIcon />
            </button>
            <button className="sign-in-button" onClick={handleSignInClick}>
              Sign In
            </button>
          </div>
        )}

        {/* Mobile menu button (kept for responsiveness) */}
        <button className="mobile-menu-button" onClick={toggleMobileMenu} style={{ background: "transparent", border: 0, cursor: "pointer" }}>
          {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile Menu (kept minimal) */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-menu-content">
          <div className="mobile-nav-links">
            <span className="mobile-nav-link" onClick={() => handleNavigation("/home")}>
              Home
            </span>
            <span className="mobile-nav-link" onClick={() => handleNavigation("/shop")}>
              Shop
            </span>
            <span className="mobile-nav-link" onClick={() => handleNavigation("/programs")}>
              Programs
            </span>
            <span className="mobile-nav-link" onClick={() => handleNavigation("/donate")}>
              Donate
            </span>
          </div>
          <div className="mobile-nav-divider"></div>
          <div className="mobile-nav-actions">
            {isUserLoggedIn ? (
              <div className="mobile-user-actions">
                <div className="mobile-action-row">
                  <button
                    className="mobile-action-btn"
                    onClick={() => {
                      setNotificationDropdownOpen(!notificationDropdownOpen)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <BellIcon />
                    <span>Notifications</span>
                    {unreadCount > 0 && <div className="notification-badge">{unreadCount}</div>}
                  </button>
                  <button className="mobile-action-btn" onClick={() => handleNavigation("/profile/user")}>
                    <UserIcon />
                    <span>Profile</span>
                  </button>
                </div>
                <button className="mobile-logout-btn" onClick={handleLogout}>
                  <LogoutMenuIcon />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button className="mobile-sign-in-button" onClick={handleSignInClick}>
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}
    </nav>
  )
}
