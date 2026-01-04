import axios from "axios";
import { mapService } from "./mapService"

// Axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080",
  headers: {
    // "Content-Type": "application/json",
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

  // signup: async (userData) => {
  //   const response = await api.post("/auth/signup", userData);
  //   return response.data;
  // },

  signup: async (userData) => {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  },

signupPartner: async (partnerData) => {
  const response = await api.post(
    "/auth/signupPartner",
    partnerData,  
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
},

  requestPasswordReset: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },



logout: async () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

     // 2️⃣ Clear user context if provided
  // if (setUser) setUser(null);

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

  verifyOtp: async ({email, otp}) => {
  const response = await api.post("/auth/verify-signup-otp", { 
    email, 
    otp 
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

  
  updateLocation: async (id, location) => {
    try {
      const token = localStorage.getItem("jwtToken");
       const response = await api.put(`/admin/users/update-location/${id}`, { location },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
    }
  },

  // getCurrentUser: async (token) => {
  //   try {
  //     const response = await api.get("admin/users/me", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     return response.data; // contains location, email, user_id
  //   } catch (err) {
  //     throw err;
  //   }
  // },

  getCurrentUser: async () => {
  try {
    const token = localStorage.getItem("jwtToken");
    if (!token) throw new Error("No JWT token found");

    const response = await api.get("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    console.error("getCurrentUser error:", err);
    throw err;
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
      const token = localStorage.getItem("jwtToken");
      const response = await api.post("/contacts/new", contactData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // necessary for FormData
        },
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

  // updateBookingStatus: async (bookingId,status) => {
  //   try {
  //     const token = localStorage.getItem('jwtToken');
  //     const response = await api.put(`/bookings/${bookingId}/${status}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`
  //       }
  //     });
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // },
  updateBookingStatus: async (bookingId, status) => {
  try {
    const token = localStorage.getItem("jwtToken");
    const headers = {};

    if (token && token !== "null" && token !== "undefined") {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await api.put(
      `/bookings/${bookingId}/status/${status}`, // make sure your backend URL matches
      {}, // empty body
      { headers } // headers go here, not in the body
    );

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

// Donation APIs
const donationAPI = {
  // Add new donation
  addDonation: async (donationData) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await api.post("/donations/new", {...donationData, program:{programId: donationData.programId}}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get donation details by ID
  getDonation: async (id) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await api.get(`/donations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
   // ✅ Get all donations
   listDonations: async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await api.get("/donations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(typeof response.data)
      return response.data
    } catch (error) {
      throw error;
    }
  },

  updateDonationStatus: async (donationId, status) => {
  try {
    const token = localStorage.getItem("jwtToken");

    const headers = {};

    if (token && token !== "null" && token !== "undefined") {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await api.put(
      `/donations/${donationId}/status/${status}`, // must match backend
      {}, 
      { headers }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
},

  // ✅ Delete donation by ID
  deleteDonation: async (id) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await api.delete(`/donations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  assignToAdmin: async (donationId) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await api.put(`/donations/${donationId}/assign-admin`, {}, { headers });
      return response.data;
    } catch (error) {
       throw error;
    }
  },
};




export { donationAPI };

// Program APIs
const programService = {

  // Add new program
  addProgram: async (programData) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await api.post("/programs/add", programData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all programs
  listPrograms: async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await api.get("/programs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get program by ID
  getProgram: async (id) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await api.get(`/programs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update program
  updateProgram: async (id, programData) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await api.put(`/programs/edit/${id}`, programData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete program
  deleteProgram: async (id) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await api.delete(`/programs/delete/${id}`, {
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

export { programService };

const uploadProgramImage = async (programId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`http://localhost:8080/api/files/program/${programId}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");

  const imageUrl = await res.text(); // this is the Cloudinary URL
  return imageUrl;
};


export const cartService = {
  getUserCart: async (userId) => {
    const token = localStorage.getItem("jwtToken");
    const res = await fetch(`http://localhost:8080/cart/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return res.json();
  },

  addItem: async (userId, venueId, quantity) => {
    const token = localStorage.getItem("jwtToken");
    const res = await fetch(
      `http://localhost:8080/cart/add?userId=${userId}&venueId=${venueId}&quantity=${quantity}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );
    return res.json();
  },

  updateItem: async (cartItemId, quantity) => {
    const token = localStorage.getItem("jwtToken");
    const res = await fetch(
      `http://localhost:8080/cart/update/${cartItemId}?quantity=${quantity}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );
    return res.json();
  },

  removeItem: async (cartItemId) => {
    const token = localStorage.getItem("jwtToken");
    return fetch(`http://localhost:8080/cart/remove/${cartItemId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  },

  clearCart: async (userId) => {
    const token = localStorage.getItem("jwtToken");
    return fetch(`http://localhost:8080/cart/clear/${userId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  },
};



export const orderAPI = {
  // Checkout: create order
  // checkout: async (orderData) => {
  //   try {
  //     const token = localStorage.getItem('jwtToken');
  //     const headers = {};

  //     if (token && token !== 'null' && token !== 'undefined') {
  //       headers.Authorization = `Bearer ${token}`;
  //     }

  //     const response = await api.post('/api/orders/checkout', orderData, { headers });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Checkout failed:', error);
  //     throw error;
  //   }
  // },

   checkout: async (orderData) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const headers = {};
      if (token && token !== 'null' && token !== 'undefined') {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await api.post('/api/orders/checkout', orderData, { headers });
      return response.data; // <-- keep returning the data as-is
    } catch (error) {
      console.error('Checkout failed:', error);
      throw error;
    }
  },

   initiateEsewaPayment: async (orderId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const headers = {};
      if (token && token !== 'null' && token !== 'undefined') {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await api.post(`/api/payments/esewa/initiate/${orderId}`, {}, { headers });
      return response.data;
    } catch (error) {
      console.error('eSewa payment initiation failed:', error);
      throw error;
    }
  },



  getCurrentUser: async (token) => {
    try {
      const response = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      console.error("Failed to fetch current user:", err);
      throw err;
    }
  },

   // Get all orders of a user
  getUserOrders: async (userId) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const headers = {};
      if (token && token !== "null" && token !== "undefined") {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await api.get(`/api/orders/user/${userId}`, { headers });
      return response.data;
    } catch (error) {
      console.error("Fetching user orders failed:", error);
      return [];
    }
  },

  // Get all orders
  listOrders: async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const headers = {};
      if (token && token !== 'null' && token !== 'undefined') {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await api.get('/api/orders', { headers });
      return response.data;
    } catch (error) {
      console.error('Fetching orders failed:', error);
      throw error;
    }
  },

  // Get single order
  getOrder: async (orderId) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const headers = {};
      if (token && token !== 'null' && token !== 'undefined') {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await api.get(`/api/orders/${orderId}`, { headers });
      return response.data;
    } catch (error) {
      console.error('Fetching order failed:', error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const token = localStorage.getItem('jwtToken');
      const headers = {};
      if (token && token !== 'null' && token !== 'undefined') {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await api.put(`/api/orders/${orderId}/status/${status}`, {}, { headers });
      return response.data;
    } catch (error) {
      console.error('Updating order status failed:', error);
      throw error;
    }
  },
};


const productService = {
  // GET all products
  listProducts: async () => {
    const token = localStorage.getItem("jwtToken");
    const response = await api.get("/products/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // GET product by ID
  getProduct: async (id) => {
    const token = localStorage.getItem("jwtToken");
    const response = await api.get(`/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // CREATE product
  addProduct: async (productData) => {
    const token = localStorage.getItem("jwtToken");
    const response = await api.post("/products/new", productData, {
      headers: {
        Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // UPDATE product
  editProduct: async (id, productData) => {
    const token = localStorage.getItem("jwtToken");
    const response = await api.put(`/products/update/${id}`, productData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // DELETE product
  deleteProduct: async (id) => {
    const token = localStorage.getItem("jwtToken");
    const response = await api.delete(`/products/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // SEARCH products
  searchProducts: async (params) => {
    // params is an object: { category, brand, tag }
    const token = localStorage.getItem("jwtToken");
    const response = await api.get("/products/filter", {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default productService;

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