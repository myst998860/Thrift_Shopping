// import React, { useState } from 'react';
// import { useNavigate, Link, useLocation } from 'react-router-dom';
// import { useEffect } from 'react';
// import axios from "axios";

// import { partnerService, venueService } from '../../services/api';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import {
//   FiHome,
//   FiUsers,
//   FiBriefcase,
//   FiMapPin,
//   FiCalendar,
//   FiBell,
//   FiSettings,
//   FiUser,
//   FiLogOut
// } from 'react-icons/fi';
// import '../../styles/admin/AdminPanel.css';



// const VenueAddTest = () => {
//   const navigate = useNavigate();
//   const [partners, setPartners] = useState([]);
//   const [page, setPage] = useState(1);
//   const [formData, setFormData] = useState({
//     venueName: '',
//     quality: '',
//      category:'',
//     price: '',
//     size: '',
//     brand: '',
//     imageUrl: '',
//     description: '',
 
//     agree: false,
//     status: 'active',
//   });

//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [apiError, setApiError] = useState('');

//   useEffect(() => {
//     const fetchPartners = async () => {
//       try {
//         const response = await partnerService.listPartners();
//         setPartners(response);
//       } catch (err) {
//         console.error('Failed to fetch partners:', err);
//         setPartners([]);
//       }


      
//     };
//     fetchPartners();
//   }, []);

//   useEffect(() => {
//   console.log("Form values changed:", formData);
// }, [formData]);

// useEffect(() => {
//   console.log("Form errors:", errors);
// }, [errors]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value,
//     }));
//   };

//   const fieldsPage1 = ['venueName',  'quality',  'category', 'price', 'size','brand' ];
//   const fieldsPage2 = ['imageUrl', 'description', 'agree'];

//   const validate = (fieldsToValidate = null) => {
//     const newErrors = {};
//     const fields = fieldsToValidate || Object.keys(formData);

//     fields.forEach((key) => {
//       const value = formData[key];

