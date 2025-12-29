
// "use client"

// import { useMemo } from "react"
// import { useCart } from "../../context/CartContext"
// import "../../styles/CartPage.css"

// export default function CartPage() {
//   const { items, loading, updateItem, removeItem, clearCart } = useCart()

//   const { totalQuantity, totalAmount } = useMemo(() => {
//     if (!items?.length) return { totalQuantity: 0, totalAmount: 0 }

//     return items.reduce(
//       (acc, item) => {
//         const quantity = item.quantity || 0
//         const price = item.price || item.venue?.price || 0

//         acc.totalQuantity += quantity
//         acc.totalAmount += quantity * price

//         return acc
//       },
//       { totalQuantity: 0, totalAmount: 0 }
//     )
//   }, [items])

//   if (loading) {
//     return (
//       <div className="cart-page cart-page--state">
//         <p>Loading your cart...</p>
//       </div>
//     )
//   }

//   if (!items || items.length === 0) {
//     return (
//       <div className="cart-page cart-page--state">
//         <p>Your cart is empty.</p>
//       </div>
//     )
//   }

//   return (
//     <section className="cart-page">
//       <header className="cart-header">
//         <div>
//           <h1>My Cart</h1>
//           <p className="cart-subtitle">
//             {totalQuantity} {totalQuantity === 1 ? "item" : "items"} ready for checkout
//           </p>
//         </div>
//         <button className="cart-clear" onClick={clearCart}>
//           Clear Cart
//         </button>
//       </header>

//       <div className="cart-content">
//         <div className="cart-list">
//           {items.map((item) => {
//             const venueName = item.venue?.venueName || item.venueName || "Venue"
//             const price = item.price || item.venue?.price || 0

//             return (
//               <article key={item.id} className="cart-card">
//                 <div className="cart-card__info">
//                   <h2>{venueName}</h2>
//                   {item.venue?.location && <p className="cart-card__meta">{item.venue.location}</p>}
//                 </div>

//                 <div className="cart-card__price">
//                   <span className="label">Price</span>
//                   <strong>NPR {price.toLocaleString()}</strong>
//                 </div>

//                 <label className="cart-card__quantity">
//                   <span className="label">Qty</span>
//                   <input
//                     type="number"
//                     min={1}
//                     value={item.quantity}
//                     onChange={(e) => updateItem(item.id, Number(e.target.value))}
//                   />
//                 </label>

//                 <button className="cart-card__remove" onClick={() => removeItem(item.id)}>
//                   Remove
//                 </button>
//               </article>
//             )
//           })}
//         </div>

//         <aside className="cart-summary">
//           <div className="cart-summary__row">
//             <span>Items</span>
//             <strong>{totalQuantity}</strong>
//           </div>
//           <div className="cart-summary__row">
//             <span>Total</span>
//             <strong>NPR {totalAmount.toLocaleString()}</strong>
//           </div>
//           <button className="cart-summary__checkout">Proceed to Checkout</button>
//         </aside>
//       </div>
//     </section>
//   )
// }
import { useMemo } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../../styles/CartPage.css";

export default function CartPage() {
  const { items, loading, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const { totalQuantity, totalAmount } = useMemo(() => {
    if (!items?.length) return { totalQuantity: 0, totalAmount: 0 };

    return items.reduce(
      (acc, item) => {
        const quantity = item.quantity || 0;
        const price = item.price || item.venue?.price || 0;
        acc.totalQuantity += quantity;
        acc.totalAmount += quantity * price;
        return acc;
      },
      { totalQuantity: 0, totalAmount: 0 }
    );
  }, [items]);

  if (loading) {
    return (
      <div className="cart-page cart-page--state">
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="cart-page cart-page--state">
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <section className="cart-page">
      <header className="cart-header">
        <div>
          <h1>My Cart</h1>
          <p className="cart-subtitle">
            {totalQuantity} {totalQuantity === 1 ? "item" : "items"} ready for checkout
          </p>
        </div>
        <button className="cart-clear" onClick={clearCart}>
          Clear Cart
        </button>
      </header>

      <div className="cart-content">
        <div className="cart-list">
          {items.map((item) => {
            const venueName = item.venue?.venueName || item.venueName || "Venue";
            const price = item.price || item.venue?.price || 0;

            return (
              <article key={item.id} className="cart-card">
                <div className="cart-card__info">
                  <h2>{venueName}</h2>
                  {item.venue?.location && <p className="cart-card__meta">{item.venue.location}</p>}
                </div>

                <div className="cart-card__price">
                  <span className="label">Price</span>
                  <strong>NPR {price.toLocaleString()}</strong>
                </div>

                <label className="cart-card__quantity">
                  <span className="label">Qty</span>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, Number(e.target.value))}
                  />
                </label>

                <button className="cart-card__remove" onClick={() => removeItem(item.id)}>
                  Remove
                </button>
              </article>
            );
          })}
        </div>

        <aside className="cart-summary">
          <div className="cart-summary__row">
            <span>Items</span>
            <strong>{totalQuantity}</strong>
          </div>
          <div className="cart-summary__row">
            <span>Total</span>
            <strong>NPR {totalAmount.toLocaleString()}</strong>
          </div>

          {/* Only Proceed to Checkout */}
          <button
            className="cart-summary__checkout"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </section>
  );
}
