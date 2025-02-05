import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLazyQuery } from '@apollo/client';
import AsyncSelect from 'react-select/async';
import { Task, TaskType, Priority, CreateTaskInput, UpdateTaskInput } from '@/types/task';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  CalendarIcon} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RelatedDeal, RelatedLead, RelatedProperty, RelatedUser } from '@/types';
import { SEARCH_DEALS_QUERY, SEARCH_LEADS_QUERY, SEARCH_PROPERTIES_QUERY, SEARCH_USERS_QUERY } from '@/graphql/queries';

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  type: z.nativeEnum(TaskType),
  priority: z.nativeEnum(Priority),
  dueDate: z.date().optional(),
  startDate: z.date().optional(),
  assignedToIds: z.array(z.string()),
  propertyIds: z.array(z.string()),
  leadIds: z.array(z.string()),
  dealIds: z.array(z.string()),
  isPrivate: z.boolean().default(false),
});

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  isLoading?: boolean;
}

export const TaskForm: FC<TaskFormProps> = ({
  task,
  onSubmit,
  isLoading = false,
}) => {
  const [searchUsers] = useLazyQuery(SEARCH_USERS_QUERY);
  const [searchLeads] = useLazyQuery(SEARCH_LEADS_QUERY);
  const [searchDeals] = useLazyQuery(SEARCH_DEALS_QUERY);
  const [searchProperties] = useLazyQuery(SEARCH_PROPERTIES_QUERY);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description ?? '',
          type: task.type,
          priority: task.priority,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          startDate: task.startDate ? new Date(task.startDate) : undefined,
          assignedToIds: task.assignedTo.map((user) => user.id),
          propertyIds: task.properties.map((property) => property.id),
          leadIds: task.leads.map((lead) => lead.id),
          dealIds: task.deals.map((deal) => deal.id),
          isPrivate: task.isPrivate,
        }
      : {
          priority: Priority.MEDIUM,
          type: TaskType.FOLLOW_UP,
          isPrivate: false,
          assignedToIds: [],
          propertyIds: [],
          leadIds: [],
          dealIds: [],
        },
  });

  const loadUsers = async (inputValue: string) => {
    if (inputValue.length < 2) return [];
    const { data } = await searchUsers({
      variables: { query: inputValue, limit: 10 },
    });
    return data?.searchUsers.map((user: RelatedUser) => ({
      value: user.id,
      label: user.name,
      data: user,
    })) || [];
  };

  const loadProperties = async (inputValue: string) => {
    if (inputValue.length < 2) return [];
    const { data } = await searchProperties({
      variables: { query: inputValue, limit: 10 },
    });
    return data?.searchProperties.map((property: RelatedProperty) => ({
      value: property.id,
      label: `${property.referenceNumber} - ${property.title}`,
      data: property,
    })) || [];
  };

  const loadLeads = async (inputValue: string) => {
    if (inputValue.length < 2) return [];
    const { data } = await searchLeads({
      variables: { query: inputValue, limit: 10 },
    });
    return data?.searchLeads.map((lead: RelatedLead) => ({
      value: lead.id,
      label: `${lead.referenceNumber} - ${lead.title}`,
      data: lead,
    })) || [];
  };

  const loadDeals = async (inputValue: string) => {
    if (inputValue.length < 2) return [];
    const { data } = await searchDeals({
      variables: { query: inputValue, limit: 10 },
    });
    return data?.searchDeals.map((deal: RelatedDeal) => ({
      value: deal.id,
      label: `${deal.referenceNumber} - ${deal.title}`,
      data: deal,
    })) || [];
  };

  const handleSubmit = async (values: z.infer<typeof taskSchema>) => {
    const baseInput = {
      title: values.title,
      description: values.description || undefined,
      type: values.type,
      priority: values.priority,
      dueDate: values.dueDate || undefined,
      startDate: values.startDate || undefined,
      assignedToIds: values.assignedToIds,
      propertyIds: values.propertyIds,
      leadIds: values.leadIds,
      dealIds: values.dealIds,
      isPrivate: values.isPrivate ?? false,
    };

    try {
      if (task) {
        // For update, we need to include the id and maintain existing fields
        const updateInput: UpdateTaskInput = {
          id: task.id,
          ...baseInput,
          status: task.status,
          completedAt: task.completedAt || undefined,
        };
        await onSubmit(updateInput);
      } else {
        // For create, we use the base input directly
        const createInput: CreateTaskInput = baseInput;
        await onSubmit(createInput);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // You might want to handle the error here, e.g., show a toast message
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Form Details</h3>
          <p>Form Errors: {JSON.stringify(form.formState.errors)}</p>
          <p>Form Values: {JSON.stringify(form.getValues())}</p>
          <p>FOrm valid: {form.formState.isValid ? 'true' : 'false'}</p>
          <p>Form dirty: {form.formState.isDirty ? 'true' : 'false'}</p>
        </div>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="relations">Relations</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TaskType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Priority).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            <div className="flex items-center gap-2">
                              <Badge variant={priority.toLowerCase() as any}>
                                {priority}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Task description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Private Task</FormLabel>
                    <FormDescription>
                      Make this task visible only to assigned members
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

          </TabsContent>

          <TabsContent value="relations" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="assignedToIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <FormControl>
                    <AsyncSelect
                      isMulti
                      cacheOptions
                      defaultOptions
                      loadOptions={loadUsers}
                      value={field.value.map((userId) => {
                        const user = task?.assignedTo.find(u => u.id === userId) || 
                                     form.getValues('assignedToIds').map(id => 
                                       task?.assignedTo.find(u => u.id === id)
                                     ).find(u => u?.id === userId);
                        return user ? {
                          value: user.id,
                          label: `${user.name} (${user.email})`,
                          data: user
                        } : null;
                      }).filter(Boolean)}
                      onChange={(newValue) => {
                        field.onChange(newValue.map((v: any) => v.data.id));
                      }}
                      className="min-w-[200px]"
                      classNames={{
                        control: () => 'py-2 border rounded-md',
                        menu: () => 'mt-2 rounded-md border bg-white shadow-lg',
                        option: () => 'px-4 py-2 hover:bg-gray-100',
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="propertyIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Properties</FormLabel>
                  <FormControl>
                    <AsyncSelect
                      isMulti
                      cacheOptions
                      defaultOptions
                      loadOptions={loadProperties}
                      value={field.value.map((propertyId) => {
                        const property = task?.properties.find(p => p.id === propertyId) || 
                                         form.getValues('propertyIds').map(id => 
                                           task?.properties.find(p => p.id === id)
                                         ).find(p => p?.id === propertyId);
                        return property ? {
                          value: property.id,
                          label: `${property.referenceNumber} - ${property.title}`,
                          data: property
                        } : null;
                      }).filter(Boolean)}
                      onChange={(newValue) => {
                        field.onChange(newValue.map((v: any) => v.data.id));
                      }}
                      className="min-w-[200px]"
                      classNames={{
                        control: () => 'py-2 border rounded-md',
                        menu: () => 'mt-2 rounded-md border bg-white shadow-lg',
                        option: () => 'px-4 py-2 hover:bg-gray-100',
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="leadIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Leads</FormLabel>
                  <FormControl>
                    <AsyncSelect
                      isMulti
                      cacheOptions
                      defaultOptions
                      loadOptions={loadLeads}
                      value={field.value.map((leadId) => {
                        const lead = task?.leads.find(l => l.id === leadId) || 
                                     form.getValues('leadIds').map(id => 
                                       task?.leads.find(l => l.id === id)
                                     ).find(l => l?.id === leadId);
                        return lead ? {
                          value: lead.id,
                          label: `${lead.referenceNumber} - ${lead.title}`,
                          data: lead
                        } : null;
                      }).filter(Boolean)}
                      onChange={(newValue) => {
                        field.onChange(newValue.map((v: any) => v.data.id));
                      }}
                      className="min-w-[200px]"
                      classNames={{
                        control: () => 'py-2 border rounded-md',
                        menu: () => 'mt-2 rounded-md border bg-white shadow-lg',
                        option: () => 'px-4 py-2 hover:bg-gray-100',
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dealIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Deals</FormLabel>
                  <FormControl>
                    <AsyncSelect
                      isMulti
                      cacheOptions
                      defaultOptions
                      loadOptions={loadDeals}
                      value={field.value.map((dealId) => {
                        const deal = task?.deals.find(d => d.id === dealId) || 
                                     form.getValues('dealIds').map(id => 
                                       task?.deals.find(d => d.id === id)
                                     ).find(d => d?.id === dealId);
                        return deal ? {
                          value: deal.id,
                          label: `${deal.referenceNumber} - ${deal.title}`,
                          data: deal
                        } : null;
                      }).filter(Boolean)}
                      onChange={(newValue) => {
                        field.onChange(newValue.map((v: any) => v.data.id));
                      }}
                      className="min-w-[200px]"
                      classNames={{
                        control: () => 'py-2 border rounded-md',
                        menu: () => 'mt-2 rounded-md border bg-white shadow-lg',
                        option: () => 'px-4 py-2 hover:bg-gray-100',
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
