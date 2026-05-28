/**
 * AI 字段提取服务模块
 * 调用 NewAPI 模型进行智能字段提取
 */

import prisma from "@/lib/db/prisma";

// AI API 配置
interface AiApiConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
  timeout: number;
  maxRetries: number;
}

// 默认配置
const defaultAiConfig: AiApiConfig = {
  apiUrl: "https://newapi.dev.azshentong.com/v1/chat/completions",
  apiKey: "sk-s7U79khywzqVC6CDBAu52Pnqn3UzN56YXwB9h3kYhFDawn7I",
  model: "gpt-oss-120b",
  timeout: 60000,
  maxRetries: 3,
};

// 字段配置
interface FieldConfig {
  name: string;
  description: string;
  subFields?: SubFieldConfig[];
}

interface SubFieldConfig {
  name: string;
  description: string;
}

// 提取结果
interface ExtractionResult {
  success: boolean;
  taskId: string;
  mainFieldId: string;
  fieldData: {
    name: string;
    description: string;
    value?: string;
    subFields?: {
      subFieldId: string;
      name: string;
      description: string;
      value: string;
      valueType: string;
      mdPosition?: string;
    }[];
  };
  error?: string;
}

/**
 * 判断值类型
 */
function determineValueType(value: string): string {
  if (!value || value.trim() === "") return "text";

  // 检查是否为数字
  if (/^-?\d+(\.\d+)?$/.test(value.trim())) return "number";

  // 检查是否为日期时间格式
  const datePatterns = [
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/,
    /^\d{1,2}[-/]\d{1,2}[-/]\d{4}/,
    /\d{4}年\d{1,2}月\d{1,2}日/,
  ];
  if (datePatterns.some((p) => p.test(value))) return "time";

  // 检查是否为数组（逗号分隔或JSON数组）
  if (value.includes(",") || /^\[.*\]$/.test(value)) return "array";

  return "text";
}

/**
 * 调用 AI API
 */
async function callAiApi(
  prompt: string,
  config: Partial<AiApiConfig> = {}
): Promise<string> {
  const finalConfig = { ...defaultAiConfig, ...config };

  for (let attempt = 1; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      const response = await fetch(finalConfig.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${finalConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: finalConfig.model,
          messages: [
            {
              role: "system",
              content:
                "你是一个专业的数据提取助手。请根据用户提供的字段描述，从Markdown内容中精准提取对应的字段值。输出格式必须是严格的JSON，不要包含任何其他文字说明。",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 4096,
        }),
        signal: AbortSignal.timeout(finalConfig.timeout),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API请求失败: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      return content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (attempt === finalConfig.maxRetries) {
        throw new Error(`AI API调用失败(${attempt}次重试后): ${errorMessage}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error("AI API调用失败");
}

/**
 * 构建提取提示词
 */
function buildExtractionPrompt(
  mdContent: string,
  fields: FieldConfig[]
): string {
  const fieldDescriptions = fields
    .map((field, index) => {
      const subFieldDesc =
        field.subFields && field.subFields.length > 0
          ? `\n  子字段: ${field.subFields
              .map((sf) => `- ${sf.name}: ${sf.description}`)
              .join("\n  ")}`
          : "";

      return `${index + 1}. 主字段 "${field.name}": ${field.description}${subFieldDesc}`;
    })
    .join("\n");

  const expectedOutput = fields
    .map((field) => {
      const subFieldOutput =
        field.subFields && field.subFields.length > 0
          ? `, "subFields": [${field.subFields
              .map(
                (sf) =>
                  `{"name": "${sf.name}", "value": "提取值", "valueType": "类型"}`
              )
              .join(", ")}]`
          : "";

      return `{"name": "${field.name}", "value": "提取值"${subFieldOutput}}`;
    })
    .join(",\n  ");

  return `
请从以下Markdown内容中提取指定的字段值。

# Markdown内容:
${mdContent.slice(0, 8000)}

# 需要提取的字段:
${fieldDescriptions}

# 输出要求:
1. 请返回一个JSON数组，格式如下:
[
  ${expectedOutput}
]

2. 如果某个字段在内容中找不到，value设为null
3. valueType可能的值为: text, number, time, array
4. 请精准提取，不要添加任何推测内容
5. 只返回JSON数组，不要有任何其他文字说明
`;
}

/**
 * 解析AI返回的JSON
 */
function parseAiResponse(response: string): unknown[] {
  try {
    // 尝试直接解析
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // 尝试从markdown代码块中提取
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1].trim());
    }

    throw new Error("无法从AI响应中提取有效JSON");
  } catch (error) {
    throw new Error(`JSON解析失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 执行字段提取
 */
export async function extractFields(
  taskId: string,
  mdContent: string,
  fields: FieldConfig[],
  config: Partial<AiApiConfig> = {}
): Promise<ExtractionResult[]> {
  const results: ExtractionResult[] = [];

  const prompt = buildExtractionPrompt(mdContent, fields);
  const aiResponse = await callAiApi(prompt, config);
  const extractedData = parseAiResponse(aiResponse);

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const mainFieldId = `${taskId}_field_${i + 1}`;
    const extractedField = (extractedData as Record<string, unknown>[])[i] || {};

    const result: ExtractionResult = {
      success: true,
      taskId,
      mainFieldId,
      fieldData: {
        name: field.name,
        description: field.description,
        value:
          typeof extractedField.value === "string"
            ? extractedField.value
            : String(extractedField.value || ""),
        subFields: [],
      },
    };

    // 处理子字段
    if (field.subFields && field.subFields.length > 0 && extractedField.subFields) {
      const subFieldsArray = extractedField.subFields as Record<string, unknown>[];
      for (let j = 0; j < field.subFields.length; j++) {
        const subField = field.subFields[j];
        const extractedSubField = subFieldsArray[j] || {};
        const subFieldValue =
          typeof extractedSubField.value === "string"
            ? extractedSubField.value
            : String(extractedSubField.value || "");

        result.fieldData.subFields?.push({
          subFieldId: `${mainFieldId}_sub_${j + 1}`,
          name: subField.name,
          description: subField.description,
          value: subFieldValue,
          valueType: determineValueType(subFieldValue),
        });
      }
    }

    results.push(result);
  }

  return results;
}

/**
 * 保存提取结果到数据库
 */
export async function saveExtractionResults(results: ExtractionResult[]): Promise<void> {
  for (const result of results) {
    if (!result.success) continue;

    // 保存主字段
    await prisma.mainField.create({
      data: {
        fieldId: result.mainFieldId,
        name: result.fieldData.name,
        description: result.fieldData.description,
        taskId: result.taskId,
      },
    });

    // 保存子字段
    if (result.fieldData.subFields && result.fieldData.subFields.length > 0) {
      for (const subField of result.fieldData.subFields) {
        await prisma.subField.create({
          data: {
            subFieldId: subField.subFieldId,
            name: subField.name,
            description: subField.description,
            value: subField.value,
            valueType: subField.valueType,
            parentFieldId: result.mainFieldId,
            taskId: result.taskId,
          },
        });
      }
    }
  }
}

/**
 * 获取任务的所有字段数据
 */
export async function getTaskFieldData(taskId: string) {
  const mainFields = await prisma.mainField.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
  });

  const subFields = await prisma.subField.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
  });

  return {
    mainFields,
    subFields,
    mainFieldCount: mainFields.length,
    subFieldCount: subFields.length,
  };
}

export type { AiApiConfig, FieldConfig, SubFieldConfig, ExtractionResult };