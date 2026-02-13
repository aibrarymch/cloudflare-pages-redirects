# cloudflare-pages-redirects

Cloudflare Pages で動作する、JSON 設定ファイルベースの短縮 URL サービス。

外部依存なし・Node.js 組み込みモジュールのみで動作します。

## 特徴

- `redirects.json` を編集するだけで短縮 URL を管理
- 301 永続リダイレクト（SEO フレンドリー）
- ビルド時のバリデーション（重複・URL 形式・文字数制限）
- UTM パラメータによるアクセス解析対応
- ルートパスのフォールバックリダイレクト

## セットアップ

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

外部依存パッケージはありません。Node.js があればすぐに使えます。

## 使い方

### 1. リダイレクトを追加

`redirects.json` の `redirects` 配列にエントリを追加します。

```json
{
  "from": "my-link",
  "to": "https://example.com/destination",
  "description": "リンクの説明"
}
```

### 2. ビルド

```bash
npm run build
```

`redirects.json` のバリデーション → Cloudflare Pages 用の `dist/_redirects` ファイル生成が行われます。

### 3. デプロイ

コミット & プッシュで Cloudflare Pages に自動デプロイされます。

## Cloudflare Pages 設定

| 項目 | 値 |
|------|-----|
| Build command | `npm run build` |
| Build output directory | `dist` |

## `redirects.json` の構造

```json
{
  "meta": {
    "defaultStatusCode": 301,
    "rootRedirect": "https://example.com/"
  },
  "redirects": [
    {
      "from": "short-path",
      "to": "https://example.com/long-destination-url",
      "description": "任意の説明（ビルドには影響しません）"
    }
  ]
}
```

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `meta.defaultStatusCode` | - | HTTP ステータスコード（デフォルト: 301） |
| `meta.rootRedirect` | - | `/` へのアクセス時のリダイレクト先 |
| `redirects[].from` | Yes | 短縮パス |
| `redirects[].to` | Yes | リダイレクト先 URL（`http://` or `https://`） |
| `redirects[].description` | - | 管理用の説明メモ |

## バリデーションルール

- リダイレクト先は `http://` または `https://` で始まること
- パスの重複不可（大文字小文字を区別しない）
- 1 行あたり最大 1,000 文字
- 最大 2,000 件のリダイレクト

## ライセンス

[0BSD](LICENSE)
