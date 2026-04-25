import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";

// ── Color Palette ────────────────────────────────────────────────────
const COLORS = [
  "#6366f1",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];
const SPEC_COLORS = {
  general: "#6366f1",
  cardiologist: "#ef4444",
  dermatologist: "#f59e0b",
  neurologist: "#8b5cf6",
  orthopedic: "#06b6d4",
  pediatrician: "#10b981",
  psychiatrist: "#ec4899",
  gynecologist: "#f97316",
  ent: "#14b8a6",
  ophthalmologist: "#3b82f6",
  dentist: "#84cc16",
  urologist: "#a855f7",
};

// ── Custom Tooltip ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, prefix = "₹" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-gray-400 text-xs mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-sm font-bold">
            {p.name}: {prefix}
            {typeof p.value === "number"
              ? p.value.toLocaleString("en-IN")
              : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ── KPI Card ─────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, sub, color, trend }) => (
  <div
    className={`relative overflow-hidden rounded-2xl p-5 ${color} text-white`}
  >
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
    <div className="absolute bottom-0 right-4 w-16 h-16 rounded-full bg-white/5 translate-y-4" />
    <div className="relative">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-black tracking-tight">{value}</div>
      <div className="text-sm opacity-80 font-medium">{label}</div>
      {sub && <div className="text-xs opacity-60 mt-1">{sub}</div>}
      {trend !== undefined && (
        <div
          className={`text-xs mt-2 font-bold ${trend >= 0 ? "text-green-300" : "text-red-300"}`}
        >
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last week
        </div>
      )}
    </div>
  </div>
);

// ── Section Header ────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">
      {icon}
    </div>
    <div>
      <h2 className="text-xl font-black text-gray-900">{title}</h2>
      {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
    </div>
  </div>
);

