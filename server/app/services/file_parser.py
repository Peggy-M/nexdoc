import os
from unstructured.partition.auto import partition

class FileParser:
    @staticmethod
    def extract_text(file_path: str) -> str:
        """
        Extract text from file using unstructured library.
        Supports PDF, DOCX, TXT, PPTX, HTML, etc.
        """
        try:
            # unstructured's auto partition detects file type and uses appropriate parser
            # strategy="fast" uses pypdf for PDFs, avoiding heavy dependencies like onnxruntime/tesseract
            # languages=["chi_sim", "eng"] helps suppress warnings and prepare for OCR if needed
            elements = partition(filename=file_path, strategy="fast", languages=["chi_sim", "eng"])
            
            # Combine all elements into a single string
            # Elements can be Title, NarrativeText, ListItem, etc.
            text = "\n\n".join([str(el) for el in elements])
            return text
            
        except Exception as e:
            print(f"Error parsing file with unstructured: {e}")
            # Fallback or re-raise depending on requirements
            return ""
