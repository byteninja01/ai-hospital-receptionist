import React from "react";
import WardBadge from "./WardBadge";
import { User, Activity, AlertCircle } from "lucide-react";

export default function PatientCard({ patient }) {
  if (!patient) return null;

  return (
    <div className="bg-white border border-slate-200 mt-4 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <h2 className="font-bold text-slate-700 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          Patient Summary
        </h2>
        {patient.ward && <WardBadge ward={patient.ward} />}
      </div>
      
      <div className="p-4 space-y-3 relative group">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full mt-1">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Details</p>
            <p className="text-slate-800 font-medium text-lg">{patient.name || "Unknown Patient"}</p>
            <p className="text-slate-600 font-medium">Age: {patient.age || "N/A"}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
          <div className="bg-orange-100 p-2 rounded-full mt-1">
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Chief Complaint</p>
            <p className="text-slate-700 italic">"{patient.query}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}
