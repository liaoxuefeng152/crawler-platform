"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  FileText,
  Settings,
  Download,
  Loader2,
  Eye,
  Code,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface TaskInfo {
  taskId: string;
  urls: string[];
  status: string;
  mdFileName?: string;
  mdFilePath?: string;
  createdAt: string;
}

export default function MarkdownPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [mdContent, setMdContent] = useState("");
  const [taskInfo, setTaskInfo] = useState<TaskInfo | null>(null);

  // 获取MD内容
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);

        // 获取任务结果
        const res = await fetch(`/api/crawl/result?taskId=${taskId}`);
        const data = await res.json();

        if (data.success) {
          setMdContent(data.mdContent || "暂无内容");
          setTaskInfo({
            taskId: data.taskId,
            urls: data.urls,
            status: data.status,
            mdFileName: data.mdFileName,
            mdFilePath: data.mdFilePath,
            createdAt: data.createdAt,
          });
        } else {
          setMdContent("获取内容失败: " + data.error);
        }
      } catch (error) {
        setMdContent("请求失败: " + (error instanceof Error ? error.message : String(error)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [taskId]);

  // 下载MD文件
  const handleDownload = () => {
    if (!mdContent || !taskInfo?.mdFileName) return;

    const blob = new Blob([mdContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = taskInfo.mdFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push("/dashboard/crawler")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回工作台
          </Button>
          <h1 className="text-2xl font-bold">MD 内容预览</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload} disabled={!mdContent}>
            <Download className="mr-2 h-4 w-4" />
            下载 MD 文件
          </Button>
          <Button onClick={() => router.push(`/dashboard/crawler/extract/${taskId}`)}>
            <Settings className="mr-2 h-4 w-4" />
            字段提取配置
          </Button>
        </div>
      </div>

      {/* 任务信息卡片 */}
      {taskInfo && (
        <Card className="mb-4">
          <CardContent className="py-4">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">任务ID：</span>
                <span className="font-medium">{taskInfo.taskId}</span>
              </div>
              <div>
                <span className="text-muted-foreground">状态：</span>
                <Badge>{taskInfo.status}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">创建时间：</span>
                <span>{new Date(taskInfo.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">网址数量：</span>
                <span>{taskInfo.urls.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MD内容展示 */}
      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preview">
            <Eye className="mr-2 h-4 w-4" />
            渲染预览
          </TabsTrigger>
          <TabsTrigger value="source">
            <Code className="mr-2 h-4 w-4" />
            原文展示
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Markdown 渲染预览</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ScrollArea className="h-[600px] w-full">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown
                      components={{
                        code({ className, children }) {
                          const match = /language-(\w+)/.exec(className || "");
                          const isInline = !match;
                          return isInline ? (
                            <code className={className}>
                              {children}
                            </code>
                          ) : (
                            <SyntaxHighlighter
                              style={oneDark as any}
                              language={match[1]}
                              PreTag="div"
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          );
                        },
                      }}
                    >
                      {mdContent}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="source">
          <Card>
            <CardHeader>
              <CardTitle>Markdown 原文</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ScrollArea className="h-[600px] w-full">
                  <pre className="font-mono text-sm whitespace-pre-wrap p-4 bg-muted rounded-lg">
                    {mdContent}
                  </pre>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}