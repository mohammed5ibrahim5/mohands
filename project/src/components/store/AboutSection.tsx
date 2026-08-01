import { useSiteSettings } from '@/context/SiteSettingsContext';

export default function AboutSection() {
  const { settings } = useSiteSettings();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="grid gap-6 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm lg:grid-cols-3">
        <div className="rounded-2xl bg-stone-50 p-6">
          <h3 className="font-serif text-2xl font-bold text-stone-900">{settings.aboutTitle}</h3>
          <p className="mt-3 text-sm leading-7 text-stone-600">{settings.aboutDescription}</p>
        </div>
        <div className="rounded-2xl bg-stone-50 p-6">
          <h3 className="font-serif text-2xl font-bold text-stone-900">{settings.shippingTitle}</h3>
          <p className="mt-3 text-sm leading-7 text-stone-600">{settings.shippingDescription}</p>
        </div>
        <div className="rounded-2xl bg-stone-50 p-6">
          <h3 className="font-serif text-2xl font-bold text-stone-900">{settings.policyTitle}</h3>
          <p className="mt-3 text-sm leading-7 text-stone-600">{settings.policyDescription}</p>
        </div>
      </div>
    </section>
  );
}
