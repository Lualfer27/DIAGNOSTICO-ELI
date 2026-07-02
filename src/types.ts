export type WritingTarget =
  | 'amor_terminado'
  | 'trabajo_etapa'
  | 'version_pasado'
  | 'alguien_lastimo';

export type EmotionWord = 'Rabia' | 'Nostalgia' | 'Culpa' | 'Alivio' | 'Confusion';

export interface FormData {
  target: WritingTarget | null;
  emotion: EmotionWord | null;
}

export interface WritingResponses {
  phase1: string;
  phase2: string;
  phase3: string;
}

export interface AIResult {
  radiografia: string;
  fraseEspejo: string;
}

export const TARGET_OPTIONS: { value: WritingTarget; label: string }[] = [
  { value: 'amor_terminado', label: 'Un amor que terminó' },
  { value: 'trabajo_etapa', label: 'Un trabajo o etapa profesional que dejas' },
  { value: 'version_pasado', label: 'Una versión de mí mismo del pasado' },
  { value: 'alguien_lastimo', label: 'Alguien que me lastimó' },
];

export const EMOTION_OPTIONS: { value: EmotionWord; label: string }[] = [
  { value: 'Rabia', label: 'Rabia' },
  { value: 'Nostalgia', label: 'Nostalgia' },
  { value: 'Culpa', label: 'Culpa' },
  { value: 'Alivio', label: 'Alivio' },
  { value: 'Confusion', label: 'Confusión' },
];

// Helper to determine the prompt based on choice
export const getPromptsForTarget = (target: WritingTarget | null) => {
  if (target === 'amor_terminado' || target === 'alguien_lastimo') {
    return [
      'Lo que nunca te dije por miedo a romperlo todo fue que...',
      'A pesar de todo el enojo, lo que realmente extraño de esa etapa es...',
      'Hoy elijo llevarme como aprendizaje que...'
    ];
  } else if (target === 'trabajo_etapa') {
    return [
      'Lo que aguanté en silencio durante todo este tiempo por miedo a la incertidumbre fue...',
      'Me cuesta aceptar que invertí tanta energía en un lugar donde al final...',
      'Dejo atrás esta etapa porque entiendo que la versión de mí que se queda ahí...'
    ];
  } else if (target === 'version_pasado') {
    return [
      'Miro atrás a esa versión que fui y me duele ver cómo se permitía...',
      'Sé que en ese momento hacías lo que podías, pero hoy me cuesta perdonarte por...',
      'Hoy me abrazo a mí mismo y elijo prometerme que a partir de ahora...'
    ];
  }
  return ['', '', ''];
};
