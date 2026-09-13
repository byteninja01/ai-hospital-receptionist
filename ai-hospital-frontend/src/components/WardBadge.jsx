import React from "react";

export default function WardBadge({ ward }) {
  const configs = {
    Emergency: "bg-red-500/10 text-red-700 border-red-200 ring-red-500/20",
    ICU: "bg-rose-600/10 text-rose-800 border-rose-300 ring-rose-600/20 font-bold animate-pulse",
    Cardiology: "bg-orange-500/10 text-orange-700 border-orange-200 ring-orange-500/20",
    Neurology: "bg-purple-500/10 text-purple-700 border-purple-200 ring-purple-500/20",
    Pediatrics: "bg-teal-500/10 text-teal-700 border-teal-200 ring-teal-500/20",
    Orthopedics: "bg-blue-500/10 text-blue-700 border-blue-200 ring-blue-500/20",
    "Mental Health": "bg-indigo-500/10 text-indigo-700 border-indigo-200 ring-indigo-500/20",
    "General Practice": "bg-emerald-500/10 text-emerald-700 border-emerald-200 ring-emerald-500/20"
  };

  const styleClass = configs[ward] || "bg-slate-500/10 text-slate-700 border-slate-200 ring-slate-500/20";

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ring-1 transition-all ${styleClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {ward || "Unclassified"}
    </span>
  );
}