// ── Chart Card ────────────────────────────────────────────────────────
const ChartCard = ({ title, children, action }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div className="flex justify-between items-center mb-5">
      <h3 className="font-black text-gray-800 text-base">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

// ── Notification Modal ────────────────────────────────────────────────
const NotificationModal = ({ doctors, onClose, onSend }) => {
  const [form, setForm] = useState({
    doctor_id: "",
    message: "",
    type: "suggestion",
  });
  const [loading, setLoading] = useState(false);

  const templates = {
    fee_increase: (name) =>
      `Dear ${name}, Based on your excellent performance and high patient satisfaction, we recommend increasing your consultation fee by ₹100-200 to reflect your expertise.`,
    fee_decrease: (name) =>
      `Dear ${name}, To attract more patients and increase your appointment volume, consider reducing your consultation fee slightly for the next 30 days.`,
    performance: (name) =>
      `Dear ${name}, Congratulations! Your appointment completion rate is excellent. Keep up the great work!`,
    availability: (name) =>
      `Dear ${name}, We noticed your available slots are filling up quickly. Consider extending your working hours to accommodate more patients.`,
    warning: (name) =>
      `Dear ${name}, Your approval rate for appointments has been lower than expected. Please review your availability and response time.`,
  };

  const fillTemplate = (key) => {
    const doc = doctors.find((d) => d.id === parseInt(form.doctor_id));
    const name = doc ? doc.name : "Doctor";
    setForm((f) => ({ ...f, message: templates[key](name) }));
  };

  const handleSend = async () => {
    if (!form.message.trim()) return toast.error("Message likhein");
    setLoading(true);
    try {
      await api.post("/auth/admin/notifications/", {
        doctor_id: form.doctor_id || null,
        message: form.message,
        type: form.type,
      });
      toast.success("Notification sent! ✅");
      onSend();
      onClose();
    } catch {
      toast.error("Failed to send");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-white text-xl font-black">
                Send Notification / Suggestion
              </h2>
              <p className="text-indigo-200 text-sm">
                Direct message to doctors from admin
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl font-light"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">
                Send To
              </label>
              <select
                value={form.doctor_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, doctor_id: e.target.value }))
                }
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-indigo-500 outline-none text-sm"
              >
                <option value="">📢 All Doctors (Broadcast)</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialization}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 block">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-indigo-500 outline-none text-sm"
              >
                <option value="suggestion">💡 Suggestion</option>
                <option value="info">ℹ️ Information</option>
                <option value="warning">⚠️ Warning</option>
                <option value="achievement">🏆 Achievement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "fee_increase", label: "📈 Increase Fee" },
                { key: "fee_decrease", label: "📉 Reduce Fee" },
                { key: "performance", label: "🏆 Great Work" },
                { key: "availability", label: "⏰ Extend Hours" },
                { key: "warning", label: "⚠️ Low Response" },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => fillTemplate(t.key)}
                  className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-medium"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">
              Message
            </label>
            <textarea
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              rows={5}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none text-sm resize-none"
              placeholder="Type your message or use a template above..."
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {form.message.length} chars
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSend}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "⏳ Sending..." : "📤 Send Notification"}
            </button>
            <button
              onClick={onClose}
              className="px-6 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── MAIN DASHBOARD ────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [medicineData, setMedicineData] = useState(null);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [s, r, d, m, u, n] = await Promise.all([
          api.get("/auth/admin/dashboard/"),
          api.get("/auth/admin/analytics/revenue/"),
          api.get("/auth/admin/analytics/doctors/"),
          api.get("/auth/admin/analytics/medicines/"),
          api.get("/auth/admin/users/"),
          api.get("/auth/admin/notifications/"),
        ]);
        setStats(s.data);
        setRevenueData(r.data);
        setDoctorData(d.data);
        setMedicineData(m.data);
        setUsers(u.data);
        setNotifications(n.data);
      } catch (e) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const approveDoctor = async (doctorId, approve) => {
    try {
      await api.patch(`/doctors/admin/${doctorId}/approve/`, {
        is_approved: approve,
      });
      toast.success(approve ? "✅ Doctor approved!" : "🚫 Access revoked");
      const d = await api.get("/auth/admin/analytics/doctors/");
      setDoctorData(d.data);
      const s = await api.get("/auth/admin/dashboard/");
      setStats(s.data);
    } catch {
      toast.error("Failed");
    }
  };

  const toggleUser = async (userId, status) => {
    try {
      await api.patch(`/auth/admin/users/${userId}/`, { is_active: !status });
      toast.success("User updated!");
      const u = await api.get("/auth/admin/users/");
      setUsers(u.data);
    } catch {
      toast.error("Failed");
    }
  };

  const tabs = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "financial", icon: "💰", label: "Financial" },
    { id: "doctors", icon: "👨‍⚕️", label: "Doctors" },
    { id: "medicines", icon: "💊", label: "Medicines" },
    { id: "users", icon: "👥", label: "Users" },
    { id: "notifications", icon: "🔔", label: "Notifications" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading Analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {showNotifModal && doctorData && (
        <NotificationModal
          doctors={doctorData.doctors}
          onClose={() => setShowNotifModal(false)}
          onSend={async () => {
            const n = await api.get("/auth/admin/notifications/");
            setNotifications(n.data);
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Admin Command Center <span className="text-indigo-600">🛡️</span>
            </h1>
            <p className="text-gray-500 mt-1">
              Real-time analytics · DocNDoSe Healthcare Platform
            </p>
          </div>
          <button
            onClick={() => setShowNotifModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg"
          >
            <span>📤</span> Send Notification
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-8 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap flex-1 justify-center ${
                tab === t.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
        {tab === "overview" && stats && (
          <div className="space-y-8">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard
                icon="💰"
                label="Total Revenue"
                value={`₹${(stats.total_revenue / 1000).toFixed(1)}K`}
                sub={`₹${stats.revenue_7d.toFixed(0)} this week`}
                color="bg-gradient-to-br from-indigo-500 to-indigo-700"
              />
              <KpiCard
                icon="📅"
                label="Total Appointments"
                value={stats.total_appointments}
                sub={`${stats.today_appointments} today`}
                color="bg-gradient-to-br from-cyan-500 to-cyan-700"
              />
              <KpiCard
                icon="👨‍⚕️"
                label="Active Doctors"
                value={stats.approved_doctors}
                sub={`${stats.pending_doctors} pending`}
                color="bg-gradient-to-br from-emerald-500 to-emerald-700"
              />
              <KpiCard
                icon="👥"
                label="Total Users"
                value={stats.total_users}
                sub={`${stats.new_users_7d} new this week`}
                color="bg-gradient-to-br from-violet-500 to-violet-700"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard
                icon="✅"
                label="Confirmed"
                value={stats.confirmed_appointments}
                color="bg-gradient-to-br from-green-400 to-green-600"
              />
              <KpiCard
                icon="🏁"
                label="Completed"
                value={stats.completed_appointments}
                color="bg-gradient-to-br from-blue-400 to-blue-600"
              />
              <KpiCard
                icon="💊"
                label="Orders"
                value={stats.total_orders}
                color="bg-gradient-to-br from-orange-400 to-orange-600"
              />
              <KpiCard
                icon="🏪"
                label="Medicine Rev"
                value={`₹${(stats.medicine_revenue / 1000).toFixed(1)}K`}
                color="bg-gradient-to-br from-pink-400 to-pink-600"
              />
            </div>

            {/* Revenue Chart */}
            {revenueData && (
              <ChartCard title="📈 Revenue Trend (Last 30 Days)">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData.daily_revenue}>
                    <defs>
                      <linearGradient
                        id="gradConsult"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="gradMed" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      tickLine={false}
                      tickFormatter={(v) =>
                        `₹${v >= 1000 ? (v / 1000).toFixed(0) + "K" : v}`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="consultation_revenue"
                      name="Consultation"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#gradConsult)"
                    />
                    <Area
                      type="monotone"
                      dataKey="medicine_revenue"
                      name="Medicine"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#gradMed)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* Quick Stats Row */}
            {revenueData && (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Payment Health
                  </div>
                  {[
                    {
                      label: "Successful",
                      val: revenueData.payment_stats.successful,
                      color: "bg-green-500",
                    },
                    {
                      label: "Failed",
                      val: revenueData.payment_stats.failed,
                      color: "bg-red-500",
                    },
                    {
                      label: "Pending",
                      val: revenueData.payment_stats.pending,
                      color: "bg-yellow-500",
                    },
                  ].map((s) => {
                    const total =
                      revenueData.payment_stats.successful +
                        revenueData.payment_stats.failed +
                        revenueData.payment_stats.pending || 1;
                    return (
                      <div key={s.label} className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 font-medium">
                            {s.label}
                          </span>
                          <span className="font-black text-gray-900">
                            {s.val}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${s.color} rounded-full transition-all`}
                            style={{ width: `${(s.val / total) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {doctorData && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Top Earner Doctor
                    </div>
                    {revenueData.top_earning_doctors.slice(0, 4).map((d, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center mb-3"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white`}
                            style={{ background: COLORS[i] }}
                          >
                            {i + 1}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-800 leading-tight">
                              {d.name.replace("Dr. ", "")}
                            </div>
                            <div className="text-xs text-gray-400 capitalize">
                              {d.specialization}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-indigo-600">
                            ₹{d.total_earned.toLocaleString("en-IN")}
                          </div>
                          <div className="text-xs text-gray-400">
                            {d.appointments} apts
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {medicineData && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Medicine Stock Status
                    </div>
                    {[
                      {
                        label: "✅ Good Stock",
                        val:
                          medicineData.summary.available -
                          medicineData.summary.low_stock,
                        color: "#10b981",
                      },
                      {
                        label: "⚠️ Low Stock",
                        val: medicineData.summary.low_stock,
                        color: "#f59e0b",
                      },
                      {
                        label: "❌ Out of Stock",
                        val: medicineData.summary.out_of_stock,
                        color: "#ef4444",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="flex justify-between items-center mb-3"
                      >
                        <span className="text-sm text-gray-600">{s.label}</span>
                        <span
                          className="font-black text-lg"
                          style={{ color: s.color }}
                        >
                          {s.val}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-3 mt-1">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">
                          Medicine Revenue
                        </span>
                        <span className="text-sm font-black text-green-600">
                          ₹
                          {medicineData.summary.total_revenue.toLocaleString(
                            "en-IN",
                            { maximumFractionDigits: 0 },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── FINANCIAL TAB ─────────────────────────────────────── */}
        {tab === "financial" && revenueData && (
          <div className="space-y-6">
            <SectionHeader
              icon="💰"
              title="Financial Dashboard"
              subtitle="Revenue, payments & transaction analysis"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Revenue",
                  val: `₹${stats.total_revenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
                  icon: "💵",
                  color: "from-indigo-500 to-indigo-700",
                },
                {
                  label: "30-Day Revenue",
                  val: `₹${stats.revenue_30d.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
                  icon: "📆",
                  color: "from-cyan-500 to-cyan-700",
                },
                {
                  label: "7-Day Revenue",
                  val: `₹${stats.revenue_7d.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
                  icon: "📅",
                  color: "from-emerald-500 to-emerald-700",
                },
                {
                  label: "Medicine Revenue",
                  val: `₹${stats.medicine_revenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
                  icon: "💊",
                  color: "from-violet-500 to-violet-700",
                },
              ].map((k) => (
                <KpiCard
                  key={k.label}
                  icon={k.icon}
                  label={k.label}
                  value={k.val}
                  color={`bg-gradient-to-br ${k.color}`}
                />
              ))}
            </div>

            <ChartCard title="💹 Daily Revenue Breakdown (Last 30 Days)">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={revenueData.daily_revenue} barGap={2}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickLine={false}
                    tickFormatter={(v) =>
                      `₹${v >= 1000 ? (v / 1000).toFixed(0) + "K" : v}`
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="consultation_revenue"
                    name="Consultation"
                    fill="#6366f1"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="medicine_revenue"
                    name="Medicine"
                    fill="#10b981"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid md:grid-cols-2 gap-6">
              <ChartCard title="🎯 Payment Status Distribution">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Successful",
                          value: revenueData.payment_stats.successful,
                        },
                        {
                          name: "Failed",
                          value: revenueData.payment_stats.failed,
                        },
                        {
                          name: "Pending",
                          value: revenueData.payment_stats.pending,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={55}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-around mt-2">
                  {[
                    {
                      label: "Success",
                      val: revenueData.payment_stats.successful,
                      c: "text-green-600",
                    },
                    {
                      label: "Failed",
                      val: revenueData.payment_stats.failed,
                      c: "text-red-500",
                    },
                    {
                      label: "Pending",
                      val: revenueData.payment_stats.pending,
                      c: "text-yellow-500",
                    },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className={`text-2xl font-black ${s.c}`}>
                        {s.val}
                      </div>
                      <div className="text-xs text-gray-400">{s.label}</div>
                    </div>
                  ))}
                </div>
              </ChartCard>

              <ChartCard title="🏆 Top Earning Doctors">
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {revenueData.top_earning_doctors.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                        style={{ background: COLORS[i % COLORS.length] }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-gray-800 truncate">
                            {d.name}
                          </span>
                          <span className="text-sm font-black text-indigo-600 ml-2">
                            ₹{d.total_earned.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(d.total_earned / (revenueData.top_earning_doctors[0]?.total_earned || 1)) * 100}%`,
                              background: COLORS[i % COLORS.length],
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5 capitalize">
                          {d.specialization} · {d.appointments} appointments
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>
          </div>
        )}

        {/* ── DOCTORS TAB ───────────────────────────────────────── */}
        {tab === "doctors" && doctorData && (
          <div className="space-y-6">
            <SectionHeader
              icon="👨‍⚕️"
              title="Doctor Performance Dashboard"
              subtitle="Performance metrics, occupancy & revenue per doctor"
            />

            <div className="grid md:grid-cols-2 gap-6">
              <ChartCard title="🏥 Doctors by Specialization">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={doctorData.specialization_stats}
                    layout="vertical"
                    barSize={14}
                  >
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="specialization"
                      width={105}
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip prefix="" />} />
                    <Bar
                      dataKey="doctor_count"
                      name="Doctors"
                      radius={[0, 4, 4, 0]}
                    >
                      {doctorData.specialization_stats.map((s, i) => (
                        <Cell
                          key={i}
                          fill={
                            SPEC_COLORS[s.specialization] ||
                            COLORS[i % COLORS.length]
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="📅 Appointments by Specialization">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={doctorData.specialization_stats.filter(
                        (s) => s.appointments > 0,
                      )}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      dataKey="appointments"
                      nameKey="specialization"
                    >
                      {doctorData.specialization_stats.map((s, i) => (
                        <Cell
                          key={i}
                          fill={
                            SPEC_COLORS[s.specialization] ||
                            COLORS[i % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                    <Legend
                      formatter={(v) => (
                        <span
                          style={{ fontSize: 11, textTransform: "capitalize" }}
                        >
                          {v}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Doctor Table */}
            <ChartCard
              title="📋 All Doctors — Detailed Performance"
              action={
                <button
                  onClick={() => setShowNotifModal(true)}
                  className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100"
                >
                  📤 Send Message
                </button>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {[
                        "Doctor",
                        "Spec.",
                        "Fee",
                        "Experience",
                        "Appointments",
                        "Revenue",
                        "Occupancy",
                        "Status",
                        "Action",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-3 text-xs font-black text-gray-400 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {doctorData.doctors.map((d) => (
                      <tr
                        key={d.id}
                        className="border-b border-gray-50 hover:bg-indigo-50/30 transition"
                      >
                        <td className="py-3 px-3">
                          <div className="font-bold text-gray-800 text-xs">
                            {d.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {d.work_hours}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className="px-2 py-0.5 rounded-lg text-xs font-bold capitalize"
                            style={{
                              background:
                                (SPEC_COLORS[d.specialization] || "#6366f1") +
                                "20",
                              color: SPEC_COLORS[d.specialization] || "#6366f1",
                            }}
                          >
                            {d.specialization}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-gray-800">
                          ₹{d.fee}
                        </td>
                        <td className="py-3 px-3 text-gray-600">
                          {d.experience} yrs
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1">
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                              {d.total_appointments} total
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-black text-indigo-600">
                          ₹{d.revenue_generated.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${d.occupancy_rate}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {d.occupancy_rate}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-bold ${d.is_approved ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}
                          >
                            {d.is_approved ? "✅ Active" : "⏳ Pending"}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => approveDoctor(d.id, !d.is_approved)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${d.is_approved ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                          >
                            {d.is_approved ? "Revoke" : "Approve"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>
        )}

        {/* ── MEDICINES TAB ─────────────────────────────────────── */}
        {tab === "medicines" && medicineData && (
          <div className="space-y-6">
            <SectionHeader
              icon="💊"
              title="Medicine Store Analytics"
              subtitle="Inventory health, sales trends & revenue"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard
                icon="💊"
                label="Total Medicines"
                value={medicineData.summary.total_medicines}
                color="bg-gradient-to-br from-indigo-500 to-indigo-700"
              />
              <KpiCard
                icon="✅"
                label="Available"
                value={medicineData.summary.available}
                color="bg-gradient-to-br from-emerald-500 to-emerald-700"
              />
              <KpiCard
                icon="⚠️"
                label="Low Stock"
                value={medicineData.summary.low_stock}
                color="bg-gradient-to-br from-amber-500 to-amber-700"
              />
              <KpiCard
                icon="❌"
                label="Out of Stock"
                value={medicineData.summary.out_of_stock}
                color="bg-gradient-to-br from-red-500 to-red-700"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <ChartCard title="📦 Order Trend (Last 14 Days)">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={medicineData.order_trend}>
                    <defs>
                      <linearGradient
                        id="gradOrder"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#06b6d4"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#06b6d4"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip prefix="" />} />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      name="Orders"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      fill="url(#gradOrder)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="📊 Order Status Distribution">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={Object.entries(medicineData.order_status)
                        .filter(([, v]) => v > 0)
                        .map(([k, v]) => ({ name: k, value: v }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={45}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {Object.keys(medicineData.order_status).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Critical Stock Alert */}
            {medicineData.medicines.filter((m) => m.status !== "good").length >
              0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🚨</span>
                  <h3 className="font-black text-red-800">
                    Stock Alerts — Action Required
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  {medicineData.medicines
                    .filter((m) => m.status !== "good")
                    .map((m) => (
                      <div
                        key={m.id}
                        className={`flex justify-between items-center p-3 rounded-xl ${m.status === "critical" ? "bg-red-100" : "bg-yellow-50"}`}
                      >
                        <div>
                          <div className="font-bold text-sm text-gray-800">
                            {m.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {m.manufacturer}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-black text-lg ${m.status === "critical" ? "text-red-600" : "text-yellow-600"}`}
                          >
                            {m.stock}
                          </div>
                          <div
                            className={`text-xs font-bold ${m.status === "critical" ? "text-red-500" : "text-yellow-500"}`}
                          >
                            {m.status === "critical" ? "❌ OUT" : "⚠️ LOW"}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Top Selling Medicines */}
            <ChartCard title="🏆 Top Selling Medicines">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {[
                        "Rank",
                        "Medicine",
                        "Price",
                        "Stock",
                        "Units Sold",
                        "Revenue",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-3 text-xs font-black text-gray-400 uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {medicineData.medicines.slice(0, 15).map((m, i) => (
                      <tr
                        key={m.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-3">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
                            style={{ background: COLORS[i % COLORS.length] }}
                          >
                            {i + 1}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-gray-800">
                            {m.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {m.manufacturer}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-bold">₹{m.price}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${m.stock === 0 ? "bg-red-500" : m.stock < 50 ? "bg-yellow-500" : "bg-green-500"}`}
                                style={{
                                  width: `${Math.min((m.stock / 600) * 100, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {m.stock}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-bold text-gray-800">
                          {m.total_sold}
                        </td>
                        <td className="py-3 px-3 font-black text-emerald-600">
                          ₹
                          {m.revenue.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                              m.status === "good"
                                ? "bg-green-50 text-green-700"
                                : m.status === "low"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-red-50 text-red-700"
                            }`}
                          >
                            {m.status === "good"
                              ? "✅ Good"
                              : m.status === "low"
                                ? "⚠️ Low"
                                : "❌ Out"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>
        )}

        {/* ── USERS TAB ─────────────────────────────────────────── */}
        {tab === "users" && (
          <div className="space-y-6">
            <SectionHeader
              icon="👥"
              title="User Management"
              subtitle={`${users.length} registered users`}
            />

            {/* Role breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["patient", "doctor", "pharmacy", "admin"].map((role) => {
                const count = users.filter((u) => u.role === role).length;
                const colors = {
                  patient: "from-blue-500 to-blue-700",
                  doctor: "from-emerald-500 to-emerald-700",
                  pharmacy: "from-orange-500 to-orange-700",
                  admin: "from-violet-500 to-violet-700",
                };
                const icons = {
                  patient: "🧑‍🤒",
                  doctor: "👨‍⚕️",
                  pharmacy: "🏪",
                  admin: "🛡️",
                };
                return (
                  <KpiCard
                    key={role}
                    icon={icons[role]}
                    label={`${role}s`}
                    value={count}
                    color={`bg-gradient-to-br ${colors[role]}`}
                  />
                );
              })}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-black text-gray-800">All Users</h3>
                <div className="text-sm text-gray-400">
                  {users.filter((u) => u.is_active).length} active
                </div>
              </div>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      {[
                        "User",
                        "Email",
                        "Role",
                        "Joined",
                        "Status",
                        "Action",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-4 text-xs font-black text-gray-400 uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-gray-50 hover:bg-indigo-50/20 transition"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-sm font-black text-indigo-600">
                              {u.username[0].toUpperCase()}
                            </div>
                            <span className="font-bold text-gray-800">
                              {u.username}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          {u.email || "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-bold capitalize ${
                              u.role === "admin"
                                ? "bg-violet-100 text-violet-700"
                                : u.role === "doctor"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : u.role === "pharmacy"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-xs">
                          {new Date(u.date_joined).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-bold ${u.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                          >
                            {u.is_active ? "● Active" : "○ Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {u.role !== "admin" && (
                            <button
                              onClick={() => toggleUser(u.id, u.is_active)}
                              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${u.is_active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                            >
                              {u.is_active ? "Disable" : "Enable"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ─────────────────────────────────── */}
        {tab === "notifications" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <SectionHeader
                icon="🔔"
                title="Notifications & Suggestions"
                subtitle="Messages sent to doctors from admin"
              />
              <button
                onClick={() => setShowNotifModal(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition"
              >
                <span>📤</span> New Message
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                <div className="text-5xl mb-4">📭</div>
                <div className="text-gray-400 font-medium">
                  Koi notification nahi bheji gayi abhi tak.
                </div>
                <button
                  onClick={() => setShowNotifModal(true)}
                  className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700"
                >
                  Pehli notification bhejein
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 ${
                      n.type === "warning"
                        ? "border-red-200"
                        : n.type === "achievement"
                          ? "border-yellow-200"
                          : n.type === "suggestion"
                            ? "border-indigo-200"
                            : "border-gray-100"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                        n.type === "warning"
                          ? "bg-red-50"
                          : n.type === "achievement"
                            ? "bg-yellow-50"
                            : n.type === "suggestion"
                              ? "bg-indigo-50"
                              : "bg-gray-50"
                      }`}
                    >
                      {n.type === "warning"
                        ? "⚠️"
                        : n.type === "achievement"
                          ? "🏆"
                          : n.type === "suggestion"
                            ? "💡"
                            : "ℹ️"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-lg font-bold capitalize ${
                              n.type === "warning"
                                ? "bg-red-50 text-red-700"
                                : n.type === "achievement"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : n.type === "suggestion"
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {n.type}
                          </span>
                          <span
                            className={`text-xs font-bold ${n.is_broadcast ? "text-purple-600" : "text-gray-600"}`}
                          >
                            → {n.recipient}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(n.created_at).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
