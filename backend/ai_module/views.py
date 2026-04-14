"""
DocNDoSe — AI Symptom Checker Chatbot (Groq powered)
──────────────────────────────────────────────────────
Uses Groq (free, fast — ~1 sec response) with LLaMA 3.
Falls back to ML model if Groq is unavailable.
"""

import json
import re
import joblib
from pathlib import Path
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

try:
    from groq import Groq
    groq_client = Groq(api_key=settings.GROQ_API_KEY)
    GROQ_READY  = True
except Exception:
    GROQ_READY  = False
    groq_client = None

# ── ML fallback ───────────────────────────────────────────────────────────────
ML_BASE = Path(__file__).resolve().parent / "ml_model"
try:
    ML_MODEL          = joblib.load(ML_BASE / "symptom_model.pkl")
    DISEASE_MAP       = joblib.load(ML_BASE / "disease_map.pkl")
    SEVERITY_OVERRIDE = joblib.load(ML_BASE / "severity_override.pkl")
    ML_READY          = True
except Exception:
    ML_READY          = False
    DISEASE_MAP       = {}
    SEVERITY_OVERRIDE = {}

# ── Doctor specialization → display label ────────────────────────────────────
SPEC_LABELS = {
    "general":        "General Physician",
    "cardiologist":   "Cardiologist",
    "neurologist":    "Neurologist",
    "dermatologist":  "Dermatologist",
    "orthopedic":     "Orthopedic Surgeon",
    "pediatrician":   "Pediatrician",
    "psychiatrist":   "Psychiatrist",
    "gynecologist":   "Gynecologist",
    "ent":            "ENT Specialist",
    "ophthalmologist":"Ophthalmologist",
    "dentist":        "Dentist",
    "urologist":      "Urologist",
}


# ─────────────────────────────────────────────────────────────────────────────
# Groq system prompt — instructs AI to behave like a medical chatbot
# ─────────────────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are MediBot, a smart and empathetic medical assistant inside DocNDoSe healthcare app.

Your job is to have a SHORT, FOCUSED conversation with a patient to understand their symptoms and suggest the right doctor.

CONVERSATION RULES:
1. Ask ONE question at a time — never multiple questions together.
2. When a symptom is vague (like "headache"), always ask severity using exactly 3 options:
   - Mild (manageable, not interfering with daily life)
   - Moderate (noticeable, affecting daily activities)
   - Severe (unbearable, needs immediate attention)
3. Ask about duration — "How long have you had this symptom?"
4. Ask 1-2 relevant follow-up questions based on the symptom.
5. After gathering enough info (3-5 exchanges), give a FINAL ASSESSMENT.

FINAL ASSESSMENT FORMAT (use this exact JSON when you have enough info):
{
  "type": "final_assessment",
  "primary_disease": "<most likely condition>",
  "confidence": <50-95>,
  "severity": "<mild|moderate|severe>",
  "specialization": "<one of: general, cardiologist, neurologist, dermatologist, orthopedic, pediatrician, psychiatrist, gynecologist, ent, ophthalmologist, dentist, urologist>",
  "possible_diseases": ["<disease1>", "<disease2>"],
  "suggested_medicines": ["<OTC medicine with dosage>"],
  "advice_en": "<2-3 sentence practical advice in English>",
  "advice_hi": "<same advice in Hindi>",
  "is_emergency": <true|false>,
  "emergency_message": "<if emergency, what to do immediately>"
}

CONVERSATION FORMAT (when still asking questions):
{
  "type": "question",
  "message": "<your question or response to patient>",
  "options": ["<option1>", "<option2>", "<option3>"] // only when giving choices, else empty array
}

