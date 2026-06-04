'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, Play, StopCircle, RefreshCw, ExternalLink, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

interface CrawlTask {
  taskId: string;
  urls: string;
  status: string;
  mdFileName: string;
  logs: string;
  createdAt: string;
}

export default function CrawlerDashboard() {
  const [urls, setUrls] = useState<string>('');
  const [taskId, setTaskId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [logs, setLogs] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [recentTasks, setRecentTasks] = useState<CrawlTask[]>([]);

  // 获取最近任务
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/crawl');
      const data = await res.json();
      setRecentTasks(data.tasks || []);
    } catch (error) {
      console.error('获取任务失败:', error);
    }
  }, []);

  // 开始爬取
  const startCrawl = async () => {
    if (!urls.trim()) {
      alert('请输入要爬取的网址');
      return;
    }

    setLoading(true);
    setStatus('running');
    setLogs('正在创建爬取任务...');

    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });

      const data = await res.json();

      if (data.success) {
        setTaskId(data.taskId);
        setStatus(data.status);
        setLogs(data.logs || '爬取完成');
        fetchTasks();
      } else {
        setStatus('failed');
        setLogs(data.error || '爬取失败');
      }
    } catch (error) {
      setStatus('failed');
      setLogs(`请求失败: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // 删除任务
  const deleteTask = async (id: string) => {
    if (!confirm('确认删除此任务？')) return;

    try {
      await fetch(`/api/crawl?taskId=${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  // 初始化加载任务
  useState(() => {
    fetchTasks();
  });

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            爬虫工作台
          </CardTitle>
          <CardDescription>
            输入网址进行爬取，自动转换为Markdown格式
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 任务ID显示 */}
          {taskId && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">任务ID:</span>
              <Badge variant="outline">{taskId}</Badge>
              <Badge variant={status === 'completed' ? 'default' : status === 'running' ? 'secondary' : 'destructive'}>
                {status}
              </Badge>
            </div>
          )}

          {/* URL输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">网址输入</label>
            <Textarea
              placeholder="输入单个网址或多个网址（每行一个）&#10;例如：&#10;https://baike.baidu.com/item/&#10;https://news.sina.com.cn/"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              onClick={startCrawl}
              disabled={loading || !urls.trim()}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              开始爬取
            </Button>
            <Button
              variant="outline"
              onClick={fetchTasks}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              刷新列表
            </Button>
          </div>

          {/* 实时日志 */}
          {logs && (
            <div className="space-y-2">
              <label className="text-sm font-medium">执行日志</label>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-muted/50">
                <pre className="text-sm whitespace-pre-wrap">{logs}</pre>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* 最近任务列表 */}
      <Card>
        <CardHeader>
          <CardTitle>最近任务</CardTitle>
          <CardDescription>
            点击查看详情或跳转到MD预览
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              暂无爬取任务
            </div>
          ) : (
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <Card key={task.taskId} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{task.taskId}</Badge>
                      <Badge variant={task.status === 'completed' ? 'default' : task.status === 'running' ? 'secondary' : 'destructive'}>
                        {task.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground truncate max-w-[300px]">
                        {task.urls.split('\n')[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/md-preview?taskId=${task.taskId}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          查看MD
                        </Button>
                      </Link>
                      <Link href={`/dashboard/field-config?taskId=${task.taskId}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          字段提取
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTask(task.taskId)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        删除
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}