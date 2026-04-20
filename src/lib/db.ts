import fs from 'fs';
import path from 'path';

// ----- 型定義 -----

export interface Theme {
  id: number;
  name: string;
  category: string;
  priority: number;
  use_count: number;
  last_used_at: string | null;
  created_at: string;
}

export interface Post {
  id: number;
  theme_id: number | null;
  theme_name: string | null;
  style: 'short' | 'standard' | 'passionate';
  body: string;
  cta: string;
  hashtags: string; // JSON文字列
  status: 'draft' | 'approved' | 'posted' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface PostHistory {
  id: number;
  post_id: number | null;
  theme_id: number | null;
  theme_name: string | null;
  style: string | null;
  body: string;
  cta: string;
  hashtags: string; // JSON文字列
  posted_at: string;
  likes: number;
  replies: number;
  memo: string | null;
  improvement: string | null;
}

export interface Stats {
  draftCount: number;
  approvedCount: number;
  totalPosted: number;
  themeCount: number;
  recentHistory: PostHistory[];
}

interface DbStore {
  themes: Theme[];
  posts: Post[];
  post_history: PostHistory[];
  seq: { themes: number; posts: number; post_history: number };
}

// ----- ファイルストレージ -----

// Vercelは/tmpのみ書き込み可能。ローカルではdata/ディレクトリを使用。
const DATA_DIR =
  process.env.VERCEL || process.env.NODE_ENV === 'production'
    ? '/tmp'
    : path.join(process.cwd(), 'data');

const DB_FILE = path.join(DATA_DIR, 'db.json');

function now(): string {
  return new Date().toLocaleString('ja-JP');
}

function loadStore(): DbStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch {
    // 読み込み失敗時は空ストアを返す
  }
  return {
    themes: [],
    posts: [],
    post_history: [],
    seq: { themes: 0, posts: 0, post_history: 0 },
  };
}

function saveStore(store: DbStore): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

function nextId(store: DbStore, table: keyof DbStore['seq']): number {
  store.seq[table] += 1;
  return store.seq[table];
}

// ----- テーマ操作 -----

export function getThemes(): Theme[] {
  const { themes } = loadStore();
  return [...themes].sort((a, b) => b.priority - a.priority || b.created_at.localeCompare(a.created_at));
}

export function getTheme(id: number): Theme | undefined {
  return loadStore().themes.find((t) => t.id === id);
}

export function createTheme(data: Pick<Theme, 'name' | 'category' | 'priority'>): Theme {
  const store = loadStore();
  const theme: Theme = {
    id: nextId(store, 'themes'),
    name: data.name,
    category: data.category,
    priority: data.priority,
    use_count: 0,
    last_used_at: null,
    created_at: now(),
  };
  store.themes.push(theme);
  saveStore(store);
  return theme;
}

export function updateTheme(
  id: number,
  data: Partial<Pick<Theme, 'name' | 'category' | 'priority'>>
): Theme | undefined {
  const store = loadStore();
  const idx = store.themes.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  store.themes[idx] = { ...store.themes[idx], ...data };
  saveStore(store);
  return store.themes[idx];
}

export function deleteTheme(id: number): void {
  const store = loadStore();
  store.themes = store.themes.filter((t) => t.id !== id);
  saveStore(store);
}

// ----- 投稿操作 -----

