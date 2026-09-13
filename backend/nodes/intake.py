from services.llm import llm
from models import ClinicalIntake
from langchain_core.messages import HumanMessage
from datetime import datetime

def clinical_intake(state):
    """
    Consolidated node to extract patient info, run ESI 5-Level triage, and audit logging.
    """
    query = state.get("patient_query", "")
    messages = state.get("messages", [])
    
    structured_llm = llm.with_structured_output(ClinicalIntake)
    
    prompt = (
        "You are an AI Hospital Receptionist triage specialist. "
        "Analyze the conversation and extract/classify patient details: "
        "- Extract 'name' (patient's name) and 'age' (patient's age). "
        "- Classify 'ward' into one of: Emergency, ICU, Cardiology, Neurology, Pediatrics, Orthopedics, Mental Health, or General Practice. "
        "- Assess 'severity' as Critical, Urgent, or Routine. "
        "- Determine 'esi_level' (1: Resuscitation, 2: Emergent, 3: Urgent, 4: Less Urgent, 5: Non-Urgent). "
        "- Identify key 'symptoms' (list of strings). "
        "- Set 'is_emergency' and 'is_escalated' to true if immediate attention or staff escalation is required. "
        "- Generate actionable 'recommended_steps' (list of strings). "
        "- Provide clinical 'reasoning' for the classification. "
        f"Recent input: {query}"
    )
    
    try:
        result = structured_llm.invoke(messages + [HumanMessage(content=prompt)])
        
        if getattr(result, "name", None) and not state.get("patient_name"):
            state["patient_name"] = result.name
        if getattr(result, "age", None) is not None and not state.get("patient_age"):
            state["patient_age"] = result.age
            
        state["ward"] = getattr(result, "ward", "General Practice")
        state["reasoning"] = getattr(result, "reasoning", "")
        state["severity"] = getattr(result, "severity", "Routine")
        state["esi_level"] = getattr(result, "esi_level", 5)
        state["esi_description"] = getattr(result, "esi_description", f"Level {state['esi_level']}")
        state["confidence_score"] = getattr(result, "confidence_score", 0.95)
        state["is_escalated"] = getattr(result, "is_escalated", state["esi_level"] in [1, 2])
        state["symptoms"] = getattr(result, "symptoms", [])
        state["is_emergency"] = getattr(result, "is_emergency", False)
        state["recommended_steps"] = getattr(result, "recommended_steps", [])
        state["reasoning_trace"] = getattr(result, "reasoning_trace", {})
        
        if not state.get("triage_timestamp"):
            state["triage_timestamp"] = datetime.now().strftime("%I:%M %p")
        
    except Exception as e:
        print(f"Error in clinical_intake node: {e}")
        
    return state
