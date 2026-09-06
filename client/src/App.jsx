import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Pages
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

// Citizen Pages
import CitizenDashboard from './pages/citizen/Dashboard.jsx';
import ReportIssue from './pages/citizen/ReportIssue.jsx';
import MyComplaints from './pages/citizen/MyComplaints.jsx';
import CitizenComplaintDetail from './pages/citizen/ComplaintDetail.jsx';
import CivicMap from './pages/citizen/CivicMap.jsx';

// Officer Pages
import OfficerDashboard from './pages/officer/Dashboard.jsx';
import OfficerComplaintDetail from './pages/officer/ComplaintDetail.jsx';
import OfficerWorkOrders from './pages/officer/WorkOrders.jsx';
import OfficerRouteMap from './pages/officer/RouteMap.jsx';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminComplaints from './pages/admin/Complaints.jsx';
import AdminLiveMap from './pages/admin/LiveMap.jsx';
import AdminAnalytics from './pages/admin/Analytics.jsx';
import AdminDepartments from './pages/admin/Departments.jsx';
import AdminHotspots from './pages/admin/Hotspots.jsx';
import AdminUsers from './pages/admin/Users.jsx';

// Profile Page
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Citizen Protected Routes */}
              <Route
                path="/citizen"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<CitizenDashboard />} />
                <Route path="report" element={<ReportIssue />} />
                <Route path="complaints" element={<MyComplaints />} />
                <Route path="complaints/:id" element={<CitizenComplaintDetail />} />
                <Route path="map" element={<CivicMap />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Officer Protected Routes */}
              <Route
                path="/officer"
                element={
                  <ProtectedRoute allowedRoles={['officer']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<OfficerDashboard />} />
                <Route path="complaints" element={<OfficerWorkOrders />} />
                <Route path="assignments" element={<Navigate to="/officer/complaints" replace />} />
                <Route path="complaints/:id" element={<OfficerComplaintDetail />} />
                <Route path="map" element={<OfficerRouteMap />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="complaints" element={<AdminComplaints />} />
                <Route path="map" element={<AdminLiveMap />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="departments" element={<AdminDepartments />} />
                <Route path="hotspots" element={<AdminHotspots />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="officers" element={<AdminUsers />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}
