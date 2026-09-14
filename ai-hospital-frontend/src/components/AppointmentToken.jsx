import React from "react";
import { Clock, User, Building2, ShieldCheck, FileCode2, Hash, Stethoscope } from "lucide-react";

const ESI_COLORS = {
  1: { bg: "bg-red-700", text: "text-white", ring: "ring-red-700", label: "Resuscitation", dot: "bg-red-400" },
  2: { bg: "bg-red-500", text: "text-white", ring: "ring-red-500", label: "Emergent", dot: "bg-red-300" },
  3: { bg: "bg-amber-500", text: "text-white", ring: "ring-amber-500", label: "Urgent", dot: "bg-amber-300" },
  4: { bg: "bg-emerald-600", text: "text-white", ring: "ring-emerald-600", label: "Less Urgent", dot: "bg-emerald-300" },
  5: { bg: "bg-slate-500", text: "text-white", ring: "ring-slate-500", label: "Non-Urgent", dot: "bg-slate-300" },
};

/**
 * AppointmentToken — reusable animated token card.
 * Used in the chat flow (on completion) and in the dashboard scheduling tab.
 *
 * Props:
 *   appointment: { token_number, queue_position, estimated_wait_minutes, assigned_doctor, department, esi_level, severity }
 *   consent:     { status, expiry, artifact_id } — optional
 *   compact:     boolean — smaller version for dashboard list
 *   showFhir:    boolean — show "FHIR Record Ready" indicator
 */
export default function AppointmentToken({ appointment, consent, compact = false, showFhir = false }) {
  if (!appointment) return null;

  const {
    token_number,
    queue_position,
    estimated_wait_minutes,
    assigned_doctor,
    department,
    esi_level = 5,
    patient_name,
  } = appointment;

  const esi = ESI_COLORS[esi_level] || ESI_COLORS[5];
  const isEmergency = esi_level <= 2;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-sm ${isEmergency ? "border-l-4 border-l-red-500" : "border-l-4 border-l-teal-400"}`}>
        {/* Token number */}
        <div className={`${esi.bg} text-white font-black text-sm w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isEmergency ? "animate-pulse" : ""}`}>
          #{token_number}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate">{patient_name || "Patient"}</p>
          <p className="text-xs text-slate-500 truncate">{assigned_doctor} · {department}</p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${esi.bg} ${esi.text}`}>
            ESI {esi_level}
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
            <Clock className="w-3 h-3" />~{estimated_wait_minutes}min
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border shadow-lg
      ${isEmergency ? "border-red-300 bg-gradient-to-br from-red-50 to-orange-50" : "border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50"}
    `}>
      {/* Top accent stripe */}
      <div className={`h-1.5 w-full ${esi.bg} ${isEmergency ? "animate-pulse" : ""}`} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`${esi.bg} text-white rounded-xl w-10 h-10 flex items-center justify-center font-black text-base shadow-md ${isEmergency ? "ring-2 ring-offset-1 " + esi.ring : ""}`}>
              <span className="text-[10px] font-bold leading-none">#{token_number}</span>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm leading-tight">Appointment Token</p>
              <p className="text-[10px] text-slate-500 font-mono">Queue #{queue_position}</p>
            </div>
          </div>

          <span className={`${esi.bg} ${esi.text} text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm`}>
            ESI {esi_level} · {esi.label}
          </span>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span><span className="font-semibold text-slate-800">~{estimated_wait_minutes} min</span> est. wait</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <Building2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            <span className="font-semibold text-slate-800 truncate">{department}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 col-span-2">
            <Stethoscope className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Assigned to <span className="font-semibold text-slate-800">{assigned_doctor}</span></span>
          </div>
        </div>

        {/* Consent + FHIR badges */}
        <div className="mt-3 pt-2.5 border-t border-white/60 flex items-center gap-2 flex-wrap">
          {consent && (
            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3" />
              ABDM Consent {consent.status || "GRANTED"}
            </div>
          )}

          {showFhir && (
            <div className="flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              <FileCode2 className="w-3 h-3" />
              FHIR R4 Bundle Ready
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
