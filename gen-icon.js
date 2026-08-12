const sharp = require('sharp');
const fs = require('fs');

const svgStr = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="18" y="17" width="45" height="65" rx="6" fill="rgba(0,0,0,0.3)" transform="rotate(-15 42.5 47.5)"/>
  <rect x="20" y="15" width="45" height="65" rx="6" fill="#151515" stroke="#ffffff" stroke-width="3" transform="rotate(-15 42.5 47.5)" />
  
  <rect x="38" y="27" width="45" height="65" rx="6" fill="rgba(0,0,0,0.4)" transform="rotate(10 62.5 57.5)"/>
  <rect x="40" y="25" width="45" height="65" rx="6" fill="#ffffff" stroke="#151515" stroke-width="3" transform="rotate(10 62.5 57.5)" />
</svg>`;

async function main() {
    await sharp(Buffer.from(svgStr))
        .resize(512, 512)
        .png()
        .toFile('public/favicon.png');
    console.log("Icon generated!");
}

main().catch(console.error);
