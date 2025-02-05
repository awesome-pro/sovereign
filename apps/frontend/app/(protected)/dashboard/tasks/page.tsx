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
import { Task, TaskStatus, Priority, TaskType } from '@/types/task';
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
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon, 
  RefreshCwIcon 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/providers/auth-provider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([]);
  const [typeFilter, setTypeFilter] = useState<TaskType[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const { toast } = useToast();
  const { user } = useAuthContext();

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
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-only',
  });

  const [createTask] = useMutation(CREATE_TASK_MUTATION, {
    update(cache, { data: { createTask } }) {
      const existingTasks = cache.readQuery<{ tasks: Task[] }>({
        query: TASKS_QUERY,
        variables: { filter: {} }
      });

      if (existingTasks?.tasks) {
        cache.writeQuery({
          query: TASKS_QUERY,
          variables: { filter: {} },
          data: {
            tasks: [...existingTasks.tasks, createTask]
          }
        });
      } else {
        cache.writeQuery({
          query: TASKS_QUERY,
          variables: { filter: {} },
          data: {
            tasks: [createTask]
          }
        });
      }
    }
  });

  const [updateTask] = useMutation(UPDATE_TASK_MUTATION, {
    update(cache, { data: { updateTask } }) {
      const existingTasks = cache.readQuery<{ tasks: Task[] }>({
        query: TASKS_QUERY,
        variables: { filter: {} }
      });

      if (existingTasks?.tasks) {
        cache.writeQuery({
          query: TASKS_QUERY,
          variables: { filter: {} },
          data: {
            tasks: existingTasks.tasks.map((task: Task) =>
              task.id === updateTask.id ? updateTask : task
            )
          }
        });
      }
    }
  });

  const [deleteTask] = useMutation(DELETE_TASK_MUTATION, {
    update(cache, { data: { deleteTask } }, { variables }) {
      const existingTasks = cache.readQuery<{ tasks: Task[] }>({
        query: TASKS_QUERY,
        variables: { filter: {} }
      });

      if (existingTasks?.tasks && variables?.id) {
        cache.writeQuery({
          query: TASKS_QUERY,
          variables: { filter: {} },
          data: {
            tasks: existingTasks.tasks.filter((task: Task) => task.id !== variables.id)
          }
        });
      }
    }
  });

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

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter([]);
    setPriorityFilter([]);
    setTypeFilter([]);
    setDateRange(undefined);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => refetch()}>
                  <RefreshCwIcon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh Tasks</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="min-w-[850px] h-[80vh] overflow-y-scroll">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <TaskForm onSubmit={handleCreateTask} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            <FilterIcon className="w-4 h-4" />
          </Button>
        </div>

        {isFilterExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-secondary/10 p-4 rounded-lg">
            <Select
              value={statusFilter[0] || ''}
              onValueChange={(value) =>
                setStatusFilter(value ? [value as TaskStatus] : [])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TaskStatus.TODO}>Select Status</SelectItem>
                {Object.values(TaskStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={priorityFilter[0] || ''}
              onValueChange={(value) =>
                setPriorityFilter(value ? [value as Priority] : [])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Priority.MEDIUM}>Select Priority</SelectItem>
                {Object.values(Priority).map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={typeFilter[0] || ''}
              onValueChange={(value) =>
                setTypeFilter(value ? [value as TaskType] : [])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TaskType.FOLLOW_UP}>Select Type</SelectItem>
                {Object.values(TaskType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              className="w-full"
            />

            <div className="col-span-full flex justify-end space-x-2">
              <Button variant="ghost" onClick={clearAllFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-muted-foreground">
            Loading tasks...
          </div>
        ) : filteredTasks?.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground">
            No tasks found. Try adjusting your filters.
          </div>
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
        <SheetContent className="sm:max-w-[600px] w-full">
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
              onUploadAttachment={(file) =>
                toast({
                  title: "TODO",
                  description: "Attachment upload not implemented yet.",
                  variant: "destructive"
                })
              }
              onUpdateStatus={(status) =>
                handleUpdateTask({
                  id: selectedTask.id,
                  status,
                })
              }
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
