from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from graph import graph
from langchain_core.messages import HumanMessage
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import uuid

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="MedEye AI Receptionist API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory patient queue store
patient_queue = []

DEPARTMENTS = [
    {
        "id": "emergency",
        "name": "Emergency",
        "description": "24/7 Acute care for life-threatening conditions and severe trauma.",
        "location": "Wing A, Ground Floor",
        "doctors": [
            {"name": "Dr. Sarah Jenkins", "specialty": "Trauma Medicine", "on_duty": True},
            {"name": "Dr. Marcus Vance", "specialty": "Emergency Physician", "on_duty": False}
        ]
    },
    {
        "id": "icu",
        "name": "ICU (Intensive Care)",
        "description": "Continuous monitoring and treatment for critically ill patients.",
        "location": "Wing B, 1st Floor",
        "doctors": [
            {"name": "Dr. Elena Rostova", "specialty": "Critical Care", "on_duty": True}
        ]
    },
    {
        "id": "cardiology",
        "name": "Cardiology",
        "description": "Diagnosis and treatment of heart and blood vessel disorders.",
        "location": "Wing C, 2nd Floor",
        "doctors": [
            {"name": "Dr. Alan Mercer", "specialty": "Cardiologist", "on_duty": True},
            {"name": "Dr. Priya Patel", "specialty": "Interventional Cardiology", "on_duty": True}
        ]
    },
    {
        "id": "neurology",
        "name": "Neurology",
        "description": "Specialized care for disorders of the brain, spinal cord, and nerves.",
        "location": "Wing C, 3rd Floor",
        "doctors": [
            {"name": "Dr. Raymond Holt", "specialty": "Neurologist", "on_duty": False},
            {"name": "Dr. Lisa Cuddy", "specialty": "Neuro-Oncologist", "on_duty": True}
        ]
    },
    {
        "id": "pediatrics",
        "name": "Pediatrics",
        "description": "Comprehensive healthcare for infants, children, and adolescents.",
        "location": "Wing D, 1st Floor",
        "doctors": [
            {"name": "Dr. Allison Cameron", "specialty": "Pediatrician", "on_duty": True},
            {"name": "Dr. Robert Chase", "specialty": "Pediatric Surgery", "on_duty": False}
        ]
    },
    {
        "id": "orthopedics",
        "name": "Orthopedics",
        "description": "Treatment of skeletal, joint, ligament, and muscle injuries.",
        "location": "Wing A, 2nd Floor",
        "doctors": [
            {"name": "Dr. Gregory House", "specialty": "Orthopedic Diagnostics", "on_duty": True},
            {"name": "Dr. Eric Foreman", "specialty": "Orthopedic Surgery", "on_duty": False}
        ]
    },
    {
        "id": "mental_health",
        "name": "Mental Health",
        "description": "Psychiatric support, crisis management, and psychological counseling.",
        "location": "Wing E, Ground Floor",
        "doctors": [
            {"name": "Dr. Charles Kroger", "specialty": "Psychiatrist", "on_duty": True},
            {"name": "Dr. Linda Martin", "specialty": "Clinical Psychologist", "on_duty": True}
        ]
    },
    {
        "id": "general_practice",
        "name": "General Practice",
        "description": "Primary healthcare, preventive medicine, and routine wellness exams.",
        "location": "Clinic Block, 1st Floor",
        "doctors": [
            {"name": "Dr. John Watson", "specialty": "Family Physician", "on_duty": True},
            {"name": "Dr. James Wilson", "specialty": "General Medicine", "on_duty": True}
        ]
    }
]

@app.post("/chat")
@limiter.limit("20/minute")
async def chat(request: Request):
    data = await request.json()
    
    query = data.get("patient_query", "")
    thread_id = data.get("thread_id") or str(uuid.uuid4())
    
    # LangGraph Config for checkpointer
    config = {"configurable": {"thread_id": thread_id}}
    
    # We send the new message to the graph. 
    # Because of the Annotated[..., operator.add] in state, this will append to history.
    initial_input = {
        "messages": [HumanMessage(content=query)],
        "patient_query": query # Keep for backward compatibility/logic
    }
    
    # Invoke the graph with the thread_id config
    result = graph.invoke(initial_input, config=config)
    
    is_complete = result.get("is_complete", False)
    
    # Save or update patient status in queue
    patient_record = {
        "thread_id": thread_id,
        "name": result.get("patient_name"),
        "age": result.get("patient_age"),
        "query": result.get("patient_query"),
        "ward": result.get("ward"),
        "severity": result.get("severity", "Routine"),
        "esi_level": result.get("esi_level", 5),
        "esi_description": result.get("esi_description", "Level 5: Non-Urgent"),
        "confidence_score": result.get("confidence_score", 1.0),
        "is_escalated": result.get("is_escalated", False),
        "symptoms": result.get("symptoms", []),
        "is_emergency": result.get("is_emergency", False),
        "reasoning": result.get("reasoning", ""),
        "recommended_steps": result.get("recommended_steps", []),
        "triage_timestamp": result.get("triage_timestamp"),
        "reasoning_trace": result.get("reasoning_trace", {}),
        "is_complete": is_complete
    }
    
    # Find existing record
    existing_idx = -1
    for idx, p in enumerate(patient_queue):
        if p["thread_id"] == thread_id:
            existing_idx = idx
            break
            
    if existing_idx != -1:
        patient_queue[existing_idx] = patient_record
    else:
        patient_queue.append(patient_record)
        
    return {
        "thread_id": thread_id,
        "message": result.get("message", "I have received your information."),
        "patient": patient_record
    }

@app.get("/patients")
def get_patients():
    return patient_queue

@app.get("/fhir/bundle/{thread_id}")
def get_fhir_bundle(thread_id: str):
    from services.fhir_builder import build_fhir_bundle
    patient_record = None
    for p in patient_queue:
        if p["thread_id"] == thread_id:
            patient_record = p
            break
            
    if not patient_record:
        patient_record = {"thread_id": thread_id, "name": "Walk-in Patient", "ward": "General Practice"}
        
    return build_fhir_bundle(patient_record)

@app.get("/fhir/export")
def export_all_fhir_bundles():
    from services.fhir_builder import build_fhir_bundle
    from datetime import datetime
    
    entries = []
    for p in patient_queue:
        bundle = build_fhir_bundle(p)
        entries.append({
            "fullUrl": f"urn:uuid:{bundle['id']}",
            "resource": bundle
        })
        
    return {
        "resourceType": "Bundle",
        "id": f"export-bundle-{uuid.uuid4().hex[:8]}",
        "type": "transaction",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "total": len(patient_queue),
        "entry": entries
    }

@app.post("/patients/clear")
def clear_patients():
    global patient_queue
    patient_queue.clear()
    return {"status": "success", "message": "Patient queue cleared"}

@app.get("/departments")
def get_departments():
    return DEPARTMENTS

@app.post("/reset")
async def reset_session(request: Request):
    data = await request.json()
    thread_id = data.get("thread_id")
    if thread_id:
        try:
            # Safely clear checkpointer storage
            if hasattr(graph, "checkpointer") and hasattr(graph.checkpointer, "storage"):
                for k in list(graph.checkpointer.storage.keys()):
                    if thread_id in str(k):
                        del graph.checkpointer.storage[k]
                        
            # Remove patient from queue if not completed, or keep it. Let's remove from queue on reset
            global patient_queue
            patient_queue = [p for p in patient_queue if p["thread_id"] != thread_id]
            
            return {"status": "success", "message": f"Session {thread_id} reset successfully"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    return {"status": "error", "message": "thread_id is required"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
