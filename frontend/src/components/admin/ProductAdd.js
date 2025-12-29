import React, { useState } from "react";
import productService from "../../services/api";

const ProductAdd = () => {
  const [product, setProduct] = useState({
    productName: "",
    description: "",
    price: "",
    discountPrice: "",
    quantity: "",
    quality: "",
    isAvailable: true,
    sku: "",
    brand: "",
    category: "",
    weight: "",
    height: "",
    width: "",
    length: "",
    
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // Add basic product fields
      Object.keys(product).forEach((key) => {
        if (product[key] !== "") {
          formData.append(key, product[key]);
        }
      });

      // Add tags as comma separated string if exists
    

      // Add images
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      const result = await productService.addProduct(formData);
      setMessage("Product added successfully!");
      console.log("Added product:", result);

      // Reset form
      setProduct({
        productName: "",
        description: "",
        price: "",
        discountPrice: "",
        quantity: "",
        quality: "",
        isAvailable: true,
        sku: "",
        brand: "",
        category: "",
        weight: "",
        height: "",
        width: "",
        length: "",
      
      });
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error adding product:", error);
      setMessage("Failed to add product.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Add Product</h2>
      {message && <p className="mb-4">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="productName" placeholder="Product Name" value={product.productName} onChange={handleChange} required className="w-full p-2 border rounded" />
        <textarea name="description" placeholder="Description" value={product.description} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input type="number" name="price" placeholder="Price" value={product.price} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input type="number" name="discountPrice" placeholder="Discount Price" value={product.discountPrice} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="number" name="quantity" placeholder="Quantity" value={product.quantity} onChange={handleChange} required className="w-full p-2 border rounded" />
        <input type="number" name="quality" placeholder="Quality" value={product.quality} onChange={handleChange} className="w-full p-2 border rounded" />
        <label className="flex items-center space-x-2">
          <input type="checkbox" name="isAvailable" checked={product.isAvailable} onChange={handleChange} />
          <span>Available</span>
        </label>
        <input type="text" name="sku" placeholder="SKU" value={product.sku} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="text" name="brand" placeholder="Brand" value={product.brand} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="text" name="category" placeholder="Category" value={product.category} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="number" name="weight" placeholder="Weight (kg)" value={product.weight} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="number" name="height" placeholder="Height (cm)" value={product.height} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="number" name="width" placeholder="Width (cm)" value={product.width} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="number" name="length" placeholder="Length (cm)" value={product.length} onChange={handleChange} className="w-full p-2 border rounded" />
      

        {/* Image upload */}
        <input type="file" multiple onChange={handleFileChange} className="w-full p-2 border rounded" />

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Add Product
        </button>
      </form>
    </div>
  );
};

export default ProductAdd;
