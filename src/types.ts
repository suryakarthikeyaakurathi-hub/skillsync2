export enum Tab {
  Dashboard = 'dashboard',
  Discover = 'discover',
  Projects = 'projects',
  Communities = 'communities',
  Messages = 'messages',
  Settings = 'settings'
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  email: string;
  university: string;
  major: string;
  year: string;
  bio: string;
  skills: string[];
  interests: string[];
  availability: 'Available' | 'Busy' | 'Part-time';
  matchScore?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  skillsNeeded: string[];
  category: string;
  status: 'Idea' | 'In Progress' | 'Completed';
  membersCount: number;
  openRolesCount: number;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  postsCount: number;
  iconName: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface ChatThread {
  id: string;
  participantName: string;
  participantAvatar: string;
  participantRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}
