import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function PlansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: plans } = await supabase
    .from('development_plans')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Планы развития</h1>
        <p className="text-gray-500 mt-1">Ваши персональные планы, созданные с помощью ИИ</p>
      </div>

      {plans && plans.length > 0 ? (
        <div className="space-y-4">
          {plans.map((plan: any) => (
            <div key={plan.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${
                      plan.status === 'active' ? 'bg-green-100 text-green-700' :
                      plan.status === 'completed' ? 'bg-primary-100 text-primary-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {plan.status === 'active' ? '🟢 Активный' :
                       plan.status === 'completed' ? '✅ Завершён' : '📝 Черновик'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(plan.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{plan.overall_goal}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{plan.summary}</p>
                </div>
                <Link href={`/dashboard/plan/${plan.id}`} className="btn-secondary text-sm ml-4 flex-shrink-0">
                  Открыть →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-lg mb-2">Нет планов развития</p>
          <p className="text-sm mb-6">Пройдите тест, чтобы ИИ создал для вас персональный план</p>
          <Link href="/assessments" className="btn-primary inline-block">
            Пройти тест
          </Link>
        </div>
      )}
    </div>
  );
}
