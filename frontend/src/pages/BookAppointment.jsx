import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import toast from "react-hot-toast";
import FakePaymentModal from "../components/FakePaymentGateway";

if (!document.getElementById("gf-outfit")) {
  const l = document.createElement("link");
  l.id = "gf-outfit";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap";
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
  slate: "#64748B",
  bg: "#EEF2F7",
  card: "#FFFFFF",
  border: "#E2E8F0",
};

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    api
      .get(`/doctors/${doctorId}/`)
      .then((r) => setDoctor(r.data))
      .catch(() => toast.error("Doctor not found"));
    api
      .get(`/appointments/slots/${doctorId}/?date=${today}`)
      .then((r) => {
        if (r.data.doctor_unavailable) {
          toast.error("Doctor unavailable today.");
          setSlots([]);
        } else setSlots(r.data.slots || []);
      })
      .catch(() => toast.error("Could not load slots"))
      .finally(() => setSlotsLoading(false));
  }, [doctorId]);

  const handleReserve = async () => {
    if (!selectedSlot) return toast.error("Please select a time slot");
    setLoading(true);
    try {
      const res = await api.post("/appointments/book/", {
        doctor_id: doctorId,
        appointment_date: today,
        appointment_time: selectedSlot,
        symptoms,
      });
      setAppointmentId(res.data.id);
      setShowPayment(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    setShowPayment(false);
    try {
      await api.post("/payments/verify/", {
        ...paymentData,
        appointment_id: appointmentId,
      });
    } catch {
      try {
        await api.patch(`/appointments/${appointmentId}/`, {
          status: "confirmed",
        });
      } catch {}
    }
    toast.success("🎉 Appointment confirmed!");
    navigate("/patient");
  };

  const handlePaymentClose = () => {
    setShowPayment(false);
    toast.error("Payment cancelled.");
    if (appointmentId)
      api.delete(`/appointments/${appointmentId}/delete/`).catch(() => {});
  };

  if (!doctor)
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F }}>
        <Navbar />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
            color: C.slate,
          }}
        >
          Loading…
        </div>
      </div>
    );

  const availableSlots = slots.filter((s) => s.is_available);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F }}>
      <Navbar />
      <div
        style={{
          background: `linear-gradient(135deg,${C.navy},#0F3460)`,
          padding: "28px 0 72px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -60,
            top: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "rgba(14,165,190,0.1)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: "0 24px",
            position: "relative",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 600,
              marginBottom: 12,
              padding: 0,
            }}
          >
            ← Back
          </button>
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 900,
              color: "#fff",
              fontFamily: F,
            }}
          >
            Book Appointment
          </h1>
          <p
            style={{
              margin: "6px 0 0",
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
            }}
          >
            Select a slot and confirm your booking
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: 700,
          margin: "-44px auto 0",
          padding: "0 24px 48px",
          position: "relative",
        }}
      >
        {/* Doctor card */}
        <div
          style={{
            background: C.card,
            borderRadius: 18,
            padding: "20px 22px",
            marginBottom: 18,
            border: `1px solid ${C.border}`,
            boxShadow: "0 2px 12px #0002",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: `linear-gradient(135deg,${C.navy},#1A4D6E)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
              }}
            >
              👨‍⚕️
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
                {doctor.full_name}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: C.teal,
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {doctor.specialization}
              </div>
              <div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>
                {doctor.qualification} · {doctor.experience_years} yrs exp
              </div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 20,
                  color: C.teal,
                  fontFamily: F,
                }}
              >
                ₹{doctor.consultation_fee}
              </div>
              <div style={{ fontSize: 11, color: C.slate }}>
                Consultation fee
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 14,
              padding: "10px 14px",
              background: C.bg,
              borderRadius: 10,
            }}
          >
            <span style={{ fontSize: 12, color: C.slate }}>📅 {today}</span>
            <span style={{ fontSize: 12, color: C.slate }}>
              🕐 {doctor.work_start_time} – {doctor.work_end_time}
            </span>
            <span style={{ fontSize: 12, color: C.mint, fontWeight: 600 }}>
              ✅ {availableSlots.length} slots available
            </span>
          </div>
        </div>

        {/* Symptoms */}
        <div
          style={{
            background: C.card,
            borderRadius: 18,
            padding: "20px 22px",
            marginBottom: 18,
            border: `1px solid ${C.border}`,
            boxShadow: "0 1px 6px #0001",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 14,
              color: C.navy,
              fontFamily: F,
              marginBottom: 12,
            }}
          >
            🤒 Symptoms (Optional)
          </div>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe your symptoms briefly…"
            rows={2}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 14px",
              borderRadius: 10,
              border: `1.5px solid ${C.border}`,
              fontSize: 13,
              resize: "none",
              outline: "none",
              fontFamily: F,
            }}
            onFocus={(e) => (e.target.style.borderColor = C.teal)}
            onBlur={(e) => (e.target.style.borderColor = C.border)}
          />
        </div>

        {/* Slots */}
        <div
          style={{
            background: C.card,
            borderRadius: 18,
            padding: "20px 22px",
            marginBottom: 18,
            border: `1px solid ${C.border}`,
            boxShadow: "0 1px 6px #0001",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 14,
              color: C.navy,
              fontFamily: F,
              marginBottom: 14,
            }}
          >
            🕐 Select Time Slot
          </div>
          {slotsLoading ? (
            <div
              style={{ textAlign: "center", padding: "30px 0", color: C.slate }}
            >
              Loading slots…
            </div>
          ) : slots.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>😔</div>
              <div style={{ fontWeight: 700, color: C.navy }}>
                No slots available today
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(90px,1fr))",
                gap: 10,
              }}
            >
              {slots.map((slot) => {
                const isSel = selectedSlot === slot.time;
                const isAvail = slot.is_available;
                return (
                  <button
                    key={slot.time}
                    disabled={!isAvail}
                    onClick={() => isAvail && setSelectedSlot(slot.time)}
                    style={{
                      padding: "10px 6px",
                      borderRadius: 12,
                      border: "2px solid",
                      cursor: isAvail ? "pointer" : "not-allowed",
                      fontWeight: isSel ? 800 : 600,
                      fontSize: 13,
                      fontFamily: F,
                      transition: "all 0.15s",
                      background: !isAvail
                        ? "#F8FAFC"
                        : isSel
                          ? `linear-gradient(135deg,${C.tealDk},${C.teal})`
                          : C.bg,
                      color: !isAvail ? "#CBD5E1" : isSel ? "#fff" : C.navy,
                      borderColor: !isAvail
                        ? "#E2E8F0"
                        : isSel
                          ? C.teal
                          : C.border,
                      boxShadow: isSel ? "0 3px 10px #0EA5BE33" : "none",
                    }}
                  >
                    {slot.time?.slice(0, 5)}
                    {!isAvail && (
                      <div
                        style={{ fontSize: 9, color: "#CBD5E1", marginTop: 2 }}
                      >
                        Booked
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment summary */}
        {selectedSlot && (
          <div
            style={{
              background: C.card,
              borderRadius: 18,
              padding: "20px 22px",
              border: `1px solid ${C.border}`,
              boxShadow: "0 1px 6px #0001",
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 14,
                color: C.navy,
                fontFamily: F,
                marginBottom: 14,
              }}
            >
              💳 Payment Summary
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                fontSize: 13,
                color: C.slate,
              }}
            >
              <span>Consultation Fee</span>
              <span style={{ fontWeight: 700, color: C.navy }}>
                ₹{doctor.consultation_fee}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
                fontSize: 13,
                color: C.slate,
              }}
            >
              <span>Gateway Fee</span>
              <span style={{ fontWeight: 700, color: C.mint }}>
                ₹0 (test mode)
              </span>
            </div>
            <div
              style={{
                borderTop: `1px dashed ${C.border}`,
                paddingTop: 12,
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  color: C.navy,
                  fontFamily: F,
                }}
              >
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
                ₹{doctor.consultation_fee}
              </span>
            </div>
            <div
              style={{
                background: C.amberLt,
                border: "1px solid #FDE68A",
                borderRadius: 10,
                padding: "8px 12px",
                marginBottom: 14,
                fontSize: 11,
                color: "#92400E",
              }}
            >
              ⚠️ <strong>Test Mode:</strong> Card{" "}
              <strong>4111 1111 1111 1111</strong> · Expiry: 12/26 · CVV: 123 ·
              OTP: 1234
            </div>
            <button
              onClick={handleReserve}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 14,
                border: "none",
                background: loading
                  ? "#94A3B8"
                  : `linear-gradient(135deg,${C.tealDk},${C.teal})`,
                color: "#fff",
                fontWeight: 900,
                fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: F,
                boxShadow: "0 4px 14px #0EA5BE33",
              }}
            >
              {loading
                ? "Reserving…"
                : `Pay ₹${doctor.consultation_fee} via Razorpay`}
            </button>
          </div>
        )}
      </div>

      {showPayment && (
        <FakePaymentModal
          amount={doctor?.consultation_fee}
          doctorName={doctor?.full_name}
          onSuccess={handlePaymentSuccess}
          onFailure={() => {
            setShowPayment(false);
            toast.error("Payment failed");
          }}
          onClose={handlePaymentClose}
        />
      )}
    </div>
  );
}
