import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function formatName(username, role) {
  const cleaned = username
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return role === "doctor" ? `Dr. ${cleaned.replace(/^Dr /i, "")}` : cleaned;
}

function getInitials(username) {
  const parts = username.replace(/_/g, " ").trim().split(" ");
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function groupByDate(messages) {
  const groups = {};
  messages.forEach((msg) => {
    const date = msg.timestamp
      ? new Date(msg.timestamp).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Today";
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
  });
  return groups;
}

export default function Chat() {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [appointmentInfo, setAppointmentInfo] = useState(null);
  const [focused, setFocused] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const fetchMessages = () => {
    api
      .get(`/chat/${appointmentId}/`)
      .then((r) => setMessages(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    api
      .get(`/appointments/${appointmentId}/`)
      .then((r) => setAppointmentInfo(r.data))
      .catch(() => {});
    fetchMessages();
    const id = setInterval(fetchMessages, 3000);
    return () => clearInterval(id);
  }, [appointmentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setSending(true);
    try {
      await api.post(`/chat/${appointmentId}/`, { message: newMsg });
      setNewMsg("");
      fetchMessages();
      inputRef.current?.focus();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not send message");
    } finally {
      setSending(false);
    }
  };

  const otherName =
    user?.role === "doctor"
      ? appointmentInfo?.patient_name || "Patient"
      : appointmentInfo?.doctor_name || "Doctor";

  const backLink = user?.role === "doctor" ? "/doctor" : "/patient";
  const grouped = groupByDate(messages);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .chat-root {
          display: flex;
          flex-direction: column;
          height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: #f0f4f8;
          position: relative;
          overflow: hidden;
        }

        /* Subtle background texture */
        .chat-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 0%, rgba(14,116,144,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 85% 100%, rgba(6,78,59,0.05) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Header ── */
        .chat-header {
          position: relative;
          z-index: 10;
          background: #0c3547;
          padding: 0 20px;
          height: 68px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.25);
        }

        .back-btn {
          color: rgba(255,255,255,0.5);
          font-size: 18px;
          text-decoration: none;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: background 0.2s, color 0.2s;
          flex-shrink: 0;
        }
        .back-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }

        .header-avatar {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0e7490, #065f46);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Lora', serif;
          font-size: 14px; font-weight: 600; color: #fff;
          flex-shrink: 0;
          box-shadow: 0 0 0 2px rgba(14,116,144,0.4);
        }

        .header-info { flex: 1; min-width: 0; }
        .header-name {
          font-family: 'Lora', serif;
          font-size: 15px; font-weight: 600;
          color: #f0f9ff;
          letter-spacing: 0.01em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .header-sub {
          font-size: 11px; color: rgba(255,255,255,0.38);
          margin-top: 2px; letter-spacing: 0.03em;
        }

        .status-pill {
          display: flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 4px 10px;
          flex-shrink: 0;
        }
        .status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 2px rgba(52,211,153,0.25);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(52,211,153,0.25); }
          50% { box-shadow: 0 0 0 4px rgba(52,211,153,0.12); }
        }
        .status-text { font-size: 10px; color: rgba(255,255,255,0.4); letter-spacing: 0.05em; text-transform: uppercase; }

        /* ── Messages Area ── */
        .messages-area {
          flex: 1; overflow-y: auto;
          padding: 24px 20px 8px;
          display: flex; flex-direction: column; gap: 2px;
          position: relative; z-index: 1;
          scroll-behavior: smooth;
        }

        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 2px; }

        /* Date divider */
        .date-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 16px 0 12px;
        }
        .date-divider::before, .date-divider::after {
          content: ''; flex: 1; height: 1px;
          background: linear-gradient(to right, transparent, rgba(0,0,0,0.08), transparent);
        }
        .date-label {
          font-size: 10.5px; font-weight: 500;
          color: #94a3b8; letter-spacing: 0.06em;
          text-transform: uppercase;
          background: #f0f4f8;
          padding: 0 4px;
        }

        /* Empty state */
        .empty-state {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 12px;
          padding-bottom: 40px;
        }
        .empty-icon {
          width: 72px; height: 72px; border-radius: 20px;
          background: rgba(14,116,144,0.07);
          border: 1.5px dashed rgba(14,116,144,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px;
        }
        .empty-title { font-family: 'Lora', serif; font-size: 15px; color: #64748b; font-style: italic; }
        .empty-sub { font-size: 12px; color: #94a3b8; }

        /* Message row */
        .msg-row {
          display: flex; align-items: flex-end; gap: 8px;
          margin-bottom: 6px;
          animation: fadeUp 0.22s ease forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .msg-row.mine { flex-direction: row-reverse; }

        /* Avatar */
        .msg-avatar {
          width: 30px; height: 30px; border-radius: 9px;
          flex-shrink: 0; display: flex;
          align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff;
          font-family: 'Lora', serif;
        }
        .msg-avatar.doctor-av { background: linear-gradient(135deg, #0c3547, #0e7490); }
        .msg-avatar.patient-av { background: linear-gradient(135deg, #3b1f6b, #6d28d9); }

        /* Bubble group */
        .bubble-group {
          max-width: 58%;
          display: flex; flex-direction: column; gap: 2px;
        }
        .bubble-group.mine { align-items: flex-end; }
        .bubble-group.theirs { align-items: flex-start; }

        .sender-label {
          font-size: 10.5px; font-weight: 600;
          letter-spacing: 0.02em; margin-bottom: 3px;
          padding: 0 4px;
        }
        .sender-label.doctor-lbl { color: #0e7490; }
        .sender-label.patient-lbl { color: #6d28d9; }

        /* Bubble */
        .bubble {
          padding: 10px 14px;
          font-size: 13.5px; line-height: 1.6;
          word-break: break-word;
          position: relative;
        }
        .bubble.mine {
          background: #0c3547;
          color: #e0f2fe;
          border-radius: 16px 4px 16px 16px;
          box-shadow: 0 2px 12px rgba(12,53,71,0.22);
        }
        .bubble.theirs {
          background: #ffffff;
          color: #1e293b;
          border-radius: 4px 16px 16px 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 6px rgba(0,0,0,0.06);
        }

        .bubble-time {
          font-size: 10px; margin-top: 4px;
          padding: 0 4px; color: #94a3b8;
          letter-spacing: 0.03em;
        }

        /* ── Input Bar ── */
        .input-bar {
          position: relative; z-index: 10;
          background: #ffffff;
          border-top: 1px solid #e8edf3;
          padding: 12px 16px;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.06);
        }

        .input-wrap {
          flex: 1;
          position: relative;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }
        .input-wrap.focused {
          border-color: #0e7490;
          box-shadow: 0 0 0 3px rgba(14,116,144,0.08);
        }

        .msg-input {
          width: 100%;
          padding: 11px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; color: #1e293b;
          background: transparent;
          border: none; outline: none;
          resize: none;
        }
        .msg-input::placeholder { color: #94a3b8; }

        .send-btn {
          width: 42px; height: 42px; border-radius: 12px;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: transform 0.12s, background 0.2s, box-shadow 0.2s;
        }
        .send-btn.active {
          background: #0c3547;
          box-shadow: 0 4px 14px rgba(12,53,71,0.3);
        }
        .send-btn.inactive {
          background: #e2e8f0;
          cursor: not-allowed;
        }
        .send-btn.active:hover { background: #0e7490; }
        .send-btn.active:active { transform: scale(0.9); }

        /* Consultation badge */
        .consult-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10px; color: #94a3b8;
          margin: 0 auto 8px;
          background: rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 20px;
          padding: 4px 10px;
          letter-spacing: 0.04em;
          align-self: center;
        }
      `}</style>

      <div className="chat-root">
        {/* Header */}
        <div className="chat-header">
          <Link to={backLink} className="back-btn">
            ←
          </Link>
          <div
            className={`header-avatar ${user?.role === "doctor" ? "patient-av" : "doctor-av"}`}
          >
            {otherName.charAt(0).toUpperCase()}
          </div>
          <div className="header-info">
            <p className="header-name">{otherName}</p>
            <p className="header-sub">
              {user?.role === "doctor" ? "Patient" : "Consultation"} · #
              {appointmentId}
            </p>
          </div>
          <div className="status-pill">
            <div className="status-dot" />
            <span className="status-text">Live</span>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🩺</div>
              <p className="empty-title">No messages yet</p>
              <p className="empty-sub">Begin your consultation below</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, msgs]) => (
              <div key={date}>
                <div className="date-divider">
                  <span className="date-label">{date}</span>
                </div>
                {msgs.map((msg) => {
                  const isMine = msg.sender === user?.username;
                  const isDoctor = msg.sender_role === "doctor";
                  const displayName = formatName(msg.sender, msg.sender_role);
                  const initials = getInitials(msg.sender);

                  return (
                    <div
                      key={msg.id}
                      className={`msg-row ${isMine ? "mine" : ""}`}
                    >
                      <div
                        className={`msg-avatar ${isDoctor ? "doctor-av" : "patient-av"}`}
                      >
                        {initials}
                      </div>
                      <div
                        className={`bubble-group ${isMine ? "mine" : "theirs"}`}
                      >
                        <span
                          className={`sender-label ${isDoctor ? "doctor-lbl" : "patient-lbl"}`}
                        >
                          {displayName}
                        </span>
                        <div className={`bubble ${isMine ? "mine" : "theirs"}`}>
                          {msg.message}
                        </div>
                        <span className="bubble-time">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="input-bar">
          <div className={`input-wrap ${focused ? "focused" : ""}`}>
            <input
              ref={inputRef}
              className="msg-input"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) send(e);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Type your message..."
              autoComplete="off"
            />
          </div>
          <button
            className={`send-btn ${sending || !newMsg.trim() ? "inactive" : "active"}`}
            onClick={send}
            disabled={sending || !newMsg.trim()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={sending || !newMsg.trim() ? "#94a3b8" : "white"}
              width="17"
              height="17"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
