import { X, Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const shipping = totalPrice >= 500 || totalPrice === 0 ? 0 : 40;
  const grandTotal = totalPrice + shipping;

  return (
    <>
      <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 animate-fade-in" onClick={() => setIsOpen(false)} />
      <div className="fixed top-0 left-0 bottom-0 w-full max-w-md bg-stone-50 z-50 shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-5 bg-stone-900 text-white">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold">سلة التسوق ({totalItems})</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-stone-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-stone-300" />
            </div>
            <p className="text-stone-500 text-lg font-medium">سلتك فارغة</p>
            <p className="text-stone-400 text-sm">ابدأ التسوق واكتشف منتجاتنا المميزة</p>
            <button onClick={() => setIsOpen(false)} className="btn-primary mt-2">تصفح المنتجات</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3 p-3 rounded-2xl bg-white border border-stone-100">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-50 shrink-0">
                    {item.product.image_url && <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-stone-800 line-clamp-1">{item.product.name}</h4>
                    {item.product.brand && <p className="text-xs text-stone-400">{item.product.brand}</p>}
                    <p className="text-stone-900 font-bold text-sm mt-1">{formatPrice(item.product.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-stone-200 rounded-lg">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-stone-100 transition-colors rounded-r-lg">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock} className="w-7 h-7 flex items-center justify-center hover:bg-stone-100 transition-colors rounded-l-lg disabled:opacity-40">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.product.id)} className="mr-auto p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-200 p-5 space-y-3 bg-white">
              <div className="flex justify-between text-sm text-stone-500">
                <span>المجموع الفرعي</span>
                <span className="font-semibold text-stone-700">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-500">
                <span>الشحن</span>
                <span className="font-semibold text-stone-700">{shipping === 0 ? 'مجاني' : formatPrice(shipping)}</span>
              </div>
              {totalPrice < 500 && totalPrice > 0 && (
                <div className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2 text-center">
                  أضف {formatPrice(500 - totalPrice)} للحصول على توصيل مجاني!
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-stone-100">
                <span className="font-bold text-stone-800">الإجمالي</span>
                <span className="text-xl font-bold text-stone-900">{formatPrice(grandTotal)}</span>
              </div>
              <button onClick={() => { setIsOpen(false); navigate('/checkout'); }} className="btn-primary w-full">
                إتمام الطلب <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
