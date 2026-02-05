import uvicorn
import os
import sys
import asyncio
import platform

# 将当前目录添加到 Python 路径，确保能正确导入 app 模块
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # Fix for Playwright on Windows: ensure ProactorEventLoop is used
    if platform.system() == 'Windows':
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

    # 在 PyCharm 中运行此文件即可启动调试
    # reload=True 在调试模式下可能会导致断点失效，建议调试时设为 False
    # 但为了开发方便，这里默认设为 True。如果断点不工作，请改为 False。
    # 注意：在 Windows 上使用 Playwright 时，reload=True 会导致子进程使用错误的事件循环，从而引发 NotImplementedError。
    # 因此这里必须设置为 False。
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
