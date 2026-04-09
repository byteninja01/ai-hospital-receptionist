from services.llm import llm
from models import ClinicalIntake
from langchain_core.messages import HumanMessage

def clinical_intake(state):
    """
    Consolidated node to extract patient info and classify ward in a single LLM call.
    This optimization saves 1 API request per interaction.
    """
    query = state.get("patient_query", "")
    messages = state.get("messages", [])
    
    # Configure the LLM for structured output with the consolidated model
    structured_llm = llm.with_structured_output(ClinicalIntake)
    
    # Build the optimization prompt
    prompt = f"You are a medical receptionist. Extract patient details (name, age) and classify the appropriate ward based on symptoms. Recent input: {query}"
    
    # Run the consolidated inference
    # We pass the full history for context
    try:
        result = structured_llm.invoke(messages + [HumanMessage(content=prompt)])
        
        # Update patient info in state if not already present
        if result.name and not state.get("patient_name"):
            state["patient_name"] = result.name
        if result.age and not state.get("patient_age"):
            state["patient_age"] = result.age
            
        # Update ward classification
        state["ward"] = result.ward
        state["reasoning"] = result.reasoning
        
    except Exception as e:
        # If we hit an error here (like 429), we'll let the 'respond' node handle the messaging
        # but we mark a flag if necessary. For now, we just log and pass through.
        print(f"Error in clinical_intake: {e}")
        # We don't want the whole graph to crash, so we just return state
        
    return state
