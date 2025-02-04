import { FC } from 'react';
import { format } from 'date-fns';
import { Task, TaskStatus, Priority } from '@/types/task';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { CalendarIcon, CheckCircleIcon, ClockIcon } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

const priorityColors = {
  [Priority.LOW]: 'bg-gray-500',
  [Priority.MEDIUM]: 'bg-blue-500',
  [Priority.HIGH]: 'bg-orange-500',
  [Priority.URGENT]: 'bg-red-500',
};

const statusColors = {
  [TaskStatus.TODO]: 'bg-gray-500',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-500',
  [TaskStatus.COMPLETED]: 'bg-green-500',
  [TaskStatus.CANCELLED]: 'bg-red-500',
  [TaskStatus.BLOCKED]: 'bg-orange-500',
};

export const TaskCard: FC<TaskCardProps> = ({ task, onClick }) => {
  const completedItems = task.checklist.filter(item => item.completed).length;
  const totalItems = task.checklist.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick?.(task)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{task.title}</h3>
          <Badge className={priorityColors[task.priority]}>
            {task.priority}
          </Badge>
        </div>
        <Badge variant="outline" className={statusColors[task.status]}>
          {task.status}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {task.description}
          </p>
        )}
        
        {totalItems > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-600">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              <span>Due {format(new Date(task.dueDate), 'MMM d')}</span>
            </div>
          )}
          {task.completedAt && (
            <div className="flex items-center gap-1">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span>Completed</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <div className="flex justify-between items-center w-full">
          <div className="flex -space-x-2">
            {task.assignedTo.slice(0, 3).map((user) => (
              <Avatar key={user.id} className="border-2 border-white">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
            ))}
            {task.assignedTo.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm border-2 border-white">
                +{task.assignedTo.length - 3}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <ClockIcon className="w-4 h-4" />
            <span>{format(new Date(task.createdAt), 'MMM d')}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
