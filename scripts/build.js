const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../dist');

function build() {
  // 設定ファイル読み込み
  const configPath = path.join(__dirname, '../redirects.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // 出力ディレクトリ作成
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // ステータスコード取得
  const statusCode = config.meta?.defaultStatusCode || 301;

  // リダイレクト行を構築
  const redirectLines = [];

  // ルートリダイレクト（指定がある場合）
  if (config.meta?.rootRedirect) {
    redirectLines.push(`/ ${config.meta.rootRedirect} ${statusCode}`);
  }

  // 短縮URLリダイレクト
  config.redirects.forEach(r => {
    const from = r.from.startsWith('/') ? r.from : `/${r.from}`;
    redirectLines.push(`${from} ${r.to} ${statusCode}`);
  });

  // ヘッダー生成
  const header = [
    '# Cloudflare Pages Redirects',
    `# Generated: ${new Date().toISOString()}`,
    `# Total: ${config.redirects.length} redirect(s)`,
    ''
  ].join('\n');

  // _redirectsファイル書き出し
  const redirectsPath = path.join(DIST_DIR, '_redirects');
  fs.writeFileSync(redirectsPath, header + redirectLines.join('\n') + '\n');

  console.log(`Build complete: ${config.redirects.length} redirect(s) generated`);
  console.log(`Output: ${redirectsPath}`);
}

build();
