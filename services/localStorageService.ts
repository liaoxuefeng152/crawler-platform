/**
 * 本地文件存储服务
 * 将MD文件保存到本地文件系统
 */

import fs from 'fs';
import path from 'path';

// 本地存储目录
const STORAGE_DIR = path.join(process.cwd(), 'data', 'crawl');

// 确保存储目录存在
export function ensureStorageDir(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

// 保存MD文件到本地
export function saveMdFile(fileName: string, content: string): string {
  ensureStorageDir();
  const filePath = path.join(STORAGE_DIR, fileName);
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

// 读取本地MD文件
export function readMdFile(fileName: string): string | null {
  const filePath = path.join(STORAGE_DIR, fileName);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return null;
}

// 删除本地MD文件
export function deleteMdFile(fileName: string): boolean {
  const filePath = path.join(STORAGE_DIR, fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

// 获取所有本地MD文件列表
export function listMdFiles(): string[] {
  ensureStorageDir();
  return fs.readdirSync(STORAGE_DIR).filter(f => f.endsWith('.md'));
}

// 获取存储目录路径
export function getStorageDir(): string {
  return STORAGE_DIR;
}

export default {
  saveMdFile,
  readMdFile,
  deleteMdFile,
  listMdFiles,
  ensureStorageDir,
  getStorageDir,
};