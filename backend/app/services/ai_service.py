import json
import os
from typing import List, Dict, Any, TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.services.file_parser import FileParser

# 定义 State 类型
class AgentState(TypedDict):
    file_path: str
    contract_text: str
    risks: List[Dict[str, Any]]
    error: str

class AIService:
    def __init__(self):
        # Debug: Print environment variable status (don't print values)
        moonshot_key = os.getenv("MOONSHOT_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")
        print(f"DEBUG: MOONSHOT_API_KEY present: {bool(moonshot_key)}")
        print(f"DEBUG: OPENAI_API_KEY present: {bool(openai_key)}")
        
        self.api_key = moonshot_key or openai_key
        self.base_url = os.getenv("MOONSHOT_BASE_URL") or "https://api.moonshot.cn/v1"
        self.model_name = os.getenv("MOONSHOT_MODEL") or "moonshot-v1-8k"
        
        if self.api_key:
            self.llm = ChatOpenAI(
                model=self.model_name,
                api_key=self.api_key,
                base_url=self.base_url,
                temperature=0.3
            )
        else:
            self.llm = None
            
        self.workflow = self._build_graph()

    def _build_graph(self):
        """Build the LangGraph workflow."""
        workflow = StateGraph(AgentState)

        # Define nodes
        workflow.add_node("parse_file", self._parse_file_node)
        workflow.add_node("analyze_risks", self._analyze_risks_node)
        workflow.add_node("validate_format", self._validate_format_node)

        # Define edges
        workflow.set_entry_point("parse_file")
        workflow.add_edge("parse_file", "analyze_risks")
        workflow.add_edge("analyze_risks", "validate_format")
        workflow.add_edge("validate_format", END)

        return workflow.compile()

    def _parse_file_node(self, state: AgentState):
        """Node: Parse file content using FileParser."""
        print("--- Node: Parsing File ---")
        file_path = state["file_path"]
        
        try:
            text = FileParser.extract_text(file_path)
            if not text:
                return {"error": f"Failed to extract text from {file_path}", "contract_text": ""}
            return {"contract_text": text}
        except Exception as e:
            return {"error": str(e), "contract_text": ""}

    def _analyze_risks_node(self, state: AgentState):
        """Node: Analyze contract text to identify risks."""
        print("--- Node: Analyzing Risks ---")
        if state.get("error"):
            return {"risks": []}
            
        text = state["contract_text"]
        
        # Truncate for token limit safety (simple approach)
        truncated_text = text[:15000]

        prompt = f"""
        你是一个专业的法律合同审查智能体。请分析以下合同文本，识别其中的法律风险点。
        
        合同文本片段：
        {truncated_text}
        
        请输出 JSON 格式的结果，包含一个列表，每个元素包含以下字段：
        - id: 整数序号
        - title: 风险标题 (简短)
        - type: 风险等级 (只能是 "high", "medium", "low" 之一)
        - description: 详细的风险描述
        - suggestion: 修改建议
        - clause: 相关的原文条款片段 (如果找不到原文，留空)

        请只输出纯 JSON 数组，不要包含 markdown ```json 标记。
        """

        try:
            response = self.llm.invoke([
                SystemMessage(content="You are a helpful legal assistant that outputs raw JSON."),
                HumanMessage(content=prompt)
            ])
            
            content = response.content
            # Cleanup Markdown if present
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            
            return {"risks": json.loads(content)}
            
        except Exception as e:
            print(f"Error in analyze_risks: {e}")
            return {"error": str(e), "risks": []}

    def _validate_format_node(self, state: AgentState):
        """Node: Validate and clean up the risk data structure."""
        print("--- Node: Validating Format ---")
        if state.get("error"):
            return {"risks": []}

        risks = state.get("risks", [])
        
        # Handle case where LLM returns a dict {"risks": [...]} instead of list
        if isinstance(risks, dict):
            for key, value in risks.items():
                if isinstance(value, list):
                    risks = value
                    break
        
        if not isinstance(risks, list):
            risks = []

        # Ensure all required fields exist
        validated_risks = []
        for idx, risk in enumerate(risks):
            if not isinstance(risk, dict):
                continue
                
            validated_risks.append({
                "id": risk.get("id", idx + 1),
                "title": risk.get("title", "Unknown Risk"),
                "type": risk.get("type", "medium"), # Default to medium
                "description": risk.get("description", "No description provided"),
                "suggestion": risk.get("suggestion", ""),
                "clause": risk.get("clause", "")
            })
            
        return {"risks": validated_risks}

    def process_file(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Public entry point to run the graph starting from a file path.
        """
        if not self.llm:
            print("Warning: No API Key provided. Returning mock data.")
            return self._get_mock_results()

        initial_state = {
            "file_path": file_path, 
            "contract_text": "", 
            "risks": [], 
            "error": ""
        }
        
        try:
            final_state = self.workflow.invoke(initial_state)
            
            if final_state.get("error"):
                print(f"Workflow Error: {final_state['error']}")
                # In a real app, we might want to return the error to the user
                # For now, returning empty list or mock data
                return [] 
                
            return final_state["risks"]
            
        except Exception as e:
            print(f"Graph execution failed: {e}")
            return self._get_mock_results()

    def _get_mock_results(self):
        return [
          {
            "id": 1,
            "title": "（演示数据）API Key 未配置",
            "type": "high",
            "description": "检测到后端未配置 MOONSHOT_API_KEY，系统自动降级为演示模式。",
            "suggestion": "请在 backend/.env 文件中配置有效的 API Key 以启用真实 AI 分析。",
            "clause": "System Config Error",
          }
        ]
