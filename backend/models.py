from pydantic import BaseModel, Field
from typing import Optional

class PatientInfo(BaseModel):
    name: Optional[str] = Field(None, description="The full name of the patient")
    age: Optional[int] = Field(None, description="The age of the patient in years")

class WardClassification(BaseModel):
    ward: str = Field(..., description="The classified ward: Emergency, General, or Mental Health")
    reasoning: str = Field(..., description="Brief reasoning for the classification")
