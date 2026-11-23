import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import AssessmentRunner from '@/components/assessment/AssessmentRunner';
import { SKILL_CATEGORY_LABELS, type SkillCategory } from '@/types';

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: assessment } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', id)
    .single();

  if (!assessment) notFound();

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('assessment_id', id)
    .order('order_index');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{assessment.title}</h1>
        <p className="text-gray-500 mb-4">{assessment.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>⏱ {assessment.time_limit_minutes} минут</span>
          <span>❓ {questions?.length || assessment.question_count} вопросов</span>
          <span>📊 {(assessment.skill_categories as SkillCategory[]).length} компетенций</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {(assessment.skill_categories as SkillCategory[]).map((cat) => (
            <span key={cat} className="badge bg-primary-50 text-primary-700 px-3 py-1">
              {SKILL_CATEGORY_LABELS[cat]}
            </span>
          ))}
        </div>
      </div>

      {questions && questions.length > 0 ? (
        <AssessmentRunner
          assessment={assessment}
          questions={questions}
        />
      ) : (
        <div className="card p-10 text-center text-gray-400">
          <div className="text-4xl mb-3">🔧</div>
          <p>Вопросы для этого теста ещё не добавлены</p>
        </div>
      )}
    </div>
  );
}
