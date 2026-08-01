import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getSessionId, type Product } from '@/lib/types';

interface WishlistContextValue {
  productIds: string[];
  toggle: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>([]);
  const sessionId = getSessionId();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('wishlist').select('product_id').eq('session_id', sessionId);
      setProductIds((data || []).map((r) => r.product_id));
    })();
  }, [sessionId]);

  const toggle = async (product: Product) => {
    if (productIds.includes(product.id)) {
      await supabase.from('wishlist').delete().eq('session_id', sessionId).eq('product_id', product.id);
      setProductIds((prev) => prev.filter((id) => id !== product.id));
    } else {
      await supabase.from('wishlist').insert({ session_id: sessionId, product_id: product.id });
      setProductIds((prev) => [...prev, product.id]);
    }
  };

  const isWishlisted = (productId: string) => productIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ productIds, toggle, isWishlisted, count: productIds.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
