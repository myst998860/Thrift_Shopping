// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { orderAPI } from "../../services/api";
// import "../../styles/OrderDetail.css";

// const OrderDetail = () => {
//   const { orderId } = useParams();
//   const navigate = useNavigate();

//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchOrder = async () => {
//       if (!orderId) return;
//       setLoading(true);
//       try {
//         const data = await orderAPI.getOrder(orderId);
//         setOrder(data);
//       } catch (err) {
//         console.error("Failed to fetch order:", err);
//         setError("Failed to load order details.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrder();
//   }, [orderId]);

//   const handleBack = () => {
//     navigate(-1);
//   };

//   if (loading) {
//     return (
//       <div className="order-detail-page">
//         <div className="order-detail-card">
//           <p className="order-detail-status-text">Loading order details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="order-detail-page">
//         <div className="order-detail-card">
//           <p className="order-detail-error-text">{error}</p>
//           <button className="order-detail-back-btn" onClick={handleBack}>
//             Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!order) {
//     return (
//       <div className="order-detail-page">
//         <div className="order-detail-card">
//           <p className="order-detail-error-text">Order not found.</p>
//           <button className="order-detail-back-btn" onClick={handleBack}>
//             Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const {
//     orderId: id,
//     userId,
//     userEmail,
//     address,
//     status,
//     paymentMethod,
//     totalAmount,
//     createdAt,
//     items = [],
//   } = order;

//   return (
//     <div className="order-detail-page">
//       <div className="order-detail-card">
//         <div className="order-detail-header">
//           <div>
//             <h2 className="order-detail-title">Order #{id}</h2>
//             <p className="order-detail-subtitle">
//               Placed on{" "}
//               {createdAt
//                 ? new Date(createdAt).toLocaleString()
//                 : "Unknown date"}
//             </p>
//           </div>
//           <button className="order-detail-back-btn" onClick={handleBack}>
//             Back to Orders
//           </button>
//         </div>

//         <div className="order-detail-meta">
//           <div className="order-detail-meta-block">
//             <h4>User</h4>
//             <p>
//               <span className="meta-label">User ID:</span> {userId}
//             </p>
//             <p>
//               <span className="meta-label">Email:</span> {userEmail}
//             </p>
//           </div>

//           <div className="order-detail-meta-block">
//             <h4>Delivery</h4>
//             <p>
//               <span className="meta-label">Address:</span>{" "}
//               {address || "N/A"}
//             </p>
//           </div>

//           <div className="order-detail-meta-block">
//             <h4>Payment</h4>
//             <p>
//               <span className="meta-label">Method:</span>{" "}
//               {paymentMethod || "N/A"}
//             </p>
//             <p>
//               <span className="meta-label">Total:</span> NPR{" "}
//               {totalAmount?.toLocaleString() || 0}
//             </p>
//           </div>

//           <div className="order-detail-meta-block">
//             <h4>Status</h4>
//             <span className={`order-detail-status-badge status-${status}`}>
//               {status}
//             </span>
//           </div>
//         </div>

