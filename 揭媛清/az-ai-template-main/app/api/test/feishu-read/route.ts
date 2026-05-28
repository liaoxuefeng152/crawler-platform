import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchFeishuDocument, isFeishuConfigured } from '@/app/api/recruitment/lib/feishu-client';

/**
 * @route POST /api/test/feishu-read
 * @description 读取飞书文档内容（测试接口）
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
            message: '飞书凭证未配置，请联系管理员',
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
    const lines = content.split('\n').filter((line) => line.trim());
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
          message: errorMessage.includes(':') ? errorMessage.split(':').slice(1).join(':').trim() : errorMessage,
        },
      },
      { status: 400 }
    );
  }
}
