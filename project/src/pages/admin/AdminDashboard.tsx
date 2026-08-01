import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp, Clock, ArrowLeft, DollarSign, Users, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type Order, type OrderStatus } from '@/lib/types';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0, delivered: 0, reviews: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<{ product_name: string; total_qty: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ count: productCount }, { data: orders, count: orderCount }, { count: reviewCount }, { data: top }] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(6),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase.from('order_items').select('product_name, quantity').order('quantity', { ascending: false }).limit(5),
      ]);

      const allOrders = orders || [];
      const revenue = allOrders.reduce((sum, o) => sum + Number(o.total), 0);
      const pending = allOrders.filter((o) => o.status === 'pending').length;
      const delivered = allOrders.filter((o) => o.status === 'delivered').length;

      const productMap = new Map<string, number>();
      (top || []).forEach((t) => {
        productMap.set(t.product_name, (productMap.get(t.product_name) || 0) + t.quantity);
      });
      const topAgg = Array.from(productMap.entries()).map(([name, qty]) => ({ product_name: name, total_qty: qty })).sort((a, b) => b.total_qty - a.total_qty).slice(0, 5);

      setStats({ products: productCount || 0, orders: orderCount || 0, revenue, pending, delivered, reviews: reviewCount || 0 });
      setRecentOrders(allOrders);
      setTopProducts(topAgg);
      setLoading(false);
    })();
  }, []);

  const statCards = [
    { label: 'المنتجات', value: stats.products, icon: Package, color: 'bg-blue-50 text-blue-600', path: '/admin/products' },
    { label: 'الطلبات', value: stats.orders, icon: ShoppingCart, color: 'bg-amber-50 text-amber-600', path: '/admin/orders' },
    { label: 'الإيرادات', value: formatPrice(stats.revenue), icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', path: '/admin/orders' },
    { label: 'طلبات معلقة', value: stats.pending, icon: Clock, color: 'bg-rose-50 text-rose-600', path: '/admin/orders' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-stone-900">لوحة التحكم</h1>
        <p className="text-stone-500 mt-1">نظرة عامة على أداء متجرك</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <Link key={i} to={s.path} className="bg-white rounded-2xl p-5 border border-stone-100 hover:shadow-lg transition-shadow group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}><s.icon className="w-6 h-6" /></div>
              <ArrowLeft className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-stone-900">{s.value}</p>
            <p className="text-sm text-stone-500 mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-bold text-stone-800">أحدث الطلبات</h2>
            <Link to="/admin/orders" className="text-sm text-amber-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">عرض الكل <ArrowLeft className="w-4 h-4" /></Link>
          </div>
          {loading ? <div className="p-8 text-center text-stone-400">جاري التحميل...</div> : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-stone-400">لا توجد طلبات بعد</div>
          ) : (
            <div className="divide-y divide-stone-50">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-bold text-stone-800 truncate">{order.customer_name}</p>
                    <p className="text-xs text-stone-500">{formatDateTime(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}>{ORDER_STATUS_LABELS[order.status as OrderStatus]}</span>
                    <span className="font-bold text-stone-900 whitespace-nowrap">{formatPrice(Number(order.total))}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="p-5 border-b border-stone-100">
            <h2 className="font-bold text-stone-800">الأكثر مبيعاً</h2>
          </div>
          {topProducts.length === 0 ? (
            <div className="p-8 text-center text-stone-400">لا توجد بيانات</div>
          ) : (
            <div className="p-5 space-y-4">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-stone-200 text-stone-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-stone-100 text-stone-400'}`}>{i + 1}</div>
                  <p className="flex-1 text-sm font-medium text-stone-700 truncate">{p.product_name}</p>
                  <span className="text-sm font-bold text-stone-900">{p.total_qty}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-2xl p-5 border border-stone-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><TrendingUp className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold text-stone-900">{stats.delivered}</p><p className="text-sm text-stone-500">طلبات تم تسليمها</p></div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-stone-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600"><Users className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold text-stone-900">{stats.orders}</p><p className="text-sm text-stone-500">إجمالي العملاء</p></div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-stone-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600"><Star className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold text-stone-900">{stats.reviews}</p><p className="text-sm text-stone-500">إجمالي التقييمات</p></div>
        </div>
      </div>
    </AdminLayout>
  );
}
