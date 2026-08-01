import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { getSessionId, type Product } from '@/lib/types';

interface WishlistContextValue {
  productIds: string[];
  toggle: (product: Product) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  count: number;
}

const defaultWishlistContextValue: WishlistContextValue = {
  productIds: [],
  toggle: async () => undefined,
  isWishlisted: () => false,
  count: 0,
};

const WishlistContext = createContext<WishlistContextValue>(defaultWishlistContextValue);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>([]);
  const sessionId = getSessionId();

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('wishlist').select('product_id').eq('session_id', sessionId);
        if (!error) {
          setProductIds((data || []).map((r) => r.product_id));
        }
      } catch {
        setProductIds([]);
      }
    })();
  }, [sessionId]);

  const toggle = async (product: Product) => {
    try {
      if (productIds.includes(product.id)) {
        await supabase.from('wishlist').delete().eq('session_id', sessionId).eq('product_id', product.id);
        setProductIds((prev) => prev.filter((id) => id !== product.id));
      } else {
        await supabase.from('wishlist').insert({ session_id: sessionId, product_id: product.id });
        setProductIds((prev) => [...prev, product.id]);
      }
    } catch {
      setProductIds((prev) =>
        prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
      );
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
  return useContext(WishlistContext);
}
