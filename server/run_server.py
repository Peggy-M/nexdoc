import uvicorn
import os
import sys

# 将当前目录添加到 Python 路径，确保能正确导入 app 模块
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # 在 PyCharm 中运行此文件即可启动调试
    # reload=True 在调试模式下可能会导致断点失效，建议调试时设为 False
    # 但为了开发方便，这里默认设为 True。如果断点不工作，请改为 False。
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
