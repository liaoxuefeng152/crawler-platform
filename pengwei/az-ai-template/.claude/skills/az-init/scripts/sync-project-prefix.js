#!/usr/bin/env node

/**
 * az-init 自动配置脚本
 *
 * 功能：
 * 1. 使用当前目录名作为项目目录名（projectDir）
 * 2. 交互式询问产品首页名称（projectName）
 * 3. 自动更新 project.config.json（主配置文件）
 * 4. 自动更新 package.json 的 name 字段
 * 5. 自动更新 .env.local 的 PROJECT_TABLE_PREFIX、DATABASE_URL 和 NEXT_PUBLIC_PROJECT_NAME
 * 6. 自动更新 Dockerfile 中的 DATABASE_URL（从系统环境变量读取）
 * 7. 重新生成 Prisma Schema
 *
 * 使用方式：
 * - 直接运行：node .claude/skills/az-init/scripts/sync-project-prefix.js
 * - 指定项目名称：node .claude/skills/az-init/scripts/sync-project-prefix.js --project-name="你的产品名称"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 获取当前目录名作为项目名
function getDirectoryName() {
  return path.basename(process.cwd());
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};

  args.forEach(arg => {
    if (arg.startsWith('--project-name=')) {
      result.projectName = arg.split('=')[1];
    }
  });

  return result;
}

// 创建 readline 接口
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// 交互式询问产品首页名称
async function askProjectDisplayName(defaultName) {
  return new Promise((resolve) => {
    const rl = createReadlineInterface();

    log('\n' + '='.repeat(60), 'magenta');
    log('📝 产品首页名称配置', 'magenta');
    log('='.repeat(60), 'magenta');
    log(`\n当前项目目录名：${defaultName}`, 'cyan');
    log('\n请输入产品首页名称（将显示在页面标题、登录页、导航栏等位置）', 'blue');
    log(`直接按 Enter 使用默认名称：${defaultName}`, 'yellow');

    rl.question('\n产品首页名称: ', (answer) => {
      rl.close();
      resolve(answer.trim() || defaultName);
    });
  });
}

// 读取 project.config.json
function getProjectConfig() {
  const configPath = path.join(process.cwd(), 'project.config.json');
  if (!fs.existsSync(configPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

// 更新 project.config.json
function updateProjectConfig(projectDirName, projectDisplayName) {
  const configPath = path.join(process.cwd(), 'project.config.json');

  const config = {
    "$schema": "./project.config.schema.json",
    "projectName": projectDisplayName,
    "projectDir": projectDirName
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  log(`✅ 已更新 project.config.json`, 'green');
  log(`  productName: "${projectDisplayName}"`, 'cyan');
  log(`  projectDir: "${projectDirName}"`, 'cyan');
  return true;
}

// 读取 package.json
function getPackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log('❌ 错误：package.json 不存在', 'red');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
}

// 更新 package.json 的 name
function updatePackageJsonName(newName) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = getPackageJson();

  if (packageJson.name === newName) {
    log(`  package.json name 已经是 "${newName}"，无需更新`, 'green');
    return false;
  }

  packageJson.name = newName;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
  log(`✅ 已更新 package.json: name="${newName}"`, 'green');
  return true;
}

// 读取系统环境变量 SHENTONG_MIDDLEWARE_MONGO_URI
function getSystemMongoUri() {
  return process.env.SHENTONG_MIDDLEWARE_MONGO_URI || '';
}

// 读取 .env.local 配置
function getEnvConfig() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    return { databaseUrl: null, tablePrefix: null, projectName: null };
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const dbMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
  const prefixMatch = envContent.match(/PROJECT_TABLE_PREFIX="([^"]+)"/);
  const projectNameMatch = envContent.match(/NEXT_PUBLIC_PROJECT_NAME="([^"]+)"/);

  return {
    databaseUrl: dbMatch ? dbMatch[1] : null,
    tablePrefix: prefixMatch ? prefixMatch[1] : null,
    projectName: projectNameMatch ? projectNameMatch[1] : null,
  };
}

// 更新 .env.local（先清空再重新赋值）
function updateEnvConfig(projectDirName, projectDisplayName, systemMongoUri) {
  const envPath = path.join(process.cwd(), '.env.local');

  // 读取现有内容
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }

  // 先清空变量的值（设置为空）
  log('\n📝 步骤1：清空现有配置变量...', 'blue');

  // 清空 DATABASE_URL
  if (envContent.includes('DATABASE_URL=')) {
    envContent = envContent.replace(/DATABASE_URL="[^"]*"/, 'DATABASE_URL=""');
    log('  已清空 DATABASE_URL', 'cyan');
  }

  // 清空 PROJECT_TABLE_PREFIX
  if (envContent.includes('PROJECT_TABLE_PREFIX=')) {
    envContent = envContent.replace(/PROJECT_TABLE_PREFIX="[^"]*"/, 'PROJECT_TABLE_PREFIX=""');
    log('  已清空 PROJECT_TABLE_PREFIX', 'cyan');
  }

  // 清空 NEXT_PUBLIC_PROJECT_NAME
  if (envContent.includes('NEXT_PUBLIC_PROJECT_NAME=')) {
    envContent = envContent.replace(/NEXT_PUBLIC_PROJECT_NAME="[^"]*"/, 'NEXT_PUBLIC_PROJECT_NAME=""');
    log('  已清空 NEXT_PUBLIC_PROJECT_NAME', 'cyan');
  }

  // 重新赋值
  log('\n📝 步骤2：根据环境重新赋值...', 'blue');

  // 确定 DATABASE_URL 值
  const databaseUrl = systemMongoUri || '';
  if (envContent.includes('DATABASE_URL=')) {
    envContent = envContent.replace(/DATABASE_URL=""/, `DATABASE_URL="${databaseUrl}"`);
  } else {
    envContent += `\n# MongoDB数据库连接（自动同步自系统环境变量）\nDATABASE_URL="${databaseUrl}"\n`;
  }
  log(`  DATABASE_URL="${databaseUrl.substring(0, 50)}..."`, 'cyan');

  // 确定 PROJECT_TABLE_PREFIX 值（使用目录名）
  if (envContent.includes('PROJECT_TABLE_PREFIX=')) {
    envContent = envContent.replace(/PROJECT_TABLE_PREFIX=""/, `PROJECT_TABLE_PREFIX="${projectDirName}"`);
  } else {
    envContent += `\n# 项目表名前缀（用于多项目数据隔离）\n# 生成的表名格式：{PROJECT_TABLE_PREFIX}-{table_name}\nPROJECT_TABLE_PREFIX="${projectDirName}"\n`;
  }
  log(`  PROJECT_TABLE_PREFIX="${projectDirName}"`, 'cyan');

  // 确定 NEXT_PUBLIC_PROJECT_NAME 值（使用用户指定的产品首页名称）
  if (envContent.includes('NEXT_PUBLIC_PROJECT_NAME=')) {
    envContent = envContent.replace(/NEXT_PUBLIC_PROJECT_NAME=""/, `NEXT_PUBLIC_PROJECT_NAME="${projectDisplayName}"`);
  } else {
    envContent += `\n# 产品首页名称配置（前端可访问）\nNEXT_PUBLIC_PROJECT_NAME="${projectDisplayName}"\n`;
  }
  log(`  NEXT_PUBLIC_PROJECT_NAME="${projectDisplayName}"`, 'cyan');

  // 写入文件
  fs.writeFileSync(envPath, envContent, 'utf-8');
  log('\n✅ 已更新 .env.local 配置', 'green');
}

// 更新 Dockerfile 中的 DATABASE_URL 配置
function updateDockerfileConfig(databaseUrl) {
  const dockerfilePaths = [
    path.join(process.cwd(), 'docker/Dockerfile'),
    path.join(process.cwd(), 'Dockerfile'),
  ];

  let dockerfilePath = null;
  for (const p of dockerfilePaths) {
    if (fs.existsSync(p)) {
      dockerfilePath = p;
      break;
    }
  }

  if (!dockerfilePath) {
    log('⚠️  Dockerfile 不存在，跳过更新', 'yellow');
    return false;
  }

  if (!databaseUrl) {
    log('⚠️  系统环境变量 SHENTONG_MIDDLEWARE_MONGO_URI 未设置，跳过 Dockerfile 更新', 'yellow');
    log('  Dockerfile 将使用默认 DATABASE_URL', 'cyan');
    return false;
  }

  let content = fs.readFileSync(dockerfilePath, 'utf-8');
  let updated = false;

  // 替换所有 ENV DATABASE_URL="..." 行
  const lines = content.split('\n');
  const newLines = lines.map(line => {
    if (line.match(/^\s*ENV\s+DATABASE_URL\s*=\s*["'].*["']\s*$/)) {
      updated = true;
      // 保持原有缩进
      const indent = line.match(/^(\s*)/)[1];
      return `${indent}ENV DATABASE_URL="${databaseUrl}"`;
    }
    return line;
  });

  if (updated) {
    content = newLines.join('\n');
    fs.writeFileSync(dockerfilePath, content, 'utf-8');
    log(`✅ 已更新 ${path.relative(process.cwd(), dockerfilePath)} 中的 DATABASE_URL`, 'green');
    log(`  DATABASE_URL="${databaseUrl.substring(0, 50)}..."`, 'cyan');
    return true;
  } else {
    log('⚠️  Dockerfile 中未找到 ENV DATABASE_URL 配置行', 'yellow');
    return false;
  }
}

// 重新生成 schema
function regenerateSchema() {
  log('\n🔄 重新生成 Prisma Schema...', 'blue');
  try {
    execSync('node scripts/generate-schema.js', { stdio: 'inherit' });
    log('✅ Schema 重新生成成功', 'green');
  } catch (error) {
    log('⚠️  Schema 生成跳过（可能脚本不存在）', 'yellow');
  }
}

// 主函数
async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🚀 az-init 自动配置脚本', 'cyan');
  log('='.repeat(60), 'cyan');

  // 解析命令行参数
  const args = parseArgs();

  // 1. 获取项目目录名
  const projectDirName = getDirectoryName();
  log(`\n📁 当前项目目录名：${projectDirName}`, 'blue');

  // 2. 读取现有 project.config.json（如果存在）
  const existingConfig = getProjectConfig();
  if (existingConfig) {
    log(`\n📋 当前 project.config.json：`, 'blue');
    log(`  productName: ${existingConfig.projectName || '未设置'}`, 'cyan');
    log(`  projectDir: ${existingConfig.projectDir || '未设置'}`, 'cyan');
  }

  // 3. 询问产品首页名称
  let projectDisplayName;
  if (args.projectName) {
    projectDisplayName = args.projectName;
    log(`\n📝 使用命令行参数指定的产品名称：${projectDisplayName}`, 'green');
  } else {
    // 检查是否在交互式终端中
    if (process.stdin.isTTY) {
      // 使用现有配置作为默认值
      const defaultName = existingConfig?.projectName || projectDirName;
      projectDisplayName = await askProjectDisplayName(defaultName);
    } else {
      // 非交互模式，使用现有配置或目录名作为默认值
      projectDisplayName = existingConfig?.projectName || projectDirName;
      log(`\n📝 非交互模式，使用默认产品名称：${projectDisplayName}`, 'yellow');
    }
  }

  // 4. 更新 project.config.json（主配置文件）
  log('\n📝 更新项目配置文件...', 'blue');
  updateProjectConfig(projectDirName, projectDisplayName);

  // 5. 读取系统环境变量
  const systemMongoUri = getSystemMongoUri();
  log(`\n🌐 系统环境变量 SHENTONG_MIDDLEWARE_MONGO_URI：`, 'blue');
  if (systemMongoUri) {
    log(`  ${systemMongoUri.substring(0, 60)}...`, 'cyan');
  } else {
    log('  ⚠️  未设置', 'yellow');
  }

  // 6. 读取当前配置
  const currentConfig = getEnvConfig();
  log(`\n📋 当前 .env.local 配置：`, 'blue');
  log(`  DATABASE_URL: ${currentConfig.databaseUrl ? currentConfig.databaseUrl.substring(0, 50) + '...' : '未设置'}`, 'cyan');
  log(`  PROJECT_TABLE_PREFIX: ${currentConfig.tablePrefix || '未设置'}`, 'cyan');
  log(`  NEXT_PUBLIC_PROJECT_NAME: ${currentConfig.projectName || '未设置'}`, 'cyan');

  // 7. 读取并更新 package.json
  const packageJson = getPackageJson();
  log(`\n📦 package.json 当前 name：${packageJson.name}`, 'blue');
  updatePackageJsonName(projectDirName);

  // 8. 更新 .env.local
  updateEnvConfig(projectDirName, projectDisplayName, systemMongoUri);

  // 9. 更新 Dockerfile 中的 DATABASE_URL
  log('\n🐳 Dockerfile 配置更新...', 'blue');
  updateDockerfileConfig(systemMongoUri);

  // 10. 重新生成 schema
  regenerateSchema();

  // 11. 总结
  log('\n' + '='.repeat(60), 'cyan');
  log('✅ az-init 自动配置完成！', 'green');
  log('='.repeat(60), 'cyan');
  log(`\n📋 最终配置：`, 'blue');
  log(`  项目目录名 (package.json name): ${projectDirName}`, 'green');
  log(`  产品首页名称 (NEXT_PUBLIC_PROJECT_NAME): ${projectDisplayName}`, 'green');
  log(`  表名前缀 (PROJECT_TABLE_PREFIX): ${projectDirName}`, 'green');
  log('\n📁 配置文件位置：', 'blue');
  log('  project.config.json - 主配置文件（上传到 Git）', 'cyan');
  log('  .env.local - 本地敏感配置（不上传）', 'cyan');
  log('  CI/CD Variables - 线上敏感配置（DATABASE_URL）', 'cyan');
  log('\n💡 提示：', 'blue');
  log('  - 所有数据库表将使用前缀：' + projectDirName + '-{table_name}', 'cyan');
  log('  - 产品名称将显示在：页面标题、登录页、导航栏等位置', 'cyan');
  log('  - 如果是全新项目，运行 npm run db:push 创建表', 'cyan');
  log('  - 如果需要迁移旧数据，请手动处理数据库表重命名', 'cyan');
  log('  - Dockerfile 中的 DATABASE_URL 已更新（从系统环境变量读取）', 'cyan');
}

main().catch(console.error);