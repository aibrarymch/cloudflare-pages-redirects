const fs = require('fs');
const path = require('path');

const MAX_REDIRECTS = 2000;
const MAX_LINE_LENGTH = 1000;

function validate() {
  const configPath = path.join(__dirname, '../redirects.json');

  // ファイル存在チェック
  if (!fs.existsSync(configPath)) {
    console.error('Error: redirects.json not found');
    process.exit(1);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    console.error('Error: Invalid JSON in redirects.json');
    console.error(e.message);
    process.exit(1);
  }

  const errors = [];
  const warnings = [];
  const seenPaths = new Set();

  // redirects配列の存在チェック
  if (!config.redirects || !Array.isArray(config.redirects)) {
    errors.push('Missing or invalid "redirects" array');
  } else {
    // 件数チェック
    if (config.redirects.length > MAX_REDIRECTS) {
      errors.push(`Redirect count (${config.redirects.length}) exceeds limit (${MAX_REDIRECTS})`);
    }

    // 各リダイレクトを検証
    config.redirects.forEach((r, i) => {
      const lineNum = i + 1;

      // 必須フィールドチェック
      if (!r.from) {
        errors.push(`Entry ${lineNum}: Missing 'from' field`);
      }
      if (!r.to) {
        errors.push(`Entry ${lineNum}: Missing 'to' field`);
      }

      // URL形式チェック
      if (r.to && !r.to.startsWith('http://') && !r.to.startsWith('https://')) {
        errors.push(`Entry ${lineNum}: Invalid URL format (must start with http:// or https://): ${r.to}`);
      }

      // パス形式チェック
      if (r.from) {
        const normalizedFrom = r.from.startsWith('/') ? r.from : `/${r.from}`;

        // 重複チェック
        if (seenPaths.has(normalizedFrom.toLowerCase())) {
          errors.push(`Entry ${lineNum}: Duplicate path: ${normalizedFrom}`);
        }
        seenPaths.add(normalizedFrom.toLowerCase());

        // 行長チェック
        const lineLength = `${normalizedFrom} ${r.to} 301`.length;
        if (lineLength > MAX_LINE_LENGTH) {
          errors.push(`Entry ${lineNum}: Line too long (${lineLength} > ${MAX_LINE_LENGTH})`);
        }

        // 特殊文字警告
        if (/[^a-zA-Z0-9\-_\/]/.test(normalizedFrom)) {
          warnings.push(`Entry ${lineNum}: Path contains special characters: ${normalizedFrom}`);
        }
      }
    });
  }

  // rootRedirectのチェック（指定がある場合）
  if (config.meta?.rootRedirect) {
    if (!config.meta.rootRedirect.startsWith('http://') && !config.meta.rootRedirect.startsWith('https://')) {
      errors.push(`rootRedirect: Invalid URL format: ${config.meta.rootRedirect}`);
    }
  }

  // 結果出力
  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  - ${e}`));
    process.exit(1);
  }

  const redirectCount = config.redirects?.length || 0;
  console.log(`Validation passed: ${redirectCount} redirect(s) OK`);
}

validate();
