
try:
    from unstructured.partition.pdf import partition_pdf
    print("Import Success")
except Exception as e:
    print(f"Import Failed: {e}")
