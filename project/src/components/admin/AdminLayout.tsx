import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Store, Menu, X, Star, FolderTree, Settings2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut, session, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!session || !isAdmin) navigate('/admin');
  }, [session, isAdmin, loading, navigate]);

  const navItems = [
    { label: 'الرئيسية', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'المنتجات', icon: Package, path: '/admin/products' },
    { label: 'الطلبات', icon: ShoppingCart, path: '/admin/orders' },
    { label: 'التصنيفات', icon: FolderTree, path: '/admin/categories' },
    { label: 'التقييمات', icon: Star, path: '/admin/reviews' },
    { label: 'الإعدادات', icon: Settings2, path: '/admin/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'fixed inset-0 z-50 bg-stone-950/50 lg:bg-transparent' : 'hidden'} lg:block lg:relative lg:z-0`}>
        <div className={`${sidebarOpen ? 'fixed top-0 right-0 bottom-0 w-72 bg-stone-950 lg:relative lg:w-64 lg:animate-none' : 'w-64'} h-full flex flex-col`}>
          <div className="p-6 border-b border-stone-800">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-stone-900 font-serif text-xl font-bold">ب</div>
              <div>
                <span className="font-serif text-xl font-bold text-white block leading-none">المهندس (بكرنيه)</span>
                <span className="text-[10px] text-stone-500 tracking-widest uppercase">Admin Panel</span>
              </div>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${isActive(item.path) ? 'bg-amber-500 text-stone-900' : 'text-stone-400 hover:bg-stone-800 hover:text-white'}`}>
                <item.icon className="w-5 h-5" /> {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-stone-800 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-400 hover:bg-stone-800 hover:text-white font-semibold transition-all">
              <Store className="w-5 h-5" /> عرض المتجر
            </Link>
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 font-semibold transition-all">
              <LogOut className="w-5 h-5" /> تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-stone-950 text-white p-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-stone-800">{sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          <span className="font-bold">لوحة التحكم</span>
          <div className="w-9" />
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
