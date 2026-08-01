import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronLeft, Loader2, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type Order, type OrderStatus, type OrderItem } from '@/lib/types';

export default function MyOrdersPage() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [itemsMap, setItemsMap] = useState<Record<string, OrderItem[]>>({});

  useEffect(() => {
    if (!authLoading && !session) navigate('/auth');
  }, [authLoading, session, navigate]);

  useEffect(() => {
    (async () => {
      if (!session) return;
      const { data } = await supabase.from('orders').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    })();
  }, [session]);

  const toggleExpand = async (orderId: string) => {
    if (expandedId === orderId) { setExpandedId(null); return; }
    setExpandedId(orderId);
    if (!itemsMap[orderId]) {
      const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId);
      setItemsMap({ ...itemsMap, [orderId]: data || [] });
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <h1 className="font-serif text-3xl font-bold text-stone-900 mb-2">طلباتي</h1>
      <p className="text-stone-500 mb-8">{orders.length} طلب</p>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-stone-300" />
          </div>
          <p className="text-stone-500 text-lg font-medium">لا توجد طلبات بعد</p>
          <p className="text-stone-400 text-sm mt-1">ابدأ التسوق واتمم أول طلب لك</p>
          <Link to="/shop" className="btn-primary mt-6 inline-flex">تصفح المنتجات</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card overflow-hidden">
              <button onClick={() => toggleExpand(order.id)} className="w-full flex items-center justify-between p-5 hover:bg-stone-50 transition-colors text-right">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500"><Package className="w-6 h-6" /></div>
                  <div>
                    <p className="font-bold text-stone-800">طلب #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-stone-400">{formatDateTime(order.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}>{ORDER_STATUS_LABELS[order.status as OrderStatus]}</span>
                  <span className="font-bold text-stone-900">{formatPrice(Number(order.total))}</span>
                  <ChevronLeft className={`w-5 h-5 text-stone-400 transition-transform ${expandedId === order.id ? '-rotate-90' : ''}`} />
                </div>
              </button>
              {expandedId === order.id && itemsMap[order.id] && (
                <div className="border-t border-stone-100 p-5 bg-stone-50/50 animate-slide-up">
                  <h4 className="font-bold text-stone-700 text-sm mb-3">المنتجات</h4>
                  <div className="space-y-2">
                    {itemsMap[order.id].map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm py-2">
                        <div>
                          <p className="font-medium text-stone-700">{item.product_name}</p>
                          <p className="text-xs text-stone-500">{item.quantity} × {formatPrice(Number(item.unit_price))}</p>
                        </div>
                        <span className="font-bold text-stone-900">{formatPrice(item.quantity * Number(item.unit_price))}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-stone-100 mt-3 pt-3 space-y-1">
                    <div className="flex justify-between text-sm text-stone-500"><span>الشحن</span><span>{Number(order.shipping_cost) === 0 ? 'مجاني' : formatPrice(Number(order.shipping_cost))}</span></div>
                    <div className="flex justify-between font-bold text-stone-900"><span>الإجمالي</span><span>{formatPrice(Number(order.total))}</span></div>
                  </div>
                  <div className="mt-4 text-sm text-stone-500">
                    <p><span className="text-stone-400">العنوان: </span>{order.shipping_address}، {order.city}</p>
                    {order.notes && <p><span className="text-stone-400">ملاحظات: </span>{order.notes}</p>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
