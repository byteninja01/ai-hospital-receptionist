import os
import json
from datetime import datetime

LOGS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "logs")
AUDIT_LOG_FILE = os.path.join(LOGS_DIR, "triage_audit.jsonl")

def log_triage_decision(record: dict):
    """
    Append-only audit logger for safety, compliance, and clinical decision traceability.
    """
    try:
        os.makedirs(LOGS_DIR, exist_ok=True)
        
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "thread_id": record.get("thread_id", "unknown"),
            "patient_name": record.get("name"),
            "patient_age": record.get("age"),
            "query": record.get("query"),
            "esi_level": record.get("esi_level"),
            "esi_description": record.get("esi_description"),
            "severity": record.get("severity"),
            "ward": record.get("ward"),
            "is_emergency": record.get("is_emergency", False),
            "is_escalated": record.get("is_escalated", False),
            "confidence_score": record.get("confidence_score", 1.0),
            "rules_triggered": record.get("rules_triggered", []),
            "reasoning_trace": record.get("reasoning_trace", {})
        }

        with open(AUDIT_LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")
            
        print(f"[AUDIT LOG] Recorded triage entry for thread={log_entry['thread_id']} | ESI={log_entry['esi_level']}")
    except Exception as e:
        print(f"[AUDIT LOG ERROR] Failed to record audit log: {e}")
