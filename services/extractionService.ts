/**
 * AI字段提取服务
 * 调用 NewAPI 模型进行智能字段提取
 */

import axios from 'axios';

// NewAPI 配置
const NEWAPI_BASE_URL = process.env.NEWAPI_BASE_URL || 'https://newapi.dev.azshentong.com/v1';
const NEWAPI_API_KEY = process.env.NEWAPI_API_KEY || '';
const NEWAPI_MODEL = process.env.NEWAPI_MODEL || 'gpt-oss-120b';

export interface ExtractionConfig {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  timeout?: number;
  retries?: number;
  temperature?: number;
}

export interface FieldDefinition {
  fieldName: string;
  fieldDesc: string;
  subFields?: Array<{
    fieldName: string;
    fieldDesc: string;
  }>;
}

// 构建提取提示词
function buildExtractionPrompt(
  mdContent: string,
  fields: FieldDefinition[]
): string {
  const fieldsDesc = fields.map(f => {
    let desc = `- 主字段: "${f.fieldName}" - ${f.fieldDesc}`;
    if (f.subFields && f.subFields.length > 0) {
      desc += '\n  子字段:';
      f.subFields.forEach(sf => {
        desc += `\n  - "${sf.fieldName}" - ${sf.fieldDesc}`;
      });
    }
    return desc;
  }).join('\n');

  return `你是一个数据提取专家。请从以下 Markdown 内容中提取指定字段的值。

## 需要提取的字段

${fieldsDesc}

## Markdown 内容

${mdContent.substring(0, 8000)}

## 输出要求

请严格按照以下 JSON 格式输出提取结果，不要输出任何其他内容：

\`\`\`json
{
  "fields": [
    {
      "fieldName": "主字段名",
      "value": "提取的主字段值",
      "sourceMdPos": "在MD中的大致位置描述",
      "subFields": [
        {
          "fieldName": "子字段名",
          "value": "提取的子字段值",
          "sourceMdPos": "在MD中的大致位置描述",
          "valueType": "text/number/time/array"
        }
      ]
    }
  ]
}
\`\`\`

注意：
1. 如果某个字段在内容中找不到，value 设为 null
2. valueType 根据实际值判断：纯数字用 number，日期时间用 time，多个值用 array，其他用 text
3. 只输出 JSON，不要输出解释说明`;
}

// 调用 AI 提取
export async function extractFields(
  mdContent: string,
  fields: FieldDefinition[],
  config: ExtractionConfig = {}
): Promise<{
  fields: Array<{
    fieldName: string;
    value: string;
    sourceMdPos: string;
    subFields?: Array<{
      fieldName: string;
      value: string;
      sourceMdPos: string;
      valueType: string;
    }>;
  }>;
}> {
  const baseUrl = config.baseUrl || NEWAPI_BASE_URL;
  const apiKey = config.apiKey || NEWAPI_API_KEY;
  const model = config.model || NEWAPI_MODEL;
  const timeout = config.timeout || 60000;
  const retries = config.retries || 2;

  const prompt = buildExtractionPrompt(mdContent, fields);

  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的数据提取助手，擅长从文本中提取结构化信息。请严格按照要求的JSON格式输出。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: config.temperature || 0.1,
          max_tokens: 4096,
        },
        {
          timeout,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      const content = response.data?.choices?.[0]?.message?.content || '';

      // 提取JSON
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                        content.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('AI返回的内容中未找到有效的JSON格式');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const result = JSON.parse(jsonStr);

      return result;
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  throw lastError || new Error('字段提取失败');
}

export default {
  extractFields,
};