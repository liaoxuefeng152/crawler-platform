/**
 * 字段配置与提取API
 * POST: 创建字段配置
 * PUT: 更新字段配置
 * DELETE: 删除字段配置
 * POST /extract: 执行AI字段提取
 */

import { NextRequest, NextResponse } from 'next/server';
import { MainFieldManager, SubFieldManager, generateId } from '@/lib/db/crawlDataManager';
import { CrawlTaskManager } from '@/lib/db/crawlDataManager';
import { extractFields } from '@/services/extractionService';

// 创建字段配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, taskId, mainFields } = body;

    // 如果是提取操作
    if (action === 'extract') {
      return handleExtraction(body);
    }

    // 创建字段配置
    if (!taskId || !mainFields || !Array.isArray(mainFields)) {
      return NextResponse.json({ error: '请提供任务ID和字段配置' }, { status: 400 });
    }

    // 检查任务是否存在
    const task = await CrawlTaskManager.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 });
    }

    const createdFields = [];

    for (const mf of mainFields) {
      if (!mf.fieldName || !mf.fieldDesc) {
        continue;
      }

      // 创建主字段
      const mainFieldId = generateId();
      const mainField = await MainFieldManager.create({
        fieldId: mainFieldId,
        fieldName: mf.fieldName,
        fieldDesc: mf.fieldDesc,
        taskId,
      });

      // 创建子字段
      const subFields = [];
      if (mf.subFields && Array.isArray(mf.subFields)) {
        for (const sf of mf.subFields) {
          if (!sf.fieldName || !sf.fieldDesc) {
            continue;
          }
          const subFieldId = generateId();
          const subField = await SubFieldManager.create({
            fieldId: subFieldId,
            fieldName: sf.fieldName,
            fieldDesc: sf.fieldDesc,
            mainFieldId,
            taskId,
          });
          subFields.push(subField);
        }
      }

      createdFields.push({
        ...mainField,
        subFields,
      });
    }

    return NextResponse.json({
      success: true,
      fields: createdFields,
    });
  } catch (error) {
    return NextResponse.json({
      error: '字段配置失败',
      message: (error as Error).message,
    }, { status: 500 });
  }
}

// 处理AI提取
async function handleExtraction(body: any) {
  const { taskId, mainFields, config } = body;

  if (!taskId || !mainFields) {
    return NextResponse.json({ error: '请提供任务ID和字段配置' }, { status: 400 });
  }

  // 获取任务的MD内容
  const task = await CrawlTaskManager.findById(taskId);
  if (!task || !task.mdContent) {
    return NextResponse.json({ error: '任务不存在或没有MD内容' }, { status: 404 });
  }

  try {
    // 调用AI提取
    const result = await extractFields(task.mdContent, mainFields, config || {});

    // 保存提取结果到数据库
    for (const field of result.fields) {
      // 查找或创建主字段
      const existingMainFields = await MainFieldManager.findByTaskId(taskId);
      let mainField = existingMainFields.find(f => f.fieldName === field.fieldName);

      if (!mainField) {
        const mainFieldId = generateId();
        mainField = await MainFieldManager.create({
          fieldId: mainFieldId,
          fieldName: field.fieldName,
          fieldDesc: `自动提取字段: ${field.fieldName}`,
          taskId,
          sourceMdPos: field.sourceMdPos,
        });
      }

      // 更新或创建子字段
      if (field.subFields) {
        for (const sf of field.subFields) {
          const existingSubFields = await SubFieldManager.findByMainFieldId(mainField.fieldId);
          let subField = existingSubFields.find(f => f.fieldName === sf.fieldName);

          if (subField) {
            await SubFieldManager.update(subField.fieldId, {
              extractValue: sf.value,
              sourceMdPos: sf.sourceMdPos,
              valueType: sf.valueType,
            });
          } else {
            const subFieldId = generateId();
            await SubFieldManager.create({
              fieldId: subFieldId,
              fieldName: sf.fieldName,
              fieldDesc: `自动提取子字段: ${sf.fieldName}`,
              mainFieldId: mainField.fieldId,
              taskId,
              extractValue: sf.value,
              sourceMdPos: sf.sourceMdPos,
              valueType: sf.valueType,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'AI提取失败',
      message: (error as Error).message,
    }, { status: 500 });
  }
}

// 获取字段配置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const fieldId = searchParams.get('fieldId');

    if (fieldId) {
      const field = await MainFieldManager.findById(fieldId);
      if (!field) {
        return NextResponse.json({ error: '字段不存在' }, { status: 404 });
      }
      const subFields = await SubFieldManager.findByMainFieldId(fieldId);
      return NextResponse.json({ field, subFields });
    }

    if (taskId) {
      const mainFields = await MainFieldManager.findByTaskId(taskId);
      const allSubFields = await SubFieldManager.findByTaskId(taskId);

      const fieldsWithSubFields = mainFields.map(mf => ({
        ...mf,
        subFields: allSubFields.filter(sf => sf.mainFieldId === mf.fieldId),
      }));

      return NextResponse.json({ fields: fieldsWithSubFields });
    }

    // 获取所有字段
    const mainFields = await MainFieldManager.findAll();
    const allSubFields = await SubFieldManager.findAll();

    const fieldsWithSubFields = mainFields.map(mf => ({
      ...mf,
      subFields: allSubFields.filter(sf => sf.mainFieldId === mf.fieldId),
    }));

    return NextResponse.json({ fields: fieldsWithSubFields });
  } catch (error) {
    return NextResponse.json({
      error: '获取字段配置失败',
      message: (error as Error).message,
    }, { status: 500 });
  }
}

// 删除字段配置
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fieldId = searchParams.get('fieldId');
    const taskId = searchParams.get('taskId');

    if (taskId) {
      // 删除任务的所有字段
      await SubFieldManager.deleteByTaskId(taskId);
      await MainFieldManager.deleteByTaskId(taskId);
      return NextResponse.json({ success: true, message: '已删除任务的所有字段' });
    }

    if (fieldId) {
      // 删除单个主字段及其子字段
      await SubFieldManager.deleteByMainFieldId(fieldId);
      await MainFieldManager.delete(fieldId);
      return NextResponse.json({ success: true, message: '字段已删除' });
    }

    return NextResponse.json({ error: '请提供字段ID或任务ID' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      error: '删除字段失败',
      message: (error as Error).message,
    }, { status: 500 });
  }
}