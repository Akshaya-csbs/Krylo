"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, UploadCloud, ArrowRight, ArrowLeft } from "lucide-react";

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const handleNext = () => setStep((s) => Math.min(s + 1, totalSteps));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));
  const handleComplete = () => router.push("/dashboard");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-10 pb-20 px-4 sm:px-6">
      <div className="max-w-3xl w-full mx-auto">
        
        {/* Header & Progress */}
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center overflow-hidden relative shadow-sm">
              <img src="/logo.jpeg" alt="Klyro" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Configure Your Brand</h1>
          <p className="mt-2 text-slate-500">Train the Klyro AI on your brand identity</p>
        </div>

        <div className="mb-12 relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-200">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
            ></motion.div>
          </div>
          <div className="flex justify-between text-xs font-medium text-slate-500 px-1">
            <span>Basic Info</span>
            <span>Identity</span>
            <span>Voice</span>
            <span>Assets</span>
            <span>Review</span>
          </div>
        </div>

        {/* Wizard Content */}
        <div className="glass-card p-6 sm:p-10 relative overflow-hidden min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {step === 1 && <StepOne />}
              {step === 2 && <StepTwo />}
              {step === 3 && <StepThree />}
              {step === 4 && <StepFour />}
              {step === 5 && <StepFive />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
            <button 
              onClick={handlePrev} 
              className={`btn-secondary flex items-center gap-2 ${step === 1 ? 'invisible' : ''}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {step < totalSteps ? (
              <button onClick={handleNext} className="btn-primary flex items-center gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleComplete} className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700">
                Complete Setup <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Wizard Steps Components

function StepOne() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Basic Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name</label>
          <input type="text" className="input-field" placeholder="Acme Corp" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
          <input type="text" className="input-field" placeholder="E-commerce" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Website URL</label>
          <input type="url" className="input-field" placeholder="https://acmecorp.com" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
          <input type="text" className="input-field" placeholder="e.g., Millennials interested in sustainable fashion" />
        </div>
      </div>
    </div>
  );
}

function StepTwo() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Visual Identity</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Upload Logos</label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
            <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600">Drag & drop your SVG or PNG logos here</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Primary Colors</label>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 shadow-inner cursor-pointer border-2 border-white ring-2 ring-slate-200"></div>
              <div className="w-10 h-10 rounded-full bg-slate-900 shadow-inner cursor-pointer border-2 border-white ring-2 ring-slate-200"></div>
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer">+</div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Typography</label>
            <select className="input-field">
              <option>Inter / System Sans</option>
              <option>Roboto / Open Sans</option>
              <option>Playfair / Merriweather</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepThree() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Verbal Identity & Voice</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Brand Mission</label>
          <textarea className="input-field min-h-[80px]" placeholder="What is your brand trying to achieve in the world?"></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tone of Voice</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            {['Professional', 'Playful', 'Authoritative', 'Empathetic'].map(tone => (
              <div key={tone} className="border border-slate-200 rounded-lg p-3 text-center text-sm font-medium text-slate-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 cursor-pointer transition-colors">
                {tone}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepFour() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Historical Assets</h2>
      <p className="text-sm text-slate-600">Upload past successful campaigns, guidelines, or social posts for the AI to learn from.</p>
      
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition-colors cursor-pointer bg-slate-50/50">
        <UploadCloud className="w-10 h-10 text-primary-500 mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-700">Click to upload or drag & drop</p>
        <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG, or MP4 (Max 50MB)</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-6">
        {/* Placeholder for uploaded assets */}
        <div className="aspect-square bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
          <span className="text-xs text-slate-400">Preview 1</span>
        </div>
        <div className="aspect-square bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
          <span className="text-xs text-slate-400">Preview 2</span>
        </div>
      </div>
    </div>
  );
}

function StepFive() {
  return (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800">You're All Set!</h2>
      <p className="text-slate-600 max-w-md mx-auto">
        Klyro AI is now processing your inputs to construct a comprehensive Living Brand Identity model. 
      </p>
      <div className="bg-slate-50 rounded-xl p-6 text-left max-w-md mx-auto mt-8 border border-slate-100 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4">What happens next?</h3>
        <ul className="space-y-3 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary-500 mt-0.5" /> 
            <span>AI will analyze your historical assets to detect visual patterns.</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary-500 mt-0.5" /> 
            <span>Verbal identity and tone will be mapped to a neural semantic space.</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-primary-500 mt-0.5" /> 
            <span>Your dashboard will be populated with initial health scores.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
