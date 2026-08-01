import { useEffect, useState } from 'react';
import { Search, Loader2, ShoppingCart, Eye, X, Package, Phone, MapPin, Mail, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type Order, type OrderStatus, type OrderItem } from '@/lib/types';
import AdminLayout from '@/components/admin/AdminLayout';

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [updating, setUpdating] = useState(false);

  const loadOrders = async () => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (statusFilter) query = query.eq('status', statusFilter);
    if (search) query = query.ilike('customer_name', `%${search}%`);
    const { data } = await query;
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { setLoading(true); loadOrders(); }, [statusFilter]);
  useEffect(() => { const t = setTimeout(loadOrders, 300); return () => clearTimeout(t); }, [search]);

  const openOrder = async (order: Order) => {
    setViewOrder(order);
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    setOrderItems(data || []);
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdating(true);
    await supabase.from('orders').update({ status }).eq('id', orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    if (viewOrder?.id === orderId) setViewOrder({ ...viewOrder, status });
    setUpdating(false);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-stone-900">الطلبات</h1>
        <p className="text-stone-500 mt-1">{orders.length} طلب</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم العميل..." className="w-full pr-10 pl-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all sm:w-48">
          <option value="">كل الحالات</option>
          {STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-stone-400 mx-auto" /></div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center"><ShoppingCart className="w-12 h-12 text-stone-200 mx-auto mb-3" /><p className="text-stone-400">لا توجد طلبات</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="text-right text-xs font-bold text-stone-500 uppercase px-4 py-3">العميل</th>
                  <th className="text-right text-xs font-bold text-stone-500 uppercase px-4 py-3 hidden sm:table-cell">المدينة</th>
                  <th className="text-right text-xs font-bold text-stone-500 uppercase px-4 py-3">الإجمالي</th>
                  <th className="text-right text-xs font-bold text-stone-500 uppercase px-4 py-3">الحالة</th>
                  <th className="text-right text-xs font-bold text-stone-500 uppercase px-4 py-3 hidden md:table-cell">التاريخ</th>
                  <th className="text-right text-xs font-bold text-stone-500 uppercase px-4 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3"><p className="font-bold text-stone-800 text-sm">{order.customer_name}</p><p className="text-xs text-stone-500">{order.customer_phone}</p></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><span className="text-sm text-stone-600">{order.city}</span></td>
                    <td className="px-4 py-3"><span className="font-bold text-stone-900 text-sm">{formatPrice(Number(order.total))}</span></td>
                    <td className="px-4 py-3">
                      <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)} disabled={updating} className={`text-xs font-bold px-2.5 py-1.5 rounded-full border cursor-pointer ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}>
                        {STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs text-stone-500">{formatDateTime(order.created_at)}</span></td>
                    <td className="px-4 py-3"><button onClick={() => openOrder(order)} className="p-2 rounded-lg text-stone-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"><Eye className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {viewOrder && (
        <>
          <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 animate-fade-in" onClick={() => setViewOrder(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto animate-scale-in">
              <div className="flex items-center justify-between p-5 border-b border-stone-100 sticky top-0 bg-white rounded-t-2xl z-10">
                <h2 className="font-bold text-stone-800 text-lg">تفاصيل الطلب</h2>
                <button onClick={() => setViewOrder(null)} className="p-2 rounded-full hover:bg-stone-100 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-stone-400" /><div><p className="text-xs text-stone-400">الهاتف</p><p className="font-semibold text-stone-800 text-sm">{viewOrder.customer_phone}</p></div></div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-stone-400" /><div><p className="text-xs text-stone-400">المدينة</p><p className="font-semibold text-stone-800 text-sm">{viewOrder.city}</p></div></div>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-stone-400" /><div><p className="text-xs text-stone-400">التاريخ</p><p className="font-semibold text-stone-800 text-sm">{formatDateTime(viewOrder.created_at)}</p></div></div>
                  {viewOrder.customer_email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-stone-400" /><div><p className="text-xs text-stone-400">البريد</p><p className="font-semibold text-stone-800 text-sm truncate">{viewOrder.customer_email}</p></div></div>}
                </div>
                <div>
                  <p className="text-xs text-stone-400 mb-1">العميل</p><p className="font-bold text-stone-800">{viewOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-400 mb-1">العنوان</p><p className="font-semibold text-stone-800 text-sm">{viewOrder.shipping_address}</p>
                </div>
                {viewOrder.notes && <div><p className="text-xs text-stone-400 mb-1">ملاحظات</p><p className="font-semibold text-stone-800 text-sm">{viewOrder.notes}</p></div>}

                <div className="border-t border-stone-100 pt-4">
                  <h3 className="font-bold text-stone-800 text-sm mb-3 flex items-center gap-2"><Package className="w-4 h-4" /> المنتجات</h3>
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-stone-50">
                        <div><p className="font-medium text-stone-700">{item.product_name}</p><p className="text-xs text-stone-500">{item.quantity} × {formatPrice(Number(item.unit_price))}</p></div>
                        <span className="font-bold text-stone-900">{formatPrice(item.quantity * Number(item.unit_price))}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-3 mt-2">
                    <div className="text-sm text-stone-500"><span>الشحن: </span><span className="font-semibold">{Number(viewOrder.shipping_cost) === 0 ? 'مجاني' : formatPrice(Number(viewOrder.shipping_cost))}</span></div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-stone-100 mt-2">
                    <span className="font-bold text-stone-800">الإجمالي</span><span className="text-xl font-bold text-stone-900">{formatPrice(Number(viewOrder.total))}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-stone-400 mb-2">تغيير الحالة</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button key={s} onClick={() => updateStatus(viewOrder.id, s)} className={`text-xs font-bold px-3 py-2 rounded-full border transition-all ${viewOrder.status === s ? ORDER_STATUS_COLORS[s] + ' ring-2 ring-offset-1 ring-current' : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'}`}>{ORDER_STATUS_LABELS[s]}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
