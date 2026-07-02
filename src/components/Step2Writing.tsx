import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WritingResponses, getPromptsForTarget, WritingTarget } from '../types';

interface Step2WritingProps {
  key?: string;
  target: WritingTarget;
  responses: WritingResponses;
  setResponses: React.Dispatch<React.SetStateAction<WritingResponses>>;
  onComplete: () => void;
  isProcessing: boolean;
}

export function Step2Writing({ target, responses, setResponses, onComplete, isProcessing }: Step2WritingProps) {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3>(1);
  const prompts = getPromptsForTarget(target);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto focus textarea when phase changes
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activePhase]);

  const canAdvance = (phase: 1 | 2 | 3) => {
    if (phase === 1) return responses.phase1.trim().length > 10;
    if (phase === 2) return responses.phase2.trim().length > 10;
    if (phase === 3) return responses.phase3.trim().length > 10;
    return false;
  };

  const handleNextPhase = () => {
    if (activePhase < 3) {
      setActivePhase((prev) => (prev + 1) as 1 | 2 | 3);
    } else {
      onComplete();
    }
  };

  const phaseLabels = ['Fase 1: Tensión', 'Fase 2: Vulnerabilidad', 'Fase 3: Integración'];
  const currentPrompt = prompts[activePhase - 1];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto w-full"
    >
      <div className="flex items-center justify-between mb-8 opacity-60">
        <div className="flex gap-2">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`h-1 w-12 rounded-full transition-all duration-500 ${
                activePhase >= num ? 'bg-stone-800' : 'bg-stone-300'
              }`}
            />
          ))}
        </div>
        <span className="font-serif text-sm text-stone-600">
          {phaseLabels[activePhase - 1]}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activePhase}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 overflow-hidden flex flex-col min-h-[500px]"
        >
          <div className="p-8 pb-4 flex-grow flex flex-col">
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-stone-800 mb-6 leading-relaxed">
              «{currentPrompt}»
            </h2>
            <textarea
              ref={textareaRef}
              value={responses[`phase${activePhase}` as keyof WritingResponses]}
              onChange={(e) =>
                setResponses((prev) => ({
                  ...prev,
                  [`phase${activePhase}`]: e.target.value,
                }))
              }
              placeholder="Sigue escribiendo aquí..."
              className="flex-grow w-full bg-transparent resize-none focus:outline-none font-sans text-stone-700 text-lg md:text-xl leading-relaxed placeholder:text-stone-300 selection:bg-stone-200"
            />
          </div>
          
          <div className="p-6 bg-stone-50/50 border-t border-stone-100 flex justify-between items-center">
            <div className="text-xs text-stone-400 font-sans max-w-[200px]">
              Tómate tu tiempo. El silencio también escribe.
            </div>
            <button
              onClick={handleNextPhase}
              disabled={!canAdvance(activePhase) || isProcessing}
              className={`px-8 py-3 rounded-full font-sans font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                canAdvance(activePhase) && !isProcessing
                  ? 'bg-stone-900 text-white shadow-lg hover:bg-stone-800 hover:scale-105'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? 'Procesando...' : (activePhase === 3 ? 'Procesar mi desahogo' : 'Continuar')}
              {!isProcessing && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
