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

    const mainFields = await prisma.mainField.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
    });

    const subFields = await prisma.subField.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
    });

    // 组装完整的字段数据
    const fieldData = mainFields.map((mf) => ({
      fieldId: mf.fieldId,
      name: mf.name,
      description: mf.description,
      createdAt: mf.createdAt,
      subFields: subFields
        .filter((sf) => sf.parentFieldId === mf.fieldId)
        .map((sf) => ({
          subFieldId: sf.subFieldId,
          name: sf.name,
          description: sf.description,
          value: sf.value,
          valueType: sf.valueType,
          createdAt: sf.createdAt,
        })),
    }));

    return NextResponse.json({
      success: true,
      taskId,
      fields: fieldData,
      mainFieldCount: mainFields.length,
      subFieldCount: subFields.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}