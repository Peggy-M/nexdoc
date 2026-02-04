
import os
from unstructured.partition.auto import partition

file_path = r"f:\work-space\code\Kimi_Agent_LexGuard AI\backend\uploads\1770196847_政府采购服务类信息化项目.pdf"

if not os.path.exists(file_path):
    print("File not found")
else:
    try:
        elements = partition(filename=file_path, strategy="fast")
        text = "\n\n".join([str(el) for el in elements])
        print(f"Successfully parsed {len(text)} characters.")
        print("First 100 chars:", text[:100])
    except Exception as e:
        print(f"Parsing failed: {e}")
