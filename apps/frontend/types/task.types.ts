export enum TaskType {
  FOLLOW_UP = 'FOLLOW_UP',
  VIEWING = 'VIEWING',
  MEETING = 'MEETING',
  DOCUMENT_REVIEW = 'DOCUMENT_REVIEW',
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  OTHER = 'OTHER',
}
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  BLOCKED = 'BLOCKED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface User {
  id: string;
  email: string;
  profile?: UserProfile;
}

export interface TaskChecklist {
  id: string;
  item: string;
  completed: boolean;
  completedAt?: string;
  order: number;
}

export interface TaskComment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  assignedTo: User[];
  checklist: TaskChecklist[];
  comments: TaskComment[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  type: TaskType;
  priority: Priority;
  dueDate?: string;
  assignedToIds?: string[];
  leadIds?: string[];
  dealIds?: string[];
  propertyIds?: string[];
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  assignedToIds?: string[];
  startDate?: string;
  completedAt?: string;
}

export interface TaskFilterInput {
  status?: TaskStatus[];
  priority?: Priority[];
  type?: TaskType[];
  dueDateFrom?: string;
  dueDateTo?: string;
  assignedToIds?: string[];
  createdByIds?: string[];
}

export interface TaskChecklistInput {
  item: string;
}

export interface TaskCommentInput {
  taskId: string;
  content: string;
}
