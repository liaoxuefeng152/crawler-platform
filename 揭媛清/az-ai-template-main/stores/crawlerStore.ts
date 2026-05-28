import { create } from "zustand";

// 任务状态
export type TaskStatus = "pending" | "running" | "completed" | "failed" | "stopped";

// 任务数据
export interface CrawlerTask {
  taskId: string;
  urls: string[];
  status: TaskStatus;
  logs: TaskLog[];
  mdFileName?: string;
  mdFilePath?: string;
  createdAt: string;
  completedAt?: string;
}

// 任务日志
export interface TaskLog {
  timestamp: string;
  type: "info" | "success" | "error" | "warning";
  message: string;
  url?: string;
}

// 字段配置
export interface FieldConfig {
  fieldId?: string;
  name: string;
  description: string;
  subFields?: SubFieldConfig[];
}

export interface SubFieldConfig {
  subFieldId?: string;
  name: string;
  description: string;
  value?: string;
  valueType?: string;
}

// API配置
export interface ApiConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
  timeout: number;
  maxRetries: number;
}

// Store状态
interface CrawlerStore {
  // 当前任务
  currentTaskId: string | null;
  currentTask: CrawlerTask | null;

  // 任务列表
  tasks: CrawlerTask[];
  totalTasks: number;

  // MD内容
  mdContent: string;

  // 字段配置
  fieldConfig: FieldConfig[];

  // API配置
  apiConfig: ApiConfig;

  // 加载状态
  isLoading: boolean;
  isExtracting: boolean;

  // Actions
  setCurrentTaskId: (taskId: string) => void;
  setCurrentTask: (task: CrawlerTask) => void;
  setTasks: (tasks: CrawlerTask[]) => void;
  setTotalTasks: (total: number) => void;
  setMdContent: (content: string) => void;
  setFieldConfig: (config: FieldConfig[]) => void;
  addField: (field: FieldConfig) => void;
  removeField: (index: number) => void;
  addSubField: (fieldIndex: number, subField: SubFieldConfig) => void;
  removeSubField: (fieldIndex: number, subFieldIndex: number) => void;
  setApiConfig: (config: Partial<ApiConfig>) => void;
  setLoading: (loading: boolean) => void;
  setExtracting: (extracting: boolean) => void;
  addLog: (log: TaskLog) => void;
  reset: () => void;
}

const defaultApiConfig: ApiConfig = {
  apiUrl: "https://newapi.dev.azshentong.com/v1/chat/completions",
  apiKey: "sk-s7U79khywzqVC6CDBAu52Pnqn3UzN56YXwB9h3kYhFDawn7I",
  model: "gpt-oss-120b",
  timeout: 60000,
  maxRetries: 3,
};

export const useCrawlerStore = create<CrawlerStore>((set) => ({
  currentTaskId: null,
  currentTask: null,
  tasks: [],
  totalTasks: 0,
  mdContent: "",
  fieldConfig: [],
  apiConfig: defaultApiConfig,
  isLoading: false,
  isExtracting: false,

  setCurrentTaskId: (taskId) => set({ currentTaskId: taskId }),
  setCurrentTask: (task) => set({ currentTask: task }),
  setTasks: (tasks) => set({ tasks }),
  setTotalTasks: (total) => set({ totalTasks: total }),
  setMdContent: (content) => set({ mdContent: content }),
  setFieldConfig: (config) => set({ fieldConfig: config }),
  addField: (field) =>
    set((state) => ({ fieldConfig: [...state.fieldConfig, field] })),
  removeField: (index) =>
    set((state) => ({
      fieldConfig: state.fieldConfig.filter((_, i) => i !== index),
    })),
  addSubField: (fieldIndex, subField) =>
    set((state) => {
      const newConfig = [...state.fieldConfig];
      if (newConfig[fieldIndex]) {
        newConfig[fieldIndex].subFields = [
          ...(newConfig[fieldIndex].subFields || []),
          subField,
        ];
      }
      return { fieldConfig: newConfig };
    }),
  removeSubField: (fieldIndex, subFieldIndex) =>
    set((state) => {
      const newConfig = [...state.fieldConfig];
      if (newConfig[fieldIndex]?.subFields) {
        newConfig[fieldIndex].subFields = newConfig[fieldIndex].subFields?.filter(
          (_, i) => i !== subFieldIndex
        );
      }
      return { fieldConfig: newConfig };
    }),
  setApiConfig: (config) =>
    set((state) => ({ apiConfig: { ...state.apiConfig, ...config } })),
  setLoading: (loading) => set({ isLoading: loading }),
  setExtracting: (extracting) => set({ isExtracting: extracting }),
  addLog: (log) =>
    set((state) => {
      if (state.currentTask) {
        return {
          currentTask: {
            ...state.currentTask,
            logs: [...state.currentTask.logs, log],
          },
        };
      }
      return state;
    }),
  reset: () =>
    set({
      currentTaskId: null,
      currentTask: null,
      mdContent: "",
      fieldConfig: [],
      isLoading: false,
      isExtracting: false,
    }),
}));