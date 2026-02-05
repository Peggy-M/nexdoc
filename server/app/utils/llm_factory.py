import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from app.utils.log_utils import log


class LLMFactory:
    """LLM 实例化工厂类，支持多种模型供应商切换"""

    # 预定义供应商配置映射关系
    # 格式: {别名: (API_KEY_ENV, BASE_URL_ENV, DEFAULT_MODEL_ENV)}
    PROVIDERS = {
        "zhipu": ("ZHIPU_MOONSHOT_API_KEY", "ZHIPU_MOONSHOT_BASE_URL", "ZHIPU_MOONSHOT_MODEL"),
        "deepseek": ("DEEPSEEK_MOONSHOT_API_KEY", "DEEPSEEK_MOONSHOT_BASE_URL", "DEEPSEEK_MOONSHOT_MODEL"),
        "openai": ("OPENAI_API_KEY", "OPENAI_BASE_URL", "OPENAI_MODEL")
    }

    @classmethod
    def get_llm(cls, provider: str = "zhipu", **kwargs) -> ChatOpenAI:
        """
        获取 LLM 实例
        :param provider: 供应商名称 ('zhipu', 'deepseek', 'openai')
        :param kwargs: 覆盖默认配置的参数，如 temperature, model_name 等
        """
        load_dotenv()

        if provider not in cls.PROVIDERS:
            raise ValueError(f"Unsupported provider: {provider}. Available: {list(cls.PROVIDERS.keys())}")

        key_env, url_env, model_env = cls.PROVIDERS[provider]

        api_key = os.getenv(key_env)
        base_url = os.getenv(url_env)
        model_name = kwargs.get("model") or os.getenv(model_env)

        if not api_key:
            log.error(f"API Key for {provider} ({key_env}) is missing!")
            raise ValueError(f"Missing API Key for {provider}")

        log.info(f"Initializing LLM: Provider={provider}, Model={model_name}, BaseURL={base_url}")

        # 统一使用 ChatOpenAI 接口，因为智谱、DeepSeek 都兼容 OpenAI 协议
        return ChatOpenAI(
            model=model_name,
            api_key=api_key,
            base_url=base_url,
            temperature=kwargs.get("temperature", 0.3),
            max_retries=kwargs.get("max_retries", 3),
            # 这里可以根据需要添加更多默认参数
        )
