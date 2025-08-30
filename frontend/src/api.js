import axios from "axios";

// ✅ Use /api/auth since backend is mounted there
const API = axios.create({
  baseURL: "http://localhost:5000/api/auth",
});

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

// ================= GET REJECTED USERS =================
export const getRejectedUsers = () => API.get("/users/rejected");

// ================= REJECT USER (for chief engineer) =================
export const rejectUser = (userId) => API.put(`/reject/${userId}`);

// ================= UPDATE USER =================
export const updateUser = (userId, updatedData) => API.put(`/users/${userId}`, updatedData);
