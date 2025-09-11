import axios from "axios";
import { mapService } from "./mapService"

// Axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

// Add request interceptor to add token to headers
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');  // or jwtToken based on your naming
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor to catch 401 errors and try refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = await authService.refresh();

      if (newAccessToken) {
        // Update header and retry original request
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return api(originalRequest);
      } else {
        // Refresh failed, logout user
        authService.logout();
      }
    }

    return Promise.reject(error);
  }
);

// Auth API services
const authService = {
 login: async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  if (response.data.accessToken) {
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    localStorage.setItem("jwtToken", response.data.token);
    localStorage.setItem('userId', response.data.id);
  }
  return response.data;
},

  signup: async (userData) => {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  },

  // partnerSignup: async (partnerData) => {
  //   const response = await api.post("/auth/partner-signup", partnerData);
  //   return response.data;
  // },

  requestPasswordReset: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },



logout: async () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  try {
      await fetch("http://localhost:8080/logout", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
      });
      console.log("Logged out successfully");
  } catch (error) {
      console.error("Error during logout:", error);
  }

  window.location.href = "/login";
},

 refresh: async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const response = await api.post("/auth/refresh", { refreshToken });
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      return response.data.accessToken;
    }
  } catch (error) {
    console.error("Refresh token error:", error);
    authService.logout();
  }
  return null;
},


requestPasswordReset: async (email) => {
    const response = await api.post("/auth/request-password-reset", { email });
    return response.data;
  },

  // FIXED: Now includes email parameter
  resetPassword: async (email, otpCode, password) => {
    const response = await api.post("/auth/reset-password", { 
      email, 
      otpCode, 
      password 
    });
    return response.data;
  },

  isAuthenticated: () => !!localStorage.getItem("jwtToken"),
};

