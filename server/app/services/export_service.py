import os
from xhtml2pdf import pisa
from jinja2 import Environment, FileSystemLoader
from datetime import datetime

import shutil
import urllib.request

class ExportService:
    def __init__(self):
        self.template_env = Environment(
            loader=FileSystemLoader(os.path.join(os.path.dirname(__file__), '../templates'))
        )
        self.assets_dir = os.path.join(os.path.dirname(__file__), '../assets/fonts')
        if not os.path.exists(self.assets_dir):
            os.makedirs(self.assets_dir)
        self.font_path = self._prepare_chinese_font()

    def _path_to_url(self, path):
        """Convert a system path to a file URL, handling spaces and special chars."""
        if not path:
            return ""
        # pathname2url returns ///C:/path... on Windows, which is what we want for file: protocol
        url_path = urllib.request.pathname2url(path)
        # Ensure it starts with file:
        if not url_path.startswith("file:"):
             return f"file:{url_path}"
        return url_path

    def _prepare_chinese_font(self):
        """Find and copy a suitable Chinese font to assets."""
        # Target local font path
        local_font_name = "simhei.ttf"
        local_font_path = os.path.abspath(os.path.join(self.assets_dir, local_font_name))
        
        # If already exists, return URL
        if os.path.exists(local_font_path):
             return self._path_to_url(local_font_path)

        # System font candidates
        font_paths = [
            "C:\\Windows\\Fonts\\simhei.ttf",  # 黑体 (Most reliable for xhtml2pdf)
            "C:\\Windows\\Fonts\\msyh.ttc",    # 微软雅黑 TTC
            "C:\\Windows\\Fonts\\simsun.ttc",  # 宋体 TTC
        ]
        
        for path in font_paths:
            if os.path.exists(path):
                try:
                    shutil.copy(path, local_font_path)
                    print(f"Copied font from {path} to {local_font_path}")
                    return self._path_to_url(local_font_path)
                except Exception as e:
                    print(f"Failed to copy font {path}: {e}")
                    # If copy fails, fallback to system path
                    return self._path_to_url(path)
        
        return ""

    def generate_pdf(self, contract_name: str, analysis_results: list, output_path: str):
        """生成审查报告 PDF (使用 HTML 模板)"""
        template = self.template_env.get_template('report.html')
        
        # Prepare data
        high_count = len([r for r in analysis_results if r['type'] == 'high'])
        medium_count = len([r for r in analysis_results if r['type'] == 'medium'])
        low_count = len([r for r in analysis_results if r['type'] == 'low'])
        
        context = {
            'contract_name': contract_name,
            'date': datetime.now().strftime("%Y-%m-%d"),
            'total_risks': len(analysis_results),
            'high_count': high_count,
            'medium_count': medium_count,
            'low_count': low_count,
            'analysis_results': analysis_results,
            'font_path': self.font_path
        }
        
        html_content = template.render(**context)
        
        try:
            with open(output_path, "wb") as output_file:
                pisa_status = pisa.CreatePDF(
                    html_content,
                    dest=output_file,
                    encoding='utf-8'
                )
            
            if pisa_status.err:
                print(f"PDF generation error: {pisa_status.err}")
                return False
                
            return True
        except Exception as e:
            print(f"Failed to build PDF: {e}")
            return False