//         <div className="order-detail-items-section">
//           <h3 className="order-detail-items-title">Items</h3>
//           {items.length === 0 ? (
//             <p className="order-detail-status-text">No items in this order.</p>
//           ) : (
//             <div className="order-detail-items-grid">
//               {items.map((item) => (
//                 <div key={item.id} className="order-detail-item-card">
//                   <div className="order-detail-item-image-wrapper">
//                     {item.imageUrl ? (
//                       <img
//                         src={item.imageUrl}
//                         alt={item.venueName || "Item image"}
//                         className="order-detail-item-image"
//                       />
//                     ) : (
//                       <div className="order-detail-item-image placeholder">
//                         <span>No Image</span>
//                       </div>
//                     )}
//                   </div>
//                   <div className="order-detail-item-info">
//                     <h4>{item.venueName || "Item"}</h4>
//                     <p>
//                       <span className="meta-label">Qty:</span>{" "}
//                       {item.quantity}
//                     </p>
//                     <p>
//                       <span className="meta-label">Price:</span> NPR{" "}
//                       {(item.price || 0).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderDetail;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderAPI, venueService } from "../../services/api"; // use venueService
import "../../styles/OrderDetail.css";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [venues, setVenues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderAndVenues = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        // 1️⃣ Fetch order details
        const data = await orderAPI.getOrder(orderId);
        setOrder(data);

        // 2️⃣ Collect unique venue IDs from order items
        const venueIds = [...new Set(data.items?.map((item) => item.venueId))];

        // 3️⃣ Fetch each venue individually
        if (venueIds.length > 0) {
          const venueMap = {};
          await Promise.all(
            venueIds.map(async (id) => {
              try {
                const venue = await venueService.getVenue(id); // single venue fetch
                venueMap[id] = venue;
              } catch (err) {
                console.error(`Failed to fetch venue ${id}:`, err);
              }
            })
          );
          setVenues(venueMap);
        }

      } catch (err) {
        console.error("Failed to fetch order or venues:", err);
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndVenues();
  }, [orderId]);

  const handleBack = () => navigate(-1);

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-card">
          <p className="order-detail-status-text">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-card">
          <p className="order-detail-error-text">{error}</p>
          <button className="order-detail-back-btn" onClick={handleBack}>
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-card">
          <p className="order-detail-error-text">Order not found.</p>
          <button className="order-detail-back-btn" onClick={handleBack}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const {
    orderId: id,
    userId,
    userEmail,
    address,
    status,
    paymentMethod,
    totalAmount,
    createdAt,
    items = [],
  } = order;

  return (
    <div className="order-detail-page">
      <div className="order-detail-card">
        <div className="order-detail-header">
          <div>
            <h2 className="order-detail-title">Order #{id}</h2>
            <p className="order-detail-subtitle">
              Placed on {createdAt ? new Date(createdAt).toLocaleString() : "Unknown date"}
            </p>
          </div>
          <button className="order-detail-back-btn" onClick={handleBack}>
            Back to Orders
          </button>
        </div>

        <div className="order-detail-meta">
          <div className="order-detail-meta-block">
            <h4>User</h4>
            <p>
              <span className="meta-label">User ID:</span> {userId}
            </p>
            <p>
              <span className="meta-label">Email:</span> {userEmail}
            </p>
          </div>

          <div className="order-detail-meta-block">
            <h4>Delivery</h4>
            <p>
              <span className="meta-label">Address:</span> {address || "N/A"}
            </p>
          </div>

          <div className="order-detail-meta-block">
            <h4>Payment</h4>
            <p>
              <span className="meta-label">Method:</span> {paymentMethod || "N/A"}
            </p>
            <p>
              <span className="meta-label">Total:</span> NPR {totalAmount?.toLocaleString() || 0}
            </p>
          </div>

          <div className="order-detail-meta-block">
            <h4>Status</h4>
            <span className={`order-detail-status-badge status-${status}`}>{status}</span>
          </div>
        </div>

        <div className="order-detail-items-section">
          <h3 className="order-detail-items-title">Items</h3>
          {items.length === 0 ? (
            <p className="order-detail-status-text">No items in this order.</p>
          ) : (
            <div className="order-detail-items-grid">
              {items.map((item) => {
                const venue = venues[item.venueId];
                const imageUrl = venue?.imageUrls?.[0]; // first image if exists

                return (
                  <div key={item.id} className="order-detail-item-card">
                    <div className="order-detail-item-image-wrapper">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.venueName || "Item image"}
                          className="order-detail-item-image"
                        />
                      ) : (
                        <div className="order-detail-item-image placeholder">
                          <span>No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="order-detail-item-info">
                      <h4>{item.venueName || "Item"}</h4>
                      <p>
                        <span className="meta-label">Qty:</span> {item.quantity}
                      </p>
                      <p>
                        <span className="meta-label">Price:</span> NPR {(item.price || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
