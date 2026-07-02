/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Step1Form } from './components/Step1Form';
import { Step2Writing } from './components/Step2Writing';
import { Step3Result } from './components/Step3Result';
import { FormData, WritingResponses, AIResult, WritingTarget } from './types';

export default function App() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    target: null,
    emotion: null,
  });

  const [responses, setResponses] = useState<WritingResponses>({
    phase1: '',
    phase2: '',
    phase3: '',
  });

  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processDesahogo = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/process-desahogo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, formData })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Fallo en la comunicación");
      }
      
      const data = await res.json();
      setAiResult(data);
      setStep(3);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Error: ${err.message || "Lo siento, hubo un error procesando tus palabras. Por favor intenta de nuevo."}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 flex flex-col items-center justify-center pt-24 pb-24">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <Step1Form 
            key="step1"
            formData={formData} 
            setFormData={setFormData} 
            onNext={() => setStep(2)} 
          />
        )}
        {step === 2 && formData.target && (
          <div key="step2" className="w-full flex flex-col items-center">
            <Step2Writing
              target={formData.target as WritingTarget}
              responses={responses}
              setResponses={setResponses}
              onComplete={processDesahogo}
              isProcessing={isProcessing}
            />
            {errorMsg && (
              <div className="mt-4 p-4 max-w-xl mx-auto rounded-xl bg-red-50 text-red-700 font-sans text-sm text-center border border-red-200">
                {errorMsg}
              </div>
            )}
          </div>
        )}
        {step === 3 && aiResult && formData.target && (
          <Step3Result
            key="step3"
            aiOutput={aiResult}
            responses={responses}
            target={formData.target as WritingTarget}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
