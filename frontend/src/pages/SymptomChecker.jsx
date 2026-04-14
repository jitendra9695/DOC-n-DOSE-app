import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import toast from "react-hot-toast";

const SEVERITY_COLOR = {
  mild: { bg: "#f0fdf4", border: "#86efac", text: "#166534" },
  moderate: { bg: "#fffbeb", border: "#fcd34d", text: "#92400e" },
  severe: { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b" },
};
const SPEC_EMOJI = {
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
const WELCOME = {
  role: "bot",
  type: "question",
  text: "Hello! I'm Sanjeevani AI 👋\n\nI'll help you understand your symptoms and suggest the right doctor.\n\nWhat are you experiencing today?",
  options: [],
  data: null,
};

function TypingDots() {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: "10px 14px",
        background: "#fff",
        borderRadius: "16px 16px 16px 4px",
        width: "fit-content",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        border: "1px solid #e2e8f0",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#94a3b8",
            animation: "bounce 1.2s infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}

function AssessmentCard({ data, showHindi, onToggle, onFind }) {
  const sev = SEVERITY_COLOR[data.severity] || SEVERITY_COLOR.mild;
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        border: `1.5px solid ${sev.border}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.09)",
        maxWidth: 420,
      }}
    >
      {data.is_emergency && (
        <div
          style={{
            background: "#dc2626",
            color: "#fff",
            padding: "10px 16px",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          🚨{" "}
          {data.emergency_message ||
            "Please seek emergency medical care immediately!"}
        </div>
      )}
      <div
        style={{
          background: "linear-gradient(135deg,#0f6e8a,#0891b2)",
          padding: "14px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 10,
              color: "rgba(255,255,255,0.7)",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Most Likely
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: 17,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {data.primary_disease}
          </p>
        </div>
        {data.confidence && (
          <div
            style={{
              background: "rgba(255,255,255,0.18)",
              borderRadius: 40,
              padding: "6px 12px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 800,
                color: "#fff",
              }}
            >
              {data.confidence}%
            </p>
            <p
              style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.7)" }}
            >
              confidence
            </p>
          </div>
        )}
      </div>
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              background: sev.bg,
              border: `1px solid ${sev.border}`,
              color: sev.text,
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {data.severity?.charAt(0).toUpperCase() + data.severity?.slice(1)}{" "}
            severity
          </span>
          <span
            style={{
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              color: "#0369a1",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {SPEC_EMOJI[data.specialization] || "🩺"}{" "}
            {data.specialization_label || data.specialization}
          </span>
        </div>
        {data.suggested_medicines?.length > 0 && (
          <div>
            <p
              style={{
                margin: "0 0 6px",
                fontSize: 11,
                fontWeight: 700,
                color: "#374151",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              💊 Suggested Medicines
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {data.suggested_medicines.map((m, i) => (
                <span
                  key={i}
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#166534",
                    borderRadius: 8,
                    padding: "3px 8px",
                    fontSize: 12,
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 10,
            padding: "10px 12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 700,
                color: "#92400e",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              💡 Advice
            </p>
            <button
              onClick={onToggle}
              style={{
                background: showHindi ? "#0f6e8a" : "#e2e8f0",
                color: showHindi ? "#fff" : "#475569",
                border: "none",
                borderRadius: 12,
                padding: "2px 8px",
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {showHindi ? "🇮🇳 Hindi" : "🇬🇧 English"}
            </button>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#78350f",
              lineHeight: 1.55,
            }}
          >
            {showHindi ? data.advice_hi : data.advice_en}
          </p>
        </div>
        {data.possible_diseases?.length > 1 && (
          <div>
            <p
              style={{
                margin: "0 0 5px",
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Other Possibilities
            </p>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {data.possible_diseases.slice(1, 3).map((d, i) => (
                <span
                  key={i}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#475569",
                    borderRadius: 8,
                    padding: "3px 8px",
                    fontSize: 11,
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => onFind(data.specialization)}
          style={{
            width: "100%",
            padding: "11px 0",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg,#0f6e8a,#0891b2)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(8,145,178,0.25)",
          }}
        >
          {SPEC_EMOJI[data.specialization] || "🩺"} Find a{" "}
          {data.specialization_label || data.specialization} →
        </button>
        <p
          style={{
            margin: 0,
            fontSize: 10,
            color: "#94a3b8",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          ⚠️ {data.disclaimer}
        </p>
      </div>
    </div>
  );
}

export default function SymptomChecker() {
  const [messages, setMessages] = useState([WELCOME]);
  const [apiHistory, setApiHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [showHindi, setShowHindi] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const addMsg = (role, type, text, options = [], data = null) => {
    setMessages((prev) => [...prev, { role, type, text, options, data }]);
  };

  const send = async (text) => {
    if (!text.trim() || loading) return;
    addMsg("user", "text", text);
    setInput("");
    setLoading(true);
    const newHist = [...apiHistory, { role: "user", content: text }];
    setApiHistory(newHist);
    try {
      const res = await api.post("/ai/symptom-chat/", { messages: newHist });
      const d = res.data;
      if (d.type === "final_assessment") {
        addMsg(
          "bot",
          "assessment",
          "Here is my assessment based on our conversation:",
          [],
          d,
        );
        setAssessment(d);
        setApiHistory((prev) => [
          ...prev,
          { role: "assistant", content: JSON.stringify(d) },
        ]);
      } else {
        const botText = d.message || "Could you tell me more?";
        addMsg("bot", "question", botText, d.options || []);
        setApiHistory((prev) => [
          ...prev,
          { role: "assistant", content: botText },
        ]);
      }
    } catch {
      addMsg(
        "bot",
        "question",
        "Sorry, I had trouble connecting. Please try again.",
        [],
      );
      toast.error("Connection error");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const reset = () => {
    setMessages([WELCOME]);
    setApiHistory([]);
    setInput("");
    setAssessment(null);
    setShowHindi(false);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f4f6f9",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
      }}
    >
      <Navbar />
      <div
        style={{
          background: "linear-gradient(135deg,#1a4d6e,#0f6e8a)",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <Link
          to="/patient"
          style={{
            color: "rgba(255,255,255,0.7)",
            textDecoration: "none",
            fontSize: 18,
          }}
        >
          ←
        </Link>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            border: "2px solid rgba(255,255,255,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          🤖
        </div>
        <div>
          <p
            style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff" }}
          >
            Sanjeevani AI
          </p>
          <p
            style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.6)" }}
          >
            Your Personal Health Assistant · Groq AI
          </p>
        </div>
        <button
          onClick={reset}
          style={{
            marginLeft: "auto",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff",
            borderRadius: 8,
            padding: "5px 12px",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          🔄 New Chat
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const isBot = msg.role === "bot";
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isUser ? "flex-end" : "flex-start",
                gap: 8,
              }}
            >
              {isBot && idx > 0 && (
                <span style={{ fontSize: 11, color: "#64748b", marginLeft: 4 }}>
                  🤖 Sanjeevani AI
                </span>
              )}
              {msg.type !== "assessment" && (
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "10px 14px",
                    borderRadius: isUser
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    fontSize: 14,
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                    wordBreak: "break-word",
                    ...(isUser
                      ? {
                          background: "linear-gradient(135deg,#0f6e8a,#0891b2)",
                          color: "#fff",
                          boxShadow: "0 2px 8px rgba(15,110,138,0.2)",
                        }
                      : {
                          background: "#fff",
                          color: "#1e293b",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        }),
                  }}
                >
                  {msg.text}
                </div>
              )}
              {msg.type === "assessment" && msg.data && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "16px 16px 16px 4px",
                      padding: "10px 14px",
                      border: "1px solid #e2e8f0",
                      fontSize: 14,
                      color: "#1e293b",
                      maxWidth: "75%",
                    }}
                  >
                    {msg.text}
                  </div>
                  <AssessmentCard
                    data={msg.data}
                    showHindi={showHindi}
                    onToggle={() => setShowHindi((h) => !h)}
                    onFind={(spec) =>
                      (window.location.href = `/doctors?specialization=${spec}`)
                    }
                  />
                </div>
              )}
              {isBot && msg.options?.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    maxWidth: "75%",
                  }}
                >
                  {msg.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => send(opt)}
                      disabled={loading || idx !== messages.length - 1}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 20,
                        border: "1.5px solid #0891b2",
                        background:
                          idx === messages.length - 1 ? "#f0f9ff" : "#f8fafc",
                        color:
                          idx === messages.length - 1 ? "#0369a1" : "#94a3b8",
                        cursor:
                          loading || idx !== messages.length - 1
                            ? "default"
                            : "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 11, color: "#64748b", marginLeft: 4 }}>
              🤖 Sanjeevani AI
            </span>
            <TypingDots />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {!assessment ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          style={{
            padding: "12px 16px",
            background: "#fff",
            borderTop: "1px solid #e8edf3",
            display: "flex",
            gap: 10,
            flexShrink: 0,
            boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptom or type a reply…"
            disabled={loading}
            style={{
              flex: 1,
              padding: "11px 16px",
              borderRadius: 24,
              border: "1.5px solid #e2e8f0",
              fontSize: 14,
              outline: "none",
              background: "#f8fafc",
              color: "#1e293b",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0891b2")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "none",
              background:
                loading || !input.trim()
                  ? "#cbd5e1"
                  : "linear-gradient(135deg,#0f6e8a,#0891b2)",
              color: "#fff",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              width="18"
              height="18"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      ) : (
        <div
          style={{
            padding: "14px 16px",
            background: "#fff",
            borderTop: "1px solid #e8edf3",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <button
            onClick={reset}
            style={{
              padding: "10px 28px",
              borderRadius: 24,
              border: "none",
              background: "linear-gradient(135deg,#0f6e8a,#0891b2)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            🔄 Check Another Symptom
          </button>
        </div>
      )}
    </div>
  );
}
