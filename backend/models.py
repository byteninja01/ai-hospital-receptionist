from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class PatientInfo(BaseModel):
    name: Optional[str] = Field(None, description="The full name of the patient")
    age: Optional[int] = Field(None, description="The age of the patient in years")

class WardClassification(BaseModel):
    ward: str = Field(..., description="The classified ward: Emergency, ICU, Cardiology, Neurology, Pediatrics, Orthopedics, Mental Health, or General Practice")
    reasoning: str = Field(..., description="Brief reasoning for the classification")
    severity: str = Field(..., description="Triage severity: Critical, Urgent, or Routine")
    esi_level: int = Field(default=5, description="Emergency Severity Index level 1 (Resuscitation) to 5 (Non-Urgent)")
    esi_description: Optional[str] = Field(None, description="Official ESI Level description")
    confidence_score: float = Field(default=1.0, description="Confidence score between 0.0 and 1.0")
    is_escalated: bool = Field(default=False, description="Whether patient requires human staff escalation")
    symptoms: List[str] = Field(default_factory=list, description="List of key symptoms extracted")
    is_emergency: bool = Field(..., description="Whether the condition requires immediate emergency attention")
    recommended_steps: List[str] = Field(default_factory=list, description="Recommended immediate next steps")
    reasoning_trace: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Audit explainability trace object")

class ClinicalIntake(BaseModel):
    name: Optional[str] = Field(None, description="The full name of the patient")
    age: Optional[int] = Field(None, description="The age of the patient in years")
    ward: str = Field(..., description="The classified ward: Emergency, ICU, Cardiology, Neurology, Pediatrics, Orthopedics, Mental Health, or General Practice")
    reasoning: str = Field(..., description="Brief reasoning for the classification")
    severity: str = Field(..., description="Triage severity: Critical, Urgent, or Routine")
    esi_level: int = Field(default=5, description="Emergency Severity Index level 1 (Resuscitation) to 5 (Non-Urgent)")
    esi_description: Optional[str] = Field(None, description="Official ESI Level description")
    confidence_score: float = Field(default=1.0, description="Confidence score between 0.0 and 1.0")
    is_escalated: bool = Field(default=False, description="Whether patient requires human staff escalation")
    symptoms: List[str] = Field(default_factory=list, description="List of key symptoms extracted")
    is_emergency: bool = Field(..., description="Whether the condition requires immediate emergency attention")
    recommended_steps: List[str] = Field(default_factory=list, description="Recommended immediate next steps")
    reasoning_trace: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Audit explainability trace object")
