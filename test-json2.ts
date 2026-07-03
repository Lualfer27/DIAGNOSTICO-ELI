import fs from 'fs';
import path from 'path';
const configContent = fs.readFileSync(path.resolve('./firebase-applet-config.json'), 'utf-8');
const firebaseConfig = JSON.parse(configContent);
console.log(firebaseConfig.projectId);
