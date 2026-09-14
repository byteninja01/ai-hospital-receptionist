import uuid
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, List

def _generate_abha_stub(thread_id: str) -> str:
    """
    Generate a realistic ABDM-format ABHA stub from thread_id hash.
    Format: XX-XXXX-XXXX-XXXX (14 digits, hyphen-separated)
    This is a placeholder — real ABHA lookup via NDHM Sandbox is Phase 5.
    """
    h = hashlib.sha256(thread_id.encode()).hexdigest()
    digits = "".join(c for c in h if c.isdigit())[:14].ljust(14, "0")
    return f"{digits[0:2]}-{digits[2:6]}-{digits[6:10]}-{digits[10:14]}"


def build_fhir_patient(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates an HL7 FHIR R4 Patient Resource.
    """
    thread_id = patient_data.get("thread_id") or str(uuid.uuid4())
    name = patient_data.get("name") or "Walk-in Patient"
    age = patient_data.get("age")
    
    birth_year = (datetime.now().year - int(age)) if age else None
    birth_date = f"{birth_year}-01-01" if birth_year else None

    patient_resource = {
        "resourceType": "Patient",
        "id": f"patient-{thread_id[:8]}",
        "meta": {
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient"]
        },
        "identifier": [
            {
                "type": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                            "code": "MR",
                            "display": "Medical Record Number"
                        }
                    ]
                },
                "system": "https://medeye.health/patients",
                "value": f"MRN-{thread_id[:8].upper()}"
            },
            {
                "type": {
                    "coding": [
                        {
                            "system": "https://healthid.ndhm.gov.in",
                            "code": "ABHA",
                            "display": "Ayushman Bharat Health Account Number"
                        }
                    ]
                },
                "system": "https://healthid.ndhm.gov.in",
                "value": _generate_abha_stub(thread_id)
            }
        ],
        "name": [
            {
                "use": "official",
                "text": name,
                "given": name.split()
            }
        ],
        "gender": "unknown"
    }

    if birth_date:
        patient_resource["birthDate"] = birth_date

    return patient_resource

def build_fhir_encounter(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates an HL7 FHIR R4 Encounter Resource.
    """
    thread_id = patient_data.get("thread_id") or str(uuid.uuid4())
    ward = patient_data.get("ward") or "General Practice"
    is_emergency = patient_data.get("is_emergency", False)
    is_complete = patient_data.get("is_complete", False)
    
    encounter_class_code = "EMER" if is_emergency else "AMB"
    encounter_class_display = "Emergency" if is_emergency else "Ambulatory"

    encounter_resource = {
        "resourceType": "Encounter",
        "id": f"encounter-{thread_id[:8]}",
        "meta": {
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Encounter"]
        },
        "status": "in-progress" if not is_complete else "finished",
        "class": {
            "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
            "code": encounter_class_code,
            "display": encounter_class_display
        },
        "subject": {
            "reference": f"Patient/patient-{thread_id[:8]}",
            "display": patient_data.get("name") or "Walk-in Patient"
        },
        "serviceProvider": {
            "reference": f"Organization/medeye-{ward.lower().replace(' ', '-')}-dept",
            "display": f"MedEye Hospital - {ward} Department"
        },
        "period": {
            "start": datetime.utcnow().isoformat() + "Z"
        }
    }

    return encounter_resource

def build_fhir_observation(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates an HL7 FHIR R4 Observation Resource for clinical symptoms.
    """
    thread_id = patient_data.get("thread_id") or str(uuid.uuid4())
    symptoms = patient_data.get("symptoms") or ["general malaise"]
    query = patient_data.get("query") or ""

    components = [
        {
            "code": {
                "coding": [
                    {
                        "system": "http://loinc.org",
                        "code": "75325-1",
                        "display": "Symptom"
                    }
                ],
                "text": "Extracted Symptom"
            },
            "valueString": sym
        }
        for sym in symptoms
    ]

    observation_resource = {
        "resourceType": "Observation",
        "id": f"observation-{thread_id[:8]}",
        "meta": {
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Observation"]
        },
        "status": "final",
        "category": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                        "code": "exam",
                        "display": "Exam"
                    }
                ]
            }
        ],
        "code": {
            "coding": [
                {
                    "system": "http://loinc.org",
                    "code": "10164-2",
                    "display": "History of Present Illness"
                }
            ],
            "text": "Chief Complaint & Intake Symptoms"
        },
        "subject": {
            "reference": f"Patient/patient-{thread_id[:8]}"
        },
        "valueString": query,
        "component": components
    }

    return observation_resource

def build_fhir_risk_assessment(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates an HL7 FHIR R4 RiskAssessment Resource for ESI Triage level.
    """
    thread_id = patient_data.get("thread_id") or str(uuid.uuid4())
    esi_level = patient_data.get("esi_level", 5)
    esi_desc = patient_data.get("esi_description", f"Level {esi_level}")
    severity = patient_data.get("severity", "Routine")
    confidence = patient_data.get("confidence_score", 1.0)
    reasoning = patient_data.get("reasoning", "")

    risk_resource = {
        "resourceType": "RiskAssessment",
        "id": f"riskassessment-{thread_id[:8]}",
        "meta": {
            "profile": ["http://hl7.org/fhir/StructureDefinition/RiskAssessment"]
        },
        "status": "final",
        "subject": {
            "reference": f"Patient/patient-{thread_id[:8]}"
        },
        "occurrenceDateTime": datetime.utcnow().isoformat() + "Z",
        "prediction": [
            {
                "outcome": {
                    "coding": [
                        {
                            "system": "https://medeye.health/fhir/CodeSystem/esi-level",
                            "code": str(esi_level),
                            "display": esi_desc
                        }
                    ],
                    "text": f"ESI Level {esi_level} Priority ({severity})"
                },
                "probabilityDecimal": confidence,
                "rationale": reasoning
            }
        ],
        "note": [
            {
                "text": f"Safety-First Triage Evaluation: {esi_desc}. Protocol status: {'Escalated' if patient_data.get('is_escalated') else 'Standard'}."
            }
        ]
    }

    return risk_resource


def build_consent_artifact(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Builds an ABDM Consent Artifact resource.
    Status is always GRANTED at intake (patient implicitly consents to triage).
    Real HIE-CM consent flow is Phase 5.
    """
    thread_id = patient_data.get("thread_id") or str(uuid.uuid4())
    abha_id = _generate_abha_stub(thread_id)
    now = datetime.utcnow()
    expiry = now + timedelta(days=30)

    return {
        "resourceType": "Consent",
        "id": f"consent-{thread_id[:8]}",
        "meta": {
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Consent"]
        },
        "status": "active",
        "scope": {
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/consentscope",
                "code": "patient-privacy",
                "display": "Privacy Consent"
            }]
        },
        "category": [{
            "coding": [{
                "system": "http://loinc.org",
                "code": "59284-0",
                "display": "Patient Consent"
            }]
        }],
        "patient": {
            "reference": f"Patient/patient-{thread_id[:8]}",
            "display": patient_data.get("name") or "Walk-in Patient"
        },
        "dateTime": now.isoformat() + "Z",
        "performer": [{
            "reference": "Organization/medeye-hospital-hip",
            "display": "MedEye Hospital (HIP)"
        }],
        "organization": [{
            "reference": "Organization/medeye-hospital-hip",
            "display": "MedEye Hospital — MEDEYE-HOSPITAL-HIP"
        }],
        "policyRule": {
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                "code": "OPTIN"
            }]
        },
        "provision": {
            "type": "permit",
            "period": {
                "start": now.isoformat() + "Z",
                "end": expiry.isoformat() + "Z"
            },
            "purpose": [{
                "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason",
                "code": "TREAT",
                "display": "Treatment"
            }]
        },
        # Custom ABDM extension fields (non-FHIR, stored for HIP use)
        "_abdm": {
            "artifact_id": f"CA-{thread_id[:8].upper()}",
            "patient_ref": abha_id,
            "hiu_id": "MEDEYE-HOSPITAL-HIP",
            "purpose": "PATIENT_RECEPTION_TRIAGE",
            "status": "GRANTED",
            "granted_at": now.isoformat() + "Z",
            "expiry": expiry.isoformat() + "Z"
        }
    }


def build_fhir_diagnostic_report(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Phase 4 stub: FHIR R4 DiagnosticReport resource.
    Populated with placeholder values until OCR/Vision pipeline is implemented.
    """
    thread_id = patient_data.get("thread_id") or str(uuid.uuid4())
    return {
        "resourceType": "DiagnosticReport",
        "id": f"diagnosticreport-{thread_id[:8]}",
        "meta": {
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DiagnosticReport"]
        },
        "status": "unknown",
        "code": {
            "coding": [{
                "system": "http://loinc.org",
                "code": "11502-2",
                "display": "Laboratory report"
            }],
            "text": "Pending OCR/Vision digitization (Phase 4)"
        },
        "subject": {"reference": f"Patient/patient-{thread_id[:8]}"},
        "issued": datetime.utcnow().isoformat() + "Z",
        "conclusion": "No physical report provided at this intake. Phase 4 OCR pipeline will populate this resource."
    }


def build_fhir_bundle(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Assembles a complete, standards-compliant HL7 FHIR R4 Bundle Resource.
    """
    thread_id = patient_data.get("thread_id") or str(uuid.uuid4())
    
    patient_res = build_fhir_patient(patient_data)
    encounter_res = build_fhir_encounter(patient_data)
    observation_res = build_fhir_observation(patient_data)
    risk_res = build_fhir_risk_assessment(patient_data)
    consent_res = build_consent_artifact(patient_data)

    bundle_resource = {
        "resourceType": "Bundle",
        "id": f"bundle-{thread_id[:8]}",
        "meta": {
            "lastUpdated": datetime.utcnow().isoformat() + "Z",
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"]
        },
        "type": "collection",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "entry": [
            {"fullUrl": f"urn:uuid:{patient_res['id']}", "resource": patient_res},
            {"fullUrl": f"urn:uuid:{encounter_res['id']}", "resource": encounter_res},
            {"fullUrl": f"urn:uuid:{observation_res['id']}", "resource": observation_res},
            {"fullUrl": f"urn:uuid:{risk_res['id']}", "resource": risk_res},
            {"fullUrl": f"urn:uuid:{consent_res['id']}", "resource": consent_res},
        ]
    }

    return bundle_resource
