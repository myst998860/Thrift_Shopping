// import { useCart } from "../../context/CartContext"

// export default function CartPage() {
//   const { items, loading, updateItem, removeItem, clearCart } = useCart()

//   if (loading) return <div>Loading cart...</div>
//   if (items.length === 0) return <div>Your cart is empty.</div>

//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Your Cart</h1>
//       {items.map((item) => (
//         <div key={item.id} style={{
//           border: "1px solid #ddd",
//           padding: 12,
//           marginBottom: 10
//         }}>
//           <p><strong>{item.venue.venueName}</strong></p>
//           <p>Price per unit: NPR {item.price}</p>

//           <input
//             type="number"
//             value={item.quantity}
//             min={1}
//             onChange={(e) =>
//               updateItem(item.id, Number(e.target.value))
//             }
//           />

//           <button onClick={() => removeItem(item.id)}>Remove</button>
//         </div>
//       ))}

//       <button onClick={clearCart}>Clear Cart</button>
//     </div>
//   )
// }
