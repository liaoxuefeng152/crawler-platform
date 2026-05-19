from pydantic import BaseModel, Field
from typing import List, Optional

class FieldDefinition(BaseModel):
    name: str
    description: str
    type_hint: Optional[str] = None

class CrawlerConfig(BaseModel):
    user_agent: str = Field(...)
    request_interval_seconds: float = 1.0
    max_retries: int = 2
    output_dir: str = './output'

class MongoConfig(BaseModel):
    uri: str = Field(...)
    dbname: str = 'mianshizuoye'

class NewApiConfig(BaseModel):
    url: str = ''
    api_key: Optional[str] = None
    timeout: int = 15
    retries: int = 2

class AppConfig(BaseModel):
    mongo: MongoConfig
    new_api: NewApiConfig
    crawler: CrawlerConfig
    fields: List[FieldDefinition] = []
