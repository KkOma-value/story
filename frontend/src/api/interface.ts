import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  SearchRequest,
  Novel,
  PaginatedList,
  RecommendationRequest,
  ReadHistory,
  Chapter,
  User,
  CommentThread,
  MyComment,
  MyRating,
} from '../types';

/**
 * API interface - all page logic depends on this contract.
 * Implementation can be swapped between mock and real.
 */
export interface ApiClient {
  // -------- Auth --------
  sendRegisterEmailCode(email: string): Promise<void>;
  login(req: LoginRequest): Promise<LoginResponse>;
  register(req: RegisterRequest): Promise<RegisterResponse>;
  logout(): Promise<void>;
  sendResetEmailCode(email: string): Promise<void>;
  resetPassword(data: { email: string; code: string; password: string; confirmPassword: string }): Promise<void>;
  updateProfile(data: { displayName?: string; bio?: string; avatarUrl?: string }): Promise<User>;
  changePassword(data: { oldPassword: string; newPassword: string; confirmPassword: string }): Promise<void>;
  getMe(): Promise<User>;
  getMyComments(page?: number, pageSize?: number): Promise<PaginatedList<MyComment>>;
  getMyRatings(page?: number, pageSize?: number): Promise<PaginatedList<MyRating>>;

  // -------- Catalog --------
  searchNovels(req: SearchRequest): Promise<PaginatedList<Novel>>;
  getNovelById(id: string): Promise<Novel>;
  getNovelChapters(novelId: string): Promise<Chapter[]>;
  getChapterDetail(novelId: string, chapterId: string): Promise<Chapter>;

  // -------- Recommendations --------
  getRecommendations(req: RecommendationRequest): Promise<Novel[]>;

  // -------- Bookshelf --------
  getBookshelf(page?: number, pageSize?: number): Promise<Novel[]>;
  addToBookshelf(novelId: string): Promise<void>;
  removeFromBookshelf(novelId: string): Promise<void>;

  // -------- Read History --------
  getReadHistory(): Promise<ReadHistory[]>;
  createReadHistory(novelId: string): Promise<void>;
  removeReadHistory(historyId: string): Promise<void>;
  clearReadHistory(): Promise<void>;

  // -------- Interactions --------
  getComments(novelId: string, page?: number, pageSize?: number): Promise<PaginatedList<CommentThread>>;
  postComment(novelId: string, content: string, parentId?: string): Promise<{ commentId: string }>;
  deleteComment(commentId: string): Promise<void>;
  rateNovel(novelId: string, score: number): Promise<void>;

  // -------- Admin --------
  adminGetNovels(params: any): Promise<PaginatedList<Novel>>;
  adminCreateNovel(data: any): Promise<{ novelId: string }>;
  adminGetNovelDetail(id: string): Promise<Novel>;
  adminUpdateNovel(id: string, data: any): Promise<void>;
  adminDeleteNovel(id: string): Promise<void>;
  adminUpdateNovelStatus(id: string, status: string): Promise<void>;
  adminGetUsers(params: any): Promise<PaginatedList<User>>;
  adminGetUserDetail(id: string): Promise<User>;
  adminUpdateUser(id: string, data: any): Promise<void>;
  adminBanUser(id: string, type: string): Promise<void>;
  adminUnbanUser(id: string): Promise<void>;
  adminGetNovelAnalytics(params: any): Promise<PaginatedList<any>>;
  adminGetUserAnalytics(params: any): Promise<PaginatedList<any>>;
}
