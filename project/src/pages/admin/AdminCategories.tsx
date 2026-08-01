import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, FolderTree, ChevronLeft, Folder, FolderOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/utils';
import type { Category } from '@/lib/types';
import AdminLayout from '@/components/admin/AdminLayout';

interface CategoryForm {
  name: string;
  slug: string;
  image_url: string;
  description: string;
  sort_order: string;
  parent_id: string;
}

const emptyForm: CategoryForm = {
  name: '', slug: '', image_url: '', description: '', sort_order: '0', parent_id: '',
};

export default function AdminCategories() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [tree, setTree] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const load = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    const all = data || [];
    setAllCategories(all);
    const buildTree = (parentId: string | null): Category[] => {
      return all
        .filter((c) => (c.parent_id || null) === parentId)
        .map((c) => ({ ...c, subcategories: buildTree(c.id) }));
    };
    const t = buildTree(null);
    setTree(t);
    const allIds = new Set(all.map((c) => c.id));
    setExpandedIds(allIds);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAdd = (parentId = '') => {
    setForm({ ...emptyForm, parent_id: parentId });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setForm({
      name: c.name, slug: c.slug, image_url: c.image_url || '',
      description: c.description || '', sort_order: String(c.sort_order),
      parent_id: c.parent_id || '',
    });
    setEditingId(c.id);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name, slug: form.slug || slugify(form.name),
      image_url: form.image_url || null, description: form.description || null,
      sort_order: Number(form.sort_order) || 0, parent_id: form.parent_id || null,
    };
    if (editingId) await supabase.from('categories').update(payload).eq('id', editingId);
    else await supabase.from('categories').insert(payload);
    setSaving(false); setModalOpen(false); await load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('categories').delete().eq('id', deleteId);
    setDeleteId(null); await load();
  };

  // Flatten for the parent select dropdown (with indentation)
  const flatForSelect = (cats: Category[], depth = 0): { id: string; label: string }[] => {
    const result: { id: string; label: string }[] = [];
    for (const c of cats) {
      result.push({ id: c.id, label: `${'— '.repeat(depth)}${c.name}` });
      if (c.subcategories) result.push(...flatForSelect(c.subcategories, depth + 1));
    }
    return result;
  };
  const selectOptions = flatForSelect(tree);

  // Recursive category row renderer
  const renderCategory = (cat: Category, depth: number): React.ReactNode => {
    const hasChildren = cat.subcategories && cat.subcategories.length > 0;
    const isExpanded = expandedIds.has(cat.id);
    return (
      <div key={cat.id}>
        <div
          className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
          style={{ paddingRight: `${16 + depth * 24}px` }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {hasChildren ? (
              <button onClick={() => toggleExpand(cat.id)} className="p-1.5 rounded-lg hover:bg-stone-200 transition-colors">
                <ChevronLeft className={`w-5 h-5 text-stone-500 transition-transform ${isExpanded ? '-rotate-90' : ''}`} />
              </button>
            ) : (
              <div className="w-8" />
            )}
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0">
              {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-stone-800 flex items-center gap-2">
                {depth === 0 ? <Folder className="w-4 h-4 text-amber-500" /> : <FolderOpen className="w-4 h-4 text-stone-400" />}
                {cat.name}
              </p>
              <p className="text-xs text-stone-400">{hasChildren ? `${cat.subcategories!.length} قسم فرعي` : cat.description || 'قسم فرعي'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => openAdd(cat.id)} className="px-3 py-2 rounded-lg text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> فرعي
            </button>
            <button onClick={() => openEdit(cat)} className="p-2 rounded-lg text-stone-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"><Pencil className="w-4 h-4" /></button>
            <button onClick={() => setDeleteId(cat.id)} className="p-2 rounded-lg text-stone-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="bg-stone-50/30">
            {cat.subcategories!.map((sub) => renderCategory(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">التصنيفات والأقسام الفرعية</h1>
          <p className="text-stone-500 mt-1">إدارة الأقسام الرئيسية والفرعية (متعددة المستويات)</p>
        </div>
        <button onClick={() => openAdd()} className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95">
          <Plus className="w-5 h-5" /> إضافة قسم رئيسي
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-stone-400 mx-auto" /></div>
        ) : tree.length === 0 ? (
          <div className="p-12 text-center"><FolderTree className="w-12 h-12 text-stone-200 mx-auto mb-3" /><p className="text-stone-400">لا توجد تصنيفات</p></div>
        ) : (
          <div className="divide-y divide-stone-50">
            {tree.map((cat) => renderCategory(cat, 0))}
          </div>
        )}
      </div>

      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 animate-fade-in" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto animate-scale-in">
              <div className="flex items-center justify-between p-5 border-b border-stone-100 sticky top-0 bg-white rounded-t-2xl z-10">
                <h2 className="font-bold text-stone-800 text-lg">
                  {editingId ? 'تعديل قسم' : form.parent_id ? 'إضافة قسم فرعي' : 'إضافة قسم رئيسي'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-full hover:bg-stone-100 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4">
                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">القسم الرئيسي (اتركه فارغاً لقسم رئيسي جديد)</label>
                    <select
                      value={form.parent_id}
                      onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    >
                      <option value="">— قسم رئيسي جديد —</option>
                      {selectOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">اسم القسم *</label>
                  <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" placeholder="مثال: كشكول، زخرفة وملصقات" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">المعرّف (slug)</label>
                  <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" placeholder="notebooks" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">الوصف</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all min-h-[70px] resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">رابط الصورة</label>
                  <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" placeholder="https://..." />
                  {form.image_url && <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-stone-100"><img src={form.image_url} alt="معاينة" className="w-full h-full object-cover" /></div>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">ترتيب العرض</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-6 py-3 rounded-xl flex-1 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60">
                    {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري الحفظ...</> : editingId ? 'حفظ التعديلات' : 'إضافة'}
                  </button>
                  <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl border border-stone-200 text-stone-700 font-semibold hover:bg-stone-50 transition-all">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {deleteId && (
        <>
          <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 animate-fade-in" onClick={() => setDeleteId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 pointer-events-auto animate-scale-in text-center">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-7 h-7 text-rose-600" /></div>
              <h3 className="font-bold text-stone-800 text-lg">حذف القسم؟</h3>
              <p className="text-stone-500 text-sm mt-2">قد تتأثر المنتجات والأقسام الفرعية المرتبطة بهذا القسم.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2.5 rounded-xl flex-1 transition-all active:scale-95">نعم، احذف</button>
                <button onClick={() => setDeleteId(null)} className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold hover:bg-stone-50 transition-all flex-1">إلغاء</button>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
