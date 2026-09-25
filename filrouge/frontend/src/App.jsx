import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Donors from "./pages/Donors";
import Urgent from "./pages/Urgent";
import CreateRequest from "./pages/CreateRequest";
import MyRequests from "./pages/MyRequests";
import RequestDetails from "./pages/RequestDetails";
import MyAppointments from "./pages/MyAppointments";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

function WithLayout({ children }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <WithLayout>
                  <Dashboard />
                </WithLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/donors"
            element={
              <ProtectedRoute>
                <WithLayout>
                  <Donors />
                </WithLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/urgent"
            element={
              <ProtectedRoute>
                <WithLayout>
                  <Urgent />
                </WithLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/urgent/new"
            element={
              <ProtectedRoute>
                <WithLayout>
                  <CreateRequest />
                </WithLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/urgent/mine"
            element={
              <ProtectedRoute>
                <WithLayout>
                  <MyRequests />
                </WithLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/urgent/:id"
            element={
              <ProtectedRoute>
                <WithLayout>
                  <RequestDetails />
                </WithLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <WithLayout>
                  <MyAppointments />
                </WithLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <WithLayout>
                  <Profile />
                </WithLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <WithLayout>
                  <AdminDashboard />
                </WithLayout>
              </AdminRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}