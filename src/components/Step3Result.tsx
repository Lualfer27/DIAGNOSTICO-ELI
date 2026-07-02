import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AIResult, WritingResponses, getPromptsForTarget, WritingTarget } from '../types';
import eliImage from '../assets/images/PERFIL_ELI.png';

const downloadPdfFromElement = async (elementOrHtml: HTMLElement | string, filename: string) => {
  let targetElement: HTMLElement;
  let cleanup = false;
  
  if (typeof elementOrHtml === 'string') {
    targetElement = document.createElement('div');
    targetElement.innerHTML = elementOrHtml;
    targetElement.style.position = 'absolute';
    targetElement.style.left = '-9999px';
    targetElement.style.top = '0';
    targetElement.style.width = '800px';
    document.body.appendChild(targetElement);
    cleanup = true;
  } else {
    targetElement = elementOrHtml;
  }

  try {
    const canvas = await html2canvas(targetElement, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    
    // A4 dimensions
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(filename);
  } catch(e) {
    console.error("error generating pdf", e);
  } finally {
    if (cleanup) {
      document.body.removeChild(targetElement);
    }
  }
};

interface Step3ResultProps {
  key?: string;
  aiOutput: AIResult;
  responses: WritingResponses;
  target: WritingTarget;
}

export function Step3Result({ aiOutput, responses, target }: Step3ResultProps) {
  const [timeLeft, setTimeLeft] = useState(300);
  const pdfRef = useRef<HTMLDivElement>(null);
  const extendedPdfRef = useRef<HTMLDivElement>(null);
  const prompts = getPromptsForTarget(target);
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extendedStatus, setExtendedStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [extendedDiagnostic, setExtendedDiagnostic] = useState<string>('');

  useEffect(() => {
    if (timeLeft <= 0) {
      window.location.reload();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    await downloadPdfFromElement(pdfRef.current, 'radiografia_silencio.pdf');
  };

  const handleGetExtendedPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!email) return;

    setIsSubmitting(true);
    setExtendedStatus('loading');

    try {
      // 1. Register email
      await fetch('/api/register-email', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email })
      });

      // 2. Generate extended diagnostic
      const res = await fetch('/api/extended-diagnostic', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ responses })
      });

      if (!res.ok) throw new Error("Failed to generate extended diagnostic");
      
      const data = await res.json();
      setExtendedDiagnostic(data.extendedDiagnostic);
      setExtendedStatus('success');

      // Allow state to update and render the hidden PDF template
      setTimeout(() => {
        if (!extendedPdfRef.current) return;
        downloadPdfFromElement(extendedPdfRef.current, 'plan_liberacion_eli.pdf');
      }, 1000);

    } catch(err) {
      console.error(err);
      setExtendedStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto w-full pb-20"
    >
      <div className="flex justify-between items-center mb-8 relative z-10 no-print">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-full font-sans text-sm font-medium hover:bg-stone-800 transition-all shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Descargar Carta
        </button>
        <div className="text-stone-500 font-sans text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span className="font-mono text-stone-700 bg-stone-200/50 px-2 rounded">{timeLeft}s</span> para borrado irreversible
        </div>
      </div>

      <div ref={pdfRef} className="bg-[#fcfbf9] rounded-2xl shadow-2xl p-10 md:p-14 border border-stone-200 text-stone-800 pdf-container relative overflow-hidden">
        
        {/* PDF Document Styling Wrapper */}
        <div className="absolute top-0 left-0 w-full h-2 bg-stone-900"></div>

        <div className="mb-12">
           <h3 className="font-serif text-lg text-stone-400 italic mb-6">Tu texto original:</h3>
           
           <div className="space-y-6 font-serif text-stone-700 leading-relaxed text-lg border-l-2 border-stone-200 pl-6">
              <p><span className="font-semibold text-stone-900">{prompts[0]}</span> {responses.phase1}</p>
              <p><span className="font-semibold text-stone-900">{prompts[1]}</span> {responses.phase2}</p>
              <p><span className="font-semibold text-stone-900">{prompts[2]}</span> {responses.phase3}</p>
           </div>
        </div>

        <div className="divider h-px w-full bg-stone-200 my-12"></div>

        <div className="space-y-12">
          <div>
            <h2 className="font-serif text-2xl text-stone-900 mb-6 flex items-center gap-4">
               <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-stone-200 shrink-0">
                 <img 
                    src={eliImage} 
                    alt="Eli" 
                    className="w-full h-full object-cover object-top"
                 />
               </div>
               La Radiografía de tu Silencio
            </h2>
            <div className="font-sans text-stone-600 leading-relaxed text-lg whitespace-pre-wrap">
              {aiOutput.radiografia}
            </div>
          </div>

          <div className="mt-12 bg-stone-900 text-stone-50 p-10 rounded-xl shadow-inner text-center">
            <h3 className="font-sans tracking-widest text-xs uppercase text-stone-400 mb-6">El Efecto Espejo</h3>
            <p className="font-serif text-xl md:text-2xl italic leading-relaxed">
              «{aiOutput.fraseEspejo}»
            </p>
            <div className="mt-6 text-sm text-stone-400 font-sans">
              Esta es tu verdad más grande de hoy.
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center pt-8 border-t border-stone-100 no-print">
          <p className="font-sans text-xs text-stone-400">
            «Por tu total privacidad, al cerrar esta ventana o pasados 5 minutos, todo el texto ingresado se borrará permanentemente de forma segura. No almacenamos tus datos.»
          </p>
        </div>
      </div>

      {/* PLAN EXTENDIDO SECTION */}
      <div className="mt-12 bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-stone-200 no-print mx-auto">
        <h3 className="font-serif text-2xl text-stone-900 mb-4 text-center">Una luz en la grieta</h3>
        <p className="font-sans text-stone-600 text-center mb-8 max-w-2xl mx-auto leading-relaxed">
          «Si quieres un diagnóstico ampliado y un plan de pasos a seguir para que encuentres una luz en tu camino y te liberes en este proceso, déjame aquí tu correo y prepararé tu mapa de ruta en un PDF detallado de inmediato.»
        </p>
        
        {extendedStatus === 'idle' || extendedStatus === 'error' ? (
          <form onSubmit={handleGetExtendedPlan} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu mejor correo..."
              className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg font-sans outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all"
            />
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-stone-900 text-white rounded-lg font-sans font-medium hover:bg-stone-800 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {isSubmitting ? 'Preparando...' : 'Obtener mi plan'}
            </button>
          </form>
        ) : extendedStatus === 'loading' ? (
          <div className="text-center font-sans text-stone-500 animate-pulse">
            <svg className="w-6 h-6 mx-auto mb-3 animate-spin text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Analizando tus abismos. Escribiendo el plan...
          </div>
        ) : (
          <div className="text-center font-sans flex flex-col items-center justify-center text-green-700 bg-green-50 p-8 rounded-lg border border-green-100">
            <div className="font-semibold text-xl mb-3 text-green-800">Plan generado con éxito</div>
            <p className="text-sm text-green-700 mb-6 max-w-md">
              Tu diagnóstico está listo. Se descarga automáticamente como PDF en tu dispositivo, pero si tu navegador lo bloqueó, presiona el botón inferior.
            </p>
            <button 
              onClick={() => {
                if (!extendedPdfRef.current) return;
                downloadPdfFromElement(extendedPdfRef.current, 'plan_liberacion_eli.pdf');
              }}
              className="px-6 py-3 bg-green-700 text-white rounded-lg font-sans font-medium hover:bg-green-800 transition-all shadow-sm"
            >
              Descargar PDF Ahora
            </button>
          </div>
        )}
        
        {extendedStatus === 'error' && (
          <p className="text-red-500 text-sm text-center mt-4">Hubo un error al generar tu plan. Intenta nuevamente.</p>
        )}
      </div>

      {/* HIDDEN INVISIBLE PDF EXPORT CONTAINER FOR EXTENDED PLAN */}
      <div className="absolute opacity-0 pointer-events-none -z-50" style={{ left: '-9999px', top: 0, width: '800px' }}>
        <div ref={extendedPdfRef} className="pdf-extended-container p-14 bg-[#fcfbf9] text-stone-800">
           <div className="flex items-center gap-4 border-b border-stone-200 pb-8 mb-8">
             <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-stone-200">
               <img src={eliImage} className="w-full h-full object-cover object-top" alt="Eli" />
             </div>
             <div>
               <h1 className="font-serif text-3xl text-stone-900">Plan de Liberación</h1>
               <p className="lowercase tracking-widest text-stone-400 text-xs mt-1">CONFIDENCIAL // GENERADO POR ELI</p>
             </div>
           </div>
           
           <div 
              className="max-w-none font-sans leading-relaxed text-lg [&>p]:mb-6 [&>h3]:text-2xl [&>h3]:font-serif [&>h3]:mb-4 [&>h3]:mt-8 [&>h3]:text-stone-900 [&>ul]:list-decimal [&>ul]:pl-6 [&>ul]:mb-6 [&>li]:mb-2 [&>b]:font-semibold [&>b]:text-stone-900"
              dangerouslySetInnerHTML={{ __html: extendedDiagnostic }} 
           />
           
           <div className="mt-16 pt-8 border-t border-stone-200 text-center font-serif italic text-stone-500">
             El atajo es el camino largo. Empieza hoy.
           </div>
        </div>
      </div>

    </motion.div>
  );
}
