// FakePaymentGateway.jsx
// Drop-in replacement for Razorpay — looks real, works perfectly for demo
// Usage: import { openFakePayment } from './FakePaymentGateway';

import { useState } from "react";
import { createPortal } from "react-dom";

const C = {
  teal: "#0EA5BE",
  navy: "#0B1F3A",
  mint: "#10B981",
  rose: "#F43F5E",
  slate: "#64748B",
  border: "#E2E8F0",
};

function FakePaymentModal({
  amount,
  doctorName,
  onSuccess,
  onFailure,
  onClose,
}) {
  const [step, setStep] = useState("method"); // method | card | upi | processing | success | failed
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [otp, setOtp] = useState("");
  const [upiId, setUpiId] = useState("");
  const [error, setError] = useState("");

  const fmt = (n) => `₹${parseFloat(n).toFixed(2)}`;

  const processPayment = () => {
    setStep("processing");
    setTimeout(() => {
      // Generate fake transaction IDs
      const paymentId =
        "pay_fake_" + Math.random().toString(36).substr(2, 14).toUpperCase();
      const orderId =
        "order_fake_" + Math.random().toString(36).substr(2, 14).toUpperCase();
      const signature =
        "sig_fake_" + Math.random().toString(36).substr(2, 28).toUpperCase();
      setStep("success");
      setTimeout(() => {
        onSuccess({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature,
        });
      }, 1500);
    }, 2000);
  };

  const handleCardPay = () => {
    setError("");
    if (cardNum.replace(/\s/g, "").length < 16)
      return setError("Enter valid 16-digit card number");
    if (!expiry.includes("/")) return setError("Enter expiry as MM/YY");
    if (cvv.length < 3) return setError("Enter valid CVV");
    setStep("otp");
  };

  const handleOtp = () => {
    setError("");
    if (otp.length < 4) return setError("Enter valid OTP");
    processPayment();
  };

  const handleUpi = () => {
    setError("");
    if (!upiId.includes("@"))
      return setError("Enter valid UPI ID (e.g. name@upi)");
    processPayment();
  };

  const fmtCard = (v) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  const fmtExp = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  const overlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI',sans-serif",
  };
  const modal = {
    background: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
    overflow: "hidden",
    position: "relative",
  };

  return createPortal(
    <div
      style={overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={modal}>
        {/* Header */}
        <div
          style={{
            background: "#1a1a2e",
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                background: "#00BAF2",
                borderRadius: 6,
                padding: "3px 8px",
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 13,
                  letterSpacing: 0.5,
                }}
              >
                razorpay
              </span>
            </div>
            <div>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>
                DocNDoSe Healthcare
              </div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>
                Secured by Razorpay
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>
              {fmt(amount)}
            </div>
            {doctorName && (
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10 }}>
                {doctorName}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              fontSize: 22,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Test mode banner */}
        <div
          style={{
            background: "#FEF3C7",
            padding: "7px 18px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 13 }}>⚠️</span>
          <span style={{ fontSize: 11, color: "#92400E", fontWeight: 600 }}>
            Test Mode — Card: <strong>4111 1111 1111 1111</strong> · Expiry:
            12/26 · CVV: 123 · OTP: 1234
          </span>
        </div>

        <div style={{ padding: "20px 22px" }}>
          {/* METHOD SELECTION */}
          {step === "method" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, color: C.slate, marginBottom: 4 }}>
                Choose payment method
              </div>
              {[
                {
                  icon: "💳",
                  label: "Credit / Debit Card",
                  sub: "Visa, Mastercard, RuPay",
                  action: () => setStep("card"),
                },
                {
                  icon: "📱",
                  label: "UPI",
                  sub: "GPay, PhonePe, Paytm",
                  action: () => setStep("upi"),
                },
                {
                  icon: "🏦",
                  label: "Net Banking",
                  sub: "All major banks",
                  action: processPayment,
                },
                {
                  icon: "👛",
                  label: "Wallets",
                  sub: "Paytm, Mobikwik, Freecharge",
                  action: processPayment,
                },
              ].map((m, i) => (
                <button
                  key={i}
                  onClick={m.action}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "13px 16px",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: 12,
                    background: "#F8FAFC",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#00BAF2";
                    e.currentTarget.style.background = "#F0FBFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                    e.currentTarget.style.background = "#F8FAFC";
                  }}
                >
                  <span style={{ fontSize: 22 }}>{m.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#1a1a2e",
                      }}
                    >
                      {m.label}
                    </div>
                    <div style={{ fontSize: 11, color: C.slate }}>{m.sub}</div>
                  </div>
                  <span
                    style={{ marginLeft: "auto", color: C.slate, fontSize: 16 }}
                  >
                    ›
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* CARD FORM */}
          {step === "card" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>
                💳 Card Details
              </div>
              {[
                {
                  label: "Card Number",
                  value: cardNum,
                  set: (v) => setCardNum(fmtCard(v)),
                  placeholder: "4111 1111 1111 1111",
                  type: "text",
                },
                {
                  label: "Expiry (MM/YY)",
                  value: expiry,
                  set: (v) => setExpiry(fmtExp(v)),
                  placeholder: "12/26",
                  type: "text",
                },
                {
                  label: "CVV",
                  value: cvv,
                  set: (v) => setCvv(v.replace(/\D/, "").slice(0, 4)),
                  placeholder: "123",
                  type: "password",
                },
              ].map((f) => (
                <div key={f.label}>
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
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "11px 14px",
                      borderRadius: 10,
                      border: "1.5px solid #E2E8F0",
                      fontSize: 14,
                      outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#00BAF2")}
                    onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                  />
                </div>
              ))}
              {error && (
                <div style={{ color: C.rose, fontSize: 12, fontWeight: 600 }}>
                  ⚠️ {error}
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setStep("method")}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 10,
                    border: "1.5px solid #E2E8F0",
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.slate,
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleCardPay}
                  style={{
                    flex: 2,
                    padding: "11px 0",
                    borderRadius: 10,
                    border: "none",
                    background: "#00BAF2",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  Pay {fmt(amount)}
                </button>
              </div>
            </div>
          )}

          {/* OTP */}
          {step === "otp" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 4 }}>📱</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>
                Enter OTP
              </div>
              <div style={{ fontSize: 12, color: C.slate }}>
                OTP sent to your registered mobile number
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/, "").slice(0, 6))
                }
                placeholder="Enter OTP (use: 1234)"
                style={{
                  textAlign: "center",
                  padding: "13px",
                  borderRadius: 10,
                  border: "1.5px solid #E2E8F0",
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: 8,
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#00BAF2")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
              {error && (
                <div style={{ color: C.rose, fontSize: 12 }}>⚠️ {error}</div>
              )}
              <button
                onClick={handleOtp}
                style={{
                  padding: "12px 0",
                  borderRadius: 10,
                  border: "none",
                  background: "#00BAF2",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                Verify & Pay {fmt(amount)}
              </button>
            </div>
          )}

          {/* UPI */}
          {step === "upi" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>
                📱 UPI Payment
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "center",
                  marginBottom: 4,
                }}
              >
                {["GPay", "PhonePe", "Paytm", "BHIM"].map((u) => (
                  <button
                    key={u}
                    onClick={processPayment}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      border: "1.5px solid #E2E8F0",
                      background: "#F8FAFC",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#1a1a2e",
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
              <div
                style={{ textAlign: "center", color: C.slate, fontSize: 12 }}
              >
                — or enter UPI ID —
              </div>
              <input
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                style={{
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #E2E8F0",
                  fontSize: 14,
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#00BAF2")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
              {error && (
                <div style={{ color: C.rose, fontSize: 12 }}>⚠️ {error}</div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setStep("method")}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 10,
                    border: "1.5px solid #E2E8F0",
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.slate,
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleUpi}
                  style={{
                    flex: 2,
                    padding: "11px 0",
                    borderRadius: 10,
                    border: "none",
                    background: "#00BAF2",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  Pay {fmt(amount)}
                </button>
              </div>
            </div>
          )}

          {/* PROCESSING */}
          {step === "processing" && (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#1a1a2e",
                  marginBottom: 8,
                }}
              >
                Processing Payment…
              </div>
              <div style={{ fontSize: 12, color: C.slate }}>
                Please wait, do not close this window
              </div>
              <div
                style={{
                  marginTop: 20,
                  height: 4,
                  background: "#E2E8F0",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "#00BAF2",
                    borderRadius: 999,
                    animation: "progress 2s linear forwards",
                  }}
                />
              </div>
              <style>{`@keyframes progress{from{width:0%}to{width:100%}}`}</style>
            </div>
          )}

          {/* SUCCESS */}
          {step === "success" && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  background: "#ECFDF5",
                  border: "3px solid #10B981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: 34,
                }}
              >
                ✅
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#065F46",
                  marginBottom: 6,
                }}
              >
                Payment Successful!
              </div>
              <div style={{ fontSize: 13, color: C.slate, marginBottom: 4 }}>
                Amount: <strong>{fmt(amount)}</strong>
              </div>
              <div style={{ fontSize: 11, color: "#94A3B8" }}>
                Appointment confirmed. Redirecting…
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "10px 18px",
            borderTop: "1px solid #F1F5F9",
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#FAFAFA",
          }}
        >
          <span style={{ fontSize: 10, color: "#94A3B8" }}>🔒 Secured by</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: "#00BAF2" }}>
            Razorpay
          </span>
          <span style={{ fontSize: 10, color: "#94A3B8", marginLeft: "auto" }}>
            256-bit SSL encryption
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── Main export function — drop-in Razorpay replacement ──────────────────────
export function openFakePayment({ amount, doctorName, onSuccess, onFailure }) {
  return { amount, doctorName, onSuccess, onFailure };
}

export default FakePaymentModal;
