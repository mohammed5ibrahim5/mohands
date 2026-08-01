import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/lib/types';

const STORAGE_KEY = 'mohands_site_settings';
const SETTINGS_ROW_ID = 1;

export const defaultSiteSettings: SiteSettings = {
  storeName: 'المهندس (بكرنيه)',
  storeTagline: 'Stationery Co.',
  storeDescription: 'متجرنا الأول للأدوات المكتبية الفاخرة في مصر. نوفّر منتجات عالية الجودة من أفضل العلامات التجارية العالمية بأسعار تنافسية.',
  phone: '0100 123 4567',
  email: 'info@mohandes-bakarnia.com',
  address: 'القاهرة، جمهورية مصر العربية',
  announcementText: 'توصيل مجاني للطلبات فوق 500 ج.م',
  heroBadge: 'تشكيلة 2026 وصلت الآن',
  heroTitle: 'كل ما يحتاجه',
  heroTitleHighlight: 'مكتبك الفاخر',
  heroSubtitle: 'اكتشف تشكيلتنا الواسعة من الأدوات المكتبية وقراطيس من أفضل العلامات التجارية العالمية. جودة استثنائية وأسعار تنافسية وتوصيل سريع.',
  heroPrimaryCta: 'تسوّق الآن',
  heroSecondaryCta: 'الدفاتر والمذكرات',
  heroImageUrl: 'https://images.pexels.com/photos/6340707/pexels-photo-6340707.jpeg?auto=compress&cs=tinysrgb&w=1200',
  promoTitle: 'خصومات تصل إلى 40% على الأدوات المكتبية',
  promoSubtitle: 'لفترة محدودة فقط! استمتع بخصومات حصرية على تشكيلة واسعة من منتجاتنا المميزة.',
  promoCta: 'اطلب الآن قبل نفاد الكمية',
  promoDiscountPercent: '40%',
  socialInstagram: '#',
  socialFacebook: '#',
  socialTwitter: '#',
  socialWhatsapp: 'https://wa.me/201001234567',
  heroStat1Value: '+5000',
  heroStat1Label: 'عميل سعيد',
  heroStat2Value: '+800',
  heroStat2Label: 'منتج متنوع',
  heroStat3Value: '4.9',
  heroStat3Label: 'تقييم العملاء',
  feature1Title: 'توصيل سريع',
  feature1Description: 'خلال 2-5 أيام لكل المحافظات',
  feature2Title: 'ضمان الجودة',
  feature2Description: 'منتجات أصلية 100%',
  feature3Title: 'إرجاع مجاني',
  feature3Description: 'خلال 14 يوم من الاستلام',
  feature4Title: 'دفع عند الاستلام',
  feature4Description: 'ادفع وقت ما توصلك',
  newsletterTitle: 'انضم لنشرتنا البريدية',
  newsletterSubtitle: 'احصل على خصم 10% على أول طلب + عروض حصرية أسبوعياً',
  aboutTitle: 'من نحن؟',
  aboutDescription: 'نحن متجر متخصص في الأدوات المكتبية الفاخرة، ونحرص على توفير منتجات عالية الجودة مع خدمة عملاء مميزة وشحن موثوق.',
  shippingTitle: 'الشحن والتوصيل',
  shippingDescription: 'نوفر شحن سريع لجميع المحافظات، مع توصيل مجاني للطلبات التي تتجاوز 500 جنيه مصري.',
  policyTitle: 'سياسات الإرجاع والاستبدال',
  policyDescription: 'يمكنك إرجاع أو استبدال المنتج خلال 14 يومًا من تاريخ الاستلام إذا كان بحالة سليمة وغير مستخدم.',
  footerDescription: 'متجرك الأول للأدوات المكتبية الفاخرة في مصر. نوفّر منتجات عالية الجودة من أفضل العلامات التجارية العالمية بأسعار تنافسية.',
  footerNote: '© 2026 المهندس (بكرنيه). جميع الحقوق محفوظة.',
  accentColor: '#f59e0b',
  accentTextColor: '#111827',
  showAnnouncementBar: true,
  showNewsletter: true,
  showTestimonials: true,
  showAboutSection: true,
  showNewArrivalsSection: true,
  pageBackgroundColor: '#faf8f5',
  cardBackgroundColor: '#ffffff',
  cardRadius: 'rounded-2xl',
  buttonStyle: 'filled',
  heroLayout: 'classic',
  showCategorySection: true,
  showFeaturedSection: true,
  showPromoSection: true,
  sectionSpacing: 'normal',
};

interface SiteSettingsContextValue {
  settings: SiteSettings;
  updateSettings: (updates: Partial<SiteSettings>) => void;
  resetSettings: () => void;
}

const defaultSiteSettingsContextValue: SiteSettingsContextValue = {
  settings: defaultSiteSettings,
  updateSettings: () => undefined,
  resetSettings: () => undefined,
};

const SiteSettingsContext = createContext<SiteSettingsContextValue>(defaultSiteSettingsContextValue);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        let initialSettings = defaultSiteSettings;

        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved) as Partial<SiteSettings>;
            initialSettings = { ...defaultSiteSettings, ...parsed };
          }
        } catch {
          initialSettings = defaultSiteSettings;
        }

        try {
          const { data, error } = await supabase
            .from('site_settings')
            .select('settings')
            .eq('id', SETTINGS_ROW_ID)
            .maybeSingle();

          if (!error && data?.settings) {
            initialSettings = { ...initialSettings, ...(data.settings as Partial<SiteSettings>) };
          }
        } catch {
          // Ignore failed Supabase sync; the UI still uses local defaults.
        }

        if (isMounted) {
          setSettings(initialSettings);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSettings));
          } catch {
            // Ignore storage failures
          }
        }
      } catch {
        // Ignore malformed storage or failed sync
      } finally {
        if (isMounted) {
          setHasLoaded(true);
        }
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage failures
    }

    const syncToSupabase = async () => {
      try {
        await supabase.from('site_settings').upsert(
          {
            id: SETTINGS_ROW_ID,
            settings,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      } catch {
        // Ignore sync failures; the UI still works locally
      }
    };

    void syncToSupabase();
  }, [hasLoaded, settings]);

  const updateSettings = (updates: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    const nextSettings = defaultSiteSettings;
    setSettings(nextSettings);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures
    }
    void supabase.from('site_settings').upsert(
      {
        id: SETTINGS_ROW_ID,
        settings: nextSettings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    ).catch(() => undefined);
  };

  const value = useMemo(() => ({ settings, updateSettings, resetSettings }), [settings]);

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
