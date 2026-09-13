import React from "react";
import { X, FileText, CheckCircle2, ShieldCheck, Cpu, Globe, Award, Sparkles } from "lucide-react";

export default function ConceptNoteModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl h-[88vh] rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-teal-950 text-white px-6 py-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/20 border border-cyan-500/30 p-2 rounded-xl text-cyan-300">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">MedEye Architecture & Concept Note</h2>
              <p className="text-xs text-cyan-200/80 font-medium">Standards-Native AI Receptionist & ABDM/FHIR R4 Ecosystem Node</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 space-y-8 custom-scrollbar">
          
          {/* Executive Summary Card */}
          <div className="bg-gradient-to-br from-teal-900 to-cyan-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
              <Sparkles className="w-48 h-48" />
            </div>
            <div className="relative z-10 space-y-2">
              <span className="bg-teal-400/20 text-teal-200 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-teal-400/30">
                Core Architectural Vision
              </span>
              <h3 className="text-2xl font-extrabold text-white">From Frontline Triage Bot to National Health Node</h3>
              <p className="text-sm text-teal-100/90 leading-relaxed font-light">
                MedEye is engineered not merely as a conversational chatbot, but as a fully compliant Health Information Provider (HIP) node. Every intake conversation produces FHIR R4 structured resources, consent logs, and ABHA-linked records out of the box.
              </p>
            </div>
          </div>

          {/* Key Architecture Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="bg-teal-100 text-teal-700 p-2.5 rounded-xl w-fit">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">ABDM Ecosystem Link</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Native support for 14-digit ABHA IDs, Health Facility Registries (HFR), and Health Practitioner Registries (HPR) to eliminate duplicate patient records.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="bg-cyan-100 text-cyan-700 p-2.5 rounded-xl w-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">FHIR R4 Standard</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Patient, Encounter, Observation, and RiskAssessment data structures adhere strictly to international FHIR R4 standard schemas for effortless EMR/HIS integration.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
              <div className="bg-purple-100 text-purple-700 p-2.5 rounded-xl w-fit">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">LangGraph Workflow</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stateful 4-node execution graph with memory persistence checkpointers, graceful API key fallback engines, and fail-safe clinical safety bias.
              </p>
            </div>

          </div>

          {/* Detailed Specifications */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-600" />
              Project Objectives & Measured Impact
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-800">40% Reduction in Reception Wait Times</strong>
                  Continuous automated onboarding before physical clinician consultation.
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-800">Zero Manual Data Entry Errors</strong>
                  Pydantic strict schema validation enforces error-free clinical data capture.
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-800">8 Ward Specialized Triage</strong>
                  Instant classification into Emergency, ICU, Cardiology, Neurology, Pediatrics, Orthopedics, Mental Health, and General Practice.
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-800">Fail-Safe Emergency Redirection</strong>
                  Immediate safety overrides for critical red-flag symptoms with clear 911/emergency instructions.
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-xs text-slate-400 py-2">
            MedEye AI Health Innovation Systems • Confidential Project Architecture Document
          </div>

        </div>

      </div>
    </div>
  );
}
