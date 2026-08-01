// Import data from old project export into new project using service_role key
import { readFileSync, writeFileSync } from 'fs';

const newProject = {
  url: 'https://ipkzrmvdzdcxcdzvvatl.supabase.co',
  serviceRole: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlwa3pybXZkemRjeGNkenZ2YXRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU3MjE5MSwiZXhwIjoyMTAxMTQ4MTkxfQ.0HXu_d77OjN3tlmEnfD6JPNocUa3g13MewR5bzmUarU',
};

const data = JSON.parse(readFileSync('old_project_data.json', 'utf8'));
const output = [];

async function insert(table, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    output.push(`${table}: SKIPPED (${Array.isArray(rows) ? '0 rows' : rows})`);
    return;
  }
  try {
    const uri = `${newProject.url}/rest/v1/${table}`;
    const res = await fetch(uri, {
      method: 'POST',
      headers: {
        apikey: newProject.serviceRole,
        Authorization: `Bearer ${newProject.serviceRole}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(rows),
    });
    if (res.status === 201) output.push(`${table}: INSERTED ${rows.length} rows`);
    else output.push(`${table}: ERROR ${res.status} - ${await res.text()}`);
  } catch (e) {
    output.push(`${table}: ERROR ${e.message}`);
  }
}

(async () => {
  output.push('=== Importing categories ===');
  // Categories must be inserted first (top-level with parent_id null)
  const topLevel = data.categories.filter(c => !c.parent_id);
  const subCategories = data.categories.filter(c => c.parent_id);
  await insert('categories', topLevel);
  if (subCategories.length > 0) {
    output.push('--- Then subcategories ---');
    await insert('categories', subCategories);
  }

  output.push('');
  output.push('=== Importing products ===');
  await insert('products', data.products);

  output.push('');
  output.push('=== Importing reviews ===');
  await insert('reviews', data.reviews);

  output.push('');
  output.push('=== Importing wishlist ===');
  await insert('wishlist', data.wishlist);

  output.push('');
  output.push('=== Importing product_images ===');
  await insert('product_images', data.product_images);

  writeFileSync('import_results.txt', output.join('\n'));
  console.log('Import results written to import_results.txt');
})();

