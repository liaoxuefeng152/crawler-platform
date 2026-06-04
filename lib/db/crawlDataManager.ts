/**
 * 爬虫数据管理器
 * 管理爬虫任务、主字段、子字段的数据访问
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 生成唯一ID
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

// ============================================
// 爬虫任务管理
// ============================================

export interface CrawlTaskCreate {
  taskId: string;
  urls: string;
  status?: string;
  mdFilePath?: string;
  mdFileName?: string;
  domain?: string;
  crawlTime?: Date;
  mdContent?: string;
  logs?: string;
}

export interface CrawlTaskUpdate {
  status?: string;
  mdFilePath?: string;
  mdFileName?: string;
  domain?: string;
  mdContent?: string;
  logs?: string;
}

export const CrawlTaskManager = {
  async create(data: CrawlTaskCreate) {
    return prisma.crawlTask.create({
      data: {
        taskId: data.taskId,
        urls: data.urls,
        status: data.status || 'pending',
        mdFilePath: data.mdFilePath || '',
        mdFileName: data.mdFileName || '',
        domain: data.domain || '',
        crawlTime: data.crawlTime || new Date(),
        mdContent: data.mdContent || '',
        logs: data.logs || '',
      },
    });
  },

  async findById(taskId: string) {
    return prisma.crawlTask.findUnique({
      where: { taskId },
    });
  },

  async findAll() {
    return prisma.crawlTask.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async update(taskId: string, data: CrawlTaskUpdate) {
    return prisma.crawlTask.update({
      where: { taskId },
      data,
    });
  },

  async delete(taskId: string) {
    return prisma.crawlTask.delete({
      where: { taskId },
    });
  },
};

// ============================================
// 主字段管理
// ============================================

export interface MainFieldCreate {
  fieldId: string;
  fieldName: string;
  fieldDesc: string;
  taskId: string;
  sourceMdPos?: string;
}

export interface MainFieldUpdate {
  fieldName?: string;
  fieldDesc?: string;
  sourceMdPos?: string;
}

export const MainFieldManager = {
  async create(data: MainFieldCreate) {
    return prisma.mainField.create({
      data: {
        fieldId: data.fieldId,
        fieldName: data.fieldName,
        fieldDesc: data.fieldDesc,
        taskId: data.taskId,
        sourceMdPos: data.sourceMdPos || '',
      },
    });
  },

  async findById(fieldId: string) {
    return prisma.mainField.findUnique({
      where: { fieldId },
    });
  },

  async findByTaskId(taskId: string) {
    return prisma.mainField.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findAll() {
    return prisma.mainField.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async update(fieldId: string, data: MainFieldUpdate) {
    return prisma.mainField.update({
      where: { fieldId },
      data,
    });
  },

  async delete(fieldId: string) {
    return prisma.mainField.delete({
      where: { fieldId },
    });
  },

  async deleteByTaskId(taskId: string) {
    return prisma.mainField.deleteMany({
      where: { taskId },
    });
  },
};

// ============================================
// 子字段管理
// ============================================

export interface SubFieldCreate {
  fieldId: string;
  fieldName: string;
  fieldDesc: string;
  mainFieldId: string;
  taskId: string;
  extractValue?: string;
  sourceMdPos?: string;
  valueType?: string;
}

export interface SubFieldUpdate {
  fieldName?: string;
  fieldDesc?: string;
  extractValue?: string;
  sourceMdPos?: string;
  valueType?: string;
}

export const SubFieldManager = {
  async create(data: SubFieldCreate) {
    return prisma.subField.create({
      data: {
        fieldId: data.fieldId,
        fieldName: data.fieldName,
        fieldDesc: data.fieldDesc,
        mainFieldId: data.mainFieldId,
        taskId: data.taskId,
        extractValue: data.extractValue || '',
        sourceMdPos: data.sourceMdPos || '',
        valueType: data.valueType || 'text',
      },
    });
  },

  async findById(fieldId: string) {
    return prisma.subField.findUnique({
      where: { fieldId },
    });
  },

  async findByMainFieldId(mainFieldId: string) {
    return prisma.subField.findMany({
      where: { mainFieldId },
      orderBy: { createdAt: 'asc' },
    });
  },

  async findByTaskId(taskId: string) {
    return prisma.subField.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });
  },

  async findAll() {
    return prisma.subField.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async update(fieldId: string, data: SubFieldUpdate) {
    return prisma.subField.update({
      where: { fieldId },
      data,
    });
  },

  async delete(fieldId: string) {
    return prisma.subField.delete({
      where: { fieldId },
    });
  },

  async deleteByMainFieldId(mainFieldId: string) {
    return prisma.subField.deleteMany({
      where: { mainFieldId },
    });
  },

  async deleteByTaskId(taskId: string) {
    return prisma.subField.deleteMany({
      where: { taskId },
    });
  },
};

export default prisma;