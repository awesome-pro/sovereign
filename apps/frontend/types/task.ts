import { RelatedUser } from "./user";
import { RelatedProperty } from "./property";
import { RelatedLead } from "./lead";
import { RelatedDeal } from "./deal";

export enum TaskType {
  PROPERTY_VIEWING = 'PROPERTY_VIEWING',
  CLIENT_MEETING = 'CLIENT_MEETING',
  DOCUMENT_REVIEW = 'DOCUMENT_REVIEW',
  CONTRACT_SIGNING = 'CONTRACT_SIGNING',
  PROPERTY_INSPECTION = 'PROPERTY_INSPECTION',
  FOLLOW_UP = 'FOLLOW_UP',
  DUE_DILIGENCE = 'DUE_DILIGENCE',
  NEGOTIATION = 'NEGOTIATION',
  VALUATION = 'VALUATION',
  MARKETING_APPROVAL = 'MARKETING_APPROVAL',
  LEGAL_REVIEW = 'LEGAL_REVIEW',
  COMMISSION_PROCESSING = 'COMMISSION_PROCESSING',
  CLIENT_CALL = 'CLIENT_CALL',
  VIP_ARRANGEMENT = 'VIP_ARRANGEMENT',
  OTHER = 'OTHER'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_CLIENT = 'WAITING_CLIENT',
  WAITING_DOCUMENTS = 'WAITING_DOCUMENTS',
  WAITING_APPROVAL = 'WAITING_APPROVAL',
  RESCHEDULED = 'RESCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  BLOCKED = 'BLOCKED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VIP = 'VIP'
}

export interface TaskChecklist {
  id: string;
  item: string;
  completed: boolean;
  completedAt?: Date | null;
  assignedTo?: RelatedUser | null;
  notes?: string | null;
}

export interface TaskComment {
  id: string;
  content: string;
  author: RelatedUser;
  createdAt: Date;
  updatedAt: Date;
  attachments?: TaskAttachment[];
  mentions?: RelatedUser[];
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: RelatedUser;
  uploadedAt: Date;
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
  attachments: TaskAttachment[];
  properties: RelatedProperty[];
  leads: RelatedLead[];
  deals: RelatedDeal[];
  duration?: number | null;
  reminderTime?: Date | null;
  isPrivate: boolean;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  type: TaskType;
  priority: Priority;
  dueDate?: Date;
  startDate?: Date;
  assignedToIds: string[];
  propertyIds: string[];
  leadIds: string[];
  dealIds: string[];
  isPrivate?: boolean;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: Date;
  startDate?: Date;
  assignedToIds?: string[];
  propertyIds?: string[];
  leadIds?: string[];
  dealIds?: string[];
  location?: string;
  duration?: number;
  isPrivate?: boolean;
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
  propertyIds?: string[];
  leadIds?: string[];
  dealIds?: string[];
  isPrivate?: boolean;
}

export interface TaskChecklistInput {
  item: string;
  assignedTo?: RelatedUser;
  notes?: string;
}

export interface TaskCommentInput {
  taskId: string;
  content: string;
  mentionIds?: string[];
}
