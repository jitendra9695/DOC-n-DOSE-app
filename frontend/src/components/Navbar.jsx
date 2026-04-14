import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-sky-600 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold">🏥 DocNDoSe</div>
      <div className="flex items-center gap-4">
        <span className="text-sm bg-sky-700 px-3 py-1 rounded-full capitalize">
          {user?.role}
        </span>
        <span className="text-sm">{user?.first_name || user?.username}</span>
        <button
          onClick={handleLogout}
          className="bg-white text-sky-600 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-sky-50 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
