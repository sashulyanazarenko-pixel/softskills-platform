import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { SKILL_CATEGORY_LABELS } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  const profile = profileData ?? {
    id: user!.id,
    full_name: user!.user_metadata?.full_name ?? user!.email ?? '',
    role: user!.user_metadata?.role ?? 'candidate',
  };

  const { data: results } = await supabase
    .from('assessment_results')
    .select('*, assessments(title)')
    .eq('user_id', user!.id)
    .order('completed_at', { ascending: false })
    .limit(3);

  const { data: assignments } = await supabase
    .from('assessment_assignments')
    .select('*, assessments(title, skill_categories, time_limit_minutes)')
    .eq('assigned_to', user!.id)
    .is('completed_at', null)
    .limit(3);

  const { data: activePlan } = await supabase
    .from('development_plans')
    .select('*')
    .eq('user_id', user!.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const latestResult = results?.[0];
  const topSkills = latestResult?.scores
    ? Object.entries(latestResult.scores as Record<string, number>)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
    : [];

  const firstName = profile?.full_name?.split(' ')[0] || 'пользователь';

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Добрый день, {firstName} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Вот ваш прогресс развития</p>
        </div>
        <Link
          href="/assessments"
          className="hidden sm:flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-primary-600/20 hover:shadow-primary-700/30"
        >
          <span>+</span> Новый тест
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Пройдено тестов</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 text-base">📝</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{results?.length || 0}</div>
          <div className="text-xs text-gray-400 mt-1">
            {results?.length ? 'за всё время' : 'Пройдите первый тест'}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Последний результат</span>
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-500 text-base">🎯</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {latestResult ? Math.round(latestResult.total_score) + '%' : '—'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {latestResult ? new Date(latestResult.completed_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : 'Нет данных'}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">К выполнению</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 text-base">📋</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{assignments?.length || 0}</div>
          <div className="text-xs text-gray-400 mt-1">
            {assignments?.length ? 'назначено HR' : 'Нет назначений'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top skills */}
        {topSkills.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 text-sm">Ваши сильные стороны</h2>
              <Link href="/dashboard/results" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                Все результаты →
              </Link>
            </div>
            <div className="space-y-4">
              {topSkills.map(([skill, score]) => {
                const pct = Math.round(score as number);
                return (
                  <div key={skill}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-600 font-medium">
                        {SKILL_CATEGORY_LABELS[skill as keyof typeof SKILL_CATEGORY_LABELS] || skill}
                      </span>
                      <span className="font-bold text-gray-900">{pct}%</span>
                    </div>
                    <div className="skill-bar">
                      <div
                        className="skill-bar-fill bg-gradient-to-r from-primary-500 to-violet-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Assigned tests */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900 text-sm">Назначенные тесты</h2>
            <Link href="/assessments" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              Все тесты →
            </Link>
          </div>
          {assignments && assignments.length > 0 ? (
            <div className="space-y-2.5">
              {assignments.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100/60 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{a.assessments?.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {a.assessments?.time_limit_minutes} мин
                      {a.due_date && ` · до ${new Date(a.due_date).toLocaleDateString('ru-RU')}`}
                    </div>
                  </div>
                  <Link
                    href={`/assessments/${a.assessment_id}`}
                    className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium py-1.5 px-3.5 rounded-lg transition-colors shrink-0 ml-3"
                  >
                    Начать
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl mb-3">✅</div>
              <div className="text-sm font-medium text-gray-500">Нет назначенных тестов</div>
              <Link href="/assessments" className="text-xs text-primary-600 hover:underline mt-1.5">
                Пройти тест самостоятельно
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Development plan */}
      {activePlan ? (
        <div className="card p-6 border-l-4 border-primary-500 bg-gradient-to-r from-primary-50/50 to-transparent">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  ✦ Активный план
                </span>
              </div>
              <h2 className="font-semibold text-gray-900 mb-1 text-sm">{activePlan.overall_goal || 'Персональный план'}</h2>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{activePlan.summary}</p>
            </div>
            <Link href="/dashboard/plan" className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shrink-0 shadow-sm">
              Открыть
            </Link>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center bg-gradient-to-br from-primary-50/30 to-violet-50/30">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-primary-500/20">🤖</div>
          <h3 className="font-semibold text-gray-900 mb-2">Создайте план развития с ИИ</h3>
          <p className="text-sm text-gray-400 mb-5 max-w-sm mx-auto leading-relaxed">
            Пройдите тест, и Gemini AI создаст персональный ИПР на 6 месяцев с конкретными ресурсами и целями
          </p>
          <Link href="/assessments" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-primary-600/20">
            Пройти тест →
          </Link>
        </div>
      )}
    </div>
  );
}
