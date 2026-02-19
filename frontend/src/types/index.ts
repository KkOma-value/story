export type UserRole = 'user' | 'admin';

export type UserStatus = 'active' | 'banned' | 'permanent_banned' | 'deleted';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  avatar?: string;
  avatarUrl?: string;
  displayName?: string;
  bio?: string;
  email?: string;
  status?: UserStatus;
}

export interface Novel {
  id: string;
  title: string;
  author: string;
  category: string;
  tags: string[];
  intro: string;
  coverUrl?: string;
  sourceUrl?: string;
  status?: 'ongoing' | 'completed';
  updatedAt: string;
  views: number;
  favorites: number;
  rating: number;
  wordCount: number;
}

export interface Chapter {
  id: number;
  novelId: number;
  title: string;
  content?: string;
  wordCount?: number;
  order: number;
  updatedAt: string;
}

export interface PaginatedList<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface LoginRequest {
  credential: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  displayName: string;
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  userId: string;
}

export interface SearchRequest {
  keyword?: string;
  title?: string;
  author?: string;
  category?: string;
  status?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  limit?: number;
  tag?: string;
}

export interface RecommendationRequest {
  type: 'personalized' | 'hot' | 'latest' | 'new' | 'completed' | 'rating' | 'monthly' | 'reward' | 'related';
  limit?: number;
  novelId?: string;
}

export interface ReadHistory {
  id: string;
  novel: Novel;
  lastReadAt: string;
  lastChapter: string;
  progress: number;
}

export interface Comment {
  id: string;
  userId: string;
  userDisplayName: string;
  userAvatar?: string;
  content: string;
  parentId?: string;
  createdAt: string;
  deleted: boolean;
}

export interface CommentThread extends Comment {
  replies: Comment[];
}

export interface MyComment extends Comment {
  novelId: string;
  novelTitle: string;
}

export interface MyRating {
  id: string;
  novelId: string;
  novelTitle: string;
  coverUrl?: string;
  score: number;
  updatedAt: string;
}
