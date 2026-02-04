// ============================================================
// Domain types - shared across the application
// ============================================================

/** User role */
export type UserRole = 'user' | 'admin';

/** User status */
export type UserStatus = 'active' | 'banned' | 'permanent_banned' | 'deleted';

/** Authenticated user info (returned after login) */
export interface User {
  id: string;
  username: string;
  role: UserRole;
  avatar?: string;
  avatarUrl?: string; // API uses avatarUrl, map to this
  displayName?: string;
  bio?: string;
  email?: string;
  status?: UserStatus;
}

/** Novel entity */
export interface Novel {
  id: string;
  title: string;
  author: string;
  category: string;
  tags: string[];
  intro: string;
  coverUrl?: string;
  sourceUrl?: string;
  /** Novel status */
  status?: 'ongoing' | 'completed';
  /** ISO date string */
  updatedAt: string;
  /** Popularity metrics */
  views: number;
  favorites: number;
  rating: number;
  wordCount: number;
}

/** Chapter entity */
export interface Chapter {
  id: number;
  novelId: number;
  title: string;
  content?: string;
  wordCount?: number;
  order: number;
  updatedAt: string;
}

/** Paginated list wrapper */
export interface PaginatedList<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Unified API response envelope */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

// ============================================================
// API request / response DTOs
// ============================================================

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
  /** user-provided display name */
  displayName: string;
  email: string;
  /** email verification code */
  code: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  userId: string;
}

export interface SearchRequest {
  keyword?: string;
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
}

/** Read History */
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
