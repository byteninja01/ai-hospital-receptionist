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
    try:
        res = llm.invoke(messages + [prompt])
        
        # Handle list content (common in newer Gemini/LangChain versions)
        full_content = res.content
        if isinstance(full_content, list):
            full_content = "".join([c if isinstance(c, str) else c.get("text", "") for c in full_content])
        
        clean_message = full_content.strip() if full_content else ""
        
    except Exception as e:
        # Check if it's a rate limit error
        error_str = str(e)
        if "RESOURCE_EXHAUSTED" in error_str or "429" in error_str:
            clean_message = "I apologize, but we have reached our daily help limit on the free tier. Please try again tomorrow or contact the hospital directly."
        else:
            print(f"Error in generate_response: {e}")
            clean_message = "I'm having a bit of trouble connecting to my knowledge base. Could you please repeat that?"

    state["message"] = clean_message
    
    # Add the AI message to the conversation history
    return {"messages": [AIMessage(content=clean_message)], "message": clean_message}
