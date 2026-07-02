import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  "import { initializeApp, getApps, getApp } from 'firebase-admin/app';",
  "import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';"
);
code = code.replace(
  "const { credential } = require('firebase-admin');",
  ""
);
code = code.replace(
  "config.credential = credential.cert(certData);", // wait, what was it?
  "" // wait, I'll use sed instead.
);
