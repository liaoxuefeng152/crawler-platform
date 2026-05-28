import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "缺少taskId参数" },
        { status: 400 }
      );
    }

    const task = await prisma.crawlerTask.findUnique({
      where: { taskId },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: "任务不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      taskId: task.taskId,
      mdContent: task.mdContent || "",
      mdFileName: task.mdFileName,
      mdFilePath: task.mdFilePath,
      urls: JSON.parse(task.urls),
      status: task.status,
      createdAt: task.createdAt,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}