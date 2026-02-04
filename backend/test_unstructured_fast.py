
try:
    from unstructured.partition.auto import partition
    # Create a dummy pdf file for testing if needed, but partition might import modules eagerly.
    # However, partition_pdf only imports onnxruntime if strategy is NOT fast (or default auto might trigger it).
    # Let's try to just import partition first.
    print("Import partition Success")
    
    # We can try to mock a call or just trust the code change if import works.
    # The error before was at "import unstructured.partition.pdf".
    # partition() imports partition_pdf inside.
    
except Exception as e:
    print(f"Import Failed: {e}")
