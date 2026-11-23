import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { SKILL_CATEGORY_LABELS, type SkillCategory, type DevelopmentPlanItem } from '@/types';

const PRIORITY_LABELS = { high: 'Высокий', medium: 'Средний', low: 'Низкий' };
const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};
const RESOURCE_ICONS = { book: '📚', course: '🎓', article: '📄', practice: '🏋️' };

export default async function PlanDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: plan } = await supabase
    .from('development_plans')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!plan || plan.user_id !== user!.id) notFound();

  const items = (plan.items || []) as DevelopmentPlanItem[];
  const highPriority = items.filter((i) => i.priority === 'high');
  const mediumPriority = items.filter((i) => i.priority === 'medium');
  const lowPriority = items.filter((i) => i.priority === 'low');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Заголовок */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-primary-50 text-primary-700">📋 Активный план</span>
              <span className="text-xs text-gray-400">
                Создан {new Date(plan.created_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{plan.overall_goal}</h1>
            <p className="text-gray-600 leading-relaxed">{plan.summary}</p>
          </div>
        </div>

        {/* Быстрая статистика */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{highPriority.length}</div>
            <div className="text-xs text-gray-500">Высокий приоритет</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{mediumPriority.length}</div>
            <div className="text-xs text-gray-500">Средний приоритет</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{lowPriority.length}</div>
            <div className="text-xs text-gray-500">Низкий приоритет</div>
          </div>
        </div>
      </div>

      {/* Элементы плана */}
      {(['high', 'medium', 'low'] as const).map((priority) => {
        const pItems = items.filter((i) => i.priority === priority);
        if (pItems.length === 0) return null;
        return (
          <div key={priority}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className={`badge ${PRIORITY_COLORS[priority]}`}>
                {PRIORITY_LABELS[priority]} приоритет
              </span>
            </h2>
            <div className="space-y-4">
              {pItems.map((item) => (
                <div key={item.skill} className="card p-6">
                  {/* Навык */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {SKILL_CATEGORY_LABELS[item.skill as SkillCategory]}
                    </h3>
                    <div className="text-sm text-gray-500">
                      📅 {item.timeline_weeks} недель
                    </div>
                  </div>

                  {/* Прогресс: текущий → цель */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Текущий: {item.current_level}%</span>
                      <span>Цель: {item.target_level}%</span>
                    </div>
                    <div className="relative h-3 bg-gray-100 rounded-full">
                      <div
                        className="absolute h-3 bg-gray-300 rounded-full"
                        style={{ width: `${item.current_level}%` }}
                      />
                      <div
                        className="absolute h-3 bg-primary-500 rounded-full opacity-40"
                        style={{ width: `${item.target_level}%` }}
                      />
                      <div
                        className="absolute top-0 h-3 w-0.5 bg-primary-700"
                        style={{ left: `${item.current_level}%` }}
                      />
                    </div>
                    <div className="text-xs text-primary-600 mt-1 font-medium">
                      +{item.target_level - item.current_level}% потенциал роста
                    </div>
                  </div>

                  {/* Рекомендации */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">📌 Рекомендации</h4>
                    <ul className="space-y-1.5">
                      {item.recommendations?.map((rec, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-primary-500 mt-0.5 flex-shrink-0">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ресурсы */}
                  {item.resources && item.resources.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">📚 Ресурсы</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.resources.map((res, i) => (
                          <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
                            <span>{RESOURCE_ICONS[res.type]}</span>
                            {res.url ? (
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:underline"
                              >
                                {res.title}
                              </a>
                            ) : (
                              <span className="text-gray-700">{res.title}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
