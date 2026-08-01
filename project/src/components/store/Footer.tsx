import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { settings } = useSiteSettings();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-stone-950 text-stone-300 mt-24">
      {/* Newsletter */}
      {settings.showNewsletter && <div className="border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">{settings.newsletterTitle}</h2>
              <p className="text-stone-400 text-lg">{settings.newsletterSubtitle}</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="بريدك الإلكتروني" className="w-full pr-12 pl-4 py-4 rounded-full bg-stone-900 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors" />
              </div>
              <button type="submit" className="btn-accent whitespace-nowrap">
                {subscribed ? 'تم الاشتراك!' : <>اشترك <Send className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>}

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full flex items-center justify-center font-serif text-xl font-bold" style={{ backgroundColor: settings.accentColor, color: settings.accentTextColor }}>ب</div>
              <div>
                <span className="font-serif text-2xl font-bold text-white block leading-none">{settings.storeName}</span>
                <span className="text-[10px] text-stone-500 tracking-widest uppercase">{settings.storeTagline}</span>
              </div>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed mb-5">{settings.footerDescription}</p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-stone-800 hover:bg-amber-500 hover:text-stone-900 flex items-center justify-center transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-5 text-lg">روابط سريعة</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-amber-400 transition-colors">الرئيسية</Link></li>
              <li><Link to="/shop" className="hover:text-amber-400 transition-colors">كل المنتجات</Link></li>
              <li><Link to="/shop?sort=price-low" className="hover:text-amber-400 transition-colors">العروض والخصومات</Link></li>
              <li><Link to="/wishlist" className="hover:text-amber-400 transition-colors">المفضلة</Link></li>
              <li><Link to="/admin" className="hover:text-amber-400 transition-colors">لوحة التحكم</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-5 text-lg">التصنيفات</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/shop?category=notebooks" className="hover:text-amber-400 transition-colors">دفاتر ومذكرات</Link></li>
              <li><Link to="/shop?category=pens" className="hover:text-amber-400 transition-colors">أقلام وكتّاب</Link></li>
              <li><Link to="/shop?category=office-tools" className="hover:text-amber-400 transition-colors">أدوات مكتبية</Link></li>
              <li><Link to="/shop?category=paper" className="hover:text-amber-400 transition-colors">ورق وطباعة</Link></li>
              <li><Link to="/shop?category=storage" className="hover:text-amber-400 transition-colors">أرشفة وتخزين</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-5 text-lg">تواصل معنا</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 shrink-0"><Phone className="w-4 h-4" /></div>
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 shrink-0"><Mail className="w-4 h-4" /></div>
                <span>{settings.email}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 shrink-0"><MapPin className="w-4 h-4" /></div>
                <span>{settings.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-500">
          <p>{settings.footerNote}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-amber-400 transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-amber-400 transition-colors">الشروط والأحكام</a>
            <a href="#" className="hover:text-amber-400 transition-colors">سياسة الإرجاع</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
