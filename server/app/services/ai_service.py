import json
import os
from typing import List, Dict, Any, TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.services.file_parser import FileParser
from app.utils.llm_factory import LLMFactory
from app.utils.log_utils import log


# 定义 State 类型
class AgentState(TypedDict):
    file_path: str
    contract_text: str
    text_chunks: List[str]
    chunk_risks: List[Dict[str, Any]]
    risks: List[Dict[str, Any]]
    error: str

class AIService:
    def __init__(self):
        self.llm = LLMFactory.get_llm("zhipu")
        self.workflow = self._build_graph()

    def _build_graph(self):
        """Build the LangGraph workflow."""
        workflow = StateGraph(AgentState)

        # Define nodes
        workflow.add_node("parse_file", self._parse_file_node)
        workflow.add_node("split_text", self._split_text_node)
        workflow.add_node("map_risks", self._map_risks_node)
        workflow.add_node("reduce_risks", self._reduce_risks_node)
        workflow.add_node("validate_format", self._validate_format_node)

        # Define edges
        workflow.set_entry_point("parse_file")
        workflow.add_edge("parse_file", "split_text")
        workflow.add_edge("split_text", "map_risks")
        workflow.add_edge("map_risks", "reduce_risks")
        workflow.add_edge("reduce_risks", "validate_format")
        workflow.add_edge("validate_format", END)

        return workflow.compile()

    def _parse_file_node(self, state: AgentState):
        """Node: Parse file content using FileParser."""
        log.info("--- Node: Parsing File ---")
        file_path = state["file_path"]
        
        try:
            text = FileParser.extract_text(file_path)
            if not text:
                return {"error": f"Failed to extract text from {file_path}", "contract_text": ""}
            return {"contract_text": text}
        except Exception as e:
            return {"error": str(e), "contract_text": ""}

    def _split_text_node(self, state: AgentState):
        """Node: Split text into chunks."""
        log.info("--- Node: Splitting Text ---")
        if state.get("error"):
            return {"text_chunks": []}
            
        text = state["contract_text"]
        # Use a large chunk size to fit context but allow parallel processing
        # 10k characters is roughly 5k-7k tokens depending on language (Chinese is denser)
        # Moonshot-8k can handle ~8k tokens. 
        # Safe bet: 6000 chars with overlap.
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=6000,
            chunk_overlap=1000,
            separators=["\n\n", "\n", "。", "；", ".", ";", " ", ""]
        )
        chunks = splitter.split_text(text)
        log.info(f"Split text into {len(chunks)} chunks.")
        return {"text_chunks": chunks}

    def _map_risks_node(self, state: AgentState):
        """Node: Analyze each chunk in parallel."""
        log.info("--- Node: Mapping Risks (Parallel Analysis) ---")
        if state.get("error"):
            return {"chunk_risks": []}
            
        chunks = state["text_chunks"]
        if not chunks:
             return {"chunk_risks": []}

        # Prepare batch prompts
        prompts = []
        for i, chunk in enumerate(chunks):
            prompt_content = f"""
            你是一个专业的法律合同审查智能体。请分析以下合同文本片段（这是完整合同的一部分），识别其中的法律风险点。
            
            合同文本片段 ({i+1}/{len(chunks)})：
            {chunk}
            
            请输出 JSON 格式的结果，包含一个列表，每个元素包含以下字段：
            - title: 风险标题 (简短)
            - type: 风险等级 (只能是 "high", "medium", "low" 之一)
            - category: 风险类别
            - description: 详细的风险描述
            - suggestion: 修改建议
            - clause: 相关的原文条款片段
            
            如果该片段中没有明显的法律风险，请返回空列表 []。
            请只输出纯 JSON 数组，不要包含 markdown ```json 标记。
            """
            prompts.append([
                SystemMessage(content="You are a helpful legal assistant that outputs raw JSON."),
                HumanMessage(content=prompt_content)
            ])

        try:
            # Execute in parallel using batch
            # Note: Depending on the LLM provider's rate limits, we might need to throttle this.
            # For now, we assume the provider can handle the concurrency of typical contract chunks (e.g., < 10 chunks).
            responses = self.llm.batch(prompts)
            
            all_chunk_risks = []
            for response in responses:
                content = response.content
                # Cleanup
                if content.startswith("```json"):
                    content = content[7:]
                if content.endswith("```"):
                    content = content[:-3]
                try:
                    risks = json.loads(content)
                    if isinstance(risks, list):
                        all_chunk_risks.extend(risks)
                except json.JSONDecodeError:
                    log.info(f"Failed to parse JSON from chunk response: {content[:100]}...")
                    continue
            
            return {"chunk_risks": all_chunk_risks}
            
        except Exception as e:
            log.info(f"Error in map_risks: {e}")
            return {"error": str(e), "chunk_risks": []}

    def _reduce_risks_node(self, state: AgentState):
        """Node: Aggregate and deduplicate risks."""
        log.info("--- Node: Reducing Risks (Aggregation) ---")
        if state.get("error"):
            return {"risks": []}
            
        chunk_risks = state.get("chunk_risks", [])
        if not chunk_risks:
            return {"risks": []}
            
        # Convert chunk risks to a string for the LLM to merge
        risks_json_str = json.dumps(chunk_risks, ensure_ascii=False, indent=2)
        
        prompt = f"""
        以下是从合同不同部分识别出的分散风险点列表。请你作为一个资深法务专家，对这些风险点进行汇总、去重和整理。
        
        分散的风险点列表：
        {risks_json_str}
        
        任务要求：
        1. **去重**：合并内容重复或非常相似的风险点。
        2. **整合**：如果同一个条款有多个相关风险，尽量合并为一个条目。
        3. **格式化**：输出最终的 JSON 列表，每个元素包含：
            - id: 整数序号 (从1开始重新编号)
            - title: 风险标题
            - type: 风险等级 ("high", "medium", "low")
            - category: 风险类别
            - description: 详细描述
            - suggestion: 修改建议
            - clause: 引用原文
            
        请只输出纯 JSON 数组。
        """
        
        try:
            response = self.llm.invoke([
                SystemMessage(content="You are a helpful legal assistant that outputs raw JSON."),
                HumanMessage(content=prompt)
            ])
            
            content = response.content
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
                
            final_risks = json.loads(content)
            return {"risks": final_risks}
            
        except Exception as e:
            log.info(f"Error in reduce_risks: {e}")
            # Fallback: just return the chunk risks with re-assigned IDs if merge fails
            formatted_risks = []
            for i, r in enumerate(chunk_risks):
                r["id"] = i + 1
                formatted_risks.append(r)
            return {"risks": formatted_risks}


    def _validate_format_node(self, state: AgentState):
        """Node: Validate and clean up the risk data structure."""
        log.info("--- Node: Validating Format ---")
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
            log.info("Warning: No API Key provided. Returning mock data.")
            return self._get_mock_results()

        initial_state = {
            "file_path": file_path, 
            "contract_text": "", 
            "text_chunks": [],
            "chunk_risks": [],
            "risks": [], 
            "error": ""
        }
        
        try:
            final_state = self.workflow.invoke(initial_state)
            
            if final_state.get("error"):
                log.info(f"Workflow Error: {final_state['error']}")
                # In a real app, we might want to return the error to the user
                # For now, returning empty list or mock data
                return [] 
                
            return final_state["risks"]
            
        except Exception as e:
            log.info(f"Graph execution failed: {e}")
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
