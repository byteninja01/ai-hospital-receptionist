import React from 'react';
import ChatBox from '../components/ChatBox';
import Navbar from '../components/Navbar';
import { Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 relative overflow-x-hidden font-sans">
      <Navbar />
      
      {/* Background Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-teal-50/50 to-transparent pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-start relative z-10">
        
        {/* Hero Copy */}
        <div className="flex-1 text-center lg:text-left space-y-8 lg:mt-12 lg:pr-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100/50 border border-teal-200/50 text-teal-800 text-sm font-semibold tracking-wide shadow-sm">
            <Activity size={16} className="text-teal-600" /> Welcome to MedEye
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500">
              Healthcare
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
            Experiencing symptoms? Talk to our intelligent medical receptionist. We'll listen, understand your condition, and guide you to the right care immediately.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-full font-medium text-lg transition-all shadow-lg shadow-teal-600/20 w-full sm:w-auto">
              Start Consultation
            </button>
            <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-full font-medium text-lg transition-all w-full sm:w-auto">
              Learn More
            </button>
          </div>
          
          {/* Trust indicators */}
          <div className="pt-8 border-t border-slate-200/60 mt-8 flex items-center justify-center lg:justify-start gap-8 opacity-70">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-800">24/7</span>
              <span className="text-sm text-slate-500 font-medium">Availability</span>
            </div>
            <div className="w-px h-10 bg-slate-300"></div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-800">100%</span>
              <span className="text-sm text-slate-500 font-medium">Secure & Private</span>
            </div>
          </div>
        </div>

        {/* Chat UI Container */}
        <div className="w-full flex-1 max-w-2xl relative">
          {/* Decorative backdrop for chat */}
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-100 to-cyan-50 rounded-[2.5rem] transform rotate-3 scale-105 opacity-50 z-0 border border-teal-200/30"></div>
          
          <div className="relative z-10 w-full">
            <ChatBox />
          </div>
        </div>

      </main>
    </div>
  );
}
