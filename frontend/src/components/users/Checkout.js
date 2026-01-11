// import { useState, useEffect } from "react";
// import { useCart } from "../../context/CartContext";
// import { orderAPI, userService } from "../../services/api";
// import { useNavigate } from "react-router-dom";
// import "../../styles/CartPage.css";

// export default function Checkout() {
//   const { items, clearCart } = useCart();
//   const navigate = useNavigate();

//   const [deliveryAddress, setDeliveryAddress] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("COD");
//   const [loading, setLoading] = useState(false);

//   const userId = parseInt(sessionStorage.getItem("userId"), 10);
//   const userEmail = JSON.parse(sessionStorage.getItem("user") || "{}").email;

//   // Fetch user location on component mount
//   useEffect(() => {
//     const fetchUserLocation = async () => {
//       if (!userId) return;
//       try {
//         const userData = await userService.getUser(userId);
//         setDeliveryAddress(userData.location || "");
//       } catch (err) {
//         console.error("Failed to fetch user location:", err);
//       }
//     };

//     fetchUserLocation();
//   }, [userId]);

//   const subtotal = items.reduce(
//     (sum, item) => sum + (item.price || item.venue?.price || 0) * item.quantity,
//     0
//   );

//   const deliveryCost = 200;
//   const totalAmount = subtotal + deliveryCost;

//   const handleCheckout = async () => {
//     if (!userId) {
//       alert("User not logged in properly. Please log in again.");
//       return;
//     }
//     if (!deliveryAddress) {
//       alert("Delivery address is required.");
//       return;
//     }
//     if (!items.length) {
//       alert("Cart is empty.");
//       return;
//     }

//     setLoading(true);

//     const orderData = {
//       userId,
//       userEmail,
//       address: deliveryAddress,
//       paymentMethod,
//       subtotal,
//       deliveryCost,
//       totalAmount,
//       items: items.map((item) => ({
//         productId: item.id,
//            venueId: item.venueId,
//         quantity: item.quantity,
//         price: item.price || item.venue?.price || 0,
//       })),
//     };

//     console.log("ORDER DATA SENT:", orderData);

//     try {
//       const order = await orderAPI.checkout(orderData);

//       if (paymentMethod === "eSewa" && order.esewaPaymentUrl) {
//         window.location.href = order.esewaPaymentUrl;
//       } else {
//         alert("Order placed successfully! Payment on delivery.");
//         clearCart();
//         navigate("/orders");
//       }
//     } catch (err) {
//       console.error("Checkout failed:", err);
//       alert("Checkout failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="checkout-page">
//       <div className="checkout-container">
//         <header className="checkout-header">
//           <h1>Checkout</h1>
//           <p className="checkout-subtitle">Review your order and complete your purchase</p>
//         </header>

//         <div className="checkout-content">
//           <div className="checkout-main">
//             {/* Delivery Address Section */}
//             <section className="checkout-section">
//             <div className="checkout-section-header">
//               <h2>Delivery Address</h2>
//             </div>
//               <div className="checkout-form-group">
//                 <textarea
//                   className="checkout-textarea"
//                   value={deliveryAddress}
//                   onChange={(e) => setDeliveryAddress(e.target.value)}
//                   placeholder="Enter your complete delivery address..."
//                   rows={4}
//                 />
//               </div>
//             </section>

//             {/* Payment Method Section */}
//             <section className="checkout-section">
//             <div className="checkout-section-header">
//               <h2>Payment Method</h2>
//             </div>
//               <div className="payment-methods">
//                 <label className={`payment-option ${paymentMethod === "COD" ? "active" : ""}`}>
//                   <input
//                     type="radio"
//                     name="payment"
//                     value="COD"
//                     checked={paymentMethod === "COD"}
//                     onChange={() => setPaymentMethod("COD")}
//                   />
//                   <div className="payment-option-content">
//                     <div className="payment-option-header">
//                       <span className="payment-name">Cash on Delivery</span>
//                     </div>
//                     <span className="payment-description">Pay when you receive your order</span>
//                   </div>
//                 </label>

//                 <label className={`payment-option ${paymentMethod === "eSewa" ? "active" : ""}`}>
//                   <input
//                     type="radio"
//                     name="payment"
//                     value="eSewa"
//                     checked={paymentMethod === "eSewa"}
//                     onChange={() => setPaymentMethod("eSewa")}
//                   />
//                   <div className="payment-option-content">
//                     <div className="payment-option-header">
//                       <span className="payment-name">eSewa</span>
//                     </div>
//                     <span className="payment-description">Pay securely online</span>
//                   </div>
//                 </label>
//               </div>
//             </section>
//           </div>

//           {/* Order Summary Sidebar */}
//           <aside className="checkout-summary">
//             <h2 className="checkout-summary-title">Order Summary</h2>

//             <div className="checkout-items-list">
//               {items.map((item) => {
//                 const venueName = item.venue?.venueName || item.venueName || "Item";
//                 const price = item.price || item.venue?.price || 0;
//                 const itemTotal = price * item.quantity;

//                 return (
//                   <div key={item.id} className="checkout-item">
//                     <div className="checkout-item-info">
//                       <h3 className="checkout-item-name">{venueName}</h3>
//                       <p className="checkout-item-meta">Qty: {item.quantity}</p>
//                     </div>
//                     <div className="checkout-item-price">
//                       NPR {itemTotal.toLocaleString()}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             <div className="checkout-summary-divider"></div>

