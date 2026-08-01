// Check Supabase tables reliably - writes results to a file
import { writeFileSync } from 'fs';

const projects = [
  {
    name: 'ipkzrmvdzdcxcdzvvatl (new)',
    url: 'https://ipkzrmvdzdcxcdzvvatl.supabase.co',
    anon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzIxOTEsImV4cCI6MjEwMTE0ODE5MX0.xTYPy75bkXCtRVnksa4uCxyUvRn0O4K3tIW2vttNgj8',
    serviceRole: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU3MjE5MSwiZXhwIjoyMTAxMTQ4MTkxfQ.0HXu_d77OjN3tlmEnfD6JPNocUa3g13MewR5bzmUarU',
  },
  {
    name: 'grjbrhurvzzaerazsdsl (old)',
    url: 'https://grjbrhurvzzaerazsdsl.supabase.co',
    anon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyamJyaHVydnp6YWVyYXpzZHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NTYxNjUsImV4cCI6MjEwMTEzMjE2NX0.CfkgeDTFY360FMXShtO8s0PHJDX-5N1sgqa8ONgMRkI',
    serviceRole: null,
  },
];

const tables = ['categories', 'products', 'orders', 'order_items', 'reviews', 'wishlist', 'product_images', 'profiles'];

async function check(project, key, keyLabel) {
  const lines = [`--- ${keyLabel} ---`];
  for (const t of tables) {
    try {
      const uri = `${project.url}/rest/v1/${t}?select=id&limit=1`;
      const res = await fetch(uri, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
      if (res.status === 200) {
        const data = await res.json();
        lines.push(`${t}: EXISTS (${data.length} rows)`);
      } else {
        lines.push(`${t}: MISSING (HTTP ${res.status})`);
      }
    } catch (e) {
      lines.push(`${t}: ERROR ${e.message}`);
    }
  }
  return lines.join('\n');
}

(async () => {
  const output = [];
  for (const p of projects) {
    output.push(`\n=== ${p.name} ===`);
    output.push(await check(p, p.anon, 'anon key'));
    if (p.serviceRole) {
      output.push('');
      output.push(await check(p, p.serviceRole, 'service_role key'));
    }
  }
  writeFileSync('check_results.txt', output.join('\n'));
  console.log('Results written to check_results.txt');
})();

