"""setup.py - 包安装配置"""

from setuptools import setup, find_packages

setup(
    name="zhuwen_crawler",
    version="1.0.0",
    description="网页爬虫与数据提取工具",
    author="Claude Code",
    packages=find_packages(),
    install_requires=[
        "requests>=2.28.0",
        "beautifulsoup4>=4.12.0",
        "lxml>=4.9.0",
        "pyyaml>=6.0",
        "chardet>=5.0.0",
        "pymongo>=4.3.0",
    ],
    entry_points={
        "console_scripts": [
            "zhuwen-crawler=zhuwen_crawler.__main__:main",
        ],
    },
    python_requires=">=3.8",
)