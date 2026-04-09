def sanitize_input(text):
    """
    Basic sanitization to prevent common prompt injection patterns.
    """
    if not text:
        return ""
        
    blacklist = ["ignore previous", "system prompt", "you are a", "forget all instructions"]
    for word in blacklist:
        if word in text.lower():
            # Instead of just returning "Invalid input", we could return a sanitized version 
            # or raise an error that can be handled. For now, we'll return a warning string.
            return "GUARDRAIL_TRIGGERED: Sanitized Input"
            
    return text.strip()
