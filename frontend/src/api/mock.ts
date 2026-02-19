import type { ApiClient } from './interface';
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
  MyComment,
  MyRating,
  CommentThread,
} from '../types';

// ============================================================
// Mock data
// ============================================================
const mockNovels: Novel[] = [
  {
    id: '1',
    title: '斗破苍穹',
    author: '天蚕土豆',
    category: '玄幻',
    tags: ['热血', '升级', '斗气'],
    intro: '这里是属于斗气的世界，没有花俏艳丽的魔法，有的，仅仅是繁衍到巅峰的斗气！',
    coverUrl: 'https://placehold.co/120x160/151520/B8860B?text=斗破',
    sourceUrl: 'https://example.com/novels/1',
    status: 'completed',
    updatedAt: '2025-12-20T10:00:00Z',
    views: 5000000,
    favorites: 320000,
    rating: 4.8,
    wordCount: 5320000,
  },
  {
    id: '2',
    title: '完美世界',
    author: '辰东',
    category: '玄幻',
    tags: ['洪荒', '热血', '成长'],
    intro: '一粒尘可填海，一根草斩尽日月星辰，弹指间可以让一代强者灰飞烟灭。',
    coverUrl: 'https://placehold.co/120x160/151520/7C3AED?text=完美',
    sourceUrl: 'https://example.com/novels/2',
    status: 'completed',
    updatedAt: '2025-12-22T08:30:00Z',
    views: 4200000,
    favorites: 280000,
    rating: 4.7,
    wordCount: 6580000,
  },
  {
    id: '3',
    title: '遮天',
    author: '辰东',
    category: '玄幻',
    tags: ['修仙', '热血'],
    intro: '冰冷与黑暗并存的宇宙深处，九具庞大的龙尸拉着一座青铜古棺，正在穿越无边的太空。',
    coverUrl: 'https://placehold.co/120x160/151520/DC2626?text=遮天',
    status: 'completed',
    updatedAt: '2025-12-18T14:00:00Z',
    views: 3800000,
    favorites: 250000,
    rating: 4.9,
    wordCount: 6320000,
  },
  {
    id: '4',
    title: '凡人修仙传',
    author: '忘语',
    category: '仙侠',
    tags: ['修仙', '凡人流'],
    intro: '一个普通的山村少年，偶然之下，跨入到一个江湖小门派，成了一名记名弟子。',
    coverUrl: 'https://placehold.co/120x160/151520/B8860B?text=凡人',
    status: 'completed',
    updatedAt: '2025-12-15T09:00:00Z',
    views: 4500000,
    favorites: 310000,
    rating: 4.8,
    wordCount: 7710000,
  },
  {
    id: '5',
    title: '大奉打更人',
    author: '卖报小郎君',
    category: '历史',
    tags: ['探案', '官场', '权谋'],
    intro: '这个世界，有儒、释、道、术士、武夫五大体系，有神秘莫测的神魔，有儒圣镇国。',
    coverUrl: 'https://placehold.co/120x160/151520/7C3AED?text=大奉',
    status: 'ongoing',
    updatedAt: '2025-12-24T20:00:00Z',
    views: 3200000,
    favorites: 220000,
    rating: 4.6,
    wordCount: 3820000,
  },
  {
    id: '6',
    title: '诡秘之主',
    author: '爱潜水的乌贼',
    category: '奇幻',
    tags: ['克苏鲁', '西幻', '序列'],
    intro: '蒸汽与机械的浪潮中，谁能触及非凡？',
    coverUrl: 'https://placehold.co/120x160/151520/DC2626?text=诡秘',
    status: 'completed',
    updatedAt: '2025-12-23T16:00:00Z',
    views: 4800000,
    favorites: 350000,
    rating: 4.9,
    wordCount: 4460000,
  },
  {
    id: '7',
    title: '一念永恒',
    author: '耳根',
    category: '仙侠',
    tags: ['修仙', '搞笑', '热血'],
    intro: '一念成沧海，一念化桑田，一念斩千魔，一念诛万仙！',
    coverUrl: 'https://placehold.co/120x160/151520/B8860B?text=永恒',
    status: 'completed',
    updatedAt: '2025-12-21T12:00:00Z',
    views: 3600000,
    favorites: 240000,
    rating: 4.7,
    wordCount: 3690000,
  },
  {
    id: '8',
    title: '全职法师',
    author: '乱',
    category: '都市',
    tags: ['都市', '异能', '魔法'],
    intro: '一觉醒来，世界大变。熟悉的高中传授的是魔法，告诉大家要成为一名出色的魔法师。',
    coverUrl: 'https://placehold.co/120x160/151520/7C3AED?text=法师',
    status: 'ongoing',
    updatedAt: '2025-12-25T08:00:00Z',
    views: 2800000,
    favorites: 180000,
    rating: 4.5,
    wordCount: 5540000,
  },
];

