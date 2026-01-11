import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { venueService } from '../../services/api';
import '../../styles/admin/EditVenue.css';

const EditVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    venueName: '',
    location: '',
    price: '',
    status: '',
    description: '',
    category: '',
    brand: '',
    imageUrls: [],
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const dto = await venueService.getVenue(id);
        setFormData({
          venueName: dto.venueName || '',
          location: dto.location || 'Kathmandu',
          price: dto.price?.toString() || '',
          status: dto.status || 'active',
          description: dto.description || '',
          category: dto.category || '',
          brand: dto.brand || '',
          imageUrls: dto.imageUrls || [],
          amenities: dto.amenities || [],
        });
      } catch (err) {
        setApiError('Failed to load venue details.');
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter(u => u !== url)
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.venueName.trim()) errs.venueName = 'Name is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.price.trim() || isNaN(Number(formData.price)))
      errs.price = 'Valid price required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');
    try {
      const formDataToSend = new FormData();

      const venuePayload = {
        ...formData,
        price: Number(formData.price),
      };

      // Create a Blob for the JSON part to specify application/json content type
      const jsonBlob = new Blob([JSON.stringify(venuePayload)], { type: 'application/json' });
      formDataToSend.append('venue', jsonBlob);

      selectedFiles.forEach(file => {
        formDataToSend.append('files', file);
      });

      await venueService.editVenue(id, formDataToSend);
      toast.success('Product updated successfully!');
      setTimeout(() => navigate('/admin/venues'), 1500);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update product.');
      setApiError('Failed to update product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="edit-venue-container">
      <div className="edit-venue-header">
        <h2>Product Edit</h2>
        <p>Refine your product information and manage visuals.</p>
      </div>

      {apiError && <div className="api-error">{apiError}</div>}

      <form onSubmit={handleSubmit} className="edit-venue-form">
        <div className="form-main-content">
          {/* Information Section */}
          <div className="form-column">
            <div className="form-section">
              <h3><i className="fas fa-info-circle"></i> Basic Details</h3>

              <div className="form-field">
                <label>Product Name</label>
                <input
                  type="text"
                  name="venueName"
                  value={formData.venueName}
                  onChange={handleChange}
                  placeholder="e.g. Vintage Denim Jacket"
                  className={errors.venueName ? 'error' : ''}
                />
                {errors.venueName && <span className="error-message">{errors.venueName}</span>}
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Price (NPR)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={errors.price ? 'error' : ''}
                  />
                  {errors.price && <span className="error-message">{errors.price}</span>}
                </div>

                <div className="form-field">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Clothing..."
                  />
                </div>

                <div className="form-field">
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g. Levi's, Nike..."
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide a detailed description of the product..."
                  rows="5"
                  className={errors.description ? 'error' : ''}
                ></textarea>
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="form-column">
            <div className="form-section image-management-section">
              <h3><i className="fas fa-images"></i> Product Media</h3>

              <div className="image-grid">
                {/* Existing Images */}
                {formData.imageUrls.map((url, index) => (
                  <div key={`existing-${index}`} className="image-preview-card">
                    <img src={url} alt={`Existing ${index}`} />
                    <button type="button" className="remove-btn" onClick={() => removeExistingImage(url)}>
                      &times;
                    </button>
                    <span className="badge">Current</span>
                  </div>
                ))}

                {/* New Previews */}
                {previews.map((url, index) => (
                  <div key={`new-${index}`} className="image-preview-card new-image">
                    <img src={url} alt={`Preview ${index}`} />
                    <button type="button" className="remove-btn" onClick={() => removeSelectedFile(index)}>
                      &times;
                    </button>
                    <span className="badge new">New</span>
                  </div>
                ))}

                {/* Upload Button */}
                <label className="upload-placeholder">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-icon">+</div>
                  <span>Add Image</span>
                </label>
              </div>
              <p className="helper-text">Add or remove images. First image will be used as primary.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="button-group">
          <button
            type="button"
            onClick={() => navigate('/admin/venues')}
            className="btn btn-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-save"
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner"></span>
                Processing...
              </>
            ) : (
              <>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVenue;