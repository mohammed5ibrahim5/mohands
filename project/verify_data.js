// Verify data in new project with full counts
import { writeFileSync } from 'fs';

const base = 'https://ipkzrmvdzdcxcdzvvatl.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzIxOTEsImV4cCI6MjEwMTE0ODE5MX0.xTYPy75bkXCtRVnksa4uCxyUvRn0O4K3tIW2vttNgj8';

const tables = ['categories', 'products', 'reviews', 'wishlist'];

async function fetchAll(t) {
  const out = [];
  let from = 0;
  while (true) {
    const uri = `${base}/rest/v1/${t}?select=*&offset=${from}&limit=1000`;
    const res = await fetch(uri, { headers: { apikey: anon, Authorization: `Bearer ${anon}` } });
    if (res.status === 200) {
      const data = await res.json();
      out.push(...data);
      if (data.length < 1000) break;
      from += 1000;
    } else {
      return { error: `HTTP ${res.status}: ${await res.text()}` };
    }
  }
  return out;
}

(async () => {
  const lines = [];
  for (const t of tables) {
    const data = await fetchAll(t);
    if (Array.isArray(data)) lines.push(`${t}: ${data.length} rows`);
    else lines.push(`${t}: ${data.error}`);
  }
  // Verify products have categories
  const prods = await fetchAll('products');
  if (Array.isArray(prods)) {
    const withCat = prods.filter(p => p.category_id).length;
    const featured = prods.filter(p => p.featured).length;
    lines.push(`products with category: ${withCat}/${prods.length}`);
    lines.push(`products featured: ${featured}`);
  }
  writeFileSync('verify_results.txt', lines.join('\n'));
  console.log('Done. See verify_results.txt');
})();

