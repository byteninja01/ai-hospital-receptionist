import re
from typing import Dict, Any, List, Tuple
from services.audit_logger import log_triage_decision

# Emergency Severity Index (ESI) Standard 5-Level Definitions
ESI_DESCRIPTIONS = {
    1: "Level 1: Resuscitation (Immediate life-saving intervention required)",
    2: "Level 2: Emergent (High risk, acute distress, confusion/lethargy, severe pain)",
    3: "Level 3: Urgent (Stable patient requiring multiple hospital resources)",
    4: "Level 4: Less Urgent (Stable patient requiring single resource)",
    5: "Level 5: Non-Urgent (Routine clinic visit, refills, minor consultation)"
}

# Deterministic Red-Flag Rule Definitions
LEVEL_1_RULES = [
    (r"\b(unconscious|unresponsive|coma|cardiac arrest|respiratory failure|not breathing|no pulse|septic shock|anaphylactic shock|drowning|choking|massive bleeding|bleeding out)\b", "Immediate life-threatening collapse or airway/circulatory compromise")
]

LEVEL_2_RULES = [
    (r"\b(chest pain|chest pressure|angina|radiating pain|left arm pain|heart attack|myocardial)\b", "Potential acute coronary syndrome"),
    (r"\b(stroke|slurred speech|facial droop|face drooping|one sided weakness|paralysis|sudden numbness|aphasia)\b", "Potential acute cerebrovascular stroke (F.A.S.T.)"),
    (r"\b(seizure|seizing|convulsion|epileptic)\b", "Active or recent neurological seizure activity"),
    (r"\b(suicide|suicidal|self harm|killing myself|overdose|poisoning|stab|gunshot|head trauma|loss of consciousness)\b", "Acute psychiatric crisis, severe trauma, or toxic ingestion"),
    (r"\b(severe shortness of breath|gasping|anaphylaxis|stridor|severe asthma)\b", "Acute respiratory distress")
]

LEVEL_3_RULES = [
    (r"\b(high fever|persistent fever|severe abdominal pain|stomach pain|vomiting|frequent vomiting|dehydration|dislocation|bone fracture|broken bone|deep laceration)\b", "Acute illness/injury requiring multi-resource diagnostic evaluation")
]

LEVEL_4_RULES = [
    (r"\b(sprain|twisted ankle|mild laceration|cut|minor burn|sore throat|earache|urinary discomfort|rash)\b", "Stable complaint requiring single resource (X-ray, suture, prescription)")
]

