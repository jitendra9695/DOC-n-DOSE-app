import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import toast from "react-hot-toast";

if (!document.getElementById("gf-outfit")) {
  const l = document.createElement("link");
  l.id = "gf-outfit";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap";
  document.head.appendChild(l);
}
const F = "'Outfit','DM Sans','Segoe UI',sans-serif";
const C = {
  navy: "#0B1F3A",
  teal: "#0EA5BE",
  tealDk: "#0884A0",
  tealLt: "#E0F7FA",
  mint: "#10B981",
  mintLt: "#ECFDF5",
  amber: "#F59E0B",
  amberLt: "#FFFBEB",
  rose: "#F43F5E",
  roseLt: "#FFF1F2",
  indigo: "#6366F1",
  indigoLt: "#EEF2FF",
  violet: "#8B5CF6",
  violetLt: "#F5F3FF",
  slate: "#64748B",
  bg: "#EEF2F7",
  card: "#FFFFFF",
  border: "#E2E8F0",
};

function getMedStyle(name = "", unit = "") {
  const n = name.toLowerCase();
  if (
    n.includes("paracetamol") ||
    n.includes("ibuprofen") ||
    n.includes("aspirin")
  )
    return { icon: "🌡️", color: "#F59E0B" };
  if (
    n.includes("amoxicillin") ||
    n.includes("ciprofloxacin") ||
    n.includes("azithromycin") ||
    n.includes("metronidazole")
  )
    return { icon: "🦠", color: "#8B5CF6" };
  if (
    n.includes("vitamin") ||
    n.includes("calcium") ||
    n.includes("omega") ||
    n.includes("zinc") ||
    n.includes("iron") ||
    n.includes("folic")
  )
    return { icon: "💊", color: "#10B981" };
  if (
    n.includes("eye") ||
    n.includes("ear") ||
    n.includes("nasal") ||
    n.includes("drop")
  )
    return { icon: "💧", color: "#0EA5BE" };
  if (
    n.includes("cream") ||
    n.includes("lotion") ||
    n.includes("ointment") ||
    n.includes("sunscreen")
  )
    return { icon: "🧴", color: "#F43F5E" };
  if (n.includes("syrup") || n.includes("cough"))
    return { icon: "🍶", color: "#0EA5BE" };
  if (n.includes("insulin") || n.includes("metformin"))
    return { icon: "🩸", color: "#F43F5E" };
  if (n.includes("inhaler")) return { icon: "🫁", color: "#6366F1" };
  if (
    n.includes("thermometer") ||
    n.includes("bandage") ||
    n.includes("mask") ||
    n.includes("sanitizer")
  )
    return { icon: "🩹", color: "#64748B" };
  if (unit === "tablet" || unit === "capsule")
    return { icon: "💊", color: "#0EA5BE" };
  return { icon: "🧪", color: "#64748B" };
}

