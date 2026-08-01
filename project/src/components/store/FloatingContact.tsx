import { MessageCircle } from 'lucide-react';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export default function FloatingContact() {
  const { settings } = useSiteSettings();

  if (!settings.socialWhatsapp) return null;

  return (
    <a
      href={settings.socialWhatsapp}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 left-5 z-50 flex items-center gap-3 rounded-full bg-emerald-600 px-4 py-3 text-white shadow-2xl transition hover:scale-105 hover:bg-emerald-700"
      aria-label="تواصل عبر واتساب"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="hidden text-sm font-semibold sm:inline">تواصل واتساب</span>
    </a>
  );
}
