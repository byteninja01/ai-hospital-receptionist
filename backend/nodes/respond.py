from services.llm import llm
from langchain_core.messages import AIMessage

def generate_response(state):
    is_complete = state.get("is_complete", False)
    ward = state.get("ward", "General")
    name = state.get("patient_name")
    messages = state.get("messages", [])
    
    if is_complete:
        prompt = f"Patient {name} is complete in {ward} ward. Confirm and provide next steps."
    else:
        prompt = f"Query received: {state.get('patient_query')}. Ward: {ward}. Ask for missing name or age politely."

    # Invoke LLM with history to ensure conversational flow
    res = llm.invoke(messages + [prompt])
    
    # Store the text message for the frontend
    state["message"] = res.content.strip()
    
    # Add the AI message to the conversation history
    # LangGraph will merge this into the 'messages' list because of Annotated[..., operator.add]
    return {"messages": [AIMessage(content=res.content.strip())], "message": res.content.strip()}
