import React from 'react';
import { motion } from 'motion/react';
import { TARGET_OPTIONS, EMOTION_OPTIONS, FormData, EmotionWord, WritingTarget } from '../types';
import eliImage from '../assets/images/PERFIL_ELI.png';

interface Step1FormProps {
  key?: string;
  formData: FormData;
  setFormData: (data: FormData) => void;
  onNext: () => void;
}

export function Step1Form({ formData, setFormData, onNext }: Step1FormProps) {
  const isComplete = formData.target && formData.emotion;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto w-full backdrop-blur-md bg-white/80 rounded-2xl shadow-xl p-8 border border-white/50"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="w-28 h-28 bg-stone-200 mb-5 overflow-hidden morphing-blob grayscale-[50%] hover:grayscale-0 hover:shadow-2xl transition-all duration-700 ease-in-out border-[3px] border-white shadow-xl relative cursor-pointer group">
          <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <img 
            src={eliImage} 
            alt="Eli" 
            className="w-full h-full object-cover object-top scale-105 group-hover:scale-100 transition-transform duration-700"
          />
        </div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-center text-stone-800">
          El Desahogo Guiado
        </h1>
        <p className="text-sm font-sans text-stone-500 mt-2 text-center max-w-sm">
          Un espacio seguro para sostener el espejo, porque el atajo es el camino largo.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block font-serif text-lg text-stone-700 mb-4">
            ¿A quién o qué le vas a escribir hoy?
          </label>
          <div className="grid gap-3">
            {TARGET_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, target: option.value as WritingTarget })}
                className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-300 font-sans tracking-wide text-sm ${
                  formData.target === option.value
                    ? 'bg-stone-800 text-stone-50 border-stone-800 shadow-md'
                    : 'bg-white/50 text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: formData.target ? 1 : 0, height: formData.target ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <label className="block font-serif text-lg text-stone-700 mb-4 mt-2">
            Si tuvieras que resumir lo que sientes en este segundo con una palabra, ¿cuál sería?
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOTION_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, emotion: option.value as EmotionWord })}
                className={`px-4 py-2 rounded-full border text-sm transition-all duration-300 font-sans ${
                  formData.emotion === option.value
                    ? 'bg-stone-800 text-stone-50 border-stone-800'
                    : 'bg-white/50 text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="pt-6 flex justify-end">
          <button
            onClick={onNext}
            disabled={!isComplete}
            className={`px-8 py-3 rounded-full font-sans font-medium text-sm transition-all duration-500 flex items-center gap-2 ${
              isComplete
                ? 'bg-stone-900 text-white shadow-lg hover:bg-stone-800 hover:scale-105'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            Comenzar el proceso
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
