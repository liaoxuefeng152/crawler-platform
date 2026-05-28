import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";

const configSchema = z.object({
  taskId: z.string(),
  fields: z.array(
    z.object({
      name: z.string().min(1, "字段名不能为空"),
      description: z.string(),
      subFields: z
        .array(
          z.object({
            name: z.string().min(1, "子字段名不能为空"),
            description: z.string(),
          })
        )
        .optional(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = configSchema.parse(body);

    // 验证任务存在
    const task = await prisma.crawlerTask.findUnique({
      where: { taskId: validated.taskId },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: "任务不存在" },
        { status: 404 }
      );
    }

    // 保存字段配置（先删除旧配置）
    await prisma.mainField.deleteMany({
      where: { taskId: validated.taskId },
    });
    await prisma.subField.deleteMany({
      where: { taskId: validated.taskId },
    });

    // 创建新的字段配置
    for (let i = 0; i < validated.fields.length; i++) {
      const field = validated.fields[i];
      const fieldId = `${validated.taskId}_field_${i + 1}`;

      await prisma.mainField.create({
        data: {
          fieldId,
          name: field.name,
          description: field.description,
          taskId: validated.taskId,
        },
      });

      if (field.subFields && field.subFields.length > 0) {
        for (let j = 0; j < field.subFields.length; j++) {
          const subField = field.subFields[j];
          await prisma.subField.create({
            data: {
              subFieldId: `${fieldId}_sub_${j + 1}`,
              name: subField.name,
              description: subField.description,
              value: "",
              valueType: "text",
              parentFieldId: fieldId,
              taskId: validated.taskId,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "字段配置已保存",
      fieldCount: validated.fields.length,
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

    // 组装字段配置
    const fields = mainFields.map((mf) => ({
      fieldId: mf.fieldId,
      name: mf.name,
      description: mf.description,
      subFields: subFields
        .filter((sf) => sf.parentFieldId === mf.fieldId)
        .map((sf) => ({
          subFieldId: sf.subFieldId,
          name: sf.name,
          description: sf.description,
          value: sf.value,
          valueType: sf.valueType,
        })),
    }));

    return NextResponse.json({
      success: true,
      taskId,
      fields,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}