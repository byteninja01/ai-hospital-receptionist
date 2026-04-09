from services.llm import llm
from models import PatientInfo
from langchain_core.messages import HumanMessage

def extract_info(state):
    # Get the latest patient query from state (though it's also in messages)
    query = state.get("patient_query", "")
    
    # We take the full message history to provide context
    messages = state.get("messages", [])
    
    structured_llm = llm.with_structured_output(PatientInfo)
    
    # We can pass the existing context + the new query
    # Extraction prompt
    system_prompt = "You are a medical receptionist. Extract patient details from the conversation."
    
    # Run the extraction
    extraction_input = messages + [HumanMessage(content=f"Recent input: {query}")]
    result = structured_llm.invoke(extraction_input)
    
    # Update state - we only update if we found new info and didn't have it before
    if result.name and not state.get("patient_name"):
        state["patient_name"] = result.name
    if result.age and not state.get("patient_age"):
        state["patient_age"] = result.age

    return state
