import React, { useState, useEffect } from "react";
import { fetchPatientsQueue, clearPatientsQueue, exportAllFhirBundles } from "../services/api";
import WardBadge from "./WardBadge";
import { X, RefreshCw, Trash2, Users, AlertTriangle, Activity, CheckCircle, Search, Filter, ShieldAlert, Download, Code } from "lucide-react";

export default function DashboardModal({ isOpen, onClose }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedWard, setSelectedWard] = useState("All");
  const [selectedEsi, setSelectedEsi] = useState("All");

  const loadData = async () => {
    setLoading(true);
    const queue = await fetchPatientsQueue();
    setPatients(queue);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleClear = async () => {
    if (window.confirm("Are you sure you want to clear the active intake queue?")) {
      await clearPatientsQueue();
      setPatients([]);
    }
  };

  const handleBulkFhirExport = async () => {
    const bundle = await exportAllFhirBundles();
    if (bundle) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `medeye_fhir_export_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  if (!isOpen) return null;

  const totalPatients = patients.length;
  const esi1Count = patients.filter(p => p.esi_level === 1).length;
  const esi2Count = patients.filter(p => p.esi_level === 2).length;
  const escalatedCount = patients.filter(p => p.is_escalated).length;
  const routineCount = patients.filter(p => (p.esi_level || 5) >= 4).length;

  const filteredPatients = patients.filter(p => {
    const matchesSearch = (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (p.query || "").toLowerCase().includes(search.toLowerCase()) ||
                          (p.ward || "").toLowerCase().includes(search.toLowerCase());
    const matchesWard = selectedWard === "All" || p.ward === selectedWard;
    const matchesEsi = selectedEsi === "All" || (p.esi_level && p.esi_level.toString() === selectedEsi);
    return matchesSearch && matchesWard && matchesEsi;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[88vh] rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 text-white px-6 py-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500/20 border border-teal-500/30 p-2 rounded-xl text-teal-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                Reception Intake Dashboard
                <span className="text-[10px] bg-teal-500/20 text-teal-300 font-mono px-2 py-0.5 rounded-full border border-teal-500/30">FHIR R4 Native</span>
              </h2>
              <p className="text-xs text-teal-300/80 font-medium">Real-Time Triage Queue & ABDM Interoperability Node</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkFhirExport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shadow-teal-600/20 border border-teal-500/50"
              title="Export All Queue Records as FHIR R4 Bundle"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export FHIR Bundle</span>
            </button>

            <button 
              onClick={loadData} 
              disabled={loading}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all disabled:opacity-50"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button 
              onClick={handleClear}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all border border-red-500/30"
              title="Clear Queue"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button 
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ESI Metrics Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-200/60">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="bg-teal-100 p-3 rounded-xl text-teal-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{totalPatients}</p>
              <p className="text-xs text-slate-500 font-medium">Total Triaged</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-xl text-red-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{escalatedCount}</p>
              <p className="text-xs text-slate-500 font-medium">Staff Escalated</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{esi1Count + esi2Count}</p>
              <p className="text-xs text-slate-500 font-medium">ESI 1 & 2 Emergencies</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{routineCount}</p>
              <p className="text-xs text-slate-500 font-medium">ESI 4 & 5 Routine</p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text"
              placeholder="Search patient, query, or ward..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto py-1 custom-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 mr-1">ESI Tier:</span>
            {["All", "1", "2", "3", "4", "5"].map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedEsi(lvl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedEsi === lvl ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {lvl === "All" ? "All ESI" : `ESI ${lvl}`}
              </button>
            ))}
          </div>
        </div>

        {/* Patient Cards Queue */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
          {filteredPatients.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Users className="w-12 h-12 stroke-[1.5] mb-3 text-slate-300" />
              <p className="font-semibold text-slate-600">No Patients Matching Filter</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Triaged patient intake records are stored as standards-compliant FHIR R4 Bundle resources.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPatients.map((patient, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                          {patient.name || "Anonymous Patient"}
                          {patient.is_escalated && (
                            <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-red-200 animate-pulse">
                              ESCALATED
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">{patient.age ? `Age: ${patient.age}` : "Age not specified"}</p>
                      </div>
                      <WardBadge ward={patient.ward} />
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-700 italic border border-slate-100">
                      "{patient.query}"
                    </div>

                    {patient.symptoms && patient.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {patient.symptoms.map((s, idx) => (
                          <span key={idx} className="bg-teal-50 text-teal-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-teal-100">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className={`font-bold px-2.5 py-1 rounded-lg text-white ${
                      patient.esi_level === 1 ? "bg-red-700 animate-pulse" :
                      patient.esi_level === 2 ? "bg-red-500" :
                      patient.esi_level === 3 ? "bg-amber-500" :
                      patient.esi_level === 4 ? "bg-emerald-600" : "bg-slate-600"
                    }`}>
                      ESI Level {patient.esi_level || 5}
                    </span>
                    <span className="text-slate-500 font-mono text-[10px] flex items-center gap-1">
                      <Code className="w-3 h-3 text-teal-600" /> FHIR R4 Bundle
                    </span>
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
