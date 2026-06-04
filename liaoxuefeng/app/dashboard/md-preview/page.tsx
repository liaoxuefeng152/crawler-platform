'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Download, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface TaskInfo {
  taskId: string;
  urls: string;
  status: string;
  mdFileName: string;
  mdContent: string;
  domain: string;
  createdAt: string;
}

function MdPreviewContent() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');

  const [task, setTask] = useState<TaskInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/crawl?taskId=${taskId}`);
      const data = await res.json();
      if (data.task) {
        setTask(data.task);
      }
    } catch (error) {
      console.error('获取任务失败:', error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  // 下载MD文件
  const downloadMd = () => {
    if (!task?.mdContent) return;

    const blob = new Blob([task.mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = task.mdFileName || `${taskId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">任务不存在或没有MD内容</p>
        <Link href="/dashboard/crawler">
          <Button variant="outline" className="mt-4">返回工作台</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 文件信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Markdown 内容预览
          </CardTitle>
          <CardDescription>
            爬取后的标准Markdown文件内容
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">任务ID</span>
              <p className="font-medium">{task.taskId}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">域名</span>
              <p className="font-medium">{task.domain}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">状态</span>
              <Badge variant={task.status === 'completed' ? 'default' : 'destructive'}>
                {task.status}
              </Badge>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">文件名</span>
              <p className="font-medium truncate">{task.mdFileName}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex gap-2">
            <Button onClick={downloadMd} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              下载MD文件
            </Button>
            <Link href={`/dashboard/field-config?taskId=${task.taskId}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                字段提取
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* MD内容展示 */}
      <Tabs defaultValue="rendered">
        <TabsList>
          <TabsTrigger value="rendered">渲染预览</TabsTrigger>
          <TabsTrigger value="source">原文展示</TabsTrigger>
        </TabsList>

        <TabsContent value="rendered">
          <Card>
            <CardContent className="p-4">
              <ScrollArea className="h-[500px] w-full">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>
                    {task.mdContent || ''}
                  </ReactMarkdown>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="source">
          <Card>
            <CardContent className="p-4">
              <ScrollArea className="h-[500px] w-full">
                <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 p-4 rounded-md">
                  {task.mdContent || ''}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function MdPreviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <MdPreviewContent />
    </Suspense>
  );
}