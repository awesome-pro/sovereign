import { FC } from 'react';
import { format } from 'date-fns';
import { Task, TaskStatus, Priority, TaskType } from '@/types/task';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  FileTextIcon, 
  TagIcon, 
  UserIcon, 
  BuildingIcon 
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

const priorityColors = {
  [Priority.LOW]: 'bg-gray-500 text-white',
  [Priority.MEDIUM]: 'bg-blue-500 text-white',
  [Priority.HIGH]: 'bg-orange-500 text-white',
  [Priority.VIP]: 'bg-red-500 text-white',
};

const statusColors = {
  [TaskStatus.TODO]: 'bg-gray-100 text-gray-800',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [TaskStatus.CANCELLED]: 'bg-red-100 text-red-800',
  [TaskStatus.BLOCKED]: 'bg-orange-100 text-orange-800',
  [TaskStatus.WAITING_CLIENT]: 'bg-yellow-100 text-yellow-800',
  [TaskStatus.WAITING_DOCUMENTS]: 'bg-orange-100 text-orange-800',
  [TaskStatus.WAITING_APPROVAL]: 'bg-purple-100 text-purple-800',
  [TaskStatus.RESCHEDULED]: 'bg-pink-100 text-pink-800',
};

export const TaskCard: FC<TaskCardProps> = ({ task, onClick }) => {
  const completedItems = task.checklist.filter(item => item.completed).length;
  const totalItems = task.checklist.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <Card 
      className="hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-primary/20"
      onClick={() => onClick?.(task)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex flex-col space-y-1">
            <h3 className="font-bold text-lg truncate max-w-[250px]">{task.title}</h3>
            <div className="flex items-center space-x-2">
              <Badge className={`${priorityColors[task.priority]} px-2 py-1 rounded-full text-xs`}>
                {task.priority}
              </Badge>
              <Badge variant="outline" className={`${statusColors[task.status]} px-2 py-1 rounded-full text-xs`}>
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <TagIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{task.type}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 italic">
            {task.description}
          </p>
        )}
        
        {totalItems > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Checklist Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              <span>Due {format(new Date(task.dueDate), 'MMM d')}</span>
            </div>
          )}
          {task.properties.length > 0 && (
            <div className="flex items-center gap-1">
              <BuildingIcon className="w-3 h-3" />
              <span className="truncate">{task.properties[0]?.title}</span>
              {task.properties.length > 1 && (
                <span className="text-xs ml-1">+{task.properties.length - 1}</span>
              )}
            </div>
          )}
          {task.leads.length > 0 && (
            <div className="flex items-center gap-1">
              <UserIcon className="w-3 h-3" />
              <span className="truncate">{task.leads[0]?.referenceNumber}</span>
              {task.leads.length > 1 && (
                <span className="text-xs ml-1">+{task.leads.length - 1}</span>
              )}
            </div>
          )}
          {task.completedAt && (
            <div className="flex items-center gap-1">
              <CheckCircleIcon className="w-3 h-3 text-green-500" />
              <span>Completed</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <div className="flex justify-between items-center w-full">
          <div className="flex -space-x-2">
            {task.assignedTo.slice(0, 3).map((user) => (
              <Avatar key={user.id} className="border-2 border-white w-7 h-7">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-xs">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
            ))}
            {task.assignedTo.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs border-2 border-white">
                +{task.assignedTo.length - 3}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ClockIcon className="w-3 h-3" />
            <span>Created {format(new Date(task.createdAt), 'MMM d')}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
