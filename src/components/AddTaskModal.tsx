import { useState } from 'react';
import { Task } from '../App';
import { X } from 'lucide-react';

interface AddTaskModalProps {
  onClose: () => void;
  onAdd: (task: Task) => void;
  existingTasks: Task[];
  teamMembers: string[];
}

export function AddTaskModal({ onClose, onAdd, existingTasks, teamMembers }: AddTaskModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'development' as Task['category'],
    startDate: '',
    endDate: '',
    responsible: [] as string[],
    description: '',
    status: 'not-started' as Task['status'],
    progress: 0,
    isMilestone: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.responsible.length) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...formData
    };

    onAdd(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-gray-900">새 작업 추가</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 작업명 */}
          <div>
            <label className="block text-gray-700 mb-2">
              작업명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="예: 사용자 인증 기능 개발"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-gray-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Task['category'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="development">개발</option>
              <option value="operation">운영</option>
              <option value="marketing">마케팅</option>
              <option value="legal">법률/규정</option>
            </select>
          </div>

          {/* 날짜 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">
                시작일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">
                마감일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 책임자 */}
          <div>
            <label className="block text-gray-700 mb-2">
              책임자 <span className="text-red-500">*</span> (복수 선택 가능)
            </label>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <label key={member} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.responsible.includes(member)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, responsible: [...formData.responsible, member] });
                      } else {
                        setFormData({ ...formData, responsible: formData.responsible.filter(r => r !== member) });
                      }
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-gray-700">{member}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="작업에 대한 상세 설명을 입력하세요"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 상태 */}
          <div>
            <label className="block text-gray-700 mb-2">
              상태
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="not-started">시작 전</option>
              <option value="in-progress">진행 중</option>
              <option value="completed">완료</option>
              <option value="delayed">지연</option>
            </select>
          </div>

          {/* 진행률 */}
          <div>
            <label className="block text-gray-700 mb-2">
              진행률: {formData.progress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* 마일스톤 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isMilestone"
              checked={formData.isMilestone}
              onChange={(e) => setFormData({ ...formData, isMilestone: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="isMilestone" className="text-gray-700 cursor-pointer">
              📌 마일스톤으로 고정 (상단에 표시됨)
            </label>
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              작업 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}