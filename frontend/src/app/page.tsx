import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary-200/30 rounded-full blur-3xl pointer-events-none" />
      
      <div className="z-10 text-center max-w-2xl px-4">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden relative">
            <img src="/logo.jpeg" alt="Klyro" className="w-full h-full object-cover" />
          </div>
        </div>
        
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
          Enterprise Brand Intelligence
        </h1>
        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
          Centralize your brand identity, govern AI-generated content, and simulate the long-term impact of marketing decisions.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="btn-primary text-lg px-8 py-3 flex items-center justify-center gap-2">
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/onboarding" className="btn-secondary text-lg px-8 py-3">
            View Onboarding Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
