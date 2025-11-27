import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '../dist');

// Recursively find all .js files
function findJsFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      findJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function resolveImportPath(baseFile, importPath) {
  const baseDir = dirname(baseFile);
  const fullPath = join(baseDir, importPath);
  
  // Check if it's a directory with index.js
  if (existsSync(fullPath) && statSync(fullPath).isDirectory()) {
    const indexPath = join(fullPath, 'index.js');
    if (existsSync(indexPath)) {
      // Return path with /index.js
      return importPath + '/index.js';
    }
  }
  
  // Check if it's a file (with or without .js extension)
  if (existsSync(fullPath + '.js')) {
    return importPath + '.js';
  }
  
  // Default: add .js extension
  return importPath + '.js';
}

const files = findJsFiles(distDir);

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  let modified = false;
  
  // Match relative imports (./ or ../) without .js or .json extension
  const importRegex = /from\s+['"](\.\.?\/[^'"]+?)['"]/g;
  
  content = content.replace(importRegex, (match, importPath) => {
    // Skip if already has .js, .json, or is a node_modules import
    if (importPath.endsWith('.js') || importPath.endsWith('.json') || importPath.startsWith('node_modules')) {
      return match;
    }
    modified = true;
    const resolvedPath = resolveImportPath(file, importPath);
    return match.replace(importPath, resolvedPath);
  });
  
  // Also handle import() dynamic imports
  const dynamicImportRegex = /import\s*\(\s*['"](\.\.?\/[^'"]+?)['"]\s*\)/g;
  content = content.replace(dynamicImportRegex, (match, importPath) => {
    // Skip if already has .js, .json, or is a node_modules import
    if (importPath.endsWith('.js') || importPath.endsWith('.json') || importPath.startsWith('node_modules')) {
      return match;
    }
    modified = true;
    const resolvedPath = resolveImportPath(file, importPath);
    return match.replace(importPath, resolvedPath);
  });
  
  if (modified) {
    writeFileSync(file, content, 'utf-8');
  }
}

console.log(`✅ Fixed imports in ${files.length} files`);

