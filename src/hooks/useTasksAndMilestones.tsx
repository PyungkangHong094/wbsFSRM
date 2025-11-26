import { useState, useEffect } from 'react';
import { Task, Milestone } from '../App';
import { supabase } from '../utils/supabase/client';

// 데이터베이스 row를 Task 타입으로 변환
function dbRowToTask(row: any): Task {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    startDate: row.start_date,
    endDate: row.end_date,
    progress: row.progress,
    responsible: row.responsible || [],
    status: row.status,
    description: row.description,
    dependencies: row.dependencies || [],
    isMilestone: row.is_milestone || false
  };
}

// Task를 데이터베이스 row 형식으로 변환
function taskToDbRow(task: Task): any {
  return {
    id: task.id,
    name: task.name,
    category: task.category,
    start_date: task.startDate,
    end_date: task.endDate,
    progress: task.progress,
    responsible: task.responsible,
    status: task.status,
    description: task.description,
    dependencies: task.dependencies || [],
    is_milestone: task.isMilestone || false
  };
}

export function useTasksAndMilestones() {
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [milestones, setMilestonesState] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    async function loadData() {
      try {
        // Tasks 로드
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .order('start_date', { ascending: true });

        if (tasksError) {
          console.error('Error loading tasks:', tasksError);
          throw tasksError;
        }

        // Milestones 로드
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('milestones')
          .select('*')
          .order('date', { ascending: true });

        if (milestonesError) {
          console.error('Error loading milestones:', milestonesError);
          throw milestonesError;
        }

        // 데이터 변환 및 설정
        const convertedTasks = (tasksData || []).map(dbRowToTask);
        setTasksState(convertedTasks);
        setMilestonesState(milestonesData || []);

        console.log('Supabase data loaded successfully');
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        // 에러 발생 시 빈 배열로 설정
        setTasksState([]);
        setMilestonesState([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Tasks 업데이트 함수
  const setTasks = async (newTasks: Task[] | ((prev: Task[]) => Task[])) => {
    const tasksToSave = typeof newTasks === 'function' ? newTasks(tasks) : newTasks;
    setTasksState(tasksToSave);

    try {
      // 변경 사항 감지
      const newTaskIds = tasksToSave.map(t => t.id);
      const oldTaskIds = tasks.map(t => t.id);

      // 새로 추가된 작업
      const addedTasks = tasksToSave.filter(t => !oldTaskIds.includes(t.id));
      for (const task of addedTasks) {
        const { error } = await supabase
          .from('tasks')
          .insert(taskToDbRow(task));

        if (error) {
          console.error('Error inserting task:', error);
        }
      }

      // 업데이트된 작업
      const updatedTasks = tasksToSave.filter(t => {
        const oldTask = tasks.find(old => old.id === t.id);
        return oldTask && JSON.stringify(oldTask) !== JSON.stringify(t);
      });
      for (const task of updatedTasks) {
        const { error } = await supabase
          .from('tasks')
          .update(taskToDbRow(task))
          .eq('id', task.id);

        if (error) {
          console.error('Error updating task:', error);
        }
      }

      // 삭제된 작업
      const deletedTaskIds = oldTaskIds.filter(id => !newTaskIds.includes(id));
      for (const id of deletedTaskIds) {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting task:', error);
        }
      }
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  // Milestones 업데이트 함수
  const setMilestones = async (newMilestones: Milestone[] | ((prev: Milestone[]) => Milestone[])) => {
    const milestonesToSave = typeof newMilestones === 'function' ? newMilestones(milestones) : newMilestones;
    setMilestonesState(milestonesToSave);

    try {
      // 변경 사항 감지
      const newMilestoneIds = milestonesToSave.map(m => m.id);
      const oldMilestoneIds = milestones.map(m => m.id);

      // 새로 추가된 마일스톤
      const addedMilestones = milestonesToSave.filter(m => !oldMilestoneIds.includes(m.id));
      for (const milestone of addedMilestones) {
        const { error } = await supabase
          .from('milestones')
          .insert(milestone);

        if (error) {
          console.error('Error inserting milestone:', error);
        }
      }

      // 업데이트된 마일스톤
      const updatedMilestones = milestonesToSave.filter(m => {
        const oldMilestone = milestones.find(old => old.id === m.id);
        return oldMilestone && JSON.stringify(oldMilestone) !== JSON.stringify(m);
      });
      for (const milestone of updatedMilestones) {
        const { error } = await supabase
          .from('milestones')
          .update(milestone)
          .eq('id', milestone.id);

        if (error) {
          console.error('Error updating milestone:', error);
        }
      }

      // 삭제된 마일스톤
      const deletedMilestoneIds = oldMilestoneIds.filter(id => !newMilestoneIds.includes(id));
      for (const id of deletedMilestoneIds) {
        const { error } = await supabase
          .from('milestones')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting milestone:', error);
        }
      }
    } catch (error) {
      console.error('Error saving milestones:', error);
    }
  };

  return {
    tasks,
    setTasks,
    milestones,
    setMilestones,
    isLoading
  };
}