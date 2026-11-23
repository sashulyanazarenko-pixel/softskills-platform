import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SKILL_CATEGORY_LABELS, type SkillCategory } from '@/types';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const resourceSchema = z.object({
  title: z.string(),
  type: z.enum(['book', 'course', 'article', 'practice']),
  url: z.string().optional(),
});

const planItemSchema = z.object({
  skill: z.string(),
  recommendations: z.array(z.string()).describe('3–4 конкретные практические рекомендации на русском языке'),
  resources: z.array(resourceSchema).describe('2–3 ресурса для развития навыка'),
  timeline_weeks: z.number().int().min(2).max(24),
});

const geminiPlanSchema = z.object({
  summary: z.string().describe('Краткое персональное резюме плана развития, 2–3 предложения на русском'),
  overall_goal: z.string().describe('Одна конкретная цель развития на русском языке'),
  items: z.array(planItemSchema),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { result_id } = await req.json();

    const { data: result } = await supabase
      .from('assessment_results')
      .select('*, assessments(title)')
      .eq('id', result_id)
      .single();

    if (!result) return NextResponse.json({ error: 'Result not found' }, { status: 404 });

    const scores = result.scores as Record<SkillCategory, number>;
    const sortedSkills = Object.entries(scores).sort(([, a], [, b]) => a - b);

    const skillLines = sortedSkills.map(([skill, score]) => {
      const label = SKILL_CATEGORY_LABELS[skill as SkillCategory] ?? skill;
      const level = score < 40 ? 'низкий' : score < 70 ? 'средний' : 'высокий';
      return `- ${label}: ${score}/100 (${level})`;
    }).join('\n');

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const { object: geminiPlan } = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: geminiPlanSchema,
      prompt: `Ты эксперт по развитию soft skills. Составь персональный индивидуальный план развития (ИПР) для сотрудника.

Результаты оценки soft skills (шкала 0–100):
${skillLines}

Общий балл: ${result.total_score}/100

Требования к плану:
1. Сосредоточься на навыках с низким и средним уровнем — они приоритетны.
2. Для каждого навыка дай 3–4 конкретные практические рекомендации (не абстрактные, а реально выполнимые действия).
3. Для каждого навыка предложи 2–3 ресурса (книги, курсы, практики).
4. Укажи реалистичный срок развития в неделях.
5. Всё на русском языке.
6. Поле skill — исходное английское название навыка без перевода (communication, teamwork, leadership и т.д.).`,
    });

    // Обогащаем данные Gemini структурными полями
    const items = sortedSkills.map(([skill, score]) => {
      const level = score < 40 ? 'low' : score < 70 ? 'medium' : 'high';
      const target = Math.min(100, score + (level === 'low' ? 30 : level === 'medium' ? 20 : 10));
      const priority = score < 40 ? 'high' : score < 65 ? 'medium' : 'low';
      const geminiItem = geminiPlan.items.find(i => i.skill === skill);

      return {
        skill: skill as SkillCategory,
        current_level: score,
        target_level: target,
        priority,
        recommendations: geminiItem?.recommendations ?? [],
        resources: geminiItem?.resources ?? [],
        timeline_weeks: geminiItem?.timeline_weeks ?? (level === 'low' ? 12 : level === 'medium' ? 8 : 4),
      };
    });

    const { data: plan, error } = await supabase
      .from('development_plans')
      .insert({
        user_id: user.id,
        assessment_result_id: result_id,
        summary: geminiPlan.summary,
        overall_goal: geminiPlan.overall_goal,
        items,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(plan);
  } catch (err) {
    console.error('AI plan error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
