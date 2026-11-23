import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { SKILL_CATEGORY_LABELS, type SkillCategory } from '@/types';

export default async function AssessmentsPage() {
  const supabase = await createClient();

  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const { data: { user } } = await supabase.auth.getUser();

  const { data: completedResults } = await supabase
    .from('assessment_results')
    .select('assessment_id, completed_at')
    .eq('user_id', user!.id);

  const completedMap = new Set(completedResults?.map((r) => r.assessment_id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Тесты и оценки</h1>
        <p className="text-gray-500 mt-1">Выберите тест для прохождения</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {assessments?.map((assessment) => {
          const isCompleted = completedMap.has(assessment.id);
          return (
            <div key={assessment.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="text-2xl">
                  {isCompleted ? '✅' : '📝'}
                </div>
                {isCompleted && (
                  <span className="badge bg-success-50 text-success-600">Пройден</span>
                )}
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{assessment.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{assessment.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {(assessment.skill_categories as SkillCategory[]).slice(0, 3).map((cat) => (
                  <span key={cat} className="badge bg-primary-50 text-primary-700">
                    {SKILL_CATEGORY_LABELS[cat]}
                  </span>
                ))}
                {assessment.skill_categories.length > 3 && (
                  <span className="badge bg-gray-100 text-gray-600">
                    +{assessment.skill_categories.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400 flex gap-3">
                  <span>⏱ {assessment.time_limit_minutes} мин</span>
                  <span>❓ {assessment.question_count} вопросов</span>
                </div>
                <Link
                  href={`/assessments/${assessment.id}`}
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                    isCompleted
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {isCompleted ? 'Пройти снова' : 'Начать →'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {(!assessments || assessments.length === 0) && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📭</div>
          <p>Тесты пока не добавлены</p>
        </div>
      )}
    </div>
  );
}
