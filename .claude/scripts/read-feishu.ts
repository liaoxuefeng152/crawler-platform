/**
 * 飞书文档读取脚本
 * 用法: npx tsx .claude/scripts/read-feishu.ts <文档URL>
 */

import { fetchFeishuDocument, isFeishuConfigured } from '../../app/api/recruitment/lib/feishu-client';

async function main() {
  const url = process.argv[2];

  if (!url) {
    console.error('❌ 请提供飞书文档URL');
    console.log('用法: npx tsx .claude/scripts/read-feishu.ts <文档URL>');
    process.exit(1);
  }

  console.log('🔍 正在读取飞书文档...');
  console.log('📄 文档URL:', url);
  console.log('');

  try {
    // 检查配置
    if (!isFeishuConfigured()) {
      console.error('❌ 飞书凭证未配置');
      console.log('请在 .env 文件中配置 FEISHU_APP_ID 和 FEISHU_APP_SECRET');
      process.exit(1);
    }

    // 读取文档
    const content = await fetchFeishuDocument(url);

    // 提取标题
    const lines = content.split('\n').filter((line) => line.trim());
    const title = lines[0]?.replace(/^#+\s*/, '') || '飞书文档';

    console.log('✅ 文档读取成功！');
    console.log('📋 标题:', title);
    console.log('📏 内容长度:', content.length, '字符');
    console.log('');
    console.log('---');
    console.log('');
    console.log(content);
    console.log('');
    console.log('---');
    console.log('✅ 文档读取完成');

  } catch (error: any) {
    console.error('❌ 读取文档失败');
    console.error('错误信息:', error.message);
    process.exit(1);
  }
}

main();
