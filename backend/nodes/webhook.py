import requests
import json

def send_webhook(state):
    """
    Sends data to an external webhook if the information is complete.
    """
    if not state.get("is_complete"):
        return state

    payload = {
        "patient_name": state.get("patient_name"),
        "patient_age": state.get("patient_age"),
        "patient_query": state.get("patient_query"),
        "ward": state.get("ward")
    }

    # Use a real URL or environment variable if available
    webhook_url = "https://relay.app/webhook" 
    
    try:
        # In a real scenario, you might want to use async requests or a task queue
        # For simplicity, we'll do a basic post
        # requests.post(webhook_url, json=payload, timeout=5)
        print(f"DEBUG: Webhook would send: {json.dumps(payload)}")
    except Exception as e:
        print(f"Webhook error: {e}")
        pass

    return state
