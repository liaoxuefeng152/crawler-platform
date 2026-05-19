# 爬虫与字段提取项目（tangkai_test）

最小可运行模板，包含：
- 抓取网页（requests），检测反爬提示
- HTML -> Markdown 转换并保留层级
- 简单的字段提取器（规则优先，支持 new-api 回退）
- 将结果与元数据存入 MongoDB

快速上手

1. 创建虚拟环境并安装依赖：

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. 配置 `config.yaml`，至少设置 `mongo.uri` 与可选的 `new_api` 配置。

3. 运行示例：

```bash
python -m tangkai_test.cli --url "https://baike.baidu.com/item/体育/223780" --task-id task001
```

主要文件
- `tangkai_test/fetcher.py` - 抓取网页并做基本反爬检测
- `tangkai_test/md_converter.py` - 简单的 HTML -> Markdown 转换与结构化抽取
- `tangkai_test/extractor.py` - 字段提取逻辑（规则 + new-api）
- `tangkai_test/mongo_store.py` - MongoDB 存储封装
- `config.yaml` - 示例配置
- `fields.yaml` - 用户自定义字段定义示例
- `DESIGN.md` - 设计说明文档

可选字段定义
- 使用 `fields.yaml` 中定义的字段，运行：

```bash
python -m tangkai_test.cli --url "https://baike.baidu.com/item/体育/223780" --task-id task001 --field-file fields.yaml
```

如果需要运行包形式：

```bash
python -m tangkai_test --url "https://baike.baidu.com/item/体育/223780" --task-id task001
```
