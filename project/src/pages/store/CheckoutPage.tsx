import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, ShoppingBag, CreditCard, Truck, MapPin, User, Phone, Mail } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', customer_email: '',
    shipping_address: '', city: '', notes: '', payment_method: 'cod',
  });

  useEffect(() => {
    if (!session) { navigate('/auth'); return; }
    if (profile) {
      setForm((prev) => ({
        ...prev,
        customer_name: profile.full_name || '',
        customer_phone: profile.phone || '',
        customer_email: session.user.email || '',
      }));
    } else if (session) {
      setForm((prev) => ({ ...prev, customer_email: session.user.email || '' }));
    }
  }, [session, profile, navigate]);

  const shipping = totalPrice >= 500 || totalPrice === 0 ? 0 : 40;
  const grandTotal = totalPrice + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !session) return;
    setLoading(true);

    const { data: order, error } = await supabase.from('orders').insert({
      user_id: session.user.id,
      customer_name: form.customer_name, customer_phone: form.customer_phone,
      customer_email: form.customer_email || null, shipping_address: form.shipping_address,
      city: form.city, notes: form.notes || null, total: grandTotal,
      shipping_cost: shipping, payment_method: form.payment_method, status: 'pending',
    }).select().single();

    if (error) { setLoading(false); alert('حدث خطأ، حاول مرة أخرى'); return; }

    await supabase.from('order_items').insert(items.map((item) => ({
      order_id: order.id, product_id: item.product.id, product_name: item.product.name,
      quantity: item.quantity, unit_price: item.product.price,
    })));

    setLoading(false); setSuccess(true); clearCart();
    setTimeout(() => navigate('/orders'), 3500);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center animate-scale-in">
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <Check className="w-12 h-12 text-emerald-600" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">تم استلام طلبك!</h1>
        <p className="text-stone-500 mt-3 text-lg">شكراً لثقتك بنا. سنتواصل معك قريباً لتأكيد الطلب وتفاصيل التوصيل.</p>
        <div className="card p-4 mt-6 text-right">
          <div className="flex justify-between text-sm mb-2"><span className="text-stone-500">طريقة الدفع</span><span className="font-semibold">دفع عند الاستلام</span></div>
          <div className="flex justify-between text-sm"><span className="text-stone-500">مدة التوصيل</span><span className="font-semibold">2-5 أيام عمل</span></div>
        </div>
        <p className="text-sm text-stone-400 mt-4">سيتم تحويلك لصفحة طلباتك...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 text-stone-300" />
        </div>
        <h1 className="text-xl font-bold text-stone-800">سلتك فارغة</h1>
        <p className="text-stone-500 mt-2">أضف منتجات قبل إتمام الطلب.</p>
        <button onClick={() => navigate('/shop')} className="btn-primary mt-6">تصفح المنتجات</button>
      </div>
    );
  }

  const inputIcon = (Icon: React.ElementType) => (
    <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mb-8">إتمام الطلب</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-bold text-stone-800 mb-5 flex items-center gap-2"><User className="w-5 h-5 text-amber-600" /> بيانات العميل</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">الاسم الكامل *</label>
                <div className="relative">
                  {inputIcon(User)}
                  <input required type="text" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="input-field pr-10" placeholder="أدخل اسمك" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">رقم الهاتف *</label>
                <div className="relative">
                  {inputIcon(Phone)}
                  <input required type="tel" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className="input-field pr-10" placeholder="01xxxxxxxxx" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-600 mb-1.5">البريد الإلكتروني</label>
                <div className="relative">
                  {inputIcon(Mail)}
                  <input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className="input-field pr-10 bg-stone-50" readOnly />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-stone-800 mb-5 flex items-center gap-2"><MapPin className="w-5 h-5 text-amber-600" /> عنوان التوصيل</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">المدينة *</label>
                <input required type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" placeholder="القاهرة" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-600 mb-1.5">العنوان بالتفصيل *</label>
                <input required type="text" value={form.shipping_address} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} className="input-field" placeholder="الحي، الشارع، رقم المبنى، الدور" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-600 mb-1.5">ملاحظات (اختياري)</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field min-h-[80px] resize-none" placeholder="أي تعليمات إضافية للتوصيل" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-stone-800 mb-5 flex items-center gap-2"><CreditCard className="w-5 h-5 text-amber-600" /> طريقة الدفع</h2>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.payment_method === 'cod' ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-stone-300'}`}>
                <input type="radio" name="payment" value="cod" checked={form.payment_method === 'cod'} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="accent-amber-600" />
                <Truck className="w-6 h-6 text-stone-600" />
                <div>
                  <p className="font-bold text-stone-800">الدفع عند الاستلام</p>
                  <p className="text-sm text-stone-500">ادفع نقداً عند وصول الطلب</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-28">
            <h2 className="font-bold text-stone-800 mb-4">ملخص الطلب</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3 text-sm">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-50 shrink-0 relative">
                    {item.product.image_url && <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />}
                    <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center">{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-700 line-clamp-1">{item.product.name}</p>
                    <p className="text-stone-500 text-xs">{formatPrice(item.product.price)}</p>
                  </div>
                  <span className="font-semibold text-stone-700 text-sm whitespace-nowrap">{formatPrice(item.quantity * item.product.price)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-stone-500"><span>المجموع الفرعي</span><span className="font-semibold text-stone-700">{formatPrice(totalPrice)}</span></div>
              <div className="flex justify-between text-sm text-stone-500"><span>الشحن</span><span className="font-semibold text-stone-700">{shipping === 0 ? 'مجاني' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between items-baseline pt-2 border-t border-stone-100">
                <span className="font-bold text-stone-800">الإجمالي</span>
                <span className="text-2xl font-bold text-stone-900">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-6 disabled:opacity-60">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري الإرسال...</> : 'تأكيد الطلب'}
            </button>
            <p className="text-xs text-stone-400 text-center mt-3">بتأكيد الطلب أنت توافق على الشروط والأحكام</p>
          </div>
        </div>
      </form>
    </div>
  );
}