//             <div className="checkout-summary-totals">
//               <div className="checkout-summary-row">
//                 <span>Subtotal</span>
//                 <span>NPR {subtotal.toLocaleString()}</span>
//               </div>
//               <div className="checkout-summary-row">
//                 <span>Delivery</span>
//                 <span>NPR {deliveryCost.toLocaleString()}</span>
//               </div>
//               <div className="checkout-summary-row checkout-total">
//                 <span>Total</span>
//                 <strong>NPR {totalAmount.toLocaleString()}</strong>
//               </div>
//             </div>

//             <button
//               className="checkout-button"
//               onClick={handleCheckout}
//               disabled={loading}
//             >
//               {loading ? (
//                 "Processing..."
//               ) : (
//                 <>
//                   <span>Place Order</span>
//                   <span className="checkout-button-arrow">→</span>
//                 </>
//               )}
//             </button>
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { orderAPI, userService } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../styles/CartPage.css";

export default function Checkout() {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  const userId = parseInt(sessionStorage.getItem("userId"), 10);
  const userEmail = JSON.parse(sessionStorage.getItem("user") || "{}").email;

  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!userId) return;
      try {
        const userData = await userService.getUser(userId);
        setDeliveryAddress(userData.location || "");
      } catch (err) {
        console.error("Failed to fetch user location:", err);
      }
    };
    fetchUserLocation();
  }, [userId]);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || item.venue?.price || 0) * item.quantity,
    0
  );
  const deliveryCost = 0;
  const totalAmount = subtotal + deliveryCost;

  const handleCheckout = async () => {
    if (!userId || !deliveryAddress.trim() || items.length === 0) {
      toast.warning("Please complete all required information.");
      return;
    }

    setLoading(true);

    const orderData = {
      userId,
      userEmail,
      address: deliveryAddress,
      paymentMethod,
      totalAmount,
      items: items.map((item) => ({
        productId: item.id,
        venueId: item.venueId,
        quantity: item.quantity,
        price: item.price || item.venue?.price || 0,
      })),
    };

    try {
      const order = await orderAPI.checkout(orderData);

      if (paymentMethod === "eSewa") {
        const esewaResponse = await orderAPI.initiateEsewaPayment(order.orderId);

        const form = document.createElement("form");
        form.method = "POST";
        // Use PRODUCTION URL for reliable testing (sandbox rc-epay is unstable/down in late 2025)
        form.action = "https://epay.esewa.com.np/api/epay/main/v2/form";

        const fields = {
          amount: esewaResponse.amount,
          tax_amount: esewaResponse.tax_amount || "0",
          total_amount: esewaResponse.total_amount,
          transaction_uuid: esewaResponse.transaction_uuid,
          product_code: esewaResponse.product_code,
          product_service_charge: esewaResponse.product_service_charge || "0",
          product_delivery_charge: esewaResponse.product_delivery_charge || "0",
          success_url: esewaResponse.success_url,
          failure_url: esewaResponse.failure_url,
          signed_field_names: esewaResponse.signed_field_names,
          signature: esewaResponse.signature,
        };

        Object.entries(fields).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value || "";
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        toast.success("Order placed successfully! Cash on Delivery.");
        clearCart();
        navigate("/orders");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <header className="checkout-header">
          <h1>Checkout</h1>
          <p className="checkout-subtitle">Review your order and complete your purchase</p>
        </header>

        <div className="checkout-content">
          <div className="checkout-main">
            <section className="checkout-section">
              <div className="checkout-section-header"><h2>Delivery Address</h2></div>
              <div className="checkout-form-group">
                <textarea
                  className="checkout-textarea"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your complete delivery address..."
                  rows={4}
                />
              </div>
            </section>

            <section className="checkout-section">
              <div className="checkout-section-header"><h2>Payment Method</h2></div>
              <div className="payment-methods">
                <label className={`payment-option ${paymentMethod === "COD" ? "active" : ""}`}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                  <div className="payment-option-content">
                    <span className="payment-name">Cash on Delivery</span>
                    <span className="payment-description">Pay when you receive your order</span>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === "eSewa" ? "active" : ""}`}>
                  <input type="radio" name="payment" value="eSewa" checked={paymentMethod === "eSewa"} onChange={() => setPaymentMethod("eSewa")} />
                  <div className="payment-option-content">
                    <span className="payment-name">eSewa</span>
                    <span className="payment-description">Pay securely online</span>
                  </div>
                </label>
              </div>
            </section>
          </div>

          <aside className="checkout-summary">
            <h2 className="checkout-summary-title">Order Summary</h2>
            <div className="checkout-items-list">
              {items.map((item) => {
                const name = item.venue?.venueName || item.venueName || "Item";
                const price = item.price || item.venue?.price || 0;
                return (
                  <div key={item.id} className="checkout-item">
                    <div className="checkout-item-info">
                      <h3>{name}</h3>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <div className="checkout-item-price">NPR {(price * item.quantity).toLocaleString()}</div>
                  </div>
                );
              })}
            </div>

            <div className="checkout-summary-divider"></div>
            <div className="checkout-summary-totals">
              <div className="checkout-summary-row"><span>Subtotal</span><span>NPR {subtotal.toLocaleString()}</span></div>
              <div className="checkout-summary-row"><span>Delivery</span><span>NPR {deliveryCost.toLocaleString()}</span></div>
              <div className="checkout-summary-row checkout-total"><span>Total</span><strong>NPR {totalAmount.toLocaleString()}</strong></div>
            </div>

            <button className="checkout-button" onClick={handleCheckout} disabled={loading}>
              {loading ? "Processing..." : "Place Order"}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
