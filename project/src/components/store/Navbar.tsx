import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, Heart, User, Truck, Phone, ChevronDown, LogOut, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/types';

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart();
  const { count: wishCount } = useWishlist();
  const { session, profile, signOut, isAdmin } = useAuth();
  const { settings } = useSiteSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('categories').select('*').order('sort_order');
      const all = data || [];
      const buildTree = (parentId: string | null): Category[] => {
        return all
          .filter((c) => (c.parent_id || null) === parentId)
          .map((c) => ({ ...c, subcategories: buildTree(c.id) }));
      };
      setCategories(buildTree(null));
    })();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMobileOpen(false);
    }
  };

  const renderCategoryDropdown = (cat: Category, depth: number): React.ReactNode => (
    <div key={cat.id} className="mb-1 last:mb-0">
      <Link to={`/shop?category=${cat.slug}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition-colors" style={{ paddingRight: `${8 + depth * 16}px` }}>
        {depth === 0 && cat.image_url && (
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-stone-100 shrink-0">
            <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
          </div>
        )}
        <span className={`${depth === 0 ? 'font-bold text-stone-800' : 'text-stone-500'} text-sm`}>{depth > 0 && '↳ '}{cat.name}</span>
      </Link>
      {cat.subcategories && cat.subcategories.length > 0 && (
        <div className="space-y-0.5">
          {cat.subcategories.map((sub) => renderCategoryDropdown(sub, depth + 1))}
        </div>
      )}
    </div>
  );

  const renderCategoryMobile = (cat: Category, depth: number): React.ReactNode => (
    <div key={cat.id}>
      <Link to={`/shop?category=${cat.slug}`} onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-xl hover:bg-stone-100 font-semibold text-stone-700 text-sm block" style={{ paddingRight: `${16 + depth * 20}px` }}>
        {depth > 0 && '↳ '}{cat.name}
      </Link>
      {cat.subcategories && cat.subcategories.length > 0 && (
        <div>
          {cat.subcategories.map((sub) => renderCategoryMobile(sub, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Announcement bar */}
      {settings.showAnnouncementBar && <div className="bg-stone-900 text-stone-100 text-xs sm:text-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>0100 123 4567</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400 font-medium">
            <Truck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{settings.announcementText}</span>
            <span className="sm:hidden">{settings.announcementText}</span>
          </div>
        </div>
      </div>}

      {/* Main navbar */}
      <header className="sticky top-0 z-40 glass border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className="w-11 h-11 rounded-full flex items-center justify-center font-serif text-xl font-bold" style={{ backgroundColor: settings.accentColor, color: settings.accentTextColor }}>ب</div>
              <div>
                <span className="font-serif text-2xl font-bold text-stone-900 block leading-none">{settings.storeName}</span>
                <span className="text-[10px] text-stone-500 tracking-widest uppercase">{settings.storeTagline}</span>
              </div>
            </Link>

            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg">
              <div className="relative w-full">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن منتج، تصنيف، علامة تجارية..." className="w-full pr-12 pl-4 py-3 rounded-full bg-stone-100 border border-transparent focus:bg-white focus:border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all" />
              </div>
            </form>

            <nav className="hidden lg:flex items-center gap-8">
              <Link to="/" className="text-stone-700 hover:text-amber-600 font-semibold transition-colors">الرئيسية</Link>

              {/* Categories dropdown */}
              <div className="relative" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
                <button className="text-stone-700 hover:text-amber-600 font-semibold transition-colors flex items-center gap-1">
                  التصنيفات <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full right-0 pt-3 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-stone-100 p-4 w-80 animate-scale-in max-h-[70vh] overflow-y-auto">
                      {categories.map((cat) => renderCategoryDropdown(cat, 0))}
                    </div>
                  </div>
                )}
              </div>

              <Link to="/shop" className="text-stone-700 hover:text-amber-600 font-semibold transition-colors">المتجر</Link>
              <Link to="/shop?sort=price-low" className="text-stone-700 hover:text-amber-600 font-semibold transition-colors">العروض</Link>
              <Link to="/wishlist" className="relative p-2 rounded-full hover:bg-stone-100 transition-colors">
                <Heart className="w-6 h-6 text-stone-700" />
                {wishCount > 0 && <span className="absolute -top-0.5 -left-0.5 w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">{wishCount}</span>}
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              {session ? (
                <div className="relative group">
                  <button className="relative p-2.5 rounded-full hover:bg-stone-100 transition-colors" aria-label="حسابي">
                    <div className="w-6 h-6 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 text-xs font-bold">{(profile?.full_name || session.user.email || 'م').charAt(0)}</div>
                  </button>
                  <div className="absolute top-full left-0 pt-3 z-50 hidden group-hover:block">
                    <div className="bg-white rounded-2xl shadow-2xl border border-stone-100 p-2 w-56 animate-scale-in">
                      <div className="px-3 py-2 border-b border-stone-100 mb-1">
                        <p className="font-bold text-stone-800 text-sm truncate">{profile?.full_name || 'حسابي'}</p>
                        <p className="text-xs text-stone-400 truncate">{session.user.email}</p>
                      </div>
                      <Link to="/orders" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-stone-50 text-sm font-medium text-stone-700 transition-colors"><Package className="w-4 h-4" /> طلباتي</Link>
                      <Link to="/wishlist" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-stone-50 text-sm font-medium text-stone-700 transition-colors"><Heart className="w-4 h-4" /> المفضلة</Link>
                      {isAdmin && <Link to="/admin/dashboard" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-stone-50 text-sm font-medium text-stone-700 transition-colors"><User className="w-4 h-4" /> لوحة التحكم</Link>}
                      <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-sm font-medium text-rose-600 transition-colors"><LogOut className="w-4 h-4" /> تسجيل الخروج</button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/auth" className="relative p-2.5 rounded-full hover:bg-stone-100 transition-colors" aria-label="تسجيل الدخول">
                  <User className="w-6 h-6 text-stone-800" />
                </Link>
              )}
              <button onClick={() => setIsOpen(true)} className="relative p-2.5 rounded-full hover:bg-stone-100 transition-colors" aria-label="السلة">
                <ShoppingBag className="w-6 h-6 text-stone-800" />
                {totalItems > 0 && <span className="absolute -top-0.5 -left-0.5 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center animate-scale-in" style={{ backgroundColor: settings.accentColor, color: settings.accentTextColor }}>{totalItems}</span>}
              </button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2.5 rounded-full hover:bg-stone-100 transition-colors" aria-label="القائمة">
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="lg:hidden pb-6 animate-slide-up max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث..." className="w-full pr-12 pl-4 py-3 rounded-full bg-stone-100 border border-transparent focus:bg-white focus:border-stone-300 focus:outline-none transition-all" />
                </div>
              </form>
              <nav className="flex flex-col gap-1">
                <Link to="/" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-stone-100 font-semibold text-stone-700">الرئيسية</Link>
                <Link to="/shop" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-stone-100 font-semibold text-stone-700">المتجر</Link>
                <Link to="/shop?sort=price-low" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-stone-100 font-semibold text-stone-700">العروض</Link>
                <div className="px-4 py-2 text-xs font-bold text-stone-400 uppercase tracking-wider">التصنيفات</div>
                {categories.map((cat) => renderCategoryMobile(cat, 0))}
                <div className="border-t border-stone-100 mt-2 pt-2">
                  <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-stone-100 font-semibold text-stone-700 flex items-center gap-2">
                    <Heart className="w-5 h-5" /> المفضلة ({wishCount})
                  </Link>
                  {session ? (
                    <>
                      <Link to="/orders" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-stone-100 font-semibold text-stone-700 flex items-center gap-2"><Package className="w-5 h-5" /> طلباتي</Link>
                      {isAdmin && <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-stone-100 font-semibold text-stone-700">لوحة التحكم</Link>}
                      <button onClick={() => { signOut(); setMobileOpen(false); }} className="w-full text-right px-4 py-3 rounded-xl hover:bg-rose-50 font-semibold text-rose-600 flex items-center gap-2"><LogOut className="w-5 h-5" /> تسجيل الخروج</button>
                    </>
                  ) : (
                    <Link to="/auth" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl hover:bg-stone-100 font-semibold text-stone-700 flex items-center gap-2"><User className="w-5 h-5" /> تسجيل الدخول</Link>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
