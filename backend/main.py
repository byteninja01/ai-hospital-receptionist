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

@app.post("/chat")
@limiter.limit("10/minute")
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
    
    return {
        "thread_id": thread_id,
        "message": result.get("message", "I have received your information."),
        "patient": {
            "name": result.get("patient_name"),
            "age": result.get("patient_age"),
            "query": result.get("patient_query"),
            "ward": result.get("ward")
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
