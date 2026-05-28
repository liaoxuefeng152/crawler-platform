"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Loader2,
  Database,
  FileText,
  Layers,
} from "lucide-react";

interface TaskData {
  taskId: string;
  urls: string[];
  status: string;
  mdFileName?: string;
  createdAt: string;
  completedAt?: string;
}

interface MainFieldData {
  fieldId: string;
  name: string;
  description?: string;
  taskId: string;
  createdAt: string;
}

interface SubFieldData {
  subFieldId: string;
  name: string;
  description?: string;
  value?: string;
  valueType: string;
  parentFieldId: string;
  taskId: string;
  createdAt: string;
}

export default function DataStoragePage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [searchTaskId, setSearchTaskId] = useState("");

  // 数据状态
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [mainFields, setMainFields] = useState<MainFieldData[]>([]);
  const [subFields, setSubFields] = useState<SubFieldData[]>([]);

  // 分页状态
  const [taskPage, setTaskPage] = useState({ total: 0, page: 1, pageSize: 10 });
  const [fieldPage, setFieldPage] = useState({ total: 0, page: 1, pageSize: 20 });

  // 获取任务数据
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const url = searchTaskId
        ? `/api/data/tasks?taskId=${searchTaskId}`
        : `/api/data/tasks?page=${taskPage.page}&pageSize=${taskPage.pageSize}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setTasks(data.data);
        setTaskPage(data.pagination);
      }
    } catch (error) {
      console.error("获取任务数据失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取主字段数据
  const fetchMainFields = async () => {
    setIsLoading(true);
    try {
      const url = searchTaskId
        ? `/api/data/main-fields?taskId=${searchTaskId}`
        : `/api/data/main-fields?page=${fieldPage.page}&pageSize=${fieldPage.pageSize}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setMainFields(data.data);
        setFieldPage(data.pagination);
      }
    } catch (error) {
      console.error("获取主字段数据失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取子字段数据
  const fetchSubFields = async () => {
    setIsLoading(true);
    try {
      const url = searchTaskId
        ? `/api/data/sub-fields?taskId=${searchTaskId}`
        : `/api/data/sub-fields?page=${fieldPage.page}&pageSize=${fieldPage.pageSize}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setSubFields(data.data);
        setFieldPage(data.pagination);
      }
    } catch (error) {
      console.error("获取子字段数据失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchTasks();
  }, []);

  // 获取值类型徽章
  const getValueTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      text: "bg-blue-500",
      number: "bg-green-500",
      time: "bg-purple-500",
      array: "bg-orange-500",
    };
    return colors[type] || "bg-gray-500";
  };

  // 获取状态徽章
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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push("/dashboard/crawler")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回工作台
          </Button>
          <h1 className="text-2xl font-bold">MongoDB 数据存储查看</h1>
        </div>
        <Button variant="outline" onClick={() => fetchTasks()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          刷新数据
        </Button>
      </div>

      {/* 搜索栏 */}
      <Card className="mb-4">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="输入任务ID搜索..."
                value={searchTaskId}
                onChange={(e) => setSearchTaskId(e.target.value)}
              />
            </div>
            <Button onClick={() => fetchTasks()}>
              <Search className="mr-2 h-4 w-4" />
              搜索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 数据表格 */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">
            <Database className="mr-2 h-4 w-4" />
            基础任务表 ({taskPage.total})
          </TabsTrigger>
          <TabsTrigger value="main-fields" onClick={fetchMainFields}>
            <FileText className="mr-2 h-4 w-4" />
            主字段表 ({fieldPage.total})
          </TabsTrigger>
          <TabsTrigger value="sub-fields" onClick={fetchSubFields}>
            <Layers className="mr-2 h-4 w-4" />
            子字段表 ({fieldPage.total})
          </TabsTrigger>
        </TabsList>

        {/* 基础任务表 */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>爬虫任务记录</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  暂无任务数据
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>任务ID</TableHead>
                      <TableHead>网址数量</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>MD文件名</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>完成时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.taskId}>
                        <TableCell className="font-mono">{task.taskId}</TableCell>
                        <TableCell>{task.urls.length}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(task.status)}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.mdFileName || "-"}</TableCell>
                        <TableCell>
                          {new Date(task.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {task.completedAt
                            ? new Date(task.completedAt).toLocaleString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 主字段表 */}
        <TabsContent value="main-fields">
          <Card>
            <CardHeader>
              <CardTitle>主字段配置记录</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : mainFields.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  暂无主字段数据
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>字段ID</TableHead>
                      <TableHead>字段名称</TableHead>
                      <TableHead>字段解释</TableHead>
                      <TableHead>所属任务ID</TableHead>
                      <TableHead>创建时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mainFields.map((field) => (
                      <TableRow key={field.fieldId}>
                        <TableCell className="font-mono">{field.fieldId}</TableCell>
                        <TableCell className="font-medium">{field.name}</TableCell>
                        <TableCell>{field.description || "-"}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {field.taskId}
                        </TableCell>
                        <TableCell>
                          {new Date(field.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 子字段表 */}
        <TabsContent value="sub-fields">
          <Card>
            <CardHeader>
              <CardTitle>子字段提取记录</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : subFields.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  暂无子字段数据
                </div>
              ) : (
                <ScrollArea className="h-[500px] w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>子字段ID</TableHead>
                        <TableHead>字段名称</TableHead>
                        <TableHead>提取值</TableHead>
                        <TableHead>值类型</TableHead>
                        <TableHead>所属主字段</TableHead>
                        <TableHead>所属任务</TableHead>
                        <TableHead>创建时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subFields.map((field) => (
                        <TableRow key={field.subFieldId}>
                          <TableCell className="font-mono text-xs">
                            {field.subFieldId}
                          </TableCell>
                          <TableCell className="font-medium">{field.name}</TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate">
                              {field.value || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getValueTypeBadge(field.valueType)}>
                              {field.valueType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {field.parentFieldId}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {field.taskId}
                          </TableCell>
                          <TableCell>
                            {new Date(field.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 关联关系说明 */}
      <Card className="mt-4">
        <CardContent className="py-4">
          <div className="text-sm text-muted-foreground">
            <strong>关联关系：</strong>
            <br />
            基础任务表 → 主字段表（通过 taskId 关联） → 子字段表（通过 parentFieldId 关联）
            <br />
            <strong>数据类型标注：</strong>
            <Badge className="bg-blue-500 mr-2">text</Badge>
            <Badge className="bg-green-500 mr-2">number</Badge>
            <Badge className="bg-purple-500 mr-2">time</Badge>
            <Badge className="bg-orange-500">array</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}