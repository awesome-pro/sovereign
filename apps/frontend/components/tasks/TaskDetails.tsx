import { FC, useState } from 'react';
import { format } from 'date-fns';
import { Task, TaskChecklist, TaskComment } from '@/types/task.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  MessageSquareIcon,
  PlusIcon,
} from 'lucide-react';

interface TaskDetailsProps {
  task: Task;
  onAddChecklistItem: (item: string) => void;
  onToggleChecklistItem: (itemId: string, completed: boolean) => void;
  onAddComment: (content: string) => void;
}

export const TaskDetails: FC<TaskDetailsProps> = ({
  task,
  onAddChecklistItem,
  onToggleChecklistItem,
  onAddComment,
}) => {
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newComment, setNewComment] = useState('');

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      onAddChecklistItem(newChecklistItem.trim());
      setNewChecklistItem('');
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-start justify-between p-6">
        <div>
          <h2 className="text-2xl font-semibold">{task.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{task.type}</Badge>
            <Badge>{task.priority}</Badge>
            <Badge variant="outline">{task.status}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-sm">
              <CalendarIcon className="w-4 h-4" />
              <span>Due {format(new Date(task.dueDate), 'PPP')}</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1 p-6">
        {task.description && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{task.description}</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Assigned To</h3>
          <div className="flex flex-wrap gap-2">
            {task.assignedTo.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {user.name} {user.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Checklist</h3>
            <span className="text-sm text-gray-600">
              {task.checklist.filter((item) => item.completed).length}/
              {task.checklist.length} completed
            </span>
          </div>
          <div className="space-y-2">
            {task.checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={(checked) =>
                    onToggleChecklistItem(item.id, checked as boolean)
                  }
                />
                <span className={item.completed ? 'line-through text-gray-500' : ''}>
                  {item.item}
                </span>
                {item.completedAt && (
                  <span className="text-xs text-gray-500">
                    (Completed {format(new Date(item.completedAt), 'PP')})
                  </span>
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Add new item"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
              />
              <Button size="sm" onClick={handleAddChecklistItem}>
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Comments</h3>
          <div className="space-y-4">
            {task.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar>
                  <AvatarImage src={comment.author.avatar} />
                  <AvatarFallback>
                    {comment.author.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {comment.author.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(comment.createdAt), 'PP')}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <Button className="self-end" onClick={handleAddComment}>
                <MessageSquareIcon className="w-4 h-4 mr-2" />
                Comment
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4" />
          <span>Created {format(new Date(task.createdAt), 'PPP')}</span>
        </div>
        {task.completedAt && (
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
            <span>Completed {format(new Date(task.completedAt), 'PPP')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
