import axios from "axios";
import { logout } from "./utils/auth";

// ✅ General API instance
const api = axios.create({
  baseURL: "http://localhost:5000",
});

// ✅ Auth API instance
const API = axios.create({
  baseURL: "http://localhost:5000/api/auth",
});

// Add authorization header + handle 401 globally
const addAuthInterceptors = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );
};

// Attach interceptors
addAuthInterceptors(API);
addAuthInterceptors(api);

// ================= AUTH API =================
export const registerUser = (userData) => API.post("/register", userData);
export const loginUser = (loginData) => API.post("/login", loginData);
export const forgotPassword = (emailData) => API.post("/forgot-password", emailData);
export const approveUser = (userId) => API.put(`/approve/${userId}`);
export const deleteUser = (userId) => API.delete(`/users/${userId}`);
export const getApprovedUsers = () => API.get("/users/approved");
export const getPendingUsers = () => API.get("/users/pending");
export const getPendingUsersCount = () => API.get("/users/pending/count");
export const getRejectedUsers = () => API.get("/users/rejected");
export const rejectUser = (userId) => API.put(`/reject/${userId}`);
export const updateUser = (userId, updatedData) => API.put(`/users/${userId}`, updatedData);

// ================= NOTIFICATIONS API =================
const NOTIFICATIONS_API = axios.create({
  baseURL: "http://localhost:5000/api/notifications",
});
addAuthInterceptors(NOTIFICATIONS_API);

export const getNotifications = (limit = 10) =>
  NOTIFICATIONS_API.get(`/?limit=${limit}`);
export const getUnreadNotificationsCount = () =>
  NOTIFICATIONS_API.get("/unread/count");
export const markNotificationAsRead = (notificationId) =>
  NOTIFICATIONS_API.put(`/${notificationId}/read`);
export const markAllNotificationsAsRead = () =>
  NOTIFICATIONS_API.put("/mark-all-read");

// ================= PROJECTS API =================
const PROJECTS_API = axios.create({
  baseURL: "http://localhost:5000/api/projects",
});
addAuthInterceptors(PROJECTS_API);

export const getProjectStats = () => PROJECTS_API.get("/stats");
export const getApprovedProjects = () => PROJECTS_API.get("/approved");
export const getAllProjects = () => PROJECTS_API.get("/all");
export const getUserProjects = () => PROJECTS_API.get("/user/projects");
export const getMyProjects = () => PROJECTS_API.get("/my-projects");
export const getApprovedProjectsForAssignment = () => PROJECTS_API.get("/approved-for-assignment");
export const getPendingProjects = () => PROJECTS_API.get("/pending");
export const getProjectById = (id) => PROJECTS_API.get(`/${id}`);
export const createProject = (projectData) => PROJECTS_API.post("/create", projectData);
export const updateProject = (id, projectData) => PROJECTS_API.put(`/update/${id}`, projectData);
export const deleteProject = (id) => PROJECTS_API.delete(`/delete/${id}`);
export const approveProject = (id) => PROJECTS_API.put(`/approve/${id}`);
export const rejectProject = (id) => PROJECTS_API.put(`/reject/${id}`);
export const getAdvanceTracingNumber = (projectId) => PROJECTS_API.get(`/${projectId}/advance-tracing-number`);

// ================= PLANS API =================
const PLANS_API = axios.create({
  baseURL: "http://localhost:5000/api/plans",
});
addAuthInterceptors(PLANS_API);

export const createPlan = (planData) => PLANS_API.post("/create", planData);
export const getAssignedProjects = () => PLANS_API.get("/assigned/projects");
export const getMyPlans = () => PLANS_API.get("/my-plans");
export const getPlansByProject = (projectId) =>
  PLANS_API.get(`/project/${projectId}`);
export const getPlanById = (planId) => PLANS_API.get(`/${planId}`);
export const updatePlan = (planId, planData) =>
  PLANS_API.put(`/${planId}`, planData);
export const updatePlanStatus = (planId, statusData) =>
  PLANS_API.put(`/${planId}/status`, statusData);
export const deletePlan = (planId) => PLANS_API.delete(`/${planId}`);
export const getPlansForUser = () => PLANS_API.get("/user/plans");
export const getAllViewablePlans = () => PLANS_API.get("/viewable-plans");

// ================= VALUATION API =================
export const saveValuation = (planId, lotId, valuationData) =>
  api.post(`/api/plans/${planId}/lots/${lotId}/valuation`, valuationData);
export const getValuation = (planId, lotId) =>
  api.get(`/api/plans/${planId}/lots/${lotId}/valuation`);
export const getValuationsByPlan = (planId) =>
  api.get(`/api/plans/${planId}/valuations`);

// ================= COMPENSATION API =================
export const saveCompensation = (planId, lotId, compensationData) =>
  api.post(`/api/plans/${planId}/lots/${lotId}/compensation`, compensationData);
export const getCompensation = (planId, lotId) =>
  api.get(`/api/plans/${planId}/lots/${lotId}/compensation`);
export const getCompensationsByPlan = (planId) =>
  api.get(`/api/plans/${planId}/compensations`);

// ================= LOTS API =================
const LOTS_API = axios.create({
  baseURL: "http://localhost:5000/api/lots",
});
addAuthInterceptors(LOTS_API);

// Lots
export const getLotsByPlan = (planId) => LOTS_API.get(`/plan/${planId}`);
export const getLotsByPlanWithRole = (planId) => LOTS_API.get(`/plan/${planId}/role-based`);
export const getLotById = (lotId) => LOTS_API.get(`/${lotId}`);
export const createLot = (lotData) => LOTS_API.post("/create", lotData);
export const updateLot = (lotId, lotData) =>
  LOTS_API.put(`/${lotId}`, lotData);
export const deleteLot = (lotId) => LOTS_API.delete(`/${lotId}`);
export const getLotsForUser = () => LOTS_API.get("/user/lots");
export const getAdvanceTracingNumbers = () => LOTS_API.get("/advance-tracing-numbers");

// Lot Owners
export const addOwnerToLot = (lotId, ownerData) =>
  LOTS_API.post(`/${lotId}/owners`, ownerData);
export const removeOwnerFromLot = (lotId, ownerId) =>
  LOTS_API.delete(`/${lotId}/owners/${ownerId}`);
export const getAllOwners = () => LOTS_API.get("/owners/all");

// Optional: fetch all owners linked to a specific lot
export const getOwnersByLot = (lotId) => LOTS_API.get(`/${lotId}/owners`);

// Land details
export const getLandDetails = (lotId) => LOTS_API.get(`/${lotId}/land-details`);
export const saveLandDetails = (lotId, landData) =>
  LOTS_API.post(`/${lotId}/land-details`, landData);
export const updateLotLandDetails = (lotId, landData) =>
  LOTS_API.put(`/${lotId}/land-details`, landData);

// ================= OWNERS API =================
const OWNERS_API = axios.create({
  baseURL: "http://localhost:5000/api",
});
addAuthInterceptors(OWNERS_API);

export const requestOtp = (nic, mobile) => OWNERS_API.post("/request-otp", { nic, mobile });
export const verifyOtp = (nic, mobile, otp) => OWNERS_API.post("/verify-otp", { nic, mobile, otp });
export const getLandownerDashboard = () => OWNERS_API.get("/dashboard");

export default api;