function MetricCard({ icon, label, value, color, bg, trend }) {
  return (
    <div
      style={{
        background: C.card,
        borderRadius: 18,
        padding: "22px",
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 12px #0002",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -15,
          top: -15,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: bg,
          opacity: 0.6,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.slate,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color,
              fontFamily: F,
              lineHeight: 1,
            }}
          >
            {value ?? "—"}
          </div>
          {trend && (
            <div
              style={{
                fontSize: 11,
                color: C.mint,
                marginTop: 6,
                fontWeight: 600,
              }}
            >
              {trend}
            </div>
          )}
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function DoctorRow({ doc, onToggle }) {
  const e = {
    general: "🩺",
    cardiologist: "❤️",
    neurologist: "🧠",
    dermatologist: "🧴",
    orthopedic: "🦴",
    pediatrician: "👶",
    psychiatrist: "🧘",
    gynecologist: "👩‍⚕️",
    ent: "👂",
    ophthalmologist: "👁️",
    dentist: "🦷",
    urologist: "🫁",
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 22px",
        borderBottom: `1px solid ${C.border}`,
        transition: "background 0.15s",
      }}
      onMouseEnter={(ev) => (ev.currentTarget.style.background = "#F8FAFC")}
      onMouseLeave={(ev) => (ev.currentTarget.style.background = "")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: `linear-gradient(135deg,${C.navy},#1A4D6E)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          {e[doc.specialization] || "🩺"}
        </div>
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: C.navy,
              fontFamily: F,
            }}
          >
            {doc.full_name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: C.slate,
              textTransform: "capitalize",
            }}
          >
            {doc.specialization} · {doc.experience_years}yr · ₹
            {doc.consultation_fee}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span
          style={{
            background: doc.is_approved ? C.mintLt : C.amberLt,
            color: doc.is_approved ? C.mint : C.amber,
            borderRadius: 999,
            padding: "3px 12px",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {doc.is_approved ? "✅ Approved" : "⏳ Pending"}
        </span>
        <button
          onClick={() => onToggle(doc.id, !doc.is_approved)}
          style={{
            padding: "6px 14px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: F,
            background: doc.is_approved
              ? C.roseLt
              : `linear-gradient(135deg,${C.tealDk},${C.teal})`,
            color: doc.is_approved ? C.rose : "#fff",
          }}
        >
          {doc.is_approved ? "Revoke" : "Approve"}
        </button>
      </div>
    </div>
  );
}

function UserRow({ u, onToggle }) {
  const rc = {
    admin: [C.violetLt, C.violet],
    doctor: [C.tealLt, C.tealDk],
    patient: [C.mintLt, C.mint],
  }[u.role] || [C.bg, C.slate];
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "13px 22px",
        borderBottom: `1px solid ${C.border}`,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: `linear-gradient(135deg,${rc[1]}33,${rc[1]}66)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 800,
            color: rc[1],
            fontFamily: F,
          }}
        >
          {u.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 13,
              color: C.navy,
              fontFamily: F,
            }}
          >
            {u.username}
          </div>
          <div style={{ fontSize: 11, color: C.slate }}>{u.email}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span
          style={{
            background: rc[0],
            color: rc[1],
            borderRadius: 999,
            padding: "2px 10px",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "capitalize",
          }}
        >
          {u.role}
        </span>
        <span
          style={{
            background: u.is_active ? C.mintLt : C.roseLt,
            color: u.is_active ? C.mint : C.rose,
            borderRadius: 999,
            padding: "2px 10px",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {u.is_active ? "Active" : "Inactive"}
        </span>
        {u.role !== "admin" && (
          <button
            onClick={() => onToggle(u.id, u.is_active)}
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
              background: u.is_active ? C.roseLt : C.mintLt,
              color: u.is_active ? C.rose : C.mint,
            }}
          >
            {u.is_active ? "Disable" : "Enable"}
          </button>
        )}
      </div>
    </div>
  );
}

