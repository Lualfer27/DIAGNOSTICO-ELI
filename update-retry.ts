import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

// Helper function to replace the API call with a retry loop
function addRetry(routeContent: string) {
  const originalCall = `      const response = await aiClient.models.generateContent({`;
  const retryLogic = `      let response;
      let retries = 3;
      while (retries > 0) {
        try {
          response = await aiClient.models.generateContent({`;
  
  const originalEnd = `      const responseText = response.text;`;
  const retryLogicEnd = `          break; // success
        } catch (e: any) {
          retries--;
          if (retries === 0 || e.status === 429 || (e.status >= 400 && e.status < 500 && e.status !== 429)) {
            throw e; // if no retries left or client error, throw immediately
          }
          console.warn("Gemini API call failed, retrying...", e.message);
          await new Promise(res => setTimeout(res, 2000)); // wait 2s
        }
      }
      if (!response) throw new Error("Failed to get response");
      const responseText = response.text;`;

  return routeContent
    .replace(originalCall, retryLogic)
    .replace(originalEnd, retryLogicEnd);
}

code = addRetry(code);

fs.writeFileSync('server.ts', code);
