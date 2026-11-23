import Link from 'next/link';

export default function HomePage() {
  const features = [
    {
      icon: '🧠',
      title: 'Умные тесты',
      desc: 'Адаптивные вопросы по 10 ключевым soft skills компетенциям',
    },
    {
      icon: '📊',
      title: 'Детальная аналитика',
      desc: 'Визуальные отчёты с сравнением и динамикой развития',
    },
    {
      icon: '🤖',
      title: 'ИИ-планы развития',
      desc: 'Персональные ИПР на основе GPT с конкретными ресурсами',
    },
    {
      icon: '👥',
      title: 'Управление командой',
      desc: 'HR-панель для назначения тестов и мониторинга прогресса',
    },
  ];

  const skills = [
    'Коммуникация', 'Командная работа', 'Лидерство', 'Решение проблем',
    'Адаптивность', 'Эмоциональный интеллект', 'Управление временем',
    'Креативность', 'Разрешение конфликтов', 'Критическое мышление',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900">
      {/* Навигация */}
      <nav className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">S</div>
            <span className="text-white font-semibold text-lg">SoftSkills Pro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-white/80 hover:text-white px-4 py-2 rounded-lg transition-colors text-sm">
              Войти
            </Link>
            <Link href="/auth/register" className="bg-primary-500 hover:bg-primary-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Начать бесплатно
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-500/30 rounded-full px-4 py-1.5 mb-6">
          <span className="text-primary-300 text-sm font-medium">✨ Оценка на основе ИИ</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
          Оценка Soft Skills<br />
          <span className="text-primary-400">нового поколения</span>
        </h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10">
          Выявляйте потенциал сотрудников, создавайте персональные планы развития
          и стройте сильные команды с помощью ИИ-аналитики
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register" className="bg-primary-500 hover:bg-primary-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-primary-500/25">
            Пройти тест бесплатно
          </Link>
          <Link href="/auth/login?role=hr" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-white/20">
            Демо для HR →
          </Link>
        </div>
      </section>

      {/* Навыки */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-white/50 text-sm mb-6 uppercase tracking-widest">Оцениваемые компетенции</p>
        <div className="flex flex-wrap justify-center gap-3">
          {skills.map((skill) => (
            <span key={skill} className="bg-white/5 border border-white/10 text-white/80 px-4 py-2 rounded-full text-sm hover:bg-white/10 transition-colors">
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Функции */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Роли */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Платформа для всей компании</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { role: 'Кандидат / Сотрудник', icon: '👤', items: ['Проходить тесты в любое время', 'Получать детальный анализ навыков', 'Работать с персональным ИПР', 'Отслеживать прогресс развития'] },
            { role: 'HR-менеджер', icon: '📋', items: ['Назначать тесты кандидатам', 'Сравнивать профили навыков', 'Создавать отчёты для руководства', 'Настраивать тесты под компанию'] },
            { role: 'Руководитель', icon: '🎯', items: ['Мониторить навыки команды', 'Выявлять зоны роста', 'Планировать обучение', 'Принимать решения на основе данных'] },
          ].map((r) => (
            <div key={r.role} className="bg-white/5 border border-white/10 rounded-2xl p-7">
              <div className="text-3xl mb-3">{r.icon}</div>
              <h3 className="text-white font-semibold text-xl mb-4">{r.role}</h3>
              <ul className="space-y-2">
                {r.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-white/70 text-sm">
                    <span className="text-primary-400 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-primary-600/20 border border-primary-500/30 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Готовы начать?</h2>
          <p className="text-white/70 mb-8 text-lg">Создайте аккаунт и пройдите первый тест бесплатно</p>
          <Link href="/auth/register" className="inline-block bg-primary-500 hover:bg-primary-400 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-primary-500/30">
            Начать оценку →
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-white/40 text-sm">
        © 2024 SoftSkills Pro. Все права защищены.
      </footer>
    </div>
  );
}
