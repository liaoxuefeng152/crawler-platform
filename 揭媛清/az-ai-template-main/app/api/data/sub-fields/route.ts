import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    const parentFieldId = searchParams.get("parentFieldId");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where: Record<string, string | undefined> = {};
    if (taskId) where.taskId = taskId;
    if (parentFieldId) where.parentFieldId = parentFieldId;

    const total = await prisma.subField.count({ where });

    const fields = await prisma.subField.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({
      success: true,
      data: fields.map((f) => ({
        id: f.id,
        subFieldId: f.subFieldId,
        name: f.name,
        description: f.description,
        value: f.value,
        valueType: f.valueType,
        parentFieldId: f.parentFieldId,
        taskId: f.taskId,
        mdPosition: f.mdPosition,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      })),
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}