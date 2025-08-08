// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";

import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import PlanDetail from "../pages/PlanDetail";
import Profile from "../pages/Profile";
import UserManagement from "../pages/UserManagement";
import Messages from "../pages/Messages";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Info from "../pages/Info";
import ProjectRequests from "../pages/ProjectRequests";

import MainLayout from "../layouts/MainLayout";


export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes With Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* Full Page Routes (No Layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboard Routes With Shared Layout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="plan/:id" element={<PlanDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="usermanagement" element={<UserManagement/>} />
        <Route path="messages" element={<Messages />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="info" element={<Info />} />
        <Route path="projectrequests" element={<ProjectRequests />} />
      </Route>
    </Routes>
  );
}
