import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

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
    n.includes("aspirin") ||
    n.includes("combiflam")
  )
    return { icon: "🌡️", color: "#F59E0B", bg: "#FFFBEB" };
  if (
    n.includes("amoxicillin") ||
    n.includes("ciprofloxacin") ||
    n.includes("azithromycin") ||
    n.includes("metronidazole") ||
    n.includes("doxycycline")
  )
    return { icon: "🦠", color: "#8B5CF6", bg: "#F5F3FF" };
  if (
    n.includes("vitamin") ||
    n.includes("calcium") ||
    n.includes("omega") ||
    n.includes("zinc") ||
    n.includes("iron") ||
    n.includes("folic") ||
    n.includes("multivitamin") ||
    n.includes("biotin")
  )
    return { icon: "💊", color: "#10B981", bg: "#ECFDF5" };
  if (
    n.includes("eye") ||
    n.includes("ear") ||
    n.includes("nasal") ||
    n.includes("drop") ||
    n.includes("otrivin") ||
    n.includes("waxsol")
  )
    return { icon: "💧", color: "#0EA5BE", bg: "#E0F7FA" };
  if (
    n.includes("cream") ||
    n.includes("lotion") ||
    n.includes("ointment") ||
    n.includes("gel") ||
    n.includes("sunscreen") ||
    n.includes("calamine") ||
    n.includes("clotrimazole")
  )
    return { icon: "🧴", color: "#F43F5E", bg: "#FFF1F2" };
  if (
    n.includes("syrup") ||
    n.includes("cough") ||
    n.includes("benadryl") ||
    n.includes("lactulose")
  )
    return { icon: "🍶", color: "#0EA5BE", bg: "#E0F7FA" };
  if (
    n.includes("insulin") ||
    n.includes("metformin") ||
    n.includes("glimepiride") ||
    n.includes("glucometer")
  )
    return { icon: "🩸", color: "#F43F5E", bg: "#FFF1F2" };
  if (
    n.includes("inhaler") ||
    n.includes("salbutamol") ||
    n.includes("montelukast")
  )
    return { icon: "🫁", color: "#6366F1", bg: "#EEF2FF" };
  if (
    n.includes("thermometer") ||
    n.includes("bandage") ||
    n.includes("mask") ||
    n.includes("sanitizer") ||
    n.includes("povidone")
  )
    return { icon: "🩹", color: "#64748B", bg: "#F8FAFC" };
  if (
    n.includes("omeprazole") ||
    n.includes("pantoprazole") ||
    n.includes("ranitidine") ||
    n.includes("antacid") ||
    n.includes("domperidone") ||
    n.includes("ors")
  )
    return { icon: "🫙", color: "#0EA5BE", bg: "#E0F7FA" };
  if (
    n.includes("atenolol") ||
    n.includes("amlodipine") ||
    n.includes("telmisartan") ||
    n.includes("atorvastatin") ||
    n.includes("clopidogrel")
  )
    return { icon: "❤️", color: "#F43F5E", bg: "#FFF1F2" };
  if (unit === "tablet" || unit === "capsule")
    return { icon: "💊", color: "#0EA5BE", bg: "#E0F7FA" };
  return { icon: "🧪", color: "#64748B", bg: "#F8FAFC" };
}

function loadRazorpay() {
  return new Promise((r) => {
    if (document.getElementById("razorpay-script")) {
      r(true);
      return;
    }
    const s = document.createElement("script");
    s.id = "razorpay-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => r(true);
    s.onerror = () => r(false);
    document.body.appendChild(s);
  });
}

