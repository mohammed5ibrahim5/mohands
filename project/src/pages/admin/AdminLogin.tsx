import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowLeft, Store } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) { setError(error); setLoading(false); }
    else navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-5">
            <Store className="w-10 h-10 text-stone-900" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-white">لوحة تحكم المهندس (بكرنيه)</h1>
          <p className="text-stone-400 mt-2">سجّل الدخول لإدارة المتجر</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur border border-stone-800 rounded-2xl p-8 animate-slide-up">
          {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl p-3 mb-4">{error}</div>}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pr-10 pl-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors" placeholder="admin@mohandes-bakarnia.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pr-10 pl-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors" placeholder="••••••••" />
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold py-3.5 rounded-xl transition-all hover:shadow-xl hover:shadow-amber-500/25 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري الدخول...</> : <>تسجيل الدخول <ArrowLeft className="w-5 h-5" /></>}
          </button>
        </form>
        <Link to="/" className="block text-center text-stone-500 text-sm mt-6 hover:text-amber-400 transition-colors">العودة للمتجر</Link>
      </div>
    </div>
  );
}
