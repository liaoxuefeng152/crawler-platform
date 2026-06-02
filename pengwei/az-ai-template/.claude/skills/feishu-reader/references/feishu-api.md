# 飞书 API 技术参考

## API 端点

### 认证相关

#### 获取 Tenant Access Token
```
POST https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal
```

请求体：
```json
{
  "app_id": "cli_xxx",
  "app_secret": "xxx"
}
```

响应：
```json
{
  "code": 0,
  "msg": "ok",
  "tenant_access_token": "t-xxx",
  "expire": 7200
}
```

### 文档读取相关

#### 读取普通文档 (docx)
```
GET https://open.feishu.cn/open-apis/docx/v1/documents/{document_id}/blocks/{block_id}/children
```

参数：
- `document_id`: 从 URL 中提取的文档 ID
- `block_id`: 块 ID，根块为文档 ID
- `page_token`: 分页标记
- `page_size`: 每页大小（最大 500）

#### 获取 Wiki 节点信息
```
GET https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node
```

查询参数：
- `token`: Wiki token（从 URL 中提取）

响应：
```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "node": {
      "node_token": "xxx",
      "obj_type": "docx",
      "obj_token": "实际文档的 token"
    }
  }
}
```

## 权限要求

### 必需权限
- `docs:doc:readonly` - 查看文档
- `wiki:wiki:readonly` - 查看知识库

### 权限配置
1. 登录飞书开放平台
2. 进入应用配置
3. 在"权限管理"中添加上述权限
4. 发布应用版本

### 文档访问权限
文档需要满足以下条件之一：
1. 文档分享给飞书应用
2. 文档设置为全员可见
3. 文档分享链接为公开访问

## 错误码参考

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 99991663 | 无权限访问该文档 | 检查文档是否分享给应用 |
| 99991661 | 文档不存在或已删除 | 确认文档链接是否正确 |
| 99991672 | 无权限访问该 Wiki | 检查 Wiki 权限配置 |
| 99991673 | Wiki 文档不存在 | 确认 Wiki token 是否正确 |
| 99991400 | 请求参数错误 | 检查请求参数格式 |
| 99991406 | 文档内容为空 | 正常情况，返回空内容 |

## URL 解析规则

### 普通文档 (docx)
```
https://xxx.feishu.cn/docx/DoXDsjBz5oxxxxx
                              ^^^^^^^^^^^
                              document_id
```

### Wiki 文档
```
https://xxx.feishu.cn/wiki/LjGfwUvodiDqMKkhsBQcBamZnch
                               ^^^^^^^^^^^^^^^^^^^^^
                               wiki_token
```

## 分页处理

飞书 API 支持分页读取：

```typescript
interface PaginatedResponse {
  code: number;
  msg: string;
  data: {
    items: any[];
    page_token?: string;
    has_more: boolean;
  };
}
```

循环读取逻辑：
```typescript
let allBlocks = [];
let pageToken = undefined;

do {
  const response = await fetchBlocks(documentId, pageToken);
  allBlocks.push(...response.data.items);
  pageToken = response.data.page_token;
} while (response.data.has_more);
```

## 限流说明

### 调用频率限制
- 每个 API 有独立的限流策略
- 一般为 100 次/分钟
- 大文档建议分页读取

### 最佳实践
1. 缓存 tenant_access_token（有效期 2 小时）
2. 大文档使用分页读取
3. 实现错误重试机制
4. 避免短时间内大量请求
