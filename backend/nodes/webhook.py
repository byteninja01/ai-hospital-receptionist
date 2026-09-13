import json
from services.fhir_builder import build_fhir_bundle

def send_webhook(state):
    """
    FHIR-Native Data Dispatcher Node: Constructs valid HL7 FHIR R4 Bundle
    and dispatches/caches for HIS/EMR interoperability.
    """
    patient_data = {
        "thread_id": state.get("thread_id", "session-active"),
        "name": state.get("patient_name"),
        "age": state.get("patient_age"),
        "query": state.get("patient_query"),
        "ward": state.get("ward"),
        "severity": state.get("severity"),
        "esi_level": state.get("esi_level", 5),
        "esi_description": state.get("esi_description"),
        "confidence_score": state.get("confidence_score", 1.0),
        "is_escalated": state.get("is_escalated", False),
        "symptoms": state.get("symptoms", []),
        "is_emergency": state.get("is_emergency", False),
        "reasoning": state.get("reasoning"),
        "recommended_steps": state.get("recommended_steps", []),
        "is_complete": state.get("is_complete", False)
    }

    try:
        fhir_bundle = build_fhir_bundle(patient_data)
        state["fhir_bundle"] = fhir_bundle
        print(f"[FHIR DISPATCHER] Generated FHIR R4 Bundle ({fhir_bundle['id']}) with {len(fhir_bundle['entry'])} entries")
    except Exception as e:
        print(f"[FHIR DISPATCHER ERROR] Failed to construct FHIR bundle: {e}")

    return state
