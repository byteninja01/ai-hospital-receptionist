def validate(state):
    """
    Checks if all required patient info is present.
    """
    name = state.get("patient_name")
    age = state.get("patient_age")
    
    if name and age:
        state["is_complete"] = True
    else:
        state["is_complete"] = False

    return state
