/**
 * 项目配置
 * 集中管理项目级别的配置项
 */

// 项目名称（运行时配置，通过环境变量控制）
export const PROJECT_NAME =
  process.env.NEXT_PUBLIC_PROJECT_NAME || '深瞳AI Coding';

// 项目描述
export const PROJECT_DESCRIPTION = `${PROJECT_NAME} - 智能AI编码助手平台`;

// API 文档标题
export const API_DOC_TITLE = `${PROJECT_NAME} API`;

// API 文档描述
export const API_DOC_DESCRIPTION = `${PROJECT_NAME} 平台的 API 接口文档`;

// 团队名称
export const PROJECT_TEAM = `${PROJECT_NAME} Team`;