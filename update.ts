import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `      if (!firestoreDb) {
        return res.json({ success: true, message: "Modo sin base de datos (Vercel sin credenciales).", id: "mock-id" });
      }`,
  `      if (!firestoreDb || !process.env.FIREBASE_SERVICE_ACCOUNT) {
        return res.json({ success: true, message: "Modo sin base de datos (faltan credenciales).", id: "mock-id" });
      }`
);

fs.writeFileSync('server.ts', code);
