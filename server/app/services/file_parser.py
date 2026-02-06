from unstructured.partition.auto import partition
from pypdf import PdfReader
from app.utils.log_utils import log
import os

class FileParser:
    @staticmethod
    def extract_text(file_path: str) -> str:
        """
        Extract text from file.
        Uses pypdf for PDF files to avoid heavy dependencies and potential DLL errors.
        Uses unstructured for other file types (DOCX, PPTX, HTML, etc.).
        """
        try:
            # Ensure path is absolute and uses correct separators for the OS
            file_path = os.path.abspath(file_path)
            
            # Specialized handling for PDF to avoid unstructured's onnxruntime dependency issues
            if file_path.lower().endswith('.pdf'):
                try:
                    reader = PdfReader(file_path)
                    text_parts = []
                    for page in reader.pages:
                        extracted = page.extract_text()
                        if extracted:
                            text_parts.append(extracted)
                    return "\n\n".join(text_parts)
                except Exception as e:
                    log.error(f"pypdf extraction failed for {file_path}: {e}")
                    # If pypdf fails, we could try unstructured as fallback, 
                    # but if it's an environment issue, it might crash. 
                    # Let's try it anyway as a last resort or return empty.
                    log.info("Attempting fallback to unstructured...")

            # unstructured's auto partition detects file type and uses appropriate parser
            # strategy="fast" uses pypdf for PDFs, avoiding heavy dependencies like onnxruntime/tesseract
            # languages=["chi_sim", "eng"] helps suppress warnings and prepare for OCR if needed
            elements = partition(filename=file_path, strategy="fast", languages=["chi_sim", "eng"])
            
            # Combine all elements into a single string
            # Elements can be Title, NarrativeText, ListItem, etc.
            text = "\n\n".join([str(el) for el in elements])
            return text
            
        except Exception as e:
            log.info(f"Error parsing file with unstructured: {e}")
            # Fallback or re-raise depending on requirements
            return ""
