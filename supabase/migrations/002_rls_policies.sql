-- Row Level Security (RLS) политики

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_assignments ENABLE ROW LEVEL SECURITY;

-- ===== PROFILES =====

-- Пользователь видит свой профиль
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

-- HR и admin видят все профили
CREATE POLICY "HR and admin can view all profiles"
  ON profiles FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('hr', 'admin', 'manager')
    )
  );

-- Пользователь может обновить свой профиль
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Admin может создавать профили
CREATE POLICY "Admin can insert profiles"
  ON profiles FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ===== ASSESSMENTS =====

-- Все авторизованные видят активные тесты
CREATE POLICY "Authenticated can view active assessments"
  ON assessments FOR SELECT TO authenticated USING (is_active = true);

-- HR и admin видят все тесты
CREATE POLICY "HR and admin can view all assessments"
  ON assessments FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
  );

-- HR и admin могут создавать/изменять тесты
CREATE POLICY "HR and admin can manage assessments"
  ON assessments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
  );

-- ===== QUESTIONS =====

-- Видны вопросы активных тестов
CREATE POLICY "Can view questions of active assessments"
  ON questions FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND is_active = true)
  );

-- HR/admin управляют вопросами
CREATE POLICY "HR and admin can manage questions"
  ON questions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
  );

-- ===== ASSESSMENT RESULTS =====

-- Пользователь видит свои результаты
CREATE POLICY "Users can view own results"
  ON assessment_results FOR SELECT USING (user_id = auth.uid());

-- Пользователь может создавать свои результаты
CREATE POLICY "Users can insert own results"
  ON assessment_results FOR INSERT WITH CHECK (user_id = auth.uid());

-- HR/admin/manager видят все результаты
CREATE POLICY "HR and admin can view all results"
  ON assessment_results FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hr', 'admin', 'manager'))
  );

-- ===== DEVELOPMENT PLANS =====

-- Пользователь видит свои планы
CREATE POLICY "Users can view own plans"
  ON development_plans FOR SELECT USING (user_id = auth.uid());

-- Пользователь может создавать свои планы
CREATE POLICY "Users can insert own plans"
  ON development_plans FOR INSERT WITH CHECK (user_id = auth.uid());

-- Пользователь может обновлять свои планы
CREATE POLICY "Users can update own plans"
  ON development_plans FOR UPDATE USING (user_id = auth.uid());

-- HR/admin/manager видят все планы
CREATE POLICY "HR and admin can view all plans"
  ON development_plans FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hr', 'admin', 'manager'))
  );

-- ===== ASSIGNMENTS =====

-- Пользователь видит назначенные ему тесты
CREATE POLICY "Users can view own assignments"
  ON assessment_assignments FOR SELECT USING (assigned_to = auth.uid());

-- HR/admin/manager видят все назначения
CREATE POLICY "HR can view all assignments"
  ON assessment_assignments FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hr', 'admin', 'manager'))
  );

-- HR/admin могут создавать назначения
CREATE POLICY "HR can manage assignments"
  ON assessment_assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
  );
