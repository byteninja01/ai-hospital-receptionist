from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

class ConsentArtifact(BaseModel):
    artifact_id: str = Field(..., description="Unique ABDM/HIE-CM consent artifact ID")
    patient_ref: str = Field(..., description="ABHA ID or local patient reference")
    purpose: str = Field(default="PATIENT_RECEPTION_TRIAGE", description="Purpose of data processing/sharing")
    hiu_id: str = Field(default="MEDEYE-HOSPITAL-HIP", description="Health Information User / Provider ID")
    status: str = Field(default="GRANTED", description="Consent status: GRANTED, REVOKED, EXPIRED")
    granted_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    expiry: str = Field(default_factory=lambda: (datetime.utcnow() + timedelta(days=30)).isoformat() + "Z")
