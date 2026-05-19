from pymongo import MongoClient, errors
from typing import Optional
import os

class MongoStore:
    def __init__(self, uri: Optional[str] = None, dbname: str = 'mianshizuoye'):
        uri = uri or os.environ.get('MONGO_URI') or 'mongodb://mongo-service.gms:27017/mianshizuoye'
        self.client = MongoClient(uri)
        self.db = self.client[dbname]
        self._ensure_indexes()

    def _ensure_indexes(self):
        try:
            self.db.tasks.create_index([('task_id',1)], unique=True)
            self.db.main_fields.create_index([('task_id',1),('name',1)], unique=False)
            self.db.sub_fields.create_index([('task_id',1),('main_field_id',1),('name',1)], unique=True)
        except errors.PyMongoError:
            pass

    def insert_task(self, doc: dict):
        return self.db.tasks.insert_one(doc)

    def insert_main_field(self, doc: dict):
        return self.db.main_fields.insert_one(doc)

    def insert_sub_field(self, doc: dict):
        return self.db.sub_fields.insert_one(doc)

    def upsert_extracted_document(self, task_id: str, doc: dict):
        return self.db.extracted_documents.update_one({'task_id':task_id}, {'$set':{'data':doc,'updated_at':doc.get('updated_at')}}, upsert=True)
