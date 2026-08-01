import { useEffect, useMemo, useState } from 'react';
import { Save, RotateCcw, Palette, Type, Eye, EyeOff, Sparkles } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { defaultSiteSettings, useSiteSettings } from '@/context/SiteSettingsContext';

const sectionClass = 'rounded-2xl border p-5 shadow-sm';

export default function AdminSettings() {
  const { settings, updateSettings, resetSettings } = useSiteSettings();
  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const unsaved = useMemo(() => JSON.stringify(draft) !== JSON.stringify(settings), [draft, settings]);

  const handleSave = () => {
    updateSettings(draft);
  };

  const resetColorsToDefaults = () => {
    const nextSettings = {
      ...settings,
      accentColor: defaultSiteSettings.accentColor,
      accentTextColor: defaultSiteSettings.accentTextColor,
      pageBackgroundColor: defaultSiteSettings.pageBackgroundColor,
      cardBackgroundColor: defaultSiteSettings.cardBackgroundColor,
    };
    setDraft(nextSettings);
    updateSettings(nextSettings);
  };

  const resetDataToDefaults = () => {
    const { accentColor, accentTextColor, pageBackgroundColor, cardBackgroundColor, ...dataDefaults } = defaultSiteSettings;
    const nextSettings = {
      ...settings,
      ...dataDefaults,
    };
    setDraft(nextSettings);
    updateSettings(nextSettings);
  };

  const sectionStyle = {
    backgroundColor: settings.cardBackgroundColor,
    borderColor: `${settings.accentColor}33`,
  };
  const accentButtonStyle = {
    backgroundColor: settings.accentColor,
    color: settings.accentTextColor,
  };
  const accentTextStyle = { color: settings.accentColor };
  const previewSurfaceStyle = {
    backgroundColor: draft.pageBackgroundColor,
    borderColor: `${draft.accentColor}33`,
  };
  const previewCardStyle = {
    backgroundColor: draft.cardBackgroundColor,
    borderColor: `${draft.accentColor}22`,
  };
  const previewButtonStyle = {
    backgroundColor: draft.accentColor,
    color: draft.accentTextColor,
  };
  const previewButtonClass = draft.buttonStyle === 'outline'
    ? 'border border-current'
    : draft.buttonStyle === 'rounded'
      ? 'rounded-full'
      : 'rounded-xl';

  const updateField = (field: keyof typeof draft, value: string | boolean) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900" style={accentTextStyle}>إعدادات المتجر</h1>
          <p className="text-stone-500 mt-1">تحكم في الهوية البصرية والنصوص والميزات الظاهرة للموقع من مكان واحد.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={resetColorsToDefaults} className="flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition hover:bg-stone-100" style={{ borderColor: `${settings.accentColor}55`, color: settings.accentColor }}>
            <Palette className="w-4 h-4" /> إعادة الألوان
          </button>
          <button onClick={resetDataToDefaults} className="flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100">
            <RotateCcw className="w-4 h-4" /> إعادة البيانات
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition" style={accentButtonStyle}>
            <Save className="w-4 h-4" /> حفظ التغييرات
          </button>
        </div>
      </div>

      {unsaved && (
        <div className="mb-6 rounded-2xl border px-4 py-3 text-sm font-medium" style={{ backgroundColor: `${settings.accentColor}16`, borderColor: `${settings.accentColor}44`, color: settings.accentColor }}>
          توجد تغييرات غير محفوظة. اضغط على حفظ للتطبيق على المتجر فوراً.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className={sectionClass} style={sectionStyle}>
            <div className="mb-4 flex items-center gap-2">
              <Type className="w-5 h-5" style={{ color: settings.accentColor }} />
              <h2 className="text-lg font-bold text-stone-800">الهوية الأساسية</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-stone-700">
                اسم المتجر
                <input value={draft.storeName} onChange={(e) => updateField('storeName', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                الشعار/اللقب
                <input value={draft.storeTagline} onChange={(e) => updateField('storeTagline', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700 md:col-span-2">
                وصف المتجر
                <textarea value={draft.storeDescription} onChange={(e) => updateField('storeDescription', e.target.value)} className="input-field mt-2 min-h-24" />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                الهاتف
                <input value={draft.phone} onChange={(e) => updateField('phone', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                البريد الإلكتروني
                <input value={draft.email} onChange={(e) => updateField('email', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700 md:col-span-2">
                العنوان
                <input value={draft.address} onChange={(e) => updateField('address', e.target.value)} className="input-field mt-2" />
              </label>
            </div>
          </section>

          <section className={sectionClass} style={sectionStyle}>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: settings.accentColor }} />
              <h2 className="text-lg font-bold text-stone-800">النصوص الرئيسية</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-stone-700">
                شريط الإعلان
                <input value={draft.announcementText} onChange={(e) => updateField('announcementText', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                شارة هيرو
                <input value={draft.heroBadge} onChange={(e) => updateField('heroBadge', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                عنوان الهيرو
                <input value={draft.heroTitle} onChange={(e) => updateField('heroTitle', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                عنوان مميز
                <input value={draft.heroTitleHighlight} onChange={(e) => updateField('heroTitleHighlight', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700 md:col-span-2">
                وصف الهيرو
                <textarea value={draft.heroSubtitle} onChange={(e) => updateField('heroSubtitle', e.target.value)} className="input-field mt-2 min-h-24" />
              </label>
              <label className="text-sm font-semibold text-stone-700 md:col-span-2">
                رابط صورة الهيرو
                <input value={draft.heroImageUrl} onChange={(e) => updateField('heroImageUrl', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                زر أساسي
                <input value={draft.heroPrimaryCta} onChange={(e) => updateField('heroPrimaryCta', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                زر ثانوي
                <input value={draft.heroSecondaryCta} onChange={(e) => updateField('heroSecondaryCta', e.target.value)} className="input-field mt-2" />
              </label>
            </div>
          </section>

          <section className={sectionClass} style={sectionStyle}>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: settings.accentColor }} />
              <h2 className="text-lg font-bold text-stone-800">بنر الخصومات ووسائل التواصل</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-stone-700 md:col-span-2">
                عنوان بنر الخصومات
                <input value={draft.promoTitle} onChange={(e) => updateField('promoTitle', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700 md:col-span-2">
                وصف بنر الخصومات
                <textarea value={draft.promoSubtitle} onChange={(e) => updateField('promoSubtitle', e.target.value)} className="input-field mt-2 min-h-24" />
              </label>
              <label className="text-sm font-semibold text-stone-700 md:col-span-2">
                عنوان عن المتجر
                <input value={draft.aboutTitle} onChange={(e) => updateField('aboutTitle', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700 md:col-span-2">
                وصف عن المتجر
                <textarea value={draft.aboutDescription} onChange={(e) => updateField('aboutDescription', e.target.value)} className="input-field mt-2 min-h-24" />
              </label>
              <label className="text-sm font-semibold text-stone-700 md:col-span-2">
                عنوان الشحن
                <input value={draft.shippingTitle} onChange={(e) => updateField('shippingTitle', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700 md:col-span-2">
                وصف الشحن
                <textarea value={draft.shippingDescription} onChange={(e) => updateField('shippingDescription', e.target.value)} className="input-field mt-2 min-h-24" />
              </label>
              <label className="text-sm font-semibold text-stone-700 md:col-span-2">
                عنوان السياسات
                <input value={draft.policyTitle} onChange={(e) => updateField('policyTitle', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700 md:col-span-2">
                وصف السياسات
                <textarea value={draft.policyDescription} onChange={(e) => updateField('policyDescription', e.target.value)} className="input-field mt-2 min-h-24" />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                نص الزر
                <input value={draft.promoCta} onChange={(e) => updateField('promoCta', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                نسبة الخصم
                <input value={draft.promoDiscountPercent} onChange={(e) => updateField('promoDiscountPercent', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                Instagram
                <input value={draft.socialInstagram} onChange={(e) => updateField('socialInstagram', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                Facebook
                <input value={draft.socialFacebook} onChange={(e) => updateField('socialFacebook', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                Twitter/X
                <input value={draft.socialTwitter} onChange={(e) => updateField('socialTwitter', e.target.value)} className="input-field mt-2" />
              </label>
              <label className="text-sm font-semibold text-stone-700 md:col-span-2">
                WhatsApp
                <input value={draft.socialWhatsapp} onChange={(e) => updateField('socialWhatsapp', e.target.value)} className="input-field mt-2" />
              </label>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className={sectionClass} style={sectionStyle}>
            <div className="mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" style={{ color: settings.accentColor }} />
              <h2 className="text-lg font-bold text-stone-800">معاينة المتجر</h2>
            </div>
            <div className="rounded-3xl border p-4 shadow-inner" style={previewSurfaceStyle}>
              <div className="overflow-hidden rounded-[1.75rem] border" style={previewCardStyle}>
                <div className="flex items-center justify-between rounded-full border px-3 py-2 text-xs font-semibold" style={{ borderColor: `${draft.accentColor}44`, color: draft.accentColor, margin: '12px' }}>
                  <span>{draft.announcementText || 'توصيل مجاني'}</span>
                  <span>Live Preview</span>
                </div>
                <div className="space-y-4 p-4 sm:p-5">
                  <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white/80 px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-bold" style={{ backgroundColor: draft.accentColor, color: draft.accentTextColor }}>
                        ب
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-stone-900">{draft.storeName}</h3>
                        <p className="text-sm text-stone-500">{draft.storeTagline}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-600">المتجر</div>
                      <div className="rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-600">العروض</div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] p-4 sm:p-5" style={{ background: `linear-gradient(135deg, ${draft.accentColor}20 0%, ${draft.cardBackgroundColor} 100%)` }}>
                    <p className="mb-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${draft.accentColor}22`, color: draft.accentColor }}>{draft.heroBadge || 'تشكيلة جديدة'}</p>
                    <h4 className="font-serif text-2xl font-bold text-stone-900">{draft.heroTitle} <span style={{ color: draft.accentColor }}>{draft.heroTitleHighlight}</span></h4>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{draft.heroSubtitle}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button className={`px-4 py-2 text-sm font-semibold ${previewButtonClass}`} style={previewButtonStyle}>{draft.heroPrimaryCta}</button>
                      <button className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700">{draft.heroSecondaryCta}</button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[draft.heroStat1Label, draft.heroStat2Label, draft.heroStat3Label].map((label, idx) => (
                      <div key={label} className="rounded-2xl border border-stone-200 bg-white/80 p-3 text-center">
                        <div className="text-lg font-bold" style={{ color: draft.accentColor }}>{['+5000', '+800', '4.9'][idx]}</div>
                        <div className="text-sm text-stone-500">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-white/80 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <h5 className="font-semibold text-stone-800">أشهر المنتجات</h5>
                      <span className="text-xs font-semibold" style={{ color: draft.accentColor }}>عرض كل شيء</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {[{ title: 'أدوات مكتبية', price: '١٢٩ ج.م' }, { title: 'دفاتر فاخرة', price: '٨٩ ج.م' }].map((item, idx) => (
                        <div key={item.title} className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
                          <div className="mb-3 h-24 rounded-xl" style={{ background: idx === 0 ? `linear-gradient(135deg, ${draft.accentColor}22, #fff)` : 'linear-gradient(135deg, #fde68a, #fff)' }} />
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <h6 className="font-semibold text-stone-800">{item.title}</h6>
                              <p className="text-sm text-stone-500">{draft.storeDescription}</p>
                            </div>
                            <span className="rounded-full px-3 py-1 text-sm font-semibold" style={{ backgroundColor: `${draft.accentColor}18`, color: draft.accentColor }}>{item.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={sectionClass} style={sectionStyle}>
            <div className="mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" style={{ color: settings.accentColor }} />
              <h2 className="text-lg font-bold text-stone-800">الألوان والتنسيق</h2>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-semibold text-stone-700">
                اللون الأساسي
                <input type="color" value={draft.accentColor} onChange={(e) => updateField('accentColor', e.target.value)} className="mt-2 h-12 w-full cursor-pointer rounded-xl border border-stone-200 p-1" />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                لون النص على اللون الأساسي
                <input type="color" value={draft.accentTextColor} onChange={(e) => updateField('accentTextColor', e.target.value)} className="mt-2 h-12 w-full cursor-pointer rounded-xl border border-stone-200 p-1" />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                خلفية الصفحة
                <input type="color" value={draft.pageBackgroundColor} onChange={(e) => updateField('pageBackgroundColor', e.target.value)} className="mt-2 h-12 w-full cursor-pointer rounded-xl border border-stone-200 p-1" />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                خلفية البطاقات
                <input type="color" value={draft.cardBackgroundColor} onChange={(e) => updateField('cardBackgroundColor', e.target.value)} className="mt-2 h-12 w-full cursor-pointer rounded-xl border border-stone-200 p-1" />
              </label>
              <label className="text-sm font-semibold text-stone-700">
                نمط الأزرار
                <select value={draft.buttonStyle} onChange={(e) => updateField('buttonStyle', e.target.value)} className="input-field mt-2">
                  <option value="filled">مملوء</option>
                  <option value="outline">حدود فقط</option>
                  <option value="rounded">مستدير</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-stone-700">
                شكل الهيرو
                <select value={draft.heroLayout} onChange={(e) => updateField('heroLayout', e.target.value)} className="input-field mt-2">
                  <option value="classic">كلاسيكي</option>
                  <option value="split">مقسم</option>
                  <option value="minimal">مبسط</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-stone-700">
                تباعد الأقسام
                <select value={draft.sectionSpacing} onChange={(e) => updateField('sectionSpacing', e.target.value)} className="input-field mt-2">
                  <option value="compact">مضغوط</option>
                  <option value="normal">عادي</option>
                  <option value="spacious">واسع</option>
                </select>
              </label>
            </div>
          </section>

          <section className={sectionClass} style={sectionStyle}>
            <div className="mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" style={{ color: settings.accentColor }} />
              <h2 className="text-lg font-bold text-stone-800">العناصر الظاهرة</h2>
            </div>
            <div className="space-y-3">
              {[
                ['showAnnouncementBar', 'شريط الإعلان'],
                ['showNewsletter', 'قسم النشرة البريدية'],
                ['showTestimonials', 'أقسام التقييمات'],
                ['showCategorySection', 'قسم التصنيفات'],
                ['showFeaturedSection', 'قسم المنتجات المميزة'],
                ['showPromoSection', 'بنر الخصومات'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-700">
                  <span>{label}</span>
                  <button type="button" onClick={() => updateField(key as keyof typeof draft, !draft[key as keyof typeof draft])} className={`flex items-center gap-2 rounded-full px-3 py-2 ${draft[key as keyof typeof draft] ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-700'}`}>
                    {draft[key as keyof typeof draft] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {draft[key as keyof typeof draft] ? 'مرئي' : 'مخفي'}
                  </button>
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
