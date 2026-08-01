import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getSessionId, type Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function WishlistPage() {
  const { productIds, toggle } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const sessionId = getSessionId();

  useEffect(() => {
    (async () => {
      if (productIds.length === 0) { setProducts([]); setLoading(false); return; }
      const { data } = await supabase.from('products').select('*, category:categories(*)').in('id', productIds);
      setProducts(data || []);
      setLoading(false);
    })();
  }, [productIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 flex items-center gap-3">
          <Heart className="w-8 h-8 text-rose-500 fill-current" /> المفضلة
        </h1>
        <p className="text-stone-500 mt-2">{products.length} منتج محفوظ</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-stone-400">جاري التحميل...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-stone-300" />
          </div>
          <p className="text-stone-500 text-lg font-medium">قائمة المفضلة فارغة</p>
          <p className="text-stone-400 text-sm mt-1">أضف منتجاتك المفضلة للرجوع إليها لاحقاً</p>
          <Link to="/shop" className="btn-primary mt-6 inline-flex">تصفح المنتجات</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <div key={p.id} className="card overflow-hidden flex flex-col">
              <div className="relative aspect-square overflow-hidden bg-stone-50">
                <Link to={`/product/${p.id}`}>
                  {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />}
                </Link>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                {p.category && <span className="text-xs text-amber-600 font-medium">{p.category.name}</span>}
                <Link to={`/product/${p.id}`}>
                  <h3 className="font-bold text-stone-800 mt-1 line-clamp-2 hover:text-amber-600 transition-colors">{p.name}</h3>
                </Link>
                <span className="text-lg font-bold text-stone-900 mt-2">{formatPrice(p.price)}</span>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => addItem(p)} disabled={p.stock === 0} className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-50">
                    <ShoppingBag className="w-4 h-4" /> أضف للسلة
                  </button>
                  <button onClick={() => toggle(p)} className="w-11 h-11 rounded-full border-2 border-stone-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
