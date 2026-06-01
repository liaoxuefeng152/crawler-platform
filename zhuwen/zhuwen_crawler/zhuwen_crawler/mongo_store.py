"""
MongoDB存储模块 - 数据持久化

设计思路：
1. 使用PyMongo进行MongoDB操作
2. 支持三个集合：crawl_tasks、main_fields、sub_fields
3. 业务ID关联：taskId、mainFieldId、subFieldId
4. 支持CRUD操作和查询统计
5. 数据结构设计支持主字段-子字段层级关系

MongoDB表结构：
- crawl_tasks: 爬取任务基础信息
- main_fields: 主字段提取结果
- sub_fields: 子字段提取结果（关联mainFieldId）
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import json

try:
    from pymongo import MongoClient, ASCENDING, DESCENDING
    from pymongo.errors import ConnectionFailure, DuplicateKeyError
    PYMONGO_AVAILABLE = True
except ImportError:
    PYMONGO_AVAILABLE = False
    print("[WARN] pymongo库未安装，MongoDB功能不可用")


@dataclass
class CrawlTaskDocument:
    """爬取任务文档结构"""
    task_id: str  # 业务ID: task_YYYYMMDD_HHmmss_xxxx
    url: str
    domain: str
    crawl_time: datetime
    md_file_path: str
    md_file_name: str
    encoding: str = "utf-8"
    title: str = ""
    md_content: Optional[str] = None  # 可选：直接存储MD内容
    status: str = "completed"  # pending, completed, failed
    error_message: Optional[str] = None
    created_at: datetime = None
    updated_at: datetime = None

    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            'task_id': self.task_id,
            'url': self.url,
            'domain': self.domain,
            'crawl_time': self.crawl_time.isoformat() if self.crawl_time else None,
            'md_file_path': self.md_file_path,
            'md_file_name': self.md_file_name,
            'md_content': self.md_content,
            'encoding': self.encoding,
            'title': self.title,
            'status': self.status,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat() if self.created_at else datetime.now().isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else datetime.now().isoformat(),
        }


@dataclass
class MainFieldDocument:
    """主字段文档结构"""
    main_field_id: str  # 业务ID: mf_taskId_xxxx
    name: str
    description: str
    task_id: str  # 关联任务业务ID
    extracted_value: Any
    value_type: str  # text, number, time, array, object, null
    confidence: float
    md_location: Optional[str] = None
    created_at: datetime = None
    updated_at: datetime = None

    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            'main_field_id': self.main_field_id,
            'name': self.name,
            'description': self.description,
            'task_id': self.task_id,
            'extracted_value': self.extracted_value,
            'value_type': self.value_type,
            'confidence': self.confidence,
            'md_location': self.md_location,
            'created_at': self.created_at.isoformat() if self.created_at else datetime.now().isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else datetime.now().isoformat(),
        }


@dataclass
class SubFieldDocument:
    """子字段文档结构"""
    sub_field_id: str  # 业务ID: sf_mainFieldId_xxxx
    name: str
    description: str
    main_field_id: str  # 关联主字段业务ID
    task_id: str  # 关联任务业务ID（双重关联）
    extracted_value: Any
    value_type: str
    confidence: float
    md_location: Optional[str] = None
    created_at: datetime = None
    updated_at: datetime = None

    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            'sub_field_id': self.sub_field_id,
            'name': self.name,
            'description': self.description,
            'main_field_id': self.main_field_id,
            'task_id': self.task_id,
            'extracted_value': self.extracted_value,
            'value_type': self.value_type,
            'confidence': self.confidence,
            'md_location': self.md_location,
            'created_at': self.created_at.isoformat() if self.created_at else datetime.now().isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else datetime.now().isoformat(),
        }


class MongoStore:
    """MongoDB存储管理器"""

    def __init__(self, uri: str, database: str, collections: Dict[str, str]):
        """初始化MongoDB连接

        Args:
            uri: MongoDB连接URI
            database: 数据库名称
            collections: 集合名称映射
        """
        if not PYMONGO_AVAILABLE:
            self.client = None
            self.db = None
            self.collections = {}
            print("[WARN] MongoDB功能不可用，数据将仅保存到本地文件")
            return

        try:
            self.client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            # 测试连接
            self.client.admin.command('ping')
            print(f"[SUCCESS] MongoDB连接成功: {uri}")

            self.db = self.client[database]
            self.collections = {
                'crawl_tasks': self.db[collections.get('crawl_tasks', 'crawl_tasks')],
                'main_fields': self.db[collections.get('main_fields', 'main_fields')],
                'sub_fields': self.db[collections.get('sub_fields', 'sub_fields')],
            }

            # 创建索引
            self._create_indexes()

        except ConnectionFailure as e:
            print(f"[ERROR] MongoDB连接失败: {e}")
            self.client = None
            self.db = None
            self.collections = {}

    def _create_indexes(self):
        """创建索引以提高查询效率"""
        if not self.collections:
            return

        try:
            # crawl_tasks 索引
            self.collections['crawl_tasks'].create_index([('task_id', ASCENDING)], unique=True)
            self.collections['crawl_tasks'].create_index([('url', ASCENDING)])
            self.collections['crawl_tasks'].create_index([('crawl_time', DESCENDING)])

            # main_fields 索引
            self.collections['main_fields'].create_index([('main_field_id', ASCENDING)], unique=True)
            self.collections['main_fields'].create_index([('task_id', ASCENDING)])
            self.collections['main_fields'].create_index([('name', ASCENDING)])

            # sub_fields 索引
            self.collections['sub_fields'].create_index([('sub_field_id', ASCENDING)], unique=True)
            self.collections['sub_fields'].create_index([('main_field_id', ASCENDING)])
            self.collections['sub_fields'].create_index([('task_id', ASCENDING)])

            print("[INFO] MongoDB索引创建完成")
        except Exception as e:
            print(f"[WARN] 索引创建失败: {e}")

    def is_connected(self) -> bool:
        """检查是否已连接"""
        return self.client is not None

    def save_crawl_task(self, task: CrawlTaskDocument) -> bool:
        """保存爬取任务

        Args:
            task: 爬取任务文档

        Returns:
            bool: 是否成功
        """
        if not self.collections:
            print("[WARN] MongoDB未连接，跳过保存")
            return False

        try:
            doc = task.to_dict()
            result = self.collections['crawl_tasks'].insert_one(doc)
            print(f"[SUCCESS] 爬取任务已保存: {task.task_id}")
            return True
        except DuplicateKeyError:
            print(f"[WARN] 任务已存在，更新: {task.task_id}")
            self.collections['crawl_tasks'].update_one(
                {'task_id': task.task_id},
                {'$set': task.to_dict()}
            )
            return True
        except Exception as e:
            print(f"[ERROR] 保存爬取任务失败: {e}")
            return False

    def save_main_field(self, field: MainFieldDocument) -> bool:
        """保存主字段

        Args:
            field: 主字段文档

        Returns:
            bool: 是否成功
        """
        if not self.collections:
            return False

        try:
            result = self.collections['main_fields'].insert_one(field.to_dict())
            print(f"[SUCCESS] 主字段已保存: {field.main_field_id}")
            return True
        except DuplicateKeyError:
            self.collections['main_fields'].update_one(
                {'main_field_id': field.main_field_id},
                {'$set': field.to_dict()}
            )
            return True
        except Exception as e:
            print(f"[ERROR] 保存主字段失败: {e}")
            return False

    def save_sub_field(self, field: SubFieldDocument) -> bool:
        """保存子字段

        Args:
            field: 子字段文档

        Returns:
            bool: 是否成功
        """
        if not self.collections:
            return False

        try:
            result = self.collections['sub_fields'].insert_one(field.to_dict())
            print(f"[SUCCESS] 子字段已保存: {field.sub_field_id}")
            return True
        except DuplicateKeyError:
            self.collections['sub_fields'].update_one(
                {'sub_field_id': field.sub_field_id},
                {'$set': field.to_dict()}
            )
            return True
        except Exception as e:
            print(f"[ERROR] 保存子字段失败: {e}")
            return False

    def save_extraction_result(self, extraction_data: Dict[str, Any]) -> bool:
        """保存完整提取结果（包含主字段和子字段）

        Args:
            extraction_data: 提取结果字典（来自FieldExtractor.to_dict）

        Returns:
            bool: 是否成功
        """
        if not self.collections:
            return False

        task_id = extraction_data.get('task_id')

        try:
            # 保存所有主字段
            for mf_data in extraction_data.get('main_fields', []):
                main_field_id = f"mf_{task_id}_{mf_data.get('main_field_id', '')}"

                main_field_doc = MainFieldDocument(
                    main_field_id=main_field_id,
                    name=mf_data.get('main_field_name', ''),
                    description=mf_data.get('description', ''),
                    task_id=task_id,
                    extracted_value=mf_data.get('extraction', {}).get('value'),
                    value_type=mf_data.get('extraction', {}).get('value_type', 'text'),
                    confidence=mf_data.get('extraction', {}).get('confidence', 0.0),
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )

                self.save_main_field(main_field_doc)

                # 保存子字段
                for sf_data in mf_data.get('sub_fields', []):
                    sub_field_id = f"sf_{main_field_id}_{sf_data.get('sub_field_id', '')}"

                    sub_field_doc = SubFieldDocument(
                        sub_field_id=sub_field_id,
                        name=sf_data.get('sub_field_name', ''),
                        description=sf_data.get('description', ''),
                        main_field_id=main_field_id,
                        task_id=task_id,
                        extracted_value=sf_data.get('extraction', {}).get('value'),
                        value_type=sf_data.get('extraction', {}).get('value_type', 'text'),
                        confidence=sf_data.get('extraction', {}).get('confidence', 0.0),
                        created_at=datetime.now(),
                        updated_at=datetime.now()
                    )

                    self.save_sub_field(sub_field_doc)

            print(f"[SUCCESS] 提取结果已完整保存到MongoDB")
            return True

        except Exception as e:
            print(f"[ERROR] 保存提取结果失败: {e}")
            return False

    def get_crawl_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """获取爬取任务

        Args:
            task_id: 任务ID

        Returns:
            Optional[Dict]: 任务数据
        """
        if not self.collections:
            return None

        return self.collections['crawl_tasks'].find_one({'task_id': task_id})

    def get_main_fields_by_task(self, task_id: str) -> List[Dict[str, Any]]:
        """获取任务的所有主字段

        Args:
            task_id: 任务ID

        Returns:
            List[Dict]: 主字段列表
        """
        if not self.collections:
            return []

        return list(self.collections['main_fields'].find({'task_id': task_id}))

    def get_sub_fields_by_main_field(self, main_field_id: str) -> List[Dict[str, Any]]:
        """获取主字段的所有子字段

        Args:
            main_field_id: 主字段ID

        Returns:
            List[Dict]: 子字段列表
        """
        if not self.collections:
            return []

        return list(self.collections['sub_fields'].find({'main_field_id': main_field_id}))

    def list_all_tasks(self, limit: int = 10) -> List[Dict[str, Any]]:
        """列出所有爬取任务

        Args:
            limit: 返回数量限制

        Returns:
            List[Dict]: 任务列表
        """
        if not self.collections:
            return []

        return list(self.collections['crawl_tasks'].find().sort('crawl_time', DESCENDING).limit(limit))

    def get_statistics(self) -> Dict[str, Any]:
        """获取统计信息

        Returns:
            Dict: 统计数据
        """
        if not self.collections:
            return {}

        try:
            stats = {
                'crawl_tasks_count': self.collections['crawl_tasks'].count_documents({}),
                'main_fields_count': self.collections['main_fields'].count_documents({}),
                'sub_fields_count': self.collections['sub_fields'].count_documents({}),
                'latest_task': self.collections['crawl_tasks'].find_one(sort=[('crawl_time', DESCENDING)]),
            }
            return stats
        except Exception as e:
            print(f"[ERROR] 获取统计信息失败: {e}")
            return {}

    def close(self):
        """关闭连接"""
        if self.client:
            self.client.close()
            print("[INFO] MongoDB连接已关闭")


def generate_main_field_id(task_id: str, field_id: str) -> str:
    """生成主字段ID

    格式: mf_{task_id}_{field_id}
    """
    return f"mf_{task_id}_{field_id}"


def generate_sub_field_id(main_field_id: str, field_id: str) -> str:
    """生成子字段ID

    格式: sf_{main_field_id}_{field_id}
    """
    return f"sf_{main_field_id}_{field_id}"