// Mock bookshelf
let mockBookshelf: string[] = ['1', '3', '6'];

// Mock read history
let mockReadHistory: ReadHistory[] = [
  {
    id: '1',
    novel: mockNovels[0],
    lastReadAt: new Date(Date.now() - 3600000).toISOString(),
    lastChapter: '第1523章 大结局',
    progress: 100,
  },
  {
    id: '2',
    novel: mockNovels[2],
    lastReadAt: new Date(Date.now() - 86400000).toISOString(),
    lastChapter: '第892章 荒天至尊',
    progress: 65,
  },
  {
    id: '3',
    novel: mockNovels[5],
    lastReadAt: new Date(Date.now() - 172800000).toISOString(),
    lastChapter: '第1432章 序列零',
    progress: 98,
  },
];

// Simulated network delay
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ============================================================
// Mock implementation
// ============================================================
export const mockApi: ApiClient = {
  async sendRegisterEmailCode(email: string): Promise<void> {
    await delay(300);
    if (!email || !email.includes('@')) {
      throw new Error('请输入有效的邮箱');
    }
  },

  async login(req: LoginRequest): Promise<LoginResponse> {
    await delay(500);

    if (!req.credential || !req.password) {
      throw new Error('账号/邮箱或密码不能为空');
    }

    // Admin account
    if ((req.credential === 'admin' || req.credential === 'admin@test.com') && req.password === 'admin123') {
      return {
        token: 'mock-token-' + Date.now(),
        user: {
          id: 'admin-uuid',
          username: '管理员',
          role: 'admin',
        }
      };
    }

    // Test user accounts
    if (req.password === '123456' || req.password === 'test') {
      return {
        token: 'mock-token-' + Date.now(),
        user: {
          id: 'user-uuid',
          username: '测试用户',
          role: 'user',
        }
      };
    }

    throw new Error('账号或密码错误');
  },

  async register(req: RegisterRequest): Promise<RegisterResponse> {
    await delay(400);
    if (!req.email || !req.password || !req.username || !req.displayName || !req.code) {
      throw new Error('请完整填写注册信息');
    }
    if (req.password !== req.confirmPassword) {
      throw new Error('两次密码不一致');
    }
    // Email uniqueness is enforced by backend; mock just accepts.
    return { userId: 'u-' + Date.now() };
  },

  async logout(): Promise<void> {
    await delay(150);
  },

  async sendResetEmailCode(email: string): Promise<void> {
    await delay(300);

    if (!email || !email.includes('@')) {
      throw new Error('请输入有效的邮箱');
    }

    // 模拟发送成功
    console.log(`[Mock] 重置密码验证码已发送到: ${email}`);
  },

  async resetPassword(data: { email: string; code: string; password: string; confirmPassword: string }): Promise<void> {
    await delay(400);

    if (data.password !== data.confirmPassword) {
      throw new Error('两次密码不一致');
    }

    if (data.code !== '123456') {
      throw new Error('验证码错误');
    }

    // 模拟重置成功
    console.log(`[Mock] 密码重置成功 for: ${data.email}`);
  },

  async searchNovels(req: SearchRequest): Promise<PaginatedList<Novel>> {
    await delay(300);
    const kw = (req.keyword || '').toLowerCase();
    const title = (req.title || '').toLowerCase();
    const author = (req.author || '').toLowerCase();
    const tag = (req.tag || '').toLowerCase();

    let filtered = mockNovels.filter((n) => {
      // 通用关键词搜索
      const matchesKeyword =
        !kw ||
        n.title.toLowerCase().includes(kw) ||
        n.author.toLowerCase().includes(kw) ||
        n.tags.some((t) => t.toLowerCase().includes(kw));

      // 特定字段搜索
      const matchesTitle = !title || n.title.toLowerCase().includes(title);
      const matchesAuthor = !author || n.author.toLowerCase().includes(author);
      const matchesTag = !tag || n.tags.some((t) => t.toLowerCase().includes(tag));
      const matchesCategory = !req.category || n.category === req.category;
      const matchesStatus = !req.status || n.status === req.status;

      return (
        matchesKeyword &&
        matchesTitle &&
        matchesAuthor &&
        matchesTag &&
        matchesCategory &&
        matchesStatus
      );
    });

    // Sort
    switch (req.sort) {
      case 'latest':
        filtered = filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'rating':
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'views':
        filtered = filtered.sort((a, b) => b.views - a.views);
        break;
      case 'hot':
      default:
        filtered = filtered.sort((a, b) => b.favorites - a.favorites);
        break;
    }

    const page = req.page ?? 1;
    const pageSize = req.pageSize ?? req.limit ?? 10;
    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  },

  async getNovelById(id: string): Promise<Novel> {
    await delay(200);
    const novel = mockNovels.find((n) => n.id === id);
    if (!novel) {
      throw new Error('小说不存在');
    }
    return novel;
  },

  async getNovelChapters(novelId: string): Promise<Chapter[]> {
    await delay(300);
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      novelId: Number(novelId),
      title: `第 ${i + 1} 章 天地玄黄`,
      order: i + 1,
      updatedAt: new Date().toISOString(),
      wordCount: 2000 + Math.floor(Math.random() * 1000),
    }));
  },

  async getChapterDetail(novelId: string, chapterId: string): Promise<Chapter> {
    await delay(300);
    return {
      id: Number(chapterId),
      novelId: Number(novelId),
      title: `第 ${chapterId} 章 天地玄黄`,
      order: Number(chapterId),
      updatedAt: new Date().toISOString(),
      wordCount: 3000,
      content: `
        天地玄黄，宇宙洪荒。日月盈昃，辰宿列张。
        
        在这片古老的大陆上，修真者逆天而行，追求长生大道。
        
        少年苏尘，本是资质平平的凡人，却意外获得了一枚神秘的戒指，从此踏上了一条逆天改命的道路。
        
        修真一途，乃是窃阴阳，夺造化，转涅槃，握生死，掌轮回。
        武道入微，方能感应天地灵气...
        
        （此处为模拟章节内容，实际内容通常很长...）
        
        寒雪飘洒，冬日的清晨显得格外冷冽。
        苏尘深吸一口气，体内的灵力缓缓运转，驱散了寒意。
        "这就是炼气期第三层吗？果然比之前强大了许多。"他握了握拳，感受到体内充盈的力量，嘴角露出一丝微笑。
      `
    };
  },

  async getRecommendations(req: RecommendationRequest): Promise<Novel[]> {
    await delay(350);
    const limit = req.limit ?? 6;
    let sorted: Novel[];
    switch (req.type) {
      case 'hot':
      case 'monthly':
      case 'reward':
        sorted = [...mockNovels].sort((a, b) => b.views - a.views);
        break;
      case 'latest':
      case 'new':
        sorted = [...mockNovels].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      case 'completed':
        sorted = [...mockNovels].filter(n => n.status === 'completed').sort((a, b) => b.rating - a.rating);
        break;
      case 'rating':
        sorted = [...mockNovels].sort((a, b) => b.rating - a.rating);
        break;
      case 'related':
        sorted = [...mockNovels].sort(() => Math.random() - 0.5);
        break;
      case 'personalized':
      default:
        // Shuffle for mock personalized
        sorted = [...mockNovels].sort(() => Math.random() - 0.5);
        break;
    }
    return sorted.slice(0, limit);
  },

  // -------- Bookshelf --------
  async getBookshelf(page = 1, pageSize = 10): Promise<Novel[]> {
    await delay(300);
    const all = mockNovels.filter(n => mockBookshelf.includes(n.id));
    const start = (page - 1) * pageSize;
    return all.slice(start, start + pageSize);
  },

  async addToBookshelf(novelId: string): Promise<void> {
    await delay(200);
    if (!mockBookshelf.includes(novelId)) {
      mockBookshelf.push(novelId);
    }
  },

  async removeFromBookshelf(novelId: string): Promise<void> {
    await delay(200);
    mockBookshelf = mockBookshelf.filter(id => id !== novelId);
  },

  // -------- Read History --------
  async getReadHistory(): Promise<ReadHistory[]> {
    await delay(300);
    return mockReadHistory;
  },

  async createReadHistory(novelId: string): Promise<void> {
    await delay(200);
    const novel = mockNovels.find(n => n.id === novelId);
    if (!novel) return;
    const existing = mockReadHistory.find(h => h.novel.id === novelId);
    if (existing) {
      existing.lastReadAt = new Date().toISOString();
      existing.lastChapter = existing.lastChapter || '开始修炼';
      return;
    }
    mockReadHistory.unshift({
      id: `h-${Date.now()}`,
      novel,
      lastReadAt: new Date().toISOString(),
      lastChapter: '开始修炼',
      progress: 0,
    });
  },

  async removeReadHistory(historyId: string): Promise<void> {
    await delay(200);
    mockReadHistory = mockReadHistory.filter(h => h.id !== historyId);
  },

  async clearReadHistory(): Promise<void> {
    await delay(200);
    mockReadHistory = [];
  },

  // -------- Profile --------
  async updateProfile(_data: { displayName?: string; bio?: string; avatarUrl?: string }): Promise<User> {
    await delay(300);
    return {
      id: "mock-user-id",
      username: "mockuser",
      role: "user",
      displayName: _data.displayName || "Mock User",
      bio: _data.bio || "Bio...",
      avatarUrl: _data.avatarUrl
    };
  },

  async changePassword(_data: { oldPassword: string; newPassword: string; confirmPassword: string }): Promise<void> {
    await delay(300);
  },

  async getMe(): Promise<User> {
    await delay(200);
    return {
      id: "mock-user-id",
      username: "mockuser",
      role: "user",
      displayName: "Mock User",
      avatarUrl: "https://placehold.co/100"
    };
  },

  async getMyComments(_page = 1, _pageSize = 10): Promise<PaginatedList<MyComment>> {
    return { items: [], total: 0, page: 1, pageSize: 10 };
  },

  async getMyRatings(_page = 1, _pageSize = 10): Promise<PaginatedList<MyRating>> {
    return { items: [], total: 0, page: 1, pageSize: 10 };
  },

  // -------- Interactions --------
  async getComments(_novelId: string, _page?: number, _pageSize?: number): Promise<PaginatedList<CommentThread>> {
    await delay(300);
    return { items: [], total: 0, page: 1, pageSize: 10 };
  },

  async postComment(_novelId: string, _content: string, _parentId?: string): Promise<{ commentId: string }> {
    await delay(300);
    return { commentId: "mock-comment-id" };
  },

  async deleteComment(_commentId: string): Promise<void> {
    await delay(200);
  },

  async rateNovel(_novelId: string, _score: number): Promise<void> {
    await delay(200);
  },

  // -------- Admin --------
  async adminGetNovels(_params: any): Promise<PaginatedList<Novel>> {
    return { items: [], total: 0, page: 1, pageSize: 10 };
  },
  async adminCreateNovel(_data: any): Promise<{ novelId: string }> {
    return { novelId: "mock-novel-id" };
  },
  async adminGetNovelDetail(_id: string): Promise<Novel> {
    return mockNovels[0];
  },
  async adminUpdateNovel(_id: string, _data: any): Promise<void> { },
  async adminDeleteNovel(_id: string): Promise<void> { },
  async adminUpdateNovelStatus(_id: string, _status: string): Promise<void> { },
  async adminGetUsers(_params: any): Promise<PaginatedList<User>> {
    return { items: [], total: 0, page: 1, pageSize: 10 };
  },
  async adminGetUserDetail(_id: string): Promise<User> {
    return { id: "u1", username: "u1", role: "user" };
  },
  async adminUpdateUser(_id: string, _data: any): Promise<void> { },
  async adminBanUser(_id: string, _type: string): Promise<void> { },
  async adminUnbanUser(_id: string): Promise<void> { },
  async adminGetNovelAnalytics(_params: any): Promise<PaginatedList<any>> {
    return { items: [], total: 0, page: 1, pageSize: 10 };
  },
  async adminGetUserAnalytics(_params: any): Promise<PaginatedList<any>> {
    return { items: [], total: 0, page: 1, pageSize: 10 };
  },
};
