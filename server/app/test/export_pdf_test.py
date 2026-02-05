import os
import sys
from playwright.sync_api import sync_playwright

def generate_pdf():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    html_path = os.path.join(current_dir, 'resource', 'test.html')
    output_path = os.path.join(current_dir, 'resource', 'test.pdf')
    
    # Convert file path to file URL
    # Playwright expects file:///C:/path/to/file on Windows
    file_url = f"file:///{html_path.replace(os.sep, '/')}"
    
    print(f"DEBUG: HTML URL: {file_url}")
    print(f"DEBUG: Output Path: {output_path}")

    try:
        with sync_playwright() as p:
            # Launch browser
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            # Navigate to the local HTML file
            # wait_until="networkidle" ensures all resources (like fonts) are loaded
            page.goto(file_url, wait_until="networkidle")
            
            # Generate PDF
            # format='A4' handles the page size
            # print_background=True ensures background colors/images are printed
            page.pdf(
                path=output_path,
                format="A4",
                print_background=True,
                margin={
                    "top": "1.5cm",
                    "bottom": "1.5cm",
                    "left": "1.5cm",
                    "right": "1.5cm"
                },
                display_header_footer=False
            )
            
            browser.close()
            
        print(f"SUCCESS: PDF generated at {output_path}")
        return True
        
    except Exception as e:
        print(f"ERROR: Failed to generate PDF: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    generate_pdf()
