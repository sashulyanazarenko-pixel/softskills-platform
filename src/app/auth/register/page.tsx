'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types';

const ROLES: { value: UserRole; label: string; desc: string; icon: string }[] = [
  { value: 'candidate', label: 'Кандидат', desc: 'Прохожу отбор в компанию', icon: '🎓' },
  { value: 'employee', label: 'Сотрудник', desc: 'Работаю в компании', icon: '💼' },
  { value: 'manager', label: 'Руководитель', desc: 'Управляю командой', icon: '🎯' },
  { value: 'hr', label: 'HR-менеджер', desc: 'Занимаюсь подбором и развитием', icon: '📋' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'candidate' as UserRole });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, role: form.role },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-violet-900 to-[#0a0a1a]" />
        <div className="absolute top-20 -left-20 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">S</div>
            <span className="text-white font-semibold">SoftSkills Pro</span>
          </Link>
          <div>
            <div className="space-y-4 mb-8">
              {['Оценка 10+ ключевых компетенций', 'Персональный ИПР от Gemini AI', '6-месячный план развития', 'Сравнение с командой'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-white/70 text-sm">
                  <span className="text-primary-400 text-base">✓</span>
                  {item}
                </div>
              ))}
            </div>
            <p className="text-white/30 text-sm">Присоединяйтесь к платформе</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold">S</div>
              <span className="text-white font-semibold text-lg">SoftSkills Pro</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Создать аккаунт</h1>
          <p className="text-white/40 text-sm mb-8">Начните оценку soft skills уже сегодня</p>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wide">Имя и фамилия</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Иван Иванов"
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wide">Пароль</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Минимум 8 символов"
                minLength={8}
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">Ваша роль</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      form.role === r.value
                        ? 'bg-primary-600/20 border-primary-500/50 text-white shadow-lg shadow-primary-500/10'
                        : 'bg-white/[0.03] border-white/10 text-white/50 hover:bg-white/[0.06] hover:text-white/70'
                    }`}
                  >
                    <div className="text-lg mb-1">{r.icon}</div>
                    <div className="font-medium text-sm">{r.label}</div>
                    <div className="text-xs opacity-60 mt-0.5 leading-tight">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-primary-600/20 hover:shadow-primary-500/30 hover:-translate-y-0.5 mt-2"
            >
              {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
            </button>
          </form>

          <p className="mt-6 text-center text-white/30 text-sm">
            Уже есть аккаунт?{' '}
            <Link href="/auth/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
