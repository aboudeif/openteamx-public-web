import {
  TeamStatus,
  UserStatus,
  DriveItemType,
  TaskStatus,
  TaskPriority,
  ProjectStatus,
} from "./enums";

// --- User & Identity ---
export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  initials: string;
  status?: UserStatus;
  role?: string;
}

// --- Team Discovery ---
export interface Team {
  id: string;
  name: string;
  description: string;
  status: TeamStatus | string; // allowing string for flexibility if data comes raw
  tags: string[];
  size: number;
  createdAt: string;
  type: string;
  location: string;
}

// --- Chat ---
export interface ChatWorkspace {
  id: string;
  name: string;
  isDefault?: boolean;
  isProject?: boolean;
  unread: number;
}

export interface ChatReaction {
  emoji: string;
  count: number;
}

export interface ChatMessage {
  id: number | string;
  authorId?: string;
  user: string; // Display name or ID
  avatar: string; // Initials or URL
  message: string;
  time: string;
  reactions: ChatReaction[];
  isEdited?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedByName?: string;
  channelType?: string;
}

// --- Drive ---
export interface DriveItem {
  id: string;
  name: string;
  type: DriveItemType | string;
  modifiedAt: string;
  modifiedBy: string;
  size?: string;
  pinned?: boolean;
  shared?: boolean;
  url?: string; // For link types
}

// --- Projects ---
export interface Task {
  id: string;
  title: string;
  status: TaskStatus | string;
  priority: TaskPriority | string;
  assignee: string; // User ID or Initials
  comments: number;
  userStory?: string;
  resources: string[];
  createdBy: string;
  createdAt: string;
  dueDate: string;
  estimation: string;
  childTasks?: Task[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  dueDate: string;
  status: ProjectStatus | string;
  members: string[]; // Array of User IDs or Initials
  createdBy: string;
  tasks: Task[];
}
