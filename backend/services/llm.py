import os
import re
from dotenv import load_dotenv
from typing import List, Optional
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from services.esi_triage import evaluate_esi_triage
from services.audit_logger import log_triage_decision

load_dotenv()

# Check for API Keys
google_api_key = os.getenv("GOOGLE_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")

class StructuredFallbackWrapper:
    def __init__(self, schema):
        self.schema = schema

    def invoke(self, messages, **kwargs):
        return run_rule_based_triage(messages, self.schema)

class FallbackLLM:
    def __init__(self):
        self.is_fallback = True

    def with_structured_output(self, schema, **kwargs):
        return StructuredFallbackWrapper(schema)

    def invoke(self, messages, **kwargs):
        return run_rule_based_respond(messages)

def run_rule_based_triage(messages, schema):
    # Extract query text
    query = ""
    for m in reversed(messages):
        if hasattr(m, "content"):
            content = m.content
        elif isinstance(m, dict):
            content = m.get("content", "")
        else:
            content = str(m)
            
        if content and not ("Extract patient details" in content or "Based on the patient query" in content):
            query = content
            break
            
    if not query and messages:
        last = messages[-1]
        query = last.content if hasattr(last, "content") else str(last)

    # Extract Name & Age from history
    all_text = ""
    for m in messages:
        if hasattr(m, "content"):
            all_text += " " + str(m.content)
        elif isinstance(m, dict):
            all_text += " " + str(m.get("content", ""))
        else:
            all_text += " " + str(m)
            
    name = None
    age = None

    name_patterns = [
        r"(?:my name is|i am|i'm|this is)\s+([a-zA-Z\s]{2,20})(?:\s+and|\.|\,|$)",
        r"(?:patient name is|patient is)\s+([a-zA-Z\s]{2,20})(?:\s+and|\.|\,|$)",
    ]
    for p in name_patterns:
        match = re.search(p, all_text, re.IGNORECASE)
        if match:
            extracted = match.group(1).strip()
            common_words = {"having", "feeling", "suffering", "sick", "ill", "pain", "hurt", "injured", "years", "old", "year", "please", "to", "for", "with"}
            words = extracted.split()
            if words and not any(w.lower() in common_words for w in words):
                name = extracted
                break

    age_patterns = [
        r"(\d{1,3})\s*(?:years?\s*old|yo|years?\s*of\s*age|year\s*old)",
        r"(?:i am|i'm|age|aged)\s+(\d{1,3})",
        r"(?:child is|son is|daughter is)\s+(\d{1,3})",
    ]
    for p in age_patterns:
        match = re.search(p, all_text, re.IGNORECASE)
        if match:
            val = int(match.group(1))
            if 0 <= val <= 115:
                age = val
                break
                
    if not age:
        numbers = re.findall(r"\b(\d{1,3})\b", all_text)
        for num in numbers:
            val = int(num)
            if 1 <= val <= 100:
                if not re.search(rf"\b{val}\s*(?:pm|am|clock|http|localhost|8000|5173)\b", all_text, re.IGNORECASE):
                    age = val
                    break

    # Extract Symptoms
    q_lower = query.lower()
    symptoms = []
    all_kws = ["chest pain", "heart", "palpitation", "unconscious", "stroke", "seizure", "slurred", "numbness", "fever", "cough", "flu", "sore throat", "rash", "stomach", "fatigue", "vomit", "vomiting", "nausea", "anxiety", "panic", "suicide", "fracture", "sprain", "broken"]
    for kw in all_kws:
        if kw in q_lower:
            symptoms.append(kw)
    if not symptoms:
        symptoms = ["general malaise"]

    # Run ESI Triage Evaluator
    esi_res = evaluate_esi_triage(query, extracted_symptoms=symptoms, age=age)

    # Reasoning string for backward compatibility
    reasoning = f"{esi_res['esi_description']}. " + "; ".join(esi_res['rules_triggered'])

    # Record Audit Log
    log_triage_decision({
        "thread_id": "session-run",
        "name": name,
        "age": age,
        "query": query,
        "esi_level": esi_res["esi_level"],
        "esi_description": esi_res["esi_description"],
        "severity": esi_res["severity"],
        "ward": esi_res["ward"],
        "is_emergency": esi_res["is_emergency"],
        "is_escalated": esi_res["is_escalated"],
        "confidence_score": esi_res["confidence_score"],
        "rules_triggered": esi_res["rules_triggered"],
        "reasoning_trace": esi_res["reasoning_trace"]
    })

    schema_name = getattr(schema, "__name__", "ClinicalIntake") if schema else "ClinicalIntake"

    if schema and schema_name == "PatientInfo":
        return schema(name=name, age=age)
    elif schema and schema_name == "WardClassification":
        return schema(
            ward=esi_res["ward"],
            reasoning=reasoning,
            severity=esi_res["severity"],
            esi_level=esi_res["esi_level"],
            esi_description=esi_res["esi_description"],
            confidence_score=esi_res["confidence_score"],
            is_escalated=esi_res["is_escalated"],
            symptoms=symptoms,
            is_emergency=esi_res["is_emergency"],
            recommended_steps=esi_res["recommended_steps"],
            reasoning_trace=esi_res["reasoning_trace"]
        )
    else:
        from models import ClinicalIntake
        target_cls = schema if schema else ClinicalIntake
        return target_cls(
            name=name,
            age=age,
            ward=esi_res["ward"],
            reasoning=reasoning,
            severity=esi_res["severity"],
            esi_level=esi_res["esi_level"],
            esi_description=esi_res["esi_description"],
            confidence_score=esi_res["confidence_score"],
            is_escalated=esi_res["is_escalated"],
            symptoms=symptoms,
            is_emergency=esi_res["is_emergency"],
            recommended_steps=esi_res["recommended_steps"],
            reasoning_trace=esi_res["reasoning_trace"]
        )