export function getPosts(status?: string): Post[] {
  const { posts } = loadStore();
  const filtered = status ? posts.filter((p) => p.status === status) : posts;
  return [...filtered].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getPost(id: number): Post | undefined {
  return loadStore().posts.find((p) => p.id === id);
}

export function createPost(
  data: Pick<Post, 'theme_id' | 'theme_name' | 'style' | 'body' | 'cta'> & {
    hashtags: string[];
  }
): Post {
  const store = loadStore();
  const ts = now();
  const post: Post = {
    id: nextId(store, 'posts'),
    theme_id: data.theme_id,
    theme_name: data.theme_name,
    style: data.style,
    body: data.body,
    cta: data.cta,
    hashtags: JSON.stringify(data.hashtags),
    status: 'draft',
    created_at: ts,
    updated_at: ts,
  };
  store.posts.push(post);
  saveStore(store);
  return post;
}

export function updatePost(
  id: number,
  data: Partial<Pick<Post, 'body' | 'cta' | 'status'> & { hashtags: string[] }>
): Post | undefined {
  const store = loadStore();
  const idx = store.posts.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;

  const update: Partial<Post> = { updated_at: now() };
  if (data.body !== undefined) update.body = data.body;
  if (data.cta !== undefined) update.cta = data.cta;
  if (data.status !== undefined) update.status = data.status;
  if (data.hashtags !== undefined) update.hashtags = JSON.stringify(data.hashtags);

  store.posts[idx] = { ...store.posts[idx], ...update };
  saveStore(store);
  return store.posts[idx];
}

export function deletePost(id: number): void {
  const store = loadStore();
  store.posts = store.posts.filter((p) => p.id !== id);
  saveStore(store);
}

export function markAsPosted(postId: number): number | null {
  const store = loadStore();
  const postIdx = store.posts.findIndex((p) => p.id === postId);
  if (postIdx === -1) return null;

  const post = store.posts[postIdx];

  const historyItem: PostHistory = {
    id: nextId(store, 'post_history'),
    post_id: post.id,
    theme_id: post.theme_id,
    theme_name: post.theme_name,
    style: post.style,
    body: post.body,
    cta: post.cta,
    hashtags: post.hashtags,
    posted_at: now(),
    likes: 0,
    replies: 0,
    memo: null,
    improvement: null,
  };
  store.post_history.push(historyItem);

  store.posts[postIdx] = { ...post, status: 'posted', updated_at: now() };

  if (post.theme_id) {
    const themeIdx = store.themes.findIndex((t) => t.id === post.theme_id);
    if (themeIdx !== -1) {
      store.themes[themeIdx] = {
        ...store.themes[themeIdx],
        use_count: store.themes[themeIdx].use_count + 1,
        last_used_at: now(),
      };
    }
  }

  saveStore(store);
  return historyItem.id;
}

// ----- 履歴操作 -----

export function getHistory(): PostHistory[] {
  const { post_history } = loadStore();
  return [...post_history].sort((a, b) => b.posted_at.localeCompare(a.posted_at));
}

export function getHistoryItem(id: number): PostHistory | undefined {
  return loadStore().post_history.find((h) => h.id === id);
}

export function updateHistoryItem(
  id: number,
  data: Partial<Pick<PostHistory, 'likes' | 'replies' | 'memo' | 'improvement'>>
): PostHistory | undefined {
  const store = loadStore();
  const idx = store.post_history.findIndex((h) => h.id === id);
  if (idx === -1) return undefined;
  store.post_history[idx] = { ...store.post_history[idx], ...data };
  saveStore(store);
  return store.post_history[idx];
}

// ----- 統計 -----

export function getStats(): Stats {
  const store = loadStore();
  return {
    draftCount: store.posts.filter((p) => p.status === 'draft').length,
    approvedCount: store.posts.filter((p) => p.status === 'approved').length,
    totalPosted: store.post_history.length,
    themeCount: store.themes.length,
    recentHistory: [...store.post_history]
      .sort((a, b) => b.posted_at.localeCompare(a.posted_at))
      .slice(0, 5),
  };
}

// ----- サンプルデータ -----

export function seedData(): void {
  const store = loadStore();
  if (store.themes.length > 0) return;

  const themes = [
    { name: '複利の力', category: '資産形成', priority: 5 },
    { name: 'NISAの基本', category: '投資制度', priority: 5 },
    { name: '家計簿の始め方', category: '家計管理', priority: 4 },
    { name: '緊急資金の重要性', category: '資産形成', priority: 4 },
    { name: 'iDeCoとは', category: '投資制度', priority: 3 },
  ];

  for (const t of themes) {
    const theme: Theme = {
      id: nextId(store, 'themes'),
      name: t.name,
      category: t.category,
      priority: t.priority,
      use_count: 0,
      last_used_at: null,
      created_at: now(),
    };
    store.themes.push(theme);
  }

  const samplePosts: Array<{
    theme_name: string;
    style: Post['style'];
    body: string;
    cta: string;
    hashtags: string[];
    status: Post['status'];
  }> = [
    {
      theme_name: '複利の力',
      style: 'short',
      body: `複利って知ってますか？\n\n簡単に言うと\n「利息にも利息がつく」仕組みです。\n\n毎月1万円を年利5%で20年積み立てると\n約400万の元本が約800万になります。\n\nお金に働いてもらうってこういうことです。`,
      cta: 'まずは少額から積立を始めてみましょう！',
      hashtags: ['#複利', '#資産形成', '#お金の勉強'],
      status: 'approved',
    },
    {
      theme_name: 'NISAの基本',
      style: 'standard',
      body: `新NISAが始まってから\nよく聞くようになりましたよね。\n\nざっくり説明すると\nNISAは「投資の利益に税金がかからない」制度です。\n\n通常は利益の約20%が税金でとられますが\nNISA口座を使うと0円。\n\n年間360万円まで、生涯1800万円まで\n非課税で運用できます。\n\n「何から始めればいいかわからない」方は\nまずNISAの口座開設から始めるのがおすすめです。`,
      cta: '口座開設は無料、証券会社を選ぶところからスタートしましょう！',
      hashtags: ['#NISA', '#新NISA', '#投資初心者'],
      status: 'draft',
    },
  ];

  const ts = now();
  for (const p of samplePosts) {
    const post: Post = {
      id: nextId(store, 'posts'),
      theme_id: null,
      theme_name: p.theme_name,
      style: p.style,
      body: p.body,
      cta: p.cta,
      hashtags: JSON.stringify(p.hashtags),
      status: p.status,
      created_at: ts,
      updated_at: ts,
    };
    store.posts.push(post);
  }

  const historyItem: PostHistory = {
    id: nextId(store, 'post_history'),
    post_id: null,
    theme_id: null,
    theme_name: '家計簿の始め方',
    style: 'short',
    body: `家計簿、続かない人へ。\n\n完璧にやろうとしないのがコツです。\n\nまずはレシートを捨てずに\n週1回だけ集計する。\n\nそれだけでOKです。`,
    cta: '小さく始めて習慣化しましょう！',
    hashtags: JSON.stringify(['#家計簿', '#節約', '#お金管理']),
    posted_at: ts,
    likes: 42,
    replies: 8,
    memo: '反応良かった。シンプルなアドバイス系は刺さる',
    improvement: null,
  };
  store.post_history.push(historyItem);

  saveStore(store);
}
