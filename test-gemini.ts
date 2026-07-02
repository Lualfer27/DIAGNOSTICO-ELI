import { GoogleGenAI } from '@google/genai';
async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'hi' });
    console.log("Success 2.5");
  } catch (e) {
    console.error(e);
  }
}
run();
