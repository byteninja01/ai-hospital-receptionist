import React from "react";
import PatientCard from "./PatientCard";
import { User, Bot } from "lucide-react";

export default function MessageBubble({ msg }) {
  const isUser = msg.sender === "user";

  return (
    <div className={`mt-4 flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? "flex-row-reverse" : "flex-row"} gap-3 items-end`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${isUser ? "bg-blue-600 text-white" : "bg-emerald-500 text-white"}`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        
        {/* Bubble */}
        <div>
          <div 
            className={`px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
              isUser 
                ? "bg-blue-600 text-white rounded-br-sm" 
                : "bg-white border border-slate-100 text-slate-800 rounded-bl-sm"
            }`}
          >
            {msg.text}
          </div>
          
          {/* Render Patient Card if message contains structured data */}
          {!isUser && msg.patientData && (
            <PatientCard patient={msg.patientData} />
          )}
        </div>
        
      </div>
    </div>
  );
}