IMPORTANT:
- For chest pain, sudden severe headache, difficulty breathing — immediately assess as emergency.
- For mild symptoms — reassure patient and ask follow-up.
- Medicines: suggest only basic OTC drugs. Add "(prescription required)" for Rx drugs.
- Be warm, empathetic and conversational — not robotic.
- English is default language for advice.
- Always respond with ONLY the JSON — no extra text outside JSON.
"""


def call_groq(conversation_history: list) -> dict | None:
    """Send conversation to Groq and get structured response."""
    if not GROQ_READY:
        return None
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",   # fast and free on Groq
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                *conversation_history
            ],
            temperature=0.3,
            max_tokens=600,
        )
        raw = response.choices[0].message.content.strip()

        # Extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', raw)
        if not json_match:
            return None
        return json.loads(json_match.group())

    except Exception as e:
        print(f"[Groq Error] {e}")
        return None


def call_ml_fallback(symptoms: str) -> dict | None:
    """ML model fallback."""
    if not ML_READY:
        return None
    try:
        proba   = ML_MODEL.predict_proba([symptoms])[0]
        classes = ML_MODEL.classes_
        top_idx = proba.argsort()[::-1][:3]
        top_disease = classes[top_idx[0]]
        top_conf    = float(proba[top_idx[0]])

        if top_conf < 0.20:
            return None

        severity = "mild"
        for w in ["severe", "worst", "unbearable"]:
            if w in symptoms.lower():
                severity = "severe"; break
        for w in ["moderate", "persistent", "worsening"]:
            if w in symptoms.lower():
                severity = "moderate"; break

        d_info = DISEASE_MAP.get(top_disease, {})
        spec   = SEVERITY_OVERRIDE.get((top_disease, severity), d_info.get("specialization", "general"))

        return {
            "type":               "final_assessment",
            "primary_disease":    top_disease,
            "confidence":         round(top_conf * 100),
            "severity":           severity,
            "specialization":     spec,
            "possible_diseases":  [classes[i] for i in top_idx],
            "suggested_medicines":d_info.get("medicines", ["Consult a doctor"]),
            "advice_en":          d_info.get("advice_en", "Please consult a doctor."),
            "advice_hi":          d_info.get("advice_hi", "Doctor se milein."),
            "is_emergency":       severity == "severe",
            "emergency_message":  "Please seek emergency care." if severity == "severe" else "",
        }
    except Exception:
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Chat API — takes full conversation history, returns next message or assessment
# ─────────────────────────────────────────────────────────────────────────────

class SymptomChatView(APIView):
    """
    POST /api/ai/symptom-chat/
    Body: {
      "messages": [
        {"role": "user", "content": "I have a headache"},
        {"role": "assistant", "content": "..."},
        {"role": "user", "content": "It is moderate"}
      ]
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        messages = request.data.get("messages", [])

        if not messages:
            return Response({"error": "messages array is required."}, status=400)

        last_user_msg = next(
            (m["content"] for m in reversed(messages) if m["role"] == "user"), ""
        )
        if not last_user_msg.strip():
            return Response({"error": "Last message cannot be empty."}, status=400)

        # ── Try Groq first ────────────────────────────────────────────────────
        result = call_groq(messages)

        # ── ML fallback if Groq fails and we have enough text ─────────────────
        if not result:
            all_user_text = " ".join(
                m["content"] for m in messages if m["role"] == "user"
            )
            ml_result = call_ml_fallback(all_user_text)
            if ml_result:
                result = ml_result
            else:
                # Last resort — ask for more info
                result = {
                    "type":    "question",
                    "message": "I'm having trouble connecting to the AI. Could you describe your symptoms in more detail so I can help you better?",
                    "options": [],
                }

        # ── Normalize response ────────────────────────────────────────────────
        if result.get("type") == "final_assessment":
            spec_key   = result.get("specialization", "general")
            spec_label = SPEC_LABELS.get(spec_key, spec_key.title())
            return Response({
                "type":               "final_assessment",
                "primary_disease":    result.get("primary_disease", "Unknown"),
                "confidence":         result.get("confidence"),
                "severity":           result.get("severity", "mild"),
                "specialization":     spec_key,
                "specialization_label": spec_label,
                "possible_diseases":  result.get("possible_diseases", []),
                "suggested_medicines":result.get("suggested_medicines", []),
                "advice_en":          result.get("advice_en", ""),
                "advice_hi":          result.get("advice_hi", ""),
                "is_emergency":       result.get("is_emergency", False),
                "emergency_message":  result.get("emergency_message", ""),
                "disclaimer": (
                    "This is an AI-based preliminary assessment only. "
                    "It is NOT a substitute for professional medical advice. "
                    "Always consult a qualified doctor."
                ),
            })

        # Question / follow-up
        return Response({
            "type":    "question",
            "message": result.get("message", "Could you tell me more about your symptoms?"),
            "options": result.get("options", []),
        })


# Keep old endpoint working for backward compatibility
class SymptomCheckerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        symptoms = request.data.get("symptoms", "").strip()
        if not symptoms:
            return Response({"error": "Please describe your symptoms."}, status=400)

        messages = [{"role": "user", "content": symptoms}]
        result   = call_groq(messages)

        if not result or result.get("type") == "question":
            result = call_ml_fallback(symptoms)

        if not result:
            return Response({
                "source": "no_match",
                "primary_disease": None,
                "specialization": "general",
                "advice_en": "We could not identify a specific condition. Please visit a General Physician.",
                "advice_hi": "Koi specific bimari identify nahi ho payi. Kripya General Physician se milein.",
            })

        spec_key = result.get("specialization", "general")
        return Response({
            "source":              "groq_ai" if GROQ_READY else "ml_model",
            "primary_disease":     result.get("primary_disease"),
            "confidence":          result.get("confidence"),
            "severity":            result.get("severity", "mild"),
            "specialization":      spec_key,
            "specialization_label":SPEC_LABELS.get(spec_key, spec_key),
            "possible_diseases":   result.get("possible_diseases", []),
            "suggested_medicines": result.get("suggested_medicines", []),
            "advice_en":           result.get("advice_en", ""),
            "advice_hi":           result.get("advice_hi", ""),
            "is_emergency":        result.get("is_emergency", False),
            "disclaimer":          "This is an AI-based preliminary assessment only.",
        })
