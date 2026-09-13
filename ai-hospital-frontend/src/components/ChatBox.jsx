import React, { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import { sendMessageToAPI, resetSessionAPI, getThreadId } from "../services/api";
import { Send, Loader2, RotateCcw, AlertTriangle, Sparkles, Activity } from "lucide-react";

export default function ChatBox({ presetInput, clearPresetInput }) {
  const [messages, setMessages] = useState([
    { 
      text: "Welcome to MedEye Reception! I am your AI medical assistant. Please describe your symptoms or reason for visit, along with your name and age when ready.", 
      sender: "ai" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isEmergencyAlert, setIsEmergencyAlert] = useState(false);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    if (presetInput) {
      setInput(presetInput);
      if (clearPresetInput) clearPresetInput();
    }
  }, [presetInput, clearPresetInput]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleReset = async () => {
    if (window.confirm("Start a new patient intake session?")) {
      await resetSessionAPI();
      setMessages([
        { 
          text: "Session reset. Hello! I am MedEye Assistant. Please describe your symptoms to begin triage.", 
          sender: "ai" 
        }
      ]);
      setIsEmergencyAlert(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || isTyping) return;

    const userMsg = { text: query, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await sendMessageToAPI({ patient_query: query });
      const aiResponse = res.data;
      const patientData = aiResponse.patient || null;

      if (patientData && (patientData.is_emergency || patientData.severity === "Critical")) {
        setIsEmergencyAlert(true);
      }

      setMessages(prev => [
        ...prev,
        { 
          text: typeof aiResponse === 'string' ? aiResponse : aiResponse.message || "I have recorded your details.", 
          sender: "ai",
          patientData: patientData
        }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { text: "Unable to reach hospital receptionist system. Please ensure the backend server is running.", sender: "ai" }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const sampleChips = [
    { label: "🚨 Chest Pain & Arm Numbness", text: "I have severe crushing chest pain radiating to my left arm and sweating." },
    { label: "🤒 Child High Fever (4yo)", text: "My 4 year old child has a 102 fever, coughing, and vomiting since morning." },
    { label: "🦴 Twisted Ankle Fall", text: "I fell down and twisted my ankle. It is swollen and I cannot put weight on it." },
    { label: "🧠 Severe Panic & Anxiety", text: "Experiencing severe panic attack, rapid heart rate, and trouble breathing." }
  ];

  return (
    <div className="flex flex-col h-[650px] max-h-[85vh] w-full max-w-3xl mx-auto bg-white/95 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-2xl shadow-teal-900/10 overflow-hidden relative">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-teal-400 rounded-full animate-ping absolute"></div>
            <div className="w-3.5 h-3.5 bg-teal-500 rounded-full relative shadow-[0_0_10px_rgba(20,184,166,0.8)]"></div>
          </div>
          <div>
            <h1 className="font-bold text-white text-base md:text-lg tracking-tight flex items-center gap-2">
              MedEye AI Receptionist
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">Live Triage</span>
            </h1>
            <p className="text-[11px] text-teal-200/80 font-mono">Thread ID: {getThreadId().substring(0, 8)}...</p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-teal-200 transition-all border border-white/10 shadow-sm"
          title="Reset Intake Session"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Intake</span>
        </button>
      </div>

      {/* Emergency Banner Callout */}
      {isEmergencyAlert && (
        <div className="bg-red-600 text-white px-6 py-2.5 flex items-center justify-between text-xs font-bold shadow-inner animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>CRITICAL TRIAGE FLAG DETECTED — Proceed directly to Emergency Bay or call 911 immediately.</span>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 custom-scrollbar bg-slate-50/60">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        
        {isTyping && (
          <div className="mt-4 flex justify-start animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-sm px-4 py-3 shadow-md flex items-center gap-2.5">
              <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
              <span className="text-slate-600 text-xs font-semibold tracking-wide">Evaluating symptoms & classifying ward...</span>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-200/50 overflow-x-auto custom-scrollbar flex items-center gap-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Presets:
        </span>
        {sampleChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip.text)}
            className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 px-3 py-1 rounded-full whitespace-nowrap transition-all shrink-0 shadow-2xs"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white/90 backdrop-blur-md border-t border-slate-200/60 z-10">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative flex items-center">
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-3.5 pl-6 pr-14 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/50 placeholder-slate-400 font-medium transition-all shadow-inner"
            placeholder="Describe your symptoms (e.g. My name is Alex, 35yo with severe fever...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-all disabled:opacity-50 disabled:hover:bg-teal-600 flex items-center justify-center h-9 w-9 shadow-md shadow-teal-600/30"
          >
            <Send size={16} className={input.trim() ? "translate-x-0.5" : ""} />
          </button>
        </form>
      </div>

    </div>
  );
}
