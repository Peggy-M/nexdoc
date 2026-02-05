import os
from jinja2 import Environment, FileSystemLoader
from datetime import datetime
from playwright.async_api import async_playwright

import shutil
import urllib.request

from app.utils.log_utils import log


class ExportService:
    def __init__(self):
        # 1. 获取当前文件所在的绝对目录
        current_dir = os.path.dirname(os.path.abspath(__file__))

        # 2. 标准化模板目录路径
        template_path = os.path.abspath(os.path.join(current_dir, '../templates'))
        self.template_env = Environment(
            loader=FileSystemLoader(template_path)
        )

        # 3. 标准化资产/字体目录路径 (Playwright handles fonts via CSS, but we keep this structure)
        self.assets_dir = os.path.abspath(os.path.join(current_dir, '../assets/fonts'))
        if not os.path.exists(self.assets_dir):
            os.makedirs(self.assets_dir, exist_ok=True)

        # Playwright doesn't need explicit font registration in Python, 
        # it uses system fonts or web fonts defined in CSS.

    async def generate_pdf(self, contract_name: str, analysis_results: list, output_path: str):
        """生成审查报告 PDF (使用 Playwright 渲染 HTML)"""
        template = self.template_env.get_template('report.html')

        # Prepare data
        high_count = len([r for r in analysis_results if r['type'] == 'high'])
        medium_count = len([r for r in analysis_results if r['type'] == 'medium'])
        low_count = len([r for r in analysis_results if r['type'] == 'low'])

        context = {
            'contract_name': contract_name,
            'date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'total_risks': len(analysis_results),
            'high_count': high_count,
            'medium_count': medium_count,
            'low_count': low_count,
            'analysis_results': analysis_results,
        }

        html_content = template.render(**context)
        
        # Save HTML to a temporary file for Playwright to load
        temp_html_path = output_path.replace('.pdf', '.html')
        try:
            with open(temp_html_path, "w", encoding="utf-8") as f:
                f.write(html_content)
            
            # Convert file path to file URL
            file_url = f"file:///{os.path.abspath(temp_html_path).replace(os.sep, '/')}"
            
            log.info(f"Generating PDF using Playwright from {file_url}")

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                await page.goto(file_url, wait_until="networkidle")
                
                await page.pdf(
                    path=output_path,
                    format="A4",
                    print_background=True,
                    margin={
                        "top": "1.5cm",
                        "bottom": "1.5cm",
                        "left": "1.5cm",
                        "right": "1.5cm"
                    },
                    display_header_footer=False # header/footer handled via CSS @page or custom template if needed
                )
                await browser.close()

            log.info(f"PDF generated successfully at {output_path}")
            return True

        except Exception as e:
            log.error(f"Failed to generate PDF with Playwright: {e}")
            import traceback
            log.error(traceback.format_exc())
            return False
        finally:
            # Clean up temp HTML
            if os.path.exists(temp_html_path):
                try:
                    os.remove(temp_html_path)
                except:
                    pass
