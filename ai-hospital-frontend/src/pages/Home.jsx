import React, { useState } from 'react';
import ChatBox from '../components/ChatBox';
import Navbar from '../components/Navbar';
import DashboardModal from '../components/DashboardModal';
import DepartmentsModal from '../components/DepartmentsModal';
import ConceptNoteModal from '../components/ConceptNoteModal';
import { Activity, ShieldCheck, Building2, Users, FileText, ArrowRight, Sparkles, HeartPulse, Stethoscope, Clock } from 'lucide-react';

export default function Home() {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);
  const [conceptNoteOpen, setConceptNoteOpen] = useState(false);
  const [presetInput, setPresetInput] = useState("");

  const handleSelectPreset = (text) => {
    setPresetInput(text);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-900/5 text-slate-800 relative overflow-x-hidden font-sans">
      <Navbar 
        onOpenDashboard={() => setDashboardOpen(true)}
        onOpenDepartments={() => setDepartmentsOpen(true)}
        onOpenConceptNote={() => setConceptNoteOpen(true)}
      />
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-teal-50 to-transparent pointer-events-none -z-10"></div>
      <div className="absolute top-[-10%] right-[-5%] w-[650px] h-[650px] bg-cyan-400/15 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[550px] h-[550px] bg-teal-400/15 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative z-10 space-y-12">
        
        {/* Main Hero & Chat Container Grid */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-start pt-4">
          
          {/* Hero Left Column */}
          <div className="flex-1 text-center lg:text-left space-y-8 lg:mt-6 lg:pr-4">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100/70 border border-teal-200 text-teal-800 text-xs md:text-sm font-bold tracking-wide shadow-xs">
              <Sparkles size={16} className="text-teal-600 animate-pulse" />
              <span>Next-Gen Healthcare Intake & Triage</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
              Empathetic AI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600">
                Hospital Receptionist
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Experiencing health issues? Talk with MedEye for immediate triage, symptom analysis, and direct routing to specialized hospital wards.
            </p>
            
            {/* Quick Feature Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button 
                onClick={() => setDashboardOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2 group"
              >
                <Users className="w-4 h-4 text-teal-400" />
                <span>Open Staff Dashboard</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => setDepartmentsOpen(true)}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-cyan-600" />
                <span>Explore 8 Wards</span>
              </button>

              <button 
                onClick={() => setConceptNoteOpen(true)}
                className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/60 px-5 py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Concept Architecture</span>
              </button>
            </div>
            
            {/* Trust Standards Indicators */}
            <div className="pt-6 border-t border-slate-200/60 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <span className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center justify-center lg:justify-start gap-1">
                  <Clock className="w-5 h-5 text-teal-600 inline" /> 24/7
                </span>
                <span className="text-xs text-slate-500 font-medium">Instant Triage</span>
              </div>

              <div>
                <span className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center justify-center lg:justify-start gap-1">
                  <ShieldCheck className="w-5 h-5 text-cyan-600 inline" /> FHIR R4
                </span>
                <span className="text-xs text-slate-500 font-medium">Native Record Standard</span>
              </div>

              <div>
                <span className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center justify-center lg:justify-start gap-1">
                  <HeartPulse className="w-5 h-5 text-indigo-600 inline" /> ABDM
                </span>
                <span className="text-xs text-slate-500 font-medium">Ecosystem Compatible</span>
              </div>
            </div>

          </div>

          {/* Right Column: AI Chat Box Interface */}
          <div className="w-full flex-1 max-w-2xl relative">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-teal-500/20 via-cyan-400/20 to-indigo-500/20 rounded-[2.5rem] blur-xl opacity-70 pointer-events-none"></div>
            <div className="relative z-10 w-full">
              <ChatBox 
                presetInput={presetInput} 
                clearPresetInput={() => setPresetInput("")} 
              />
            </div>
          </div>

        </div>

      </main>

      {/* Modals */}
      <DashboardModal 
        isOpen={dashboardOpen} 
        onClose={() => setDashboardOpen(false)} 
      />

      <DepartmentsModal 
        isOpen={departmentsOpen} 
        onClose={() => setDepartmentsOpen(false)} 
        onSelectPreset={handleSelectPreset}
      />

      <ConceptNoteModal 
        isOpen={conceptNoteOpen} 
        onClose={() => setConceptNoteOpen(false)} 
      />

    </div>
  );
}
