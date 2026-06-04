/**
 * 爬虫服务
 * 支持网页爬取、MD格式转换、反爬处理
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

// 配置类型
interface CrawlConfig {
  timeout?: number;
  retries?: number;
  delay?: number;
  userAgent?: string;
}

// 默认配置
const defaultConfig: CrawlConfig = {
  timeout: 30000,
  retries: 3,
  delay: 1000,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

// 从URL提取域名
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/\./g, '_');
  } catch {
    return 'unknown';
  }
}

// 网页爬取
export async function crawlPage(
  url: string,
  config: CrawlConfig = {}
): Promise<{ html: string; encoding: string }> {
  const finalConfig = { ...defaultConfig, ...config };
  let lastError: Error | null = null;

  for (let i = 0; i < finalConfig.retries!; i++) {
    try {
      const response = await axios.get(url, {
        timeout: finalConfig.timeout,
        headers: {
          'User-Agent': finalConfig.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
        },
        responseType: 'arraybuffer',
      });

      // 自动检测编码
      const contentType = response.headers['content-type'] || '';
      let encoding = 'utf-8';
      if (contentType.includes('charset=')) {
        const charsetMatch = contentType.match(/charset=([^;]+)/i);
        if (charsetMatch) {
          encoding = charsetMatch[1].toLowerCase();
        }
      }

      // 转换编码
      const html = encoding === 'utf-8'
        ? response.data.toString('utf-8')
        : Buffer.from(response.data, encoding as BufferEncoding).toString('utf-8');

      return { html, encoding };
    } catch (error) {
      lastError = error as Error;
      if (i < finalConfig.retries! - 1 && finalConfig.delay) {
        await new Promise(resolve => setTimeout(resolve, finalConfig.delay));
      }
    }
  }

  throw lastError || new Error('爬取失败');
}

// HTML转换为Markdown
export function htmlToMarkdown(html: string, url: string): string {
  const $ = cheerio.load(html);

  // 移除广告、脚本、样式等无关内容
  $('script, style, nav, footer, aside, .advertisement, .ad, .ads, [class*="sidebar"]').remove();
  $('iframe, embed, object').remove();
  $('[style*="display:none"], [style*="visibility:hidden"]').remove();

  // 获取主要内容区域
  let content = '';
  const mainSelectors = ['article', 'main', '.content', '.article-content', '.post-content', '#content', '#main'];
  for (const selector of mainSelectors) {
    const el = $(selector);
    if (el.length && el.text().trim().length > 200) {
      content = el.html() || '';
      break;
    }
  }
  if (!content) {
    content = $('body').html() || '';
  }

  // 重新加载清理后的内容
  const $content = cheerio.load(content);

  // 提取标题
  let title = '';
  const titleSelectors = ['h1', '.title', '.article-title', '#title', 'title'];
  for (const selector of titleSelectors) {
    const el = $content(selector).first();
    if (el.length && el.text().trim()) {
      title = el.text().trim();
      break;
    }
  }
  if (!title) {
    title = $('title').text().trim() || extractDomain(url);
  }

  // 转换为Markdown
  let markdown = `# ${title}\n\n`;
  markdown += `> 来源: ${url}\n`;
  markdown += `> 爬取时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

  // 处理内容
  const processNode = (node: any): string => {
    const $node = $(node);
    const tagName = node.tagName?.toLowerCase();

    // 跳过空节点
    if (!$node.text().trim()) return '';

    // 处理标题
    if (tagName && /^h[1-6]$/.test(tagName)) {
      const level = parseInt(tagName.charAt(1));
      const hashes = '#'.repeat(level);
      return `\n${hashes} ${$node.text().trim()}\n\n`;
    }

    // 处理段落
    if (tagName === 'p') {
      return `${$node.text().trim()}\n\n`;
    }

    // 处理列表
    if (tagName === 'ul' || tagName === 'ol') {
      const items = $node.children('li').map((_, li) => {
        const text = $(li).text().trim();
        return tagName === 'ul' ? `- ${text}` : `1. ${text}`;
      }).get();
      return `\n${items.join('\n')}\n\n`;
    }

    // 处理表格
    if (tagName === 'table') {
      const rows = $node.find('tr').map((_, tr) => {
        const cells = $(tr).find('th, td').map((_, cell) => {
          return $(cell).text().trim().replace(/\|/g, '\\|');
        }).get();
        return cells.join(' | ');
      }).get();

      if (rows.length === 0) return '';

      // 添加表头分隔
      const headerRow = rows[0];
      const separator = headerRow.split(' | ').map(() => '---').join(' | ');

      return `\n| ${headerRow} |\n| ${separator} |\n${rows.slice(1).map(r => `| ${r} |`).join('\n')}\n\n`;
    }

    // 处理链接
    if (tagName === 'a') {
      const href = $node.attr('href') || '';
      const text = $node.text().trim();
      if (href && text) {
        return `[${text}](${href})`;
      }
      return text;
    }

    // 处理图片
    if (tagName === 'img') {
      const src = $node.attr('src') || '';
      const alt = $node.attr('alt') || '图片';
      if (src) {
        return `![${alt}](${src})`;
      }
      return '';
    }

    // 处理代码块
    if (tagName === 'pre') {
      const code = $node.find('code').text() || $node.text();
      return `\n\`\`\`\n${code.trim()}\n\`\`\`\n\n`;
    }

    // 处理内联代码
    if (tagName === 'code') {
      return `\`${$node.text().trim()}\``;
    }

    // 处理引用
    if (tagName === 'blockquote') {
      const lines = $node.text().trim().split('\n');
      return `\n${lines.map(l => `> ${l}`).join('\n')}\n\n`;
    }

    // 处理strong/em
    if (tagName === 'strong' || tagName === 'b') {
      return `**${$node.text().trim()}**`;
    }
    if (tagName === 'em' || tagName === 'i') {
      return `*${$node.text().trim()}*`;
    }

    // 处理br
    if (tagName === 'br') {
      return '\n';
    }

    // 处理div/span，提取文本
    if (tagName === 'div' || tagName === 'span' || tagName === 'section') {
      const text = $node.text().trim();
      if (text.length > 50) {
        return `${text}\n\n`;
      }
      return text;
    }

    return $node.text().trim();
  };

  // 遍历所有节点
  $content.root().children().each((_, node) => {
    markdown += processNode(node);
  });

  // 清理多余空行
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

  return markdown;
}

// 执行爬取任务
export async function executeCrawl(
  urls: string[],
  config: CrawlConfig = {}
): Promise<{ taskId: string; results: Array<{ url: string; success: boolean; markdown?: string; error?: string; domain: string }> }> {
  const taskId = `crawl_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const results = [];

  for (const url of urls) {
    try {
      const { html } = await crawlPage(url, config);
      const markdown = htmlToMarkdown(html, url);
      const domain = extractDomain(url);

      results.push({
        url,
        success: true,
        markdown,
        domain,
      });
    } catch (error) {
      results.push({
        url,
        success: false,
        error: (error as Error).message,
        domain: extractDomain(url),
      });
    }
  }

  return { taskId, results };
}

export default {
  crawlPage,
  htmlToMarkdown,
  executeCrawl,
  extractDomain,
};