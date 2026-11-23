import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ResultsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: results } = await supabase
    .from('assessment_results')
    .select('*, assessments(title, skill_categories)')
    .eq('user_id', user!.id)
    .order('completed_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Мои результаты</h1>
        <p className="text-gray-500 mt-1">История прохождения тестов</p>
      </div>

      {results && results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result: any) => {
            const scores = result.scores || {};
            const topSkill = Object.entries(scores).sort(([, a], [, b]) => (b as number) - (a as number))[0];

            return (
              <div key={result.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{result.assessments?.title}</h3>
                      <span className={`badge text-xs ${
                        result.total_score >= 70 ? 'bg-green-100 text-green-700' :
                        result.total_score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {Math.round(result.total_score)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(result.completed_at).toLocaleDateString('ru-RU', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                      {topSkill && ` · Лучший навык: ${topSkill[0]}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">{Math.round(result.total_score)}%</div>
                      <div className="text-xs text-gray-400">общий балл</div>
                    </div>
                    <Link
                      href={`/dashboard/results/${result.id}`}
                      className="btn-secondary text-sm"
                    >
                      Подробнее →
                    </Link>
                  </div>
                </div>

                {/* Mini bars */}
                <div className="mt-3 flex gap-1">
                  {Object.values(scores).map((score, i) => (
                    <div key={i} className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-400 rounded-full"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-lg mb-2">Нет результатов</p>
          <p className="text-sm mb-6">Пройдите тест, чтобы увидеть свои результаты здесь</p>
          <Link href="/assessments" className="btn-primary inline-block">
            Пройти тест
          </Link>
        </div>
      )}
    </div>
  );
}
