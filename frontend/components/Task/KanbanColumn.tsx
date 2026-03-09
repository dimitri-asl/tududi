import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { Task } from '../../entities/Task';
import { Project } from '../../entities/Project';
import TaskItem from './TaskItem';
import {
    StatusKey,
    getStatusButtonColorClasses,
    getStatusBorderColorClasses,
} from './statusStyles';
import { TFunction } from 'i18next';

interface DraggableTaskCardProps {
    task: Task;
    onTaskUpdate: (task: Task) => Promise<void>;
    onTaskCompletionToggle?: (task: Task) => void;
    onTaskDelete: (taskUid: string) => void;
    projects: Project[];
    onToggleToday?: (taskId: number, task?: Task) => Promise<void>;
    showCompletedTasks?: boolean;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
    task,
    ...props
}) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: task.uid || String(task.id),
        data: { task },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`touch-none ${isDragging ? 'opacity-30' : ''}`}
        >
            <TaskItem
                task={task}
                hideProjectName
                hideStatusControl
                {...props}
            />
        </div>
    );
};

interface KanbanColumnProps {
    status: StatusKey;
    tasks: Task[];
    onTaskUpdate: (task: Task) => Promise<void>;
    onTaskCompletionToggle?: (task: Task) => void;
    onTaskDelete: (taskUid: string) => void;
    projects: Project[];
    onToggleToday?: (taskId: number, task?: Task) => Promise<void>;
    showCompletedTasks?: boolean;
    t: TFunction;
}

const STATUS_LABELS: Record<StatusKey, { key: string; fallback: string }> = {
    not_started: { key: 'task.status.notStarted', fallback: 'Not started' },
    planned: { key: 'task.status.planned', fallback: 'Planned' },
    in_progress: { key: 'task.status.inProgress', fallback: 'In progress' },
    waiting: { key: 'task.status.waiting', fallback: 'Waiting' },
    done: { key: 'task.status.done', fallback: 'Done' },
    archived: { key: 'task.status.archived', fallback: 'Archived' },
    cancelled: { key: 'task.status.cancelled', fallback: 'Cancelled' },
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({
    status,
    tasks,
    onTaskUpdate,
    onTaskCompletionToggle,
    onTaskDelete,
    projects,
    onToggleToday,
    showCompletedTasks,
    t,
}) => {
    const { setNodeRef, isOver } = useDroppable({ id: status });
    const label = STATUS_LABELS[status];

    return (
        <div
            ref={setNodeRef}
            className={`min-w-[280px] w-[280px] flex flex-col rounded-lg border ${getStatusBorderColorClasses(status)} ${
                isOver
                    ? 'ring-2 ring-blue-400 dark:ring-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'bg-gray-50/50 dark:bg-gray-800/30'
            } transition-all duration-150`}
        >
            <div
                className={`flex items-center justify-between px-3 py-2 rounded-t-lg ${getStatusButtonColorClasses(status)}`}
            >
                <span className="text-sm font-medium">
                    {t(label.key, label.fallback)}
                </span>
                <span className="text-xs font-medium opacity-70">
                    {tasks.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px] max-h-[calc(100vh-300px)]">
                {tasks.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
                        {t(
                            'project.kanban.emptyColumn',
                            'No tasks'
                        )}
                    </p>
                ) : (
                    tasks.map((task) => (
                        <DraggableTaskCard
                            key={task.uid || task.id}
                            task={task}
                            onTaskUpdate={onTaskUpdate}
                            onTaskCompletionToggle={onTaskCompletionToggle}
                            onTaskDelete={onTaskDelete}
                            projects={projects}
                            onToggleToday={onToggleToday}
                            showCompletedTasks={showCompletedTasks}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
