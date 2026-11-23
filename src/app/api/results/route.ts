import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SkillCategory } from '@/types';

interface Option {
  id: string;
  text: string;
  score: number;
}

interface Question {
  id: string;
  skill_category: SkillCategory;
  question_type: string;
  options?: Option[];
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { assessment_id, answers, questions, time_spent_seconds } = await req.json();

    // Вычисляем баллы по навыкам
    const skillScores: Record<SkillCategory, { total: number; count: number; max: number }> = {} as any;

    for (const question of questions as Question[]) {
      const cat = question.skill_category;
      if (!skillScores[cat]) skillScores[cat] = { total: 0, count: 0, max: 0 };

      const answer = answers[question.id];

      if (question.question_type === 'single_choice' && question.options) {
        const opt = question.options.find((o) => o.id === answer);
        const maxScore = Math.max(...question.options.map((o) => o.score));
        skillScores[cat].total += opt?.score || 0;
        skillScores[cat].max += maxScore;
        skillScores[cat].count += 1;
      } else if (question.question_type === 'multiple_choice' && question.options) {
        const selected = Array.isArray(answer) ? answer : [];
        const selectedScore = question.options
          .filter((o) => selected.includes(o.id))
          .reduce((sum, o) => sum + o.score, 0);
        const maxScore = question.options.reduce((sum, o) => sum + o.score, 0);
        skillScores[cat].total += selectedScore;
        skillScores[cat].max += maxScore;
        skillScores[cat].count += 1;
      } else if (question.question_type === 'scale') {
        const val = typeof answer === 'number' ? answer : 5;
        skillScores[cat].total += val;
        skillScores[cat].max += 10;
        skillScores[cat].count += 1;
      } else if (question.question_type === 'open_text') {
        // Текстовые ответы — нейтральный балл
        skillScores[cat].total += 3;
        skillScores[cat].max += 5;
        skillScores[cat].count += 1;
      }
    }

    // Нормализуем в проценты
    const scores: Record<string, number> = {};
    let totalScore = 0;
    let categoryCount = 0;

    for (const [cat, data] of Object.entries(skillScores)) {
      if (data.max > 0) {
        scores[cat] = Math.round((data.total / data.max) * 100);
        totalScore += scores[cat];
        categoryCount++;
      }
    }

    const avgTotal = categoryCount > 0 ? Math.round(totalScore / categoryCount) : 0;

    const { data: result, error } = await supabase
      .from('assessment_results')
      .insert({
        user_id: user.id,
        assessment_id,
        scores,
        total_score: avgTotal,
        answers,
        time_spent_seconds: time_spent_seconds || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(result);
  } catch (err) {
    console.error('Results error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
