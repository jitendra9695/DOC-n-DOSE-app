import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  AreaChart,
  Area,
} from "recharts";

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
  violet: "#8B5CF6",
  slate: "#64748B",
  bg: "#EEF2F7",
  card: "#FFFFFF",
  border: "#E2E8F0",
};

const PALETTE = [
  C.teal,
  C.mint,
  C.amber,
  C.rose,
  C.indigo,
  C.violet,
  "#F97316",
  "#06B6D4",
  "#84CC16",
  "#EC4899",
];

// ── Shared atoms ──────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, fullWidth }) {
  return (
    <div
      style={{
        background: C.card,
        borderRadius: 20,
        padding: "22px 24px",
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 12px #0001",
        gridColumn: fullWidth ? "1 / -1" : "auto",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: 15,
            color: C.navy,
            fontFamily: F,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: C.slate, marginTop: 3 }}>
            {subtitle}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color, bg }) {
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
          right: -14,
          top: -14,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: bg,
          opacity: 0.5,
        }}
      />
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
          marginBottom: 12,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          color,
          fontFamily: F,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{ fontSize: 12, fontWeight: 600, color: C.slate, marginTop: 5 }}
      >
        {label}
      </div>
      {sub && (
        <div
          style={{ fontSize: 11, color: C.slate, marginTop: 3, opacity: 0.7 }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function Loading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 220,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
        <div style={{ fontSize: 13, color: C.slate }}>Loading data…</div>
      </div>
    </div>
  );
}

function NoData() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 200,
        color: C.slate,
        flexDirection: "column",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 32 }}>📊</span>
      <span style={{ fontSize: 13 }}>No data yet — add some records first</span>
    </div>
  );
}

