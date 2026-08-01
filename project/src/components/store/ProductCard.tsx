import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Eye, Heart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-stone-200 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        <Link to={`/product/${product.id}`}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300"><ShoppingBag className="w-12 h-12" /></div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {discount > 0 && <span className="badge bg-rose-500 text-white shadow-md">خصم {discount}%</span>}
          {product.featured && <span className="badge bg-amber-500 text-stone-900 shadow-md">مميز</span>}
          {product.stock === 0 && <span className="badge bg-stone-800 text-white shadow-md">نفذ</span>}
        </div>

        {/* Wishlist button */}
        <button
          onClick={() => toggle(product)}
          className={`absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
            isWishlisted(product.id) ? 'bg-rose-500 text-white' : 'bg-white/90 text-stone-600 hover:bg-white hover:scale-110'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? 'fill-current' : ''}`} />
        </button>

        {/* Quick actions */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
          <Link to={`/product/${product.id}`} className="flex-1 bg-white/95 backdrop-blur text-stone-700 text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-white transition-colors shadow-md">
            <Eye className="w-4 h-4" /> عرض
          </Link>
          <button onClick={() => addItem(product)} disabled={product.stock === 0} className="flex-1 bg-stone-900 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-stone-800 transition-colors shadow-md disabled:opacity-50">
            <ShoppingBag className="w-4 h-4" /> أضف
          </button>
        </div>
      </div>

      <div className="p-4">
        {product.brand && <span className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">{product.brand}</span>}
        {product.category && <span className="text-xs text-amber-600 font-medium block">{product.category.name}</span>}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-stone-800 mt-1 line-clamp-2 hover:text-amber-600 transition-colors leading-snug">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mt-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
            ))}
          </div>
          <span className="text-xs text-stone-400">({product.rating.toFixed(1)})</span>
        </div>
        <div className="flex items-baseline gap-2 mt-3">
          <span className="text-lg font-bold text-stone-900">{formatPrice(product.price)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-sm text-stone-400 line-through">{formatPrice(product.compare_at_price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
