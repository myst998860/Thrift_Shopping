import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

// Cart item shape: { id, title, price, imageUrl, meta, quantity }

const CartContext = createContext(null);

const STORAGE_KEY = "thriftgood_cart_v1";

function cartReducer(state, action) {
  switch (action.type) {
    case "INIT": {
      return action.payload || [];
    }
    case "ADD": {
      const incoming = action.payload;
      const index = state.findIndex((i) => i.id === incoming.id);
      if (index >= 0) {
        const updated = [...state];
        updated[index] = { ...updated[index], quantity: updated[index].quantity + (incoming.quantity || 1) };
        return updated;
      }
      return [...state, { ...incoming, quantity: incoming.quantity || 1 }];
    }
    case "REMOVE": {
      return state.filter((i) => i.id !== action.payload);
    }
    case "SET_QTY": {
      const { id, quantity } = action.payload;
      if (quantity <= 0) return state.filter((i) => i.id !== id);
      return state.map((i) => (i.id === id ? { ...i, quantity } : i));
    }
    case "CLEAR": {
      return [];
    }
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  // Load from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) dispatch({ type: "INIT", payload: parsed });
      }
    } catch (e) {
      console.warn("Failed to parse cart from storage", e);
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to save cart", e);
    }
  }, [items]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1), 0);
    const shipping = items.length > 0 ? 5.99 : 0;
    const tax = +(subtotal * 0.08).toFixed(2);
    const total = +(subtotal + shipping + tax).toFixed(2);
    return { subtotal, shipping, tax, total };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((n, i) => n + (i.quantity || 1), 0),
      totals,
      addItem: (item) => dispatch({ type: "ADD", payload: item }),
      removeItem: (id) => dispatch({ type: "REMOVE", payload: id }),
      setQuantity: (id, quantity) => dispatch({ type: "SET_QTY", payload: { id, quantity } }),
      clear: () => dispatch({ type: "CLEAR" }),
    }),
    [items, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}


