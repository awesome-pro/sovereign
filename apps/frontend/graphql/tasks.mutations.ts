import { gql } from '@apollo/client';

export const TASKS_QUERY = gql`
  query Tasks($filter: TaskFilterInput) {
    tasks(filter: $filter) {
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
      createdBy {
        id
        email
        name
      }
      assignedTo {
        id
        email
        name
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
  }
`;

export const TASK_QUERY = gql`
  query Task($id: ID!) {
    task(id: $id) {
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
      createdBy {
        id
        email
        name
      }
      assignedTo {
        id
        email
        name
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
  }
`;

export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
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
      createdBy {
        id
        email
        name
      }
      assignedTo {
        id
        email
        name
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
  }
`;

export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
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
      createdBy {
        id
        email
        name
      }
      assignedTo {
        id
        email
        name
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
  }
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
