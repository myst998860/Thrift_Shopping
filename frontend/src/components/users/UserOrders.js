import { useState, useEffect } from "react";
import { orderAPI } from "../../services/api";

const TABS = ["All", "To Pay", "To Ship", "To Receive", "To Review"];

// Map backend order status to high‑level tab category
const getStatusCategory = (status = "") => {
  const s = String(status).toLowerCase();

  if (s.includes("pending") || s.includes("unpaid")) return "To Pay";
  if (s.includes("processing") || s.includes("confirmed") || s.includes("toship"))
    return "To Ship";
  if (s.includes("shipped") || s.includes("out for delivery") || s.includes("toreceive"))
    return "To Receive";
  if (s.includes("delivered") || s.includes("completed")) return "To Review";

  // Cancelled or any other statuses will only show under "All"
  return "All";
};

const getStatusBadgeStyle = (status = "") => {
  const s = String(status).toLowerCase();

  if (s.includes("completed") || s.includes("delivered")) {
    return { backgroundColor: "#e6f4ea", color: "#256029" };
  }
  if (s.includes("cancelled")) {
    return { backgroundColor: "#fdecea", color: "#a4262c" };
  }
  if (s.includes("pending") || s.includes("processing")) {
    return { backgroundColor: "#fff4e5", color: "#8a4b08" };
  }
  if (s.includes("shipped")) {
    return { backgroundColor: "#e5f1ff", color: "#1f4fbf" };
  }

  return { backgroundColor: "#f2f4f7", color: "#344054" };
};

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const userId = parseInt(localStorage.getItem("userId"), 10);

  const fetchOrders = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await orderAPI.getUserOrders(userId);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Optionally, you can poll every 10 seconds for real-time updates
    // const interval = setInterval(fetchOrders, 10000);
    // return () => clearInterval(interval);
  }, [userId]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await orderAPI.updateOrderStatus(orderId, "Cancelled");
      fetchOrders(); // re-fetch after updating status
      alert("Order cancelled successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to cancel the order.");
    }
  };

  if (!userId) return <p>Please login to see your orders.</p>;
  if (loading) return <p>Loading orders...</p>;
  if (!orders.length) return <p>No orders found.</p>;

  // Apply status tab filter + search filter
  const filteredOrders = orders.filter((order) => {
    const category = getStatusCategory(order.status);

    if (activeTab !== "All" && category !== activeTab) return false;

    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const inId = String(order.orderId).toLowerCase().includes(term);
    const inItems = (order.items || []).some((item) => {
      const name = (item.venueName || item.productName || "").toLowerCase();
      return name.includes(term);
    });

    return inId || inItems;
  });

  return (
    <div
      style={{
        padding: "100px 16px 48px",
        maxWidth: 1000,
        margin: "0 auto",
        backgroundColor: "#ffffffff",
        minHeight: "100vh",
      }}
    >
      <h2
        style={{
          fontSize: 24,
          fontWeight: 600,
          marginBottom: 16,
          color: "#1f2933",
        }}
      >
        My Orders
      </h2>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 24,
          borderBottom: "1px solid #e5e7eb",
          marginBottom: 16,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 0",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: activeTab === tab ? 600 : 500,
              color: activeTab === tab ? "#2563eb" : "#4b5563",
              position: "relative",
            }}
          >
            {tab}
            {activeTab === tab && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: -1,
                  height: 2,
                  backgroundColor: "#2563eb",
                  borderRadius: 999,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by product name or order ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 600,
            padding: "10px 36px 10px 12px",
            borderRadius: 999,
            border: "1px solid #d1d5db",
            outline: "none",
            fontSize: 14,
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          }}
        />
      </div>

      {/* Order list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredOrders.map((order) => {
          const firstItem = (order.items || [])[0] || {};
          const sellerName = firstItem.venueName || firstItem.sellerName || "Seller";
          const badgeStyle = getStatusBadgeStyle(order.status);

          return (
            <div
              key={order.orderId}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 4px rgba(15,23,42,0.04)",
                padding: 16,
              }}
            >
              {/* Card header: seller + status badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 600,
                    color: "#111827",
                    fontSize: 14,
                  }}
                >
                  {/* <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: "1px solid #e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                    }}
                  >
                    🛍
                  </span> */}
                  {/* <span>{sellerName}</span> */}
                </div>

                <span
                  style={{
                    ...badgeStyle,
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {order.status}
                </span>
              </div>

              {/* Main content row */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                }}
              >
                <img
                  src={
                    firstItem.venueId
                      ? `/proxy/image?venue_id=${firstItem.venueId}`
                      : "/placeholder.png"
                  }
                  alt={firstItem.venueName || "Product image"}
                  style={{
                    width: 90,
                    height: 90,
                    objectFit: "cover",
                    borderRadius: 6,
                    backgroundColor: "#f3f4f6",
                  }}
                />

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 4,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#111827",
                        marginBottom: 2,
                      }}
                    >
                      {firstItem.venueName || firstItem.productName || "Product"}
                    </div>
                    {firstItem.color && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        Color: {firstItem.color}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        marginTop: 2,
                      }}
                    >
                      Qty: {firstItem.quantity}{" "}
                      {order.items && order.items.length > 1
                        ? `+ ${order.items.length - 1} more item(s)`
                        : ""}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 6,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#111827",
                        fontSize: 14,
                      }}
                    >
                      NPR {order.totalAmount?.toLocaleString()}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                      }}
                    >
                      Order #{order.orderId}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                {order.status.toLowerCase() !== "cancelled" && (
                  <button
                    onClick={() => handleCancelOrder(order.orderId)}
                    style={{
                      padding: "8px 12px",
                      background: "#f97373",
                      color: "#fff",
                      border: "none",
                      borderRadius: 999,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {!filteredOrders.length && (
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            No orders found for this filter.
          </p>
        )}
      </div>
    </div>
  );
}