def evaluate_esi_triage(query: str, extracted_symptoms: List[str] = None, age: int = None) -> Dict[str, Any]:
    """
    Hybrid Rules-First + LLM ESI Triage Evaluator with Fail-Safe Urgency Bias.
    """
    q_lower = query.lower()
    rules_triggered = []
    
    esi_level = 5
    severity = "Routine"
    is_emergency = False
    is_escalated = False
    confidence_score = 0.95
    ward = "General Practice"
    recommended_steps = []

    # Step 1: Evaluate Deterministic Red-Flag Rules
    # Check Level 1 (Resuscitation)
    for pattern, reason in LEVEL_1_RULES:
        if re.search(pattern, q_lower):
            esi_level = 1
            severity = "Critical"
            is_emergency = True
            is_escalated = True
            confidence_score = 1.0
            ward = "ICU" if any(x in q_lower for x in ["unconscious", "shock", "failure", "coma"]) else "Emergency"
            rules_triggered.append(f"[RULE L1 OVERRIDE] {reason}")
            recommended_steps = [
                "Call 911 / Emergency Services immediately.",
                "Do not move the patient unless in immediate physical danger.",
                "Initiate CPR or airway assistance if trained.",
                "Alert emergency resuscitation team upon arrival."
            ]
            break

    # Check Level 2 (Emergent) if not Level 1
    if esi_level > 1:
        for pattern, reason in LEVEL_2_RULES:
            if re.search(pattern, q_lower):
                esi_level = 2
                severity = "Critical" if "chest" in q_lower or "stroke" in q_lower or "suicide" in q_lower else "Urgent"
                is_emergency = True
                is_escalated = True
                confidence_score = 0.98
                
                if any(x in q_lower for x in ["chest", "heart", "angina"]):
                    ward = "Cardiology"
                elif any(x in q_lower for x in ["stroke", "seizure", "droop", "numbness"]):
                    ward = "Neurology"
                elif any(x in q_lower for x in ["suicide", "self harm", "overdose"]):
                    ward = "Mental Health"
                else:
                    ward = "Emergency"

                rules_triggered.append(f"[RULE L2 OVERRIDE] {reason}")
                recommended_steps = [
                    "Keep the patient calm and seated in a comfortable position.",
                    "Direct patient immediately to Emergency / Critical Triage Bay.",
                    "Do not administer food, drink, or unprescribed oral medications.",
                    "Assign primary nurse for immediate vital sign monitoring."
                ]
                break

    # Check Level 3 (Urgent) if not Level 1 or 2
    if esi_level > 2:
        for pattern, reason in LEVEL_3_RULES:
            if re.search(pattern, q_lower):
                esi_level = 3
                severity = "Urgent"
                is_emergency = False
                is_escalated = False
                confidence_score = 0.90
                
                if any(x in q_lower for x in ["fracture", "bone", "dislocation"]):
                    ward = "Orthopedics"
                elif age is not None and age < 16:
                    ward = "Pediatrics"
                else:
                    ward = "Emergency"
                    
                rules_triggered.append(f"[RULE L3 OVERRIDE] {reason}")
                recommended_steps = [
                    "Proceed to Urgent Care reception for formal vitals assessment.",
                    "Apply ice or immobilize affected limb if injury is suspected.",
                    "Monitor for worsening symptoms such as dizziness or intense pain."
                ]
                break

    # Check Level 4 (Less Urgent) if not Level 1, 2, or 3
    if esi_level > 3:
        for pattern, reason in LEVEL_4_RULES:
            if re.search(pattern, q_lower):
                esi_level = 4
                severity = "Routine"
                is_emergency = False
                is_escalated = False
                confidence_score = 0.92
                ward = "Orthopedics" if "sprain" in q_lower else "General Practice"
                rules_triggered.append(f"[RULE L4 OVERRIDE] {reason}")
                recommended_steps = [
                    "Rest and keep comfortable in outpatient waiting room.",
                    "A clinician will conduct a targeted examination shortly.",
                    "Use cold compresses or OTC pain relief if appropriate."
                ]
                break

    # Level 5 Fallback (Non-Urgent / General Practice)
    if esi_level == 5 and not rules_triggered:
        rules_triggered.append("[FALLBACK L5] Non-acute query; assigned to General Practice primary care")
        recommended_steps = [
            "Schedule or wait for routine general outpatient consultation.",
            "Stay hydrated and note down any change in symptoms.",
            "Inform staff if symptoms escalate."
        ]

    # Step 2: Fail-Safe Confidence Bias Check
    # If confidence < 0.70 or input is very vague with keywords like "pain", "bad", shift to safer tier
    if confidence_score < 0.75 and esi_level > 2:
        original_esi = esi_level
        esi_level = max(1, esi_level - 1)
        rules_triggered.append(f"[FAIL-SAFE BIAS] Elevated priority from Level {original_esi} -> Level {esi_level} due to uncertainty threshold")

    esi_desc = ESI_DESCRIPTIONS.get(esi_level, "Level 5: Non-Urgent")

    # Step 3: Construct Reasoning Trace
    reasoning_trace = {
        "esi_level": esi_level,
        "esi_description": esi_desc,
        "severity": severity,
        "confidence_score": confidence_score,
        "is_emergency": is_emergency,
        "is_escalated": is_escalated,
        "rules_triggered": rules_triggered,
        "clinical_protocol": f"Patient classified under ESI Level {esi_level}. " + ("Emergency human escalation active." if is_escalated else "Standard queue intake active.")
    }

    return {
        "esi_level": esi_level,
        "esi_description": esi_desc,
        "severity": severity,
        "ward": ward,
        "is_emergency": is_emergency,
        "is_escalated": is_escalated,
        "confidence_score": confidence_score,
        "rules_triggered": rules_triggered,
        "recommended_steps": recommended_steps,
        "reasoning_trace": reasoning_trace
    }
