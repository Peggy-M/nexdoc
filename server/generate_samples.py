import os
import asyncio
from playwright.async_api import async_playwright

# Sample Content
SAMPLES = [
    {
        "filename": "服务协议模板.pdf",
        "title": "软件开发技术服务协议",
        "content": """
        <h1>软件开发技术服务协议</h1>
        <p><strong>甲方：</strong>某某科技有限公司</p>
        <p><strong>乙方：</strong>某某软件服务提供商</p>
        
        <h2>第一条 服务内容</h2>
        <p>1.1 乙方应向甲方提供定制化软件开发服务，具体需求见附件。</p>
        <p>1.2 乙方有权根据实际情况自行调整开发计划，无需经过甲方同意。</p>
        
        <h2>第二条 验收标准</h2>
        <p>2.1 软件交付后，甲方应在3日内完成验收。如甲方未在3日内提出书面异议，视为验收通过。</p>
        <p>2.2 验收标准以乙方开发完成时的实际功能为准。</p>
        
        <h2>第三条 知识产权</h2>
        <p>3.1 本项目产生的所有代码及文档的知识产权归乙方所有，甲方仅拥有使用权。</p>
        
        <h2>第四条 费用与支付</h2>
        <p>4.1 服务费用总计人民币 500,000 元。</p>
        <p>4.2 甲方应在合同签订后 3 个工作日内支付 100% 预付款。</p>
        
        <h2>第五条 违约责任</h2>
        <p>5.1 若甲方延迟支付费用，每逾期一日，需支付合同总额 5% 的违约金。</p>
        <p>5.2 若乙方延迟交付，乙方仅需承担延迟交付部分的直接损失，且赔偿上限不超过合同总额的 1%。</p>
        
        <h2>第六条 合同解除</h2>
        <p>6.1 乙方有权在提前 7 天通知甲方的情况下单方面解除合同，且无需承担违约责任。</p>
        """
    },
    {
        "filename": "劳动合同示例.pdf",
        "title": "高级工程师劳动合同书",
        "content": """
        <h1>劳动合同书</h1>
        <p><strong>甲方：</strong>某某集团有限公司</p>
        <p><strong>乙方：</strong>张三</p>
        
        <h2>第一条 合同期限</h2>
        <p>本合同为固定期限劳动合同，自 2026年1月1日 起至 2029年1月1日 止，试用期 6 个月。</p>
        
        <h2>第二条 工作内容与地点</h2>
        <p>2.1 乙方担任 高级工程师 职位。</p>
        <p>2.2 甲方有权根据公司业务需要，随时调整乙方的工作岗位和工作地点，乙方不得拒绝。</p>
        
        <h2>第三条 工作时间</h2>
        <p>3.1 公司实行不定时工作制，乙方应根据工作任务需要配合加班，且无加班费。</p>
        
        <h2>第四条 劳动报酬</h2>
        <p>4.1 乙方月工资为人民币 20,000 元（包含加班费及各类补贴）。</p>
        <p>4.2 试用期工资为转正工资的 60%。</p>
        
        <h2>第五条 竞业限制</h2>
        <p>5.1 乙方离职后 2 年内，不得从事与甲方业务类似的工作。</p>
        <p>5.2 甲方无需向乙方支付竞业限制补偿金。</p>
        
        <h2>第六条 违约责任</h2>
        <p>6.1 若乙方在合同期内单方面提出辞职，需向甲方支付人民币 100,000 元的违约金。</p>
        """
    },
    {
        "filename": "采购合同范本.pdf",
        "title": "大宗物资采购合同",
        "content": """
        <h1>物资采购合同</h1>
        <p><strong>买方：</strong>某某制造厂</p>
        <p><strong>卖方：</strong>某某原材料贸易公司</p>
        
        <h2>第一条 标的物</h2>
        <p>钢材，规格型号 X，数量 100 吨，单价 5,000 元/吨，总价 500,000 元。</p>
        
        <h2>第二条 交货</h2>
        <p>2.1 卖方应于 2026年3月1日 前将货物交付至买方指定仓库。</p>
        <p>2.2 因不可抗力或第三方原因导致交货延迟，卖方不承担责任。</p>
        
        <h2>第三条 质量标准</h2>
        <p>3.1 货物按“现状”交付，卖方不对货物的隐蔽瑕疵承担责任。</p>
        
        <h2>第四条 付款方式</h2>
        <p>4.1 货到验收合格后，买方在 180 个工作日内支付货款。</p>
        
        <h2>第五条 争议解决</h2>
        <p>5.1 双方发生争议，应提交卖方所在地人民法院管辖。</p>
        """
    }
]

async def generate_samples():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(base_dir, "app/assets/sample_contracts")
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        
        for sample in SAMPLES:
            page = await browser.new_page()
            html_content = f"""
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <style>
                    body {{ font-family: "Microsoft YaHei", sans-serif; padding: 40px; }}
                    h1 {{ text-align: center; margin-bottom: 30px; }}
                    h2 {{ margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }}
                    p {{ line-height: 1.8; margin-bottom: 10px; text-align: justify; }}
                </style>
            </head>
            <body>
                {sample['content']}
            </body>
            </html>
            """
            await page.set_content(html_content)
            
            output_path = os.path.join(output_dir, sample['filename'])
            await page.pdf(path=output_path, format="A4")
            print(f"Generated: {output_path}")
            
            await page.close()
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(generate_samples())
