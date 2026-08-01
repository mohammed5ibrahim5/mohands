import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Search, Loader2, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, slugify } from '@/lib/utils';
import type { Category, Product } from '@/lib/types';
import AdminLayout from '@/components/admin/AdminLayout';

interface ProductForm {
  name: string; description: string; price: string; compare_at_price: string;
  stock: string; image_url: string; category_id: string; brand: string; sku: string;
  featured: boolean; active: boolean;
}

const emptyForm: ProductForm = {
  name: '', description: '', price: '', compare_at_price: '', stock: '', image_url: '',
  category_id: '', brand: '', sku: '', featured: false, active: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadProducts = async () => {
    let query = supabase.from('products').select('*, category:categories(*)').order('created_at', { ascending: false });
    if (search) query = query.ilike('name', `%${search}%`);
    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
      setAllCategories(cats || []);
      await loadProducts();
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(loadProducts, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, description: p.description || '', price: String(p.price),
      compare_at_price: p.compare_at_price ? String(p.compare_at_price) : '',
      stock: String(p.stock), image_url: p.image_url || '', category_id: p.category_id || '',
      brand: p.brand || '', sku: p.sku || '', featured: p.featured, active: p.active,
    });
    setEditingId(p.id);
    setModalOpen(true);
  };

  // Build a flat list with indentation for the select dropdown
  const buildTree = (parentId: string | null, depth: number): { id: string; label: string }[] => {
    const children = allCategories.filter((c) => (c.parent_id || null) === parentId);
    const result: { id: string; label: string }[] = [];
    for (const c of children) {
      result.push({ id: c.id, label: `${'— '.repeat(depth)}${c.name}` });
      result.push(...buildTree(c.id, depth + 1));
    }
    return result;
  };
  const categoryOptions = buildTree(null, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name, slug: slugify(form.name) + '-' + Date.now().toString(36),
      description: form.description || null, price: Number(form.price) || 0,
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      stock: Number(form.stock) || 0, image_url: form.image_url || null,
      category_id: form.category_id || null, brand: form.brand || null, sku: form.sku || null,
      featured: form.featured, active: form.active,
    };

    if (editingId) await supabase.from('products').update(payload).eq('id', editingId);
    else await supabase.from('products').insert(payload);

    setSaving(false); setModalOpen(false); await loadProducts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('products').delete().eq('id', deleteId);
    setDeleteId(null); await loadProducts();
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">المنتجات</h1>
          <p className="text-stone-500 mt-1">{products.length} منتج في المتجر</p>
        </div>
        <button onClick={openAdd} className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95">
          <Plus className="w-5 h-5" /> إضافة منتج
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن منتج..." className="w-full pr-10 pl-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all max-w-md" />
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-stone-400 mx-auto" /></div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center"><Package className="w-12 h-12 text-stone-200 mx-auto mb-3" /><p className="text-stone-400">لا توجد منتجات</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="text-right text-xs font-bold text-stone-500 uppercase px-4 py-3">المنتج</th>
                  <th className="text-right text-xs font-bold text-stone-500 uppercase px-4 py-3 hidden md:table-cell">التصنيف</th>
                  <th className="text-right text-xs font-bold text-stone-500 uppercase px-4 py-3">السعر</th>
                  <th className="text-right text-xs font-bold text-stone-500 uppercase px-4 py-3 hidden sm:table-cell">المخزون</th>
                  <th className="text-right text-xs font-bold text-stone-500 uppercase px-4 py-3 hidden lg:table-cell">الحالة</th>
                  <th className="text-right text-xs font-bold text-stone-500 uppercase px-4 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0">{p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}</div>
                        <div className="min-w-0"><p className="font-bold text-stone-800 text-sm truncate">{p.name}</p>{p.brand && <p className="text-xs text-stone-400">{p.brand}</p>}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-stone-600">{p.category?.name || '—'}</span></td>
                    <td className="px-4 py-3"><span className="font-bold text-stone-900 text-sm">{formatPrice(p.price)}</span></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><span className={`text-sm font-bold ${p.stock > 0 ? 'text-stone-700' : 'text-rose-600'}`}>{p.stock}</span></td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex gap-1">
                        {p.featured && <span className="badge bg-amber-100 text-amber-700">مميز</span>}
                        <span className={`badge ${p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>{p.active ? 'مفعّل' : 'معطّل'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-stone-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg text-stone-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 animate-fade-in" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto animate-scale-in">
              <div className="flex items-center justify-between p-5 border-b border-stone-100 sticky top-0 bg-white rounded-t-2xl z-10">
                <h2 className="font-bold text-stone-800 text-lg">{editingId ? 'تعديل منتج' : 'إضافة منتج جديد'}</h2>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-full hover:bg-stone-100 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">اسم المنتج *</label>
                  <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">الوصف</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all min-h-[80px] resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">السعر (ج.م) *</label>
                    <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">السعر قبل الخصم</label>
                    <input type="number" step="0.01" min="0" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">المخزون *</label>
                    <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">القسم (رئيسي أو فرعي)</label>
                    <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all">
                      <option value="">بدون تصنيف</option>
                      {categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">العلامة التجارية</label>
                    <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" placeholder="Faber-Castell" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1.5">رمز المنتج (SKU)</label>
                    <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" placeholder="PN-0001" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">رابط الصورة</label>
                  <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" placeholder="https://..." />
                  {form.image_url && <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-stone-100"><img src={form.image_url} alt="معاينة" className="w-full h-full object-cover" /></div>}
                </div>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded accent-amber-600" /><span className="text-sm font-medium text-stone-600">منتج مميز</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 rounded accent-amber-600" /><span className="text-sm font-medium text-stone-600">مفعّل (ظاهر في المتجر)</span></label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-6 py-3 rounded-xl flex-1 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60">
                    {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري الحفظ...</> : editingId ? 'حفظ التعديلات' : 'إضافة المنتج'}
                  </button>
                  <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl border border-stone-200 text-stone-700 font-semibold hover:bg-stone-50 transition-all">إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <>
          <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 animate-fade-in" onClick={() => setDeleteId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 pointer-events-auto animate-scale-in text-center">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-7 h-7 text-rose-600" /></div>
              <h3 className="font-bold text-stone-800 text-lg">حذف المنتج؟</h3>
              <p className="text-stone-500 text-sm mt-2">لا يمكن التراجع عن هذا الإجراء.</p>
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
