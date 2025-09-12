import { useMemo } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useCart } from "../../context/CartContext";
import { useUserSession } from "../../context/UserSessionContext";
import "../../styles/payment-page.css";

const currency = (n) => `$${Number(n).toFixed(2)}`;

export default function AddCart() {
  const { items, totals, setQuantity, removeItem, clear } = useCart();
  const { isUserLoggedIn } = useUserSession();

  const isEmpty = items.length === 0;

  const orderSummary = useMemo(
    () => [
      { label: "Subtotal", value: currency(totals.subtotal) },
      { label: "Shipping", value: currency(totals.shipping) },
      { label: "Tax", value: currency(totals.tax) },
    ],
    [totals]
  );

  if (!isUserLoggedIn) {
    return (
      <div>
        <Header />
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
          <h1 style={{ fontSize: 28, marginBottom: 16 }}>Shopping Cart</h1>
          <div style={{ background: "#f8fffa", border: "1px solid #e2f7ea", borderRadius: 12, padding: 24 }}>
            Please sign in to view your cart.
            <div style={{ marginTop: 12 }}>
              <button onClick={() => (window.location.href = "/login")} style={{ ...primaryBtnStyle }}>
                Sign In
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
        <h1 style={{ fontSize: 28, marginBottom: 16 }}>Shopping Cart</h1>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          <div>
            {isEmpty ? (
              <div style={{ background: "#f8fffa", border: "1px solid #e2f7ea", borderRadius: 12, padding: 24 }}>
                Your cart is empty.
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} style={{ background: "#f8fffa", border: "1px solid #e2f7ea", borderRadius: 12, padding: 16, display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
                  <div style={{ width: 96, height: 96, borderRadius: 8, overflow: "hidden", background: "#eef2f7" }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : null}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{item.title}</div>
                    {item.meta ? <div style={{ color: "#64748b", fontSize: 13 }}>{item.meta}</div> : null}
                    <div style={{ color: "#16a34a", fontWeight: 700, marginTop: 6 }}>{currency(item.price)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => setQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))} style={qtyBtnStyle}>
                      −
                    </button>
                    <div style={{ minWidth: 24, textAlign: "center" }}>{item.quantity || 1}</div>
                    <button onClick={() => setQuantity(item.id, (item.quantity || 1) + 1)} style={qtyBtnStyle}>
                      +
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} aria-label="Remove" style={removeBtnStyle}>
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>

          <aside style={{ background: "#f8fffa", border: "1px solid #e2f7ea", borderRadius: 12, padding: 16, height: "fit-content" }}>
            <div style={{ fontWeight: 800, marginBottom: 12 }}>Order Summary</div>
            <div style={{ display: "grid", gap: 8 }}>
              {orderSummary.map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", color: "#0f172a" }}>
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #e2e8f0", margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, marginBottom: 12 }}>
              <span>Total</span>
              <span>{currency(totals.total)}</span>
            </div>
            <button disabled={isEmpty} onClick={() => alert("Proceeding to checkout...")} style={{ ...primaryBtnStyle, width: "100%" }}>
              Proceed to Checkout
            </button>
            {!isEmpty && (
              <button onClick={clear} style={{ ...secondaryBtnStyle, width: "100%", marginTop: 8 }}>
                Clear Cart
              </button>
            )}
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const qtyBtnStyle = {
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  cursor: "pointer",
};

const removeBtnStyle = {
  border: 0,
  background: "transparent",
  cursor: "pointer",
  fontSize: 18,
};

const primaryBtnStyle = {
  background: "#16a34a",
  color: "white",
  border: 0,
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryBtnStyle = {
  background: "#f1f5f9",
  color: "#0f172a",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 700,
};


