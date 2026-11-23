'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SKILL_CATEGORY_LABELS, type SkillCategory } from '@/types';

interface Option {
  id: string;
  text: string;
  score: number;
}

interface Question {
  id: string;
  skill_category: SkillCategory;
  question_type: string;
  text: string;
  options?: Option[];
  min_scale?: number;
  max_scale?: number;
  order_index: number;
}

interface Assessment {
  id: string;
  title: string;
  time_limit_minutes: number;
  skill_categories: SkillCategory[];
}

export default function AssessmentRunner({
  assessment,
  questions,
}: {
  assessment: Assessment;
  questions: Question[];
}) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [timeLeft, setTimeLeft] = useState(assessment.time_limit_minutes * 60);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: assessment.id,
          answers,
          questions,
          time_spent_seconds: Math.round((Date.now() - startTime) / 1000),
        }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/dashboard/results/${data.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  }, [assessment.id, answers, questions, startTime, router]);

  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, handleSubmit]);

  const q = questions[current];
  const progress = Math.round(((current + 1) / questions.length) * 100);
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  if (!started) {
    return (
      <div className="card p-10 text-center">
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Готовы начать?</h2>
        <ul className="text-sm text-gray-600 mb-8 space-y-2 text-left max-w-xs mx-auto">
          <li>✓ Отвечайте честно — нет правильных или неправильных ответов</li>
          <li>✓ У вас {assessment.time_limit_minutes} минут на прохождение</li>
          <li>✓ Результаты помогут создать ваш план развития</li>
        </ul>
        <button onClick={() => setStarted(true)} className="btn-primary text-base px-8 py-3">
          Начать тест
        </button>
      </div>
    );
  }

  const handleAnswer = (value: string | string[] | number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      handleSubmit();
    }
  };

  const currentAnswer = answers[q.id];
  const hasAnswer = currentAnswer !== undefined && currentAnswer !== '';

  return (
    <div className="space-y-5">
      {/* Прогресс */}
      <div className="card p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            Вопрос {current + 1} из {questions.length}
          </span>
          <span className={`text-sm font-medium ${timeLeft < 300 ? 'text-red-500' : 'text-gray-700'}`}>
            ⏱ {mins}:{secs.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-1 text-right">{progress}%</div>
      </div>

      {/* Вопрос */}
      <div className="card p-7">
        <div className="text-xs font-medium text-primary-600 uppercase tracking-wide mb-3">
          {SKILL_CATEGORY_LABELS[q.skill_category]}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">{q.text}</h2>

        {/* Single choice */}
        {q.question_type === 'single_choice' && q.options && (
          <div className="space-y-3">
            {q.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleAnswer(opt.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  currentAnswer === opt.id
                    ? 'border-primary-500 bg-primary-50 text-primary-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                    currentAnswer === opt.id ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                  }`}>
                    {currentAnswer === opt.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="text-sm leading-relaxed">{opt.text}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Multiple choice */}
        {q.question_type === 'multiple_choice' && q.options && (
          <div className="space-y-3">
            {q.options.map((opt) => {
              const selected = Array.isArray(currentAnswer) && currentAnswer.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    const current = Array.isArray(currentAnswer) ? currentAnswer : [];
                    handleAnswer(
                      selected ? current.filter((id) => id !== opt.id) : [...current, opt.id]
                    );
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selected ? 'border-primary-500 bg-primary-50 text-primary-900' : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                      selected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                    }`}>
                      {selected && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className="text-sm leading-relaxed">{opt.text}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Scale */}
        {q.question_type === 'scale' && (
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Совсем нет</span>
              <span>Очень комфортно</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                <button
                  key={val}
                  onClick={() => handleAnswer(val)}
                  className={`flex-1 aspect-square rounded-lg text-sm font-medium transition-all ${
                    currentAnswer === val
                      ? 'bg-primary-500 text-white shadow-md scale-110'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            {currentAnswer && (
              <p className="text-center text-sm text-gray-600">Вы выбрали: <strong>{currentAnswer}</strong> из 10</p>
            )}
          </div>
        )}

        {/* Open text */}
        {q.question_type === 'open_text' && (
          <textarea
            value={(currentAnswer as string) || ''}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Введите ваш ответ..."
            rows={5}
            className="input resize-none"
          />
        )}
      </div>

      {/* Навигация */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="btn-secondary disabled:opacity-30"
        >
          ← Назад
        </button>
        <button
          onClick={handleNext}
          disabled={!hasAnswer || submitting}
          className="btn-primary disabled:opacity-50"
        >
          {submitting
            ? 'Сохраняем...'
            : current === questions.length - 1
            ? 'Завершить тест →'
            : 'Следующий вопрос →'}
        </button>
      </div>
    </div>
  );
}
