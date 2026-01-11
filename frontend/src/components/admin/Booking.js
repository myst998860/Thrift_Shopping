import React, { useEffect, useState, useRef } from 'react';
import { orderAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiCalendar,
  FiEye,
  FiMoreVertical,
  FiFilter,
  FiChevronDown,
  FiChevronRight,
  FiShoppingBag,
  FiUser,
  FiCreditCard,
  FiMoreHorizontal,
  FiArrowRight,
  FiX
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import '../../styles/admin/Booking.css';

const statusOptions = ["Pending", "Processing", "Shipped", "Completed", "Cancelled"];

// Premium design colors (No Green)
const premiumStatusStyles = {
  Pending: { bg: '#FFF9E5', text: '#B7791F', dot: '#F6AD55' }, // Amber
  Processing: { bg: '#EBF8FF', text: '#2B6CB0', dot: '#4299E1' }, // Blue
  Shipped: { bg: '#FAF5FF', text: '#6B46C1', dot: '#9F7AEA' }, // Purple
  Completed: { bg: '#F0F5FF', text: '#1E3A8A', dot: '#3B82F6' }, // Deep Blue (Success instead of green)
  Cancelled: { bg: '#FFF5F5', text: '#C53030', dot: '#F56565' }, // Red
  Default: { bg: '#F7FAFC', text: '#4A5568', dot: '#CBD5E0' }    // Gray
};

const statusFlow = {
  Pending: ["Pending", "Processing", "Cancelled"],
  Processing: ["Processing", "Shipped", "Cancelled"],
  Shipped: ["Shipped", "Completed", "Cancelled"],
  Completed: ["Completed"],
  Cancelled: ["Cancelled"]
};

const Booking = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.listOrders();
      const flattenedOrders = response.flatMap(order => ({
        ...order,
        customerName: order.userName || order.customerName || order.userEmail?.split('@')[0] || `User #${order.userId}`,
        formattedDate: order.createdAt || order.orderDate ? new Date(order.createdAt || order.orderDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }) : 'N/A'
      }));

      flattenedOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.orderDate || 0);
        const dateB = new Date(b.createdAt || b.orderDate || 0);
        return dateB - dateA;
      });

      setOrders(flattenedOrders);
    } catch (err) {
      console.error(err);
      setError("Unable to synchronize with server.");
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    if (activeTab === "active") {
      filtered = filtered.filter(o => ["Processing", "Shipped", "Completed"].includes(o.status));
    } else if (activeTab === "pending") {
      filtered = filtered.filter(o => o.status === "Pending");
    } else if (activeTab === "cancelled") {
      filtered = filtered.filter(o => o.status === "Cancelled");
    }

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.orderId?.toString().includes(s) ||
        o.customerName?.toLowerCase().includes(s) ||
        o.userEmail?.toLowerCase().includes(s)
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(o => new Date(o.createdAt || o.orderDate) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(o => new Date(o.createdAt || o.orderDate) <= end);
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  const groupOrders = (list) => {
    const grouped = {};
    list.forEach(o => {
      const id = o.userId || 'guest';
      if (!grouped[id]) grouped[id] = [];
      grouped[id].push(o);
    });
    return grouped;
  };

  const groupedOrders = groupOrders(filteredOrders);

  const toggleGroup = (userId) => {
    const next = new Set(expandedGroups);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    setExpandedGroups(next);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
      toast.info(`Order #${orderId} marked as ${newStatus}`);
    } catch (err) {
      toast.error("Status update failed.");
    }
  };

  const getStatusStyle = (status) => premiumStatusStyles[status] || premiumStatusStyles.Default;

  const getPaymentLabel = (method) => {
    if (!method) return "Manual Pay";
    const m = method.toLowerCase();
    if (m.includes("esewa")) return "eSewa Verified";
    if (m.includes("khalti")) return "Khalti Verified";
    if (m.includes("card")) return "Card Payment";
    return method;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="booking-modern-loader">
        <div className="premium-spinner"></div>
        <p>Orchestrating order data...</p>
      </div>
    );
  }

  return (
    <div className="bookings-modern-container">
      <header className="bookings-header-premium">
        <div className="header-left">
          <h1>Universal Orders</h1>
          <p>Supervise and manage global order transactions</p>
        </div>
        <div className="header-right">
          <button className="refresh-btn-modern" onClick={fetchOrders}>
            <FiMoreHorizontal /> Refresh Sync
          </button>
        </div>
      </header>

      <section className="bookings-stats-grid">
        <div className="stat-card-modern">
          <div className="stat-icon-wrapper blue"><FiShoppingBag /></div>
          <div className="stat-content">
            <label>Total Orders</label>
            <h3>{orders.length}</h3>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon-wrapper amber"><FiCalendar /></div>
          <div className="stat-content">
            <label>Pending Reviews</label>
            <h3>{orders.filter(o => o.status === "Pending").length}</h3>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon-wrapper purple"><FiCreditCard /></div>
          <div className="stat-content">
            <label>Net Revenue</label>
            <h3>NPR {orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}</h3>
          </div>
        </div>
      </section>

      <div className="bookings-table-actions">
        <div className="tab-switcher-modern">
          <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>All Transactions</button>
          <button className={activeTab === "active" ? "active" : ""} onClick={() => setActiveTab("active")}>Active</button>
          <button className={activeTab === "pending" ? "active" : ""} onClick={() => setActiveTab("pending")}>Pending</button>
          <button className={activeTab === "cancelled" ? "active" : ""} onClick={() => setActiveTab("cancelled")}>Cancelled</button>
        </div>

        <div className="table-controls-modern">
          <div className="search-bar-modern">
            <FiSearch />
            <input
              placeholder="Query by Order ID, Name or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={`filter-toggle-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
            <FiFilter /> {showFilters ? 'Hide Filters' : 'Advanced'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="advanced-filters-panel">
          <div className="date-range-modern">
            <label>From Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="date-range-modern">
            <label>To Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button className="reset-filters-anchor" onClick={() => { setStartDate(''); setEndDate(''); }}>Reset Filters</button>
        </div>
      )}

      <div className="premium-table-wrapper">
        <table className="bookings-modern-table">
          <thead>
            <tr>
              <th width="40"></th>
              <th>Order Identity</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Transaction</th>
              <th>Status</th>
              <th>Fulfillment</th>
              <th width="80">Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedOrders).length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-table-state">
                  <FiShoppingBag size={48} />
                  <p>No transactions found matching your criteria.</p>
                </td>
              </tr>
            ) : (
              Object.entries(groupedOrders)
                .sort(([, a], [, b]) => new Date(b[0]?.createdAt || 0) - new Date(a[0]?.createdAt || 0))
                .map(([userId, userOrders]) => {
                  const sorted = [...userOrders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                  const latest = sorted[0];
                  const isExp = expandedGroups.has(userId);
                  const isGroup = sorted.length > 1;

                  return (
                    <React.Fragment key={userId}>
                      <tr className={`main-row ${isExp ? 'is-expanded' : ''} ${isGroup ? 'has-group' : ''}`}>
                        <td className="expand-cell">
                          {isGroup && (
                            <button onClick={() => toggleGroup(userId)} className="toggle-trigger">
                              {isExp ? <FiChevronDown /> : <FiChevronRight />}
                            </button>
                          )}
                        </td>
                        <td className="id-cell">
                          <span className="order-id-chip">#{latest.orderId}</span>
                          {isGroup && <span className="group-count">+{sorted.length - 1} more</span>}
                        </td>
                        <td className="customer-cell">
                          <div className="customer-info-modern">
                            <div className="customer-avatar-mini">{latest.customerName[0]}</div>
                            <div className="customer-text">
                              <span className="name">{latest.customerName}</span>
                              <span className="email">{latest.userEmail}</span>
                            </div>
                          </div>
                        </td>
                        <td className="date-cell">{latest.formattedDate}</td>
                        <td className="amount-cell">
                          <span className="currency">NPR</span>
                          <span className="value">{(isGroup ? sorted.reduce((s, o) => s + (o.totalAmount || 0), 0) : latest.totalAmount)?.toLocaleString()}</span>
                          <span className="pm-method">{getPaymentLabel(latest.paymentMethod)}</span>
                        </td>
                        <td className="status-cell">
                          <div className="status-badge-modern" style={{ backgroundColor: getStatusStyle(latest.status).bg, color: getStatusStyle(latest.status).text }}>
                            <span className="status-dot" style={{ backgroundColor: getStatusStyle(latest.status).dot }}></span>
                            {latest.status || 'Pending'}
                          </div>
                        </td>
                        <td className="action-cell-fulfillment">
                          <select
                            className="modern-status-select"
                            value={latest.status || 'Pending'}
                            onChange={(e) => handleStatusUpdate(latest.orderId, e.target.value)}
                            disabled={latest.status === 'Cancelled'}
                          >
                            {(statusFlow[latest.status || 'Pending'] || [latest.status || 'Pending']).map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </td>
                        <td className="actions-cell">
                          <button className="view-btn-circle" title="View Details" onClick={() => navigate(`/admin/orderdetail/${latest.orderId}`)}>
                            <FiArrowRight />
                          </button>
                        </td>
                      </tr>

                      {isExp && sorted.map((order, idx) => (
                        <tr key={order.orderId} className={`nested-row ${idx === sorted.length - 1 ? 'last-nested' : ''}`}>
                          <td colSpan="1"></td>
                          <td className="id-cell">
                            <span className="order-id-chip sub">#{order.orderId}</span>
                          </td>
                          <td className="customer-cell opacity-50">
                            <span className="sub-text">Sub-order entry</span>
                          </td>
                          <td className="date-cell">{order.formattedDate}</td>
                          <td className="amount-cell">
                            <span className="value">{order.totalAmount?.toLocaleString()}</span>
                          </td>
                          <td className="status-cell">
                            <div className="status-badge-modern mini" style={{ backgroundColor: getStatusStyle(order.status).bg, color: getStatusStyle(order.status).text }}>
                              <span className="status-dot" style={{ backgroundColor: getStatusStyle(order.status).dot }}></span>
                              {order.status}
                            </div>
                          </td>
                          <td className="action-cell-fulfillment">
                            <select
                              className="modern-status-select mini"
                              value={order.status || 'Pending'}
                              onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                            >
                              {(statusFlow[order.status || 'Pending'] || [order.status || 'Pending']).map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </td>
                          <td className="actions-cell">
                            <button className="view-btn-link" onClick={() => navigate(`/admin/orderdetail/${order.orderId}`)}>
                              <FiEye />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Booking;
