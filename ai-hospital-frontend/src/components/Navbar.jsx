import React, { useState } from 'react';
import { Activity, Globe, ChevronDown, Menu } from 'lucide-react';

export default function Navbar() {
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');

  const languages = ['English', 'Español', 'Français'];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="bg-teal-600 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-cyan-600">
              MedEye Hospital
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Home</a>
            <a href="#" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Departments</a>
            <a href="#" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Find a Doctor</a>
            <a href="#" className="text-slate-600 hover:text-teal-600 font-medium transition-colors">Contact</a>
            
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 text-slate-600 hover:text-teal-600 font-medium transition-colors p-2 rounded-lg hover:bg-slate-50"
              >
                <Globe size={18} />
                <span>{currentLang}</span>
                <ChevronDown size={14} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden py-1 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setCurrentLang(lang);
                          setLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors ${
                          currentLang === lang ? 'bg-teal-50/50 text-teal-700 font-medium' : 'text-slate-700'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md shadow-teal-600/20">
              Patient Portal
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button className="text-slate-600 p-2">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
