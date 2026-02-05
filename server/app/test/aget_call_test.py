import os
import time

from dotenv import load_dotenv
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI

load_dotenv()


# 1. 配置智谱 AI 的调用环境
# 智谱 AI 的 API 基础路径是 https://open.bigmodel.cn/api/paas/v4/
base_url = os.getenv("MOONSHOT_BASE_URL")
model_name = os.getenv("MOONSHOT_MODEL")
api_key = os.getenv("MOONSHOT_API_KEY")



llm = ChatOpenAI(
    model=model_name,
    api_key=api_key,
    base_url=base_url,
    temperature=0.3
)


def test_concurrency():
    # 2. 模拟 5 个合同片段
    test_chunks = [
        "甲方应于协议签署后5个工作日内支付首笔款项100万元。若乙方未按期交付，需按日支付万分之五的违约金。",
        "本协议有效期为三年。任何一方欲提前终止，需提前30天书面通知对方，否则应承担赔偿责任。",
        "双方在履行合同过程中产生的争议，应首先通过友好协商解决；协商不成的，应提交至甲方所在地人民法院管辖。",
        "乙方提供的技术服务应符合国家相关安全标准。如因乙方原因导致数据泄露，乙方承担全部赔偿责任。",
        "未经对方书面同意，任何一方不得向第三方披露本协议的内容及在履行协议过程中获悉的对方商业秘密。"
    ]

    # 3. 构造提示词列表
    prompts = []
    for i, chunk in enumerate(test_chunks):
        prompt_content = f"""
        你是一个专业的法律合同审查智能体。请分析以下合同文本片段，识别其中的法律风险点。

        文本片段：{chunk}

        请只输出纯 JSON 数组，包含 title, type, description 字段。
        """
        prompts.append([
            SystemMessage(content="You are a helpful legal assistant."),
            HumanMessage(content=prompt_content)
        ])

    print(f"--- 开始测试，共 {len(prompts)} 个请求 ---\n")

    # --- 测试串行 (Serial) ---
    print("正在执行：串行调用 (invoke)...")
    start_serial = time.time()
    serial_results = []
    for p in prompts:
        try:
            res = llm.invoke(p)
            serial_results.append(res)
            print(".", end="", flush=True)  # 每完成一个打个点
        except Exception as e:
            print(f"串行单次请求失败: {e}")

    end_serial = time.time()
    serial_duration = end_serial - start_serial
    print(f"\n串行总耗时: {serial_duration:.2f} 秒")

    print("-" * 30)

    # --- 测试并发 (Batch) ---
    print("正在执行：并发调用 (batch)...")
    start_batch = time.time()
    try:
        # batch 默认会根据环境变量或内部设置开启多线程并行
        batch_results = llm.batch(prompts)
        print("Done!")
    except Exception as e:
        print(f"Batch 调用失败: {e}")
        batch_results = []

    end_batch = time.time()
    batch_duration = end_batch - start_batch
    print(f"Batch 并发总耗时: {batch_duration:.2f} 秒")

    # --- 结果分析 ---
    print("\n" + "=" * 30)
    print(f"效率提升: {(serial_duration / batch_duration):.2f} 倍")

    if batch_duration < serial_duration * 0.7:
        print("结论：并发生效！Batch 模式明显快于串行。")
    else:
        print("结论：并发可能未完全生效。请检查网络延迟或 API 限制。")
    print("=" * 30)


if __name__ == "__main__":
    test_concurrency()
