import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Star, ShoppingBag, Minus, Plus, Check, Truck, ShieldCheck, RotateCcw, Heart, Share2, ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, Review, ProductImage } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/store/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ author_name: '', rating: 5, comment: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('products').select('*, category:categories(*)').eq('id', id).maybeSingle();
      setProduct(data);
      if (data) {
        const [{ data: imgs }, { data: revs }, { data: rel }] = await Promise.all([
          supabase.from('product_images').select('*').eq('product_id', data.id).order('sort_order'),
          supabase.from('reviews').select('*').eq('product_id', data.id).eq('approved', true).order('created_at', { ascending: false }),
          supabase.from('products').select('*, category:categories(*)').eq('active', true).eq('category_id', data.category_id).neq('id', data.id).limit(4),
        ]);
        setImages(imgs || []);
        setReviews(revs || []);
        setRelated(rel || []);
      }
      setLoading(false);
    })();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    await supabase.from('reviews').insert({
      product_id: product.id,
      author_name: reviewForm.author_name,
      rating: reviewForm.rating,
      comment: reviewForm.comment || null,
      approved: false,
    });
    setReviewSubmitted(true);
    setReviewForm({ author_name: '', rating: 5, comment: '' });
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-stone-100 rounded-2xl" />
          <div className="space-y-4"><div className="h-8 bg-stone-100 rounded w-3/4" /><div className="h-6 bg-stone-100 rounded w-1/2" /><div className="h-32 bg-stone-100 rounded" /></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-500 text-lg">المنتج غير موجود</p>
        <Link to="/shop" className="btn-primary mt-4 inline-flex">العودة للمتجر</Link>
      </div>
    );
  }

  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) : 0;

  const allImages = [product.image_url, ...images.map((i) => i.image_url)].filter(Boolean) as string[];
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : product.rating;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="text-sm text-stone-400 mb-6 flex items-center gap-2 flex-wrap">
        <Link to="/" className="hover:text-amber-600">الرئيسية</Link>
        <ChevronLeft className="w-4 h-4" />
        <Link to="/shop" className="hover:text-amber-600">المتجر</Link>
        {product.category && <><ChevronLeft className="w-4 h-4" /><Link to={`/shop?category=${product.category.slug}`} className="hover:text-amber-600">{product.category.name}</Link></>}
        <ChevronLeft className="w-4 h-4" />
        <span className="text-stone-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-50 card">
            {allImages[activeImage] && <img src={allImages[activeImage]} alt={product.name} className="w-full h-full object-cover" />}
            {discount > 0 && <span className="absolute top-4 right-4 badge bg-rose-500 text-white shadow-lg">خصم {discount}%</span>}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-3 mt-4">
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-amber-500' : 'border-stone-200 hover:border-stone-300'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.brand && <span className="text-sm text-stone-400 font-bold uppercase tracking-wider">{product.brand}</span>}
          {product.category && <Link to={`/shop?category=${product.category.slug}`} className="text-sm text-amber-600 font-medium block mt-1">{product.category.name}</Link>}
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mt-2">{product.name}</h1>

          <div className="flex items-center gap-3 mt-4">
            <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />)}</div>
            <span className="text-sm text-stone-500">{avgRating.toFixed(1)} ({reviews.length} تقييم)</span>
          </div>

          <div className="flex items-baseline gap-3 mt-6">
            <span className="text-4xl font-bold text-stone-900">{formatPrice(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && <span className="text-xl text-stone-400 line-through">{formatPrice(product.compare_at_price)}</span>}
          </div>

          <p className="text-stone-600 leading-relaxed mt-6 text-lg">{product.description}</p>

          {/* Stock */}
          <div className="mt-4">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 text-sm font-bold"><Check className="w-4 h-4" /> متوفر في المخزون ({product.stock} قطعة)</span>
            ) : <span className="text-rose-600 text-sm font-bold">نفذ المخزون</span>}
          </div>

          {/* SKU */}
          {product.sku && <p className="text-xs text-stone-400 mt-3">رمز المنتج: {product.sku}</p>}

          {/* Quantity + Actions */}
          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center border-2 border-stone-200 rounded-full p-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors"><Minus className="w-4 h-4" /></button>
              <span className="w-12 text-center font-bold text-lg">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
              {added ? <><Check className="w-5 h-5" /> تمت الإضافة</> : <><ShoppingBag className="w-5 h-5" /> أضف للسلة</>}
            </button>
            <button onClick={() => toggle(product)} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${isWishlisted(product.id) ? 'border-rose-500 bg-rose-50 text-rose-500' : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}>
              <Heart className={`w-5 h-5 ${isWishlisted(product.id) ? 'fill-current' : ''}`} />
            </button>
            <button className="w-12 h-12 rounded-full border-2 border-stone-200 text-stone-600 hover:border-stone-300 flex items-center justify-center transition-all"><Share2 className="w-5 h-5" /></button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 mt-8 pt-8 border-t border-stone-100">
            {[{ icon: Truck, title: 'توصيل سريع', desc: '2-5 أيام' }, { icon: ShieldCheck, title: 'دفع آمن', desc: 'عند الاستلام' }, { icon: RotateCcw, title: 'إرجاع مجاني', desc: '14 يوم' }].map((b, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mx-auto mb-2"><b.icon className="w-6 h-6" /></div>
                <h4 className="text-xs font-bold text-stone-700">{b.title}</h4>
                <p className="text-xs text-stone-400">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <section className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reviews list */}
        <div className="lg:col-span-2">
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6">تقييمات العملاء ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-stone-500">لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 font-bold">{r.author_name.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-stone-800">{r.author_name}</p>
                        <p className="text-xs text-stone-400">{new Date(r.created_at).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                    <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />)}</div>
                  </div>
                  {r.comment && <p className="text-stone-600 leading-relaxed">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review form */}
        <div>
          <div className="card p-6 sticky top-28">
            <h3 className="font-bold text-stone-800 text-lg mb-4">أضف تقييمك</h3>
            {reviewSubmitted ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3"><Check className="w-7 h-7 text-emerald-600" /></div>
                <p className="font-bold text-stone-800">شكراً لتقييمك!</p>
                <p className="text-sm text-stone-500 mt-1">سيظهر بعد المراجعة من الإدارة</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">الاسم *</label>
                  <input required type="text" value={reviewForm.author_name} onChange={(e) => setReviewForm({ ...reviewForm, author_name: e.target.value })} className="input-field" placeholder="اسمك" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">التقييم</label>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button key={i} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}>
                        <Star className={`w-7 h-7 ${i < reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">التعليق</label>
                  <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} className="input-field min-h-[100px] resize-none" placeholder="شاركنا رأيك في المنتج..." />
                </div>
                <button type="submit" className="btn-primary w-full">إرسال التقييم</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6">منتجات ذات صلة</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
