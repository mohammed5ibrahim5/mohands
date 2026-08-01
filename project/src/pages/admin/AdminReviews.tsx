import { useEffect, useState } from 'react';
import { Star, Check, X, Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatDateTime } from '@/lib/utils';
import type { Review } from '@/lib/types';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<(Review & { product_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  const load = async () => {
    let query = supabase.from('reviews').select('*, product:products(name)').order('created_at', { ascending: false });
    if (filter === 'pending') query = query.eq('approved', false);
    else if (filter === 'approved') query = query.eq('approved', true);
    const { data } = await query;
    setReviews((data || []).map((r) => ({ ...r, product_name: (r.product as { name: string } | null)?.name })));
    setLoading(false);
  };

  useEffect(() => { setLoading(true); load(); }, [filter]);

  const toggleApprove = async (id: string, approved: boolean) => {
    await supabase.from('reviews').update({ approved: !approved }).eq('id', id);
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved: !approved } : r)));
  };

  const deleteReview = async (id: string) => {
    await supabase.from('reviews').delete().eq('id', id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-stone-900">التقييمات</h1>
        <p className="text-stone-500 mt-1">مراجعة وموافقة تقييمات العملاء</p>
      </div>

      <div className="flex gap-2 mb-6">
        {([['pending', 'بانتظار الموافقة'], ['approved', 'تمت الموافقة'], ['all', 'الكل']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${filter === key ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'}`}>{label}</button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-stone-400 mx-auto" /></div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
            <MessageSquare className="w-12 h-12 text-stone-200 mx-auto mb-3" />
            <p className="text-stone-400">لا توجد تقييمات في هذا القسم</p>
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-stone-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-amber-400 font-bold">{r.author_name.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-stone-800">{r.author_name}</p>
                      <p className="text-xs text-stone-400">{formatDateTime(r.created_at)}</p>
                    </div>
                    <div className="flex gap-0.5 mr-2">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />)}</div>
                  </div>
                  {r.product_name && <p className="text-sm text-amber-600 font-medium mb-2">على منتج: {r.product_name}</p>}
                  {r.comment && <p className="text-stone-600 leading-relaxed">{r.comment}</p>}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => toggleApprove(r.id, r.approved)} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1.5 transition-all ${r.approved ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                    {r.approved ? <><X className="w-4 h-4" /> إلغاء الموافقة</> : <><Check className="w-4 h-4" /> موافقة</>}
                  </button>
                  <button onClick={() => deleteReview(r.id)} className="px-4 py-2 rounded-lg font-bold text-sm bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all flex items-center gap-1.5 justify-center">
                    <X className="w-4 h-4" /> حذف
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