def run_rule_based_respond(messages):
    triage_info = run_rule_based_triage(messages, None)
    
    esi_level = getattr(triage_info, "esi_level", 5)
    esi_desc = getattr(triage_info, "esi_description", "Level 5")
    is_escalated = getattr(triage_info, "is_escalated", False)
    ward = getattr(triage_info, "ward", "General Practice")
    severity = getattr(triage_info, "severity", "Routine")
    name = getattr(triage_info, "name", None)
    age = getattr(triage_info, "age", None)
    recommended_steps = getattr(triage_info, "recommended_steps", [])

    is_complete = bool(name and age)

    response_text = ""
    if is_escalated or esi_level in [1, 2]:
        response_text += f"🚨 **HUMAN STAFF ESCALATION ACTIVE ({esi_desc})**\n\n"
        response_text += f"Our safety rules have flagged your symptoms as requiring immediate priority care in **{ward}** (Severity: **{severity}**).\n\n"
        response_text += "⚠️ **IMMEDIATE EMERGENCY INSTRUCTIONS:**\n"
        for step in recommended_steps:
            response_text += f"- {step}\n"
        response_text += "\nA triage nurse has been notified of your arrival. Please step forward to the emergency counter immediately."
    elif is_complete:
        response_text += f"Thank you, {name} (Age: {age}). Registration complete.\n\n"
        response_text += f"Triage Assessment: **{esi_desc}**.\n"
        response_text += f"You have been assigned to the **{ward}** ward with **{severity}** priority.\n\n"
        response_text += "**Recommended Next Steps:**\n"
        for step in recommended_steps:
            response_text += f"- {step}\n"
        response_text += "\nPlease take a seat in the designated ward waiting area."
    else:
        missing = []
        if not name:
            missing.append("your full name")
        if not age:
            missing.append("your age")
        missing_str = " and ".join(missing)
        
        response_text += f"Symptoms noted and tentatively assigned to **{ward}** (Triage: **{esi_desc}**).\n\n"
        response_text += f"To complete your check-in, could you please provide **{missing_str}**?\n"

    class ResponseObject:
        def __init__(self, content):
            self.content = content
    return ResponseObject(response_text)


# Initialize LLM
llm = None
if google_api_key:
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0,
            google_api_key=google_api_key
        )
        print("Using Google Gemini API key.")
    except Exception as e:
        print(f"Failed to load Google Gemini model: {e}")
        llm = None

if not llm and openai_api_key:
    try:
        from langchain_openai import ChatOpenAI
        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0,
            openai_api_key=openai_api_key
        )
        print("Using OpenAI API key.")
    except Exception as e:
        print(f"Failed to load OpenAI model: {e}")
        llm = None

if not llm:
    print("No valid API keys found. Defaulting to Phase 1 Hybrid ESI Triage Core Engine.")
    llm = FallbackLLM()
