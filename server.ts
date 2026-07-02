import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import firebaseConfig from './firebase-applet-config.json';

let ai: GoogleGenAI | null = null;
let db: Firestore | null = null;

function getDb() {
  if (!db) {
    if (process.env.VERCEL && !process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.warn("No Firebase credentials provided in Vercel. Database operations will be skipped.");
      return null;
    }
    
    let app;
    if (!getApps().length) {
      try {
        const config: any = { projectId: firebaseConfig.projectId };
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
          try {
            const cert = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            const { credential } = require('firebase-admin');
            config.credential = credential.cert(cert);
          } catch (e) {
            console.error("Error parsing FIREBASE_SERVICE_ACCOUNT", e);
          }
        }
        app = initializeApp(config);
      } catch (error) {
        console.error("Firebase Admin initialization error", error);
        throw new Error("Failed to initialize Firebase Admin");
      }
    } else {
      app = getApp();
    }
    // Access the specific named database dynamically
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
  return db;
}

function getAiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export const app = express();
app.use(express.json());

// API Route to process the therapeutic text
app.post('/api/process-desahogo', async (req, res) => {
    try {
      const { responses } = req.body;
      
      const prompt = `
Eres Eli. Actúas como un acompañante en el desarrollo personal. Odias las frases motivacionales vacías y el positivismo tóxico. No dices que "todo pasa por algo" ni que "si lo sueñas lo logras". Tu enfoque es el realismo sucio y la honestidad radical. Defiendes que estar mal no significa estar roto, que el dolor es información y que la incertidumbre es el precio inevitable del movimiento. No buscas solucionar la vida de esta persona ni darle respuestas mágicas; buscas sostener el espejo para que deje de mentirse.

Tu forma de hablar tiene una sintaxis corta y tajante. Frases breves que golpean por su crudeza (Ej: "No funciona así", "El cuerpo no sabe mentir", "El atajo es el camino largo"). Te gustan palabras como: fisuras, escombros, costo de identidad, quietud, ruido del mundo, la trampa de la nostalgia, el peso de las excusas. Tienes PROHIBIDO usar expresiones como "¡Ánimo!", "Todo va a estar bien", "Eres un guerrero/a", "Abraza la luz". Valida el dolor como prueba de que algo le importaba.

IMPORTANTE: Reúsa el cliché. Da un diagnóstico profundamente detallado y analítico basado EXACTAMENTE en las palabras que el usuario escribió. No des respuestas genéricas que apliquen a cualquiera. Busca el miedo subyacente, la excusa que se cuentan a sí mismos y el verdadero problema que están evitando. Si el usuario tuvo errores de ortografía en su texto, corrígelos inteligentemente en tu cabeza y NO repitas sus faltas de ortografía en el diagnóstico.

El usuario ha escrito sus pensamientos en tres fases. Aquí está su texto (si ves faltas de ortografía, asume lo que quisieron decir):
Fase 1: ${responses.phase1}
Fase 2: ${responses.phase2}
Fase 3: ${responses.phase3}

Debes responder estrictamente en el siguiente formato JSON, sin markdown, y sin ningún otro texto:
{
  "radiografia": "La radiografía de tu silencio. (Haz un diagnóstico amplio y exhaustivo. Estructúralo en párrafos. Primero, da un diagnóstico directo y crudo. Segundo, señala sus puntos ciegos o las cosas que debe mejorar/dejar de evitar. Tercero, dale acciones concretas, crudas y realistas que puede tomar, sin positivismo. Puedes escribir varios párrafos para que sea un texto largo y aportes muchísimo valor).",
  "fraseEspejo": "El efecto espejo. (No te limites a citar sus palabras. Crea una frase nueva, muy trabajada, profunda y contundente, derivada del núcleo de lo que acaba de escribir. Algo que tenga mucho valor añadido, como una sentencia implacable que resuma su verdad actual. Que no sea solo una copia de su texto)."
}
      `.trim();

      const aiClient = getAiClient();
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              radiografia: {
                type: "STRING",
                description: "La radiografía de tu silencio. Análisis profundo y honesto de su texto."
              },
              fraseEspejo: {
                type: "STRING",
                description: "La frase espejo. Extraída exactamente del texto o algo contundente."
              }
            },
            required: ["radiografia", "fraseEspejo"]
          }
        }
      });
      
      let responseText = response.text || "{}";
      console.log("Raw response text:", responseText);
      const jsonResponse = JSON.parse(responseText.trim());
      res.json(jsonResponse);
    } catch (error: any) {
      console.error("Error processing Gemini API call:", error);
      res.status(500).json({ error: error.message || "No pude procesar el mensaje." });
    }
  });

  app.post('/api/extended-diagnostic', async (req, res) => {
    try {
      const { responses } = req.body;
      const prompt = `
Eres Eli, la misma IA implacable y analítica con una voz cruda y poética. 
El usuario ha solicitado un plan detallado y un diagnóstico ampliado para su situación, basado en estos textos:
Fase 1: ${responses.phase1}
Fase 2: ${responses.phase2}
Fase 3: ${responses.phase3}

Debes generar un texto profundo y muy detallado, estructurado de la siguiente forma:
1. Un diagnóstico de los abismos (Un análisis súper profundo de sus miedos, sus excusas y su dolor, párrafo a párrafo).
2. El peso de la negación (Qué es lo que no están queriendo ver y cómo se están saboteando).
3. Plan de acción paso a paso (Un mapa de ruta con 5 pasos accionables, detallados, crudos y realistas para desarmar su situación actual).

Responde en formato JSON:
{
  "extendedDiagnostic": "Aquí va el texto completo estructurado con etiquetas HTML (<b>, <br>, <p>, <h3>, etc) para que se renderice excelente en un reporte. Que sea profundo y en la voz de Eli. Usa subtítulos y viñetas para cada parte dentro del mismo string o estructúralo para que se lea como un informe o carta."
}
      `.trim();

      const aiClient = getAiClient();
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              extendedDiagnostic: {
                type: "STRING",
                description: "Diagnóstico ampliado en formato HTML"
              }
            },
            required: ["extendedDiagnostic"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error('No text generated');
      
      let extendedDiagnostic;
      try {
        const parsed = JSON.parse(text);
        extendedDiagnostic = parsed.extendedDiagnostic;
      } catch (e) {
        // Fallback for markdown JSON fences
        const cleanedText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        extendedDiagnostic = JSON.parse(cleanedText).extendedDiagnostic;
      }
      
      res.json({ extendedDiagnostic });
    } catch (error) {
      console.error('Error generating extended diagnostic:', error);
      res.status(500).json({ error: 'Error al generar el plan extendido' });
    }
  });

  app.post('/api/register-email', async (req, res) => {
    try {
      const { email } = req.body;
      console.log("Email registrado para backend:", email);
      
      const firestoreDb = getDb();
      if (!firestoreDb || !process.env.FIREBASE_SERVICE_ACCOUNT) {
        return res.json({ success: true, message: "Modo sin base de datos (faltan credenciales).", id: "mock-id" });
      }
      
      const docRefPromise = firestoreDb.collection('leads').add({
        email,
        createdAt: FieldValue.serverTimestamp()
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Firestore timeout")), 3000)
      );

      const docRef: any = await Promise.race([docRefPromise, timeoutPromise]);
      
      res.json({ success: true, message: "Correo registrado con éxito en Firebase.", id: docRef.id });
    } catch (error: any) {
      console.error("Error saving lead to Firebase:", error);
      // We return success anyway so it doesn't block the frontend
      res.json({ success: true, message: "Modo sin base de datos (fallback por error)", error: error.message });
    }
  });

async function startServer() {
  const PORT = 3000;
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}
