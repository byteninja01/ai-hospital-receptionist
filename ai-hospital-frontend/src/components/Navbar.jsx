import React, { useState } from 'react';
import { Activity, Globe, ChevronDown, Menu, X, Building2, Users, FileText, Sparkles } from 'lucide-react';

export default function Navbar({ onOpenDashboard, onOpenDepartments, onOpenConceptNote }) {
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');

  const languages = ['English', 'Hindi (हिंदी)', 'Español'];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-gradient-to-tr from-teal-600 to-cyan-500 p-2.5 rounded-2xl shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-teal-800 to-cyan-700 tracking-tight">
                MedEye AI Hospital
              </span>
              <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Smart Reception & Triage</p>
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={onOpenDashboard}
              className="flex items-center gap-2 text-slate-700 hover:text-teal-700 font-semibold text-sm transition-all px-3 py-2 rounded-xl hover:bg-teal-50/60"
            >
              <Users className="w-4 h-4 text-teal-600" />
              <span>Reception Queue</span>
              <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-teal-200">Live</span>
            </button>

            <button 
              onClick={onOpenDepartments}
              className="flex items-center gap-2 text-slate-700 hover:text-teal-700 font-semibold text-sm transition-all px-3 py-2 rounded-xl hover:bg-teal-50/60"
            >
              <Building2 className="w-4 h-4 text-cyan-600" />
              <span>Wards & Doctors</span>
            </button>

            <button 
              onClick={onOpenConceptNote}
              className="flex items-center gap-2 text-slate-700 hover:text-teal-700 font-semibold text-sm transition-all px-3 py-2 rounded-xl hover:bg-teal-50/60"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Concept & Architecture</span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 text-slate-700 hover:text-teal-700 font-semibold text-sm transition-colors px-3 py-2 rounded-xl hover:bg-slate-100/80 border border-slate-200/60"
              >
                <Globe size={16} className="text-slate-500" />
                <span>{currentLang}</span>
                <ChevronDown size={14} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setCurrentLang(lang);
                          setLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-teal-50 hover:text-teal-700 transition-colors ${
                          currentLang === lang ? 'bg-teal-50/70 text-teal-700' : 'text-slate-700'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <button 
              onClick={onOpenDashboard}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-5 py-2.5 rounded-full font-bold text-xs transition-all shadow-md shadow-teal-600/20 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Staff Portal
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700 p-2 rounded-xl bg-slate-100"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          <button 
            onClick={() => { onOpenDashboard(); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 text-slate-800 font-bold text-sm w-full p-2.5 rounded-xl hover:bg-teal-50"
          >
            <Users className="w-5 h-5 text-teal-600" />
            Reception Queue Dashboard
          </button>
          <button 
            onClick={() => { onOpenDepartments(); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 text-slate-800 font-bold text-sm w-full p-2.5 rounded-xl hover:bg-teal-50"
          >
            <Building2 className="w-5 h-5 text-cyan-600" />
            Wards & Doctors Directory
          </button>
          <button 
            onClick={() => { onOpenConceptNote(); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 text-slate-800 font-bold text-sm w-full p-2.5 rounded-xl hover:bg-teal-50"
          >
            <FileText className="w-5 h-5 text-indigo-600" />
            Concept & Architecture Note
          </button>
        </div>
      )}
    </nav>
  );
}
