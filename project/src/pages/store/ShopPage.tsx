import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category, Product } from '@/lib/types';
import ProductCard from '@/components/store/ProductCard';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') || '';
  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('min') || '';
  const maxPrice = searchParams.get('max') || '';
  const featuredOnly = searchParams.get('featured') === '1';

  useEffect(() => {
    (async () => {
      const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
      const all = cats || [];
      setAllCategories(all);
      setParentCategories(all.filter((c) => !c.parent_id).map((p) => ({ ...p, subcategories: all.filter((c) => c.parent_id === p.id) })));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let query = supabase.from('products').select('*, category:categories(*)').eq('active', true);

      if (category) {
        const { data: cat } = await supabase.from('categories').select('id, parent_id').eq('slug', category).maybeSingle();
        if (cat) {
          // Recursively gather all descendant category ids
          const collectDescendants = (parentId: string): string[] => {
            const children = allCategories.filter((c) => c.parent_id === parentId);
            return children.flatMap((c) => [c.id, ...collectDescendants(c.id)]);
          };
          const ids = [cat.id, ...collectDescendants(cat.id)];
          query = query.in('category_id', ids);
        }
      }
      if (q) query = query.ilike('name', `%${q}%`);
      if (minPrice) query = query.gte('price', Number(minPrice));
      if (maxPrice) query = query.lte('price', Number(maxPrice));
      if (featuredOnly) query = query.eq('featured', true);

      if (sort === 'price-low') query = query.order('price', { ascending: true });
      else if (sort === 'price-high') query = query.order('price', { ascending: false });
      else if (sort === 'rating') query = query.order('rating', { ascending: false });
      else query = query.order('created_at', { ascending: false });

      const { data } = await query;
      setProducts(data || []);
      setLoading(false);
    })();
  }, [category, q, sort, minPrice, maxPrice, featuredOnly]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
    setShowFilters(false);
  };

  const activeCat = allCategories.find((c) => c.slug === category);
  const activeParent = parentCategories.find((c) => c.slug === category);
  const activeSub = allCategories.find((c) => c.slug === category && c.parent_id);

  const renderCategorySidebar = (cat: Category, depth: number): React.ReactNode => (
    <li key={cat.id}>
      <button
        onClick={() => updateParam('category', cat.slug)}
        className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
          category === cat.slug
            ? depth === 0 ? 'bg-stone-900 text-white font-bold' : 'bg-amber-100 text-amber-700 font-bold'
            : depth === 0 ? 'text-stone-600 hover:bg-stone-100 font-bold' : 'text-stone-500 hover:bg-stone-50'
        }`}
        style={{ paddingRight: `${12 + depth * 16}px` }}
      >
        {depth > 0 && '↳ '}{cat.name}
      </button>
      {cat.subcategories && cat.subcategories.length > 0 && (
        <ul className="mt-0.5 space-y-0.5">
          {cat.subcategories.map((sub) => renderCategorySidebar(sub, depth + 1))}
        </ul>
      )}
    </li>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <nav className="text-sm text-stone-400 mb-2">
          <span>الرئيسية</span> <span className="mx-2">/</span> <span className="text-stone-700">المتجر</span>
          {activeParent && <><span className="mx-2">/</span> <span className="text-amber-600">{activeParent.name}</span></>}
          {activeSub && <><span className="mx-2">/</span> <span className="text-amber-600">{activeSub.name}</span></>}
        </nav>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
          {activeCat ? activeCat.name : q ? `نتائج البحث: "${q}"` : 'كل المنتجات'}
        </h1>
        <p className="text-stone-500 mt-2">{loading ? 'جاري التحميل...' : `${products.length} منتج`}</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-stone-950/50' : 'hidden'} lg:block lg:relative lg:bg-transparent lg:z-0`}>
          <div className={`${showFilters ? 'fixed top-0 right-0 bottom-0 w-80 bg-white p-6 overflow-y-auto animate-slide-in-right lg:relative lg:top-0 lg:w-64 lg:p-0 lg:animate-none' : 'w-64'}`}>
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="font-bold text-stone-800 text-lg">الفلاتر</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 rounded-full hover:bg-stone-100"><X className="w-5 h-5" /></button>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="font-bold text-stone-800 mb-3 text-sm uppercase tracking-wider">التصنيفات</h3>
              <ul className="space-y-1">
                <li>
                  <button onClick={() => updateParam('category', '')} className={`w-full text-right px-3 py-2 rounded-lg text-sm font-bold transition-colors ${!category ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>
                    كل المنتجات
                  </button>
                </li>
                {parentCategories.map((c) => renderCategorySidebar(c, 0))}
              </ul>
            </div>

            {/* Price filter */}
            <div className="mb-8">
              <h3 className="font-bold text-stone-800 mb-3 text-sm uppercase tracking-wider">نطاق السعر</h3>
              <div className="space-y-2">
                <input type="number" placeholder="الحد الأدنى" defaultValue={minPrice} onBlur={(e) => updateParam('min', e.target.value)} className="input-field text-sm" />
                <input type="number" placeholder="الحد الأقصى" defaultValue={maxPrice} onBlur={(e) => updateParam('max', e.target.value)} className="input-field text-sm" />
              </div>
            </div>

            {/* Featured filter */}
            <div className="mb-8">
              <h3 className="font-bold text-stone-800 mb-3 text-sm uppercase tracking-wider">خيارات</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={featuredOnly} onChange={(e) => updateParam('featured', e.target.checked ? '1' : '')} className="w-4 h-4 rounded accent-amber-600" />
                <span className="text-sm font-medium text-stone-600">المنتجات المميزة فقط</span>
              </label>
            </div>

            <button onClick={() => { setSearchParams(new URLSearchParams()); }} className="text-sm text-amber-600 font-medium hover:underline">
              مسح كل الفلاتر
            </button>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5 gap-2">
            <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-200 text-sm font-bold text-stone-700 bg-white">
              <SlidersHorizontal className="w-4 h-4" /> الفلاتر
            </button>
            <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="input-field max-w-xs text-sm">
              <option value="newest">الأحدث</option>
              <option value="price-low">السعر: من الأقل للأعلى</option>
              <option value="price-high">السعر: من الأعلى للأقل</option>
              <option value="rating">الأعلى تقييماً</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="aspect-square bg-stone-100 rounded-xl mb-4" />
                  <div className="h-4 bg-stone-100 rounded mb-2" />
                  <div className="h-4 bg-stone-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <Search className="w-16 h-16 text-stone-200 mx-auto mb-4" />
              <p className="text-stone-500 text-lg font-medium">لا توجد منتجات مطابقة</p>
              <p className="text-stone-400 text-sm mt-1">جرّب تغيير الفلاتر أو البحث بكلمات أخرى</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
