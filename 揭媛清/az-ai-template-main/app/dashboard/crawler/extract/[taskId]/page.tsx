"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Play,
  Loader2,
  ChevronDown,
  Settings,
  FileJson,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface FieldConfig {
  name: string;
  description: string;
  subFields?: { name: string; description: string }[];
}

interface ExtractionResult {
  success: boolean;
  mainFieldId: string;
  fieldData: {
    name: string;
    description: string;
    value?: string;
    subFields?: {
      subFieldId: string;
      name: string;
      description: string;
      value: string;
      valueType: string;
    }[];
  };
}

interface ApiConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
  timeout: number;
  maxRetries: number;
}

const defaultApiConfig: ApiConfig = {
  apiUrl: "https://newapi.dev.azshentong.com/v1/chat/completions",
  apiKey: "sk-s7U79khywzqVC6CDBAu52Pnqn3UzN56YXwB9h3kYhFDawn7I",
  model: "gpt-oss-120b",
  timeout: 60000,
  maxRetries: 3,
};

export default function FieldExtractPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const [fieldConfig, setFieldConfig] = useState<FieldConfig[]>([]);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(defaultApiConfig);
  const [apiPanelOpen, setApiPanelOpen] = useState(false);

  const [extractionResults, setExtractionResults] = useState<ExtractionResult[]>([]);

  // 获取现有字段配置
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/fields/config?taskId=${taskId}`);
        const data = await res.json();

        if (data.success && data.fields.length > 0) {
          setFieldConfig(
            data.fields.map((f: FieldConfig) => ({
              name: f.name,
              description: f.description || "",
              subFields: f.subFields?.map((sf: FieldConfig) => ({
                name: sf.name,
                description: sf.description || "",
              })),
            }))
          );
        }
      } catch (error) {
        console.error("获取配置失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [taskId]);

  // 添加主字段
  const addField = () => {
    setFieldConfig([
      ...fieldConfig,
      { name: "", description: "", subFields: [] },
    ]);
  };

  // 删除主字段
  const removeField = (index: number) => {
    setFieldConfig(fieldConfig.filter((_, i) => i !== index));
  };

  // 添加子字段
  const addSubField = (fieldIndex: number) => {
    const newConfig = [...fieldConfig];
    if (!newConfig[fieldIndex].subFields) {
      newConfig[fieldIndex].subFields = [];
    }
    newConfig[fieldIndex].subFields!.push({ name: "", description: "" });
    setFieldConfig(newConfig);
  };

  // 删除子字段
  const removeSubField = (fieldIndex: number, subFieldIndex: number) => {
    const newConfig = [...fieldConfig];
    newConfig[fieldIndex].subFields = newConfig[fieldIndex].subFields?.filter(
      (_, i) => i !== subFieldIndex
    );
    setFieldConfig(newConfig);
  };

  // 更新字段内容
  const updateField = (
    fieldIndex: number,
    key: "name" | "description",
    value: string
  ) => {
    const newConfig = [...fieldConfig];
    newConfig[fieldIndex][key] = value;
    setFieldConfig(newConfig);
  };

  // 更新子字段内容
  const updateSubField = (
    fieldIndex: number,
    subFieldIndex: number,
    key: "name" | "description",
    value: string
  ) => {
    const newConfig = [...fieldConfig];
    if (newConfig[fieldIndex].subFields) {
      newConfig[fieldIndex].subFields![subFieldIndex][key] = value;
    }
    setFieldConfig(newConfig);
  };

  // 保存字段配置
  const handleSaveConfig = async () => {
    if (fieldConfig.length === 0) {
      alert("请先添加字段");
      return;
    }

    const invalidFields = fieldConfig.filter((f) => !f.name.trim());
    if (invalidFields.length > 0) {
      alert("请填写所有字段名称");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/fields/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, fields: fieldConfig }),
      });

      const data = await res.json();
      if (data.success) {
        alert("配置保存成功");
      } else {
        alert("保存失败: " + data.error);
      }
    } catch (error) {
      alert("请求失败: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSaving(false);
    }
  };

  // 执行字段提取
  const handleExtract = async () => {
    if (fieldConfig.length === 0) {
      alert("请先配置字段");
      return;
    }

    setIsExtracting(true);
    setExtractionResults([]);

    try {
      const res = await fetch("/api/fields/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, apiConfig }),
      });

      const data = await res.json();
      if (data.success) {
        setExtractionResults(data.results);
      } else {
        alert("提取失败: " + data.error);
      }
    } catch (error) {
      alert("请求失败: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push("/dashboard/crawler")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回工作台
          </Button>
          <h1 className="text-2xl font-bold">字段配置与智能提取</h1>
        </div>
        <Badge>任务ID: {taskId}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 左侧：字段配置 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>字段配置</span>
                <Button size="sm" onClick={addField}>
                  <Plus className="mr-2 h-4 w-4" />
                  添加主字段
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : fieldConfig.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    点击上方按钮添加字段
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fieldConfig.map((field, fieldIndex) => (
                      <Card key={fieldIndex} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">主字段 #{fieldIndex + 1}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeField(fieldIndex)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">字段名称</Label>
                              <Input
                                value={field.name}
                                onChange={(e) =>
                                  updateField(fieldIndex, "name", e.target.value)
                                }
                                placeholder="例如: 商品价格"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">字段解释</Label>
                              <Input
                                value={field.description}
                                onChange={(e) =>
                                  updateField(fieldIndex, "description", e.target.value)
                                }
                                placeholder="例如: 商品实际售价"
                              />
                            </div>
                          </div>

                          {/* 子字段 */}
                          {field.subFields && field.subFields.length > 0 && (
                            <div className="border-l-2 pl-4 space-y-2">
                              <div className="text-sm font-medium text-muted-foreground">
                                子字段
                              </div>
                              {field.subFields.map((subField, subIndex) => (
                                <div
                                  key={subIndex}
                                  className="flex items-center gap-2"
                                >
                                  <Input
                                    className="flex-1"
                                    value={subField.name}
                                    onChange={(e) =>
                                      updateSubField(
                                        fieldIndex,
                                        subIndex,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    placeholder="子字段名"
                                  />
                                  <Input
                                    className="flex-1"
                                    value={subField.description}
                                    onChange={(e) =>
                                      updateSubField(
                                        fieldIndex,
                                        subIndex,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    placeholder="子字段解释"
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeSubField(fieldIndex, subIndex)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addSubField(fieldIndex)}
                          >
                            <Plus className="mr-2 h-3 w-3" />
                            添加子字段
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* 操作按钮 */}
              <div className="flex gap-3 mt-4">
                <Button onClick={handleSaveConfig} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      保存配置
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API配置面板 */}
          <Collapsible open={apiPanelOpen} onOpenChange={setApiPanelOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      AI API 配置
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        apiPanelOpen ? "rotate-180" : ""
                      }`}
                    />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">API 地址</Label>
                      <Input
                        value={apiConfig.apiUrl}
                        onChange={(e) =>
                          setApiConfig({ ...apiConfig, apiUrl: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">模型</Label>
                      <Input
                        value={apiConfig.model}
                        onChange={(e) =>
                          setApiConfig({ ...apiConfig, model: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">超时时间(ms)</Label>
                      <Input
                        type="number"
                        value={apiConfig.timeout}
                        onChange={(e) =>
                          setApiConfig({
                            ...apiConfig,
                            timeout: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">重试次数</Label>
                      <Input
                        type="number"
                        value={apiConfig.maxRetries}
                        onChange={(e) =>
                          setApiConfig({
                            ...apiConfig,
                            maxRetries: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* 提取按钮 */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleExtract}
            disabled={isExtracting || fieldConfig.length === 0}
          >
            {isExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在提取...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                开始智能提取
              </>
            )}
          </Button>
        </div>

        {/* 右侧：提取结果 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              提取结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] w-full">
              {extractionResults.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  点击"开始智能提取"查看结果
                </div>
              ) : (
                <SyntaxHighlighter
                  language="json"
                  style={oneDark as any}
                  showLineNumbers
                  customStyle={{ borderRadius: "8px" }}
                >
                  {JSON.stringify(
                    extractionResults.map((r) => ({
                      字段名: r.fieldData.name,
                      描述: r.fieldData.description,
                      提取值: r.fieldData.value || "未找到",
                      子字段: r.fieldData.subFields?.map((sf) => ({
                        名称: sf.name,
                        值: sf.value,
                        类型: sf.valueType,
                      })),
                    })),
                    null,
                    2
                  )}
                </SyntaxHighlighter>
              )}
            </ScrollArea>

            {extractionResults.length > 0 && (
              <Button
                className="mt-4"
                onClick={() => router.push("/dashboard/crawler/data")}
              >
                查看数据库存储
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}