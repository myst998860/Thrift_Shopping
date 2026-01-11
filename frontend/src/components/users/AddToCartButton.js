import { useCart } from "../context/CartContext";

function AddToCartButton({ venue }) {
  const { addItemBackend } = useCart();

  const handleAddToCart = async () => {
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      alert("Please login first!");
      return;
    }

    try {
      await addItemBackend({
        userId,
        venueId: venue.id,
        quantity: 1
      });

          // 2️⃣ Add to cart context state (so checkout has venue info)
    addItemToCartContext({
      id: venue.id, 
        venueId: product.venueId,      // productId can be same as venue.id if no separate product
      price: venue.price,
      quantity: 1,
      venue               // attach the full venue object
    });

      alert("Successfully added to cart!");
    } catch (error) {
      console.error(error);
      alert("Failed to add to cart.");
    }
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}


export default AddToCartButton;
