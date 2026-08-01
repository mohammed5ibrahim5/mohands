// Search for "مكتبتي" and "Maktabti" across source files
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, extname } from 'path';

const root = join(process.cwd());
const exts = new Set(['.tsx', '.ts', '.html', '.css', '.js', '.jsx']);
const terms = ['مكتبتي', 'Maktabti', 'maktabti', 'مكتبتي |'];

function walk(dir, results) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.git') continue;
      walk(full, results);
    } else if (exts.has(extname(entry))) {
      try {
        const content = readFileSync(full, 'utf8');
        for (const term of terms) {
          if (content.includes(term)) {
            results.push(`${full.replace(root, '')}: contains "${term}"`);
          }
        }
      } catch (e) {}
    }
  }
}

const results = [];
walk(root, results);
console.log(results.join('\n') || 'No matches found');

