# 代码模式和模板参考

## 核心 API 路由模板

### 标准路由结构

文件位置：`app/api/[模块]/read-feishu/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchFeishuDocument, isFeishuConfigured } from '@/app/api/recruitment/lib/feishu-client';

/**
 * @route POST /api/[模块]/read-feishu
 * @description 读取飞书文档内容
 * @tags Feishu
 * @param {object} request.body - 请求体
 * @param {string} request.body.url - 飞书文档URL（支持 docx 和 wiki）
 * @returns {object} 200 - 读取成功 { success: true, data: { title, content, length } }
 * @returns {object} 400 - 请求参数错误
 * @returns {object} 500 - 服务器错误
 */

const RequestSchema = z.object({
  url: z.string().url('请提供有效的飞书文档链接'),
});

export async function POST(request: NextRequest) {
  try {
    // 检查配置
    if (!isFeishuConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FEISHU_NOT_CONFIGURED',
            message: '飞书凭证未配置，请联系管理员配置 FEISHU_APP_ID 和 FEISHU_APP_SECRET',
          },
        },
        { status: 500 }
      );
    }

    // 验证请求
    const body = await request.json();
    const validatedData = RequestSchema.parse(body);

    // 读取文档
    const content = await fetchFeishuDocument(validatedData.url);

    // 提取标题
    const lines = content.split('\n').filter(line => line.trim());
    const title = lines[0]?.trim() || '飞书文档';

    return NextResponse.json({
      success: true,
      data: {
        title,
        content,
        length: content.length,
      },
    });
  } catch (error: any) {
    console.error('[API] Feishu read error:', error);

    // 错误处理
    const errorMessage = error?.message || '读取文档失败';
    let errorCode = 'FEISHU_ERROR';

    if (errorMessage.startsWith('FEISHU_')) {
      errorCode = errorMessage.split(':')[0];
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage.includes(':')
            ? errorMessage.split(':').slice(1).join(':').trim()
            : errorMessage,
        },
      },
      { status: 400 }
    );
  }
}
```

## 复用的核心函数

### 函数列表

从 `app/api/recruitment/lib/feishu-client.ts` 复用：

1. **`isFeishuConfigured()`**
   - 检查飞书凭证是否配置
   - 返回 `boolean`

2. **`getFeishuTenantToken()`**
   - 获取飞书访问令牌
   - 自动缓存（2小时）
   - 返回 `Promise<string>`

3. **`fetchFeishuDocument(url: string)`**
   - 读取飞书文档内容
   - 支持 docx 和 wiki 类型
   - 自动识别 URL 类型
   - 返回 `Promise<string>` (Markdown 格式)

## 环境变量配置

### .env 文件格式

```env
# 飞书应用凭证
FEISHU_APP_ID=cli_xxxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 配置检查逻辑

```typescript
export function isFeishuConfigured(): boolean {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  // 检查是否存在且不是占位符
  const isValid = (value: string | undefined): boolean => {
    if (!value) return false;
    if (value.includes('your_') || value.includes('xxx')) return false;
    return value.length > 10;
  };

  return isValid(appId) && isValid(appSecret);
}
```

## 测试命令

### cURL 测试

```bash
# 测试文档读取
curl -X POST http://localhost:3000/api/test/feishu-read \
  -H "Content-Type: application/json" \
  -d '{"url":"https://xxx.feishu.cn/docx/DoXDsjBz5oxxxxx"}'

# 测试 Wiki 读取
curl -X POST http://localhost:3000/api/test/feishu-read \
  -H "Content-Type: application/json" \
  -d '{"url":"https://xxx.feishu.cn/wiki/LjGfwUvodiDqMKkhsBQcBamZnch"}'
```

### 使用现有测试接口

访问：`http://localhost:3000/api/test/feishu-read`

POST 请求体：
```json
{
  "url": "飞书文档链接"
}
```

## 文档转换规则

### Block 类型到 Markdown

```typescript
const blockTypeToMarkdown = {
  // 标题
  'heading1': (text) => `# ${text}\n\n`,
  'heading2': (text) => `## ${text}\n\n`,
  'heading3': (text) => `### ${text}\n\n`,

  // 列表
  'bullet': (text) => `- ${text}\n`,
  'ordered': (text, num) => `${num}. ${text}\n`,

  // 文本
  'text': (text) => `${text}\n`,

  // 代码
  'code': (text, lang = '') => `\`\`\`${lang}\n${text}\n\`\`\`\n\n`,

  // 引用
  'quote': (text) => `> ${text}\n\n`,

  // 分割线
  'divider': () => `---\n\n`,
};
```

### 表格转换

```typescript
function convertTable(rows: any[]): string {
  if (!rows || rows.length === 0) return '';

  let markdown = '';

  // 表头
  const header = rows[0].cells.map(cell => cell.text).join(' | ');
  markdown += `| ${header} |\n`;

  // 分隔线
  markdown += `| ${rows[0].cells.map(() => '---').join(' | ')} |\n`;

  // 数据行
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].cells.map(cell => cell.text).join(' | ');
    markdown += `| ${row} |\n`;
  }

  return markdown + '\n';
}
```

## 错误处理模式

### 标准错误响应格式

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
```

### 错误码定义

```typescript
const ErrorCodes = {
  FEISHU_NOT_CONFIGURED: '飞书凭证未配置',
  FEISHU_INVALID_URL: '无法从链接中提取文档 ID',
  FEISHU_NO_PERMISSION: '无权限访问该文档',
  FEISHU_DOC_NOT_FOUND: '文档不存在或已删除',
  FEISHU_WIKI_NO_PERMISSION: '无权限访问该 Wiki 文档',
  FEISHU_WIKI_NOT_FOUND: 'Wiki 文档不存在或已删除',
  FEISHU_EMPTY_DOC: '文档内容为空',
} as const;
```

### 友好错误提示

```typescript
function getUserFriendlyError(error: any): string {
  const errorCode = error?.code || error?.message?.split(':')[0];

  const errorMessages = {
    '99991663': '您没有权限访问此文档。请确认文档已分享给飞书应用。',
    '99991661': '文档不存在或已被删除。请检查文档链接是否正确。',
    '99991672': '您没有权限访问此 Wiki。请检查 Wiki 权限配置。',
    '99991673': 'Wiki 文档不存在。请确认 Wiki token 是否正确。',
  };

  return errorMessages[errorCode] || '读取文档时发生错误，请稍后重试。';
}
```

## 前端集成示例

### React 组件使用

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function FeishuReader() {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRead = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/feishu-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        setContent(data.data.content);
      } else {
        alert(data.error.message);
      }
    } catch (error) {
      alert('读取失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="输入飞书文档链接"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button onClick={handleRead} disabled={loading}>
        {loading ? '读取中...' : '读取文档'}
      </Button>
      {content && <pre className="whitespace-pre-wrap">{content}</pre>}
    </div>
  );
}
```
