/**
 * 爬虫API路由
 * POST: 创建爬取任务
 * GET: 获取任务列表
 */

import { NextRequest, NextResponse } from 'next/server';
import { CrawlTaskManager, generateId } from '@/lib/db/crawlDataManager';
import { executeCrawl, extractDomain } from '@/services/crawlService';

// 爬取任务状态管理
const taskStatusMap = new Map<string, { status: string; logs: string }>();

// 创建爬取任务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls, config } = body;

    if (!urls || (typeof urls === 'string' && !urls.trim()) || (Array.isArray(urls) && urls.length === 0)) {
      return NextResponse.json({ error: '请提供要爬取的网址' }, { status: 400 });
    }

    // 解析URL列表
    let urlList: string[];
    if (typeof urls === 'string') {
      urlList = urls.split('\n').map(u => u.trim()).filter(u => u);
    } else {
      urlList = urls;
    }

    // 验证URL格式
    const validUrls = urlList.filter(u => {
      try {
        new URL(u);
        return true;
      } catch {
        return false;
      }
    });

    if (validUrls.length === 0) {
      return NextResponse.json({ error: '没有有效的网址' }, { status: 400 });
    }

    // 生成任务ID
    const taskId = generateId();

    // 创建任务记录
    const task = await CrawlTaskManager.create({
      taskId,
      urls: validUrls.join('\n'),
      status: 'running',
    });

    // 执行爬取（异步）
    const crawlPromise = executeCrawl(validUrls, config || {}).then(async (result) => {
      const successResults = result.results.filter(r => r.success);
      const combinedMd = successResults.map(r => r.markdown).join('\n\n---\n\n');

      // 生成文件名
      const domains = successResults.map(r => r.domain).join('_');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const fileName = `${taskId}_${domains}_${timestamp}.md`;

      // 更新任务状态
      const logs = result.results.map(r =>
        r.success
          ? `[成功] ${r.url} -> 已转换为MD格式`
          : `[失败] ${r.url} -> ${r.error}`
      ).join('\n');

      await CrawlTaskManager.update(taskId, {
        status: 'completed',
        mdContent: combinedMd,
        mdFileName: fileName,
        mdFilePath: `/data/crawl/${fileName}`,
        domain: domains,
        logs,
      });

      taskStatusMap.set(taskId, { status: 'completed', logs });
    }).catch(async (error) => {
      await CrawlTaskManager.update(taskId, {
        status: 'failed',
        logs: `爬取失败: ${(error as Error).message}`,
      });
      taskStatusMap.set(taskId, { status: 'failed', logs: (error as Error).message });
    });

    // 等待爬取完成（最多60秒）
    await Promise.race([
      crawlPromise,
      new Promise(resolve => setTimeout(resolve, 60000)),
    ]);

    // 获取最终状态
    const finalTask = await CrawlTaskManager.findById(taskId);

    return NextResponse.json({
      success: true,
      taskId,
      status: finalTask?.status,
      logs: finalTask?.logs,
      mdContent: finalTask?.mdContent,
      mdFileName: finalTask?.mdFileName,
    });
  } catch (error) {
    return NextResponse.json({
      error: '爬取任务创建失败',
      message: (error as Error).message,
    }, { status: 500 });
  }
}

// 获取任务列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (taskId) {
      const task = await CrawlTaskManager.findById(taskId);
      if (!task) {
        return NextResponse.json({ error: '任务不存在' }, { status: 404 });
      }
      return NextResponse.json({ task });
    }

    const tasks = await CrawlTaskManager.findAll();
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json({
      error: '获取任务列表失败',
      message: (error as Error).message,
    }, { status: 500 });
  }
}

// 删除任务
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: '请提供任务ID' }, { status: 400 });
    }

    await CrawlTaskManager.delete(taskId);
    return NextResponse.json({ success: true, message: '任务已删除' });
  } catch (error) {
    return NextResponse.json({
      error: '删除任务失败',
      message: (error as Error).message,
    }, { status: 500 });
  }
}