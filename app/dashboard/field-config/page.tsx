'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Plus, Trash2, Play, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface TaskInfo {
  taskId: string;
  urls: string;
  status: string;
  mdFileName: string;
}

interface MainField {
  fieldId: string;
  fieldName: string;
  fieldDesc: string;
  subFields?: SubField[];
}

interface SubField {
  fieldId: string;
  fieldName: string;
  fieldDesc: string;
  extractValue: string;
  valueType: string;
}

interface FieldConfig {
  fieldName: string;
  fieldDesc: string;
  subFields: Array<{ fieldName: string; fieldDesc: string }>;
}

function FieldConfigContent() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');

  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(taskId || '');
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>([]);
  const [savedFields, setSavedFields] = useState<MainField[]>([]);
  const [extractResult, setExtractResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [configOpen, setConfigOpen] = useState<boolean>(false);

  // API配置
  const [apiConfig, setApiConfig] = useState({
    baseUrl: 'https://newapi.dev.azshentong.com/v1',
    model: 'gpt-oss-120b',
    timeout: '60',
    retries: '2',
  });

  // 获取任务列表
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/crawl');
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('获取任务失败:', error);
    }
  }, []);

  // 获取已保存的字段配置
  const fetchSavedFields = useCallback(async (tid: string) => {
    try {
      const res = await fetch(`/api/fields?taskId=${tid}`);
      const data = await res.json();
      setSavedFields(data.fields || []);
    } catch (error) {
      console.error('获取字段配置失败:', error);
    }
  }, []);

  // 添加主字段
  const addMainField = () => {
    setFieldConfigs([...fieldConfigs, {
      fieldName: '',
      fieldDesc: '',
      subFields: [],
    }]);
  };

  // 删除主字段
  const removeMainField = (index: number) => {
    setFieldConfigs(fieldConfigs.filter((_, i) => i !== index));
  };

  // 添加子字段
  const addSubField = (mainIndex: number) => {
    const newConfigs = [...fieldConfigs];
    newConfigs[mainIndex].subFields.push({
      fieldName: '',
      fieldDesc: '',
    });
    setFieldConfigs(newConfigs);
  };

  // 删除子字段
  const removeSubField = (mainIndex: number, subIndex: number) => {
    const newConfigs = [...fieldConfigs];
    newConfigs[mainIndex].subFields = newConfigs[mainIndex].subFields.filter((_, i) => i !== subIndex);
    setFieldConfigs(newConfigs);
  };

  // 更新主字段
  const updateMainField = (index: number, key: 'fieldName' | 'fieldDesc', value: string) => {
    const newConfigs = [...fieldConfigs];
    newConfigs[index][key] = value;
    setFieldConfigs(newConfigs);
  };

  // 更新子字段
  const updateSubField = (mainIndex: number, subIndex: number, key: 'fieldName' | 'fieldDesc', value: string) => {
    const newConfigs = [...fieldConfigs];
    newConfigs[mainIndex].subFields[subIndex][key] = value;
    setFieldConfigs(newConfigs);
  };

  // 保存字段配置
  const saveFields = async () => {
    if (!selectedTaskId) {
      alert('请选择任务');
      return;
    }

    const validConfigs = fieldConfigs.filter(c => c.fieldName && c.fieldDesc);
    if (validConfigs.length === 0) {
      alert('请添加有效的字段配置');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTaskId,
          mainFields: validConfigs,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedFields(data.fields);
        setFieldConfigs([]);
        alert('字段配置保存成功');
      } else {
        alert(data.error || '保存失败');
      }
    } catch (error) {
      alert(`保存失败: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // 执行AI提取
  const executeExtraction = async () => {
    if (!selectedTaskId) {
      alert('请选择任务');
      return;
    }

    // 使用已保存的字段或当前配置的字段
    const fieldsToExtract = savedFields.length > 0
      ? savedFields.map(f => ({
          fieldName: f.fieldName,
          fieldDesc: f.fieldDesc,
          subFields: f.subFields?.map(sf => ({
            fieldName: sf.fieldName,
            fieldDesc: sf.fieldDesc,
          })),
        }))
      : fieldConfigs.filter(c => c.fieldName && c.fieldDesc);

    if (fieldsToExtract.length === 0) {
      alert('请先配置字段');
      return;
    }

    setLoading(true);
    setExtractResult(null);

    try {
      const res = await fetch('/api/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'extract',
          taskId: selectedTaskId,
          mainFields: fieldsToExtract,
          config: {
            baseUrl: apiConfig.baseUrl,
            model: apiConfig.model,
            timeout: parseInt(apiConfig.timeout) * 1000,
            retries: parseInt(apiConfig.retries),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setExtractResult(data.result);
        fetchSavedFields(selectedTaskId);
      } else {
        alert(data.error || '提取失败');
      }
    } catch (error) {
      alert(`提取失败: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // 初始化
  useEffect(() => {
    fetchTasks();
    if (taskId) {
      fetchSavedFields(taskId);
    }
  }, [fetchTasks, fetchSavedFields, taskId]);

  // 任务选择变化时
  useEffect(() => {
    if (selectedTaskId) {
      fetchSavedFields(selectedTaskId);
    }
  }, [selectedTaskId, fetchSavedFields]);

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            字段配置与智能提取
          </CardTitle>
          <CardDescription>
            配置主字段和子字段，调用AI模型进行智能提取
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 任务选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">关联任务</label>
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger>
                <SelectValue placeholder="选择已完成的爬取任务" />
              </SelectTrigger>
              <SelectContent>
                {tasks.filter(t => t.status === 'completed').map(t => (
                  <SelectItem key={t.taskId} value={t.taskId}>
                    {t.taskId} - {t.urls.split('\n')[0].substring(0, 50)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* 字段配置区 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">字段配置</h3>
              <Button onClick={addMainField} size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                添加主字段
              </Button>
            </div>

            {fieldConfigs.map((config, mainIndex) => (
              <Card key={mainIndex} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge>主字段 {mainIndex + 1}</Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeMainField(mainIndex)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">字段名</label>
                      <Input
                        value={config.fieldName}
                        onChange={(e) => updateMainField(mainIndex, 'fieldName', e.target.value)}
                        placeholder="例如：商品价格"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">字段解释</label>
                      <Input
                        value={config.fieldDesc}
                        onChange={(e) => updateMainField(mainIndex, 'fieldDesc', e.target.value)}
                        placeholder="例如：网页中展示的商品实际售价"
                      />
                    </div>
                  </div>

                  {/* 子字段 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">子字段</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addSubField(mainIndex)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {config.subFields.map((subField, subIndex) => (
                      <div key={subIndex} className="flex items-center gap-4 pl-4">
                        <Badge variant="outline">子字段</Badge>
                        <Input
                          value={subField.fieldName}
                          onChange={(e) => updateSubField(mainIndex, subIndex, 'fieldName', e.target.value)}
                          placeholder="字段名"
                          className="w-[150px]"
                        />
                        <Input
                          value={subField.fieldDesc}
                          onChange={(e) => updateSubField(mainIndex, subIndex, 'fieldDesc', e.target.value)}
                          placeholder="字段解释"
                          className="w-[200px]"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeSubField(mainIndex, subIndex)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}

            {/* 已保存的字段 */}
            {savedFields.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">已保存的字段配置</h4>
                {savedFields.map((field) => (
                  <Card key={field.fieldId} className="p-3">
                    <div className="flex items-center gap-2">
                      <Badge>{field.fieldName}</Badge>
                      <span className="text-sm text-muted-foreground">{field.fieldDesc}</span>
                      {field.subFields && field.subFields.length > 0 && (
                        <span className="text-xs">
                          ({field.subFields.length}个子字段)
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <Button onClick={saveFields} disabled={loading || fieldConfigs.length === 0}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '保存配置'}
              </Button>
              <Button onClick={() => setFieldConfigs([])} variant="outline">
                清空配置
              </Button>
            </div>
          </div>

          <Separator />

          {/* API配置（可折叠） */}
          <Collapsible open={configOpen} onOpenChange={setConfigOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-2">
              {configOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="text-sm font-medium">AI提取参数配置</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="p-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm">API地址</label>
                    <Input
                      value={apiConfig.baseUrl}
                      onChange={(e) => setApiConfig({ ...apiConfig, baseUrl: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">模型</label>
                    <Input
                      value={apiConfig.model}
                      onChange={(e) => setApiConfig({ ...apiConfig, model: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">超时时间（秒）</label>
                    <Input
                      value={apiConfig.timeout}
                      onChange={(e) => setApiConfig({ ...apiConfig, timeout: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">重试次数</label>
                    <Input
                      value={apiConfig.retries}
                      onChange={(e) => setApiConfig({ ...apiConfig, retries: e.target.value })}
                    />
                  </div>
                </div>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* 开始提取 */}
          <Button
            onClick={executeExtraction}
            disabled={loading || !selectedTaskId}
            className="w-full flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            开始提取
          </Button>

          {/* 提取结果 */}
          {extractResult && (
            <Card className="p-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">提取结果</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] w-full">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(extractResult, null, 2)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* 导航链接 */}
      <div className="flex gap-2">
        <Link href="/dashboard/crawler">
          <Button variant="outline">返回工作台</Button>
        </Link>
        <Link href="/dashboard/data-view">
          <Button variant="outline">查看数据存储</Button>
        </Link>
      </div>
    </div>
  );
}

// 主页面组件，用 Suspense 包裹
export default function FieldConfigPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <FieldConfigContent />
    </Suspense>
  );
}