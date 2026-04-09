from services.llm import llm
from models import WardClassification

def classify_ward(state):
    query = state.get("patient_query", "")
    messages = state.get("messages", [])
    
    structured_llm = llm.with_structured_output(WardClassification)
    
    prompt = f"Based on the patient query and history, classify the triage ward. Query: {query}"
    
    # We provide history for context if the query is vague (e.g. "I'm 30" followed by "pain here")
    result = structured_llm.invoke(messages + [prompt])
    
    state["ward"] = result.ward
    
    return state
