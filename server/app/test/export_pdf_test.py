import os
from xhtml2pdf import pisa
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from app.utils.log_utils import log


def generate_pdf():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    html_path = os.path.join(current_dir, 'resource', 'test.html')
    output_path = os.path.join(current_dir, 'resource', 'test.pdf')

    # 1. 获取字体的绝对路径
    font_path = os.path.normpath("F:/work-space/code/NEXDOC_AI/server/app/assets/fonts/simhei.ttf")

    if not os.path.exists(font_path):
        log.error(f"找不到字体文件: {font_path}")
        return False

    try:
        # --- 核心修复：手动向底层引擎注册字体 ---
        # 这样 PDF 引擎就直接记住了 "ChineseFont" 对应那个物理文件
        # 不再需要 CSS 去加载，也就不会产生 Temp 文件
        pdfmetrics.registerFont(TTFont('ChineseFont', font_path))
        log.info("字体注册成功！")

        # 2. 读取 HTML
        with open(html_path, "r", encoding="utf-8") as f:
            html_content = f.read()

        # 3. 生成 PDF
        with open(output_path, "wb") as output_file:
            pisa_status = pisa.CreatePDF(
                src=html_content,
                dest=output_file,
                encoding='utf-8'
            )

        if pisa_status.err:
            log.info(f"PDF generation error: {pisa_status.err}")
            return False

        log.info(f"PDF 成功生成到: {output_path}")
        return True

    except Exception as e:
        log.error(f"Failed to build PDF: {e}")
        return False


if __name__ == "__main__":
    generate_pdf()