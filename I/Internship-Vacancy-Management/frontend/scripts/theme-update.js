const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, '../src');

const replacements = [
  { from: /\bbg-white\b/g, to: 'bg-dark-card' },
  { from: /\bbg-gray-50\b/g, to: 'bg-dark-base' },
  { from: /\bbg-gray-100\b/g, to: 'bg-dark-base' },
  { from: /\bbg-gray-200\b/g, to: 'bg-dark-card' },
  { from: /\btext-gray-900\b/g, to: 'text-white' },
  { from: /\btext-gray-800\b/g, to: 'text-slate-100' },
  { from: /\btext-gray-700\b/g, to: 'text-slate-200' },
  { from: /\btext-gray-600\b/g, to: 'text-slate-300' },
  { from: /\btext-gray-500\b/g, to: 'text-slate-400' },
  { from: /\btext-gray-400\b/g, to: 'text-slate-500' },
  { from: /\btext-black\b/g, to: 'text-white' },
  { from: /\bborder-gray-200\b/g, to: 'border-dark-border' },
  { from: /\bborder-gray-300\b/g, to: 'border-dark-border' },
];

function processDirectory(directory) {
  if (!fs.existsSync(directory)) return;
  
  fs.readdirSync(directory).forEach(file => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      replacements.forEach(({ from, to }) => {
        if (from.test(content)) {
          content = content.replace(from, to);
          modified = true;
        }
      });
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
}

processDirectory(dirPath);
console.log('Theme update complete!');
