const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, '../src');

function processDirectory(directory) {
  if (!fs.existsSync(directory)) return;
  
  fs.readdirSync(directory).forEach(file => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Make inputs use slate-50, text-gray-900, slate-300 border, and better padding
      content = content.replace(/<(input|select|textarea)([\s\S]*?)>/g, (match, tag, classes) => {
          let originalClasses = classes;
          classes = classes.replace(/text-white/g, "text-gray-900");
          classes = classes.replace(/text-slate-200/g, "text-gray-900");
          classes = classes.replace(/border-dark-border/g, "border-slate-300");
          classes = classes.replace(/bg-dark-base/g, "bg-slate-50");
          classes = classes.replace(/bg-white/g, "bg-slate-50");
          
          if (classes !== originalClasses) {
              modified = true;
          }
          return `<${tag}${classes}>`;
      });

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated form styles off-white in: ${fullPath}`);
      }
    }
  });
}

processDirectory(dirPath);
console.log('Form inputs updated to off-white mode!');
