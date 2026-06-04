/**
 * 数据存储查看API
 * 查看MongoDB中的基础任务表、主字段表、子字段表
 */

import { NextRequest, NextResponse } from 'next/server';
import { CrawlTaskManager, MainFieldManager, SubFieldManager } from '@/lib/db/crawlDataManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table') || 'tasks';
    const taskId = searchParams.get('taskId');

    switch (table) {
      case 'tasks':
        if (taskId) {
          const task = await CrawlTaskManager.findById(taskId);
          if (!task) {
            return NextResponse.json({ error: '任务不存在' }, { status: 404 });
          }
          return NextResponse.json({ data: [task] });
        }
        const tasks = await CrawlTaskManager.findAll();
        return NextResponse.json({ data: tasks });

      case 'mainFields':
        if (taskId) {
          const fields = await MainFieldManager.findByTaskId(taskId);
          return NextResponse.json({ data: fields });
        }
        const allMainFields = await MainFieldManager.findAll();
        return NextResponse.json({ data: allMainFields });

      case 'subFields':
        if (taskId) {
          const fields = await SubFieldManager.findByTaskId(taskId);
          return NextResponse.json({ data: fields });
        }
        const allSubFields = await SubFieldManager.findAll();
        return NextResponse.json({ data: allSubFields });

      case 'relations':
        // 获取主字段和子字段的关联关系
        const mainFields = await MainFieldManager.findAll();
        const subFields = await SubFieldManager.findAll();

        const relations = mainFields.map(mf => ({
          mainField: mf,
          subFields: subFields.filter(sf => sf.mainFieldId === mf.fieldId),
        }));

        return NextResponse.json({ data: relations });

      default:
        return NextResponse.json({ error: '无效的表名' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      error: '数据查询失败',
      message: (error as Error).message,
    }, { status: 500 });
  }
}