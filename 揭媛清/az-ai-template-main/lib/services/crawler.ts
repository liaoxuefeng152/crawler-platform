/**
 * 爬虫服务模块
 * 支持网页抓取、HTML转Markdown、内容存储
 */

import TurndownService from "turndown";
import * as cheerio from "cheerio";

// 爬虫配置
interface CrawlerConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
  userAgent: string;
  requestInterval: number;
}

const defaultConfig: CrawlerConfig = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  requestInterval: 500,
};

// 爬取结果
interface CrawlResult {
  success: boolean;
  url: string;
  html?: string;
  markdown?: string;
  domain: string;
  error?: string;
  encoding?: string;
}

// 任务日志
interface TaskLog {
  timestamp: string;
  type: "info" | "success" | "error" | "warning";
  message: string;
  url?: string;
}

/**
 * 从URL提取域名
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/\./g, "_");
  } catch {
    return "unknown";
  }
}

/**
 * 自动检测网页编码
 */
function detectEncoding(contentType: string | null, buffer: Buffer): string {
  if (contentType) {
    const charsetMatch = contentType.match(/charset=([^;]+)/i);
    if (charsetMatch) {
      return charsetMatch[1].trim().toLowerCase();
    }
  }

  const htmlStr = buffer.toString("utf-8", 0, 1024);
  const metaCharsetMatch = htmlStr.match(/charset=["']?([^"'\s>]+)/i);
  if (metaCharsetMatch) {
    return metaCharsetMatch[1].trim().toLowerCase();
  }

  return "utf-8";
}

/**
 * 将Buffer按正确编码转换为字符串
 */
function decodeBuffer(buffer: Buffer, encoding: string): string {
  try {
    if (encoding === "gbk" || encoding === "gb2312") {
      const iconv = require("iconv-lite");
      return iconv.decode(buffer, encoding);
    }
    return buffer.toString(encoding as BufferEncoding);
  } catch {
    return buffer.toString("utf-8");
  }
}

/**
 * 配置Turndown服务（HTML转MD）
 */
function createTurndownService(): TurndownService {
  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });

  turndown.addRule("table", {
    filter: "table",
    replacement: (content: string) => {
      const $ = cheerio.load(`<table>${content}</table>`);
      const table = $("table").first();
      const rows = table.find("tr");

      if (rows.length === 0) return content;

      let md = "\n";
      rows.each((i: number, el: unknown) => {
        const cells = $(el).find("th, td");
        const cellContents: string[] = [];
        cells.each((_: number, cell: unknown) => {
          cellContents.push($(cell).text().trim() || " ");
        });
        md += `| ${cellContents.join(" | ")} |\n`;
        if (i === 0) {
          md += `| ${cellContents.map(() => "---").join(" | ")} |\n`;
        }
      });
      md += "\n";
      return md;
    },
  });

  turndown.addRule("removeScript", {
    filter: ["script", "style", "noscript", "iframe", "svg"],
    replacement: () => "",
  });

  turndown.addRule("removeAds", {
    filter: (node: TurndownService.Node) => {
      const className = (node as cheerio.Element).attribs?.class || "";
      const id = (node as cheerio.Element).attribs?.id || "";
      const adPatterns = /ad|ads|advertisement|banner|popup|modal|cookie|privacy/i;
      return adPatterns.test(className) || adPatterns.test(id);
    },
    replacement: () => "",
  });

  return turndown;
}

/**
 * 清理HTML内容，提取核心内容
 */
function cleanHtml(html: string): string {
  const $ = cheerio.load(html);

  $("script, style, noscript, iframe, svg, nav, footer, aside").remove();

  $("[class*='ad'], [class*='ads'], [class*='banner'], [class*='popup']").remove();
  $("[id*='ad'], [id*='ads'], [id*='banner'], [id*='popup']").remove();

  const mainContent =
    $("main, article, .content, .article, .post, #content, #article").first().html() ||
    $("body").html() ||
    "";

  return mainContent;
}

/**
 * 清理Markdown内容
 */
function cleanMarkdown(md: string): string {
  return md
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s+|\s+$/g, "")
    .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, "")
    .replace(/\[\]\(.*?\)/g, "");
}

/**
 * 抓取单个网页
 */
export async function fetchPage(
  url: string,
  config: Partial<CrawlerConfig> = {}
): Promise<CrawlResult> {
  const finalConfig = { ...defaultConfig, ...config };
  const domain = extractDomain(url);

  for (let attempt = 1; attempt <= finalConfig.retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": finalConfig.userAgent,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          "Accept-Encoding": "gzip, deflate",
          Connection: "keep-alive",
        },
        signal: AbortSignal.timeout(finalConfig.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      const buffer = Buffer.from(await response.arrayBuffer());
      const encoding = detectEncoding(contentType, buffer);
      const html = decodeBuffer(buffer, encoding);

      const cleanedHtml = cleanHtml(html);
      const turndown = createTurndownService();
      const markdown = cleanMarkdown(turndown.turndown(cleanedHtml));

      return {
        success: true,
        url,
        html,
        markdown,
        domain,
        encoding,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (attempt === finalConfig.retries) {
        return {
          success: false,
          url,
          domain,
          error: `抓取失败(${attempt}次重试后): ${errorMessage}`,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, finalConfig.retryDelay));
    }
  }

  return {
    success: false,
    url,
    domain,
    error: "未知错误",
  };
}

/**
 * 批量抓取网页
 */
export async function fetchPages(
  urls: string[],
  config: Partial<CrawlerConfig> = {},
  onProgress?: (log: TaskLog) => void
): Promise<CrawlResult[]> {
  const results: CrawlResult[] = [];
  const finalConfig = { ...defaultConfig, ...config };

  for (const url of urls) {
    onProgress?.({
      timestamp: new Date().toISOString(),
      type: "info",
      message: `开始抓取: ${url}`,
      url,
    });

    const result = await fetchPage(url, finalConfig);
    results.push(result);

    if (result.success) {
      onProgress?.({
        timestamp: new Date().toISOString(),
        type: "success",
        message: `抓取成功: ${url}`,
        url,
      });
    } else {
      onProgress?.({
        timestamp: new Date().toISOString(),
        type: "error",
        message: result.error || `抓取失败: ${url}`,
        url,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, finalConfig.requestInterval));
  }

  return results;
}

/**
 * 生成MD文件名
 */
export function generateMdFileName(taskId: string, domain: string): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19);
  return `${taskId}_${domain}_${timestamp}.md`;
}

/**
 * 合并多个页面的MD内容
 */
export function mergeMarkdownResults(results: CrawlResult[]): string {
  const successfulResults = results.filter((r) => r.success && r.markdown);

  if (successfulResults.length === 0) {
    return "# 无有效内容\n\n所有页面抓取失败。";
  }

  return successfulResults
    .map((result, index) => {
      const title = `## 来源: ${result.url}\n\n`;
      return title + result.markdown;
    })
    .join("\n\n---\n\n");
}

export type { CrawlResult, CrawlerConfig, TaskLog };