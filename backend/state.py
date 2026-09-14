from typing import TypedDict, Optional, Annotated, List, Dict, Any
from langchain_core.messages import BaseMessage
import operator

class PatientState(TypedDict):
    # 'messages' will hold history, operator.add appends
    messages: Annotated[List[BaseMessage], operator.add]

    # Session identity — passed in from main.py so all nodes share it
    thread_id: Optional[str]

    patient_name: Optional[str]
    patient_age: Optional[int]
    patient_query: str
    ward: Optional[str]
    is_complete: bool
    message: Optional[str]

    # Phase 1 Safety-First Triage Core Fields
    severity: Optional[str]
    esi_level: Optional[int]
    esi_description: Optional[str]
    confidence_score: Optional[float]
    is_escalated: Optional[bool]
    symptoms: Optional[List[str]]
    is_emergency: Optional[bool]
    reasoning: Optional[str]
    recommended_steps: Optional[List[str]]
    triage_timestamp: Optional[str]
    reasoning_trace: Optional[Dict[str, Any]]

    # Phase 2 — FHIR data layer
    fhir_bundle: Optional[Dict[str, Any]]
    consent_artifact: Optional[Dict[str, Any]]

    # Phase 3 — Scheduling
    appointment: Optional[Dict[str, Any]]
