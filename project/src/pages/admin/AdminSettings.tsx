import { useMemo, useState } from 'react';
import { Save, RotateCcw, Palette, Type, Eye, EyeOff, Sparkles } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const sectionClass = 'rounded-2xl border border-stone-200 bg-white p-5 shadow-sm';

export default function AdminSettings() {
  const { settings, updateSettings, resetSettings } = useSiteSettings();
  const [draft, setDraft] = useState(settings);

  const unsaved = useMemo(() => JSON.stringify(draft) !== JSON.stringify(settings), [draft, settings]);

  const handleSave = () => {
    updateSettings(draft);
  };

  const handleReset = () => {
    resetSettings();
    setDraft({ ...settings });
  };

  const updateField = (field: keyof typeof draft, value: string | boolean) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">إعدادات المتجر</h1>
          <p className="text-stone-500 mt-1">تحكم في الهوية البصرية والنصوص والميزات الظاهرة للموقع من مكان واحد.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReset} className="flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100">
            <RotateCcw className="w-4 h-4" /> إعادة تعيين
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700">
            <Save className="w-4 h-4" /> حفظ التغييرات
          </button>
        </div>
      </div>

      {unsaved && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          توجد تغييرات غير محفوظة. اضغط على حفظ للتطبيق على المتجر فوراً.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className={sectionClass}>
            <div className="mb-4 flex items-center gap-2">
              <Type className="w-5 h-5 text-amber-600" />
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

          <section className={sectionClass}>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
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
        </div>

        <div className="space-y-6">
          <section className={sectionClass}>
            <div className="mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-600" />
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
            </div>
          </section>

          <section className={sectionClass}>
            <div className="mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-stone-800">العناصر الظاهرة</h2>
            </div>
            <div className="space-y-3">
              {[
                ['showAnnouncementBar', 'شريط الإعلان'],
                ['showNewsletter', 'قسم النشرة البريدية'],
                ['showTestimonials', 'أقسام التقييمات'],
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
