import { useState, useEffect } from "react";
import { orderAPI } from "../../services/api";

const TABS = ["All", "To Pay", "To Ship", "To Receive", "To Review"];

// Tracking stages
const TRACKING_STAGES = [
  { id: "placed", label: "Order Placed", icon: "📦" },
  { id: "topay", label: "Payment Pending", icon: "💳" },
  { id: "toship", label: "Processing", icon: "🏭" },
  { id: "toreceive", label: "Shipped", icon: "🚚" },
  { id: "toreview", label: "Delivered", icon: "✅" },
];

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
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

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

  // Calculate counts for each tab
  const getTabCounts = () => {
    const counts = {
      All: orders.length,
      "To Pay": 0,
      "To Ship": 0,
      "To Receive": 0,
      "To Review": 0,
    };

    orders.forEach((order) => {
      const category = getStatusCategory(order.status);
      if (category !== "All" && counts.hasOwnProperty(category)) {
        counts[category]++;
      }
    });

    return counts;
  };

  // Get current tracking stage based on order status
  const getCurrentTrackingStage = (status = "") => {
    const s = String(status).toLowerCase();
    if (s.includes("pending") || s.includes("unpaid")) return "topay";
    if (s.includes("processing") || s.includes("confirmed") || s.includes("toship"))
      return "toship";
    if (s.includes("shipped") || s.includes("out for delivery") || s.includes("toreceive"))
      return "toreceive";
    if (s.includes("delivered") || s.includes("completed")) return "toreview";
    return "placed";
  };

  const tabCounts = getTabCounts();

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
            {tab !== "All" && (
              <span
                style={{
                  marginLeft: 6,
                  padding: "2px 6px",
                  borderRadius: 10,
                  backgroundColor: activeTab === tab ? "#dbeafe" : "#e5e7eb",
                  color: activeTab === tab ? "#2563eb" : "#6b7280",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {tabCounts[tab]}
              </span>
            )}
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
                  <>
                    {!order.status.toLowerCase().includes("completed") &&
                      !order.status.toLowerCase().includes("delivered") && (
                        <>
                          <button
                            onClick={() => setTrackingOrder(order)}
                            style={{
                              padding: "8px 12px",
                              background: "#2563eb",
                              color: "#fff",
                              border: "none",
                              borderRadius: 999,
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 500,
                            }}
                          >
                            Track My Order
                          </button>
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
                        </>
                      )}
                    {(order.status.toLowerCase().includes("completed") ||
                      order.status.toLowerCase().includes("delivered")) && (
                        <button
                          onClick={() => setViewingProduct(order)}
                          style={{
                            padding: "8px 12px",
                            background: "#10b981",
                            color: "#fff",
                            border: "none",
                            borderRadius: 999,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        >
                          View Product
                        </button>
                      )}
                  </>
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

      {/* Tracking Modal */}
      {trackingOrder && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setTrackingOrder(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 12,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              maxWidth: 600,
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "24px 24px 16px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                Track Order #{trackingOrder.orderId}
              </h3>
              <button
                onClick={() => setTrackingOrder(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 28,
                  color: "#6b7280",
                  cursor: "pointer",
                  padding: 0,
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "none";
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24 }}>
              {/* Order Summary */}
              <div
                style={{
                  marginBottom: 24,
                  padding: 16,
                  background: "#f9fafb",
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111827",
                    marginBottom: 12,
                  }}
                >
                  Order Summary
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                  <div>
                    <strong>Total Amount:</strong> NPR{" "}
                    {trackingOrder.totalAmount?.toLocaleString()}
                  </div>
                  <div>
                    <strong>Items:</strong> {trackingOrder.items?.length || 0} item(s)
                  </div>
                  <div>
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        ...getStatusBadgeStyle(trackingOrder.status),
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "capitalize",
                        display: "inline-block",
                      }}
                    >
                      {trackingOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tracking Progress */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#111827",
                    marginBottom: 20,
                  }}
                >
                  Order Tracking
                </div>

                <div style={{ position: "relative", paddingLeft: 40 }}>
                  {/* Vertical Line */}
                  <div
                    style={{
                      position: "absolute",
                      left: 15,
                      top: 20,
                      bottom: 20,
                      width: 2,
                      background: "#e5e7eb",
                    }}
                  />

                  {/* Tracking Stages */}
                  {TRACKING_STAGES.map((stage, index) => {
                    const currentStage = getCurrentTrackingStage(trackingOrder.status);
                    const stageIndex = TRACKING_STAGES.findIndex(
                      (s) => s.id === currentStage
                    );
                    const isCompleted = index <= stageIndex;
                    const isCurrent = index === stageIndex;

                    return (
                      <div
                        key={stage.id}
                        style={{
                          position: "relative",
                          marginBottom: index < TRACKING_STAGES.length - 1 ? 32 : 0,
                        }}
                      >
                        {/* Stage Circle */}
                        <div
                          style={{
                            position: "absolute",
                            left: -32,
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: isCompleted ? "#2563eb" : "#e5e7eb",
                            border: `3px solid ${
                              isCompleted ? "#2563eb" : "#ffffff"
                            }`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            zIndex: 1,
                            boxShadow: isCurrent
                              ? "0 0 0 4px rgba(37, 99, 235, 0.1)"
                              : "none",
                          }}
                        >
                          {isCompleted ? (
                            <span style={{ fontSize: 14 }}>✓</span>
                          ) : (
                            <span>{stage.icon}</span>
                          )}
                        </div>

                        {/* Stage Content */}
                        <div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: isCurrent ? 600 : 500,
                              color: isCompleted ? "#111827" : "#9ca3af",
                              marginBottom: 4,
                            }}
                          >
                            {stage.label}
                          </div>
                          {isCurrent && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "#2563eb",
                                fontWeight: 500,
                              }}
                            >
                              Current Status
                            </div>
                          )}
                          {isCompleted && !isCurrent && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "#6b7280",
                              }}
                            >
                              Completed
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Estimated Delivery */}
              {getCurrentTrackingStage(trackingOrder.status) === "toreceive" && (
                <div
                  style={{
                    padding: 16,
                    background: "#eff6ff",
                    borderRadius: 8,
                    border: "1px solid #bfdbfe",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1e40af",
                      marginBottom: 4,
                    }}
                  >
                    📦 Your order is on the way!
                  </div>
                  <div style={{ fontSize: 12, color: "#1e40af" }}>
                    Expected delivery: 3-5 business days
                  </div>
                </div>
              )}

              {getCurrentTrackingStage(trackingOrder.status) === "toreview" && (
                <div
                  style={{
                    padding: 16,
                    background: "#f0fdf4",
                    borderRadius: 8,
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#166534",
                      marginBottom: 4,
                    }}
                  >
                    ✅ Your order has been delivered!
                  </div>
                  <div style={{ fontSize: 12, color: "#166534" }}>
                    Please review your order and rate your experience.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setTrackingOrder(null)}
                style={{
                  padding: "10px 24px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#1d4ed8";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#2563eb";
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {viewingProduct && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setViewingProduct(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 12,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              maxWidth: 600,
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "24px 24px 16px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                Product Details
              </h3>
              <button
                onClick={() => setViewingProduct(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 28,
                  color: "#6b7280",
                  cursor: "pointer",
                  padding: 0,
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "none";
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24 }}>
              {viewingProduct.items && viewingProduct.items.length > 0 ? (
                viewingProduct.items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: index < viewingProduct.items.length - 1 ? 24 : 0,
                      paddingBottom: index < viewingProduct.items.length - 1 ? 24 : 0,
                      borderBottom:
                        index < viewingProduct.items.length - 1
                          ? "1px solid #e5e7eb"
                          : "none",
                    }}
                  >
                    {/* Product Image */}
                    <div
                      style={{
                        marginBottom: 16,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={
                          item.venueId
                            ? `/proxy/image?venue_id=${item.venueId}`
                            : "/placeholder.png"
                        }
                        alt={item.venueName || item.productName || "Product"}
                        style={{
                          width: "100%",
                          maxWidth: 300,
                          height: 300,
                          objectFit: "cover",
                          borderRadius: 8,
                          backgroundColor: "#f3f4f6",
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#6b7280",
                            marginBottom: 4,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          Product Name
                        </div>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 600,
                            color: "#111827",
                          }}
                        >
                          {item.venueName || item.productName || "N/A"}
                        </div>
                      </div>

                      {item.brand && (
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#6b7280",
                              marginBottom: 4,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            Brand
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#111827",
                            }}
                          >
                            {item.brand}
                          </div>
                        </div>
                      )}

                      {(item.size || item.dimensions) && (
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#6b7280",
                              marginBottom: 4,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            Size
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#111827",
                            }}
                          >
                            {item.size || item.dimensions || "N/A"}
                          </div>
                        </div>
                      )}

                      {item.color && (
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#6b7280",
                              marginBottom: 4,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            Color
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#111827",
                            }}
                          >
                            {item.color}
                          </div>
                        </div>
                      )}

                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#6b7280",
                            marginBottom: 4,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          Price
                        </div>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 600,
                            color: "#2563eb",
                          }}
                        >
                          NPR {(item.price || 0).toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#6b7280",
                            marginBottom: 4,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          Quantity
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "#111827",
                          }}
                        >
                          {item.quantity || 1}
                        </div>
                      </div>

                      {item.description && (
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#6b7280",
                              marginBottom: 4,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            Description
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#374151",
                              lineHeight: 1.6,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {item.description}
                          </div>
                        </div>
                      )}

                      {!item.description && (
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#6b7280",
                              marginBottom: 4,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            Description
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#9ca3af",
                              fontStyle: "italic",
                            }}
                          >
                            No description available
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "#6b7280",
                  }}
                >
                  No product details available
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setViewingProduct(null)}
                style={{
                  padding: "10px 24px",
                  background: "#10b981",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#059669";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#10b981";
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
