import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SymptomChecker from "./pages/SymptomChecker";
import DoctorList from "./pages/DoctorList";
import BookAppointment from "./pages/BookAppointment";
import Chat from "./pages/Chat";
import MedicineOrder from "./pages/MedicineOrder";
import AdminAnalytics from "./pages/AdminAnalytics";

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  const routes = {
    admin: "/admin",
    doctor: "/doctor",
    patient: "/patient",
  };
  return <Navigate to={routes[user.role] || "/login"} />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<DashboardRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/patient"
          element={
            <PrivateRoute roles={["patient"]}>
              <PatientDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/symptom-checker"
          element={
            <PrivateRoute roles={["patient"]}>
              <SymptomChecker />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctors"
          element={
            <PrivateRoute roles={["patient"]}>
              <DoctorList />
            </PrivateRoute>
          }
        />
        <Route
          path="/book/:doctorId"
          element={
            <PrivateRoute roles={["patient"]}>
              <BookAppointment />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat/:appointmentId"
          element={
            <PrivateRoute roles={["patient", "doctor"]}>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/medicines"
          element={
            <PrivateRoute roles={["patient"]}>
              <MedicineOrder />
            </PrivateRoute>
          }
        />

        <Route
          path="/doctor"
          element={
            <PrivateRoute roles={["doctor"]}>
              <DoctorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminAnalytics />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
