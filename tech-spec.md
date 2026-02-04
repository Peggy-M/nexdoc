# NexDoc AI 技术规格文档

## 组件清单

### shadcn/ui 组件
- Button - 主要交互按钮
- Card - 功能卡片、定价卡片
- Accordion - FAQ 手风琴效果
- Badge - 标签展示
- Switch - 月付/年付切换

### 自定义组件
- MagneticButton - 磁性吸附按钮
- ParallaxImage - 视差滚动图像
- FloatingElement - 浮动动画元素
- GlitchImage - 故障效果图像
- CircuitLine - SVG 电路连接线
- HolographicCard - 全息光泽卡片
- TextReveal - 文字揭示动画
- InfiniteScroll - 无限滚动组件

## 动画实现方案

| 动画效果 | 库 | 实现方式 | 复杂度 |
|---------|-----|---------|--------|
| 文字交错揭示 | GSAP + SplitType | SplitType 分割文字，GSAP stagger 动画 | 高 |
| 3D 仪表盘倾斜 | CSS + React | transform: perspective + rotateX/Y | 中 |
| 视差滚动 | GSAP ScrollTrigger | scrub: true, y 轴位移 | 中 |
| 磁性按钮 | React + CSS | onMouseMove 计算偏移，transform | 中 |
| 无限滚动标志 | CSS Animation | translateX 无限循环 | 低 |
| 故障效果 | CSS + GSAP | clip-path 切片 + 位移 | 高 |
| SVG 路径绘制 | GSAP DrawSVGPlugin | stroke-dashoffset 动画 | 中 |
| 全息卡片倾斜 | React + CSS | perspective + rotate3d + 光晕 | 高 |
| 手风琴展开 | GSAP | scaleY + height 动画 | 中 |
| 浮动元素 | CSS Animation | translateY 循环动画 | 低 |
| 背景网格渐变 | Three.js | ShaderMaterial 噪点动画 | 高 |
| 滚动模糊消失 | GSAP ScrollTrigger | filter: blur 动画 | 低 |

## 项目结构

```
app/
├── src/
│   ├── sections/
│   │   ├── Hero.tsx           # 主视觉区
│   │   ├── LogoStream.tsx     # 标志展示流
│   │   ├── FeatureParsing.tsx # 功能展示-解析
│   │   ├── FeatureCompliance.tsx # 功能展示-合规
│   │   ├── FeatureCollaboration.tsx # 功能展示-协作
│   │   ├── HowItWorks.tsx     # 工作原理
│   │   ├── Testimonials.tsx   # 客户评价
│   │   ├── Pricing.tsx        # 定价
│   │   ├── FAQ.tsx            # 常见问题
│   │   └── CTA.tsx            # 行动号召
│   ├── components/
│   │   ├── MagneticButton.tsx
│   │   ├── ParallaxImage.tsx
│   │   ├── FloatingElement.tsx
│   │   ├── GlitchImage.tsx
│   │   ├── CircuitLine.tsx
│   │   ├── HolographicCard.tsx
│   │   ├── TextReveal.tsx
│   │   ├── InfiniteScroll.tsx
│   │   └── GradientBackground.tsx
│   ├── hooks/
│   │   ├── useMousePosition.ts
│   │   ├── useScrollProgress.ts
│   │   └── useSmoothScroll.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── images/
├── index.html
└── package.json
```

## 依赖安装

```bash
# 动画库
npm install gsap @gsap/react lenis split-type

# 图标
npm install lucide-react

# 其他
npm install clsx tailwind-merge
```

## 性能优化策略

1. **GPU 加速**: 所有动画使用 transform 和 opacity
2. **懒加载**: 图像使用 loading="lazy"
3. **Will-change**: 对频繁动画元素添加 will-change: transform
4. **减少动效**: 支持 prefers-reduced-motion 媒体查询
5. **代码分割**: 动态导入重型组件

## 响应式断点

- Desktop: 1280px+
- Tablet: 768px - 1279px
- Mobile: < 768px

## 颜色变量 (Tailwind)

```javascript
// tailwind.config.js
colors: {
  primary: '#d2f900',
  secondary: '#1f1f1f',
  background: '#ffffff',
  foreground: '#000000',
  muted: '#4d4d4d',
}
```
