import sys
import os

try:
    from loguru import logger
    
    # 获得当前项目的绝对路径
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    log_dir = os.path.join(root_dir, "logs")  # 存放项目日志目录的绝对路径
    
    if not os.path.exists(log_dir):  # 如果日志目录不存在，则创建
        os.makedirs(log_dir, exist_ok=True)
        
    # Remove default handler
    logger.remove()
    
    # Add console handler
    logger.add(sys.stdout, level='INFO',
               format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
                      "<level>{level: <8}</level> | "
                      "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
                      "<level>{message}</level>")
                      
    # Add file handler
    logger.add(os.path.join(log_dir, "app.log"),
               rotation="10 MB",
               retention="10 days",
               level="INFO",
               encoding="utf-8")
               
    log = logger
    
except ImportError:
    class MockLogger:
        def info(self, msg): print(f"INFO: {msg}")
        def error(self, msg): print(f"ERROR: {msg}")
        def warning(self, msg): print(f"WARNING: {msg}")
        def debug(self, msg): print(f"DEBUG: {msg}")
        def exception(self, msg): print(f"ERROR: {msg}")
    log = MockLogger()
    print("WARNING: loguru not found, using MockLogger")

if __name__ == '__main__':
    # log.debug("This is a debug message.")
    # log.info("This is an info message.")
    # log.warning('这是一个警告')
    # log.trace('xxxx')
    print('str.pdf'['str.pdf'.rindex('.'):])
    # @log.catch  # 整个函数自动加上try， catch。自动捕获异常，并且通过日志打印
    def test():
        try:
            print(3/0)
        except ZeroDivisionError as e:
            # log.error(e)
            log.exception(e)  # 以后常用
    test()