function MedicineTab() {
  const [medicines, setMedicines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMed, setEditMed] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    unit: "tablet",
    manufacturer: "",
  });
  const units = [
    "tablet",
    "capsule",
    "syrup",
    "injection",
    "cream",
    "drops",
    "piece",
  ];
  const load = () =>
    api
      .get("/pharmacy/inventory/")
      .then((r) => setMedicines(r.data))
      .catch(() => {});
  useEffect(() => {
    load();
  }, []);
  const openAdd = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      unit: "tablet",
      manufacturer: "",
    });
    setEditMed(null);
    setShowForm(true);
  };
  const openEdit = (m) => {
    setForm({
      name: m.name,
      description: m.description || "",
      price: m.price,
      stock: m.stock,
      unit: m.unit || "tablet",
      manufacturer: m.manufacturer || "",
    });
    setEditMed(m);
    setShowForm(true);
  };
  const save = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || form.stock === "")
      return toast.error("Name, price & stock required");
    setSaving(true);
    try {
      if (editMed)
        await api.patch(`/pharmacy/inventory/${editMed.id}/`, {
          stock: parseInt(form.stock),
          price: parseFloat(form.price),
        });
      else
        await api.post("/pharmacy/inventory/", {
          ...form,
          price: parseFloat(form.price),
          stock: parseInt(form.stock),
        });
      toast.success(editMed ? "Updated!" : "Added!");
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setSaving(false);
    }
  };
  const filtered = medicines.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.manufacturer?.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div>
      {/* Mini stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 12,
          padding: "18px 22px",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {[
          {
            icon: "💊",
            label: "Total",
            value: medicines.length,
            color: C.teal,
          },
          {
            icon: "✅",
            label: "Available",
            value: medicines.filter((m) => m.is_available).length,
            color: C.mint,
          },
          {
            icon: "❌",
            label: "Out of Stock",
            value: medicines.filter((m) => !m.is_available).length,
            color: C.rose,
          },
          {
            icon: "⚠️",
            label: "Low (≤10)",
            value: medicines.filter((m) => m.stock > 0 && m.stock <= 10).length,
            color: C.amber,
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: C.bg,
              borderRadius: 12,
              padding: "12px 14px",
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: s.color,
                fontFamily: F,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: C.slate,
                marginTop: 2,
              }}
            >
              {s.icon} {s.label}
            </div>
          </div>
        ))}
      </div>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: "12px 22px",
          borderBottom: `1px solid ${C.border}`,
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicines…"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "8px 14px 8px 34px",
              borderRadius: 10,
              border: `1.5px solid ${C.border}`,
              fontSize: 13,
              outline: "none",
              fontFamily: F,
            }}
            onFocus={(e) => (e.target.style.borderColor = C.teal)}
            onBlur={(e) => (e.target.style.borderColor = C.border)}
          />
        </div>
        <span style={{ fontSize: 12, color: C.slate, fontWeight: 600 }}>
          {filtered.length}
        </span>
        <button
          onClick={openAdd}
          style={{
            background: `linear-gradient(135deg,${C.tealDk},${C.teal})`,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "8px 18px",
            fontWeight: 800,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: F,
            whiteSpace: "nowrap",
          }}
        >
          + Add Medicine
        </button>
      </div>
      {/* Form */}
      {showForm && (
        <div
          style={{
            padding: "18px 22px",
            borderBottom: `1px solid ${C.border}`,
            background: "#F0F9FF",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontWeight: 800,
                fontSize: 14,
                color: C.navy,
                fontFamily: F,
              }}
            >
              {editMed ? "✏️ Edit" : "➕ Add New Medicine"}
            </span>
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: "4px 12px",
                cursor: "pointer",
                fontSize: 12,
                color: C.slate,
              }}
            >
              Cancel
            </button>
          </div>
          <form
            onSubmit={save}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 10,
            }}
          >
            <div style={{ gridColumn: "1/-1" }}>
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.slate,
                  marginBottom: 3,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Medicine Name *
              </label>
              <input
                type="text"
                value={form.name}
                disabled={!!editMed}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: `1.5px solid ${C.border}`,
                  fontSize: 13,
                  outline: "none",
                  fontFamily: F,
                  background: editMed ? "#F8FAFC" : C.card,
                }}
                onFocus={(e) => {
                  if (!editMed) e.target.style.borderColor = C.teal;
                }}
                onBlur={(e) => (e.target.style.borderColor = C.border)}
              />
            </div>
            {[
              { l: "Manufacturer", k: "manufacturer", t: "text" },
              { l: "Price (₹) *", k: "price", t: "number" },
              { l: "Stock *", k: "stock", t: "number" },
            ].map((f) => (
              <div key={f.k}>
                <label
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 700,
                    color: C.slate,
                    marginBottom: 3,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {f.l}
                </label>
                <input
                  type={f.t}
                  value={form[f.k]}
                  onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: `1.5px solid ${C.border}`,
                    fontSize: 13,
                    outline: "none",
                    fontFamily: F,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = C.teal)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                />
              </div>
            ))}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.slate,
                  marginBottom: 3,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Unit
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: `1.5px solid ${C.border}`,
                  fontSize: 13,
                  outline: "none",
                  fontFamily: F,
                }}
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u.charAt(0).toUpperCase() + u.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.slate,
                  marginBottom: 3,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Description
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: `1.5px solid ${C.border}`,
                  fontSize: 13,
                  outline: "none",
                  fontFamily: F,
                  resize: "vertical",
                }}
                onFocus={(e) => (e.target.style.borderColor = C.teal)}
                onBlur={(e) => (e.target.style.borderColor = C.border)}
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "9px 22px",
                  borderRadius: 10,
                  border: "none",
                  background: saving
                    ? "#94A3B8"
                    : `linear-gradient(135deg,${C.tealDk},${C.teal})`,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: F,
                }}
              >
                {saving ? "Saving…" : editMed ? "Update" : "Add Medicine"}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", color: C.slate }}>
          No medicines found
        </div>
      ) : (
        filtered.map((med) => {
          const { icon, color } = getMedStyle(med.name, med.unit);
          const isLow = med.stock > 0 && med.stock <= 10;
          return (
            <div
              key={med.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 22px",
                borderBottom: `1px solid ${C.border}`,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#F8FAFC")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "")}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `${color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <div style={{ flex: 2, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: C.navy,
                    fontFamily: F,
                  }}
                >
                  {med.name}
                </div>
                <div style={{ fontSize: 11, color: C.slate }}>
                  {med.manufacturer} · {med.unit}
                </div>
              </div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 14,
                  color,
                  fontFamily: F,
                  minWidth: 55,
                  textAlign: "right",
                }}
              >
                ₹{med.price}
              </div>
              <div style={{ minWidth: 110, textAlign: "center" }}>
                <span
                  style={{
                    background: !med.is_available
                      ? C.roseLt
                      : isLow
                        ? C.amberLt
                        : C.mintLt,
                    color: !med.is_available
                      ? C.rose
                      : isLow
                        ? C.amber
                        : C.mint,
                    borderRadius: 999,
                    padding: "3px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {!med.is_available
                    ? "Out of stock"
                    : isLow
                      ? `⚠️ Low: ${med.stock}`
                      : `${med.stock} in stock`}
                </span>
              </div>
              <button
                onClick={() => openEdit(med)}
                style={{
                  background: C.tealLt,
                  color: C.tealDk,
                  border: "none",
                  borderRadius: 8,
                  padding: "5px 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: F,
                }}
              >
                ✏️ Edit
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");
  const reload = () => {
    api.get("/auth/admin/dashboard/").then((r) => setStats(r.data));
    api.get("/doctors/admin/all/").then((r) => setDoctors(r.data));
    api.get("/auth/admin/users/").then((r) => setUsers(r.data));
  };
  useEffect(reload, []);
  const approveDoctor = async (id, val) => {
    try {
      await api.patch(`/doctors/admin/${id}/approve/`, { is_approved: val });
      toast.success(val ? "Doctor approved!" : "Access revoked");
      reload();
    } catch {
      toast.error("Action failed");
    }
  };
  const toggleUser = async (id, cur) => {
    try {
      await api.patch(`/auth/admin/users/${id}/`, { is_active: !cur });
      toast.success("User status updated");
      reload();
    } catch {
      toast.error("Failed");
    }
  };
  const filteredDocs = doctors.filter(
    (d) =>
      d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.includes(search.toLowerCase()),
  );
  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );
  const pendingDocs = doctors.filter((d) => !d.is_approved);
  const TABS = [
    { key: "overview", icon: "📊", label: "Overview" },
    { key: "doctors", icon: "👨‍⚕️", label: "Doctors", badge: pendingDocs.length },
    { key: "users", icon: "👥", label: "Users" },
    { key: "medicines", icon: "💊", label: "Medicines" },
  ];
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F }}>
      <Navbar />
      <div
        style={{
          background: `linear-gradient(135deg,${C.navy} 0%,#0F2D5A 60%,#1E3A5F 100%)`,
          padding: "32px 0 88px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -80,
            top: -80,
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.1)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: 1060,
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Admin Control Center
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 900,
              color: "#fff",
              fontFamily: F,
            }}
          >
            DocNDoSe <span style={{ color: C.teal }}>Dashboard</span> 🛡️
          </h1>
          <p
            style={{
              margin: "8px 0 0",
              color: "rgba(255,255,255,0.45)",
              fontSize: 13,
            }}
          >
            Full system oversight — doctors, users, appointments & medicines
          </p>
        </div>
      </div>
      <div
        style={{
          maxWidth: 1060,
          margin: "-56px auto 0",
          padding: "0 24px 48px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <MetricCard
            icon="👥"
            label="Total Users"
            value={stats?.total_users}
            color={C.teal}
            bg={C.tealLt}
            trend="All registered accounts"
          />
          <MetricCard
            icon="👨‍⚕️"
            label="Total Doctors"
            value={stats?.total_doctors}
            color={C.mint}
            bg={C.mintLt}
            trend={`${stats?.approved_doctors || 0} approved`}
          />
          <MetricCard
            icon="⏳"
            label="Pending Approval"
            value={stats?.pending_doctors}
            color={C.amber}
            bg={C.amberLt}
            trend="Requires your action"
          />
          <MetricCard
            icon="📋"
            label="Appointments"
            value={stats?.total_appointments}
            color={C.indigo}
            bg={C.indigoLt}
            trend={`${stats?.confirmed_appointments || 0} confirmed`}
          />
        </div>
        {pendingDocs.length > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg,#FEF3C7,#FFFBEB)",
              border: "1.5px solid #FDE68A",
              borderRadius: 16,
              padding: "16px 20px",
              marginBottom: 22,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "#FEF3C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                ⚠️
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 14,
                    color: "#92400E",
                    fontFamily: F,
                  }}
                >
                  {pendingDocs.length} Doctor{pendingDocs.length > 1 ? "s" : ""}{" "}
                  Pending Approval
                </div>
                <div style={{ fontSize: 12, color: "#B45309" }}>
                  Review and approve to allow them to appear in patient listings
                </div>
              </div>
            </div>
            <button
              onClick={() => setTab("doctors")}
              style={{
                background: C.amber,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "8px 18px",
                fontWeight: 800,
                cursor: "pointer",
                fontSize: 13,
                fontFamily: F,
              }}
            >
              Review Now →
            </button>
          </div>
        )}
        <div
          style={{
            background: C.card,
            borderRadius: 20,
            border: `1px solid ${C.border}`,
            overflow: "hidden",
            boxShadow: "0 1px 6px #0001",
          }}
        >
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${C.border}`,
              background: "#F8FAFC",
            }}
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  setSearch("");
                }}
                style={{
                  flex: 1,
                  padding: "15px 8px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: F,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: tab === t.key ? C.card : "transparent",
                  color: tab === t.key ? C.teal : C.slate,
                  borderBottom:
                    tab === t.key
                      ? `3px solid ${C.teal}`
                      : "3px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
                {t.badge > 0 && (
                  <span
                    style={{
                      background: C.amber,
                      color: "#fff",
                      borderRadius: 999,
                      padding: "1px 7px",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
          {tab === "overview" && stats && (
            <div style={{ padding: "24px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    background: C.bg,
                    borderRadius: 16,
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 14,
                      color: C.navy,
                      marginBottom: 14,
                      fontFamily: F,
                    }}
                  >
                    Doctor Status
                  </div>
                  {[
                    ["✅ Approved", stats.approved_doctors, C.mint, C.mintLt],
                    ["⏳ Pending", stats.pending_doctors, C.amber, C.amberLt],
                    ["📊 Total", stats.total_doctors, C.teal, C.tealLt],
                  ].map(([l, v, c, bg]) => (
                    <div
                      key={l}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        background: bg,
                        borderRadius: 10,
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{ fontSize: 13, fontWeight: 600, color: C.navy }}
                      >
                        {l}
                      </span>
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: c,
                          fontFamily: F,
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    background: C.bg,
                    borderRadius: 16,
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 14,
                      color: C.navy,
                      marginBottom: 14,
                      fontFamily: F,
                    }}
                  >
                    Appointment Status
                  </div>
                  {[
                    [
                      "📋 Total",
                      stats.total_appointments,
                      C.indigo,
                      C.indigoLt,
                    ],
                    [
                      "✅ Confirmed",
                      stats.confirmed_appointments,
                      C.mint,
                      C.mintLt,
                    ],
                  ].map(([l, v, c, bg]) => (
                    <div
                      key={l}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        background: bg,
                        borderRadius: 10,
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{ fontSize: 13, fontWeight: 600, color: C.navy }}
                      >
                        {l}
                      </span>
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: c,
                          fontFamily: F,
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {tab === "doctors" && (
            <>
              <div
                style={{
                  padding: "14px 22px",
                  borderBottom: `1px solid ${C.border}`,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 Search doctors…"
                  style={{
                    flex: 1,
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: `1.5px solid ${C.border}`,
                    fontSize: 13,
                    outline: "none",
                    fontFamily: F,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = C.teal)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                />
                <span style={{ fontSize: 12, color: C.slate, fontWeight: 600 }}>
                  {filteredDocs.length} doctors
                </span>
              </div>
              {filteredDocs.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: C.slate,
                  }}
                >
                  No doctors found
                </div>
              ) : (
                filteredDocs.map((d) => (
                  <DoctorRow key={d.id} doc={d} onToggle={approveDoctor} />
                ))
              )}
            </>
          )}
          {tab === "users" && (
            <>
              <div
                style={{
                  padding: "14px 22px",
                  borderBottom: `1px solid ${C.border}`,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 Search users…"
                  style={{
                    flex: 1,
                    minWidth: 180,
                    padding: "9px 14px",
                    borderRadius: 10,
                    border: `1.5px solid ${C.border}`,
                    fontSize: 13,
                    outline: "none",
                    fontFamily: F,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = C.teal)}
                  onBlur={(e) => (e.target.style.borderColor = C.border)}
                />
                <div style={{ display: "flex", gap: 6 }}>
                  {["all", "patient", "doctor", "admin"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setSearch(r === "all" ? "" : r)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 700,
                        background: search === r ? C.teal : C.bg,
                        color: search === r ? "#fff" : C.slate,
                        textTransform: "capitalize",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: 12, color: C.slate, fontWeight: 600 }}>
                  {filteredUsers.length} users
                </span>
              </div>
              {filteredUsers.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: C.slate,
                  }}
                >
                  No users found
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <UserRow key={u.id} u={u} onToggle={toggleUser} />
                ))
              )}
            </>
          )}
          {tab === "medicines" && <MedicineTab />}
        </div>
      </div>
    </div>
  );
}
