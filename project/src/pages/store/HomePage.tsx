import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Truck, ShieldCheck, RotateCcw, CreditCard, Star, Quote } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import type { Category, Product } from '@/lib/types';
import ProductCard from '@/components/store/ProductCard';
import AboutSection from '@/components/store/AboutSection';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: feats }, { data: newest }] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('products').select('*, category:categories(*)').eq('active', true).eq('featured', true).order('rating', { ascending: false }).limit(8),
        supabase.from('products').select('*, category:categories(*)').eq('active', true).order('created_at', { ascending: false }).limit(4),
      ]);
      setCategories((cats || []).filter((c) => !c.parent_id));
      setFeatured(feats || []);
      setNewArrivals(newest || []);
      setLoading(false);
    })();
  }, []);

  const testimonials = [
    { name: 'أحمد عبد الله', role: 'مدير مكتبي', text: 'منتجات بجودة ممتازة وتوصيل سريع. أصبح المتجر وجهتي الأولى لكل احتياجات المكتب.', rating: 5 },
    { name: 'سارة محمود', role: 'معلمة', text: 'تشكيلة رائعة من الدفاتر والأقلام، الأسعار مناسبة جداً والخدمة احترافية.', rating: 5 },
    { name: 'كريم فؤاد', role: 'طالب جامعي', text: 'أفضل متجر للقرطاسية اتعامل معاه، الطلبات بتوصل في معادها وبحالة ممتازة.', rating: 5 },
  ];

  const sectionSpacingClass = settings.sectionSpacing === 'compact' ? 'py-10' : settings.sectionSpacing === 'spacious' ? 'py-24' : 'py-16';
  const featureCardClass = `card p-5 flex items-center gap-4 hover:shadow-lg transition-shadow ${settings.cardRadius}`;
  const categoryCardClass = `group relative aspect-[3/4] rounded-2xl overflow-hidden card hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${settings.cardRadius}`;

  return (
    <div className="animate-fade-in" style={{ backgroundColor: settings.pageBackgroundColor }}>
      <section className={`relative overflow-hidden bg-stone-950 text-white ${settings.heroLayout === 'minimal' ? 'rounded-b-[2rem]' : ''}`}>
        <div className="absolute inset-0">
          <img src={settings.heroImageUrl} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-l from-stone-950 via-stone-950/80 to-stone-950/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 text-sm font-bold px-4 py-2 rounded-full mb-6 border border-amber-500/30">
              <Star className="w-4 h-4 fill-current" />
              {settings.heroBadge}
            </span>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-balance">
              {settings.heroTitle}
              <span className="block text-amber-400 mt-2">{settings.heroTitleHighlight}</span>
            </h1>
            <p className="text-stone-300 text-lg md:text-xl mt-8 leading-relaxed max-w-xl">{settings.heroSubtitle}</p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link to="/shop" className={`text-base inline-flex items-center justify-center gap-2 px-7 py-3.5 ${settings.buttonStyle === 'outline' ? 'border border-white/40 bg-transparent text-white' : settings.buttonStyle === 'rounded' ? 'rounded-full' : 'rounded-full'}`} style={settings.buttonStyle === 'filled' ? { backgroundColor: settings.accentColor, color: settings.accentTextColor } : undefined}>
                {settings.heroPrimaryCta} <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link to="/shop?category=notebooks" className="bg-white/10 backdrop-blur text-white font-bold px-7 py-3.5 rounded-full border border-white/20 hover:bg-white/20 transition-all active:scale-95">
                {settings.heroSecondaryCta}
              </Link>
            </div>
            <div className="flex items-center gap-8 mt-12">
              <div>
                <p className="font-serif text-3xl font-bold text-amber-400">{settings.heroStat1Value}</p>
                <p className="text-sm text-stone-400">{settings.heroStat1Label}</p>
              </div>
              <div className="w-px h-12 bg-stone-700" />
              <div>
                <p className="font-serif text-3xl font-bold text-amber-400">{settings.heroStat2Value}</p>
                <p className="text-sm text-stone-400">{settings.heroStat2Label}</p>
              </div>
              <div className="w-px h-12 bg-stone-700" />
              <div>
                <p className="font-serif text-3xl font-bold text-amber-400">{settings.heroStat3Value}</p>
                <p className="text-sm text-stone-400">{settings.heroStat3Label}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 ${sectionSpacingClass}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Truck, title: settings.feature1Title, desc: settings.feature1Description },
            { icon: ShieldCheck, title: settings.feature2Title, desc: settings.feature2Description },
            { icon: RotateCcw, title: settings.feature3Title, desc: settings.feature3Description },
            { icon: CreditCard, title: settings.feature4Title, desc: settings.feature4Description },
          ].map((f, i) => (
            <div key={i} className={featureCardClass} style={{ backgroundColor: settings.cardBackgroundColor }}>
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <f.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-800 text-sm">{f.title}</h3>
                <p className="text-xs text-stone-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {settings.showCategorySection && (
        <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${sectionSpacingClass}`}>
          <div className="text-center mb-12">
            <span className="text-amber-600 font-bold text-sm uppercase tracking-widest">تصفح حسب</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mt-2">التصنيفات</h2>
            <p className="text-stone-500 mt-3 max-w-lg mx-auto">اختر القسم الذي يناسب احتياجاتك من تشكيلتنا الواسعة</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/shop?category=${cat.slug}`} className={categoryCardClass}>
                {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5 text-center">
                  <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                  <span className="text-amber-400 text-sm flex items-center justify-center gap-1 mt-1 group-hover:gap-2 transition-all">
                    تسوّق <ArrowLeft className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {settings.showFeaturedSection && (
        <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${sectionSpacingClass}`}>
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-amber-600 font-bold text-sm uppercase tracking-widest">الأكثر مبيعاً</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mt-2">منتجات مميزة</h2>
            </div>
            <Link to="/shop" className="text-stone-700 font-bold flex items-center gap-1 hover:gap-2 transition-all">
              عرض الكل <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`card p-4 animate-pulse ${settings.cardRadius}`}>
                  <div className="aspect-square bg-stone-100 rounded-xl mb-4" />
                  <div className="h-4 bg-stone-100 rounded mb-2" />
                  <div className="h-4 bg-stone-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      )}

      {settings.showPromoSection && (
        <>
          <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${sectionSpacingClass}`}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-stone-900 to-stone-800 p-10 md:p-16">
              <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="inline-block text-sm font-bold px-4 py-1.5 rounded-full mb-4" style={{ backgroundColor: settings.accentColor, color: settings.accentTextColor }}>عرض حصري</span>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">{settings.promoTitle}</h2>
                  <p className="text-stone-300 text-lg mb-6">{settings.promoSubtitle}</p>
                  <Link to="/shop?sort=price-low" className="btn-accent">{settings.promoCta}</Link>
                </div>
                <div className="hidden md:block text-center">
                  <p className="font-serif text-8xl font-bold text-amber-500/30">{settings.promoDiscountPercent}</p>
                  <p className="text-amber-400 font-bold text-xl -mt-4">خصم</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {settings.showAboutSection && <AboutSection />}

      {settings.showNewArrivalsSection && (
        <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${sectionSpacingClass}`}>
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-amber-600 font-bold text-sm uppercase tracking-widest">وصل حديثاً</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mt-2">أحدث المنتجات</h2>
            </div>
            <Link to="/shop" className="text-stone-700 font-bold flex items-center gap-1 hover:gap-2 transition-all">
              عرض الكل <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {settings.showTestimonials && (
        <section className="bg-stone-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-amber-600 font-bold text-sm uppercase tracking-widest">آراء عملائنا</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mt-2">ماذا يقولون عنا</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className={`card p-8 relative ${settings.cardRadius}`} style={{ backgroundColor: settings.cardBackgroundColor }}>
                  <Quote className="w-10 h-10 text-amber-200 absolute top-6 left-6" />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-stone-600 leading-relaxed mb-6 relative z-10">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 font-bold text-lg">{t.name.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-stone-800">{t.name}</p>
                      <p className="text-sm text-stone-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
