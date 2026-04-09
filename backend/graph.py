from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from state import PatientState

from nodes.intake import clinical_intake
from nodes.validate import validate
from nodes.respond import generate_response
from nodes.webhook import send_webhook

def build_graph():
    builder = StateGraph(PatientState)

    # Add Nodes
    builder.add_node("intake", clinical_intake)
    builder.add_node("validate", validate)
    builder.add_node("respond", generate_response)
    builder.add_node("webhook", send_webhook)

    # Set Entry Point
    builder.set_entry_point("intake")

    # Define Edges
    builder.add_edge("intake", "validate")
    builder.add_edge("validate", "respond")
    builder.add_edge("respond", "webhook")
    builder.add_edge("webhook", END)

    # Add Checkpointer for persistence/memory
    memory = MemorySaver()
    return builder.compile(checkpointer=memory)

graph = build_graph()
