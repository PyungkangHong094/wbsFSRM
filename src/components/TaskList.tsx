import { Task } from '../App';
import { Calendar, User, Trash2, CheckCircle, Circle, Clock, AlertCircle, Edit, Pin } from 'lucide-react';
import { useState } from 'react';
import { EditTaskModal } from './EditTaskModal';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  categoryColors: Record<string, string>;
  categoryLabels: Record<string, string>;
}

export function TaskList({ tasks, onUpdateTask, onDeleteTask, categoryColors, categoryLabels }: TaskListProps) {
  const statusIcons = {
    'not-started': Circle,
    'in-progress': Clock,
    'completed': CheckCircle,
    'delayed': AlertCircle
  };

  const statusLabels = {
    'not-started': '시작 전',
    'in-progress': '진행 중',
    'completed': '완료',
    'delayed': '지연'
  };

  const statusColors = {
    'not-started': 'text-gray-500',
    'in-progress': 'text-blue-500',
    'completed': 'text-green-500',
    'delayed': 'text-red-500'
  };

  // 날짜 차이 계산
  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 카테고리별로 작업 그룹화
  const tasksByCategory = tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {Object.entries(tasksByCategory).map(([category, categoryTasks]) => (
        <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* 카테고리 헤더 */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${categoryColors[category]}`} />
              <h3 className="text-gray-900">{categoryLabels[category]}</h3>
              <span className="text-gray-500">
                ({categoryTasks.length}개 작업)
              </span>
            </div>
          </div>

          {/* 작업 목록 */}
          <div className="divide-y divide-gray-100">
            {categoryTasks.map((task) => {
              const StatusIcon = statusIcons[task.status];
              const daysRemaining = getDaysRemaining(task.endDate);
              
              return (
                <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* 작업명과 상태 */}
                      <div className="flex items-start gap-3 mb-2">
                        <StatusIcon className={`w-5 h-5 mt-0.5 ${statusColors[task.status]}`} />
                        <div className="flex-1">
                          <h4 className="text-gray-900">{task.name}</h4>
                          {task.description && (
                            <p className="text-gray-600 mt-1">{task.description}</p>
                          )}
                        </div>
                      </div>

                      {/* 세부 정보 */}
                      <div className="ml-8 space-y-2">
                        <div className="flex items-center gap-4 text-gray-600 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {task.startDate} ~ {task.endDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>
                              {Array.isArray(task.responsible) 
                                ? task.responsible.join(', ') 
                                : task.responsible}
                            </span>
                          </div>
                          {task.isMilestone && (
                            <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700">
                              📌 마일스톤
                            </span>
                          )}
                          {daysRemaining >= 0 && task.status !== 'completed' && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              daysRemaining <= 3 
                                ? 'bg-red-100 text-red-700' 
                                : daysRemaining <= 7 
                                ? 'bg-yellow-100 text-yellow-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {daysRemaining === 0 ? '오늘 마감' : `D-${daysRemaining}`}
                            </span>
                          )}
                          {daysRemaining < 0 && task.status !== 'completed' && (
                            <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">
                              {Math.abs(daysRemaining)}일 지연
                            </span>
                          )}
                        </div>

                        {/* 진행률 바 */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                task.status === 'completed' 
                                  ? 'bg-green-500' 
                                  : task.status === 'delayed'
                                  ? 'bg-red-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-gray-700 w-12 text-right">
                            {task.progress}%
                          </span>
                        </div>

                        {/* 진행률 업데이트 슬라이더 */}
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={task.progress}
                            onChange={(e) => {
                              const newProgress = parseInt(e.target.value);
                              let newStatus = task.status;
                              
                              if (newProgress === 100) {
                                newStatus = 'completed';
                              } else if (newProgress > 0) {
                                newStatus = 'in-progress';
                              }
                              
                              onUpdateTask(task.id, { 
                                progress: newProgress,
                                status: newStatus
                              });
                            }}
                            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <select
                            value={task.status}
                            onChange={(e) => onUpdateTask(task.id, { status: e.target.value as Task['status'] })}
                            className="px-3 py-1 border border-gray-300 rounded text-gray-700"
                          >
                            <option value="not-started">시작 전</option>
                            <option value="in-progress">진행 중</option>
                            <option value="completed">완료</option>
                            <option value="delayed">지연</option>
                          </select>
                        </div>

                        {/* 의존성 */}
                        {task.dependencies && task.dependencies.length > 0 && (
                          <div className="text-gray-600">
                            <span className="text-xs">의존성: </span>
                            <span className="text-xs">
                              {task.dependencies.map(depId => {
                                const depTask = tasks.find(t => t.id === depId);
                                return depTask?.name;
                              }).filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 액션 버튼들 */}
                    <div className="flex gap-2">
                      {/* 마일스톤 핀 토글 */}
                      <button
                        onClick={() => onUpdateTask(task.id, { isMilestone: !task.isMilestone })}
                        className={`p-2 rounded transition-colors ${
                          task.isMilestone
                            ? 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                            : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                        title={task.isMilestone ? '마일스톤 해제' : '마일스톤으로 고정'}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      
                      {/* 수정 버튼 */}
                      <button
                        onClick={() => setEditingTaskId(task.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="작업 수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => {
                          if (confirm(`"${task.name}" 작업을 삭제하시겠습니까?`)) {
                            onDeleteTask(task.id);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="작업 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {tasks.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">표시할 작업이 없습니다.</p>
        </div>
      )}

      {editingTaskId && (
        <EditTaskModal
          task={tasks.find(t => t.id === editingTaskId)!}
          onClose={() => setEditingTaskId(null)}
          onUpdate={(updates) => onUpdateTask(editingTaskId, updates)}
          teamMembers={['홍평강', '최혜민']}
        />
      )}
    </div>
  );
}