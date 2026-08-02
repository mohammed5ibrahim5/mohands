# TODO - إصلاح مشكلة تسجيل الدخول

## المشكلة
عند تسجيل الدخول، يتم التنقل للوحة التحكم/الدفع لكن الجلسة (session) في React لم تُحدَّث بعد،
فيُعاد التوجيه إلى صفحة تسجيل الدخول مرة أخرى.

## السبب الجذري
1. **توقيت تحديث الجلسة**: `signIn` لم يكن يعيّن `session` في React فوراً، فلما يُنفَّذ `navigate`،
   تكتشف `ProtectedRoute`/`AdminLayout` أن `session === null` فتعيد التوجيه لصفحة الدخول.
2. **تأكيد البريد + Rate limit على تسجيل الحسابات**: `signUp` عبر `supabase.auth.signUp`
   كان يرسل بريد تأكيد إلكتروني، ومع كثرة المحاولات وصل الحد الأقصى (rate limit)،
   فتُمنع الحسابات الجديدة من الدخول.

## الحل المطبق

### 1. إصلاح توقيت الجلسة
- [x] `src/context/AuthContext.tsx`:
  - [x] `signIn`: تعيين `session` و `loading` فوراً من نتيجة Supabase
  - [x] تأثير جلب `profile`: تعيين `loading = true` أثناء الجلب
  - [x] `signOut`: تعيين `session = null` صراحةً
- [x] `src/pages/admin/AdminLogin.tsx`: `useEffect` يعيد التوجيه إلى `/admin/dashboard`
      إذا كان المستخدم مسجلاً بالفعل
- [x] `src/pages/store/CustomerAuth.tsx`: `useEffect` يعيد التوجيه إلى `/checkout`
      إذا كان المستخدم مسجلاً بالفعل

### 2. إلغاء الحاجة لتأكيد البريد + تجنب Rate limit
- [x] `src/lib/supabase.ts`: إضافة `supabaseAdmin` (عميل بمفتاح الخدمة)
- [x] `src/context/AuthContext.tsx` `signUp`: إنشاء الحساب عبر **Admin API مع `email_confirm: true`**
      — لا يُرسل أي بريد إلكتروني، لا rate limit، والمستخدم يدخل فوراً (تسجيل دخول تلقائي)
- [x] `.env`: إضافة `VITE_SUPABASE_SERVICE_ROLE_KEY`

### 3. إصلاحات إضافية
- [x] `src/context/SiteSettingsContext.tsx`: إصلاح خطأ TypeScript في `resetSettings`

## التحقق
- [x] اختبار إنشاء حساب على Supabase (Admin API): **STATUS 200 + LOGIN SUCCESS**
- [x] `npm run typecheck` بدون أخطاء
- [x] `npm run build` بدون أخطاء

## حالة الإنجاز
- [x] اكتمل

