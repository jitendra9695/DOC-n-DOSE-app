import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

// Google Font
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

function RxCard({ rx }) {
  if (!rx) return null;
  return (
    <div
      style={{
        marginTop: 14,
        background: "linear-gradient(135deg,#F0FDF4,#ECFDF5)",
        border: "1px solid #BBF7D0",
        borderRadius: 14,
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 20 }}>📋</span>
        <span
          style={{
            fontWeight: 800,
            fontSize: 14,
            color: "#065F46",
            fontFamily: F,
          }}
        >
          Doctor's Prescription
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          ["🔬 Diagnosis", rx.diagnosis],
          ["🩺 Chief Complaint", rx.chief_complaint || "—"],
        ].map(([k, v]) => (
          <div
            key={k}
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: "10px 12px",
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
              {k}
            </div>
            <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.5 }}>
              {v}
            </div>
          </div>
        ))}
        <div
          style={{
            gridColumn: "1/-1",
            background: "#fff",
            borderRadius: 10,
            padding: "10px 12px",
            border: "1px solid #D1FAE5",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#059669",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            💊 Prescribed Medicines
          </div>
          <div
            style={{
              fontSize: 13,
              color: C.navy,
              whiteSpace: "pre-line",
              lineHeight: 1.7,
            }}
          >
            {rx.medicines}
          </div>
        </div>
        {rx.clinical_notes && (
          <div
            style={{
              gridColumn: "1/-1",
              background: "#fff",
              borderRadius: 10,
              padding: "10px 12px",
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
              📝 Doctor's Notes
            </div>
            <div style={{ fontSize: 13, color: C.navy }}>
              {rx.clinical_notes}
            </div>
          </div>
        )}
        {rx.follow_up_days > 0 && (
          <div
            style={{
              gridColumn: "1/-1",
              background: C.amberLt,
              borderRadius: 10,
              padding: "10px 12px",
              border: "1px solid #FDE68A",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E" }}>
              📅 Follow-up in {rx.follow_up_days} days
            </div>
            {rx.follow_up_notes && (
              <div style={{ fontSize: 12, color: "#78350F", marginTop: 4 }}>
                {rx.follow_up_notes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AptCard({ apt, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const emoji = {
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
  const barColor =
    {
      confirmed: C.mint,
      completed: C.teal,
      cancelled: C.rose,
      pending_payment: C.amber,
    }[apt.status] || C.slate;
  const today = new Date().toISOString().split("T")[0];
  const isPast = apt.appointment_date < today;
  const canDelete =
    isPast ||
    apt.status === "cancelled" ||
    apt.status === "completed" ||
    apt.status === "pending_payment";
  const handleDelete = async () => {
    if (
      !window.confirm(
        `Delete appointment with ${apt.doctor_name}? This cannot be undone.`,
      )
    )
      return;
    setDeleting(true);
    try {
      await api.delete(`/appointments/${apt.id}/delete/`);
      toast.success("Appointment deleted");
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
      <div style={{ width: 5, background: barColor, flexShrink: 0 }} />
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `linear-gradient(135deg,${C.navy},#1A4D6E)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              {emoji[apt.specialization] || "🩺"}
            </div>
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 14,
                  color: C.navy,
                  fontFamily: F,
                }}
              >
                {apt.doctor_name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: C.teal,
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {apt.specialization}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 4,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: 11, color: C.slate }}>
                  📅 {apt.appointment_date}
                </span>
                <span style={{ fontSize: 11, color: C.slate }}>
                  🕐 {apt.appointment_time}
                </span>
                {apt.symptoms && (
                  <span style={{ fontSize: 11, color: C.slate }}>
                    🤒 {apt.symptoms.slice(0, 30)}
                    {apt.symptoms.length > 30 ? "…" : ""}
                  </span>
                )}
              </div>
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
            {apt.status === "confirmed" && (
              <Link
                to={`/chat/${apt.id}`}
                style={{
                  background: `linear-gradient(135deg,${C.tealDk},${C.teal})`,
                  color: "#fff",
                  borderRadius: 10,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 2px 8px #0EA5BE33",
                }}
              >
                💬 Consult
              </Link>
            )}
            {apt.status === "completed" && (
              <button
                onClick={() => setOpen((o) => !o)}
                style={{
                  background: open ? "#EFF6FF" : C.bg,
                  border: "1px solid #BFDBFE",
                  color: "#1D4ED8",
                  borderRadius: 10,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {open ? "Hide Rx ▲" : "View Rx ▼"}
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  background: C.roseLt,
                  border: `1px solid ${C.rose}33`,
                  color: C.rose,
                  borderRadius: 10,
                  padding: "6px 12px",
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
        {open && apt.status === "completed" && <RxCard rx={apt.prescription} />}
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState(null);
  const [tab, setTab] = useState("upcoming");
  const hour = new Date().getHours();
  const greet =
    hour < 12
      ? "Good Morning ☀️"
      : hour < 17
        ? "Good Afternoon 🌤️"
        : "Good Evening 🌙";
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  useEffect(() => {
    api
      .get("/appointments/patient/history/")
      .then((r) => setHistory(r.data))
      .catch(() => {});
  }, []);
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

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F }}>
      <Navbar />
      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(135deg,${C.navy} 0%,#0F3460 55%,#1A5276 100%)`,
          padding: "32px 0 90px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -80,
            top: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(14,165,190,0.1)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -40,
            bottom: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(16,185,129,0.07)",
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
              color: "rgba(255,255,255,0.45)",
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {today}
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.15,
              fontFamily: F,
            }}
          >
            {greet},<br />
            <span style={{ color: C.teal }}>
              {user?.first_name || user?.username}
            </span>
          </h1>
          <p
            style={{
              margin: "10px 0 0",
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
            }}
          >
            Your complete health dashboard — appointments, prescriptions & AI
            assistance.
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: 960,
          margin: "-58px auto 0",
          padding: "0 24px 48px",
          position: "relative",
        }}
      >
        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 14,
            marginBottom: 22,
          }}
        >
          {[
            {
              icon: "📋",
              label: "Total Visits",
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
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: C.card,
                borderRadius: 18,
                padding: "20px 22px",
                boxShadow: "0 2px 12px #0002",
                border: `1px solid ${C.border}`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: -12,
                  top: -12,
                  fontSize: 52,
                  opacity: 0.07,
                }}
              >
                {s.icon}
              </div>
              <div
                style={{
                  fontSize: 32,
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
                  marginTop: 6,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Sanjeevani AI banner */}
        <div
          style={{
            background: "linear-gradient(135deg,#064E3B,#065F46,#047857)",
            borderRadius: 20,
            padding: "22px 26px",
            marginBottom: 22,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 4px 20px #065F4633",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -30,
              top: -30,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 80,
              bottom: -50,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                }}
              >
                🌿
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 20,
                    color: "#fff",
                    fontFamily: F,
                    lineHeight: 1,
                  }}
                >
                  Sanjeevani AI
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#6EE7B7",
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  AI Health Assistant · Powered by Groq
                </div>
              </div>
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                maxWidth: 380,
              }}
            >
              Describe your symptoms and receive instant AI-powered medical
              guidance and specialist recommendations.
            </div>
          </div>
          <Link
            to="/symptom-checker"
            style={{
              position: "relative",
              background: "#10B981",
              color: "#fff",
              borderRadius: 14,
              padding: "13px 26px",
              fontWeight: 800,
              fontSize: 14,
              textDecoration: "none",
              boxShadow: "0 4px 16px #10B98155",
              whiteSpace: "nowrap",
              fontFamily: F,
            }}
          >
            Start AI Consultation →
          </Link>
        </div>

        {/* Quick actions */}
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
              fontWeight: 800,
              fontSize: 14,
              color: C.navy,
              marginBottom: 16,
              fontFamily: F,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontSize: 11,
            }}
          >
            Quick Access
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 12,
            }}
          >
            {[
              {
                icon: "🌿",
                label: "Sanjeevani AI",
                path: "/symptom-checker",
                g: `linear-gradient(135deg,#065F46,#059669)`,
              },
              {
                icon: "👨‍⚕️",
                label: "Find Doctor",
                path: "/doctors",
                g: `linear-gradient(135deg,${C.navy},#1A4D6E)`,
              },
              {
                icon: "💊",
                label: "Order Medicine",
                path: "/medicines",
                g: "linear-gradient(135deg,#7C3AED,#8B5CF6)",
              },
              {
                icon: "📋",
                label: "My Records",
                path: "/patient",
                g: `linear-gradient(135deg,#0F766E,#14B8A6)`,
              },
            ].map((a) => (
              <Link key={a.path} to={a.path} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: a.g,
                    borderRadius: 16,
                    padding: "16px 10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 3px 12px #0002",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-3px)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
                >
                  <span style={{ fontSize: 26 }}>{a.icon}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#fff",
                      textAlign: "center",
                      lineHeight: 1.3,
                      fontFamily: F,
                    }}
                  >
                    {a.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

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
              My Appointments
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
                    transition: "all 0.2s",
                    background: tab === t.key ? C.teal : "transparent",
                    color: tab === t.key ? "#fff" : C.slate,
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
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>
                  {tab === "upcoming"
                    ? "📅"
                    : tab === "completed"
                      ? "🏆"
                      : "⏳"}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: C.navy,
                    marginBottom: 6,
                    fontFamily: F,
                  }}
                >
                  No {tab} appointments
                </div>
                <div style={{ color: C.slate, fontSize: 13, marginBottom: 18 }}>
                  {tab === "upcoming"
                    ? "Book a consultation with a specialist."
                    : ""}
                </div>
                {tab === "upcoming" && (
                  <Link
                    to="/doctors"
                    style={{
                      background: `linear-gradient(135deg,${C.tealDk},${C.teal})`,
                      color: "#fff",
                      borderRadius: 12,
                      padding: "11px 26px",
                      textDecoration: "none",
                      fontSize: 14,
                      fontWeight: 700,
                      boxShadow: "0 3px 12px #0EA5BE33",
                      fontFamily: F,
                    }}
                  >
                    Book an Appointment →
                  </Link>
                )}
              </div>
            ) : (
              list.map((apt) => (
                <AptCard
                  key={apt.id}
                  apt={apt}
                  onDeleted={() =>
                    api
                      .get("/appointments/patient/history/")
                      .then((r) => setHistory(r.data))
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