const TIP = {
  contentStyle: {
    borderRadius: 10,
    border: `1px solid ${C.border}`,
    fontFamily: F,
    fontSize: 12,
  },
  cursor: { fill: "#0EA5BE10" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD 1 — Appointment Analytics
// ═══════════════════════════════════════════════════════════════════════════════
function AppointmentDash() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api
      .get("/auth/admin/analytics/appointments/")
      .then((r) => setData(r.data))
      .catch(() => {});
  }, []);
  if (!data) return <Loading />;

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

  // Build heatmap grid
  const heatMax = Math.max(...(data.heatmap || []).map((h) => h.count), 1);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      {/* Daily line chart */}
      <ChartCard title="Daily Appointments" subtitle="Last 30 days">
        {data.daily?.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.daily}>
              <defs>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.teal} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fontFamily: F }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 10, fontFamily: F }}
                allowDecimals={false}
              />
              <Tooltip
                {...TIP}
                formatter={(v) => [v, "Appointments"]}
                labelFormatter={(l) => `Date: ${l}`}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={C.teal}
                strokeWidth={2.5}
                fill="url(#tealGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>

      {/* Weekly line chart */}
      <ChartCard title="Weekly Appointments" subtitle="Last 12 weeks">
        {data.weekly?.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.weekly}>
              <defs>
                <linearGradient id="mintGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.mint} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={C.mint} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fontFamily: F }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 10, fontFamily: F }}
                allowDecimals={false}
              />
              <Tooltip {...TIP} formatter={(v) => [v, "Appointments"]} />
              <Area
                type="monotone"
                dataKey="count"
                stroke={C.mint}
                strokeWidth={2.5}
                fill="url(#mintGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>

      {/* Top doctors bar chart */}
      <ChartCard title="Top 5 Most Booked Doctors" subtitle="All time">
        {data.top_doctors?.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.top_doctors} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={C.border}
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fontFamily: F }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fontFamily: F }}
                width={130}
              />
              <Tooltip {...TIP} formatter={(v) => [v, "Appointments"]} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {data.top_doctors.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>

      {/* Completed vs Cancelled pie */}
      <ChartCard title="Completed vs Cancelled" subtitle="All appointments">
        {data.status_pie?.some((s) => s.value > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.status_pie}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                <Cell fill={C.mint} />
                <Cell fill={C.rose} />
              </Pie>
              <Tooltip {...TIP} formatter={(v) => [v, "Appointments"]} />
              <Legend wrapperStyle={{ fontFamily: F, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>

      {/* Heatmap — peak hours */}
      <ChartCard
        title="Peak Booking Hours Heatmap"
        subtitle="Hour × Day of week"
        fullWidth
      >
        {data.heatmap?.length ? (
          <div style={{ overflowX: "auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `60px repeat(${HOURS.length}, 1fr)`,
                gap: 3,
                minWidth: 600,
              }}
            >
              {/* Header row */}
              <div />
              {HOURS.map((h) => (
                <div
                  key={h}
                  style={{
                    textAlign: "center",
                    fontSize: 10,
                    color: C.slate,
                    fontWeight: 700,
                    padding: "2px 0",
                  }}
                >
                  {h}:00
                </div>
              ))}
              {/* Data rows */}
              {DAYS.map((day) => (
                <>
                  <div
                    key={`label-${day}`}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.slate,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {day}
                  </div>
                  {HOURS.map((hour) => {
                    const cell = data.heatmap.find(
                      (h) => h.day === day && h.hour === hour,
                    );
                    const count = cell?.count || 0;
                    const intensity = count / heatMax;
                    const bg =
                      count === 0
                        ? "#F8FAFC"
                        : `rgba(14, 165, 190, ${0.15 + intensity * 0.85})`;
                    return (
                      <div
                        key={`${day}-${hour}`}
                        title={`${day} ${hour}:00 — ${count} bookings`}
                        style={{
                          background: bg,
                          borderRadius: 6,
                          height: 36,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: count > 0 ? 700 : 400,
                          color: intensity > 0.5 ? "#fff" : C.navy,
                          cursor: "default",
                          transition: "transform 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.15)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "")
                        }
                      >
                        {count > 0 ? count : ""}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
            <div
              style={{
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                color: C.slate,
              }}
            >
              <span>Low</span>
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 20,
                    height: 14,
                    borderRadius: 4,
                    background: `rgba(14,165,190,${i})`,
                  }}
                />
              ))}
              <span>High</span>
            </div>
          </div>
        ) : (
          <NoData />
        )}
      </ChartCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD 2 — Doctor Performance
// ═══════════════════════════════════════════════════════════════════════════════
function DoctorDash() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api
      .get("/auth/admin/analytics/doctors/")
      .then((r) => setData(r.data))
      .catch(() => {});
  }, []);
  if (!data) return <Loading />;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      {/* Patient volume bar */}
      <ChartCard
        title="Patient Volume per Doctor"
        subtitle="Total appointments handled"
        fullWidth
      >
        {data.patient_volume?.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.patient_volume}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fontFamily: F }}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fontSize: 10, fontFamily: F }}
                allowDecimals={false}
              />
              <Tooltip {...TIP} formatter={(v) => [v, "Patients"]} />
              <Bar dataKey="patients" radius={[6, 6, 0, 0]}>
                {data.patient_volume.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>

      {/* Prescription frequency */}
      <ChartCard
        title="Prescription Frequency"
        subtitle="Number of prescriptions written per doctor"
      >
        {data.prescriptions?.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.prescriptions} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={C.border}
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fontFamily: F }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fontFamily: F }}
                width={130}
              />
              <Tooltip {...TIP} formatter={(v) => [v, "Prescriptions"]} />
              <Bar dataKey="count" fill={C.indigo} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>

      {/* Availability trend */}
      <ChartCard
        title="Active Doctors Trend"
        subtitle="Number of doctors with confirmed appointments per day (last 30 days)"
      >
        {data.availability_trend?.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.availability_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fontFamily: F }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 10, fontFamily: F }}
                allowDecimals={false}
              />
              <Tooltip {...TIP} formatter={(v) => [v, "Active Doctors"]} />
              <Line
                type="monotone"
                dataKey="active_doctors"
                stroke={C.amber}
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>

      {/* Chat activity table */}
      <ChartCard
        title="Doctor Chat Activity"
        subtitle="Total messages sent in consultations"
      >
        {data.chat_activity?.length ? (
          <div style={{ overflowY: "auto", maxHeight: 220 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: F,
              }}
            >
              <thead>
                <tr style={{ background: C.bg }}>
                  {["Doctor", "Messages"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.slate,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.chat_activity.map((row, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#F8FAFC")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "")
                    }
                  >
                    <td
                      style={{
                        padding: "9px 12px",
                        fontSize: 13,
                        color: C.navy,
                        fontWeight: 600,
                      }}
                    >
                      {row.doctor}
                    </td>
                    <td
                      style={{
                        padding: "9px 12px",
                        fontSize: 13,
                        color: C.teal,
                        fontWeight: 800,
                      }}
                    >
                      {row.messages}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 20, color: C.slate, fontSize: 13 }}>
            No chat data yet
          </div>
        )}
      </ChartCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD 3 — Medicine Store Analytics
// ═══════════════════════════════════════════════════════════════════════════════
function MedicineDash() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api
      .get("/auth/admin/analytics/medicines/")
      .then((r) => setData(r.data))
      .catch(() => {});
  }, []);
  if (!data) return <Loading />;

  const ALERT_COLOR = {
    critical: {
      bg: "#FEF2F2",
      color: "#991B1B",
      dot: C.rose,
      label: "Critical",
    },
    low: { bg: "#FFFBEB", color: "#92400E", dot: C.amber, label: "Low" },
    ok: { bg: "#F0FDF4", color: "#065F46", dot: C.mint, label: "OK" },
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      {/* Top selling medicines */}
      <ChartCard title="Top 10 Selling Medicines" subtitle="By quantity sold">
        {data.top_medicines?.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.top_medicines} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={C.border}
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fontFamily: F }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 9, fontFamily: F }}
                width={145}
                tickFormatter={(n) =>
                  n.length > 18 ? n.slice(0, 17) + "…" : n
                }
              />
              <Tooltip
                {...TIP}
                formatter={(v, n) => [
                  v,
                  n === "sold" ? "Units Sold" : "Revenue (₹)",
                ]}
              />
              <Bar dataKey="sold" fill={C.teal} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>

      {/* Category-wise sales pie */}
      <ChartCard
        title="Category-wise Sales"
        subtitle="Revenue by medicine type"
      >
        {data.category_sales?.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.category_sales}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={40}
                label={({ category, percent }) =>
                  percent > 0.04
                    ? `${category} ${(percent * 100).toFixed(0)}%`
                    : ""
                }
                labelLine={false}
              >
                {data.category_sales.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip
                {...TIP}
                formatter={(v) => [`₹${v.toFixed(0)}`, "Revenue"]}
              />
              <Legend wrapperStyle={{ fontFamily: F, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>

      {/* Order value histogram */}
      <ChartCard
        title="Order Value Distribution"
        subtitle="Number of orders per price bucket"
      >
        {data.histogram?.some((h) => h.orders > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.histogram}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="range" tick={{ fontSize: 11, fontFamily: F }} />
              <YAxis
                tick={{ fontSize: 10, fontFamily: F }}
                allowDecimals={false}
              />
              <Tooltip {...TIP} formatter={(v) => [v, "Orders"]} />
              <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                {data.histogram.map((_, i) => (
                  <Cell
                    key={i}
                    fill={[C.mint, C.teal, C.indigo, C.violet][i]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoData />
        )}
      </ChartCard>

      {/* Stock alert table */}
      <ChartCard
        title="Stock Alert Table"
        subtitle="Red ≤5 · Yellow ≤10 · Green = OK"
      >
        <div style={{ overflowY: "auto", maxHeight: 220 }}>
          {data.stock_table?.length ? (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: F,
              }}
            >
              <thead>
                <tr style={{ background: C.bg }}>
                  {["Medicine", "Stock", "Price", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 10px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.slate,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.stock_table.slice(0, 30).map((med, i) => {
                  const a = ALERT_COLOR[med.alert];
                  return (
                    <tr
                      key={i}
                      style={{
                        background: a.bg,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <td
                        style={{
                          padding: "8px 10px",
                          fontSize: 12,
                          color: C.navy,
                          fontWeight: 600,
                          maxWidth: 160,
                        }}
                      >
                        {med.name.length > 22
                          ? med.name.slice(0, 21) + "…"
                          : med.name}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          fontSize: 13,
                          fontWeight: 800,
                          color: a.color,
                        }}
                      >
                        {med.stock}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          fontSize: 12,
                          color: C.slate,
                        }}
                      >
                        ₹{med.price}
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <span
                          style={{
                            background: `${a.dot}22`,
                            color: a.color,
                            borderRadius: 999,
                            padding: "2px 8px",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          {a.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <NoData />
          )}
        </div>
      </ChartCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD 4 — Financial Analytics
// ═══════════════════════════════════════════════════════════════════════════════
function FinancialDash() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api
      .get("/auth/admin/analytics/financial/")
      .then((r) => setData(r.data))
      .catch(() => {});
  }, []);
  if (!data) return <Loading />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 14,
        }}
      >
        <KpiCard
          icon="💰"
          label="Total Revenue"
          value={`₹${data.total_revenue?.toFixed(0)}`}
          color={C.mint}
          bg={C.mintLt}
          sub="All successful payments"
        />
        <KpiCard
          icon="📅"
          label="This Month"
          value={`₹${data.month_revenue?.toFixed(0)}`}
          color={C.teal}
          bg={C.tealLt}
          sub="Current month revenue"
        />
        <KpiCard
          icon="📊"
          label="Avg Transaction"
          value={`₹${data.avg_transaction?.toFixed(0)}`}
          color={C.indigo}
          bg="#EEF2FF"
          sub="Per successful payment"
        />
        <KpiCard
          icon="✅"
          label="Successful Payments"
          value={data.total_success}
          color={C.amber}
          bg={C.amberLt}
          sub="Completed transactions"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* Daily revenue trend */}
        <ChartCard
          title="Daily Revenue Trend"
          subtitle="Last 30 days (₹)"
          fullWidth
        >
          {data.daily_trend?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.daily_trend}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.mint} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C.mint} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fontFamily: F }}
                  tickFormatter={(d) => d.slice(5)}
                />
                <YAxis
                  tick={{ fontSize: 10, fontFamily: F }}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip {...TIP} formatter={(v) => [`₹${v}`, "Revenue"]} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={C.mint}
                  strokeWidth={2.5}
                  fill="url(#revGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>

        {/* Payment success/fail donut */}
        <ChartCard title="Payment Status" subtitle="Success · Failed · Pending">
          {data.payment_donut?.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.payment_donut}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {data.payment_donut.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...TIP} formatter={(v) => [v, "Transactions"]} />
                <Legend wrapperStyle={{ fontFamily: F, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>

        {/* Revenue by specialization */}
        <ChartCard
          title="Revenue by Specialization"
          subtitle="Total ₹ collected per specialty"
          fullWidth
        >
          {data.revenue_by_spec?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.revenue_by_spec}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis
                  dataKey="specialization"
                  tick={{ fontSize: 10, fontFamily: F }}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fontSize: 10, fontFamily: F }}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip {...TIP} formatter={(v) => [`₹${v}`, "Revenue"]} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {data.revenue_by_spec.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — Admin Analytics Page
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { key: "appointments", icon: "📅", label: "Appointment Analytics" },
  { key: "doctors", icon: "👨‍⚕️", label: "Doctor Performance" },
  { key: "medicines", icon: "💊", label: "Medicine Store" },
  { key: "financial", icon: "💰", label: "Financial" },
];

export default function AdminAnalytics() {
  const [tab, setTab] = useState("appointments");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F }}>
      <Navbar />

      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(135deg,${C.navy},#0F2D5A,#1A3A6E)`,
          padding: "28px 0 82px",
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
            background: "rgba(99,102,241,0.1)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -50,
            bottom: -60,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(14,165,190,0.08)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: 1200,
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
            📊 Analytics <span style={{ color: C.teal }}>Center</span>
          </h1>
          <p
            style={{ margin: 0, color: "rgba(255,255,255,0.45)", fontSize: 13 }}
          >
            4 dashboards — appointments, doctors, medicines & financials
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1200,
          margin: "-50px auto 0",
          padding: "0 24px 48px",
          position: "relative",
        }}
      >
        {/* Tab bar */}
        <div
          style={{
            background: C.card,
            borderRadius: 20,
            padding: "6px",
            marginBottom: 22,
            border: `1px solid ${C.border}`,
            boxShadow: "0 2px 12px #0002",
            display: "flex",
            gap: 4,
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                padding: "12px 8px",
                border: "none",
                cursor: "pointer",
                borderRadius: 14,
                fontFamily: F,
                fontWeight: 700,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                transition: "all 0.2s",
                background:
                  tab === t.key
                    ? `linear-gradient(135deg,${C.tealDk},${C.teal})`
                    : "transparent",
                color: tab === t.key ? "#fff" : C.slate,
                boxShadow: tab === t.key ? "0 3px 10px #0EA5BE33" : "none",
              }}
            >
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard content */}
        {tab === "appointments" && <AppointmentDash />}
        {tab === "doctors" && <DoctorDash />}
        {tab === "medicines" && <MedicineDash />}
        {tab === "financial" && <FinancialDash />}
      </div>
    </div>
  );
}
