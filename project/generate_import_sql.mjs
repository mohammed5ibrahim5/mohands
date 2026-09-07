import { readFileSync, writeFileSync } from 'fs';

const data = JSON.parse(readFileSync('old_project_data.json', 'utf8'));

function esc(s) {
  return String(s == null ? '' : s).replace(/'/g, "''");
}

function toLiteral(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return "'" + esc(v) + "'";
}

function insert(table, cols, rows) {
  if (!rows.length) return '-- ' + table + ': empty';
  const lines = rows.map((r) =>
    '(' + cols.map((c) => toLiteral(r[c])).join(',') + ')'
  );
  return 'INSERT INTO ' + table + ' (' + cols.join(',') + ') VALUES\n' + lines.join(',\n') + ';';
}

let out = '';

out += '-- ========== categories (top-level first) ==========\n';
const top = data.categories.filter((c) => !c.parent_id);
const sub = data.categories.filter((c) => c.parent_id);
out += insert('categories', ['id', 'name', 'slug', 'image_url', 'description', 'sort_order', 'created_at', 'parent_id'], top) + '\n\n';
out += '-- ========== subcategories ==========\n';
out += insert('categories', ['id', 'name', 'slug', 'image_url', 'description', 'sort_order', 'created_at', 'parent_id'], sub) + '\n\n';

out += '-- ========== products ==========\n';
out += insert('products', ['id', 'name', 'slug', 'description', 'price', 'compare_at_price', 'stock', 'image_url', 'category_id', 'featured', 'active', 'rating', 'created_at', 'sku', 'brand', 'weight'], data.products) + '\n\n';

out += '-- ========== reviews ==========\n';
out += insert('reviews', ['id', 'product_id', 'author_name', 'rating', 'comment', 'approved', 'created_at'], data.reviews) + '\n';

writeFileSync('import_data_into_sql_editor.sql', out);
console.log('written', out.length, 'chars');
