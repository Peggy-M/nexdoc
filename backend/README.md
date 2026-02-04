# NexDoc AI Backend

这是一个基于 FastAPI 的后端服务，为 NexDoc AI 提供合同分析 API。

## 环境要求

- Python 3.8+
- Windows (目前脚本适配 Windows)

## 快速启动

双击运行根目录下的 `start_backend.bat` 即可。

## 手动启动

1. 进入后端目录：
   ```powershell
   cd backend
   ```

2. 创建并激活虚拟环境（如果尚未创建）：
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. 安装依赖：
   ```powershell
   pip install -r requirements.txt
   ```

4. 启动服务：
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```

服务启动后，API 文档地址：
- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc
