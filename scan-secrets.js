#!/usr/bin/env node

/**
 * 密钥扫描脚本
 * 在 Git 提交前扫描暂存文件，检测敏感信息
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 敏感信息正则表达式
const SECRET_PATTERNS = [
  {
    name: 'Bearer Token',
    pattern: /Bearer\s+[A-Za-z0-9_\-\.]{10,}/g,
    description: 'Bearer 认证令牌'
  },
  {
    name: 'Notion API Token',
    pattern: /NOTION_API_TOKEN\s*=\s*['"][^'"]+['"]/g,
    description: 'Notion API 令牌'
  },
  {
    name: 'OpenAI API Key',
    pattern: /sk-[A-Za-z0-9]{10,}/g,
    description: 'OpenAI API 密钥'
  },
  {
    name: 'GitHub Personal Access Token',
    pattern: /ghp_[A-Za-z0-9]{20,}/g,
    description: 'GitHub 个人访问令牌'
  },
  {
    name: 'Generic API Key',
    pattern: /api[_-]?key\s*[:=]\s*['"][A-Za-z0-9_\-\.]{10,}['"]/gi,
    description: '通用 API 密钥'
  },
  {
    name: 'Database Connection String',
    pattern: /(mongodb|mysql|postgresql):\/\/[^'"\s]+/gi,
    description: '数据库连接字符串'
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
    description: '私钥文件'
  },
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/g,
    description: 'AWS 访问密钥'
  }
];

// 需要忽略的文件和目录
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /_site/,
  /\.cache/,
  /\.DS_Store/,
  /\.env\.local$/,
  /\.env\.example$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /\.log$/,
  /\.tmp$/,
  /\.temp$/,
  /\.swp$/,
  /\.swo$/,
  /~$/,
  /\.min\.js$/,
  /\.min\.css$/,
  /\.bundle\.js$/,
  /\.chunk\.js$/,
  /\.map$/,
  /\.woff2?$/,
  /\.ttf$/,
  /\.eot$/,
  /\.svg$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.gif$/,
  /\.ico$/,
  /\.pdf$/,
  /\.zip$/,
  /\.tar$/,
  /\.gz$/
];

// 需要忽略的文件扩展名
const IGNORE_EXTENSIONS = [
  '.min.js',
  '.min.css',
  '.bundle.js',
  '.chunk.js',
  '.map',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
  '.mp4',
  '.mp3',
  '.wav',
  '.avi',
  '.mov'
];

/**
 * 检查文件是否应该被忽略
 */
function shouldIgnoreFile(filePath) {
  // 检查路径模式
  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.test(filePath)) {
      return true;
    }
  }

  // 检查文件扩展名
  const ext = path.extname(filePath).toLowerCase();
  if (IGNORE_EXTENSIONS.includes(ext)) {
    return true;
  }

  return false;
}

/**
 * 扫描文件内容
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];

    for (let lineNumber = 1; lineNumber <= lines.length; lineNumber++) {
      const line = lines[lineNumber - 1];

      for (const secretPattern of SECRET_PATTERNS) {
        const matches = line.match(secretPattern.pattern);
        if (matches) {
          issues.push({
            file: filePath,
            line: lineNumber,
            type: secretPattern.name,
            description: secretPattern.description,
            matches: matches.length
          });
        }
      }
    }

    return issues;
  } catch (error) {
    // 如果文件无法读取（可能是二进制文件），跳过
    console.warn(`⚠️  无法读取文件: ${filePath} (${error.message})`);
    return [];
  }
}

/**
 * 获取暂存文件列表
 */
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    return output.trim().split('\n').filter(file => file.length > 0);
  } catch (error) {
    console.error('❌ 无法获取暂存文件列表:', error.message);
    process.exit(1);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 开始扫描暂存文件中的敏感信息...\n');

  const stagedFiles = getStagedFiles();
  
  if (stagedFiles.length === 0) {
    console.log('✅ 没有暂存文件需要扫描');
    return;
  }

  console.log(`📁 扫描 ${stagedFiles.length} 个暂存文件:`);
  stagedFiles.forEach(file => console.log(`   - ${file}`));
  console.log('');

  let totalIssues = 0;
  const allIssues = [];

  for (const file of stagedFiles) {
    if (shouldIgnoreFile(file)) {
      console.log(`⏭️  跳过文件: ${file} (在忽略列表中)`);
      continue;
    }

    const issues = scanFile(file);
    if (issues.length > 0) {
      allIssues.push(...issues);
      totalIssues += issues.length;
    }
  }

  if (totalIssues === 0) {
    console.log('✅ 未发现敏感信息，可以安全提交');
    return;
  }

  // 输出发现的问题
  console.log('🚨 发现敏感信息，提交被阻止！\n');
  
  // 按文件分组显示问题
  const issuesByFile = {};
  allIssues.forEach(issue => {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = [];
    }
    issuesByFile[issue.file].push(issue);
  });

  for (const [file, issues] of Object.entries(issuesByFile)) {
    console.log(`📄 ${file}:`);
    issues.forEach(issue => {
      console.log(`   🚨 第 ${issue.line} 行: ${issue.type} (${issue.description})`);
    });
    console.log('');
  }

  console.log('💡 修复建议:');
  console.log('   1. 将敏感信息移动到环境变量文件 (.env.local)');
  console.log('   2. 使用 .env.example 文件提供示例配置');
  console.log('   3. 确保 .env.local 在 .gitignore 中');
  console.log('   4. 使用 process.env.VARIABLE_NAME 读取环境变量');
  console.log('');
  console.log('🔧 修复后重新提交:');
  console.log('   git add .');
  console.log('   git commit -m "your message"');

  process.exit(1);
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { scanFile, shouldIgnoreFile, SECRET_PATTERNS };
