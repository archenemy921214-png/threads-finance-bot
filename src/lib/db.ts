import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

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
  hashtags: string; // DBではJSON文字列
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
  hashtags: string; // DBではJSON文字列
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

// ----- DB初期化 -----

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'database.sqlite');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  initializeSchema(_db);
  return _db;
}

function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS themes (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT    NOT NULL,
      category     TEXT    NOT NULL DEFAULT '一般',
      priority     INTEGER NOT NULL DEFAULT 3,
      use_count    INTEGER NOT NULL DEFAULT 0,
      last_used_at TEXT,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS posts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      theme_id   INTEGER,
      theme_name TEXT,
      style      TEXT NOT NULL CHECK(style IN ('short', 'standard', 'passionate')),
      body       TEXT NOT NULL,
      cta        TEXT NOT NULL,
      hashtags   TEXT NOT NULL DEFAULT '[]',
      status     TEXT NOT NULL DEFAULT 'draft'
                 CHECK(status IN ('draft', 'approved', 'posted', 'archived')),
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS post_history (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id     INTEGER,
      theme_id    INTEGER,
      theme_name  TEXT,
      style       TEXT,
      body        TEXT NOT NULL,
      cta         TEXT NOT NULL,
      hashtags    TEXT NOT NULL DEFAULT '[]',
      posted_at   TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      likes       INTEGER NOT NULL DEFAULT 0,
      replies     INTEGER NOT NULL DEFAULT 0,
      memo        TEXT,
      improvement TEXT,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
    );
  `);
}

// ----- テーマ操作 -----

export function getThemes(): Theme[] {
  return getDb()
    .prepare('SELECT * FROM themes ORDER BY priority DESC, created_at DESC')
    .all() as Theme[];
}

export function getTheme(id: number): Theme | undefined {
  return getDb().prepare('SELECT * FROM themes WHERE id = ?').get(id) as Theme | undefined;
}

export function createTheme(data: Pick<Theme, 'name' | 'category' | 'priority'>): Theme {
  const result = getDb()
    .prepare('INSERT INTO themes (name, category, priority) VALUES (?, ?, ?)')
    .run(data.name, data.category, data.priority);
  return getTheme(result.lastInsertRowid as number)!;
}

export function updateTheme(
  id: number,
  data: Partial<Pick<Theme, 'name' | 'category' | 'priority'>>
): Theme | undefined {
  const entries = Object.entries(data);
  if (entries.length === 0) return getTheme(id);

  const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = [...entries.map(([, v]) => v), id];
  getDb().prepare(`UPDATE themes SET ${setClause} WHERE id = ?`).run(...values);
  return getTheme(id);
}

export function deleteTheme(id: number): void {
  getDb().prepare('DELETE FROM themes WHERE id = ?').run(id);
}

// ----- 投稿操作 -----

export function getPosts(status?: string): Post[] {
  const db = getDb();
  if (status) {
    return db
      .prepare('SELECT * FROM posts WHERE status = ? ORDER BY created_at DESC')
      .all(status) as Post[];
  }
  return db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all() as Post[];
}

export function getPost(id: number): Post | undefined {
  return getDb().prepare('SELECT * FROM posts WHERE id = ?').get(id) as Post | undefined;
}

export function createPost(
  data: Pick<Post, 'theme_id' | 'theme_name' | 'style' | 'body' | 'cta'> & {
    hashtags: string[];
  }
): Post {
  const result = getDb()
    .prepare(
      'INSERT INTO posts (theme_id, theme_name, style, body, cta, hashtags) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(
      data.theme_id,
      data.theme_name,
      data.style,
      data.body,
      data.cta,
      JSON.stringify(data.hashtags)
    );
  return getPost(result.lastInsertRowid as number)!;
}

export function updatePost(
  id: number,
  data: Partial<Pick<Post, 'body' | 'cta' | 'status'> & { hashtags: string[] }>
): Post | undefined {
  const updateData: Record<string, unknown> = {};

  if (data.body !== undefined) updateData.body = data.body;
  if (data.cta !== undefined) updateData.cta = data.cta;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.hashtags !== undefined) updateData.hashtags = JSON.stringify(data.hashtags);
  updateData.updated_at = new Date().toLocaleString('ja-JP');

  const entries = Object.entries(updateData);
  if (entries.length === 0) return getPost(id);

  const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = [...entries.map(([, v]) => v), id];
  getDb().prepare(`UPDATE posts SET ${setClause} WHERE id = ?`).run(...values);
  return getPost(id);
}

export function deletePost(id: number): void {
  getDb().prepare('DELETE FROM posts WHERE id = ?').run(id);
}

export function markAsPosted(postId: number): number | null {
  const post = getPost(postId);
  if (!post) return null;

  const db = getDb();

  const historyResult = db
    .prepare(
      'INSERT INTO post_history (post_id, theme_id, theme_name, style, body, cta, hashtags) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(post.id, post.theme_id, post.theme_name, post.style, post.body, post.cta, post.hashtags);

  db.prepare(
    "UPDATE posts SET status = 'posted', updated_at = datetime('now', 'localtime') WHERE id = ?"
  ).run(postId);

  if (post.theme_id) {
    db.prepare(
      "UPDATE themes SET use_count = use_count + 1, last_used_at = datetime('now', 'localtime') WHERE id = ?"
    ).run(post.theme_id);
  }

  return historyResult.lastInsertRowid as number;
}

// ----- 履歴操作 -----

export function getHistory(): PostHistory[] {
  return getDb()
    .prepare('SELECT * FROM post_history ORDER BY posted_at DESC')
    .all() as PostHistory[];
}

export function getHistoryItem(id: number): PostHistory | undefined {
  return getDb()
    .prepare('SELECT * FROM post_history WHERE id = ?')
    .get(id) as PostHistory | undefined;
}

export function updateHistoryItem(
  id: number,
  data: Partial<Pick<PostHistory, 'likes' | 'replies' | 'memo' | 'improvement'>>
): PostHistory | undefined {
  const entries = Object.entries(data);
  if (entries.length === 0) return getHistoryItem(id);

  const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = [...entries.map(([, v]) => v), id];
  getDb().prepare(`UPDATE post_history SET ${setClause} WHERE id = ?`).run(...values);
  return getHistoryItem(id);
}

// ----- 統計 -----

export function getStats(): Stats {
  const db = getDb();

  const draftCount = (
    db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'draft'").get() as {
      count: number;
    }
  ).count;

  const approvedCount = (
    db.prepare("SELECT COUNT(*) as count FROM posts WHERE status = 'approved'").get() as {
      count: number;
    }
  ).count;

  const totalPosted = (
    db.prepare('SELECT COUNT(*) as count FROM post_history').get() as { count: number }
  ).count;

  const themeCount = (
    db.prepare('SELECT COUNT(*) as count FROM themes').get() as { count: number }
  ).count;

  const recentHistory = db
    .prepare('SELECT * FROM post_history ORDER BY posted_at DESC LIMIT 5')
    .all() as PostHistory[];

  return { draftCount, approvedCount, totalPosted, themeCount, recentHistory };
}

// ----- サンプルデータ -----

export function seedData(): void {
  const db = getDb();
  const existing = (db.prepare('SELECT COUNT(*) as count FROM themes').get() as { count: number })
    .count;
  if (existing > 0) return;

  const themes = [
    { name: '複利の力', category: '資産形成', priority: 5 },
    { name: 'NISAの基本', category: '投資制度', priority: 5 },
    { name: '家計簿の始め方', category: '家計管理', priority: 4 },
    { name: '緊急資金の重要性', category: '資産形成', priority: 4 },
    { name: 'iDeCoとは', category: '投資制度', priority: 3 },
  ];

  const insertTheme = db.prepare(
    'INSERT INTO themes (name, category, priority) VALUES (?, ?, ?)'
  );
  for (const t of themes) {
    insertTheme.run(t.name, t.category, t.priority);
  }

  // サンプル投稿
  const samplePosts = [
    {
      theme_name: '複利の力',
      style: 'short' as const,
      body: `複利って知ってますか？\n\n簡単に言うと\n「利息にも利息がつく」仕組みです。\n\n毎月1万円を年利5%で20年積み立てると\n約400万の元本が約800万になります。\n\nお金に働いてもらうってこういうことです。`,
      cta: 'まずは少額から積立を始めてみましょう！',
      hashtags: ['#複利', '#資産形成', '#お金の勉強'],
      status: 'approved' as const,
    },
    {
      theme_name: 'NISAの基本',
      style: 'standard' as const,
      body: `新NISAが始まってから\nよく聞くようになりましたよね。\n\nざっくり説明すると\nNISAは「投資の利益に税金がかからない」制度です。\n\n通常は利益の約20%が税金でとられますが\nNISA口座を使うと0円。\n\n年間360万円まで、生涯1800万円まで\n非課税で運用できます。\n\n「何から始めればいいかわからない」方は\nまずNISAの口座開設から始めるのがおすすめです。`,
      cta: '口座開設は無料、証券会社を選ぶところからスタートしましょう！',
      hashtags: ['#NISA', '#新NISA', '#投資初心者'],
      status: 'draft' as const,
    },
  ];

  const insertPost = db.prepare(
    'INSERT INTO posts (theme_name, style, body, cta, hashtags, status) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (const p of samplePosts) {
    insertPost.run(p.theme_name, p.style, p.body, p.cta, JSON.stringify(p.hashtags), p.status);
  }

  // サンプル履歴
  db.prepare(
    `INSERT INTO post_history (theme_name, style, body, cta, hashtags, likes, replies, memo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    '家計簿の始め方',
    'short',
    `家計簿、続かない人へ。\n\n完璧にやろうとしないのがコツです。\n\nまずはレシートを捨てずに\n週1回だけ集計する。\n\nそれだけでOKです。`,
    '小さく始めて習慣化しましょう！',
    JSON.stringify(['#家計簿', '#節約', '#お金管理']),
    42,
    8,
    '反応良かった。シンプルなアドバイス系は刺さる'
  );
}