function StatusBadge({ status }) {
  const M = {
    placed: [C.tealLt, C.tealDk, "🕐 Placed"],
    processing: [C.amberLt, C.amber, "⚙️ Processing"],
    shipped: ["#EFF6FF", "#1D4ED8", "🚚 Shipped"],
    delivered: [C.mintLt, C.mint, "✅ Delivered"],
    cancelled: [C.roseLt, C.rose, "❌ Cancelled"],
  };
  const [bg, color, label] = M[status] || [C.bg, C.slate, status];
  return (
    <span
      style={{
        background: bg,
        color,
        borderRadius: 999,
        padding: "3px 12px",
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}

// ── Medicine Card ─────────────────────────────────────────────────────────────
function MedCard({ med, cart, onAdd, onRemove }) {
  const { icon, color, bg } = getMedStyle(med.name, med.unit);
  const qty = cart[med.id]?.qty || 0;
  const oos = med.stock === 0;
  return (
    <div
      style={{
        background: C.card,
        borderRadius: 20,
        overflow: "hidden",
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 10px #0001",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s,box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!oos) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 10px 28px #0002";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 2px 10px #0001";
      }}
    >
      <div
        style={{
          background: bg,
          borderBottom: `1px solid ${C.border}`,
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "relative",
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: `${color}22`,
            border: `2px solid ${color}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 13,
              color: C.navy,
              fontFamily: F,
              lineHeight: 1.3,
            }}
          >
            {med.name}
          </div>
          <div style={{ fontSize: 10, color: C.slate, marginTop: 2 }}>
            {med.manufacturer}
          </div>
        </div>
        {qty > 0 && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: C.teal,
              color: "#fff",
              borderRadius: 999,
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 800,
            }}
          >
            {qty}
          </div>
        )}
      </div>
      <div
        style={{
          padding: "12px 14px 14px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {med.description && (
          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: C.slate,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {med.description}
          </p>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span
              style={{ fontWeight: 900, fontSize: 17, color, fontFamily: F }}
            >
              ₹{med.price}
            </span>
            <span style={{ fontSize: 10, color: C.slate, marginLeft: 4 }}>
              /{med.unit}
            </span>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: oos ? C.rose : C.mint,
              background: oos ? C.roseLt : C.mintLt,
              borderRadius: 999,
              padding: "2px 8px",
            }}
          >
            {oos ? "Out of stock" : `${med.stock} left`}
          </span>
        </div>
        {oos ? (
          <div
            style={{
              background: "#F8FAFC",
              borderRadius: 10,
              padding: "8px 0",
              textAlign: "center",
              fontSize: 11,
              color: C.slate,
              border: `1px solid ${C.border}`,
            }}
          >
            Currently unavailable
          </div>
        ) : qty === 0 ? (
          <button
            onClick={() => onAdd(med)}
            style={{
              background: `linear-gradient(135deg,${C.tealDk},${C.teal})`,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "9px 0",
              fontWeight: 800,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: F,
            }}
          >
            Add to Cart
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: C.tealLt,
              borderRadius: 12,
              padding: "6px 10px",
              border: `1px solid ${C.teal}33`,
            }}
          >
            <button
              onClick={() => onRemove(med.id)}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 14,
                color: C.tealDk,
              }}
            >
              −
            </button>
            <span
              style={{
                fontWeight: 800,
                fontSize: 15,
                color: C.tealDk,
                fontFamily: F,
              }}
            >
              {qty}
            </span>
            <button
              onClick={() => onAdd(med)}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                background: `linear-gradient(135deg,${C.tealDk},${C.teal})`,
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 14,
                color: "#fff",
              }}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Admin Panel ───────────────────────────────────────────────────────────────
function AdminMedicinePanel() {
  const [medicines, setMedicines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMed, setEditMed] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    unit: "tablet",
    manufacturer: "",
  });
  const [saving, setSaving] = useState(false);
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
      toast.success(editMed ? "Medicine updated!" : "Medicine added!");
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
  const units = [
    "tablet",
    "capsule",
    "syrup",
    "injection",
    "cream",
    "drops",
    "piece",
  ];
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F }}>
      <Navbar />
      <div
        style={{
          background: `linear-gradient(135deg,${C.navy},#0F3460)`,
          padding: "28px 0 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -60,
            top: -60,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "rgba(14,165,190,0.1)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
          }}
        >
          <Link
            to="/admin"
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 13,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ← Admin Dashboard
          </Link>
          <h1
            style={{
              margin: "12px 0 4px",
              fontSize: 26,
              fontWeight: 900,
              color: "#fff",
              fontFamily: F,
            }}
          >
            💊 Medicine <span style={{ color: C.teal }}>Inventory</span>
          </h1>
          <p
            style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: 13 }}
          >
            {medicines.length} medicines · Manage stock and pricing
          </p>
        </div>
      </div>
      <div
        style={{
          maxWidth: 1100,
          margin: "-50px auto 0",
          padding: "0 24px 48px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
            marginBottom: 22,
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
              value: medicines.filter((m) => m.stock > 0 && m.stock <= 10)
                .length,
              color: C.amber,
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: C.card,
                borderRadius: 18,
                padding: "18px 20px",
                boxShadow: "0 2px 12px #0002",
                border: `1px solid ${C.border}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: -10,
                  top: -10,
                  fontSize: 44,
                  opacity: 0.07,
                }}
              >
                {s.icon}
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: s.color,
                  fontFamily: F,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.slate,
                  marginTop: 4,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            background: C.card,
            borderRadius: 20,
            padding: "14px 18px",
            marginBottom: 18,
            border: `1px solid ${C.border}`,
            boxShadow: "0 1px 6px #0001",
            display: "flex",
            gap: 12,
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
                fontSize: 14,
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
                padding: "9px 14px 9px 38px",
                borderRadius: 12,
                border: `1.5px solid ${C.border}`,
                fontSize: 13,
                outline: "none",
                fontFamily: F,
              }}
              onFocus={(e) => (e.target.style.borderColor = C.teal)}
              onBlur={(e) => (e.target.style.borderColor = C.border)}
            />
          </div>
          <button
            onClick={openAdd}
            style={{
              background: `linear-gradient(135deg,${C.tealDk},${C.teal})`,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 22px",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: F,
              whiteSpace: "nowrap",
            }}
          >
            + Add Medicine
          </button>
        </div>
        {showForm && (
          <div
            style={{
              background: C.card,
              borderRadius: 20,
              padding: "22px",
              marginBottom: 18,
              border: `2px solid ${C.teal}`,
              boxShadow: "0 4px 20px #0EA5BE22",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  fontWeight: 900,
                  fontSize: 15,
                  color: C.navy,
                  fontFamily: F,
                }}
              >
                {editMed ? "✏️ Edit Medicine" : "➕ Add New Medicine"}
              </span>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "5px 14px",
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
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {[
                {
                  label: "Medicine Name *",
                  key: "name",
                  type: "text",
                  full: true,
                  dis: !!editMed,
                },
                { label: "Manufacturer", key: "manufacturer", type: "text" },
                { label: "Price (₹) *", key: "price", type: "number" },
                { label: "Stock *", key: "stock", type: "number" },
              ].map((f) => (
                <div
                  key={f.key}
                  style={{ gridColumn: f.full ? "1/-1" : "auto" }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.slate,
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    disabled={f.dis}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.value })
                    }
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "9px 12px",
                      borderRadius: 10,
                      border: `1.5px solid ${C.border}`,
                      fontSize: 13,
                      outline: "none",
                      fontFamily: F,
                      background: f.dis ? "#F8FAFC" : C.card,
                    }}
                    onFocus={(e) => {
                      if (!f.dis) e.target.style.borderColor = C.teal;
                    }}
                    onBlur={(e) => (e.target.style.borderColor = C.border)}
                  />
                </div>
              ))}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.slate,
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Unit *
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
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
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.slate,
                    marginBottom: 4,
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
                    padding: "9px 12px",
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
              <div style={{ gridColumn: "1/-1" }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "11px 28px",
                    borderRadius: 12,
                    border: "none",
                    background: saving
                      ? "#94A3B8"
                      : `linear-gradient(135deg,${C.tealDk},${C.teal})`,
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: saving ? "not-allowed" : "pointer",
                    fontFamily: F,
                  }}
                >
                  {saving
                    ? "Saving…"
                    : editMed
                      ? "Update Medicine"
                      : "Add Medicine"}
                </button>
              </div>
            </form>
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
              padding: "16px 22px",
              borderBottom: `1px solid ${C.border}`,
              fontWeight: 800,
              fontSize: 15,
              color: C.navy,
              fontFamily: F,
            }}
          >
            Medicine List ({filtered.length})
          </div>
          {filtered.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "48px", color: C.slate }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>💊</div>
              <div>No medicines found</div>
            </div>
          ) : (
            filtered.map((med) => {
              const { icon, color, bg } = getMedStyle(med.name, med.unit);
              const isLow = med.stock > 0 && med.stock <= 10;
              return (
                <div
                  key={med.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "13px 22px",
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
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  <div style={{ flex: 2, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
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
                      flex: 0.7,
                      textAlign: "right",
                      fontWeight: 900,
                      fontSize: 15,
                      color,
                      fontFamily: F,
                    }}
                  >
                    ₹{med.price}
                  </div>
                  <div style={{ flex: 0.7, textAlign: "center" }}>
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
                          ? `⚠️ ${med.stock} left`
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
                      padding: "6px 14px",
                      fontSize: 12,
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
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function MedicineOrder() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminMedicinePanel />;

  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState({});
  const [orders, setOrders] = useState([]);
  const [address, setAddress] = useState("");
  const [tab, setTab] = useState("shop");
  const [payLoading, setPayLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  useEffect(() => {
    api.get("/pharmacy/medicines/").then((r) => setMedicines(r.data));
    api.get("/pharmacy/orders/").then((r) => setOrders(r.data));
  }, []);
  const addToCart = (med) => {
    setCart((p) => ({
      ...p,
      [med.id]: { ...med, qty: (p[med.id]?.qty || 0) + 1 },
    }));
    toast.success(`${med.name} added!`, { icon: "💊" });
  };
  const removeOne = (id) =>
    setCart((p) => {
      const u = { ...p };
      if (u[id]?.qty > 1) u[id] = { ...u[id], qty: u[id].qty - 1 };
      else delete u[id];
      return u;
    });
  const removeAll = (id) =>
    setCart((p) => {
      const u = { ...p };
      delete u[id];
      return u;
    });
  const cartItems = Object.values(cart);
  const totalAmount = cartItems.reduce(
    (s, i) => s + parseFloat(i.price) * i.qty,
    0,
  );

  const handlePayment = async () => {
    if (!cartItems.length) return toast.error("Cart is empty");
    if (!address.trim()) return toast.error("Please enter delivery address");
    setPayLoading(true);
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Could not load payment gateway");
      setPayLoading(false);
      return;
    }
    try {
      const res = await api.post("/payments/medicine-order/", {
        items: cartItems.map((i) => ({ medicine_id: i.id, quantity: i.qty })),
        delivery_address: address,
        amount: Math.round(totalAmount * 100),
      });
      const { order_id, amount, currency, key_id } = res.data;
      const options = {
        key: key_id,
        amount,
        currency,
        name: "DocNDoSe",
        description: "Medicine Order",
        order_id,
        theme: { color: C.teal },
        handler: async (r) => {
          try {
            await api.post("/payments/medicine-verify/", {
              razorpay_order_id: r.razorpay_order_id,
              razorpay_payment_id: r.razorpay_payment_id,
              razorpay_signature: r.razorpay_signature,
              items: cartItems.map((i) => ({
                medicine_id: i.id,
                quantity: i.qty,
              })),
              delivery_address: address,
            });
            toast.success("Order placed! 🎉");
            setCart({});
            setAddress("");
            api.get("/pharmacy/orders/").then((r) => setOrders(r.data));
            setTab("orders");
          } catch {
            toast.error("Verification failed");
          } finally {
            setPayLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled.");
            setPayLoading(false);
          },
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => {
        toast.error(`Payment failed: ${r.error.description}`);
        setPayLoading(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not initiate payment");
      setPayLoading(false);
    }
  };

  const cats = ["all", "tablet", "capsule", "syrup", "cream", "drops", "piece"];
  const filtered = medicines.filter(
    (m) =>
      (catFilter === "all" || m.unit === catFilter) &&
      (!search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.manufacturer?.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F }}>
      <Navbar />
      <div
        style={{
          background: `linear-gradient(135deg,${C.navy},#0F3460,#1A5276)`,
          padding: "28px 0 82px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -60,
            top: -60,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "rgba(16,185,129,0.1)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
          }}
        >
          <Link
            to="/patient"
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 13,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ← Back to Dashboard
          </Link>
          <h1
            style={{
              margin: "12px 0 4px",
              fontSize: 26,
              fontWeight: 900,
              color: "#fff",
              fontFamily: F,
            }}
          >
            💊 Medicine <span style={{ color: C.mint }}>Store</span>
          </h1>
          <p
            style={{
              margin: "0 0 18px",
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
            }}
          >
            {medicines.length} medicines available · Fast delivery
          </p>
          <div style={{ position: "relative", maxWidth: 440 }}>
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 14,
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
                padding: "12px 16px 12px 42px",
                borderRadius: 14,
                border: "none",
                fontSize: 13,
                fontFamily: F,
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                outline: "none",
              }}
              onFocus={(e) =>
                (e.target.style.background = "rgba(255,255,255,0.18)")
              }
              onBlur={(e) =>
                (e.target.style.background = "rgba(255,255,255,0.12)")
              }
            />
          </div>
        </div>
      </div>
      <div
        style={{
          maxWidth: 1100,
          margin: "-50px auto 0",
          padding: "0 24px 48px",
          position: "relative",
        }}
      >
        <div
          style={{
            background: C.card,
            borderRadius: 20,
            padding: "14px 18px",
            marginBottom: 20,
            border: `1px solid ${C.border}`,
            boxShadow: "0 2px 12px #0002",
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { key: "shop", label: "🛒 Shop", n: null },
            { key: "cart", label: "🧺 Cart", n: cartItems.length },
            { key: "orders", label: "📦 Orders", n: orders.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "9px 20px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                fontFamily: F,
                background:
                  tab === t.key
                    ? `linear-gradient(135deg,${C.tealDk},${C.teal})`
                    : C.bg,
                color: tab === t.key ? "#fff" : C.slate,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {t.label}
              {t.n > 0 && (
                <span
                  style={{
                    background:
                      tab === t.key ? "rgba(255,255,255,0.25)" : C.teal,
                    color: "#fff",
                    borderRadius: 999,
                    padding: "1px 7px",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {t.n}
                </span>
              )}
            </button>
          ))}
          {tab === "shop" && (
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCatFilter(c)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 999,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: F,
                    textTransform: "capitalize",
                    background: catFilter === c ? C.navy : C.bg,
                    color: catFilter === c ? "#fff" : C.slate,
                  }}
                >
                  {c === "all" ? "All" : c}
                </button>
              ))}
            </div>
          )}
        </div>

        {tab === "shop" && (
          <>
            <div
              style={{
                fontSize: 12,
                color: C.slate,
                fontWeight: 600,
                marginBottom: 14,
              }}
            >
              Showing {filtered.length} medicine
              {filtered.length !== 1 ? "s" : ""}
              {catFilter !== "all" && ` · ${catFilter}s`}
              {search && ` for "${search}"`}
            </div>
            {filtered.length === 0 ? (
              <div
                style={{
                  background: C.card,
                  borderRadius: 20,
                  padding: "60px 20px",
                  textAlign: "center",
                  border: `1px solid ${C.border}`,
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: C.navy,
                    fontFamily: F,
                    marginBottom: 8,
                  }}
                >
                  No medicines found
                </div>
                <button
                  onClick={() => {
                    setSearch("");
                    setCatFilter("all");
                  }}
                  style={{
                    background: `linear-gradient(135deg,${C.tealDk},${C.teal})`,
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    padding: "10px 24px",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: F,
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
                  gap: 18,
                }}
              >
                {filtered.map((med) => (
                  <MedCard
                    key={med.id}
                    med={med}
                    cart={cart}
                    onAdd={addToCart}
                    onRemove={removeOne}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "cart" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              gap: 20,
              alignItems: "start",
            }}
          >
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
                  padding: "16px 20px",
                  borderBottom: `1px solid ${C.border}`,
                  fontWeight: 800,
                  fontSize: 15,
                  color: C.navy,
                  fontFamily: F,
                }}
              >
                Cart Items ({cartItems.length})
              </div>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>🧺</div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: C.navy,
                      fontFamily: F,
                      marginBottom: 8,
                    }}
                  >
                    Your cart is empty
                  </div>
                  <button
                    onClick={() => setTab("shop")}
                    style={{
                      background: `linear-gradient(135deg,${C.tealDk},${C.teal})`,
                      color: "#fff",
                      border: "none",
                      borderRadius: 12,
                      padding: "10px 24px",
                      fontWeight: 800,
                      cursor: "pointer",
                      fontFamily: F,
                    }}
                  >
                    Browse Medicines
                  </button>
                </div>
              ) : (
                cartItems.map((item) => {
                  const { icon, color } = getMedStyle(item.name, item.unit);
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "13px 20px",
                        borderBottom: `1px solid ${C.border}`,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F8FAFC")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: `${color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          flexShrink: 0,
                        }}
                      >
                        {icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: C.navy,
                            fontFamily: F,
                          }}
                        >
                          {item.name}
                        </div>
                        <div style={{ fontSize: 11, color: C.slate }}>
                          ₹{item.price}/{item.unit}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <button
                          onClick={() => removeOne(item.id)}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            border: `1px solid ${C.border}`,
                            background: C.bg,
                            cursor: "pointer",
                            fontWeight: 800,
                            fontSize: 12,
                            color: C.slate,
                          }}
                        >
                          −
                        </button>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: 14,
                            color: C.navy,
                            fontFamily: F,
                            minWidth: 18,
                            textAlign: "center",
                          }}
                        >
                          {item.qty}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            border: "none",
                            background: `linear-gradient(135deg,${C.tealDk},${C.teal})`,
                            cursor: "pointer",
                            fontWeight: 800,
                            fontSize: 12,
                            color: "#fff",
                          }}
                        >
                          +
                        </button>
                      </div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color: C.tealDk,
                          fontFamily: F,
                          minWidth: 50,
                          textAlign: "right",
                        }}
                      >
                        ₹{(parseFloat(item.price) * item.qty).toFixed(0)}
                      </div>
                      <button
                        onClick={() => removeAll(item.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: C.rose,
                          fontSize: 16,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            <div
              style={{
                background: C.card,
                borderRadius: 20,
                padding: "20px",
                border: `1px solid ${C.border}`,
                boxShadow: "0 1px 6px #0001",
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  color: C.navy,
                  fontFamily: F,
                  marginBottom: 14,
                }}
              >
                Order Summary
              </div>
              {cartItems.map((i) => (
                <div
                  key={i.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: C.slate,
                    marginBottom: 6,
                  }}
                >
                  <span>
                    {i.name} ×{i.qty}
                  </span>
                  <span style={{ fontWeight: 600, color: C.navy }}>
                    ₹{(parseFloat(i.price) * i.qty).toFixed(0)}
                  </span>
                </div>
              ))}
              <div
                style={{
                  borderTop: `1px dashed ${C.border}`,
                  margin: "12px 0",
                  paddingTop: 12,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontWeight: 800, color: C.navy, fontFamily: F }}>
                  Total
                </span>
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: 18,
                    color: C.teal,
                    fontFamily: F,
                  }}
                >
                  ₹{totalAmount.toFixed(0)}
                </span>
              </div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.slate,
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                📍 Delivery Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="Enter full delivery address…"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: `1.5px solid ${C.border}`,
                  fontSize: 13,
                  resize: "none",
                  outline: "none",
                  fontFamily: F,
                  marginBottom: 12,
                }}
                onFocus={(e) => (e.target.style.borderColor = C.teal)}
                onBlur={(e) => (e.target.style.borderColor = C.border)}
              />
              <div
                style={{
                  background: C.amberLt,
                  border: `1px solid #FDE68A`,
                  borderRadius: 10,
                  padding: "8px 12px",
                  marginBottom: 12,
                  fontSize: 11,
                  color: "#92400E",
                }}
              >
                ⚠️ <strong>Test Mode:</strong> Card{" "}
                <strong>4111 1111 1111 1111</strong> · OTP:{" "}
                <strong>1234</strong>
              </div>
              <button
                onClick={handlePayment}
                disabled={payLoading || !cartItems.length}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 12,
                  border: "none",
                  cursor:
                    payLoading || !cartItems.length ? "not-allowed" : "pointer",
                  background:
                    payLoading || !cartItems.length
                      ? "#94A3B8"
                      : "linear-gradient(135deg,#059669,#10B981)",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 14,
                  fontFamily: F,
                }}
              >
                {payLoading
                  ? "Opening payment…"
                  : `Pay ₹${totalAmount.toFixed(0)} via Razorpay`}
              </button>
            </div>
          </div>
        )}

        {tab === "orders" && (
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
                padding: "16px 22px",
                borderBottom: `1px solid ${C.border}`,
                fontWeight: 800,
                fontSize: 15,
                color: C.navy,
                fontFamily: F,
              }}
            >
              My Orders ({orders.length})
            </div>
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>📦</div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: C.navy,
                    fontFamily: F,
                    marginBottom: 8,
                  }}
                >
                  No orders yet
                </div>
                <button
                  onClick={() => setTab("shop")}
                  style={{
                    background: `linear-gradient(135deg,${C.tealDk},${C.teal})`,
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    padding: "10px 24px",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: F,
                  }}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.order_id}
                  style={{
                    padding: "15px 22px",
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
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color: C.navy,
                          fontFamily: F,
                          marginBottom: 3,
                        }}
                      >
                        Order #{order.order_id}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: C.slate,
                          marginBottom: 5,
                        }}
                      >
                        {order.items
                          .map((i) => `${i.medicine} ×${i.quantity}`)
                          .join(" · ")}
                      </div>
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: 16,
                          color: C.teal,
                          fontFamily: F,
                        }}
                      >
                        ₹{order.total_amount}
                      </div>
                      {order.delivery_address && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#94A3B8",
                            marginTop: 4,
                          }}
                        >
                          📍 {order.delivery_address}
                        </div>
                      )}
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
