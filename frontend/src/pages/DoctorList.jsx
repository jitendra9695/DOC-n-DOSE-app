import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";

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
  slate: "#64748B",
  bg: "#EEF2F7",
  card: "#FFFFFF",
  border: "#E2E8F0",
};

// ── Specialty config — icon + gradient + label ──────────────────────────────
const SPECS = [
  {
    key: "all",
    icon: "🏥",
    label: "All Doctors",
    grad: `linear-gradient(135deg,${C.navy},#1A4D6E)`,
  },
  {
    key: "general",
    icon: "🩺",
    label: "General",
    grad: "linear-gradient(135deg,#0F766E,#14B8A6)",
  },
  {
    key: "cardiologist",
    icon: "❤️",
    label: "Cardiology",
    grad: "linear-gradient(135deg,#BE123C,#F43F5E)",
  },
  {
    key: "neurologist",
    icon: "🧠",
    label: "Neurology",
    grad: "linear-gradient(135deg,#6D28D9,#8B5CF6)",
  },
  {
    key: "dermatologist",
    icon: "🧴",
    label: "Dermatology",
    grad: "linear-gradient(135deg,#B45309,#F59E0B)",
  },
  {
    key: "orthopedic",
    icon: "🦴",
    label: "Orthopedic",
    grad: "linear-gradient(135deg,#0369A1,#38BDF8)",
  },
  {
    key: "pediatrician",
    icon: "👶",
    label: "Pediatrics",
    grad: "linear-gradient(135deg,#0E7490,#22D3EE)",
  },
  {
    key: "psychiatrist",
    icon: "🧘",
    label: "Psychiatry",
    grad: "linear-gradient(135deg,#7C3AED,#A78BFA)",
  },
  {
    key: "gynecologist",
    icon: "👩‍⚕️",
    label: "Gynecology",
    grad: "linear-gradient(135deg,#9D174D,#EC4899)",
  },
  {
    key: "ent",
    icon: "👂",
    label: "ENT",
    grad: "linear-gradient(135deg,#065F46,#34D399)",
  },
  {
    key: "ophthalmologist",
    icon: "👁️",
    label: "Eye Care",
    grad: "linear-gradient(135deg,#1D4ED8,#60A5FA)",
  },
  {
    key: "dentist",
    icon: "🦷",
    label: "Dental",
    grad: "linear-gradient(135deg,#374151,#9CA3AF)",
  },
  {
    key: "urologist",
    icon: "🫁",
    label: "Urology",
    grad: "linear-gradient(135deg,#92400E,#FBBF24)",
  },
];

const SPEC_MAP = Object.fromEntries(SPECS.map((s) => [s.key, s]));

