import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { SiteSettings } from '@/lib/types';

const STORAGE_KEY = 'mohands_site_settings';

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
  footerDescription: 'متجرك الأول للأدوات المكتبية الفاخرة في مصر. نوفّر منتجات عالية الجودة من أفضل العلامات التجارية العالمية بأسعار تنافسية.',
  footerNote: '© 2026 المهندس (بكرنيه). جميع الحقوق محفوظة.',
  accentColor: '#f59e0b',
  accentTextColor: '#111827',
  showAnnouncementBar: true,
  showNewsletter: true,
  showTestimonials: true,
};

interface SiteSettingsContextValue {
  settings: SiteSettings;
  updateSettings: (updates: Partial<SiteSettings>) => void;
  resetSettings: () => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<SiteSettings>;
        setSettings({ ...defaultSiteSettings, ...parsed });
      }
    } catch {
      // Ignore malformed storage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(defaultSiteSettings);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(() => ({ settings, updateSettings, resetSettings }), [settings]);

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return context;
}
