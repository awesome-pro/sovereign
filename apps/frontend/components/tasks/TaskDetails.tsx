import { FC, useState } from 'react';
import { format } from 'date-fns';
import { Task, TaskStatus, Priority, TaskType } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  MessageSquareIcon,
  PlusIcon,
  MapPinIcon,
  BuildingIcon,
  UserIcon,
  BriefcaseIcon,
  TagIcon,
  BellIcon,
  DollarSignIcon,
  AlertCircleIcon,
  FileIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TaskDetailsProps {
  task: Task;
  onUpdateStatus: (status: TaskStatus) => void;
  onAddChecklistItem: (item: string) => void;
  onToggleChecklistItem: (itemId: string, completed: boolean) => void;
  onAddComment: (content: string) => void;
  onUploadAttachment?: (file: File) => void;
}

const statusColors: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'bg-gray-500',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-500',
  [TaskStatus.WAITING_CLIENT]: 'bg-yellow-500',
  [TaskStatus.WAITING_DOCUMENTS]: 'bg-orange-500',
  [TaskStatus.WAITING_APPROVAL]: 'bg-purple-500',
  [TaskStatus.RESCHEDULED]: 'bg-pink-500',
  [TaskStatus.COMPLETED]: 'bg-green-500',
  [TaskStatus.CANCELLED]: 'bg-red-500',
  [TaskStatus.BLOCKED]: 'bg-red-700',
};

const priorityColors: Record<Priority, string> = {
  [Priority.LOW]: 'bg-gray-500',
  [Priority.MEDIUM]: 'bg-blue-500',
  [Priority.HIGH]: 'bg-orange-500',
  [Priority.URGENT]: 'bg-red-500',
  [Priority.VIP]: 'bg-purple-500',
};

export const TaskDetails: FC<TaskDetailsProps> = ({
  task,
  onUpdateStatus,
  onAddChecklistItem,
  onToggleChecklistItem,
  onAddComment,
  onUploadAttachment,
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

  const completedItems = task.checklist.filter(item => item.completed).length;
  const totalItems = task.checklist.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-start justify-between p-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{task.title}</h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{task.type.replace(/_/g, ' ')}</Badge>
            <Badge variant="default" className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
          </div>
        </div>
        <Select 
          defaultValue={task.status} 
          onValueChange={(value) => onUpdateStatus(value as TaskStatus)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(TaskStatus).map((status) => (
              <SelectItem key={status} value={status}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
                  {status.replace(/_/g, ' ')}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <Tabs defaultValue="details" className="flex-1">
        <TabsList className="w-full justify-start p-2 bg-transparent">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="details" className="p-6 space-y-6">
            {task.description && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <span>Start: {task.startDate ? format(new Date(task.startDate), 'PPP') : 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-gray-500" />
                  <span>Due: {task.dueDate ? format(new Date(task.dueDate), 'PPP') : 'Not set'}</span>
                </div>
                {task.duration && (
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-500" />
                    <span>{task.duration} minutes</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Related Items</h3>
                <div className="space-y-3">
                  {task.properties && (
                    <div className="flex items-center gap-2">
                      <BuildingIcon className="w-4 h-4 text-gray-500" />
                      <span>{task.properties.map((property) => property.id).join(', ')}</span>
                    </div>
                  )}
                  {task.leads && (
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      <span>{task.leads.map((lead) => lead.id).join(', ')}</span>
                    </div>
                  )}
                  {task.deals && (
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="w-4 h-4 text-gray-500" />
                      <span>{task.deals.map((deal) => deal.id).join(', ')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Assigned Team Members</h3>
                <div className="flex flex-wrap gap-2">
                  {task.assignedTo.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklist" className="p-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Checklist Progress</h3>
                  <span className="text-sm text-gray-600">
                    {completedItems}/{totalItems} completed
                  </span>
                </div>
                <Progress value={progress} className="h-2 mb-6" />
                <div className="space-y-2">
                  {task.checklist.map((item) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={(checked) =>
                          onToggleChecklistItem(item.id, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <span className={item.completed ? 'line-through text-gray-500' : ''}>
                          {item.item}
                        </span>
                        {item.notes && (
                          <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                        )}
                      </div>
                      {item.assignedTo && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={item.assignedTo.avatar} />
                          <AvatarFallback>{item.assignedTo.name[0]}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2 mt-4">
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="p-6">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar>
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comment.author.name}</span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(comment.createdAt), 'PPp')}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {comment.attachments.map((attachment, index) => (
                              <Badge key={index} variant="secondary">
                                <FileIcon className="w-3 h-3 mr-1" />
                                {/* {attachment.split('/').pop()} */}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-6">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button className="self-end" onClick={handleAddComment}>
                      <MessageSquareIcon className="w-4 h-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments" className="p-6">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {task.attachments?.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-2 p-3 border rounded-lg"
                    >
                      <FileIcon className="w-8 h-8 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{attachment.name}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(attachment.uploadedAt), 'PPp')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {onUploadAttachment && (
                  <div className="mt-4">
                    <Input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onUploadAttachment(file);
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>

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
