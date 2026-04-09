import React from 'react';
import ChatBox from '../components/ChatBox';
import { ShieldPlus } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
      
      {/* Background Decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-12 items-center lg:items-start relative z-10">
        
        {/* Hero Copy */}
        <div className="flex-1 text-center lg:text-left space-y-6 lg:mt-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 border border-blue-200 text-blue-800 text-sm font-semibold mb-4">
            <ShieldPlus size={16} /> Beta v1.0
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
            AI-Powered <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
              Hospital Triage
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Experience the future of medical reception. Describe your symptoms naturally, and our AI will automatically classify conditions, extract vital details, and organize data securely.
          </p>
        </div>

        {/* Chat UI */}
        <div className="w-full flex-1 max-w-3xl">
          <ChatBox />
        </div>

      </div>
    </div>
  );
}
