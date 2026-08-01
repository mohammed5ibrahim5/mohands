import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Loader2, ArrowLeft, Store } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CustomerAuth() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (mode === 'signup') {
      const { error } = await signUp(form.email, form.password, form.name);
      if (error) { setError(error); setLoading(false); }
      else navigate('/checkout');
    } else {
      const { error } = await signIn(form.email, form.password);
      if (error) { setError(error); setLoading(false); }
      else navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-stone-900 flex items-center justify-center text-amber-400 font-serif text-xl font-bold">م</div>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-stone-900">{mode === 'signup' ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</h1>
          <p className="text-stone-500 mt-2">{mode === 'signup' ? 'أنشئ حسابك لإتمام الطلب وتتبع شحناتك' : 'سجّل الدخول لمتابعة طلباتك'}</p>
        </div>

        <div className="flex gap-2 mb-6 bg-stone-100 p-1 rounded-full">
          <button onClick={() => setMode('signup')} className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-all ${mode === 'signup' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}>حساب جديد</button>
          <button onClick={() => setMode('login')} className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-all ${mode === 'login' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}>تسجيل دخول</button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4 animate-slide-up">
          {error && <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl p-3">{error}</div>}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full pr-10 pl-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" placeholder="اسمك الكامل" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full pr-10 pl-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" placeholder="example@email.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full pr-10 pl-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري...</> : <>{mode === 'signup' ? 'إنشاء الحساب' : 'تسجيل الدخول'} <ArrowLeft className="w-5 h-5" /></>}
          </button>
        </form>

        <Link to="/" className="block text-center text-stone-500 text-sm mt-6 hover:text-amber-600 transition-colors">العودة للمتجر</Link>
      </div>
    </div>
  );
}
