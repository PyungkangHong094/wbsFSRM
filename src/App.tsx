import { useState } from 'react';
import { Calendar, Plus, Filter, Download } from 'lucide-react';
import { Timeline } from './components/Timeline';
import { TaskList } from './components/TaskList';
import { MilestoneCard } from './components/MilestoneCard';
import { AddTaskModal } from './components/AddTaskModal';
import { useTasksAndMilestones } from './hooks/useTasksAndMilestones';

export interface Task {
  id: string;
  name: string;
  category: 'development' | 'operation' | 'marketing' | 'legal';
  startDate: string;
  endDate: string;
  progress: number;
  responsible: string[];
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  dependencies?: string[];
  description?: string;
  isMilestone?: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  date: string;
  status: 'upcoming' | 'completed' | 'overdue';
  description: string;
}

export default function App() {
  const [view, setView] = useState<'timeline' | 'list'>('timeline');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const teamMembers = ['홍평강', '최혜민'];

  const { tasks, setTasks, milestones, setMilestones, isLoading } = useTasksAndMilestones();

  // Task의 isMilestone에서 마일스톤 자동 생성
  const computedMilestones: Milestone[] = tasks
    .filter(task => task.isMilestone)
    .map(task => ({
      id: task.id,
      name: task.name,
      date: task.endDate,
      status: task.status === 'completed' ? 'completed' as const : 'upcoming' as const,
      description: task.description || ''
    }));

  const addTask = (task: Task) => {
    setTasks([...tasks, { ...task, id: `task-${Date.now()}` }]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, ...updates } : task));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const filteredTasks = filterCategory === 'all' 
    ? tasks 
    : tasks.filter(task => task.category === filterCategory);

  const categoryColors = {
    development: 'bg-blue-500',
    operation: 'bg-green-500',
    marketing: 'bg-purple-500',
    legal: 'bg-orange-500'
  };

  const categoryLabels = {
    development: '개발',
    operation: '운영',
    marketing: '마케팅',
    legal: '법률/규정'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">낚시 앱 개발 일정 관리</h1>
              <p className="text-gray-600 mt-1">WBS, 마일스톤 및 타임라인 통합 관리</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              작업 추가
            </button>
          </div>

          {/* 주요 알림 */}
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              <strong>⚠️ 중요:</strong> 구글 플레이 콘솔 앱 등록은 2025년 2월 28일까지 완료 필수 (심사 기간 고려)
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">데이터를 불러오는 중...</div>
          </div>
        ) : (
          <>
        {/* 마일스톤 카드 */}
        <section className="mb-8">
          <h2 className="text-gray-900 mb-4">주요 마일스톤 (📌핀으로 고정된 작업)</h2>
          {computedMilestones.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <p className="text-gray-500">핀으로 고정된 마일스톤이 없습니다. 작업 목록에서 중요한 작업을 핀으로 고정하세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {computedMilestones.map(milestone => (
                <MilestoneCard key={milestone.id} milestone={milestone} />
              ))}
            </div>
          )}
        </section>

        {/* 필터 및 뷰 전환 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
            >
              <option value="all">전체 카테고리</option>
              <option value="development">개발</option>
              <option value="operation">운영</option>
              <option value="marketing">마케팅</option>
              <option value="legal">법률/규정</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('timeline')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'timeline'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              타임라인
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              목록
            </button>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        {view === 'timeline' ? (
          <Timeline 
            tasks={filteredTasks} 
            categoryColors={categoryColors}
            categoryLabels={categoryLabels}
          />
        ) : (
          <TaskList
            tasks={filteredTasks}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            categoryColors={categoryColors}
            categoryLabels={categoryLabels}
          />
        )}

        {/* 범례 */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4">카테고리</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${categoryColors[key as keyof typeof categoryColors]}`} />
                <span className="text-gray-700">{label}</span>
              </div>
            ))}
          </div>

          <h3 className="text-gray-900 mt-6 mb-4">진행 상태</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-300" />
              <span className="text-gray-700">시작 전</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-gray-700">진행 중</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-gray-700">완료</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-gray-700">지연</span>
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* 작업 추가 모달 */}
      {isAddModalOpen && (
        <AddTaskModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={addTask}
          existingTasks={tasks}
          teamMembers={teamMembers}
        />
      )}
    </div>
  );
}