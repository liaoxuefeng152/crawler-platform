from pathlib import Path
from typing import Optional
from ruamel.yaml import YAML

from .schemas import AppConfig

class ConfigLoader:
    def __init__(self, path: Optional[str] = None):
        self.path = Path(path or 'config.yaml')
        self.yaml = YAML()

    def load(self) -> AppConfig:
        with self.path.open('r', encoding='utf-8') as f:
            data = self.yaml.load(f)
        return AppConfig.parse_obj(data)
