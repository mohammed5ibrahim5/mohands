import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSiteSettings } from './SiteSettingsContext';
import { useWishlist } from './WishlistContext';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
      insert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockResolvedValue({ error: null }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
  supabaseAdmin: {
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
  isSupabaseConfigured: true,
}));

describe('context hooks', () => {
  it('return safe defaults when used outside providers', () => {
    const siteSettings = renderHook(() => useSiteSettings());
    expect(siteSettings.result.current.settings.storeName).toBe('المهندس (بكرنيه)');
    expect(siteSettings.result.current.updateSettings).toBeTypeOf('function');

    const wishlist = renderHook(() => useWishlist());
    expect(wishlist.result.current.productIds).toEqual([]);
    expect(wishlist.result.current.count).toBe(0);
  });
});
