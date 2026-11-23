# SoftSkills Pro 🧠

Платформа для оценки soft skills и создания персональных планов развития на основе ИИ.

## Возможности

- 📝 **Тестирование** — 10 ключевых soft skills компетенций
- 👥 **Роли** — HR, Руководитель, Сотрудник, Кандидат
- 🤖 **ИИ-планы** — Персональные ИПР с книгами, курсами и рекомендациями
- 📊 **Аналитика** — Детальные отчёты и динамика развития
- 🔐 **Безопасность** — RLS политики Supabase

## Стек

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **UI**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Деплой**: Vercel

## Быстрый старт

### 1. Клонировать репозиторий
```bash
git clone https://github.com/alexnazarenko/softskills-platform.git
cd softskills-platform
```

### 2. Установить зависимости
```bash
npm install
```

### 3. Настроить Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Скопируйте URL и anon key
3. Выполните миграции:
```bash
# В Supabase SQL Editor выполните по порядку:
# supabase/migrations/001_initial_schema.sql
# supabase/migrations/002_rls_policies.sql
# supabase/migrations/003_seed_data.sql
```

### 4. Создать .env.local
```bash
cp .env.example .env.local
# Заполните переменные
```

### 5. Запустить локально
```bash
npm run dev
```

## Деплой на Vercel

1. Создайте проект на [vercel.com](https://vercel.com)
2. Подключите GitHub репозиторий
3. Добавьте переменные окружения из `.env.example`
4. Деплой!

## Структура проекта

```
src/
├── app/
│   ├── api/          # API routes
│   ├── auth/         # Страницы авторизации
│   ├── assessments/  # Тесты
│   ├── dashboard/    # Личный кабинет
│   └── admin/        # Панель HR
├── components/       # UI компоненты
├── lib/supabase/     # Клиенты Supabase
└── types/            # TypeScript типы
supabase/
└── migrations/       # SQL миграции
```

## Роли пользователей

| Роль | Права |
|------|-------|
| `candidate` | Проходит тесты, видит свои результаты |
| `employee` | То же + доступ к плану развития |
| `manager` | Видит результаты команды |
| `hr` | Управляет тестами и пользователями |
| `admin` | Полный доступ |
