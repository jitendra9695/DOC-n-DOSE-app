import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import toast from "react-hot-toast";

// Load Razorpay checkout script dynamically
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [doctorUnavailable, setDoctorUnavailable] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

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
          setDoctorUnavailable(true);
          setSlots([]);
          toast.error("Doctor is not available today.");
        } else {
          setDoctorUnavailable(false);
          setSlots(r.data.slots || []);
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.error || "Could not load slots");
        setDoctorUnavailable(true);
      });
  }, [doctorId]);

  // Step 1: Reserve slot
  const handleBook = async () => {
    if (!selectedSlot) return toast.error("Please select a time slot");
    setLoading(true);
    try {
      const res = await api.post("/appointments/book/", {
        doctor: doctorId,
        appointment_date: today,
        appointment_time: selectedSlot,
        symptoms,
      });
      setAppointment(res.data);
      toast.success("Slot reserved! Complete payment to confirm.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Open Razorpay popup
  const handlePayment = async () => {
    setPayLoading(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error(
        "Could not load payment gateway. Check your internet connection.",
      );
      setPayLoading(false);
      return;
    }

    try {
      const orderRes = await api.post("/payments/create-order/", {
        appointment_id: appointment.id,
      });

      const {
        order_id,
        amount,
        currency,
        key_id,
        doctor_name,
        patient_name,
        description,
      } = orderRes.data;

      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "DocNDoSe",
        description: description,
        image: "/logo.png",
        order_id: order_id,

        handler: async (response) => {
          try {
            await api.post("/payments/verify/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment successful! Appointment confirmed. 🎉");
            navigate("/patient");
          } catch {
            toast.error("Payment verification failed. Please contact support.");
          }
        },

        prefill: {
          name: patient_name,
          email: "",
          contact: "",
        },

        theme: {
          color: "#0f6e8a",
        },

        modal: {
          ondismiss: async () => {
            try {
              await api.post("/payments/failed/", { order_id });
            } catch {
              // silently ignore
            }
            toast.error("Payment cancelled.");
            setPayLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", async (response) => {
        try {
          await api.post("/payments/failed/", { order_id });
        } catch {
          // silently ignore
        }
        toast.error(`Payment failed: ${response.error.description}`);
        setPayLoading(false);
      });

      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not initiate payment");
      setPayLoading(false);
    }
  };

  if (!doctor) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          color: "#64748b",
        }}
      >
        Loading doctor info…
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
      }}
    >
      <Navbar />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px" }}>
        <Link
          to="/doctors"
          style={{ color: "#0891b2", fontSize: 13, textDecoration: "none" }}
        >
          ← Back to Doctors
        </Link>

        {/* Doctor card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "20px 24px",
            marginTop: 16,
            marginBottom: 20,
            boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#0f6e8a,#0891b2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {doctor.full_name?.charAt(0)}
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {doctor.full_name}
              </h2>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 13,
                  color: "#0891b2",
                  textTransform: "capitalize",
                }}
              >
                {doctor.specialization}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>
                {doctor.experience_years} yrs exp &nbsp;·&nbsp; ₹
                {doctor.consultation_fee} fee &nbsp;·&nbsp;{" "}
                {doctor.work_start_time} – {doctor.work_end_time}
              </p>
            </div>
          </div>
        </div>

        {/* Show Unavailable Message if doctor is not available today */}
        {doctorUnavailable ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "32px 24px",
              textAlign: "center",
              boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>🚫</div>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: 18,
                fontWeight: 700,
                color: "#b91c1c",
              }}
            >
              Doctor Unavailable Today
            </h3>
            <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
              Dr. {doctor.full_name} has marked themselves as unavailable for
              today. Please choose another doctor or come back tomorrow.
            </p>
            <Link to="/doctors">
              <button
                style={{
                  marginTop: 20,
                  padding: "10px 24px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg,#0f6e8a,#0891b2)",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Browse Other Doctors
              </button>
            </Link>
          </div>
        ) : !appointment ? (
          <>
            {/* Slot selection */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "20px 24px",
                marginBottom: 16,
                boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                📅 Available Slots — Today ({today})
              </h3>
              {slots.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 13 }}>
                  No slots available today.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 8,
                  }}
                >
                  {slots.map((slot, i) => (
                    <button
                      key={i}
                      disabled={!slot.is_available}
                      onClick={() =>
                        slot.is_available && setSelectedSlot(slot.time)
                      }
                      style={{
                        padding: "8px 4px",
                        borderRadius: 8,
                        border: "none",
                        cursor: slot.is_available ? "pointer" : "not-allowed",
                        fontSize: 13,
                        fontWeight: 600,
                        transition: "all 0.15s",
                        background: !slot.is_available
                          ? "#fee2e2"
                          : selectedSlot === slot.time
                            ? "linear-gradient(135deg,#0f6e8a,#0891b2)"
                            : "#f0fdf4",
                        color: !slot.is_available
                          ? "#f87171"
                          : selectedSlot === slot.time
                            ? "#fff"
                            : "#166534",
                        border:
                          selectedSlot === slot.time
                            ? "none"
                            : "1px solid #e2e8f0",
                      }}
                    >
                      {slot.time}
                      {!slot.is_available && (
                        <div
                          style={{ fontSize: 9, marginTop: 2, opacity: 0.8 }}
                        >
                          Booked
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Symptoms */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "20px 24px",
                marginBottom: 20,
                boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                📝 Symptoms (Optional)
              </h3>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  fontSize: 14,
                  resize: "none",
                  outline: "none",
                  background: "#f8fafc",
                }}
                placeholder="Describe your symptoms briefly…"
                onFocus={(e) => (e.target.style.borderColor = "#0891b2")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            <button
              onClick={handleBook}
              disabled={loading || !selectedSlot || slots.length === 0}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 12,
                border: "none",
                cursor:
                  loading || !selectedSlot || slots.length === 0
                    ? "not-allowed"
                    : "pointer",
                background:
                  loading || !selectedSlot || slots.length === 0
                    ? "#94a3b8"
                    : "linear-gradient(135deg,#0f6e8a,#0891b2)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                boxShadow: "0 3px 12px rgba(8,145,178,0.25)",
              }}
            >
              {loading
                ? "Reserving slot…"
                : slots.length === 0
                  ? "No slots available"
                  : "Reserve Slot & Proceed to Payment"}
            </button>
          </>
        ) : (
          /* Payment step */
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "28px 24px",
              textAlign: "center",
              boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h3
              style={{
                margin: "0 0 4px",
                fontSize: 20,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Slot Reserved!
            </h3>
            <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 14 }}>
              {appointment.appointment_date} &nbsp;at&nbsp;{" "}
              <strong>{appointment.appointment_time}</strong>
            </p>

            <div
              style={{
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 24,
                textAlign: "left",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  fontWeight: 700,
                  color: "#0369a1",
                  fontSize: 14,
                }}
              >
                Payment Summary
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#1e293b",
                  marginBottom: 4,
                }}
              >
                <span>Consultation Fee</span>
                <span>₹{doctor.consultation_fee}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#64748b",
                  marginBottom: 4,
                }}
              >
                <span>Gateway Fee</span>
                <span>₹0 (test mode)</span>
              </div>
              <div
                style={{
                  borderTop: "1px solid #bae6fd",
                  marginTop: 8,
                  paddingTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#0369a1",
                }}
              >
                <span>Total</span>
                <span>₹{doctor.consultation_fee}</span>
              </div>
            </div>

            <div
              style={{
                background: "#fef9c3",
                border: "1px solid #fde047",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 20,
                fontSize: 12,
                color: "#854d0e",
              }}
            >
              ⚠️ <strong>Test Mode:</strong> Use test card{" "}
              <strong>4111 1111 1111 1111</strong>, any future expiry, any CVV.
            </div>

            <button
              onClick={handlePayment}
              disabled={payLoading}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 12,
                border: "none",
                cursor: payLoading ? "not-allowed" : "pointer",
                background: payLoading
                  ? "#94a3b8"
                  : "linear-gradient(135deg,#16a34a,#22c55e)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                boxShadow: "0 3px 12px rgba(22,163,74,0.3)",
              }}
            >
              {payLoading
                ? "Opening payment…"
                : `Pay ₹${doctor.consultation_fee} via Razorpay`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
