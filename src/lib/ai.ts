import Anthropic from '@anthropic-ai/sdk';

export interface GeneratedPost {
  body: string;
  cta: string;
  hashtags: string[];
}

export interface GeneratedPosts {
  short: GeneratedPost;
  standard: GeneratedPost;
  passionate: GeneratedPost;
}

// ----- Claude APIを使って投稿生成 -----

export async function generatePosts(
  themeName: string,
  category: string
): Promise<GeneratedPosts> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY が未設定のため、テンプレートを使用します');
    return generateFromTemplate(themeName, category);
  }

  const client = new Anthropic({ apiKey });

  const prompt = `あなたはThreads（SNS）で金融教育を発信するアカウントの中の人です。

テーマ：「${themeName}」（カテゴリ：${category}）

このテーマについて、以下の3パターンの投稿を作成してください。

【ルール】
- 金融初心者向けに、わかりやすく、親しみやすい言葉で書く
- 上から目線や専門用語の多用は禁止
- Threadsらしい短文・改行多めの自然な文体
- 過度な煽り（「今すぐやらないと損！」等）は禁止
- 読んだ人が「やってみよう」と思える内容にする
- 本文は200〜400文字程度（短文パターンは100〜150文字）
- CTAは1〜2文で行動を促す（押しつけにならないように）
- ハッシュタグは3つ（#なしで返さず、#をつけて返す）

【3パターン】
1. short（短文）：サクッと読める。1つのことだけ伝える。
2. standard（標準）：適度な長さで要点を丁寧に説明。
3. passionate（熱量高め）：共感・感情に訴える。少し熱い語り口。

以下のJSON形式のみで返してください（説明文は不要）：
{
  "short": {
    "body": "本文（改行は\\nで表現）",
    "cta": "CTA文",
    "hashtags": ["#タグ1", "#タグ2", "#タグ3"]
  },
  "standard": {
    "body": "本文",
    "cta": "CTA文",
    "hashtags": ["#タグ1", "#タグ2", "#タグ3"]
  },
  "passionate": {
    "body": "本文",
    "cta": "CTA文",
    "hashtags": ["#タグ1", "#タグ2", "#タグ3"]
  }
}`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('予期しないレスポンス形式');
    }

    // JSONブロックを抽出（```json ... ``` 形式にも対応）
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSONが見つかりませんでした');
    }

    const parsed = JSON.parse(jsonMatch[0]) as GeneratedPosts;
    return parsed;
  } catch (err) {
    console.error('AI生成エラー、テンプレートにフォールバック:', err);
    return generateFromTemplate(themeName, category);
  }
}

// ----- APIキー未設定時のテンプレートフォールバック -----

function generateFromTemplate(themeName: string, category: string): GeneratedPosts {
  const shortTemplates = [
    `「${themeName}」って聞いたことありますか？\n\n意外とシンプルな仕組みなんです。\n\n今日はその基本だけ、サクッと説明しますね。`,
    `${themeName}について\n\nよく誤解されていることがあります。\n\n正直に言うと、私も最初は全然わかりませんでした。`,
  ];

  const standardTemplates = [
    `${themeName}、最近よく聞くけど\n実際どういうこと？という方へ。\n\nざっくり説明すると、${category}の分野での重要な考え方のひとつです。\n\n難しく考えなくて大丈夫。\n小さな一歩から始めれば\nどんどん理解が深まります。\n\nまずは「知る」だけでもOKです。`,
    `${themeName}について、正直に話します。\n\n最初は複雑に感じるかもしれません。\nでも基本を押さえれば、意外とシンプル。\n\n大切なのは「完璧に理解してから始める」より\n「とりあえずやってみる」こと。\n\n小さく始めて、少しずつ学んでいきましょう。`,
  ];

  const passionateTemplates = [
    `${themeName}を知らないまま過ごすのは\nもったいないと思っています。\n\n知識がないと、大切なお金の選択を\n誰かに任せっぱなしになってしまう。\n\n自分でお金のことを理解して\n自分で選べるようになること。\n\nそれが本当の「お金の自由」だと思うんです。`,
  ];

  const hashtagSets: Record<string, string[][]> = {
    資産形成: [
      ['#資産形成', '#お金の勉強', '#投資初心者'],
      ['#貯金', '#資産運用', '#金融リテラシー'],
    ],
    投資制度: [
      ['#投資', '#NISA', '#お金の勉強'],
      ['#資産運用', '#投資初心者', '#金融リテラシー'],
    ],
    家計管理: [
      ['#家計管理', '#節約', '#お金の勉強'],
      ['#家計簿', '#節約術', '#生活費'],
    ],
    一般: [
      ['#お金の勉強', '#金融リテラシー', '#投資初心者'],
      ['#資産形成', '#お金', '#節約'],
    ],
  };

  const tags = hashtagSets[category] ?? hashtagSets['一般'];

  return {
    short: {
      body: shortTemplates[Math.floor(Math.random() * shortTemplates.length)],
      cta: 'ためになったと思ったら、いいねしてもらえると嬉しいです！',
      hashtags: tags[0],
    },
    standard: {
      body: standardTemplates[Math.floor(Math.random() * standardTemplates.length)],
      cta: 'わからないことがあれば気軽にコメントしてください！',
      hashtags: tags[1] ?? tags[0],
    },
    passionate: {
      body: passionateTemplates[0],
      cta: '一緒にお金の勉強、続けていきましょう！',
      hashtags: tags[0],
    },
  };
}
