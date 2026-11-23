-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Типы
CREATE TYPE user_role AS ENUM ('admin', 'hr', 'manager', 'employee', 'candidate');
CREATE TYPE skill_category AS ENUM (
  'communication', 'teamwork', 'leadership', 'problem_solving',
  'adaptability', 'emotional_intelligence', 'time_management',
  'creativity', 'conflict_resolution', 'critical_thinking',
  'results_orientation', 'business_acumen'
);
CREATE TYPE question_type AS ENUM ('single_choice', 'multiple_choice', 'scale', 'open_text');
CREATE TYPE plan_status AS ENUM ('draft', 'active', 'completed');
CREATE TYPE resource_type AS ENUM ('book', 'course', 'article', 'practice');
CREATE TYPE priority_level AS ENUM ('high', 'medium', 'low');

-- Профили пользователей (расширяет auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'candidate',
  department TEXT,
  position TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Тесты/Опросники
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  skill_categories skill_category[] NOT NULL,
  time_limit_minutes INTEGER DEFAULT 30,
  question_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Вопросы
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  skill_category skill_category NOT NULL,
  question_type question_type NOT NULL DEFAULT 'single_choice',
  text TEXT NOT NULL,
  options JSONB, -- [{id, text, score}]
  min_scale INTEGER,
  max_scale INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Результаты тестирования
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id),
  scores JSONB NOT NULL DEFAULT '{}', -- {skill_category: score}
  total_score NUMERIC(5,2) DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}', -- {question_id: answer}
  time_spent_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индивидуальные планы развития
CREATE TABLE development_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_result_id UUID REFERENCES assessment_results(id),
  summary TEXT,
  overall_goal TEXT,
  items JSONB NOT NULL DEFAULT '[]', -- DevelopmentPlanItem[]
  status plan_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Назначение тестов
CREATE TABLE assessment_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id),
  assigned_to UUID NOT NULL REFERENCES profiles(id),
  assigned_by UUID NOT NULL REFERENCES profiles(id),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_assessment_results_user ON assessment_results(user_id);
CREATE INDEX idx_assessment_results_assessment ON assessment_results(assessment_id);
CREATE INDEX idx_development_plans_user ON development_plans(user_id);
CREATE INDEX idx_questions_assessment ON questions(assessment_id);
CREATE INDEX idx_assignments_user ON assessment_assignments(assigned_to);

-- Автообновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON development_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Автосоздание профиля при регистрации
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'candidate')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Обновление question_count в тесте
CREATE OR REPLACE FUNCTION update_question_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE assessments SET question_count = question_count + 1 WHERE id = NEW.assessment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE assessments SET question_count = question_count - 1 WHERE id = OLD.assessment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER question_count_trigger
  AFTER INSERT OR DELETE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_question_count();
