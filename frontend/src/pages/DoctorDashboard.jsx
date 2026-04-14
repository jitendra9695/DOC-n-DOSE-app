import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  mint: "#10B981",
  mintLt: "#ECFDF5",
  amber: "#F59E0B",
  amberLt: "#FFFBEB",
  rose: "#F43F5E",
  roseLt: "#FFF1F2",
  indigo: "#6366F1",
  slate: "#64748B",
  bg: "#EEF2F7",
  card: "#FFFFFF",
  border: "#E2E8F0",
};

function Badge({ status }) {
  const M = {
    confirmed: [C.mintLt, C.mint, "Confirmed"],
    completed: ["#EFF6FF", "#2563EB", "Completed"],
    pending_payment: [C.amberLt, C.amber, "Pending Payment"],
    cancelled: [C.roseLt, C.rose, "Cancelled"],
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
        letterSpacing: 0.4,
      }}
    >
      {label}
    </span>
  );
}

/* ── Prescription Form ─────────────────────────────────────────────────────── */
function RxForm({ apt, onSaved, onCancel }) {
  const [form, setForm] = useState({
    diagnosis: apt.prescription?.diagnosis || "",
    chief_complaint: apt.prescription?.chief_complaint || apt.symptoms || "",
    clinical_notes: apt.prescription?.clinical_notes || "",
    medicines: apt.prescription?.medicines || "",
    follow_up_days: apt.prescription?.follow_up_days || 0,
    follow_up_notes: apt.prescription?.follow_up_notes || "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.diagnosis.trim()) return toast.error("Diagnosis is required");
    if (!form.medicines.trim()) return toast.error("Medicines are required");
    setSaving(true);
    try {
      const res = await api.post(`/appointments/${apt.id}/prescribe/`, form);
      toast.success("Prescription saved!");
      onSaved(res.data.appointment);
    } catch (err) {
      toast.error(err.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const inp = (label, key, rows = 0, type = "text") => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: C.slate,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </label>
      {rows > 0 ? (
        <textarea
          rows={rows}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: `1.5px solid ${C.border}`,
            fontSize: 13,
            resize: "vertical",
            outline: "none",
            fontFamily: F,
            lineHeight: 1.6,
          }}
          onFocus={(e) => (e.target.style.borderColor = C.teal)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: `1.5px solid ${C.border}`,
            fontSize: 13,
            outline: "none",
            fontFamily: F,
          }}
          onFocus={(e) => (e.target.style.borderColor = C.teal)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
      )}
    </div>
  );

  return (
    <div
      style={{
        background: "#F8FAFC",
        borderRadius: 14,
        padding: 18,
        marginTop: 12,
        border: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
          📋 Write Prescription
        </span>
        <button
          onClick={onCancel}
          style={{
            background: "none",
            border: "none",
            color: C.slate,
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
      {inp("Chief Complaint", "chief_complaint", 2)}
      {inp("Diagnosis *", "diagnosis", 2)}
      {inp("Clinical Notes / Examination Findings", "clinical_notes", 2)}
      {inp("Medicines & Dosage * (one per line)", "medicines", 3)}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
        {inp("Follow-up (days)", "follow_up_days", 0, "number")}
        {inp("Follow-up Instructions", "follow_up_notes", 0)}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            flex: 1,
            padding: "11px 0",
            borderRadius: 10,
            border: "none",
            cursor: saving ? "not-allowed" : "pointer",
            background: saving
              ? "#94A3B8"
              : `linear-gradient(135deg,${C.tealDk},${C.teal})`,
            color: "#fff",
            fontWeight: 800,
            fontSize: 14,
            fontFamily: F,
            boxShadow: "0 3px 10px #0EA5BE33",
          }}
        >
          {saving ? "Saving…" : "💾 Save & Complete Appointment"}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "11px 18px",
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.card,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 13,
            color: C.slate,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── Completed Rx display ──────────────────────────────────────────────────── */
function RxDisplay({ apt, onEdit }) {
  const rx = apt.prescription;
  if (!rx) return null;
  return (
    <div
      style={{
        background: "linear-gradient(135deg,#F0FDF4,#ECFDF5)",
        border: "1px solid #BBF7D0",
        borderRadius: 14,
        padding: "14px 16px",
        marginTop: 12,
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
            fontSize: 13,
            color: "#065F46",
            fontFamily: F,
          }}
        >
          ✅ Prescription on Record
        </span>
        <button
          onClick={onEdit}
          style={{
            background: "none",
            border: "1px solid #86EFAC",
            color: C.mint,
            borderRadius: 8,
            padding: "3px 10px",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          ✏️ Edit
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          fontSize: 13,
        }}
      >
        {[
          ["Diagnosis", rx.diagnosis],
          ["Chief Complaint", rx.chief_complaint || "—"],
          ["Clinical Notes", rx.clinical_notes || "—"],
        ].map(([k, v]) => (
          <div
            key={k}
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: "8px 10px",
              border: "1px solid #D1FAE5",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#059669",
                marginBottom: 3,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {k}
            </div>
            <div style={{ color: C.navy, lineHeight: 1.5 }}>{v}</div>
          </div>
        ))}
        <div
          style={{
            gridColumn: "1/-1",
            background: "#fff",
            borderRadius: 8,
            padding: "8px 10px",
            border: "1px solid #D1FAE5",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#059669",
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            💊 Medicines
          </div>
          <div
            style={{ color: C.navy, whiteSpace: "pre-line", lineHeight: 1.7 }}
          >
            {rx.medicines}
          </div>
        </div>
        {rx.follow_up_days > 0 && (
          <div
            style={{
              gridColumn: "1/-1",
              background: C.amberLt,
              borderRadius: 8,
              padding: "8px 10px",
              border: "1px solid #FDE68A",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: "#92400E" }}>
              📅 Follow-up in {rx.follow_up_days} days — {rx.follow_up_notes}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Appointment Card ──────────────────────────────────────────────────────── */
function AptCard({ apt: init, onDeleted }) {
  const [apt, setApt] = useState(init);
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const canDelete = apt.status === "completed" || apt.appointment_date < today;
  const handleDelete = async () => {
    if (!window.confirm(`Delete appointment with ${apt.patient_name}?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/appointments/${apt.id}/delete/`);
      toast.success("Deleted");
      onDeleted();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 1px 6px #0001",
        display: "flex",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 18px #0002")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 6px #0001")
      }
    >
      <div
        style={{
          width: 5,
          background:
            {
              confirmed: C.mint,
              completed: C.teal,
              cancelled: C.rose,
              pending_payment: C.amber,
            }[apt.status] || C.slate,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, padding: "15px 18px" }}>
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
                fontSize: 15,
                color: C.navy,
                fontFamily: F,
              }}
            >
              {apt.patient_name}
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 5,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 12, color: C.slate }}>
                📅 {apt.appointment_date}
              </span>
              <span style={{ fontSize: 12, color: C.slate }}>
                🕐 {apt.appointment_time} – {apt.slot_end_time}
              </span>
              {apt.symptoms && (
                <span style={{ fontSize: 12, color: C.teal }}>
                  🤒 {apt.symptoms}
                </span>
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Badge status={apt.status} />
            <Link
              to={`/chat/${apt.id}`}
              style={{
                background: "#F0F9FF",
                border: "1px solid #BAE6FD",
                color: "#0369A1",
                borderRadius: 10,
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              💬 Chat
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "5px 12px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                color: C.slate,
              }}
            >
              {open ? "Hide ▲" : "Details ▼"}
            </button>
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  background: C.roseLt,
                  border: `1px solid ${C.rose}33`,
                  color: C.rose,
                  borderRadius: 10,
                  padding: "5px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                {deleting ? "…" : "🗑"}
              </button>
            )}
          </div>
        </div>

        {open && (
          <div style={{ marginTop: 12 }}>
            {apt.status === "completed" && !showForm && (
              <RxDisplay apt={apt} onEdit={() => setShowForm(true)} />
            )}
            {apt.status === "confirmed" && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  width: "100%",
                  padding: "11px 0",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background: `linear-gradient(135deg,${C.tealDk},${C.teal})`,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 14,
                  fontFamily: F,
                  boxShadow: "0 3px 10px #0EA5BE33",
                  marginTop: 8,
                }}
              >
                📋 Write Diagnosis & Prescription
              </button>
            )}
            {showForm && (
              <RxForm
                apt={apt}
                onSaved={(updated) => {
                  setApt(updated);
                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Profile Form ──────────────────────────────────────────────────────────── */
function ProfileForm({ profile, form, setForm, onSave, onCancel }) {
  const specs = [
    "general",
    "cardiologist",
    "dermatologist",
    "neurologist",
    "orthopedic",
    "pediatrician",
    "psychiatrist",
    "gynecologist",
    "ent",
    "ophthalmologist",
    "dentist",
    "urologist",
  ];
  const inp = (label, key, type = "text") => (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 700,
          color: C.slate,
          marginBottom: 5,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </label>
      {type === "select" ? (
        <select
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          style={{
            width: "100%",
            padding: "9px 10px",
            borderRadius: 10,
            border: `1.5px solid ${C.border}`,
            fontSize: 13,
            outline: "none",
            fontFamily: F,
            background: "#fff",
          }}
        >
          {specs.map((o) => (
            <option key={o} value={o}>
              {o.charAt(0).toUpperCase() + o.slice(1)}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "9px 10px",
            borderRadius: 10,
            border: `1.5px solid ${C.border}`,
            fontSize: 13,
            outline: "none",
            fontFamily: F,
          }}
          onFocus={(e) => (e.target.style.borderColor = C.teal)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
      )}
    </div>
  );
  return (
    <div
      style={{
        background: C.card,
        borderRadius: 20,
        padding: "22px 24px",
        marginBottom: 22,
        border: `1px solid ${C.border}`,
        boxShadow: "0 1px 6px #0001",
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
            fontWeight: 800,
            fontSize: 16,
            color: C.navy,
            fontFamily: F,
          }}
        >
          {profile ? "Edit Profile" : "Complete Your Profile"}
        </span>
        {profile && (
          <button
            onClick={onCancel}
            style={{
              background: "none",
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
        )}
      </div>
      <form
        onSubmit={onSave}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
      >
        {inp("Specialization", "specialization", "select")}
        {inp("Experience (years)", "experience_years", "number")}
        {inp("Consultation Fee (₹)", "consultation_fee", "number")}
        {inp("Qualification", "qualification")}
        {inp("Work Start Time", "work_start_time", "time")}
        {inp("Work End Time", "work_end_time", "time")}
        <div style={{ gridColumn: "1/-1" }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              color: C.slate,
              marginBottom: 5,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Bio
          </label>
          <textarea
            rows={2}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "9px 10px",
              borderRadius: 10,
              border: `1.5px solid ${C.border}`,
              fontSize: 13,
              outline: "none",
              resize: "vertical",
              fontFamily: F,
            }}
          />
        </div>
        <div style={{ gridColumn: "1/-1" }}>
          <button
            type="submit"
            style={{
              padding: "11px 28px",
              borderRadius: 12,
              border: "none",
              background: `linear-gradient(135deg,${C.tealDk},${C.teal})`,
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: F,
              fontSize: 14,
            }}
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────────────────────── */
export default function DoctorDashboard() {
  const [history, setHistory] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showPF, setShowPF] = useState(false);
  const [pForm, setPForm] = useState({
    specialization: "general",
    experience_years: 0,
    consultation_fee: 500,
    bio: "",
    qualification: "",
    work_start_time: "09:00",
    work_end_time: "17:00",
  });
  const [tab, setTab] = useState("upcoming");

  const load = () =>
    api
      .get("/appointments/doctor/history/")
      .then((r) => setHistory(r.data))
      .catch(() => {});
  useEffect(() => {
    load();
    api
      .get("/doctors/my-profile/")
      .then((r) => {
        setProfile(r.data);
        setPForm({
          specialization: r.data.specialization,
          experience_years: r.data.experience_years,
          consultation_fee: r.data.consultation_fee,
          bio: r.data.bio,
          qualification: r.data.qualification,
          work_start_time: r.data.work_start_time,
          work_end_time: r.data.work_end_time,
        });
      })
      .catch(() => setShowPF(true));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      if (profile) await api.put("/doctors/my-profile/", pForm);
      else await api.post("/doctors/my-profile/", pForm);
      toast.success(profile ? "Profile updated!" : "Profile created!");
      setShowPF(false);
      api.get("/doctors/my-profile/").then((r) => setProfile(r.data));
    } catch {
      toast.error("Failed to save profile");
    }
  };
  const tabs = [
    {
      key: "upcoming",
      icon: "🗓",
      label: "Upcoming",
      n: history?.upcoming?.length ?? 0,
    },
    {
      key: "completed",
      icon: "✅",
      label: "Completed",
      n: history?.completed?.length ?? 0,
    },
    {
      key: "pending",
      icon: "⏳",
      label: "Pending",
      n: history?.pending?.length ?? 0,
    },
  ];
  const list = history?.[tab] || [];
  const hour = new Date().getHours();
  const greet =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F }}>
      <Navbar />
      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(135deg,${C.navy} 0%,#0F2D5A 60%,#1A3A6E 100%)`,
          padding: "32px 0 86px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -60,
            top: -60,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "rgba(14,165,190,0.1)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -50,
            bottom: -70,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.07)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: 960,
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
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Doctor Portal
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.2,
              fontFamily: F,
            }}
          >
            {greet},<br />
            <span style={{ color: C.teal }}>
              {profile
                ? `Dr. ${profile.user?.first_name || "Doctor"}`
                : "Doctor"}
            </span>{" "}
            👨‍⚕️
          </h1>
          {profile && (
            <p
              style={{
                margin: "8px 0 0",
                color: "rgba(255,255,255,0.5)",
                fontSize: 13,
                textTransform: "capitalize",
              }}
            >
              {profile.specialization} · {profile.experience_years} years
              experience
            </p>
          )}
        </div>
      </div>

      <div
        style={{
          maxWidth: 960,
          margin: "-54px auto 0",
          padding: "0 24px 48px",
          position: "relative",
        }}
      >
        {/* Stats */}
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
              icon: "📋",
              label: "Total",
              value: history?.total ?? 0,
              color: C.teal,
            },
            {
              icon: "🗓",
              label: "Upcoming",
              value: history?.upcoming?.length ?? 0,
              color: C.mint,
            },
            {
              icon: "✅",
              label: "Completed",
              value: history?.completed?.length ?? 0,
              color: C.indigo,
            },
            {
              icon: "⏳",
              label: "Pending",
              value: history?.pending?.length ?? 0,
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
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.slate,
                  marginTop: 5,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Profile banner or form */}
        {profile && !showPF && (
          <div
            style={{
              background: C.card,
              borderRadius: 20,
              padding: "16px 22px",
              marginBottom: 22,
              border: `1px solid ${C.border}`,
              boxShadow: "0 1px 6px #0001",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: `linear-gradient(135deg,${C.navy},#1A4D6E)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                👨‍⚕️
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: C.navy,
                    fontFamily: F,
                    textTransform: "capitalize",
                  }}
                >
                  {profile.specialization}
                </div>
                <div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>
                  {profile.work_start_time} – {profile.work_end_time}{" "}
                  &nbsp;·&nbsp; ₹{profile.consultation_fee} &nbsp;·&nbsp;{" "}
                  {profile.experience_years} yrs exp
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span
                style={{
                  background: profile.is_approved ? C.mintLt : C.amberLt,
                  color: profile.is_approved ? C.mint : C.amber,
                  borderRadius: 999,
                  padding: "4px 14px",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {profile.is_approved ? "✅ Approved" : "⏳ Pending Approval"}
              </span>
              <button
                onClick={() => setShowPF(true)}
                style={{
                  border: `1px solid ${C.border}`,
                  background: C.bg,
                  borderRadius: 10,
                  padding: "6px 14px",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.slate,
                }}
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
        {(!profile || showPF) && (
          <ProfileForm
            profile={profile}
            form={pForm}
            setForm={setPForm}
            onSave={saveProfile}
            onCancel={() => setShowPF(false)}
          />
        )}

        {/* Appointments */}
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
              padding: "20px 24px 0",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 15,
                color: C.navy,
                marginBottom: 16,
                fontFamily: F,
              }}
            >
              Patient Appointments
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    padding: "9px 20px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: F,
                    borderRadius: "10px 10px 0 0",
                    background: tab === t.key ? C.teal : "transparent",
                    color: tab === t.key ? "#fff" : C.slate,
                    transition: "all 0.2s",
                  }}
                >
                  {t.icon} {t.label}{" "}
                  <span
                    style={{
                      background:
                        tab === t.key ? "rgba(255,255,255,0.22)" : C.bg,
                      borderRadius: 999,
                      padding: "1px 7px",
                      fontSize: 11,
                      marginLeft: 4,
                    }}
                  >
                    {t.n}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div
            style={{
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {list.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>
                  {tab === "upcoming"
                    ? "🗓"
                    : tab === "completed"
                      ? "✅"
                      : "⏳"}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: C.navy,
                    fontFamily: F,
                  }}
                >
                  No {tab} appointments
                </div>
              </div>
            ) : (
              list.map((apt) => <AptCard key={apt.id} apt={apt} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