//       if (key === 'agree' && value !== true) {
//         newErrors[key] = 'You must agree to the terms';
//       } else if (
//         (typeof value === 'string' && value.trim() === '') ||
//         (Array.isArray(value) && value.length === 0)
//       ) {
//         newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
//       }
//     });

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleNext = () => {
//     if (validate(fieldsPage1)) setPage(2);
//   };

//   const handleBack = () => setPage(1);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     setIsSubmitting(true);
//     setApiError('');

//     try {
//       const submitData = {
//         ...formData,
//        partnerId: formData.partnerId ? Number(formData.partnerId) : null,
//       venueName: formData.venueName.trim(),
//       category: formData.category.trim(),
//       quality: formData.quality.trim(),
//       brand: formData.brand.trim(),
//       price: formData.price ? Number(formData.price) : 0,
//       size: formData.size.trim(),
//       imageUrl: formData.imageUrl.trim(),
//       status: 'active',
//       };

//       console.log('Submitting:', submitData);
//       await venueService.addVenueA(submitData);

//       toast.success('Venue added successfully!');
//       setTimeout(() => {
//         navigate('/admin/venues');
//       }, 1500);
//       setFormData({
//         venueName: '',
   
//         category:'',
//         quality: '',
      
//         price: '',
//        size: '',
       
       
//         brand: '',
//         imageUrl: '',
//         description: '',
       
//         agree: false,
//         status: '',
//       });
//     } catch (error) {
//       console.error('Venue add failed:', error);
//       if (error.response) {
//         if (error.response.status === 409) {
//           setApiError('Venue with this name already exists.');
//         } else if (error.response.data?.message) {
//           setApiError(error.response.data.message);
//         } else {
//           setApiError('Venue add failed. Please try again later.');
//         }
//       } else {
//         setApiError('Unable to connect to the server. Please try again later.');
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const inputStyle = (field) => ({
//     width: '100%',
//     padding: '16px 20px',
//     fontSize: 18,
//     borderRadius: 6,
//     border: errors[field] ? '2px solid #e74c3c' : '1.5px solid #ccc',
//     outline: 'none',
//     marginBottom: 12,
//   });

//   const labelStyle = {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 8,
//     display: 'block',
//   };

//   return (
//     <>
//       <form
//         onSubmit={handleSubmit}
//         style={{
//           maxWidth: 600,
//           margin: '3rem auto',
//           padding: '3rem',
//           background: '#f9f9f9',
//           borderRadius: 12,
//           boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
//           fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
//         }}
//         noValidate
//       >
//         <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2c3e50' }}>Add New Venue</h1>

//         {page === 1 && (
//           <>
//             <label htmlFor="venueName" style={labelStyle}>
//               Venue Name:
//             </label>
//             <input
//               id="venueName"
//               name="venueName"
//               type="text"
//               value={formData.venueName}
//               onChange={handleChange}
//               style={inputStyle('venueName')}
//               placeholder="Enter venue name"
//             />
//             {errors.venueName && <div style={{ color: '#e74c3c' }}>{errors.venueName}</div>}

     

//             <label htmlFor="quality" style={labelStyle}>
//               Quality:
//             </label>
//             <input
//               id="quality"
//               name="quality"
//               type="text"
//               value={formData.quality}
//               onChange={handleChange}
//               style={inputStyle('quality')}
//               placeholder="good,fair,best"
//             />
//             {errors.quality && <div style={{ color: '#e74c3c' }}>{errors.quality}</div>}

// {/* Category */}
//             <label style={labelStyle} htmlFor="category">Category:</label>
//             <select
//               id="category"
//               name="category"
//               value={formData.category}
//               onChange={handleChange}
//               style={inputStyle('category')}
//             >
//               <option value="">Select Category</option>
//               <option value="Wedding Venues">Wedding Venues</option>
//               <option value="Corporate Events">Corporate Events</option>
//               <option value="Birthday Parties">Birthday Parties</option>
//               <option value="Conferences">Conferences</option>
//             </select>
//             {errors.category && <div style={{ color: '#e74c3c' }}>{errors.category}</div>}
            
//             {/* <label htmlFor="mapLocation" style={labelStyle}>
//               Map Location URL:
//             </label>
//             <input
//               id="mapLocation"
//               name="mapLocation"
//               type="url"
//               value={formData.mapLocation}
//               onChange={handleChange}
//               style={inputStyle('mapLocation')}
//               placeholder="https://maps.google.com/..."
//             />
//             {errors.mapLocation && <div style={{ color: '#e74c3c' }}>{errors.mapLocation}</div>} */}

          
//    <label htmlFor="size" style={labelStyle}>
//               Size:
//             </label>
//             <input
//               id="size"
//               name="size"
//               type="text"
             
//               value={formData.size}
//               onChange={handleChange}
//               style={inputStyle('size')}
//               placeholder="XL,L,M"
//             />
//             {errors.size && <div style={{ color: '#e74c3c' }}>{errors.size}</div>}
          

//             <label htmlFor="brand" style={labelStyle}>
//               Brand:
//             </label>
//             <input
//               id="brand"
//               name="brand"
//               type="text"
             
//               value={formData.brand}
//               onChange={handleChange}
//               style={inputStyle('brand')}
//               placeholder="Enter Brand"
//             />
//             {errors.brand && <div style={{ color: '#e74c3c' }}>{errors.brand}</div>}

//              <label htmlFor="price" style={labelStyle}>
//               Price:
//             </label>
//             <input
//               id="price"
//               name="price"
//               type="number"
             
//               value={formData.price}
//               onChange={handleChange}
//               style={inputStyle('price')}
//               placeholder="Enter Price"
//             />
//             {errors.price && <div style={{ color: '#e74c3c' }}>{errors.price}</div>}

//             <button
//               type="button"
//               onClick={handleNext}
//               style={{
//                 width: '100%',
//                 padding: '18px',
//                 fontSize: 20,
//                 fontWeight: '700',
//                 backgroundColor: '#000000ff',
//                 color: '#fff',
//                 border: 'none',
//                 borderRadius: 8,
//                 cursor: 'pointer',
//                 marginTop: 24,
//               }}
//             >
//               Next
//             </button>
//           </>
//         )}

//         {page === 2 && (
//           <>
           

            

//             <label htmlFor="imageUrl" style={labelStyle}>
//               Main Photo URL:
//             </label>
//             <input
//               id="imageUrl"
//               name="imageUrl"
//               type="url"
//               value={formData.imageUrl}
//               onChange={handleChange}
//               style={inputStyle('imageUrl')}
//               placeholder="https://example.com/image.jpg"
//             />
//             {errors.imageUrl && <div style={{ color: '#e74c3c' }}>{errors.imageUrl}</div>}

//             <label htmlFor="description" style={labelStyle}>
//               Description:
//             </label>
//             <textarea
//               id="description"
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               style={{ ...inputStyle('description'), height: 100 }}
//               placeholder="Describe the venue"
//             />
//             {errors.description && <div style={{ color: '#e74c3c' }}>{errors.description}</div>}

           

//             <label htmlFor="agree" style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
//               <input
//                 id="agree"
//                 name="agree"
//                 type="checkbox"
//                 checked={formData.agree}
//                 onChange={handleChange}
//                 style={{ marginRight: 8 }}
//               />
//               I agree to the terms and conditions
//             </label>
//             {errors.agree && <div style={{ color: '#e74c3c' }}>{errors.agree}</div>}

//             <div style={{ marginTop: 24, display: 'flex', gap: '1rem' }}>
//               <button
//                 type="button"
//                 onClick={handleBack}
//                 style={{
//                   flex: 1,
//                   padding: '14px 20px',
//                   fontSize: 18,
//                   borderRadius: 6,
//                   border: '1px solid #ccc',
//                   cursor: 'pointer',
//                   backgroundColor: '#f0f0f0',
//                 }}
//               >
//                 Back
//               </button>

//              <button
//   type="submit"
//   disabled={isSubmitting}
//   style={{
//     flex: 1,
//     padding: '14px 20px',
//     fontSize: 18,
//     backgroundColor: '#000000ff',
//     color: 'white',
//     border: 'none',
//     borderRadius: 6,
//     cursor: 'pointer',
//   }}
// >
//   {isSubmitting ? 'Submitting...' : 'Submit'}
// </button>
//             </div>
//           </>
//         )}

//         {apiError && (
//           <div
//             style={{
//               marginTop: 24,
//               padding: 12,
//               backgroundColor: '#fce4e4',
//               color: '#e74c3c',
//               borderRadius: 6,
//               fontWeight: '600',
//             }}
//           >
//             {apiError}
//           </div>
//         )}
//       </form>
//       <ToastContainer />
//     </>
//   );
// };

// export default VenueAddTest;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { venueService } from '../../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VenueAddTest = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    venueName: '',
    quality: '',
    category: '',
    price: '',
    size: '',
    brand: '',
    files: [],
    description: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const fileArray = Array.from(files);
      setFormData({ ...formData, files: fileArray });
      
      // Create previews for selected images
      const previews = fileArray.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const fieldsPage1 = ['venueName', 'quality', 'category', 'price', 'size', 'brand'];
  const fieldsPage2 = ['description'];

  const validate = (fieldsToValidate = null) => {
    const newErrors = {};
    const isFullValidation = fieldsToValidate === null;
    const fields = fieldsToValidate || Object.keys(formData).filter(key => key !== 'files' && key !== 'status');
    
    fields.forEach((key) => {
      const value = formData[key];
      if (typeof value === 'string' && value.trim() === '') {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    });

    // Validate files when doing full validation (on submit) or when on page 2
    if (isFullValidation || page === 2) {
      if (!formData.files || formData.files.length === 0) {
        newErrors.files = 'At least one image is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate(fieldsPage1)) setPage(2);
  };

  const handleBack = () => setPage(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const formPayload = new FormData();
      const venueData = {
        venueName: formData.venueName.trim(),
        quality: formData.quality.trim(),
        category: formData.category.trim(),
        price: formData.price ? Number(formData.price) : 0,
        size: formData.size.trim(),
        brand: formData.brand.trim(),
        description: formData.description.trim(),
        status: 'active',
      };

      formPayload.append('venue', new Blob([JSON.stringify(venueData)], { type: "application/json" }));

      if (formData.files && formData.files.length > 0) {
        formData.files.forEach(file => formPayload.append('files', file));
      }

      await venueService.addVenueA(formPayload);
      toast.success('Venue added successfully!');
      
      // Clean up preview URLs
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
      
      setTimeout(() => navigate('/admin/venues'), 1500);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Venue add failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '16px 20px',
    fontSize: 18,
    borderRadius: 6,
    border: errors[field] ? '2px solid #e74c3c' : '1.5px solid #ccc',
    outline: 'none',
    marginBottom: 12,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    transition: 'border-color 0.3s ease',
  });

  const labelStyle = {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    display: 'block',
  };

  const removeImage = (index) => {
    // Revoke the preview URL
    URL.revokeObjectURL(imagePreviews[index]);
    
    // Remove from arrays
    const newFiles = formData.files.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setFormData({ ...formData, files: newFiles });
    setImagePreviews(newPreviews);
  };

  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(255, 255, 255) 100%)',
          padding: '2rem 1rem',
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: 700,
            margin: '2rem auto',
            padding: '3rem',
            background: '#ffffff',
            borderRadius: 16,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
          noValidate
        >
          <h1 
            style={{ 
              textAlign: 'center', 
              marginBottom: '0.5rem', 
              color: '#2c3e50',
              fontSize: '2.5rem',
              fontWeight: '700',
            }}
          >
            Add New Venue
          </h1>
          <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '2rem', fontSize: '1rem' }}>
            Step {page} of 2
          </p>

          {page === 1 && (
            <>
              <label htmlFor="venueName" style={labelStyle}>
                Product Name <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                id="venueName"
                name="venueName"
                type="text"
                value={formData.venueName}
                onChange={handleChange}
                style={inputStyle('venueName')}
                placeholder="Enter product name"
              />
              {errors.venueName && (
                <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '-8px', marginBottom: '12px' }}>
                  {errors.venueName}
                </div>
              )}

              <label htmlFor="quality" style={labelStyle}>
                Quality <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <select
                id="quality"
                name="quality"
                value={formData.quality}
                onChange={handleChange}
                style={inputStyle('quality')}
              >
                <option value="">Select Quality</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
              {errors.quality && (
                <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '-8px', marginBottom: '12px' }}>
                  {errors.quality}
                </div>
              )}

              <label htmlFor="category" style={labelStyle}>
                Category <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={inputStyle('category')}
              >
                <option value="">Select Category</option>
                <option value="Wedding Venues">Wedding Venues</option>
                <option value="Corporate Events">Corporate Events</option>
                <option value="Birthday Parties">Birthday Parties</option>
                <option value="Conferences">Conferences</option>
              </select>
              {errors.category && (
                <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '-8px', marginBottom: '12px' }}>
                  {errors.category}
                </div>
              )}

              <label htmlFor="price" style={labelStyle}>
                Price (NPR) <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                style={inputStyle('price')}
                placeholder="Enter price"
                min="0"
              />
              {errors.price && (
                <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '-8px', marginBottom: '12px' }}>
                  {errors.price}
                </div>
              )}

              <label htmlFor="size" style={labelStyle}>
                Size <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <select
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                style={inputStyle('size')}
              >
                <option value="">Select Size</option>
                <option value="XL">XL</option>
                <option value="L">L</option>
                <option value="M">M</option>
                <option value="S">S</option>
              </select>
              {errors.size && (
                <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '-8px', marginBottom: '12px' }}>
                  {errors.size}
                </div>
              )}

              <label htmlFor="brand" style={labelStyle}>
                Brand <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                id="brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleChange}
                style={inputStyle('brand')}
                placeholder="Enter brand name"
              />
              {errors.brand && (
                <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '-8px', marginBottom: '12px' }}>
                  {errors.brand}
                </div>
              )}

              <button
                type="button"
                onClick={handleNext}
                style={{
                  width: '100%',
                  padding: '18px',
                  fontSize: 20,
                  fontWeight: '700',
                  backgroundColor: '#000000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  marginTop: 24,
                  transition: 'background-color 0.3s ease',
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#333'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#000000'}
              >
                Next →
              </button>
            </>
          )}

          {page === 2 && (
            <>
              <label htmlFor="files" style={labelStyle}>
                Images <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                id="files"
                name="files"
                type="file"
                accept="image/*"
                onChange={handleChange}
                multiple
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: 16,
                  borderRadius: 6,
                  border: errors.files ? '2px solid #e74c3c' : '2px dashed #ccc',
                  outline: 'none',
                  marginBottom: 12,
                  backgroundColor: '#f9f9f9',
                  cursor: 'pointer',
                }}
              />
              {errors.files && (
                <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '-8px', marginBottom: '12px' }}>
                  {errors.files}
                </div>
              )}

              {imagePreviews.length > 0 && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                  gap: '1rem', 
                  marginBottom: '1.5rem',
                  marginTop: '1rem',
                }}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: '1px solid #ddd',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          cursor: 'pointer',
                          fontSize: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label htmlFor="description" style={labelStyle}>
                Description <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={{ 
                  ...inputStyle('description'), 
                  height: 120,
                  resize: 'vertical',
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                }}
                placeholder="Describe the product in detail..."
              />
              {errors.description && (
                <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '-8px', marginBottom: '12px' }}>
                  {errors.description}
                </div>
              )}

              <div style={{ marginTop: 24, display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    flex: 1,
                    padding: '16px 20px',
                    fontSize: 18,
                    fontWeight: '600',
                    borderRadius: 8,
                    border: '2px solid #ccc',
                    cursor: 'pointer',
                    backgroundColor: '#f8f9fa',
                    color: '#333',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#e9ecef';
                    e.target.style.borderColor = '#999';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.borderColor = '#ccc';
                  }}
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '16px 20px',
                    fontSize: 18,
                    fontWeight: '700',
                    backgroundColor: isSubmitting ? '#95a5a6' : '#000000',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    if (!isSubmitting) e.target.style.backgroundColor = '#333';
                  }}
                  onMouseOut={(e) => {
                    if (!isSubmitting) e.target.style.backgroundColor = '#000000';
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default VenueAddTest;

