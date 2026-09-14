"""
services/db.py — SQLite persistence layer for MedEye AI Hospital Receptionist.

Uses Python's built-in sqlite3 (zero external dependencies).
DB file is created at /backend/medeye.db on first run.

Tables:
  patients      — full triage record as a JSON blob, keyed by thread_id
  appointments  — priority-queue scheduling slots, keyed by thread_id
"""

import os
import json
import sqlite3
from datetime import datetime
from typing import List, Optional, Dict, Any

# Resolve DB path relative to this file's directory (backend/)
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "medeye.db")


# ── Schema Bootstrap ───────────────────────────────────────────────────────────

def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables if they don't already exist. Called once on startup."""
    with _get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS patients (
                thread_id   TEXT PRIMARY KEY,
                record_json TEXT NOT NULL,
                created_at  TEXT NOT NULL,
                updated_at  TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS appointments (
                thread_id        TEXT PRIMARY KEY,
                appointment_json TEXT NOT NULL,
                esi_level        INTEGER NOT NULL DEFAULT 5,
                assigned_at      TEXT NOT NULL
            )
        """)
        conn.commit()
    print(f"[DB] SQLite database initialised at: {DB_PATH}")


# ── Patients ──────────────────────────────────────────────────────────────────

def save_patient(record: Dict[str, Any]) -> None:
    """Upsert a patient record (insert or replace by thread_id)."""
    thread_id = record.get("thread_id")
    if not thread_id:
        print("[DB] save_patient: skipped — no thread_id in record")
        return

    now = datetime.utcnow().isoformat() + "Z"
    record_json = json.dumps(record)

    with _get_conn() as conn:
        # Check if already exists (for created_at preservation)
        row = conn.execute(
            "SELECT created_at FROM patients WHERE thread_id = ?", (thread_id,)
        ).fetchone()
        created_at = row["created_at"] if row else now

        conn.execute("""
            INSERT INTO patients (thread_id, record_json, created_at, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(thread_id) DO UPDATE SET
                record_json = excluded.record_json,
                updated_at  = excluded.updated_at
        """, (thread_id, record_json, created_at, now))
        conn.commit()


def load_all_patients() -> List[Dict[str, Any]]:
    """Return all patient records ordered by created_at descending."""
    with _get_conn() as conn:
        rows = conn.execute(
            "SELECT record_json FROM patients ORDER BY created_at DESC"
        ).fetchall()
    return [json.loads(r["record_json"]) for r in rows]


def load_patient(thread_id: str) -> Optional[Dict[str, Any]]:
    """Load a single patient record by thread_id."""
    with _get_conn() as conn:
        row = conn.execute(
            "SELECT record_json FROM patients WHERE thread_id = ?", (thread_id,)
        ).fetchone()
    return json.loads(row["record_json"]) if row else None


def clear_all_patients() -> None:
    """Delete all patient and appointment records (used by the clear queue endpoint)."""
    with _get_conn() as conn:
        conn.execute("DELETE FROM patients")
        conn.execute("DELETE FROM appointments")
        conn.commit()
    print("[DB] All patient and appointment records cleared.")


# ── Appointments ──────────────────────────────────────────────────────────────

def save_appointment(appointment: Dict[str, Any]) -> None:
    """Upsert an appointment/token record."""
    thread_id = appointment.get("thread_id")
    if not thread_id:
        return

    esi_level = appointment.get("esi_level", 5)
    assigned_at = appointment.get("assigned_at", datetime.utcnow().isoformat() + "Z")
    appointment_json = json.dumps(appointment)

    with _get_conn() as conn:
        conn.execute("""
            INSERT INTO appointments (thread_id, appointment_json, esi_level, assigned_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(thread_id) DO UPDATE SET
                appointment_json = excluded.appointment_json,
                esi_level        = excluded.esi_level,
                assigned_at      = excluded.assigned_at
        """, (thread_id, appointment_json, esi_level, assigned_at))
        conn.commit()


def load_all_appointments() -> List[Dict[str, Any]]:
    """
    Return all appointments sorted by priority:
      1. ESI level ascending (1 = most critical first)
      2. assigned_at ascending (FIFO within same ESI tier)
    """
    with _get_conn() as conn:
        rows = conn.execute(
            "SELECT appointment_json FROM appointments ORDER BY esi_level ASC, assigned_at ASC"
        ).fetchall()
    return [json.loads(r["appointment_json"]) for r in rows]


def load_appointment(thread_id: str) -> Optional[Dict[str, Any]]:
    """Load a single appointment record by thread_id."""
    with _get_conn() as conn:
        row = conn.execute(
            "SELECT appointment_json FROM appointments WHERE thread_id = ?", (thread_id,)
        ).fetchone()
    return json.loads(row["appointment_json"]) if row else None


def get_next_token_number() -> int:
    """Return the next available token number (max existing + 1, min 1)."""
    with _get_conn() as conn:
        row = conn.execute(
            "SELECT MAX(json_extract(appointment_json, '$.token_number')) AS max_token FROM appointments"
        ).fetchone()
    max_token = row["max_token"] if row and row["max_token"] is not None else 0
    return max_token + 1
