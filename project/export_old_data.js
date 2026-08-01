// Export data from old project
import { writeFileSync } from 'fs';

const oldProject = {
  url: 'https://grjbrhurvzzaerazsdsl.supabase.co',
  anon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyamJyaHVydnp6YWVyYXpzZHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NTYxNjUsImV4cCI6MjEwMTEzMjE2NX0.CfkgeDTFY360FMXShtO8s0PHJDX-5N1sgqa8ONgMRkI',
};

const tables = ['categories', 'products', 'reviews', 'wishlist', 'product_images', 'orders', 'order_items', 'profiles'];

async function fetchTable(t) {
  try {
    const uri = `${oldProject.url}/rest/v1/${t}?select=*&limit=1000`;
    const res = await fetch(uri, { headers: { apikey: oldProject.anon, Authorization: `Bearer ${oldProject.anon}` } });
    if (res.status === 200) return await res.json();
    return `ERROR ${res.status}: ${await res.text()}`;
  } catch (e) {
    return `ERROR ${e.message}`;
  }
}

(async () => {
  const output = {};
  for (const t of tables) {
    const data = await fetchTable(t);
    output[t] = data;
    if (Array.isArray(data)) console.log(`${t}: ${data.length} rows`);
    else console.log(`${t}: ${data}`);
  }
  writeFileSync('old_project_data.json', JSON.stringify(output, null, 2));
  console.log('\nSaved to old_project_data.json');
})();

