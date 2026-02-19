import type { ApiClient } from './interface';
import type {
  ApiResponse,
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
import { http } from './http';

function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success) {
    throw new Error(res.message || '请求失败');
  }
  if (res.data === null || res.data === undefined) {
    throw new Error(res.message || '响应数据为空');
  }
  return res.data;
}

/**
 * Real API implementation - calls actual backend endpoints.
 * TODO: Update endpoint paths and response mapping once backend API is finalized.
 */
export const realApi: ApiClient = {
  async sendRegisterEmailCode(email: string): Promise<void> {
    const res = await http.post<ApiResponse<{ sent: boolean }>>('/api/auth/email-code', {
      email,
      purpose: 'register',
    });
    unwrap(res.data);
  },

  async login(req: LoginRequest): Promise<LoginResponse> {
    const res = await http.post<ApiResponse<LoginResponse>>('/api/auth/login', req);
    return unwrap(res.data);
  },

  async register(req: RegisterRequest): Promise<RegisterResponse> {
    const res = await http.post<ApiResponse<RegisterResponse>>('/api/auth/register', req);
    return unwrap(res.data);
  },

  async logout(): Promise<void> {
    const res = await http.post<ApiResponse<{ success: boolean }>>('/api/auth/logout');
    unwrap(res.data);
  },

  async sendResetEmailCode(email: string): Promise<void> {
    const res = await http.post<ApiResponse<{ sent: boolean }>>('/api/auth/reset-code', { email });
    unwrap(res.data);
  },

  async resetPassword(data: { email: string; code: string; password: string; confirmPassword: string }): Promise<void> {
    const res = await http.post<ApiResponse<{ success: boolean }>>('/api/auth/reset-password', data);
    unwrap(res.data);
  },

  async updateProfile(data: { displayName?: string; bio?: string; avatarUrl?: string }): Promise<User> {
    const res = await http.put<ApiResponse<User>>('/api/users/me', data);
    return unwrap(res.data);
  },

  async changePassword(data: { oldPassword: string; newPassword: string; confirmPassword: string }): Promise<void> {
    const res = await http.put<ApiResponse<{ success: boolean }>>('/api/users/me/password', data);
    unwrap(res.data);
  },

  async getMe(): Promise<User> {
    const res = await http.get<ApiResponse<User>>('/api/users/me');
    return unwrap(res.data);
  },

  async getMyComments(page = 1, pageSize = 10): Promise<PaginatedList<MyComment>> {
    const res = await http.get<ApiResponse<PaginatedList<MyComment>>>('/api/users/me/comments', {
      params: { page, pageSize },
    });
    return unwrap(res.data);
  },

  async getMyRatings(page = 1, pageSize = 10): Promise<PaginatedList<MyRating>> {
    const res = await http.get<ApiResponse<PaginatedList<MyRating>>>('/api/users/me/ratings', {
      params: { page, pageSize },
    });
    return unwrap(res.data);
  },

  async searchNovels(req: SearchRequest): Promise<PaginatedList<Novel>> {
    const res = await http.get<ApiResponse<PaginatedList<Novel>>>('/api/novels/search', {
      params: {
        q: req.keyword,
        title: req.title,
        author: req.author,
        category: req.category,
        tag: req.tag,
        page: req.page,
        pageSize: req.pageSize || req.limit,
        sort: req.sort || 'hot',
      },
    });
    return unwrap(res.data);
  },

  async getNovelById(id: string): Promise<Novel> {
    const res = await http.get<ApiResponse<Novel>>(`/api/novels/${id}`);
    return unwrap(res.data);
  },

  async getNovelChapters(novelId: string): Promise<Chapter[]> {
    const res = await http.get<ApiResponse<Chapter[]>>(`/api/novels/${novelId}/chapters`);
    return unwrap(res.data);
  },

  async getChapterDetail(novelId: string, chapterId: string): Promise<Chapter> {
    const res = await http.get<ApiResponse<Chapter>>(`/api/novels/${novelId}/chapters/${chapterId}`);
    return unwrap(res.data);
  },

  async getRecommendations(req: RecommendationRequest): Promise<Novel[]> {
    const endpointMap: Record<string, string> = {
      personalized: '/api/recommendations/personalized',
      hot: '/api/recommendations/hot',
      latest: '/api/recommendations/latest',
    };

    let endpoint: string;

    if (req.type === 'related') {
      if (!req.novelId) {
        throw new Error('相似推荐需要提供 novelId 参数');
      }
      endpoint = `/api/recommendations/similar/${req.novelId}`;
    } else {
      endpoint = endpointMap[req.type] || '/api/recommendations/latest';
    }

    const res = await http.get<ApiResponse<Novel[]>>(endpoint, {
      params: { limit: req.limit },
    });
    return unwrap(res.data);
  },

  async getBookshelf(page = 1, pageSize = 10): Promise<Novel[]> {
    const res = await http.get<ApiResponse<PaginatedList<Novel>>>('/api/users/me/favorites', {
      params: { page, pageSize },
    });
    const data = unwrap(res.data);
    return data.items;
  },

  async addToBookshelf(novelId: string): Promise<void> {
    const res = await http.post<ApiResponse<{ success: boolean }>>(`/api/novels/${novelId}/favorite`);
    unwrap(res.data);
  },

  async removeFromBookshelf(novelId: string): Promise<void> {
    const res = await http.delete<ApiResponse<{ success: boolean }>>(`/api/novels/${novelId}/favorite`);
    unwrap(res.data);
  },

  async getReadHistory(): Promise<ReadHistory[]> {
    const res = await http.get<ApiResponse<ReadHistory[]>>('/api/history');
    return unwrap(res.data);
  },

  async createReadHistory(novelId: string): Promise<void> {
    const res = await http.post<ApiResponse<{ historyId: string }>>('/api/history', { novelId });
    unwrap(res.data);
  },

  async removeReadHistory(historyId: string): Promise<void> {
    const res = await http.delete<ApiResponse<{ success: boolean }>>(`/api/history/${historyId}`);
    unwrap(res.data);
  },

  async clearReadHistory(): Promise<void> {
    const res = await http.delete<ApiResponse<{ success: boolean }>>('/api/history');
    unwrap(res.data);
  },

  async getComments(novelId: string, page = 1, pageSize = 10): Promise<PaginatedList<CommentThread>> {
    const res = await http.get<ApiResponse<PaginatedList<CommentThread>>>(`/api/novels/${novelId}/comments`, {
      params: { page, pageSize },
    });
    return unwrap(res.data);
  },

  async postComment(novelId: string, content: string, parentId?: string): Promise<{ commentId: string }> {
    const res = await http.post<ApiResponse<{ commentId: string }>>(`/api/novels/${novelId}/comments`, {
      content,
      parentId,
    });
    return unwrap(res.data);
  },

  async deleteComment(commentId: string): Promise<void> {
    const res = await http.delete<ApiResponse<{ success: boolean }>>(`/api/comments/${commentId}`);
    unwrap(res.data);
  },

  async rateNovel(novelId: string, score: number): Promise<void> {
    const res = await http.put<ApiResponse<{ success: boolean }>>(`/api/novels/${novelId}/rating`, {
      score,
    });
    unwrap(res.data);
  },

  // -------- Admin --------
  async adminGetNovels(params: any): Promise<PaginatedList<Novel>> {
    const res = await http.get<ApiResponse<PaginatedList<Novel>>>('/api/admin/novels', { params });
    return unwrap(res.data);
  },

  async adminCreateNovel(data: any): Promise<{ novelId: string }> {
    const res = await http.post<ApiResponse<{ novelId: string }>>('/api/admin/novels', data);
    return unwrap(res.data);
  },

  async adminGetNovelDetail(id: string): Promise<Novel> {
    const res = await http.get<ApiResponse<Novel>>(`/api/admin/novels/${id}`);
    return unwrap(res.data);
  },

  async adminUpdateNovel(id: string, data: any): Promise<void> {
    const res = await http.put<ApiResponse<void>>(`/api/admin/novels/${id}`, data);
    unwrap(res.data);
  },

  async adminDeleteNovel(id: string): Promise<void> {
    const res = await http.delete<ApiResponse<void>>(`/api/admin/novels/${id}`);
    unwrap(res.data);
  },

  async adminUpdateNovelStatus(id: string, status: string): Promise<void> {
    const res = await http.patch<ApiResponse<void>>(`/api/admin/novels/${id}/status`, { status });
    unwrap(res.data);
  },

  async adminGetUsers(params: any): Promise<PaginatedList<User>> {
    const res = await http.get<ApiResponse<PaginatedList<User>>>('/api/admin/users', { params });
    return unwrap(res.data);
  },

  async adminGetUserDetail(id: string): Promise<User> {
    const res = await http.get<ApiResponse<User>>(`/api/admin/users/${id}`);
    return unwrap(res.data);
  },

  async adminUpdateUser(id: string, data: any): Promise<void> {
    const res = await http.put<ApiResponse<void>>(`/api/admin/users/${id}`, data);
    unwrap(res.data);
  },

  async adminBanUser(id: string, type: string): Promise<void> {
    const res = await http.post<ApiResponse<void>>(`/api/admin/users/${id}/ban`, { type });
    unwrap(res.data);
  },

  async adminUnbanUser(id: string): Promise<void> {
    const res = await http.post<ApiResponse<void>>(`/api/admin/users/${id}/unban`);
    unwrap(res.data);
  },

  async adminGetNovelAnalytics(params: any): Promise<PaginatedList<any>> {
    const res = await http.get<ApiResponse<PaginatedList<any>>>('/api/admin/analytics/novels', { params });
    return unwrap(res.data);
  },

  async adminGetUserAnalytics(params: any): Promise<PaginatedList<any>> {
    const res = await http.get<ApiResponse<PaginatedList<any>>>('/api/admin/analytics/users', { params });
    return unwrap(res.data);
  },
};
