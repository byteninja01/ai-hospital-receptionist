import json
from services.fhir_builder import build_fhir_bundle, build_consent_artifact
from services.db import save_patient
from services.scheduler import assign_token

def send_webhook(state):
    """
    Phase 2 + Phase 3 FHIR Dispatcher Node:
      1. Builds a valid HL7 FHIR R4 Bundle (Patient + Encounter + Observation + RiskAssessment + Consent)
      2. Persists patient record to SQLite via db.py
      3. Assigns a priority-queue scheduling token via scheduler.py
      4. Attaches consent_artifact and appointment to state for the API response
    """
    thread_id = state.get("thread_id") or "session-active"

    patient_data = {
        "thread_id":      thread_id,
        "name":           state.get("patient_name"),
        "age":            state.get("patient_age"),
        "query":          state.get("patient_query"),
        "ward":           state.get("ward"),
        "severity":       state.get("severity"),
        "esi_level":      state.get("esi_level", 5),
        "esi_description": state.get("esi_description"),
        "confidence_score": state.get("confidence_score", 1.0),
        "is_escalated":   state.get("is_escalated", False),
        "symptoms":       state.get("symptoms", []),
        "is_emergency":   state.get("is_emergency", False),
        "reasoning":      state.get("reasoning"),
        "recommended_steps": state.get("recommended_steps", []),
        "is_complete":    state.get("is_complete", False),
        "triage_timestamp": state.get("triage_timestamp"),
        "reasoning_trace": state.get("reasoning_trace", {}),
    }

    # ── Step 1: Build FHIR R4 Bundle (with ConsentArtifact embedded) ──────────
    try:
        fhir_bundle = build_fhir_bundle(patient_data)
        state["fhir_bundle"] = fhir_bundle
        print(f"[FHIR DISPATCHER] Generated FHIR R4 Bundle ({fhir_bundle['id']}) with {len(fhir_bundle['entry'])} entries")
    except Exception as e:
        print(f"[FHIR DISPATCHER ERROR] Failed to construct FHIR bundle: {e}")
        fhir_bundle = None

    # ── Step 2: Build Consent Artifact (also embedded in bundle, returned separately) ──
    try:
        consent = build_consent_artifact(patient_data)
        state["consent_artifact"] = consent.get("_abdm", consent)
        patient_data["consent_artifact"] = state["consent_artifact"]
    except Exception as e:
        print(f"[CONSENT ERROR] Failed to build consent artifact: {e}")

    # ── Step 3: Persist to SQLite ─────────────────────────────────────────────
    try:
        save_patient(patient_data)
        print(f"[DB] Patient record saved | thread_id={thread_id}")
    except Exception as e:
        print(f"[DB ERROR] Failed to save patient record: {e}")

    # ── Step 4: Assign Scheduling Token ──────────────────────────────────────
    try:
        appointment = assign_token(patient_data)
        state["appointment"] = appointment
        print(f"[SCHEDULER] Token #{appointment.get('token_number')} | Wait: ~{appointment.get('estimated_wait_minutes')}min")
    except Exception as e:
        print(f"[SCHEDULER ERROR] Failed to assign token: {e}")
        state["appointment"] = None

    return state

