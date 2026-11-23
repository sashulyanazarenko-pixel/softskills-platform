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
  skill: z.string().describe('Английское название навыка, как в исходных данных'),
  current_level: z.number().int().min(0).max(100),
  target_level: z.number().int().min(0).max(100),
  priority: z.enum(['high', 'medium', 'low']),
  priority_reason: z.string().describe('Почему этот навык важен для карьерного роста'),
  recommendations: z.array(z.string()).describe('3–4 конкретных действия: курсы, книги, практика'),
  metrics: z.array(z.string()).describe('2–3 измеримых метрики прогресса'),
  resources: z.array(resourceSchema),
  timeline_weeks: z.number().int().min(2).max(24),
});

const monthlyCheckSchema = z.object({
  month: z.number().int().min(1).max(6),
  focus: z.string().describe('Фокус этого месяца'),
  actions: z.array(z.string()),
  checkpoint: z.string().describe('Что должно быть достигнуто к концу месяца'),
});

const geminiPlanSchema = z.object({
  summary: z.string().describe('Краткое резюме текущего профиля сотрудника, 2–3 предложения'),
  overall_goal: z.string().describe('SMART-цель развития на 6 месяцев'),
  strengths: z.array(z.string()).max(3).describe('Топ-3 сильные стороны'),
  growth_zones: z.array(z.string()).max(5).describe('Топ-3–5 зон роста с обоснованием'),
  items: z.array(planItemSchema).describe('ИПР по каждому приоритетному навыку'),
  monthly_plan: z.array(monthlyCheckSchema).describe('Разбивка плана по месяцам (1–6)'),
  self_check_questions: z.object({
    day30: z.array(z.string()).describe('Вопросы для self-check через 30 дней'),
    day60: z.array(z.string()).describe('Вопросы для self-check через 60 дней'),
    day90: z.array(z.string()).describe('Вопросы для self-check через 90 дней'),
  }),
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
      const stars = Math.round(score / 20); // конвертируем 0–100 в шкалу 1–5
      const level =
        score < 20 ? '1 — не владею' :
        score < 40 ? '2 — базовый уровень' :
        score < 60 ? '3 — уверенный пользователь' :
        score < 80 ? '4 — продвинутый уровень' :
                     '5 — экспертный уровень';
      return `- ${label} (${skill}): ${score}/100 → ${level} (${stars}/5 ★)`;
    }).join('\n');

    const weakSkillsCount = sortedSkills.filter(([, s]) => s < 60).length;
    const strongSkillsCount = sortedSkills.filter(([, s]) => s >= 70).length;

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const { object: geminiPlan } = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: geminiPlanSchema,
      system: `Ты — опытный HR-коуч и карьерный консультант. Твоя задача — провести структурированную оценку навыков сотрудника и составить персонализированный индивидуальный план развития (ИПР).

Говори тепло, но профессионально. Всегда обосновывай приоритеты через связь с карьерным ростом. Адаптируй рекомендации под конкретные результаты оценки.

Правила:
- Определи 3–5 ключевых зон роста и ранжируй их по приоритету (high = критично, medium = важно, low = желательно)
- Для каждой зоны роста дай 3–4 конкретных действия (курсы, книги, практика, менторство)
- Укажи измеримые метрики прогресса для каждого навыка
- Составь 6-месячный план с разбивкой по месяцам
- Добавь вопросы для self-check через 30/60/90 дней
- Всё на русском языке, кроме поля skill (оставляй английское название)`,
      prompt: `Результаты оценки soft skills сотрудника (шкала 0–100 / шкала 1–5):

${skillLines}

Общий балл: ${result.total_score}/100
Навыков для развития (< 60 баллов): ${weakSkillsCount}
Сильных сторон (≥ 70 баллов): ${strongSkillsCount}

Составь персонализированный ИПР на 6 месяцев:
1. Выяви топ-3 сильные стороны и топ-3–5 зон роста
2. Для каждой приоритетной зоны роста — конкретные действия, ресурсы, метрики, срок
3. Разбей план по месяцам (что делать в каждый из 6 месяцев)
4. Добавь вопросы для self-check через 30/60/90 дней`,
    });

    // Обогащаем данные структурными полями
    const items = geminiPlan.items.map(item => {
      const score = scores[item.skill as SkillCategory] ?? 50;
      const level = score < 40 ? 'low' : score < 70 ? 'medium' : 'high';
      const target = Math.min(100, score + (level === 'low' ? 30 : level === 'medium' ? 20 : 10));
      return {
        ...item,
        current_level: score,
        target_level: item.target_level || target,
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
        // Дополнительные поля Gemini сохраняем в metadata если нужно
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      ...plan,
      strengths: geminiPlan.strengths,
      growth_zones: geminiPlan.growth_zones,
      monthly_plan: geminiPlan.monthly_plan,
      self_check_questions: geminiPlan.self_check_questions,
    });
  } catch (err) {
    console.error('AI plan error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
