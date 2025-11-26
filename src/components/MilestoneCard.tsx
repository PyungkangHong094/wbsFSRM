import { Milestone } from '../App';
import { Flag, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface MilestoneCardProps {
  milestone: Milestone;
}

export function MilestoneCard({ milestone }: MilestoneCardProps) {
  const statusConfig = {
    upcoming: {
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    completed: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    overdue: {
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200'
    }
  };

  const config = statusConfig[milestone.status];
  const StatusIcon = config.icon;

  // 날짜까지 남은 일수 계산
  const getDaysUntil = () => {
    const today = new Date();
    const milestoneDate = new Date(milestone.date);
    const diffTime = milestoneDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntil();

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4 transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <Flag className={`w-5 h-5 ${config.color}`} />
        <StatusIcon className={`w-5 h-5 ${config.color}`} />
      </div>
      
      <h3 className="text-gray-900 mb-2">{milestone.name}</h3>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">목표일:</span>
          <span className={config.color}>{milestone.date}</span>
        </div>
        
        {milestone.status === 'upcoming' && daysUntil >= 0 && (
          <div className={`px-2 py-1 rounded text-center ${
            daysUntil <= 3 
              ? 'bg-red-100 text-red-700' 
              : daysUntil <= 7 
              ? 'bg-yellow-100 text-yellow-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {daysUntil === 0 ? '오늘' : `D-${daysUntil}`}
          </div>
        )}
        
        {milestone.status === 'completed' && (
          <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-center">
            ✓ 완료
          </div>
        )}
        
        {milestone.status === 'overdue' && (
          <div className="px-2 py-1 bg-red-100 text-red-700 rounded text-center">
            지연됨
          </div>
        )}
        
        <p className="text-gray-600 text-sm mt-2">{milestone.description}</p>
      </div>
    </div>
  );
}