// ── Star rating visual (static decorative) ──────────────────────────────────
function Stars({ n = 4 }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{ color: i <= n ? "#F59E0B" : "#E2E8F0", fontSize: 12 }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

// ── Single Doctor Card ───────────────────────────────────────────────────────
function DoctorCard({ doc }) {
  const spec = SPEC_MAP[doc.specialization] || SPEC_MAP["general"];
  const stars = Math.min(5, Math.max(3, Math.floor(doc.experience_years / 4)));
  const [availableSlots, setAvailableSlots] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  const [doctorUnavailable, setDoctorUnavailable] = useState(false);

  useEffect(() => {
    api
      .get(`/appointments/slots/${doc.id}/?date=${today}`)
      .then((r) => {
        if (r.data.doctor_unavailable) {
          setDoctorUnavailable(true);
          setAvailableSlots(0);
        } else {
          const free = (r.data.slots || []).filter(
            (s) => s.is_available,
          ).length;
          setAvailableSlots(free);
        }
      })
      .catch(() => setAvailableSlots(0));
  }, [doc.id]);

  return (
    <div
      style={{
        background: C.card,
        borderRadius: 20,
        overflow: "hidden",
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 12px #0001",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.22s, box-shadow 0.22s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 12px 32px #0003";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 2px 12px #0001";
      }}
    >
      {/* Colored header stripe */}
      <div
        style={{
          background: spec.grad,
          padding: "22px 20px 18px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circle */}
        <div
          style={{
            position: "absolute",
            right: -24,
            top: -24,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 20,
            bottom: -30,
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            position: "relative",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              flexShrink: 0,
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(4px)",
              border: "2px solid rgba(255,255,255,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
            }}
          >
            {spec.icon}
          </div>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 15,
                color: "#fff",
                fontFamily: F,
                lineHeight: 1.2,
              }}
            >
              {doc.full_name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.75)",
                marginTop: 3,
                fontWeight: 500,
              }}
            >
              {spec.label} Specialist
            </div>
            <div style={{ marginTop: 5 }}>
              <Stars n={stars} />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "16px 18px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Qualification */}
        <div
          style={{
            background: "#F8FAFC",
            borderRadius: 10,
            padding: "8px 12px",
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: C.slate,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 3,
            }}
          >
            Qualification
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.navy,
              fontFamily: F,
            }}
          >
            {doc.qualification || "MBBS"}
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
          }}
        >
          {[
            {
              icon: "⏱",
              label: "Experience",
              value: `${doc.experience_years} yrs`,
            },
            { icon: "💰", label: "Fee", value: `₹${doc.consultation_fee}` },
            {
              icon: "🕐",
              label: "Hours",
              value: `${doc.work_start_time?.slice(0, 5)}–${doc.work_end_time?.slice(0, 5)}`,
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: C.tealLt,
                borderRadius: 10,
                padding: "8px 6px",
                textAlign: "center",
                border: `1px solid ${C.tealLt}`,
              }}
            >
              <div style={{ fontSize: 14, marginBottom: 2 }}>{s.icon}</div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: C.tealDk,
                  fontFamily: F,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: C.slate,
                  marginTop: 1,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Bio */}
        {doc.bio && (
          <p
            style={{
              fontSize: 12,
              color: C.slate,
              lineHeight: 1.6,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {doc.bio}
          </p>
        )}

        {/* Availability status — real data from backend */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {availableSlots === null ? (
            <div
              style={{
                height: 12,
                width: 140,
                borderRadius: 6,
                background: "linear-gradient(90deg,#E2E8F0,#F1F5F9,#E2E8F0)",
              }}
            />
          ) : doctorUnavailable ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 999,
                padding: "4px 10px",
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#F43F5E",
                }}
              />
              <span style={{ fontSize: 11, color: "#F43F5E", fontWeight: 700 }}>
                Unavailable Today
              </span>
            </div>
          ) : availableSlots === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#FEF2F2",
                border: "1px solid #FECADA",
                borderRadius: 999,
                padding: "4px 10px",
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#F43F5E",
                }}
              />
              <span style={{ fontSize: 11, color: "#F43F5E", fontWeight: 700 }}>
                No slots left today
              </span>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: C.mintLt,
                border: "1px solid #BBF7D0",
                borderRadius: 999,
                padding: "4px 10px",
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: C.mint,
                  boxShadow: `0 0 6px ${C.mint}`,
                }}
              />
              <span style={{ fontSize: 11, color: C.mint, fontWeight: 700 }}>
                {availableSlots} slot{availableSlots !== 1 ? "s" : ""} available
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        {doctorUnavailable ? (
          <div
            style={{
              background: "#F8FAFC",
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "12px 0",
              textAlign: "center",
              fontWeight: 700,
              fontSize: 13,
              color: C.slate,
              marginTop: "auto",
            }}
          >
            Not Available Today
          </div>
        ) : (
          <Link
            to={`/book/${doc.id}`}
            style={{ textDecoration: "none", marginTop: "auto" }}
          >
            <div
              style={{
                background: availableSlots === 0 ? C.slate : spec.grad,
                color: "#fff",
                borderRadius: 12,
                padding: "12px 0",
                textAlign: "center",
                fontWeight: 800,
                fontSize: 14,
                fontFamily: F,
                boxShadow: "0 4px 14px #0002",
                transition: "opacity 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {availableSlots === 0 ? "Slots Full Today" : "Book Appointment →"}
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Specialty filter pill ────────────────────────────────────────────────────
function SpecPill({ spec, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        fontFamily: F,
        fontSize: 13,
        fontWeight: 700,
        transition: "all 0.2s",
        background: active ? spec.grad : C.card,
        color: active ? "#fff" : C.slate,
        boxShadow: active ? "0 3px 12px #0003" : `0 1px 4px #0001`,
        border: active ? "none" : `1px solid ${C.border}`,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 16 }}>{spec.icon}</span>
      {spec.label}
    </button>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function DoctorList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState(
    searchParams.get("specialization") || "all",
  );
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const url =
      filter !== "all" ? `/doctors/?specialization=${filter}` : "/doctors/";
    api
      .get(url)
      .then((r) => setDoctors(r.data))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = doctors.filter(
    (d) =>
      !search ||
      d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.includes(search.toLowerCase()) ||
      d.qualification?.toLowerCase().includes(search.toLowerCase()),
  );

  const active = SPECS.find((s) => s.key === filter) || SPECS[0];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F }}>
      <Navbar />

      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(135deg,${C.navy} 0%,#0F3460 60%,#1A5276 100%)`,
          padding: "30px 0 82px",
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
            left: -50,
            bottom: -70,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(16,185,129,0.07)",
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
              margin: "12px 0 6px",
              fontSize: 28,
              fontWeight: 900,
              color: "#fff",
              fontFamily: F,
            }}
          >
            Find Your <span style={{ color: C.teal }}>Specialist</span>
          </h1>
          <p
            style={{
              margin: "0 0 20px",
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
            }}
          >
            {doctors.length} verified doctors · Book today's appointment
            instantly
          </p>

          {/* Search bar */}
          <div style={{ position: "relative", maxWidth: 480 }}>
            <span
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 16,
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, specialization…"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 16px 13px 46px",
                borderRadius: 16,
                border: "none",
                fontSize: 14,
                fontFamily: F,
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                outline: "none",
                backdropFilter: "blur(8px)",
                boxShadow: "0 2px 16px #0003",
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
          margin: "-44px auto 0",
          padding: "0 24px 48px",
          position: "relative",
        }}
      >
        {/* Specialty filter pills — horizontal scroll */}
        <div
          style={{
            background: C.card,
            borderRadius: 20,
            padding: "16px 20px",
            marginBottom: 24,
            border: `1px solid ${C.border}`,
            boxShadow: "0 2px 12px #0002",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.slate,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 12,
            }}
          >
            Filter by Specialization
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {SPECS.map((s) => (
              <SpecPill
                key={s.key}
                spec={s}
                active={filter === s.key}
                onClick={() => {
                  setFilter(s.key);
                  setSearch("");
                }}
              />
            ))}
          </div>
        </div>

        {/* Active filter header */}
        {filter !== "all" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: active.grad,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              {active.icon}
            </div>
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 16,
                  color: C.navy,
                  fontFamily: F,
                }}
              >
                {active.label} Specialists
              </div>
              <div style={{ fontSize: 12, color: C.slate }}>
                {filtered.length} doctor{filtered.length !== 1 ? "s" : ""}{" "}
                available
              </div>
            </div>
            <button
              onClick={() => setFilter("all")}
              style={{
                marginLeft: "auto",
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "6px 14px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                color: C.slate,
              }}
            >
              Clear Filter ×
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
              gap: 20,
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  background: C.card,
                  borderRadius: 20,
                  height: 320,
                  border: `1px solid ${C.border}`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: 110,
                    background:
                      "linear-gradient(90deg,#E2E8F0,#F1F5F9,#E2E8F0)",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
                <div
                  style={{
                    padding: 18,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {[80, 60, 100, 40].map((w, j) => (
                    <div
                      key={j}
                      style={{
                        height: 12,
                        borderRadius: 6,
                        background:
                          "linear-gradient(90deg,#E2E8F0,#F1F5F9,#E2E8F0)",
                        width: `${w}%`,
                        animation: "shimmer 1.5s infinite",
                      }}
                    />
                  ))}
                </div>
                <style>{`@keyframes shimmer{0%{background-position:-200px 0}100%{background-position:200px 0}}`}</style>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              background: C.card,
              borderRadius: 20,
              padding: "60px 20px",
              textAlign: "center",
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 18,
                color: C.navy,
                fontFamily: F,
                marginBottom: 8,
              }}
            >
              No doctors found
            </div>
            <div style={{ color: C.slate, fontSize: 14, marginBottom: 20 }}>
              {search
                ? `No results for "${search}"`
                : `No ${filter} specialists available right now.`}
            </div>
            <button
              onClick={() => {
                setFilter("all");
                setSearch("");
              }}
              style={{
                background: `linear-gradient(135deg,${C.tealDk},${C.teal})`,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "11px 26px",
                fontWeight: 800,
                cursor: "pointer",
                fontSize: 14,
                fontFamily: F,
              }}
            >
              View All Doctors
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: 12,
                color: C.slate,
                fontWeight: 600,
                marginBottom: 14,
              }}
            >
              Showing {filtered.length} doctor{filtered.length !== 1 ? "s" : ""}
              {search && ` for "${search}"`}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
                gap: 20,
              }}
            >
              {filtered.map((doc) => (
                <DoctorCard key={doc.id} doc={doc} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
