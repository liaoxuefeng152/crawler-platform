import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { fetchPages, generateMdFileName, mergeMarkdownResults } from "@/lib/services/crawler";

const startSchema = z.object({
  urls: z.array(z.string().url()).min(1, "至少输入一个有效网址"),
  taskId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = startSchema.parse(body);

    const taskId = validated.taskId || `task_${Date.now()}`;

    // 创建任务记录
    const task = await prisma.crawlerTask.create({
      data: {
        taskId,
        urls: JSON.stringify(validated.urls),
        status: "running",
        logs: JSON.stringify([
          {
            timestamp: new Date().toISOString(),
            type: "info",
            message: `任务创建成功，共 ${validated.urls.length} 个网址`,
          },
        ]),
      },
    });

    // 异步执行爬取
    const logs: { timestamp: string; type: string; message: string; url?: string }[] = [
      {
        timestamp: new Date().toISOString(),
        type: "info",
        message: `任务创建成功，共 ${validated.urls.length} 个网址`,
      },
    ];

    try {
      const results = await fetchPages(validated.urls, {}, (log) => {
        logs.push(log);
      });

      const mergedMd = mergeMarkdownResults(results);
      const domain = validated.urls.length === 1
        ? new URL(validated.urls[0]).hostname.replace(/\./g, "_")
        : "multiple";
      const mdFileName = generateMdFileName(taskId, domain);

      const successCount = results.filter((r) => r.success).length;
      logs.push({
        timestamp: new Date().toISOString(),
        type: "success",
        message: `爬取完成: 成功 ${successCount}/${results.length}`,
      });

      await prisma.crawlerTask.update({
        where: { taskId },
        data: {
          status: successCount > 0 ? "completed" : "failed",
          mdContent: mergedMd,
          mdFileName,
          mdFilePath: `/md/${mdFileName}`,
          logs: JSON.stringify(logs),
          completedAt: new Date(),
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logs.push({
        timestamp: new Date().toISOString(),
        type: "error",
        message: `爬取失败: ${errorMessage}`,
      });

      await prisma.crawlerTask.update({
        where: { taskId },
        data: {
          status: "failed",
          logs: JSON.stringify(logs),
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      taskId,
      message: "爬取任务已启动",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}