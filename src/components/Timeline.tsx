import { Task } from '../App';
import { Calendar } from 'lucide-react';

interface TimelineProps {
  tasks: Task[];
  categoryColors: Record<string, string>;
  categoryLabels: Record<string, string>;
}

export function Timeline({ tasks, categoryColors, categoryLabels }: TimelineProps) {
  // 날짜 범위 계산
  const allDates = tasks.flatMap(task => [new Date(task.startDate), new Date(task.endDate)]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  
  // 시작을 월초로, 끝을 월말로 조정
  const startDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const endDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
  
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // 월별 그리드 생성
  const months: { label: string; days: number; startDay: number }[] = [];
  let currentDate = new Date(startDate);
  let dayCounter = 0;
  
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    months.push({
      label: `${year}년 ${month + 1}월`,
      days: daysInMonth,
      startDay: dayCounter
    });
    
    dayCounter += daysInMonth;
    currentDate = new Date(year, month + 1, 1);
  }

  // 작업별 위치 및 너비 계산
  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const startOffset = Math.ceil((taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  };

  // 오늘 날짜 마커 위치
  const today = new Date();
  const todayOffset = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const todayPosition = `${(todayOffset / totalDays) * 100}%`;

  const statusColors = {
    'not-started': 'bg-gray-300',
    'in-progress': 'bg-blue-500',
    'completed': 'bg-green-500',
    'delayed': 'bg-red-500'
  };

  // 카테고리별로 작업 그룹화
  const tasksByCategory = tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <h2 className="text-gray-900">타임라인 (Gantt Chart)</h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* 월 헤더 */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div className="w-64 p-4 border-r border-gray-200">
              <span className="text-gray-700">작업명</span>
            </div>
            <div className="flex-1 flex">
              {months.map((month, idx) => (
                <div
                  key={idx}
                  className="border-r border-gray-200 p-4 text-center"
                  style={{ width: `${(month.days / totalDays) * 100}%` }}
                >
                  <span className="text-gray-700">{month.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 타임라인 본문 */}
          <div className="relative">
            {/* 오늘 날짜 마커 */}
            {todayOffset >= 0 && todayOffset <= totalDays && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                style={{ left: todayPosition }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-red-600 whitespace-nowrap">
                  오늘
                </div>
              </div>
            )}

            {/* 카테고리별 작업 */}
            {Object.entries(tasksByCategory).map(([category, categoryTasks]) => (
              <div key={category} className="border-b border-gray-100">
                {/* 카테고리 헤더 */}
                <div className="flex bg-gray-50">
                  <div className="w-64 p-3 border-r border-gray-200 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${categoryColors[category]}`} />
                    <span className="text-gray-900">{categoryLabels[category]}</span>
                  </div>
                  <div className="flex-1" />
                </div>

                {/* 카테고리 내 작업들 */}
                {categoryTasks.map((task) => {
                  const position = getTaskPosition(task);
                  
                  return (
                    <div key={task.id} className="flex border-t border-gray-100 hover:bg-gray-50">
                      <div className="w-64 p-3 border-r border-gray-200">
                        <div className="text-gray-900">{task.name}</div>
                        <div className="text-gray-500 mt-1">
                          {task.responsible}
                        </div>
                      </div>
                      <div className="flex-1 relative p-3">
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 h-8 rounded ${statusColors[task.status]} opacity-80 hover:opacity-100 transition-opacity group cursor-pointer`}
                          style={position}
                        >
                          <div className="h-full flex items-center justify-between px-2">
                            <span className="text-white text-xs truncate">
                              {task.progress}%
                            </span>
                          </div>
                          
                          {/* 호버 툴팁 */}
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20">
                            <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg whitespace-nowrap">
                              <div>{task.name}</div>
                              <div className="text-gray-300 mt-1">
                                {task.startDate} ~ {task.endDate}
                              </div>
                              <div className="text-gray-300">
                                진행률: {task.progress}%
                              </div>
                              <div className="text-gray-300">
                                책임자: {task.responsible}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
