import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { SKILL_CATEGORY_LABELS } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

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

  return (
    <div className="space-y-8">
      {/* Приветствие */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Добро пожаловать, {profile?.full_name?.split(' ')[0] || 'пользователь'}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Вот что происходит с вашим развитием</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card p-5">
          <div className="text-2xl mb-2">📝</div>
          <div className="text-3xl font-bold text-gray-900">{results?.length || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Пройдено тестов</div>
        </div>
        <div className="card p-5">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-3xl font-bold text-gray-900">
            {latestResult ? Math.round(latestResult.total_score) + '%' : '—'}
          </div>
          <div className="text-sm text-gray-500 mt-1">Последний результат</div>
        </div>
        <div className="card p-5">
          <div className="text-2xl mb-2">📋</div>
          <div className="text-3xl font-bold text-gray-900">{assignments?.length || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Ожидают прохождения</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ навыки */}
        {topSkills.length > 0 && (
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Ваши сильные стороны</h2>
            <div className="space-y-3">
              {topSkills.map(([skill, score]) => (
                <div key={skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">
                      {SKILL_CATEGORY_LABELS[skill as keyof typeof SKILL_CATEGORY_LABELS] || skill}
                    </span>
                    <span className="font-medium text-gray-900">{Math.round(score as number)}%</span>
                  </div>
                  <div className="skill-bar">
                    <div
                      className="skill-bar-fill bg-primary-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Link href="/dashboard/results" className="text-primary-600 text-sm font-medium mt-4 inline-block hover:underline">
              Все результаты →
            </Link>
          </div>
        )}

        {/* Назначенные тесты */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Назначенные тесты</h2>
            <Link href="/assessments" className="text-primary-600 text-sm hover:underline">Все тесты</Link>
          </div>
          {assignments && assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{a.assessments?.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {a.assessments?.time_limit_minutes} мин
                      {a.due_date && ` · до ${new Date(a.due_date).toLocaleDateString('ru-RU')}`}
                    </div>
                  </div>
                  <Link
                    href={`/assessments/${a.assessment_id}`}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    Начать
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-sm">Нет назначенных тестов</div>
              <Link href="/assessments" className="text-primary-600 text-sm hover:underline mt-2 inline-block">
                Пройти тест самостоятельно
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* План развития */}
      {activePlan ? (
        <div className="card p-6 border-l-4 border-primary-500">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs font-medium text-primary-600 uppercase tracking-wide mb-1">Активный план развития</div>
              <h2 className="font-semibold text-gray-900 mb-1">{activePlan.overall_goal || 'Персональный план'}</h2>
              <p className="text-sm text-gray-500 line-clamp-2">{activePlan.summary}</p>
            </div>
            <Link href="/dashboard/plan" className="btn-primary text-sm">
              Открыть план
            </Link>
          </div>
        </div>
      ) : (
        <div className="card p-6 text-center">
          <div className="text-4xl mb-3">🤖</div>
          <h3 className="font-semibold text-gray-900 mb-2">Создайте план развития с ИИ</h3>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            Пройдите тест, и наш ИИ создаст персональный план развития с конкретными ресурсами и временными рамками
          </p>
          <Link href="/assessments" className="btn-primary inline-block">
            Пройти тест
          </Link>
        </div>
      )}
    </div>
  );
}
