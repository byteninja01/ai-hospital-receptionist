from services.llm import llm
from models import WardClassification

def classify_ward(state):
    query = state.get("patient_query", "")
    messages = state.get("messages", [])
    
    structured_llm = llm.with_structured_output(WardClassification)
    
    prompt = f"Based on the patient query and history, classify the triage ward. Query: {query}"
    
    try:
        result = structured_llm.invoke(messages + [prompt])
        state["ward"] = result.ward
        state["reasoning"] = result.reasoning
        state["severity"] = result.severity
        state["symptoms"] = result.symptoms
        state["is_emergency"] = result.is_emergency
        state["recommended_steps"] = result.recommended_steps
    except Exception as e:
        print(f"Error in classify_ward: {e}")
        
    return state
