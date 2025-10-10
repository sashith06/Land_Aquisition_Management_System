import axios from "axios";
import { logout } from "./utils/auth";

// ✅ Create a general API instance for all endpoints
const api = axios.create({
  baseURL: "http://localhost:5000",
});

// ✅ Use /api/auth since backend is mounted there  
const API = axios.create({
  baseURL: "http://localhost:5000/api/auth",
});

// Add authorization header to all requests
const addAuthInterceptors = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Handle token expiration
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Use the logout utility function
        logout();
      }
      return Promise.reject(error);
    }
  );
};

// Add interceptors to both instances
addAuthInterceptors(API);
addAuthInterceptors(api);

// Export default api instance for general use
export default api;

// ================= REGISTER USER =================
export const registerUser = (userData) => API.post("/register", userData);

// ================= LOGIN USER =================
export const loginUser = (loginData) => API.post("/login", loginData);

// ================= FORGOT PASSWORD =================
export const forgotPassword = (emailData) => API.post("/forgot-password", emailData);

// ================= APPROVE USER (for chief engineer) =================
export const approveUser = (userId) => API.put(`/approve/${userId}`);

// ================= DELETE USER =================
export const deleteUser = (userId) => API.delete(`/users/${userId}`);

// ================= GET APPROVED USERS =================
export const getApprovedUsers = () => API.get("/users/approved");

// ================= GET PENDING USERS =================
export const getPendingUsers = () => API.get("/users/pending");

// ================= GET PENDING USERS COUNT =================
export const getPendingUsersCount = () => API.get("/users/pending/count");

// ================= GET REJECTED USERS =================
export const getRejectedUsers = () => API.get("/users/rejected");

// ================= REJECT USER (for chief engineer) =================
export const rejectUser = (userId) => API.put(`/reject/${userId}`);

// ================= UPDATE USER =================
export const updateUser = (userId, updatedData) => API.put(`/users/${userId}`, updatedData);

// ================= NOTIFICATIONS =================
const NOTIFICATIONS_API = axios.create({
  baseURL: "http://localhost:5000/api/notifications",
});

// Add authorization header to notification requests  
addAuthInterceptors(NOTIFICATIONS_API);

export const getNotifications = (limit = 10) => NOTIFICATIONS_API.get(`/?limit=${limit}`);

export const getUnreadNotificationsCount = () => NOTIFICATIONS_API.get("/unread/count");

export const markNotificationAsRead = (notificationId) => NOTIFICATIONS_API.put(`/${notificationId}/read`);

export const markAllNotificationsAsRead = () => NOTIFICATIONS_API.put("/mark-all-read");

// ================= PLANS API =================
const PLANS_API = axios.create({
  baseURL: "http://localhost:5000/api/plans",
});

// Add authorization header to plan requests  
addAuthInterceptors(PLANS_API);

export const createPlan = (planData) => PLANS_API.post("/create", planData);

export const getAssignedProjects = () => PLANS_API.get("/assigned/projects");

export const getMyPlans = () => PLANS_API.get("/my-plans");

export const getPlansByProject = (projectId) => PLANS_API.get(`/project/${projectId}`);

export const getPlanById = (planId) => PLANS_API.get(`/${planId}`);

export const updatePlan = (planId, planData) => PLANS_API.put(`/${planId}`, planData);

export const deletePlan = (planId) => PLANS_API.delete(`/${planId}`);

// ================= VALUATION API =================
export const saveValuation = (planId, lotId, valuationData) => 
  api.post(`/api/plans/${planId}/lots/${lotId}/valuation`, valuationData);

export const getValuation = (planId, lotId) => 
  api.get(`/api/plans/${planId}/lots/${lotId}/valuation`);

export const getValuationsByPlan = (planId) => 
  api.get(`/api/plans/${planId}/valuations`);

// ================= COMPENSATION API (Standard pattern like valuation) =================
export const saveCompensation = (planId, lotId, compensationData) => 
  api.post(`/api/plans/${planId}/lots/${lotId}/compensation`, compensationData);

export const getCompensation = (planId, lotId) => 
  api.get(`/api/plans/${planId}/lots/${lotId}/compensation`);

export const getCompensationsByPlan = (planId) => 
  api.get(`/api/plans/${planId}/compensations`);

// ================= OTP API =================
const OTP_API = axios.create({
  baseURL: "http://localhost:5000/api/otp",
});

// Add authorization headers if needed (optional for OTP)
addAuthInterceptors(OTP_API);

// Generate OTP
export const generateOTP = (emailData) => OTP_API.post("/generate", emailData);

// Reset password with OTP (combined verify + reset)
export const resetPasswordWithOTP = (resetData) => OTP_API.post("/reset-password", resetData);

// Optional: Cleanup OTPs (cron job or admin use)
export const cleanupOTPs = () => OTP_API.delete("/cleanup");

// ================= INQUIRIES API =================
export const getUnreadInquiriesCount = () => api.get('/api/inquiries/unread-count');
export const getRecentInquiries = (limit = 10) => api.get(`/api/inquiries/recent?limit=${limit}`);
export const markInquiryAsRead = (inquiryId) => api.put(`/api/inquiries/${inquiryId}/read`);

// ================= PAYMENT DETAILS API (New detailed system) =================
// Save or update payment details for a specific owner
export const savePaymentDetails = (planId, lotId, ownerNic, paymentData) => 
  api.post(`/api/plans/${planId}/lots/${lotId}/owners/${ownerNic}/payment-details`, paymentData);

// Get payment details for a specific owner
export const getPaymentDetailsByOwner = (planId, lotId, ownerNic) => 
  api.get(`/api/plans/${planId}/lots/${lotId}/owners/${ownerNic}/payment-details`);

// Update payment details for a specific owner
export const updatePaymentDetails = (planId, lotId, ownerNic, paymentData) => 
  api.put(`/api/plans/${planId}/lots/${lotId}/owners/${ownerNic}/payment-details`, paymentData);

// Delete payment details for a specific owner
export const deletePaymentDetails = (planId, lotId, ownerNic) => 
  api.delete(`/api/plans/${planId}/lots/${lotId}/owners/${ownerNic}/payment-details`);

// Get all payment details for a specific lot
export const getPaymentDetailsByLot = (planId, lotId) => 
  api.get(`/api/plans/${planId}/lots/${lotId}/compensation`);

// Get all payment details for a specific plan
export const getPaymentDetailsByPlan = (planId) => 
  api.get(`/api/plans/${planId}/compensations`);

// Get payment summary for a specific plan
export const getPaymentSummary = (planId) => 
  api.get(`/api/plans/${planId}/compensations/summary`);
