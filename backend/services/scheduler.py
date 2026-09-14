"""
services/scheduler.py — Phase 3 Priority Queue Scheduling Engine.

Logic:
  - ESI 1 & 2 patients always go to the front of any department queue.
  - Within the same ESI tier, FIFO ordering applies (arrival time).
  - Wait estimate = (number of patients ahead in same department with same/higher priority)
                    × avg_consult_minutes_for_that_ward
  - Token numbers are globally unique and monotonically increasing (via DB).
  - Doctor is assigned round-robin from the on-duty roster for the department.
"""

from datetime import datetime
from typing import Dict, Any, List

from services.db import (
    load_all_appointments,
    get_next_token_number,
    save_appointment,
)

# ── Ward Configuration ─────────────────────────────────────────────────────────

# Average consult/service time per ward in minutes
WARD_CONSULT_TIMES: Dict[str, int] = {
    "Emergency":      5,
    "ICU":            8,
    "Cardiology":     15,
    "Neurology":      15,
    "Pediatrics":     12,
    "Orthopedics":    18,
    "Mental Health":  20,
    "General Practice": 20,
}

# On-duty doctor roster per department (mirrors main.py DEPARTMENTS list)
WARD_DOCTORS: Dict[str, List[str]] = {
    "Emergency":      ["Dr. Sarah Jenkins", "Dr. Marcus Vance"],
    "ICU":            ["Dr. Elena Rostova"],
    "Cardiology":     ["Dr. Alan Mercer", "Dr. Priya Patel"],
    "Neurology":      ["Dr. Lisa Cuddy", "Dr. Raymond Holt"],
    "Pediatrics":     ["Dr. Allison Cameron", "Dr. Robert Chase"],
    "Orthopedics":    ["Dr. Gregory House", "Dr. Eric Foreman"],
    "Mental Health":  ["Dr. Charles Kroger", "Dr. Linda Martin"],
    "General Practice": ["Dr. John Watson", "Dr. James Wilson"],
}

# Doctors flagged as on-duty (same as main.py)
ON_DUTY_DOCTORS: Dict[str, List[str]] = {
    "Emergency":      ["Dr. Sarah Jenkins"],
    "ICU":            ["Dr. Elena Rostova"],
    "Cardiology":     ["Dr. Alan Mercer", "Dr. Priya Patel"],
    "Neurology":      ["Dr. Lisa Cuddy"],
    "Pediatrics":     ["Dr. Allison Cameron"],
    "Orthopedics":    ["Dr. Gregory House"],
    "Mental Health":  ["Dr. Charles Kroger", "Dr. Linda Martin"],
    "General Practice": ["Dr. John Watson", "Dr. James Wilson"],
}


# ── Helper: Doctor Assignment ─────────────────────────────────────────────────

def _pick_doctor(department: str, token_number: int) -> str:
    """
    Round-robin pick from on-duty doctors for the department.
    Falls back to full roster if no one is marked on-duty.
    """
    on_duty = ON_DUTY_DOCTORS.get(department, [])
    roster = on_duty if on_duty else WARD_DOCTORS.get(department, ["Attending Physician"])
    return roster[token_number % len(roster)]


# ── Helper: Queue Position & Wait Estimate ────────────────────────────────────

def _compute_position_and_wait(department: str, esi_level: int, current_appointments: List[Dict]) -> tuple[int, int]:
    """
    Returns (queue_position_in_department, estimated_wait_minutes).
    
    Patients ahead = those in the same department with:
      - lower ESI level number (more critical) → always ahead
      - same ESI level but earlier assigned_at (FIFO)
    """
    # We don't know assigned_at yet, but for position calculation we count
    # all existing patients in the same dept that have priority >= current
    dept_patients = [
        a for a in current_appointments
        if a.get("department", "").lower() == department.lower()
    ]

    # Patients strictly ahead: ESI < current (more urgent), OR same ESI (FIFO — all existing)
    # Since this patient is newly arriving, all existing same-dept patients are "ahead"
    patients_ahead = [
        a for a in dept_patients
        if a.get("esi_level", 5) <= esi_level
    ]

    queue_position = len(patients_ahead) + 1  # 1-indexed
    consult_time = WARD_CONSULT_TIMES.get(department, 20)
    estimated_wait = len(patients_ahead) * consult_time

    return queue_position, estimated_wait


# ── Main: Assign Token ────────────────────────────────────────────────────────

def assign_token(patient_record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Core scheduling function. Assigns a priority-sorted token to a patient.

    Args:
        patient_record: The full patient dict (from the /chat flow), must include
                        thread_id, ward, esi_level, severity, is_emergency.

    Returns:
        appointment dict matching the AppointmentSlot model schema.
    """
    thread_id = patient_record.get("thread_id", "unknown")
    department = patient_record.get("ward", "General Practice")
    esi_level = patient_record.get("esi_level", 5)
    severity = patient_record.get("severity", "Routine")
    is_emergency = patient_record.get("is_emergency", False)

    # Load current queue for position calculation
    current_appointments = load_all_appointments()

    # Skip re-assigning if this patient already has a token
    existing = next((a for a in current_appointments if a.get("thread_id") == thread_id), None)
    if existing:
        # Recalculate wait only (ESI or queue may have shifted)
        queue_position, estimated_wait = _compute_position_and_wait(
            department, esi_level, [a for a in current_appointments if a.get("thread_id") != thread_id]
        )
        existing["queue_position"] = queue_position
        existing["estimated_wait_minutes"] = estimated_wait
        save_appointment(existing)
        return existing

    # New patient — assign fresh token
    token_number = get_next_token_number()
    queue_position, estimated_wait = _compute_position_and_wait(
        department, esi_level, current_appointments
    )
    assigned_doctor = _pick_doctor(department, token_number)

    appointment = {
        "thread_id":              thread_id,
        "token_number":           token_number,
        "queue_position":         queue_position,
        "estimated_wait_minutes": estimated_wait,
        "assigned_doctor":        assigned_doctor,
        "department":             department,
        "esi_level":              esi_level,
        "severity":               severity,
        "is_emergency":           is_emergency,
        "assigned_at":            datetime.utcnow().isoformat() + "Z",
        "patient_name":           patient_record.get("name"),
        "patient_age":            patient_record.get("age"),
    }

    save_appointment(appointment)
    print(f"[SCHEDULER] Token #{token_number} assigned | {department} | ESI {esi_level} | Wait: ~{estimated_wait}min | Dr: {assigned_doctor}")
    return appointment


# ── Rerank: Recalculate All Queue Positions ───────────────────────────────────

def rerank_queue() -> List[Dict[str, Any]]:
    """
    Recalculate queue positions and wait estimates for all active appointments.
    Called when a new high-ESI patient arrives and shifts everyone else down.
    Returns the updated, sorted list.
    """
    all_appts = load_all_appointments()  # already sorted by ESI ASC, assigned_at ASC

    # Group by department
    dept_counters: Dict[str, int] = {}  # track position within each dept

    updated = []
    for appt in all_appts:
        dept = appt.get("department", "General Practice")
        esi = appt.get("esi_level", 5)

        dept_counters[dept] = dept_counters.get(dept, 0)
        queue_position = dept_counters[dept] + 1
        consult_time = WARD_CONSULT_TIMES.get(dept, 20)
        estimated_wait = dept_counters[dept] * consult_time

        appt["queue_position"] = queue_position
        appt["estimated_wait_minutes"] = estimated_wait
        dept_counters[dept] += 1

        save_appointment(appt)
        updated.append(appt)

    print(f"[SCHEDULER] Queue re-ranked: {len(updated)} appointments updated.")
    return updated
