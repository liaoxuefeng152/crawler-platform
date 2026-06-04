'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface TaskData {
  taskId: string;
  urls: string;
  status: string;
  mdFileName: string;
  domain: string;
  createdAt: string;
}

interface MainFieldData {
  fieldId: string;
  fieldName: string;
  fieldDesc: string;
  taskId: string;
  createdAt: string;
}

interface SubFieldData {
  fieldId: string;
  fieldName: string;
  fieldDesc: string;
  extractValue: string;
  mainFieldId: string;
  taskId: string;
  valueType: string;
  createdAt: string;
}

interface RelationData {
  mainField: MainFieldData;
  subFields: SubFieldData[];
}

export default function DataViewPage() {
  const [activeTab, setActiveTab] = useState<string>('tasks');
  const [searchTaskId, setSearchTaskId] = useState<string>('');
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [mainFields, setMainFields] = useState<MainFieldData[]>([]);
  const [subFields, setSubFields] = useState<SubFieldData[]>([]);
  const [relations, setRelations] = useState<RelationData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 获取数据
  const fetchData = useCallback(async (table: string, taskId?: string) => {
    setLoading(true);
    try {
      let url = `/api/data?table=${table}`;
      if (taskId) {
        url += `&taskId=${taskId}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      switch (table) {
        case 'tasks':
          setTasks(data.data || []);
          break;
        case 'mainFields':
          setMainFields(data.data || []);
          break;
        case 'subFields':
          setSubFields(data.data || []);
          break;
        case 'relations':
          setRelations(data.data || []);
          break;
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchData(activeTab, searchTaskId || undefined);
  }, [activeTab, searchTaskId, fetchData]);

  // 搜索
  const handleSearch = () => {
    fetchData(activeTab, searchTaskId || undefined);
  };

  // 刷新
  const handleRefresh = () => {
    setSearchTaskId('');
    fetchData(activeTab);
  };

  // 渲染类型标签
  const renderTypeBadge = (type: string) => {
    const colors = {
      text: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      time: 'bg-orange-100 text-orange-800',
      array: 'bg-purple-100 text-purple-800',
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || colors.text}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            数据存储查看
          </CardTitle>
          <CardDescription>
            可视化查看MongoDB中存储的数据
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜索和刷新 */}
          <div className="flex gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="按任务ID搜索"
                value={searchTaskId}
                onChange={(e) => setSearchTaskId(e.target.value)}
              />
              <Button onClick={handleSearch} className="flex items-center gap-1">
                <Search className="h-4 w-4" />
                搜索
              </Button>
            </div>
            <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
          </div>

          {/* 数据表 */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="tasks">基础任务表</TabsTrigger>
              <TabsTrigger value="mainFields">主字段表</TabsTrigger>
              <TabsTrigger value="subFields">子字段表</TabsTrigger>
              <TabsTrigger value="relations">关联关系</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks">
              <Card>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px] w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>任务ID</TableHead>
                          <TableHead>网址</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>域名</TableHead>
                          <TableHead>MD文件名</TableHead>
                          <TableHead>创建时间</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasks.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              暂无数据
                            </TableCell>
                          </TableRow>
                        ) : tasks.map((task) => (
                          <TableRow key={task.taskId}>
                            <TableCell>
                              <Badge variant="outline">{task.taskId}</Badge>
                            </TableCell>
                            <TableCell className="truncate max-w-[200px]">
                              {task.urls}
                            </TableCell>
                            <TableCell>
                              <Badge variant={task.status === 'completed' ? 'default' : 'destructive'}>
                                {task.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{task.domain}</TableCell>
                            <TableCell className="truncate max-w-[150px]">
                              {task.mdFileName}
                            </TableCell>
                            <TableCell>
                              {new Date(task.createdAt).toLocaleString('zh-CN')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mainFields">
              <Card>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px] w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>字段ID</TableHead>
                          <TableHead>字段名</TableHead>
                          <TableHead>字段描述</TableHead>
                          <TableHead>所属任务ID</TableHead>
                          <TableHead>创建时间</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mainFields.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              暂无数据
                            </TableCell>
                          </TableRow>
                        ) : mainFields.map((field) => (
                          <TableRow key={field.fieldId}>
                            <TableCell>
                              <Badge variant="outline">{field.fieldId}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{field.fieldName}</TableCell>
                            <TableCell className="truncate max-w-[200px]">
                              {field.fieldDesc}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{field.taskId}</Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(field.createdAt).toLocaleString('zh-CN')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subFields">
              <Card>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px] w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>字段ID</TableHead>
                          <TableHead>字段名</TableHead>
                          <TableHead>字段描述</TableHead>
                          <TableHead>提取值</TableHead>
                          <TableHead>值类型</TableHead>
                          <TableHead>所属主字段ID</TableHead>
                          <TableHead>创建时间</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subFields.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                              暂无数据
                            </TableCell>
                          </TableRow>
                        ) : subFields.map((field) => (
                          <TableRow key={field.fieldId}>
                            <TableCell>
                              <Badge variant="outline">{field.fieldId}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{field.fieldName}</TableCell>
                            <TableCell className="truncate max-w-[150px]">
                              {field.fieldDesc}
                            </TableCell>
                            <TableCell className="truncate max-w-[200px]">
                              {field.extractValue || '-'}
                            </TableCell>
                            <TableCell>
                              {renderTypeBadge(field.valueType)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{field.mainFieldId}</Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(field.createdAt).toLocaleString('zh-CN')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="relations">
              <Card>
                <CardContent className="p-4">
                  <ScrollArea className="h-[400px] w-full">
                    {relations.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        暂无数据
                      </div>
                    ) : relations.map((rel) => (
                      <Card key={rel.mainField.fieldId} className="mb-4 p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge>主字段</Badge>
                            <span className="font-medium">{rel.mainField.fieldName}</span>
                            <span className="text-muted-foreground">
                              {rel.mainField.fieldDesc}
                            </span>
                          </div>

                          {rel.subFields.length > 0 && (
                            <div className="pl-4 space-y-1">
                              <span className="text-sm text-muted-foreground">子字段:</span>
                              {rel.subFields.map((sf) => (
                                <div key={sf.fieldId} className="flex items-center gap-2 pl-4">
                                  <Badge variant="outline">{sf.fieldName}</Badge>
                                  {renderTypeBadge(sf.valueType)}
                                  <span className="truncate max-w-[200px]">
                                    {sf.extractValue || '-'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 导航链接 */}
      <div className="flex gap-2">
        <Link href="/dashboard/crawler">
          <Button variant="outline">返回工作台</Button>
        </Link>
        <Link href="/dashboard/field-config">
          <Button variant="outline">字段配置</Button>
        </Link>
      </div>
    </div>
  );
}