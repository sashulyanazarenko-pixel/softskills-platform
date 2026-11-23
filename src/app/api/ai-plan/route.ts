import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SKILL_CATEGORY_LABELS, type SkillCategory } from '@/types';

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

    // Формируем план на основе результатов
    const sortedSkills = Object.entries(scores).sort(([, a], [, b]) => a - b);

    const items = sortedSkills.map(([skill, score]) => {
      const cat = skill as SkillCategory;
      const level = score < 40 ? 'low' : score < 70 ? 'medium' : 'high';
      const target = Math.min(100, score + (level === 'low' ? 30 : level === 'medium' ? 20 : 10));
      const priority = score < 40 ? 'high' : score < 65 ? 'medium' : 'low';

      const recommendations = getRecommendations(cat, level);
      const resources = getResources(cat);
      const timeline = level === 'low' ? 12 : level === 'medium' ? 8 : 4;

      return {
        skill: cat,
        current_level: score,
        target_level: target,
        priority,
        recommendations,
        resources,
        timeline_weeks: timeline,
      };
    });

    // Общие цели и summary
    const weakSkills = sortedSkills
      .filter(([, s]) => s < 60)
      .map(([skill]) => SKILL_CATEGORY_LABELS[skill as SkillCategory])
      .slice(0, 3);

    const strongSkills = sortedSkills
      .filter(([, s]) => s >= 70)
      .map(([skill]) => SKILL_CATEGORY_LABELS[skill as SkillCategory])
      .slice(-2);

    const summary = `На основе результатов оценки выявлены ключевые зоны развития: ${
      weakSkills.length > 0 ? weakSkills.join(', ') : 'навыки на хорошем уровне'
    }. ${
      strongSkills.length > 0 ? `Сильные стороны: ${strongSkills.join(', ')}.` : ''
    } Рекомендуется сосредоточиться на систематическом развитии по предложенному плану в течение 3 месяцев.`;

    const overall_goal = `Повысить средний уровень soft skills с ${result.total_score}% до ${Math.min(100, result.total_score + 20)}% за 3 месяца`;

    const { data: plan, error } = await supabase
      .from('development_plans')
      .insert({
        user_id: user.id,
        assessment_result_id: result_id,
        summary,
        overall_goal,
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

function getRecommendations(skill: SkillCategory, level: string): string[] {
  const recs: Record<SkillCategory, Record<string, string[]>> = {
    communication: {
      low: [
        'Практикуйте активное слушание: повторяйте своими словами услышанное',
        'Запишите себя на видео во время презентации и проанализируйте',
        'Вступите в клуб публичных выступлений (Toastmasters)',
      ],
      medium: [
        'Работайте над невербальной коммуникацией: контакт глаз, жесты',
        'Практикуйте структурированные высказывания по методу STAR',
        'Давайте обратную связь коллегам не реже раза в неделю',
      ],
      high: [
        'Менторьте коллег в области коммуникации',
        'Проводите презентации на конференциях',
        'Развивайте навыки переговоров на высшем уровне',
      ],
    },
    teamwork: {
      low: [
        'Участвуйте в командных проектах даже в небольшой роли',
        'Практикуйте открытость к чужим идеям — записывайте их плюсы',
        'Еженедельно помогайте одному коллеге в его задачах',
      ],
      medium: [
        'Инициируйте командные сессии обмена знаниями',
        'Развивайте навыки делегирования и доверия',
        'Изучите методологии Agile и Scrum',
      ],
      high: [
        'Возьмите роль фасилитатора в командных встречах',
        'Изучите и внедрите практики психологической безопасности в команде',
      ],
    },
    leadership: {
      low: [
        'Возьмите ответственность за небольшой проект или задачу',
        'Изучите базовые модели лидерства (ситуационное, трансформационное)',
        'Найдите ментора среди опытных руководителей',
      ],
      medium: [
        'Практикуйте коучинговый подход в работе с командой',
        'Развивайте навыки принятия стратегических решений',
        'Пройдите курс по лидерству и управлению изменениями',
      ],
      high: [
        'Разрабатывайте лидерские программы для команды',
        'Участвуйте в совете директоров или стратегических сессиях',
      ],
    },
    problem_solving: {
      low: [
        'Изучите и применяйте метод 5 Почему для анализа проблем',
        'Практикуйте мозговые штурмы для поиска нестандартных решений',
        'Решайте бизнес-кейсы на платформах типа HBR Case Studies',
      ],
      medium: [
        'Освойте Design Thinking для решения сложных проблем',
        'Применяйте матрицу Эйзенхауэра для приоритизации',
        'Изучите методы системного анализа и мышления',
      ],
      high: [
        'Разрабатывайте фреймворки решения проблем для команды',
        'Изучите продвинутые методы принятия решений в условиях неопределённости',
      ],
    },
    adaptability: {
      low: [
        'Намеренно выходите из зоны комфорта — пробуйте новые подходы',
        'Практикуйте медитацию для снижения стресса при изменениях',
        'Ведите дневник адаптации: записывайте новые ситуации и реакции на них',
      ],
      medium: [
        'Практикуйте agile-подход в личных проектах',
        'Изучите управление изменениями по модели Коттера',
        'Регулярно обновляйте свои навыки через онлайн-курсы',
      ],
      high: [
        'Возглавляйте инициативы организационных изменений',
        'Развивайте культуру адаптивности в команде',
      ],
    },
    emotional_intelligence: {
      low: [
        'Ведите дневник эмоций: что чувствуете и почему',
        'Практикуйте технику STOP (Stop, Think, Observe, Proceed) в стрессовых ситуациях',
        'Изучите книгу Дэниела Гоулмана "Эмоциональный интеллект"',
      ],
      medium: [
        'Развивайте эмпатию через волонтёрство или ролевые игры',
        'Практикуйте осознанное слушание без оценивания',
        'Изучите методы регуляции эмоций',
      ],
      high: [
        'Менторьте коллег в развитии EQ',
        'Применяйте эмоциональный интеллект в переговорах и конфликтах',
      ],
    },
    time_management: {
      low: [
        'Внедрите систему GTD (Getting Things Done) для управления задачами',
        'Используйте технику Pomodoro для фокусировки',
        'Планируйте следующий день за 15 минут до конца рабочего дня',
      ],
      medium: [
        'Освойте метод Time Blocking для глубокой работы',
        'Анализируйте потери времени с помощью трекеров',
        'Изучите принципы Эссенциализма — делайте меньше, но лучше',
      ],
      high: [
        'Оптимизируйте процессы команды через устранение потерь времени',
        'Автоматизируйте рутинные задачи с помощью инструментов',
      ],
    },
    creativity: {
      low: [
        'Практикуйте методику SCAMPER для генерации идей',
        'Выделяйте 15 минут в день на свободное творческое мышление',
        'Изучайте области вне вашей специальности для кросс-опыления идей',
      ],
      medium: [
        'Проводите регулярные мозговые штурмы с командой',
        'Экспериментируйте с методами дизайн-мышления',
        'Создайте пространство для творческих экспериментов в проектах',
      ],
      high: [
        'Внедряйте культуру инноваций в команде',
        'Руководите hackathon-ами и творческими сессиями',
      ],
    },
    conflict_resolution: {
      low: [
        'Изучите модель ненасильственного общения (NVC) Маршалла Розенберга',
        'Практикуйте технику "активное слушание" в конфликтных ситуациях',
        'Разберите реальные кейсы успешного разрешения конфликтов',
      ],
      medium: [
        'Освойте техники посредничества и фасилитации',
        'Изучите стили управления конфликтами (Thomas-Kilmann)',
        'Практикуйте win-win переговоры',
      ],
      high: [
        'Выступайте посредником в сложных организационных конфликтах',
        'Разрабатывайте процессы управления конфликтами для команды',
      ],
    },
    critical_thinking: {
      low: [
        'Изучите когнитивные искажения и как их избегать',
        'Практикуйте метод Сократа: задавайте вопросы к каждому утверждению',
        'Решайте логические задачи и головоломки ежедневно',
      ],
      medium: [
        'Изучите базы данных научных исследований — оценивайте качество аргументов',
        'Практикуйте метод "Шести шляп мышления" Де Боно',
        'Анализируйте бизнес-кейсы с позиции разных заинтересованных сторон',
      ],
      high: [
        'Внедряйте культуру data-driven принятия решений в команде',
        'Руководите аналитическими сессиями по сложным стратегическим вопросам',
      ],
    },
    results_orientation: {
      low: [
        'Ставьте SMART-цели и отслеживайте прогресс еженедельно',
        'Внедрите систему OKR для личного планирования',
        'Измеряйте конкретные результаты вместо затраченных усилий',
      ],
      medium: [
        'Определите ключевые метрики успеха для каждого проекта',
        'Практикуйте регулярные ретроспективы для оценки достижений',
        'Изучите методологию управления по результатам (MBO)',
      ],
      high: [
        'Внедряйте культуру результативности в команде через системы KPI',
        'Разрабатывайте стратегии достижения амбициозных бизнес-целей',
      ],
    },
    business_acumen: {
      low: [
        'Изучите основы финансовой грамотности: P&L, балансовый отчёт, денежный поток',
        'Читайте деловые новости ежедневно (РБК, Forbes, Harvard Business Review)',
        'Пройдите базовый курс по бизнес-стратегии',
      ],
      medium: [
        'Изучите бизнес-модели успешных компаний вашей отрасли',
        'Освойте основы маркетинга и управления клиентским опытом',
        'Анализируйте конкурентную среду с помощью фреймворка Porter 5 Forces',
      ],
      high: [
        'Участвуйте в стратегическом планировании на уровне компании',
        'Разрабатывайте бизнес-кейсы для новых инициатив с финансовым обоснованием',
      ],
    },
  };

  return recs[skill]?.[level] || ['Развивайте данный навык через практику и обучение'];
}

function getResources(skill: SkillCategory) {
  const resources: Record<SkillCategory, Array<{ title: string; type: 'book' | 'course' | 'article' | 'practice'; url?: string }>> = {
    communication: [
      { title: 'Как завоёвывать друзей (Дейл Карнеги)', type: 'book' },
      { title: 'Курс: Business Communication (Coursera)', type: 'course', url: 'https://coursera.org' },
      { title: 'Практика публичных выступлений', type: 'practice' },
    ],
    teamwork: [
      { title: 'Пять пороков команды (Патрик Ленсиони)', type: 'book' },
      { title: 'Курс: Teamwork Skills (Coursera)', type: 'course', url: 'https://coursera.org' },
    ],
    leadership: [
      { title: 'Лидер без титула (Робин Шарма)', type: 'book' },
      { title: 'Курс: Leadership (edX)', type: 'course', url: 'https://edx.org' },
    ],
    problem_solving: [
      { title: 'Думай медленно, решай быстро (Даниэль Канеман)', type: 'book' },
      { title: 'Курс: Critical Thinking & Problem Solving', type: 'course' },
    ],
    adaptability: [
      { title: 'Уроки стойкости (Мартин Селигман)', type: 'book' },
      { title: 'Mindfulness практика', type: 'practice' },
    ],
    emotional_intelligence: [
      { title: 'Эмоциональный интеллект (Дэниел Гоулман)', type: 'book' },
      { title: 'Курс: Emotional & Social Intelligence (LinkedIn)', type: 'course' },
    ],
    time_management: [
      { title: 'Getting Things Done (Дэвид Аллен)', type: 'book' },
      { title: 'Курс: Work Smarter, Not Harder (Coursera)', type: 'course', url: 'https://coursera.org' },
    ],
    creativity: [
      { title: 'Кради как художник (Остин Клеон)', type: 'book' },
      { title: 'Курс: Creative Thinking (edX)', type: 'course' },
    ],
    conflict_resolution: [
      { title: 'Переговоры без поражения (Фишер, Юри)', type: 'book' },
      { title: 'Ненасильственное общение (М. Розенберг)', type: 'book' },
    ],
    critical_thinking: [
      { title: 'Thinking, Fast and Slow (Канеман)', type: 'book' },
      { title: 'Курс: Critical Thinking (Coursera)', type: 'course', url: 'https://coursera.org' },
    ],
    results_orientation: [
      { title: 'Измерение работы (Пол Нивен)', type: 'book' },
      { title: 'Курс: Goal Setting and Performance Management', type: 'course' },
      { title: 'Практика OKR планирования', type: 'practice' },
    ],
    business_acumen: [
      { title: 'Бизнес с нуля (Эрик Рис)', type: 'book' },
      { title: 'Курс: Business Foundations (Wharton, Coursera)', type: 'course', url: 'https://coursera.org' },
      { title: 'Harvard Business Review статьи', type: 'article', url: 'https://hbr.org' },
    ],
  };

  return resources[skill] || [];
}
