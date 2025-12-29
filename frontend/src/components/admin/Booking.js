import React, { useEffect, useState, useRef } from 'react';
import { orderAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin/Booking.css'; // reuse your booking table styles

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

const Booking = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await orderAPI.listOrders(); // Admin can fetch all orders
        setOrders(response);
        console.log("Fetched orders:", response);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Group orders by userId so we can show one row per user and expand to see all their orders
  const groupedByUser = orders.reduce((acc, order) => {
    const key = order.userId || "unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {});

  const toggleUserExpand = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
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

  return (
    <div className="booking-management-container">
      <div className="booking-header">
        <h2>All Orders (Admin)</h2>
      </div>

      <div className="booking-table-container">
        {loading && <p>Loading orders...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && (
          <table className="booking-table">
            <thead>
              <tr>
                <th></th>
                <th>User ID</th>
                <th>Email</th>
                <th>Delivery Address (latest)</th>
                <th>Latest Order ID</th>
                <th>Total Orders</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedByUser).map(([userId, userOrders]) => {
                // Sort user's orders by some sense of recency (assuming higher orderId is newer)
                const sorted = [...userOrders].sort(
                  (a, b) => (b.orderId || 0) - (a.orderId || 0)
                );
                const latest = sorted[0];
                const isExpanded = !!expandedUsers[userId];

                return (
                  <React.Fragment key={userId}>
                    <tr>
                      <td>
                        <button
                          onClick={() => toggleUserExpand(userId)}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                          aria-label={isExpanded ? "Collapse orders" : "Expand orders"}
                        >
                          {isExpanded ? "▼" : "▶"}
                        </button>
                      </td>
                      <td>{userId}</td>
                      <td>{latest.userEmail}</td>
                      <td>{latest.address || "N/A"}</td>
                      <td>{latest.orderId}</td>
                      <td>{userOrders.length}</td>
                      <td>
                        <button onClick={() => handleViewOrder(latest)}>
                          View Latest Order
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan={7}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr>
                                <th>Order ID</th>
                                <th>Total Amount</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Items</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sorted.map((order) => (
                                <tr key={order.orderId}>
                                  <td>{order.orderId}</td>
                                  <td>NPR {order.totalAmount?.toLocaleString()}</td>
                                  <td>{order.paymentMethod}</td>
                                  <td>
                                    <select
                                      value={order.status || "Pending"}
                                      onChange={(e) =>
                                        handleStatusChange(order.orderId, e.target.value)
                                      }
                                      disabled={order.status === "Cancelled"} // can't change cancelled
                                      style={{
                                        padding: "6px 10px",
                                        borderRadius: "4px",
                                        border: "1px solid #ddd",
                                        fontSize: "14px",
                                        cursor:
                                          order.status === "Cancelled"
                                            ? "not-allowed"
                                            : "pointer",
                                        backgroundColor:
                                          statusColors[order.status] || "#fff",
                                        color: statusTextColors[order.status] || "#000",
                                        minWidth: "120px",
                                      }}
                                    >
                                      {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                          {status}
                                        </option>
                                      ))}
                                    </select>
                                    {order.status === "Cancelled" && (
                                      <span
                                        style={{
                                          marginLeft: "8px",
                                          color: "#a10000",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        Cancelled by user
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    <ul>
                                      {order.items?.map((item) => (
                                        <li
                                          key={item.id}
                                          style={{ marginBottom: "5px" }}
                                        >
                                          {item.venueName && (
                                            <strong>{item.venueName}</strong>
                                          )}
                                          {item.imageUrl && (
                                            <img
                                              src={item.imageUrl}
                                              alt={item.venueName}
                                              style={{
                                                width: 50,
                                                height: 50,
                                                marginLeft: 5,
                                                objectFit: "cover",
                                                borderRadius: 4,
                                              }}
                                            />
                                          )}
                                          <span>
                                            {" "}
                                            - Qty: {item.quantity}, Price: NPR{" "}
                                            {item.price}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </td>
                                  <td>
                                    <button onClick={() => handleViewOrder(order)}>
                                      View Details
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Booking;
