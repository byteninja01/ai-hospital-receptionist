import React, { useState, useEffect } from "react";
import { fetchDepartmentsList } from "../services/api";
import { X, Building2, MapPin, UserCheck, UserX, ArrowRight } from "lucide-react";

export default function DepartmentsModal({ isOpen, onClose, onSelectPreset }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchDepartmentsList().then(data => {
        setDepartments(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sampleQueries = {
    Emergency: "My friend had a bad motorcycle accident, bleeding heavily and in severe pain!",
    ICU: "Patient is unresponsive, difficulty breathing and extremely pale.",
    Cardiology: "Experiencing crushing chest pain, pressure, and left arm numbness for 30 minutes.",
    Neurology: "Sudden weakness on the left side of face and slurred speech.",
    Pediatrics: "My 4-year-old child has high fever, dry cough, and vomiting.",
    Orthopedics: "Fell down the stairs, severe ankle pain, swelling, unable to put weight on leg.",
    "Mental Health": "Severe anxiety attack, rapid heartbeat, and overwhelming feelings of panic.",
    "General Practice": "Feeling tired for a week with mild headache and runny nose."
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-slate-900 text-white px-6 py-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500/20 border border-teal-500/30 p-2 rounded-xl text-teal-300">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Hospital Wards & Doctor Directory</h2>
              <p className="text-xs text-teal-200/80 font-medium">8 Specialized Medical Wards & On-Duty Specialists</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Directory Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center text-teal-600 font-medium">
              Loading hospital directory...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {departments.map((dept) => (
                <div 
                  key={dept.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-bold text-slate-800">{dept.name}</h3>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
                        <MapPin className="w-3 h-3 text-teal-600" />
                        {dept.location}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{dept.description}</p>

                    {/* Doctors List */}
                    <div className="pt-2">
                      <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2">On-Duty Physicians</p>
                      <div className="space-y-1.5">
                        {dept.doctors.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            <span className="font-semibold text-slate-700">{doc.name} <span className="text-slate-400 font-normal">({doc.specialty})</span></span>
                            {doc.on_duty ? (
                              <span className="flex items-center gap-1 text-emerald-600 font-medium text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                                <UserCheck className="w-3 h-3" /> On Duty
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-slate-400 font-medium text-[10px]">
                                <UserX className="w-3 h-3" /> Off Duty
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => {
                        const sample = sampleQueries[dept.name] || sampleQueries["General Practice"];
                        onSelectPreset(sample);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3.5 py-2 rounded-xl transition-all border border-teal-200/60"
                    >
                      Simulate Triage Intake <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
