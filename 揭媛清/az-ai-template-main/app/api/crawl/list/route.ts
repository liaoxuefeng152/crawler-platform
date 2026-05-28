import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const status = searchParams.get("status");

    const where = status ? { status } : {};

    const total = await prisma.crawlerTask.count({ where });

    const tasks = await prisma.crawlerTask.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({
      success: true,
      tasks: tasks.map((t) => ({
        taskId: t.taskId,
        urls: JSON.parse(t.urls),
        status: t.status,
        mdFileName: t.mdFileName,
        createdAt: t.createdAt,
        completedAt: t.completedAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}