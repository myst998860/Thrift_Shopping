// "use client"

// import { createContext, useContext, useState, useEffect } from "react"
// import { api, cartService } from "../services/api"

// const CartContext = createContext(null)

// export function CartProvider({ children }) {
//   const [items, setItems] = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//    const fetchCart = async () => {
//   const userId = localStorage.getItem("userId");
//   if (!userId) return;

//   const res = await api.get(`/cart/${userId}`);
//   setItems(res.data.items || []);  // <-- important
// };

   
//   }, [])

// const addItem = async ({ venueId, quantity = 1 }) => {
//   try {
//     const userId = localStorage.getItem("userId");
//     if (!userId) throw new Error("User not logged in");

//     // Call your backend API
//     const res = await cartService.addItem(userId, venueId, quantity);

//     if (!res || res.error) throw new Error(res?.error || "Failed to add item");

//     // Fetch updated cart from backend
//     const updatedCart = await cartService.getUserCart(userId);
//     setItems(updatedCart.items || []);

//     return true;
//   } catch (err) {
//     console.error("Failed to add item:", err);
//     return false;
//   }
// };

//   const updateItem = async (cartItemId, quantity) => {
//     try {
//       await cartService.updateItem(cartItemId, quantity)
//       const userId = localStorage.getItem("userId")
//       const cart = await cartService.getUserCart(userId)
//       setItems(cart.items || [])
//     } catch (err) {
//       console.error("Failed to update item:", err)
//     }
//   }

//   const removeItem = async (cartItemId) => {
//     try {
//       await cartService.removeItem(cartItemId)
//       const userId = localStorage.getItem("userId")
//       const cart = await cartService.getUserCart(userId)
//       setItems(cart.items || [])
//     } catch (err) {
//       console.error("Failed to remove item:", err)
//     }
//   }

//   const clearCart = async () => {
//     try {
//       const userId = localStorage.getItem("userId")
//       await cartService.clearCart(userId)
//       setItems([]) // clearing items in UI
//     } catch (err) {
//       console.error("Failed to clear cart:", err)
//     }
//   }

//   return (
//     <CartContext.Provider
//       value={{ items, loading, addItem, updateItem, removeItem, clearCart }}
//     >
//       {children}
//     </CartContext.Provider>
//   )
// }

// export function useCart() {
//   return useContext(CartContext)
// }

"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { cartService } from "../services/api"

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        const cartData = await cartService.getUserCart(userId)
        setItems(cartData?.items || [])
      } catch (err) {
        console.error("Failed to fetch cart:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])

  // Add item to cart
  // const addItem = async ({ venueId, quantity = 1 }) => {
  //   try {
  //     const userId = localStorage.getItem("userId")
  //     if (!userId) throw new Error("User not logged in")

  //     await cartService.addItem(userId, venueId, quantity)

  //     // Refresh cart after adding
  //     const updatedCart = await cartService.getUserCart(userId)
  //     setItems(updatedCart?.items || [])
  //   } catch (err) {
  //     console.error("Failed to add item:", err)
  //   return false 
  //   }
  // }
  const addItem = async ({ venueId, quantity = 1 }) => {
  const userId = localStorage.getItem("userId")  // get fresh userId every time
  if (!userId) {
    console.warn("User not logged in")
    return false
  }

  try {
    await cartService.addItem(userId, venueId, quantity)
    const updatedCart = await cartService.getUserCart(userId)
    setItems(updatedCart?.items || [])
    return true
  } catch (err) {
    console.error("Failed to add item:", err)
    return false
  }
}

  // Update quantity of an item
  const updateItem = async (cartItemId, quantity) => {
    try {
      await cartService.updateItem(cartItemId, quantity)
      const userId = localStorage.getItem("userId")
      const updatedCart = await cartService.getUserCart(userId)
      setItems(updatedCart?.items || [])
    } catch (err) {
      console.error("Failed to update item:", err)
    }
  }

  // Remove an item
  const removeItem = async (cartItemId) => {
    try {
      await cartService.removeItem(cartItemId)
      const userId = localStorage.getItem("userId")
      const updatedCart = await cartService.getUserCart(userId)
      setItems(updatedCart?.items || [])
    } catch (err) {
      console.error("Failed to remove item:", err)
    }
  }

  // Clear entire cart
  const clearCart = async () => {
    try {
      const userId = localStorage.getItem("userId")
      await cartService.clearCart(userId)
      setItems([])
    } catch (err) {
      console.error("Failed to clear cart:", err)
    }
  }

  return (
    <CartContext.Provider
      value={{ items, loading, addItem, updateItem, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
