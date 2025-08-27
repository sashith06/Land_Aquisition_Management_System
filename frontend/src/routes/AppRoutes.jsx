
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import DashboardSelector from "../pages/DashboardSelector";

import DashboardLayout from "../layouts/DashboardLayout";
import CEDashboardLayout from "../layouts/CEDashboardLayout";
import PEDashboardLayout from "../layouts/PEDashboardLayout";
import Dashboard from "../pages/Dashboards/Dashboard";
import PlanDetail from "../pages/PlanDetail";
import Profile from "../pages/Profile";
import Analysis from "../pages/Analysis";
import Messages from "../pages/Messages";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Info from "../pages/Info";

import MainLayout from "../layouts/MainLayout";
import LandownerLogin from "../pages/Landowner/Landownerlogin"; 
import LODashboard from "../pages/Landowner/landownerdashboard/LODashboard";

import CEDashboardMain from "../pages/ChiefEngineer/CEDashboardMain";
import UserManagement from "../pages/ChiefEngineer/UserManagement";
import ProjectRequests from "../pages/ChiefEngineer/ProjectRequests";

import PEDashboardMain from "../pages/ProjectEngineer/PEDashboardMain";
import CreateProject from "../pages/ProjectEngineer/CreateProject";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes With Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/landowner" element={<LandownerLogin />} /> 
        
      </Route>

      {/* Full Page Routes (No Layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboards" element={<DashboardSelector />} />
      <Route path="/lodashboard" element={<LODashboard />} />

      {/* Chief Engineer Dashboard Routes With CE Layout */}
      <Route path="/ce-dashboard" element={<CEDashboardLayout />}>
        <Route index element={<CEDashboardMain />} />
        <Route path="analysis" element={<Analysis />} />
        <Route path="messages" element={<Messages />} />
        <Route path="reports" element={<Reports />} />
        <Route path="user-management" element={<UserManagement />} />
        <Route path="project-requests" element={<ProjectRequests />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Project Engineer Dashboard Routes With PE Layout */}
      <Route path="/pe-dashboard" element={<PEDashboardLayout />}>
        <Route index element={<PEDashboardMain />} />
        <Route path="analysis" element={<Analysis />} />
        <Route path="messages" element={<Messages />} />
        <Route path="reports" element={<Reports />} />
        <Route path="create-project" element={<CreateProject />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Regular Dashboard Routes With Shared Layout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="plan/:id" element={<PlanDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="analysis" element={<Analysis />} />
        <Route path="messages" element={<Messages />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="info" element={<Info />} />
      </Route>
    </Routes>
  );
}
