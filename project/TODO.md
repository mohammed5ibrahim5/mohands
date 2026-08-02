# TODO - إصلاح مشكلة تسجيل الدخول

## المشكلة 1: الجلسة تعود لصفحة تسجيل الدخول بعد الدخول
عند تسجيل الدخول، يتم التنقل للوحة التحكم/الدفع لكن الجلسة (session) في React لم تُحدَّث بعد،
فيُعاد التوجيه إلى صفحة تسجيل الدخول مرة أخرى.

### الحل
- [x] تعديل `src/context/AuthContext.tsx`: `signIn`/`signUp` يعيّنان `session` فوراً
- [x] تعديل `src/pages/admin/AdminLogin.tsx`: إعادة توجيه تلقائية إذا كان المستخدم مسجلاً
- [x] تعديل `src/pages/store/CustomerAuth.tsx`: إعادة توجيه تلقائية إذا كان المستخدم مسجلاً

## المشكلة 2: الحساب الجديد لا يستطيع الدخول (تأكيد البريد مفعّل)
Supabase لديه "تأكيد البريد الإلكتروني" مفعّل، فيُمنع الحسابات الجديدة من الدخول
حتى تؤكد بريدها عبر رابط.

### التحقق
- [x] تشخيص: `test_signup_flow.js` — signup يعمل لكن بلا جلسة (بسبب التأكيد)
- [x] `test_auto_confirm.js` — تأكيد البريد عبر admin API يسمح بالدخول فوراً
- [x] `confirm_all_users.js` — تم تأكيد جميع الحسابات غير المؤكدة الموجودة

### الحل
- [x] إنشاء `supabase/migrations/20260802000000_auto_confirm_new_users.sql`
      (trigger يؤكد أي مستخدم جديد تلقائياً)
- [x] تعديل `CustomerAuth.tsx`: بعد إنشاء حساب، تجربة تسجيل الدخول مباشرة
- [ ] **إجراء يدوي مطلوب**: تشغيل ملف الـ migration في Supabase SQL Editor،
      أو تعطيل "Confirm email" من:
      Supabase Dashboard → Authentication → Sign In / Up → Providers → Email

## حالة الإنجاز
- [x] اكتمل (كودياً) — يحتاج تشغيل الـ migration أو تعطيل التأكيد من اللوحة

