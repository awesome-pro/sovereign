import { RelatedUser } from "./user";

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

export interface TaskChecklist {
  id: string;
  item: string;
  completed: boolean;
  completedAt?: Date | null;
}

export interface TaskComment {
  id: string;
  content: string;
  author: RelatedUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date | null;
  startDate?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: RelatedUser;
  assignedTo: RelatedUser[];
  checklist: TaskChecklist[];
  comments: TaskComment[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  type: TaskType;
  priority: Priority;
  dueDate?: Date;
  assignedToIds: string[];
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: Date;
  assignedToIds?: string[];
  startDate?: Date;
  completedAt?: Date;
}

export interface TaskFilterInput {
  status?: TaskStatus[];
  priority?: Priority[];
  type?: TaskType[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
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
