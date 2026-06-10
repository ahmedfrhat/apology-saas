import fs from 'fs';
import path from 'path';

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = getFiles('src/components');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  let modified = content.replace(/<(input|textarea)([\s\S]*?)>/gi, (match, tag, inner) => {
    return `<${tag}${inner.replace(/\btext-sm\b/g, 'text-base').replace(/\btext-xs\b/g, 'text-base')}>`;
  });

  if (content !== modified) {
    fs.writeFileSync(file, modified);
    console.log(`Updated ${file}`);
  }
});
