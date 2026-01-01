import React, { useEffect, useState, useRef } from 'react';
import { orderAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin/Booking.css';

const statusOptions = ["Pending", "Processing", "Shipped", "Completed", "Cancelled"];
const statusColors = {
  Pending: "#fff7b2",
  Processing: "#b2d1ff",
  Shipped: "#ffd1b2",
  Completed: "#b2ffb2",
  Cancelled: "#ffb2b2",
};
const statusTextColors = {
  Pending: "#b29a1a",
  Processing: "#1a4da1",
  Shipped: "#b25a1a",
  Completed: "#1a7f1a",
  Cancelled: "#a10000",
};

// Status badge colors matching the image
const statusBadgeColors = {
  Active: { bg: "#d1fae5", text: "#065f46" },
  Pending: { bg: "#fed7aa", text: "#9a3412" },
  Processing: { bg: "#dbeafe", text: "#1e40af" },
  Shipped: { bg: "#e0e7ff", text: "#3730a3" },
  Completed: { bg: "#d1fae5", text: "#065f46" },
  Cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

const Booking = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await orderAPI.listOrders();
        // Flatten orders - show individual orders instead of grouping by user
        const flattenedOrders = response.flatMap(order => {
          // If order has items, create one row per order
          return {
            ...order,
            // Get first item for display
            firstItem: order.items && order.items.length > 0 ? order.items[0] : null,
            // Get customer name from order
            customerName: order.userName || order.customerName || order.userEmail?.split('@')[0] || `User #${order.userId}`,
            // Format date
            formattedDate: order.createdAt || order.orderDate ? new Date(order.createdAt || order.orderDate).toLocaleDateString('en-GB') : 'N/A'
          };
        });
        // Sort by date (newest first)
        flattenedOrders.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.orderDate || 0);
          const dateB = new Date(b.createdAt || b.orderDate || 0);
          return dateB - dateA;
        });
        setOrders(flattenedOrders);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Calculate order statistics
  const orderStats = {
    all: orders.length,
    active: orders.filter(o => o.status === "Processing" || o.status === "Shipped" || o.status === "Completed").length,
    pending: orders.filter(o => o.status === "Pending").length,
    fraud: orders.filter(o => o.status === "Fraud" || false).length,
    cancelled: orders.filter(o => o.status === "Cancelled").length,
  };

  // Filter orders based on active tab and search
  const getFilteredOrders = () => {
    let filtered = orders;

    // Filter by status tab
    if (activeTab === "active") {
      filtered = filtered.filter(o => o.status === "Processing" || o.status === "Shipped" || o.status === "Completed");
    } else if (activeTab === "pending") {
      filtered = filtered.filter(o => o.status === "Pending");
    } else if (activeTab === "fraud") {
      filtered = filtered.filter(o => o.status === "Fraud");
    } else if (activeTab === "cancelled") {
      filtered = filtered.filter(o => o.status === "Cancelled");
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderId?.toString().toLowerCase().includes(searchLower) ||
        order.customerName?.toLowerCase().includes(searchLower) ||
        order.userEmail?.toLowerCase().includes(searchLower) ||
        order.firstItem?.venueName?.toLowerCase().includes(searchLower) ||
        order.firstItem?.productName?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  // Group orders by userId
  const groupOrdersByUserId = (ordersList) => {
    const grouped = {};
    ordersList.forEach(order => {
      const userId = order.userId || 'unknown';
      if (!grouped[userId]) {
        grouped[userId] = [];
      }
      grouped[userId].push(order);
    });
    return grouped;
  };

  const groupedOrders = groupOrdersByUserId(filteredOrders);

  // Toggle expand/collapse for a user group
  const toggleGroup = (userId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedGroups(newExpanded);
  };

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(new Set(filteredOrders.map(o => o.orderId)));
      setSelectAll(true);
    } else {
      setSelectedOrders(new Set());
      setSelectAll(false);
    }
  };

  // Handle individual checkbox
  const handleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
    setSelectAll(newSelected.size === filteredOrders.length);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderId === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Failed to update order status:", err);
      setError("Failed to update order status.");
    }
  };

  const handleViewOrder = (order) => {
    navigate(`/admin/orderdetail/${order.orderId}`);
  };

  // Get service/product name from order
  const getServiceName = (order) => {
    if (order.firstItem?.venueName) return order.firstItem.venueName;
    if (order.firstItem?.productName) return order.firstItem.productName;
    return "Product";
  };

  // Format payment status
  const getPaymentStatus = (order) => {
    if (!order.paymentMethod) return "Unpaid";
    const method = order.paymentMethod.toLowerCase();
    if (method.includes("mastercard")) return "Paid By Mastercard";
    if (method.includes("visa")) return "Paid By Visacard";
    if (method.includes("paypal")) return "Paid By Paypal";
    if (method.includes("esewa")) return "Paid By eSewa";
    if (method.includes("wise")) return "Paid By Wise";
    return `Paid By ${order.paymentMethod}`;
  };

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    const normalizedStatus = status === "Processing" || status === "Shipped" || status === "Completed" ? "Active" : status;
    const colors = statusBadgeColors[normalizedStatus] || statusBadgeColors.Pending;
    return {
      backgroundColor: colors.bg,
      color: colors.text,
      padding: "4px 12px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-block",
    };
  };

  return (
    <div className="manage-orders-container">
      {/* Header */}
      <div className="manage-orders-header">
        <div>
          <h1 className="manage-orders-title">Manage Orders</h1>
          <p className="manage-orders-subtitle">View all of you're Manage Orders</p>
        </div>
        <div className="header-actions">
          <button className="export-orders-btn">
            <span>📥</span> Export Orders
          </button>
        </div>
      </div>

      {/* Order Overview */}
      <div className="order-overview">
        <div className="overview-card">
          <div className="overview-label">Total Orders</div>
          <div className="overview-value">{orderStats.all}</div>
        </div>
        <div className="overview-card">
          <div className="overview-label">Active Orders</div>
          <div className="overview-value">{orderStats.active}</div>
        </div>
        <div className="overview-card">
          <div className="overview-label">Pending Orders</div>
          <div className="overview-value">{orderStats.pending}</div>
        </div>
        <div className="overview-card">
          <div className="overview-label">Cancelled Orders</div>
          <div className="overview-value">{orderStats.cancelled}</div>
        </div>
        <div className="overview-card">
          <div className="overview-label">Total Revenue</div>
          <div className="overview-value">
            NPR {orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="status-tabs">
        <button
          className={`status-tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Orders <span className="tab-count">{orderStats.all}</span>
        </button>
        <button
          className={`status-tab ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active Orders <span className="tab-count">{orderStats.active}</span>
        </button>
        <button
          className={`status-tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Orders <span className="tab-count">{orderStats.pending}</span>
        </button>
        {orderStats.fraud > 0 && (
          <button
            className={`status-tab ${activeTab === "fraud" ? "active" : ""}`}
            onClick={() => setActiveTab("fraud")}
          >
            Fraud Orders <span className="tab-count">{orderStats.fraud}</span>
          </button>
        )}
        <button
          className={`status-tab ${activeTab === "cancelled" ? "active" : ""}`}
          onClick={() => setActiveTab("cancelled")}
        >
          Cancelled Orders <span className="tab-count">{orderStats.cancelled}</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-filters-section">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search for Orders"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button className="date-filter-btn">
            <span>📅</span> {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} - {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
          </button>
          <button className="filters-btn">
            <span>⚙️</span> Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        {loading && <div className="loading-message">Loading orders...</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && (
          <table className="orders-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="table-checkbox"
                  />
                </th>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Service Name</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedOrders).length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-orders">
                    No orders found
                  </td>
                </tr>
              ) : (
                Object.entries(groupedOrders).map(([userId, userOrders]) => {
                  // Sort orders by date (newest first)
                  const sortedOrders = [...userOrders].sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.orderDate || 0);
                    const dateB = new Date(b.createdAt || b.orderDate || 0);
                    return dateB - dateA;
                  });
                  const latestOrder = sortedOrders[0];
                  const isExpanded = expandedGroups.has(userId);
                  const hasMultipleOrders = sortedOrders.length > 1;

                  return (
                    <React.Fragment key={userId}>
                      {/* Main Row - Shows latest order or summary */}
                      <tr className={hasMultipleOrders ? "group-header-row" : ""}>
                        <td>
                          {hasMultipleOrders && (
                            <button
                              className="expand-toggle-btn"
                              onClick={() => toggleGroup(userId)}
                              aria-label={isExpanded ? "Collapse orders" : "Expand orders"}
                            >
                              {isExpanded ? "▼" : "▶"}
                            </button>
                          )}
                          {!hasMultipleOrders && (
                            <input
                              type="checkbox"
                              checked={selectedOrders.has(latestOrder.orderId)}
                              onChange={() => handleSelectOrder(latestOrder.orderId)}
                              className="table-checkbox"
                            />
                          )}
                        </td>
                        <td className="order-id-cell">
                          {latestOrder.orderId}
                          {hasMultipleOrders && (
                            <span className="order-count-badge">({sortedOrders.length})</span>
                          )}
                        </td>
                        <td>{latestOrder.customerName}</td>
                        <td>
                          {hasMultipleOrders ? (
                            <span className="multiple-items-indicator">
                              {sortedOrders.length} items
                            </span>
                          ) : (
                            getServiceName(latestOrder)
                          )}
                        </td>
                        <td>{latestOrder.formattedDate}</td>
                        <td className="amount-cell">
                          {hasMultipleOrders ? (
                            <span className="total-amount">
                              NPR {sortedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}
                            </span>
                          ) : (
                            `NPR ${latestOrder.totalAmount?.toLocaleString() || 0}`
                          )}
                        </td>
                        <td className="payment-status-cell">{getPaymentStatus(latestOrder)}</td>
                        <td>
                          <span style={getStatusBadgeStyle(latestOrder.status || "Pending")}>
                            {latestOrder.status === "Processing" || latestOrder.status === "Shipped" || latestOrder.status === "Completed" ? "Active" : (latestOrder.status || "Pending")}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <select
                              value={latestOrder.status || "Pending"}
                              onChange={(e) => handleStatusChange(latestOrder.orderId, e.target.value)}
                              disabled={latestOrder.status === "Cancelled"}
                              className="status-select"
                              style={{
                                backgroundColor: statusColors[latestOrder.status] || "#fff",
                                color: statusTextColors[latestOrder.status] || "#000",
                              }}
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                            <button
                              className="view-details-btn"
                              onClick={() => handleViewOrder(latestOrder)}
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Rows - Show all orders for this user */}
                      {isExpanded && hasMultipleOrders && sortedOrders.map((order, index) => (
                        <tr key={`${userId}-${order.orderId}`} className="expanded-order-row">
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedOrders.has(order.orderId)}
                              onChange={() => handleSelectOrder(order.orderId)}
                              className="table-checkbox"
                            />
                          </td>
                          <td className="order-id-cell">{order.orderId}</td>
                          <td>{order.customerName}</td>
                          <td>{getServiceName(order)}</td>
                          <td>{order.formattedDate}</td>
                          <td className="amount-cell">NPR {order.totalAmount?.toLocaleString() || 0}</td>
                          <td className="payment-status-cell">{getPaymentStatus(order)}</td>
                          <td>
                            <span style={getStatusBadgeStyle(order.status || "Pending")}>
                              {order.status === "Processing" || order.status === "Shipped" || order.status === "Completed" ? "Active" : (order.status || "Pending")}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <select
                                value={order.status || "Pending"}
                                onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                                disabled={order.status === "Cancelled"}
                                className="status-select"
                                style={{
                                  backgroundColor: statusColors[order.status] || "#fff",
                                  color: statusTextColors[order.status] || "#000",
                                }}
                              >
                                {statusOptions.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                              <button
                                className="view-details-btn"
                                onClick={() => handleViewOrder(order)}
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Booking;
