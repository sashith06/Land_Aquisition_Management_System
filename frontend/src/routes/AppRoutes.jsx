
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgetPassword from "../pages/Forgetpassword";
import ResetPassword from "../pages/ResetPassword";
import Unauthorized from "../pages/Unauthorized";

import DashboardLayout from "../layouts/DashboardLayout";
import CEDashboardLayout from "../layouts/CEDashboardLayout";
import PEDashboardLayout from "../layouts/PEDashboardLayout";
import FODashboardLayout from "../layouts/FODashboardLayout";
import Dashboard from "../pages/Dashboards/Dashboard";
import PlanDetail from "../pages/PlanDetail";
import Profile from "../pages/Profile";
import Analysis from "../pages/Analysis";
import Messages from "../pages/Messages";
import Reports from "../pages/Reports";

import MainLayout from "../layouts/MainLayout";
import LandownerLogin from "../pages/Landowner/Landownerlogin"; 
import LODashboard from "../pages/Landowner/landownerdashboard/LODashboard";

import UserManagement from "../pages/ChiefEngineer/UserManagement";
import ProjectRequests from "../pages/ChiefEngineer/ProjectRequests";
import CEProjectPlans from "../pages/ChiefEngineer/CEProjectPlans";
import CEDashboardMain from "../pages/ChiefEngineer/CEDashboardMain";

import PEDashboardMain from "../pages/ProjectEngineer/PEDashboardMain";
import CreateProject from "../pages/ProjectEngineer/CreateProject";
import EditProject from "../pages/ProjectEngineer/EditProject";
import ProjectAssignment from "../pages/ProjectEngineer/ProjectAssignment";
import PEProjectPlans from "../pages/ProjectEngineer/PEProjectPlans";

import FODashboardMain from "../pages/FinancialOfficer/FODashboardMain";
import FinancialDetails from "../pages/FinancialOfficer/FinancialDetails";

import LODashboardLayout from "../layouts/LODashboardLayout";
import LODashboardMain from "../pages/LandOfficer/LODashboardMain";
import CreatePlan from "../pages/LandOfficer/CreatePlan";
import ProjectPlans from "../pages/LandOfficer/ProjectPlans";
import AssignedProjects from "../pages/LandOfficer/AssignedProjects";

import LotsPage from "../pages/LotsPage";
import LotDetail from "../pages/LotDetail";

import { 
  ChiefEngineerRoute, 
  ProjectEngineerRoute, 
  FinancialOfficerRoute, 
  LandOfficerRoute, 
  AnyOfficerRoute 
} from "../components/ProtectedRoute";

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
      <Route path="/forget-password" element={<ForgetPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/lodashboard" element={<LODashboard />} />

      {/* Chief Engineer Dashboard Routes With CE Layout */}
      <Route path="/ce-dashboard" element={
        <ChiefEngineerRoute>
          <CEDashboardLayout />
        </ChiefEngineerRoute>
      }>
        <Route index element={<CEDashboardMain />} />
        <Route path="project/:projectId/plans" element={<CEProjectPlans />} />
        <Route path="plan/:planId/lots" element={<LotsPage />} />
        <Route path="plan/:planId/lots/:lotId" element={<LotDetail />} />
        <Route path="analysis" element={<Analysis />} />
        <Route path="messages" element={<Messages />} />
        <Route path="reports" element={<Reports />} />
        <Route path="user-management" element={<UserManagement />} />
        <Route path="project-requests" element={<ProjectRequests />} />
        {/* No profile route for Chief Engineer (admin) */}
      </Route>

      {/* Project Engineer Dashboard Routes With PE Layout */}
      <Route path="/pe-dashboard" element={
        <ProjectEngineerRoute>
          <PEDashboardLayout />
        </ProjectEngineerRoute>
      }>
        <Route index element={<PEDashboardMain />} />
        <Route path="project/:projectId/plans" element={<PEProjectPlans />} />
        <Route path="plan/:planId/lots" element={<LotsPage />} />
        <Route path="plan/:planId/lots/:lotId" element={<LotDetail />} />
        <Route path="analysis" element={<Analysis />} />
        <Route path="messages" element={<Messages />} />
        <Route path="reports" element={<Reports />} />
        <Route path="create-project" element={<CreateProject />} />
        <Route path="edit-project/:projectId" element={<EditProject />} />
        <Route path="project-assignment" element={<ProjectAssignment />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Financial Officer Dashboard Routes With FO Layout */}
      <Route path="/fo-dashboard" element={
        <FinancialOfficerRoute>
          <FODashboardLayout />
        </FinancialOfficerRoute>
      }>
        <Route index element={<FODashboardMain />} />
        <Route path="plan/:planId/lots" element={<LotsPage />} />
        <Route path="plan/:planId/lots/:lotId" element={<LotDetail />} />
        <Route path="financial-details/:projectId" element={<FinancialDetails />} />
        <Route path="analysis" element={<Analysis />} />
        <Route path="messages" element={<Messages />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Land Officer Dashboard Routes With LO Layout */}
      <Route path="/lo-dashboard" element={
        <LandOfficerRoute>
          <LODashboardLayout />
        </LandOfficerRoute>
      }>
        <Route index element={<LODashboardMain />} />
        <Route path="create-plan/:projectId" element={<CreatePlan />} />
        <Route path="edit-plan/:id" element={<CreatePlan />} />
        <Route path="project/:projectId/plans" element={<ProjectPlans />} />
        <Route path="assigned-projects" element={<AssignedProjects />} />
        <Route path="plan/:planId/lots" element={<LotsPage />} />
        <Route path="plan/:planId/lots/:lotId" element={<LotDetail />} />
        <Route path="analysis" element={<Analysis />} />
        <Route path="messages" element={<Messages />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Land Officer Dashboard Routes With Shared Layout */}
      <Route path="/dashboard" element={
        <LandOfficerRoute>
          <DashboardLayout />
        </LandOfficerRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="create-plan" element={<CreatePlan />} />
        <Route path="edit-plan/:id" element={<CreatePlan />} />
        <Route path="plan/:id" element={<PlanDetail />} />
        <Route path="plan/:planId/lots" element={<LotsPage />} />
        <Route path="plan/:planId/lots/:lotId" element={<LotDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="analysis" element={<Analysis />} />
        <Route path="messages" element={<Messages />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}
