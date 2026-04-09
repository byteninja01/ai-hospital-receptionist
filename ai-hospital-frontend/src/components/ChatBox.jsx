import React, { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import { sendMessageToAPI } from "../services/api";
import { Send, Loader2 } from "lucide-react";

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I am MedEye Assistant, the AI Hospital Receptionist. How can I help you today? Please tell me about your symptoms.", 
      sender: "ai" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await sendMessageToAPI({ patient_query: input });
      
      const aiResponse = res.data;
      
      setMessages(prev => [
        ...prev,
        { 
          text: typeof aiResponse === 'string' ? aiResponse : aiResponse.message || "Understood.", 
          sender: "ai",
          patientData: aiResponse.patient || null
        }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { text: "Sorry, I couldn't connect to the server. Please try again.", sender: "ai" }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[85vh] w-full max-w-3xl mx-auto bg-slate-50 border border-slate-200 rounded-3xl shadow-xl overflow-hidden relative">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          <h1 className="font-bold text-slate-800 text-lg">MedEye AI Receptionist</h1>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 custom-scrollbar bg-slate-50/50">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        
        {isTyping && (
          <div className="mt-4 flex justify-start animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
              <span className="text-slate-500 text-sm font-medium">Analyzing symptoms...</span>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 z-10">
        <form onSubmit={sendMessage} className="relative flex items-center">
          <input
            className="w-full bg-slate-100 border-none rounded-full py-4 pl-6 pr-14 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-400 font-medium transition-all"
            placeholder="E.g., I have severe chest pain..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center justify-center h-10 w-10 shadow-md"
          >
            <Send size={18} className={input.trim() ? "translate-x-0.5" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}
