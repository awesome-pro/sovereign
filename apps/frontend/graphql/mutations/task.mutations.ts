import { gql } from '@apollo/client';

const TASK_FIELDS = gql`
  fragment TaskFields on Task {
    id
    title
    description
    type
    status
    priority
    dueDate
    startDate
    completedAt
    createdAt
    updatedAt
    isPrivate
    createdBy {
      id
      email
      name
    }
    assignedTo {
      id
      email
      name
      avatar
    }
    properties {
      id
      title
      referenceNumber
    }
    leads {
      id
      title
      referenceNumber
    }
    deals {
      id
      title
      referenceNumber
    }
    checklist {
      id
      item
      completed
      completedAt
    }
    comments {
      id
      content
      author {
        id
        email
        name
      }
      createdAt
      updatedAt
    }
  }
`;

export const TASKS_QUERY = gql`
  query Tasks($filter: TaskFilterInput) {
    tasks(filter: $filter) {
      ...TaskFields
    }
  }
  ${TASK_FIELDS}
`;

export const TASK_QUERY = gql`
  query Task($id: ID!) {
    task(id: $id) {
      ...TaskFields
    }
  }
  ${TASK_FIELDS}
`;

export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      ...TaskFields
    }
  }
  ${TASK_FIELDS}
`;

export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      ...TaskFields
    }
  }
  ${TASK_FIELDS}
`;

export const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const ADD_TASK_CHECKLIST_ITEM_MUTATION = gql`
  mutation AddTaskChecklistItem($taskId: ID!, $input: TaskChecklistInput!) {
    addTaskChecklistItem(taskId: $taskId, input: $input) {
      id
      checklist {
        id
        item
        completed
        completedAt
      }
    }
  }
`;

export const ADD_TASK_COMMENT_MUTATION = gql`
  mutation AddTaskComment($input: TaskCommentInput!) {
    addTaskComment(input: $input) {
      id
      comments {
        id
        content
        author {
          id
          email
          name
        }
        createdAt
        updatedAt
      }
    }
  }
`;