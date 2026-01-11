import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { venueService } from '../../services/api';
import { FiArrowLeft, FiTag, FiBox, FiDollarSign, FiInfo, FiMapPin } from 'react-icons/fi';
import '../../styles/admin/ViewVenue.css'; // We'll keep the same CSS file name for now

const ViewVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await venueService.getVenue(id);
        setProduct(data);
        if (data.imageUrls && data.imageUrls.length > 0) {
          setActiveImage(data.imageUrls[0]);
        }
      } catch (error) {
        setApiError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="view-loading">
      <div className="spinner"></div>
      <p>Fetching product details...</p>
    </div>
  );

  if (apiError) return (
    <div className="view-error">
      <FiInfo size={48} />
      <p>{apiError}</p>
      <button onClick={() => navigate('/admin/venues')}>Back to Products</button>
    </div>
  );

  if (!product) return <p>Product not found.</p>;

  return (
    <div className="view-product-container">
      <div className="view-product-header">
        <button className="back-btn" onClick={() => navigate('/admin/venues')}>
          <FiArrowLeft /> Back to Products
        </button>
        <div className="header-info">
          <h1>{product.venueName}</h1>
          <span className={`status-badge ${product.status}`}>
            {product.status || 'Active'}
          </span>
        </div>
      </div>

      <div className="view-product-content">
        {/* Media Section */}
        <div className="product-media-section">
          <div className="main-image-container">
            {activeImage ? (
              <img src={activeImage} alt={product.venueName} className="main-image" />
            ) : (
              <div className="image-placeholder">No Image Available</div>
            )}
          </div>
          <div className="thumbnail-grid">
            {product.imageUrls?.map((url, index) => (
              <div
                key={index}
                className={`thumbnail-card ${activeImage === url ? 'active' : ''}`}
                onClick={() => setActiveImage(url)}
              >
                <img src={url} alt={`Thumbnail ${index}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="product-details-section">
          <div className="details-card">
            <h3><FiInfo /> Essential Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label><FiDollarSign /> Price (NPR)</label>
                <span className="price-tag">Rs. {product.price?.toLocaleString()}</span>
              </div>
              <div className="info-item">
                <label><FiTag /> Category</label>
                <span>{product.category || 'Uncategorized'}</span>
              </div>
              <div className="info-item">
                <label><FiBox /> Brand</label>
                <span>{product.brand || 'No Brand'}</span>
              </div>
              <div className="info-item">
                <label><FiMapPin /> Location</label>
                <span>{product.location || 'Kathmandu'}</span>
              </div>
            </div>
          </div>

          <div className="details-card description-card">
            <h3><FiBox /> Product Description</h3>
            <p>{product.description || 'No description provided.'}</p>
          </div>

          <div className="action-footer">
            <button
              className="edit-action-btn"
              onClick={() => navigate(`/admin/venues/edit/${product.venue_id}`)}
            >
              Edit Product Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewVenue;
