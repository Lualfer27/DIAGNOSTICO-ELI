import fs from 'fs';

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
appTsx = appTsx.replace(
  `throw new Error(errorData.error || "Fallo en la comunicación");`,
  `throw new Error(errorData.error || \`Error del servidor: \${res.status} \${res.statusText}\`);`
);
fs.writeFileSync('src/App.tsx', appTsx);

let step3Tsx = fs.readFileSync('src/components/Step3Result.tsx', 'utf8');
step3Tsx = step3Tsx.replace(
  `throw new Error("Failed to generate extended diagnostic");`,
  `throw new Error(\`Failed to generate extended diagnostic: \${res.status} \${res.statusText}\`);`
);
fs.writeFileSync('src/components/Step3Result.tsx', step3Tsx);
