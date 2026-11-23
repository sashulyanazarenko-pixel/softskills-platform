'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';

interface Props {
  user: User | null;
}

export default function DashboardSidebar({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/dashboard', label: 'Главная', icon: '🏠' },
    { href: '/assessments', label: 'Тесты', icon: '📝' },
    { href: '/dashboard/results', label: 'Мои результаты', icon: '📊' },
    { href: '/dashboard/plan', label: 'План развития', icon: '🎯' },
    { href: '/profile', label: 'Профиль', icon: '👤' },
  ];

  const hrItems = [
    { href: '/admin', label: 'Управление', icon: '⚙️' },
    { href: '/admin/users', label: 'Пользователи', icon: '👥' },
    { href: '/admin/reports', label: 'Отчёты', icon: '📈' },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Логотип */}
      <div className="p-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
          <span className="font-semibold text-gray-900">SoftSkills Pro</span>
        </Link>
      </div>

      {/* Профиль пользователя */}
      {user && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
              {user.full_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{user.full_name}</div>
              <div className="text-xs text-gray-500 capitalize">{getRoleLabel(user.role)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Навигация */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2">Основное</div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive(item.href)
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {user?.role === 'hr' || user?.role === 'admin' ? (
          <>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2 mt-4">Администрирование</div>
            {hrItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        ) : null}
      </nav>

      {/* Выход */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <span>🚪</span>
          Выйти
        </button>
      </div>
    </aside>
  );
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Администратор',
    hr: 'HR-менеджер',
    manager: 'Руководитель',
    employee: 'Сотрудник',
    candidate: 'Кандидат',
  };
  return labels[role] || role;
}
