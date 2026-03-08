// Run this with Node.js to generate simple placeholder PWA icons
// Or use a real icon generator with your custom artwork
const fs = require('fs')

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#0ea3dc"/>
  <text x="256" y="320" font-size="280" text-anchor="middle" fill="white" font-family="Arial">🌊</text>
  <text x="256" y="420" font-size="60" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold">Skibidi</text>
</svg>`

fs.writeFileSync('icon.svg', svgIcon)
console.log('Generated icon.svg — convert to PNG using your preferred tool')
