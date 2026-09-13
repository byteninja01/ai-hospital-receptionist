from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from state import PatientState

from nodes.intake import clinical_intake
from nodes.validate import validate
from nodes.escalate import escalate_emergency
from nodes.respond import generate_response
from nodes.webhook import send_webhook

def route_after_validate(state: PatientState):
    """
    Conditional routing: If is_escalated or ESI 1/2 is active, route to escalate node first.
    """
    if state.get("is_escalated") or state.get("esi_level", 5) in [1, 2]:
        return "escalate"
    return "respond"

def build_graph():
    builder = StateGraph(PatientState)

    # Add Nodes
    builder.add_node("intake", clinical_intake)
    builder.add_node("validate", validate)
    builder.add_node("escalate", escalate_emergency)
    builder.add_node("respond", generate_response)
    builder.add_node("webhook", send_webhook)

    # Entry Point
    builder.set_entry_point("intake")

    # Define Edges
    builder.add_edge("intake", "validate")
    
    # Conditional Branching: Validate -> Escalate OR Respond
    builder.add_conditional_edges(
        "validate",
        route_after_validate,
        {
            "escalate": "escalate",
            "respond": "respond"
        }
    )
    
    builder.add_edge("escalate", "respond")
    builder.add_edge("respond", "webhook")
    builder.add_edge("webhook", END)

    memory = MemorySaver()
    return builder.compile(checkpointer=memory)

graph = build_graph()
