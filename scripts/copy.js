import fs from 'node:fs';

const mail = 'https://github.com/1pizzateam/RoostR.js';
const CRLF = '\r\n';
const dest = './dist/';
const license = fs.readFileSync('./LICENSE');
const header = `/*${CRLF}${license}${CRLF}${mail}${CRLF}*/${CRLF}${CRLF}`;

const files = [
  ['./build/roostr.mjs', `${dest}roostr.js`],
  ['./build/roostr.d.mts', `${dest}roostr.d.ts`],
];

fs.mkdirSync(dest, { recursive: true });
for (const [src, out] of files)
  fs.writeFileSync(out, header + fs.readFileSync(src));