// Venue API services
const venueService = {
 addVenue: async (venueData) => {
  const token = localStorage.getItem("jwtToken");
  console.log("Sending token:", token);
  const response = await api.post("/venues/new", venueData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
},

 addVenueA: async (venueData) => {
  const token = localStorage.getItem("jwtToken");
  console.log("Sending token:", token);
  const response = await api.post("/venues/add", venueData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
},

  getVenue: async (id) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.get(`/venues/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

listVenue: async () => {
  const token = localStorage.getItem('jwtToken');
  const response = await api.get("/venues", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
},

deleteVenue: async (id) => {
  try {
    const token = localStorage.getItem('jwtToken');
    await api.delete(`/venues/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Venue deleted successfully');
  } catch (error) {
    console.error('Failed to delete:', error);
  }
},

  editVenue: async (id, venueData) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.put(`/venues/edit/${id}`, venueData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  searchVenues: async (category, location) => {
    const params = {};
    // Only add parameters if they have a non-empty value
    if (category && category.trim() !== '') {
      params.category = category.trim();
      console.log('Adding category param:', params.category);
    }
    
    if (location && location.trim() !== '') {
      params.location = location.trim();
      console.log('Adding location param:', params.location);
    }
    
    console.log('API call params:', params);
    console.log('API endpoint:', '/venues/filter');
    
    try {
      const response = await api.get("/venues/filter", { params });
      console.log('API response status:', response.status);
      console.log('API response data:', response.data);
      
      // If location was provided but no results match, try a manual filter
      if (location && location.trim() !== '' && response.data.length === 0) {
        console.log('No results found with exact location match, trying manual filter');
        // Get all venues and filter manually for case-insensitive partial matches
        const allVenues = await api.get("/venues/filter");
        const filteredVenues = allVenues.data.filter(venue => 
          venue.location && venue.location.toLowerCase().includes(location.trim().toLowerCase())
        );
        console.log('Manual filtering results:', filteredVenues);
        return filteredVenues;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in searchVenues:', error);
      throw error;
    }
  },

};

// User API services
const userService = {
 listUsers: async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.get("/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  // Add new user
  addUser: async (userData) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.post("/admin/users/new", userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

// Get user details
  getUser: async (id) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.get(`/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  // Update user
  editUser: async (id, userData) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.put(`/admin/users/edit/${id}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

   // Delete user
  deleteUser: async (userId) => {
  try {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
  console.error('No JWT token found — user might need to log in again');
  return;
}
console.log('JWT Token:', token);
    const xsrfToken = getCookie('XSRF-TOKEN');
    const response = await api.delete(`/admin/users/delete/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
},


  changeUserStatus: async (id, status) => {

    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.patch(`/admin/users/status/${id}`, { status }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

const partnerService = {
  
listPartners: async () => {
  try {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      throw new Error('No JWT token found');
    }

    const response = await api.get("/admin/partners", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("API response data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching partners:", error);
    throw error;
  }
},
  
  getPartner: async (id) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.get(`/admin/partners/${id}`,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

    addPartner: async (partnerData) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.post("/admin/partners/new", partnerData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  editPartner: async (id, partnerData) => {
    try {
      
      const token = localStorage.getItem('jwtToken');
      const response = await api.put(`/admin/partners/edit/${id}`, partnerData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  deletePartner: async (id) => {
    try {
       const token = localStorage.getItem('jwtToken');
      const response = await api.delete(`/admin/partners/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  approvePartner: async (id) => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('No JWT token found');
      }

      const response = await api.put(`/admin/partners/approve/${id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error approving partner:', error);
      throw error;
    }
  },
  
  
};

export { api, authService, venueService, userService, partnerService,profileService ,imageService, mapService};

// Contact API service
const contactService = {
  sendMessage: async (contactData) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.post("/contact", contactData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Notifications API service
const notificationService = {

  createNotification: async (notificationData) => {
  try {
    const token = localStorage.getItem('jwtToken');
    const response = await api.post("/notifications/create", notificationData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
},

  getUserNotifications: async (userId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.get(`/notifications/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUnreadCount: async (userId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.get(`/notifications/user/${userId}/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getByStatus: async (userId, status) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.get(`/notifications/user/${userId}/status/${status}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  markAsRead: async (notificationId, userId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.put(`/notifications/${notificationId}/read?userId=${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  markAllAsRead: async (userId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.put(`/notifications/user/${userId}/mark-all-read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteNotification: async (notificationId, userId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.delete(`/notifications/${notificationId}?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  clearAllNotifications: async (userId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.delete(`/notifications/user/${userId}/clear-all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};


const bookingService = {

 createBooking: async (payload) => {
  const token = localStorage.getItem("jwtToken");
  const userId = localStorage.getItem("userId"); // Retrieve user ID

  // Include userId in the booking payload
  const updatedPayload = {
    ...payload,
    attendeeId: userId,
  };

  const response = await api.post("/bookings/new", updatedPayload, {
    headers: {
      Authorization: `Bearer ${token}`,
      
    },
  });

  return response.data;
},

    listBooking: async () => {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    console.error('No JWT token found. Please log in.');
    return null; // Or handle as appropriate
  }

  try {
    console.log('JWT Token:', token);
    const response = await api.get("/bookings", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Booking Data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error; // Or handle as appropriate
  }
},


 getUserBookings: async (userId) => {
  try {
    const token = localStorage.getItem('jwtToken');
    const response = await api.get(`/bookings/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
},

  getBookingById: async (bookingId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.get(`/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  editBooking: async (bookingId,bookingData) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await api.put(`/bookings/edit/${bookingId}`, bookingData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getBookingsByVenueAndDate: async (venueId, date) => {
  try {
    const token = localStorage.getItem('jwtToken');
    const response = await api.get(`/bookings?venueId=${venueId}&date=${date}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching venue bookings:', error);
    throw error;
  }
},
deleteBooking: async (bookingId) => {
  const token = localStorage.getItem("jwtToken");
  try {
    const response = await api.delete(`/bookings/delete/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
},

};

const profileService = {
  getProfile: async () => {
  const token = localStorage.getItem('jwtToken');
  const response = await api.get('/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
},


  updateProfile: async (profileData) => {
    const token = localStorage.getItem('jwtToken');
    const response = await api.put('/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

const imageService = {
  getImage: async (venue_id) => {
    const token = localStorage.getItem('jwtToken');

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await api.get(`/proxy/image?venue_id=${venue_id}`, {
        headers,
        responseType: 'blob',
        Authorization: `Bearer ${token}`
      });
      return response.data;  // blob data
    } catch (error) {
      console.error('Error fetching image:', error);
      throw error;
    }
  },
};





export { contactService, notificationService, bookingService };
// // In your services/api.js file
// const adduserService = {
//   // ... other user service methods
  
//   createUser: async (userData) => {
//     try {
//       const token = localStorage.getItem('jwtToken');
//       const response = await api.post('/admin/users', userData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   },

//   updateUserStatus: async (id, status) => {
//     try {
//       const token = localStorage.getItem('jwtToken');
//       const response = await api.patch(`/admin/users/status/${id}`, { status }, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   },
// };
// export { adduserService }

// Additional user creation service (if needed separately)
// const adduserService = {
//   createUser: async (userData) => {
//     const response = await api.post("/admin/users", userData, {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//     return response.data;
//   },
// };

// export { api, authService, venueService, userService, adduserService };