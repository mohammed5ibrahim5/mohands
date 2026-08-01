// Final check: fetch what the site actually renders (products with categories)
const base = 'https://ipkzrmvdzdcxcdzvvatl.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzIxOTEsImV4cCI6MjEwMTE0ODE5MX0.xTYPy75bkXCtRVnksa4uCxyUvRn0O4K3tIW2vttNgj8';

async function main() {
  const out = [];

  // Simulate HomePage query
  const catRes = await fetch(`${base}/rest/v1/categories?select=*&order=sort_order`, { headers: { apikey: anon, Authorization: `Bearer ${anon}` } });
  const cats = await catRes.json();
  out.push(`HomePage categories: ${Array.isArray(cats) ? cats.length : catRes.status}`);

  const featRes = await fetch(`${base}/rest/v1/products?select=*,category:categories(*)&active=eq.true&featured=eq.true&order=rating.desc&limit=8`, { headers: { apikey: anon, Authorization: `Bearer ${anon}` } });
  const feats = await featRes.json();
  out.push(`Featured products (limit 8): ${Array.isArray(feats) ? feats.length : featRes.status}`);

  const newRes = await fetch(`${base}/rest/v1/products?select=*,category:categories(*)&active=eq.true&order=created_at.desc&limit=4`, { headers: { apikey: anon, Authorization: `Bearer ${anon}` } });
  const news = await newRes.json();
  out.push(`New arrivals (limit 4): ${Array.isArray(news) ? news.length : newRes.status}`);

  // Sample product with category
  if (Array.isArray(feats) && feats.length > 0) {
    const p = feats[0];
    out.push(`Sample: ${p.name} -> category: ${p.category?.name ?? 'N/A'}`);
  }

  console.log(out.join('\n'));
}
main();

