/*
# Add Subcategories (Hierarchical Categories)

Adds parent-child relationship to categories so admin can create subcategories
(e.g. "أدوات مكتبية" -> "زخرفة وملصقات", "دفاتر ومذكرات" -> "كشكول").

1. Modified Tables
- `categories`: add `parent_id` column (self-referencing FK, nullable for top-level categories)

2. Notes
- Top-level categories have parent_id = NULL
- Subcategories reference their parent via parent_id
- Products can be assigned to either a parent or sub category
- The admin UI will show a two-level selector when adding/editing products
*/

ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
