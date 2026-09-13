import React, { useState, useEffect } from "react";
import WardBadge from "./WardBadge";
import { fetchFhirBundle } from "../services/api";
import { User, Activity, AlertTriangle, CheckCircle2, Shield, Code, ChevronDown, ChevronUp, AlertCircle, FileCheck2, Cpu, Download } from "lucide-react";

export default function PatientCard({ patient }) {
  const [showFhir, setShowFhir] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [fhirData, setFhirData] = useState(null);

  if (!patient) return null;

  useEffect(() => {
    if (patient && patient.thread_id) {
      fetchFhirBundle(patient.thread_id).then(data => {
        if (data) setFhirData(data);
      });
    }
  }, [patient]);

  const esiConfigs = {
    1: { label: "ESI 1: Resuscitation", style: "bg-red-700 text-white font-black animate-pulse shadow-red-600/50" },
    2: { label: "ESI 2: Emergent", style: "bg-red-500 text-white font-bold shadow-red-500/30" },
    3: { label: "ESI 3: Urgent", style: "bg-amber-500 text-white font-bold shadow-amber-500/30" },
    4: { label: "ESI 4: Less Urgent", style: "bg-emerald-600 text-white font-semibold shadow-emerald-600/30" },
    5: { label: "ESI 5: Non-Urgent", style: "bg-slate-600 text-white font-medium" }
  };

  const esiLevel = patient.esi_level || 5;
  const esiConfig = esiConfigs[esiLevel] || esiConfigs[5];
  const confidencePct = patient.confidence_score ? Math.round(patient.confidence_score * 100) : 95;

  const handleDownloadFhir = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fhirData || {}, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fhir_bundle_${patient.thread_id || 'patient'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-gradient-to-br from-white via-slate-50/50 to-teal-50/30 border border-teal-100 mt-4 rounded-2xl shadow-xl shadow-teal-900/5 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header Bar */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-teal-600/10 p-1.5 rounded-lg text-teal-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
              FHIR R4 Intake Record
              <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md font-mono border border-teal-200">
                ABDM Aligned
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">ID: {patient.thread_id ? patient.thread_id.substring(0, 8) : "N/A"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {patient.is_escalated && (
            <span className="bg-red-100 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Staff Escalation
            </span>
          )}
          
          <span className={`px-3 py-1 rounded-full text-xs shadow-sm ring-1 ring-black/5 ${esiConfig.style}`}>
            {esiConfig.label}
          </span>
          
          {patient.ward && <WardBadge ward={patient.ward} />}
        </div>
      </div>
      
      {/* Body Details */}
      <div className="p-5 space-y-4">
        
        {/* Patient Profile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-teal-100/70 p-2 rounded-full text-teal-700">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Patient Name</p>
              <p className="text-slate-800 font-semibold text-sm">{patient.name || "Awaiting name..."}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-cyan-100/70 p-2 rounded-full text-cyan-700">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Age & ABHA Link</p>
              <p className="text-slate-800 font-semibold text-sm">{patient.age ? `${patient.age} y/o` : "Awaiting age..."} • <span className="text-teal-600 font-mono text-xs">ABHA: 91-XXXX</span></p>
            </div>
          </div>
        </div>

        {/* Symptoms List */}
        {patient.symptoms && patient.symptoms.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1.5">FHIR Observation Symptoms</p>
            <div className="flex flex-wrap gap-1.5">
              {patient.symptoms.map((symptom, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-700 border border-slate-200/80 px-2.5 py-0.5 rounded-md text-xs font-medium">
                  {symptom}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Immediate Steps */}
        {patient.recommended_steps && patient.recommended_steps.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              Protocol Actions
            </p>
            <ul className="space-y-1 pl-1">
              {patient.recommended_steps.map((step, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="text-teal-600 font-bold">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Emergency Escalation Banner */}
        {patient.is_escalated && (
          <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-800 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900">Mandatory Human Triage Escalation Active</p>
              <p className="mt-0.5">Clinical staff must perform direct vital signs assessment immediately.</p>
            </div>
          </div>
        )}

        {/* Action Toggles Bar */}
        <div className="pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowAudit(!showAudit)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors border border-slate-200/80"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              {showAudit ? "Hide Audit" : "Audit Trace"}
            </button>

            <button 
              onClick={() => setShowFhir(!showFhir)}
              className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition-colors border border-teal-200/60"
            >
              <Code className="w-3.5 h-3.5" />
              {showFhir ? "Hide FHIR R4 JSON" : "Inspect FHIR Bundle"}
            </button>
          </div>

          <button
            onClick={handleDownloadFhir}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-xl transition-all shadow-sm shadow-teal-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            Download FHIR (.json)
          </button>
        </div>

        {/* Audit Trace View */}
        {showAudit && (
          <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono space-y-2 border border-slate-800 shadow-inner animate-in fade-in duration-200">
            <p className="text-teal-400 font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <FileCheck2 className="w-3.5 h-3.5" /> Audit Trace
            </p>
            <div className="space-y-1 text-[11px] text-slate-300">
              <p><strong className="text-white">ESI Score:</strong> Level {esiLevel} ({patient.esi_description || "Standard"})</p>
              <p><strong className="text-white">Rules Triggered:</strong> {patient.reasoning_trace?.rules_triggered ? patient.reasoning_trace.rules_triggered.join("; ") : patient.reasoning || "Standard evaluation"}</p>
              <p><strong className="text-white">Confidence Score:</strong> {confidencePct}%</p>
            </div>
          </div>
        )}

        {/* FHIR R4 Payload View */}
        {showFhir && (
          <div className="p-3.5 bg-slate-950 text-teal-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-56 custom-scrollbar border border-slate-800 shadow-inner animate-in fade-in duration-200">
            <pre>{JSON.stringify(fhirData || patient.fhir_bundle || {}, null, 2)}</pre>
          </div>
        )}

      </div>
    </div>
  );
}
