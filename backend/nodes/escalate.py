from datetime import datetime

def escalate_emergency(state):
    """
    Human Escalation Node: Triggered when ESI Level 1 (Resuscitation) or Level 2 (Emergent)
    or safety rules detect life-threatening red flags.
    """
    esi_level = state.get("esi_level", 2)
    esi_desc = state.get("esi_description", "Level 2: Emergent")
    ward = state.get("ward", "Emergency")
    
    print(f"[HUMAN ESCALATION] Thread {state.get('patient_name', 'Patient')} flagged for immediate staff handoff | ESI Level {esi_level}")
    
    state["is_escalated"] = True
    
    # Prepend urgent escalation note to clinical steps
    escalation_note = f"🚨 MANDATORY STAFF ESCALATION: Patient assigned ESI {esi_level} priority ({ward} Ward). Proceed directly to triage desk 1."
    
    steps = state.get("recommended_steps") or []
    if escalation_note not in steps:
        state["recommended_steps"] = [escalation_note] + steps
        
    return state
