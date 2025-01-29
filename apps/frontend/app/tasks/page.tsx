'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { DateRange } from 'react-day-picker';
import {
  TASKS_QUERY,
  CREATE_TASK_MUTATION,
  UPDATE_TASK_MUTATION,
  DELETE_TASK_MUTATION,
  ADD_TASK_CHECKLIST_ITEM_MUTATION,
  ADD_TASK_COMMENT_MUTATION,
} from '@/graphql/tasks.mutations';
import { Task, TaskStatus, Priority, TaskType } from '@/types/task.types';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskDetails } from '@/components/tasks/TaskDetails';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { PlusIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([]);
  const [typeFilter, setTypeFilter] = useState<TaskType[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { toast } = useToast();

  const { data, loading, refetch } = useQuery(TASKS_QUERY, {
    variables: {
      filter: {
        status: statusFilter.length > 0 ? statusFilter : undefined,
        priority: priorityFilter.length > 0 ? priorityFilter : undefined,
        type: typeFilter.length > 0 ? typeFilter : undefined,
        dueDateFrom: dateRange?.from?.toISOString(),
        dueDateTo: dateRange?.to?.toISOString(),
      },
    },
  });

  const [createTask] = useMutation(CREATE_TASK_MUTATION);
  const [updateTask] = useMutation(UPDATE_TASK_MUTATION);
  const [deleteTask] = useMutation(DELETE_TASK_MUTATION);
  const [addChecklistItem] = useMutation(ADD_TASK_CHECKLIST_ITEM_MUTATION);
  const [addComment] = useMutation(ADD_TASK_COMMENT_MUTATION);

  const handleCreateTask = async (input: any) => {
    try {
      await createTask({ variables: { input } });
      toast({
        title: 'Task created',
        description: 'The task has been created successfully.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTask = async (input: any) => {
    try {
      await updateTask({ variables: { input } });
      toast({
        title: 'Task updated',
        description: 'The task has been updated successfully.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask({ variables: { id } });
      toast({
        title: 'Task deleted',
        description: 'The task has been deleted successfully.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddChecklistItem = async (taskId: string, item: string) => {
    try {
      await addChecklistItem({
        variables: {
          taskId,
          input: { item },
        },
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add checklist item. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddComment = async (taskId: string, content: string) => {
    try {
      await addComment({
        variables: {
          input: { taskId, content },
        },
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredTasks = data?.tasks.filter((task: Task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <TaskForm onSubmit={handleCreateTask} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <Select
          onValueChange={(value) =>
            setStatusFilter(value ? [value as TaskStatus] : [])
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TaskStatus.TODO}>All Statuses</SelectItem>
            {Object.values(TaskStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(value) =>
            setPriorityFilter(value ? [value as Priority] : [])
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Priority.MEDIUM}>All Priorities</SelectItem>
            {Object.values(Priority).map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div>Loading tasks...</div>
        ) : (
          filteredTasks?.map((task: Task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={setSelectedTask}
            />
          ))
        )}
      </div>

      <Sheet
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      >
        <SheetContent className="sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle>Task Details</SheetTitle>
          </SheetHeader>
          {selectedTask && (
            <TaskDetails
              task={selectedTask}
              onAddChecklistItem={(item) =>
                handleAddChecklistItem(selectedTask.id, item)
              }
              onToggleChecklistItem={(itemId, completed) =>
                handleUpdateTask({
                  id: selectedTask.id,
                  checklist: selectedTask.checklist.map((item) =>
                    item.id === itemId ? { ...item, completed } : item
                  ),
                })
              }
              onAddComment={(content) =>
                handleAddComment(selectedTask.id, content)
              }
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
