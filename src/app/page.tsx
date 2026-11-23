import Link from 'next/link';

export default function HomePage() {
  const features = [
    {
      icon: '🧠',
      title: 'Умные тесты',
      desc: 'Адаптивные вопросы по 10 ключевым soft skills компетенциям',
      color: 'from-violet-500/10 to-purple-500/10 border-violet-200',
    },
    {
      icon: '📊',
      title: 'Детальная аналитика',
      desc: 'Визуальные отчёты с динамикой развития и сравнительными профилями',
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-200',
    },
    {
      icon: '🤖',
      title: 'ИИ-планы развития',
      desc: 'Персональный ИПР от Gemini AI с конкретными ресурсами и целями',
      color: 'from-indigo-500/10 to-primary-500/10 border-indigo-200',
    },
    {
      icon: '👥',
      title: 'Управление командой',
      desc: 'HR-панель для назначения тестов и мониторинга прогресса команды',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200',
    },
  ];

  const skills = [
    'Коммуникация', 'Командная работа', 'Лидерство', 'Решение проблем',
    'Адаптивность', 'Эмоциональный интеллект', 'Управление временем',
    'Креативность', 'Разрешение конфликтов', 'Критическое мышление',
  ];

  const stats = [
    { value: '10+', label: 'компетенций' },
    { value: 'Gemini', label: 'AI-движок' },
    { value: '6 мес', label: 'план развития' },
    { value: '100%', label: 'персонализация' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Навигация */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a1a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-500/30">S</div>
            <span className="text-white font-semibold tracking-tight">SoftSkills Pro</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="text-white/60 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Войти
            </Link>
            <Link href="/auth/register" className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary-600/20 hover:shadow-primary-500/30">
              Начать бесплатно
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute -top-20 right-20 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />
          <div className="absolute top-60 left-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
              <span className="text-primary-300 text-sm font-medium">Оценка на базе Gemini AI</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Оцените Soft Skills{' '}
              <span className="bg-gradient-to-r from-primary-400 to-violet-400 bg-clip-text text-transparent">
                точно и быстро
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              Выявляйте потенциал сотрудников, создавайте персональные ИПР на 6 месяцев
              и стройте сильные команды с помощью ИИ-аналитики
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/register"
                className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all shadow-xl shadow-primary-600/30 hover:shadow-primary-500/40 hover:-translate-y-0.5"
              >
                Пройти тест бесплатно →
              </Link>
              <Link
                href="/auth/login?role=hr"
                className="bg-white/5 hover:bg-white/10 text-white/80 hover:text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all border border-white/10 hover:border-white/20"
              >
                Демо для HR
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center py-4 px-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-2xl font-bold text-white mb-0.5">{s.value}</div>
                <div className="text-xs text-white/40 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Компетенции */}
      <section className="border-y border-white/5 bg-white/[0.02] py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-white/30 text-xs mb-5 uppercase tracking-widest font-medium">Оцениваемые компетенции</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white/90 hover:border-primary-500/30 hover:bg-primary-500/10 px-3.5 py-1.5 rounded-full text-sm transition-all cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Функции */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">Всё для оценки и развития</h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">Комплексная платформа от теста до персонального плана</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className={`rounded-2xl p-6 border bg-gradient-to-br ${f.color} hover:scale-[1.02] transition-transform duration-200`}
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Роли */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">Платформа для всей компании</h2>
          <p className="text-white/40 text-lg">Единый инструмент для разных ролей</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              role: 'Кандидат / Сотрудник',
              icon: '👤',
              gradient: 'from-primary-600/80 to-violet-600/80',
              items: ['Проходить тесты в любое время', 'Получать детальный анализ навыков', 'Работать с персональным ИПР', 'Отслеживать прогресс развития'],
            },
            {
              role: 'HR-менеджер',
              icon: '📋',
              gradient: 'from-indigo-600/80 to-blue-600/80',
              items: ['Назначать тесты кандидатам', 'Сравнивать профили навыков', 'Создавать отчёты для руководства', 'Настраивать тесты под компанию'],
            },
            {
              role: 'Руководитель',
              icon: '🎯',
              gradient: 'from-emerald-600/80 to-teal-600/80',
              items: ['Мониторить навыки команды', 'Выявлять зоны роста', 'Планировать обучение', 'Принимать решения на основе данных'],
            },
          ].map((r) => (
            <div
              key={r.role}
              className="relative rounded-2xl p-7 overflow-hidden border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${r.gradient} opacity-5`} />
              <div className="relative">
                <div className="text-3xl mb-4">{r.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-5">{r.role}</h3>
                <ul className="space-y-2.5">
                  {r.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-white/50 text-sm">
                      <span className="text-primary-400 mt-0.5 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-violet-700" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
          <div className="relative px-8 py-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">Готовы начать?</h2>
            <p className="text-white/70 mb-8 text-lg max-w-md mx-auto">Создайте аккаунт и пройдите первый тест бесплатно — результат за 15 минут</p>
            <Link
              href="/auth/register"
              className="inline-block bg-white text-primary-700 hover:bg-white/90 px-10 py-4 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5 shadow-xl"
            >
              Начать оценку →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-white/20 text-sm">
        © 2024 SoftSkills Pro. Все права защищены.
      </footer>
    </div>
  );
}
