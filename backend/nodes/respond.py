from services.llm import llm
from langchain_core.messages import AIMessage

def generate_response(state):
    is_complete = state.get("is_complete", False)
    ward = state.get("ward", "General Practice")
    name = state.get("patient_name")
    age = state.get("patient_age")
    severity = state.get("severity", "Routine")
    esi_level = state.get("esi_level", 5)
    esi_desc = state.get("esi_description", f"Level {esi_level}")
    is_emergency = state.get("is_emergency", False)
    is_escalated = state.get("is_escalated", False)
    recommended_steps = state.get("recommended_steps", [])
    messages = state.get("messages", [])
    
    if is_escalated or esi_level in [1, 2]:
        prompt = (
            f"ALERT: Patient flagged for HUMAN ESCALATION ({esi_desc}). Name: {name or 'Walk-in'}, Age: {age or 'N/A'}. "
            f"Triage Ward: {ward}, Severity: {severity}. "
            f"Recommended steps: {recommended_steps}. "
            "Write a high-priority, urgent message confirming that a human triage staff member has been notified immediately. "
            "Provide the recommended immediate steps as bullet points. Include a bold critical safety callout."
        )
    elif is_complete:
        prompt = (
            f"Patient registration complete. Name: {name}, Age: {age}. "
            f"Triage Assessment: {esi_desc}. Ward: {ward}, Severity: {severity}. "
            f"Recommended steps: {recommended_steps}. "
            "Write a friendly final message confirming registration, state their ESI triage level and ward assignment, "
            "and output the recommended next steps as a bulleted list."
        )
    else:
        missing_details = []
        if not name:
            missing_details.append("full name")
        if not age:
            missing_details.append("age")
        missing_str = " and ".join(missing_details)
        
        prompt = (
            f"Patient symptoms noted and tentatively assigned to {ward} ward (Triage: {esi_desc}). "
            f"Missing details: {missing_str}. "
            f"Politely ask for missing {missing_str} to complete intake registration. "
            "Reassure them that their symptoms have been triaged."
        )

    try:
        res = llm.invoke(messages + [prompt])
        
        full_content = res.content
        if isinstance(full_content, list):
            full_content = "".join([c if isinstance(c, str) else c.get("text", "") for c in full_content])
        
        clean_message = full_content.strip() if full_content else ""
        
    except Exception as e:
        print(f"Error in generate_response node: {e}")
        clean_message = f"I have received your information. You are triaged to **{ward}** ({esi_desc}). Please proceed to the receptionist counter."

    state["message"] = clean_message
    return {"messages": [AIMessage(content=clean_message)], "message": clean_message}
