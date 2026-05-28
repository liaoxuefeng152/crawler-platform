import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { extractFields } from "@/lib/services/extractor";

const extractSchema = z.object({
  taskId: z.string(),
  apiConfig: z
    .object({
      apiUrl: z.string().url().optional(),
      apiKey: z.string().optional(),
      model: z.string().optional(),
      timeout: z.number().optional(),
      maxRetries: z.number().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = extractSchema.parse(body);

    // 获取任务和MD内容
    const task = await prisma.crawlerTask.findUnique({
      where: { taskId: validated.taskId },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: "任务不存在" },
        { status: 404 }
      );
    }

    if (!task.mdContent) {
      return NextResponse.json(
        { success: false, error: "该任务没有MD内容，请先完成爬取" },
        { status: 400 }
      );
    }

    // 获取字段配置
    const mainFields = await prisma.mainField.findMany({
      where: { taskId: validated.taskId },
      orderBy: { createdAt: "asc" },
    });

    const subFields = await prisma.subField.findMany({
      where: { taskId: validated.taskId },
      orderBy: { createdAt: "asc" },
    });

    if (mainFields.length === 0) {
      return NextResponse.json(
        { success: false, error: "请先配置字段" },
        { status: 400 }
      );
    }

    // 组装字段配置
    const fields = mainFields.map((mf) => ({
      name: mf.name,
      description: mf.description || "",
      subFields: subFields
        .filter((sf) => sf.parentFieldId === mf.fieldId)
        .map((sf) => ({
          name: sf.name,
          description: sf.description || "",
        })),
    }));

    // 执行提取
    const results = await extractFields(
      validated.taskId,
      task.mdContent,
      fields,
      validated.apiConfig || {}
    );

    // 更新子字段的提取值
    for (const result of results) {
      if (result.success && result.fieldData.subFields) {
        for (const subField of result.fieldData.subFields) {
          await prisma.subField.update({
            where: { subFieldId: subField.subFieldId },
            data: {
              value: subField.value,
              valueType: subField.valueType,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "字段提取完成",
      results,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}