import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

// revert the bad injection
code = code.replace(/      let response;\n      let retries = 3;\n      while \(retries > 0\) {\n        try {\n          response = await aiClient.models.generateContent\(\{/g, '      const response = await aiClient.models.generateContent({');

fs.writeFileSync('server.ts', code);
