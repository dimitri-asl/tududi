import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { Task } from '../../entities/Task';
import { Project } from '../../entities/Project';
import { StatusKey, resolveStatusKey } from './statusStyles';
import KanbanColumn from './KanbanColumn';
import TaskItem from './TaskItem';
import { TFunction } from 'i18next';

const KANBAN_COLUMNS: StatusKey[] = [
    'not_started',
    'planned',
    'in_progress',
    'waiting',
    'review',
    'done',
];

const STATUS_KEY_TO_VALUE: Record<StatusKey, string | number> = {
    not_started: 'not_started',
    planned: 'planned',
    in_progress: 'in_progress',
    waiting: 'waiting',
    review: 'review',
    done: 'done',
    archived: 'archived',
    cancelled: 'cancelled',
};

interface KanbanBoardProps {
    tasks: Task[];
    onTaskUpdate: (task: Task) => Promise<void>;
    onTaskCompletionToggle?: (task: Task) => void;
    onTaskDelete: (taskUid: string) => void;
    projects: Project[];
    onToggleToday?: (taskId: number, task?: Task) => Promise<void>;
    showCompletedTasks?: boolean;
    t: TFunction;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
    tasks,
    onTaskUpdate,
    onTaskCompletionToggle,
    onTaskDelete,
    projects,
    onToggleToday,
    showCompletedTasks,
    t,
}) => {
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    const groupedTasks = useMemo(() => {
        const groups: Record<StatusKey, Task[]> = {
            not_started: [],
            planned: [],
            in_progress: [],
            waiting: [],
            review: [],
            done: [],
            archived: [],
            cancelled: [],
        };

        for (const task of tasks) {
            const key = resolveStatusKey(task.status);
            if (groups[key]) {
                groups[key].push(task);
            }
        }

        return groups;
    }, [tasks]);

    const handleDragStart = (event: DragStartEvent) => {
        const task = event.active.data.current?.task as Task | undefined;
        setActiveTask(task || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const targetStatus = over.id as StatusKey;
        const task = active.data.current?.task as Task | undefined;
        if (!task) return;

        const currentKey = resolveStatusKey(task.status);
        if (currentKey === targetStatus) return;

        const newStatus = STATUS_KEY_TO_VALUE[targetStatus];
        onTaskUpdate({ ...task, status: newStatus as Task['status'] });
    };

    const handleDragCancel = () => {
        setActiveTask(null);
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="flex gap-3 overflow-x-auto pb-4">
                {KANBAN_COLUMNS.map((status) => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        tasks={groupedTasks[status]}
                        onTaskUpdate={onTaskUpdate}
                        onTaskCompletionToggle={onTaskCompletionToggle}
                        onTaskDelete={onTaskDelete}
                        projects={projects}
                        onToggleToday={onToggleToday}
                        showCompletedTasks={showCompletedTasks}
                        t={t}
                    />
                ))}
            </div>

            {createPortal(
                <DragOverlay>
                    {activeTask ? (
                        <div className="opacity-90 shadow-xl rotate-2 w-[280px]">
                            <TaskItem
                                task={activeTask}
                                onTaskUpdate={onTaskUpdate}
                                onTaskCompletionToggle={
                                    onTaskCompletionToggle || (() => {})
                                }
                                onTaskDelete={onTaskDelete}
                                projects={projects}
                                hideProjectName
                                hideStatusControl
                            />
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
};

export default KanbanBoard;
