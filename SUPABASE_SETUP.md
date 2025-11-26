# Supabase 데이터베이스 설정 가이드

이 문서는 FSRMManagement 애플리케이션을 위한 Supabase 데이터베이스 설정 방법을 설명합니다.

## 목차
1. [테이블 생성](#테이블-생성)
2. [Row Level Security (RLS) 설정](#row-level-security-rls-설정)
3. [환경 변수 설정](#환경-변수-설정)
4. [데이터 확인](#데이터-확인)

---

## 테이블 생성

Supabase 대시보드에서 SQL Editor를 열고 다음 SQL을 실행하세요.

### Tasks 테이블

```sql
-- tasks 테이블 생성
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('development', 'operation', 'marketing', 'legal')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  responsible JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('not-started', 'in-progress', 'completed', 'delayed')),
  description TEXT,
  dependencies JSONB DEFAULT '[]'::jsonb,
  is_milestone BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- tasks 테이블에 트리거 추가
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON tasks(start_date);
CREATE INDEX IF NOT EXISTS idx_tasks_end_date ON tasks(end_date);
```

### Milestones 테이블

```sql
-- milestones 테이블 생성
CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'completed', 'overdue')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- milestones 테이블에 트리거 추가
DROP TRIGGER IF EXISTS update_milestones_updated_at ON milestones;
CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_milestones_date ON milestones(date);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);
```

---

## Row Level Security (RLS) 설정

> [!IMPORTANT]
> 현재는 개발 단계이므로 모든 사용자가 읽기/쓰기 권한을 가지도록 설정합니다. 프로덕션 환경에서는 인증된 사용자만 접근할 수 있도록 정책을 수정해야 합니다.

### Tasks 테이블 RLS

```sql
-- RLS 활성화
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 개발용: 모든 사용자가 읽기 가능
CREATE POLICY "Enable read access for all users" ON tasks
  FOR SELECT
  USING (true);

-- 개발용: 모든 사용자가 삽입 가능
CREATE POLICY "Enable insert access for all users" ON tasks
  FOR INSERT
  WITH CHECK (true);

-- 개발용: 모든 사용자가 업데이트 가능
CREATE POLICY "Enable update access for all users" ON tasks
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 개발용: 모든 사용자가 삭제 가능
CREATE POLICY "Enable delete access for all users" ON tasks
  FOR DELETE
  USING (true);
```

### Milestones 테이블 RLS

```sql
-- RLS 활성화
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- 개발용: 모든 사용자가 읽기 가능
CREATE POLICY "Enable read access for all users" ON milestones
  FOR SELECT
  USING (true);

-- 개발용: 모든 사용자가 삽입 가능
CREATE POLICY "Enable insert access for all users" ON milestones
  FOR INSERT
  WITH CHECK (true);

-- 개발용: 모든 사용자가 업데이트 가능
CREATE POLICY "Enable update access for all users" ON milestones
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 개발용: 모든 사용자가 삭제 가능
CREATE POLICY "Enable delete access for all users" ON milestones
  FOR DELETE
  USING (true);
```

> [!WARNING]
> **프로덕션 환경에서는 다음과 같이 변경하세요:**
> ```sql
> -- 예시: 인증된 사용자만 접근 가능
> CREATE POLICY "Authenticated users can read" ON tasks
>   FOR SELECT
>   USING (auth.role() = 'authenticated');
> ```

---

## 환경 변수 설정

`.env` 파일에 다음 환경 변수가 설정되어 있는지 확인하세요:

```bash
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Supabase 프로젝트 정보 찾기

1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. **Settings** → **API** 메뉴로 이동
4. **Project URL**에서 프로젝트 ID 확인 (예: `https://tmjdfwzdneptihhruawr.supabase.co`에서 `tmjdfwzdneptihhruawr` 부분)
5. **Project API keys** → **anon public** 키 복사

---

## 데이터 확인

### Supabase 대시보드에서 확인

1. Supabase 대시보드 → **Table Editor** 메뉴
2. `tasks` 또는 `milestones` 테이블 선택
3. 데이터 추가/수정/삭제 가능

### SQL로 데이터 조회

```sql
-- 모든 작업 조회
SELECT * FROM tasks ORDER BY start_date;

-- 진행 중인 작업만 조회
SELECT * FROM tasks WHERE status = 'in-progress';

-- 모든 마일스톤 조회
SELECT * FROM milestones ORDER BY date;

-- 특정 카테고리의 작업 조회
SELECT * FROM tasks WHERE category = 'development';
```

---

## 문제 해결

### RLS 정책 오류

만약 "Row Level Security policy violation" 오류가 발생하면:

1. Supabase 대시보드 → **Authentication** → **Policies** 확인
2. 위의 RLS 설정 SQL을 다시 실행
3. 또는 개발 중에는 RLS를 비활성화할 수 있습니다:
   ```sql
   ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
   ALTER TABLE milestones DISABLE ROW LEVEL SECURITY;
   ```

### 연결 오류

환경 변수가 올바르게 설정되었는지 확인:
```bash
# .env 파일 확인
cat .env

# 개발 서버 재시작
npm run dev
```

---

## 다음 단계

1. ✅ 테이블 생성 완료
2. ✅ RLS 설정 완료
3. ✅ 환경 변수 설정 완료
4. 🔄 애플리케이션에서 데이터 CRUD 테스트
5. 📊 실제 프로젝트 데이터 입력
