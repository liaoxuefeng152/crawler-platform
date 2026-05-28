"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Square,
  Plus,
  FileText,
  Database,
  Settings,
  Loader2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useCrawlerStore } from "@/stores/crawlerStore";
import type { TaskLog } from "@/stores/crawlerStore";

// 生成任务ID
function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// 解析网址输入（支持单行和多行）
function parseUrls(input: string): string[] {
  const lines = input.split(/[\n,]/).map((line) => line.trim()).filter(Boolean);
  return lines.filter((url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });
}

export default function CrawlerDashboard() {
  const router = useRouter();
  const {
    currentTaskId,
    currentTask,
    tasks,
    setTasks,
    setTotalTasks,
    setCurrentTask,
    setLoading,
    addLog,
  } = useCrawlerStore();

  const [urlInput, setUrlInput] = useState("");
  const [taskId] = useState(generateTaskId());
  const [isRunning, setIsRunning] = useState(false);

  // 获取任务列表
  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/crawl/list");
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
        setTotalTasks(data.total);
      }
    } catch (error) {
      console.error("获取任务列表失败:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 开始爬取
  const handleStartCrawl = async () => {
    const urls = parseUrls(urlInput);
    if (urls.length === 0) {
      alert("请输入有效的网址");
      return;
    }

    setIsRunning(true);
    setLoading(true);

    // 初始化任务状态
    setCurrentTask({
      taskId,
      urls,
      status: "running",
      logs: [
        {
          timestamp: new Date().toISOString(),
          type: "info",
          message: `任务启动，共 ${urls.length} 个网址`,
        },
      ],
      createdAt: new Date().toISOString(),
    });

    try {
      const res = await fetch("/api/crawl/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls, taskId }),
      });

      const data = await res.json();

      if (data.success) {
        addLog({
          timestamp: new Date().toISOString(),
          type: "success",
          message: "爬取任务已提交，正在执行...",
        });

        // 轮询获取任务状态
        pollTaskStatus(taskId);
      } else {
        addLog({
          timestamp: new Date().toISOString(),
          type: "error",
          message: data.error || "任务启动失败",
        });
        setIsRunning(false);
        setLoading(false);
      }
    } catch (error) {
      addLog({
        timestamp: new Date().toISOString(),
        type: "error",
        message: "请求失败: " + (error instanceof Error ? error.message : String(error)),
      });
      setIsRunning(false);
      setLoading(false);
    }
  };

  // 轮询任务状态
  const pollTaskStatus = async (taskId: string) => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/crawl/status?taskId=${taskId}`);
        const data = await res.json();

        if (data.success) {
          setCurrentTask(data.task);

          if (data.task.status === "running") {
            setTimeout(poll, 2000);
          } else {
            setIsRunning(false);
            setLoading(false);
            fetchTasks();
          }
        }
      } catch (error) {
        console.error("轮询状态失败:", error);
        setTimeout(poll, 3000);
      }
    };

    poll();
  };

  // 获取状态徽章颜色
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-500",
      running: "bg-blue-500",
      completed: "bg-green-500",
      failed: "bg-red-500",
      stopped: "bg-yellow-500",
    };
    return colors[status] || "bg-gray-500";
  };

  // 获取日志类型颜色
  const getLogTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      info: "text-blue-500",
      success: "text-green-500",
      error: "text-red-500",
      warning: "text-yellow-500",
    };
    return colors[type] || "text-gray-500";
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">网页爬虫工作台</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTasks}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新任务列表
          </Button>
        </div>
      </div>

      <Tabs defaultValue="workspace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workspace">
            <Play className="mr-2 h-4 w-4" />
            工作台
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <FileText className="mr-2 h-4 w-4" />
            任务列表
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="mr-2 h-4 w-4" />
            数据查看
          </TabsTrigger>
        </TabsList>

        {/* 工作台 */}
        <TabsContent value="workspace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                新建爬取任务
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 任务ID */}
              <div className="space-y-2">
                <Label>任务ID（自动生成）</Label>
                <Input value={taskId} disabled className="bg-muted" />
              </div>

              {/* 网址输入 */}
              <div className="space-y-2">
                <Label>网址输入（支持多行，每行一个网址）</Label>
                <textarea
                  className="w-full min-h-[120px] p-3 border rounded-md resize-y font-mono text-sm"
                  placeholder="https://example.com/page1
https://example.com/page2
https://example.com/page3"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isRunning}
                />
                <p className="text-sm text-muted-foreground">
                  已输入 {parseUrls(urlInput).length} 个有效网址
                </p>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <Button
                  onClick={handleStartCrawl}
                  disabled={isRunning || parseUrls(urlInput).length === 0}
                  className="flex-1"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      正在爬取...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      开始爬取
                    </>
                  )}
                </Button>
                <Button variant="destructive" disabled={!isRunning}>
                  <Square className="mr-2 h-4 w-4" />
                  停止
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 实时日志 */}
          {currentTask && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  实时日志
                  <Badge className={getStatusBadge(currentTask.status)}>
                    {currentTask.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] w-full rounded border p-3">
                  {currentTask.logs.map((log: TaskLog, index: number) => (
                    <div
                      key={index}
                      className={`py-1 font-mono text-sm ${getLogTypeColor(log.type)}`}
                    >
                      <span className="text-gray-400">
                        [{new Date(log.timestamp).toLocaleTimeString()}]
                      </span>{" "}
                      {log.message}
                    </div>
                  ))}
                </ScrollArea>

                {currentTask.status === "completed" && (
                  <div className="mt-4 flex gap-3">
                    <Button
                      onClick={() => router.push(`/dashboard/crawler/preview/${taskId}`)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      查看 MD 内容
                    </Button>
                    <Button
                      onClick={() => router.push(`/dashboard/crawler/extract/${taskId}`)}
                      variant="outline"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      配置字段提取
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 任务列表 */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>历史任务列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    暂无任务记录
                  </p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.taskId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/dashboard/crawler/preview/${task.taskId}`)}
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{task.taskId}</div>
                        <div className="text-sm text-muted-foreground">
                          {task.urls.length} 个网址 | {new Date(task.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusBadge(task.status)}>
                          {task.status}
                        </Badge>
                        <ExternalLink className="h-4 w-4" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 数据查看 */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MongoDB 数据查看</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/dashboard/crawler/data")}>
                <Database className="mr-2 h-4 w-4" />
                进入数据查看页面
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}