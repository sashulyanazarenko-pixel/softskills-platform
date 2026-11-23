'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SKILL_CATEGORY_LABELS, type SkillCategory } from '@/types';

interface Assessment {
  title: string;
  description: string;
  skill_categories: SkillCategory[];
}

interface Result {
  id: string;
  assessment_id: string;
  scores: Record<SkillCategory, number>;
  total_score: number;
  completed_at: string;
  time_spent_seconds: number;
  assessments: Assessment;
}

function getLevel(score: number) {
  if (score < 40) return { label: 'Требует развития', color: 'text-red-600 bg-red-50', bar: 'bg-red-400' };
  if (score < 70) return { label: 'Средний', color: 'text-yellow-600 bg-yellow-50', bar: 'bg-yellow-400' };
  return { label: 'Высокий', color: 'text-green-600 bg-green-50', bar: 'bg-green-500' };
}

export default function ResultsView({
  result,
  existingPlanId,
}: {
  result: Result;
  existingPlanId?: string;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  const scores = result.scores || {};
  const sortedSkills = Object.entries(scores).sort(([, a], [, b]) => b - a);

  const mins = Math.floor(result.time_spent_seconds / 60);
  const secs = result.time_spent_seconds % 60;

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result_id: result.id }),
      });
      const plan = await res.json();
      if (plan.id) {
        router.push(`/dashboard/plan/${plan.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Заголовок */}
      <div>
        <div className="text-sm text-gray-500 mb-1">
          {new Date(result.completed_at).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
          {' · '}⏱ {mins}:{secs.toString().padStart(2, '0')}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{result.assessments.title}</h1>
      </div>

      {/* Общий балл */}
      <div className="card p-7 text-center">
        <div className="text-6xl font-bold text-primary-600 mb-2">{Math.round(result.total_score)}%</div>
        <div className="text-lg text-gray-600 mb-4">Общий результат</div>
        <div className="w-full bg-gray-100 rounded-full h-3 max-w-xs mx-auto">
          <div
            className="bg-primary-500 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${result.total_score}%` }}
          />
        </div>
        <div className="mt-4 text-sm text-gray-500">
          {result.total_score >= 70
            ? '🌟 Отличный результат! Вы демонстрируете высокий уровень soft skills'
            : result.total_score >= 50
            ? '📈 Хороший старт! Есть чёткие зоны для роста'
            : '🎯 Отличная основа для развития! Создайте план и начните путь роста'}
        </div>
      </div>

      {/* Навыки */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Результаты по компетенциям</h2>
        <div className="space-y-5">
          {sortedSkills.map(([skill, score]) => {
            const lvl = getLevel(score as number);
            return (
              <div key={skill}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-gray-700">
                    {SKILL_CATEGORY_LABELS[skill as SkillCategory] || skill}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${lvl.color}`}>{lvl.label}</span>
                    <span className="text-sm font-bold text-gray-900 w-10 text-right">{Math.round(score as number)}%</span>
                  </div>
                </div>
                <div className="skill-bar">
                  <div
                    className={`skill-bar-fill ${lvl.bar}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Анализ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💪</span>
            <h3 className="font-semibold text-gray-900">Сильные стороны</h3>
          </div>
          <ul className="space-y-2">
            {sortedSkills.filter(([, s]) => (s as number) >= 70).slice(0, 3).map(([skill]) => (
              <li key={skill} className="text-sm text-gray-600 flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {SKILL_CATEGORY_LABELS[skill as SkillCategory]}
              </li>
            ))}
            {sortedSkills.filter(([, s]) => (s as number) >= 70).length === 0 && (
              <li className="text-sm text-gray-400">Продолжайте развиваться!</li>
            )}
          </ul>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🎯</span>
            <h3 className="font-semibold text-gray-900">Зоны роста</h3>
          </div>
          <ul className="space-y-2">
            {sortedSkills.filter(([, s]) => (s as number) < 60).slice(0, 3).map(([skill]) => (
              <li key={skill} className="text-sm text-gray-600 flex items-center gap-2">
                <span className="text-orange-400">→</span>
                {SKILL_CATEGORY_LABELS[skill as SkillCategory]}
              </li>
            ))}
            {sortedSkills.filter(([, s]) => (s as number) < 60).length === 0 && (
              <li className="text-sm text-gray-400">Все навыки на достойном уровне!</li>
            )}
          </ul>
        </div>
      </div>

      {/* CTA: план развития */}
      <div className="card p-7 text-center border-2 border-dashed border-primary-200 bg-primary-50/30">
        <div className="text-4xl mb-3">🤖</div>
        <h3 className="font-semibold text-gray-900 mb-2">Персональный план развития</h3>
        <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
          ИИ создаст индивидуальный план с конкретными рекомендациями, книгами, курсами и временными рамками на основе ваших результатов
        </p>
        {existingPlanId ? (
          <button
            onClick={() => router.push(`/dashboard/plan/${existingPlanId}`)}
            className="btn-primary"
          >
            Открыть план развития →
          </button>
        ) : (
          <button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="btn-primary"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Генерируем план...
              </span>
            ) : '✨ Создать план развития с ИИ'}
          </button>
        )}
      </div>
    </div>
  );
}
