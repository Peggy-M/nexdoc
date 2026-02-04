import { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  Search,
  Edit3,
  Download,
  Clock,
  Zap
} from 'lucide-react';
import { MagneticButton } from '@/components/MagneticButton';
import { cn } from '@/lib/utils';

interface RiskItem {
  id: number;
  type: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestion: string;
  clause?: string;
}

export const DemoSection: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<number | null>(null);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clear the input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setUploadedFile(file.name);
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
          // 这里的上传没有做进度条，直接进入分析阶段展示“分析中”
          // 但为了用户体验，我们在上传时可以先不切换界面，或者加一个简单的 loading
          // DemoSection 的设计是上传即进入分析界面
          setStep('analyzing');
          setAnalysisProgress(10);

          const response = await fetch('/api/v1/contracts/upload', {
              method: 'POST',
              body: formData,
          });

          if (!response.ok) {
              throw new Error('Upload failed');
          }

          const data = await response.json();
          setUploadedFileId(data.id);
          
          // 上传完成后开始分析
          startAnalysis(data.id);

      } catch (error) {
          console.error("Upload error:", error);
          alert("上传失败，请重试");
          setStep('upload');
      }
  };

  const startAnalysis = async (id: number) => {
    setAnalysisProgress(30);
    
    // 模拟一个进度条动画，让用户感觉 AI 正在思考
    const interval = setInterval(() => {
      setAnalysisProgress(prev => (prev < 90 ? prev + 5 : prev));
    }, 100);

    try {
        const response = await fetch(`/api/v1/contracts/${id}/analysis`);
        
        if (!response.ok) {
            throw new Error("Analysis failed");
        }

        const data = await response.json();
        
        clearInterval(interval);
        setAnalysisProgress(100);

        setTimeout(() => {
            setRisks(data.results);
            setStep('results');
        }, 500);

    } catch (error) {
        clearInterval(interval);
        console.error("Analysis error:", error);
        alert("分析失败，请重试");
        setStep('upload');
    }
  };

  const resetDemo = () => {
    setStep('upload');
    setUploadedFile(null);
    setUploadedFileId(null);
    setSelectedRisk(null);
    setAnalysisProgress(0);
    setRisks([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFixAll = () => {
    alert("所有问题已一键修复！(演示功能)");
  };

  const handleExport = () => {
    alert("审查报告已开始下载！(演示功能)");
  };

  const handleApplyFix = () => {
    alert("已应用 AI 修改建议！(演示功能)");
  };

  const handleIgnoreRisk = () => {
    alert("已忽略该风险提示！(演示功能)");
  };

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-lime/10 rounded-full px-4 py-2 mb-4">
            <Zap className="w-4 h-4 text-lime" />
            <span className="text-sm font-medium text-charcoal">交互式演示</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-charcoal mb-4">
            亲身体验 LexGuard AI
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            上传一份合同，感受 AI 如何在几秒钟内完成专业级审查
          </p>
        </div>

        {/* Demo Container */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Step 1: Upload */}
            {step === 'upload' && (
              <div className="p-12">
                <div 
                  onClick={handleFileSelect}
                  className={cn(
                    "border-2 border-dashed border-gray-200 rounded-2xl p-12",
                    "hover:border-lime hover:bg-lime/5 transition-all cursor-pointer",
                    "flex flex-col items-center justify-center"
                  )}
                >
                  <div className="w-20 h-20 rounded-2xl bg-lime/10 flex items-center justify-center mb-6">
                    <Upload className="w-10 h-10 text-lime" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal mb-2">
                    点击或拖拽上传合同
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    支持 PDF、Word、图片格式，最大 50MB
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Shield className="w-4 h-4" />
                    <span>文件将被安全加密处理</span>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Sample files */}
                <div className="mt-8">
                  <p className="text-sm text-gray-400 mb-4">或者试用示例合同：</p>
                  <div className="flex flex-wrap gap-3">
                    {['服务协议模板', '劳动合同示例', '采购合同范本'].map((name, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setUploadedFile(name + '.pdf');
                          startAnalysis();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-lime/10 rounded-lg transition-colors"
                      >
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Analyzing */}
            {step === 'analyzing' && (
              <div className="p-12">
                <div className="max-w-md mx-auto text-center">
                  <div className="relative w-32 h-32 mx-auto mb-8">
                    {/* Animated rings */}
                    <div className="absolute inset-0 border-4 border-lime/20 rounded-full" />
                    <div className="absolute inset-2 border-4 border-lime/40 rounded-full animate-pulse" />
                    <div className="absolute inset-4 border-4 border-lime/60 rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Search className="w-10 h-10 text-lime animate-bounce" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-charcoal mb-2">
                    AI 正在分析合同...
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {uploadedFile}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-lime rounded-full transition-all duration-300"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-lime" />
                      <span>解析文档结构</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={cn("w-4 h-4", analysisProgress > 30 ? "text-lime" : "text-gray-300")} />
                      <span>识别风险条款</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={cn("w-4 h-4", analysisProgress > 70 ? "text-lime" : "text-gray-300")} />
                      <span>生成审查报告</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Results */}
            {step === 'results' && (
              <div className="flex flex-col lg:flex-row">
                {/* Sidebar - Risk List */}
                <div className="lg:w-1/3 bg-gray-50 p-6 border-r border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-charcoal">风险识别结果</h3>
                    <button 
                      onClick={resetDemo}
                      className="text-sm text-gray-400 hover:text-charcoal"
                    >
                      重新上传
                    </button>
                  </div>

                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-500">1</div>
                      <div className="text-xs text-red-400">高风险</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-500">1</div>
                      <div className="text-xs text-orange-400">中风险</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-500">1</div>
                      <div className="text-xs text-green-400">低风险</div>
                    </div>
                  </div>

                  {/* Risk items */}
                  <div className="space-y-3">
                    {risks.map((risk) => (
                      <button
                        key={risk.id}
                        onClick={() => setSelectedRisk(risk)}
                        className={cn(
                          "w-full text-left p-4 rounded-xl transition-all",
                          selectedRisk?.id === risk.id
                            ? "bg-white shadow-md border-l-4"
                            : "bg-white hover:shadow-sm",
                          risk.type === 'high' && (selectedRisk?.id === risk.id ? "border-l-red-500" : ""),
                          risk.type === 'medium' && (selectedRisk?.id === risk.id ? "border-l-orange-500" : ""),
                          risk.type === 'low' && (selectedRisk?.id === risk.id ? "border-l-green-500" : ""),
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                            risk.type === 'high' && "bg-red-500",
                            risk.type === 'medium' && "bg-orange-500",
                            risk.type === 'low' && "bg-green-500",
                          )} />
                          <div>
                            <h4 className="font-medium text-charcoal text-sm">{risk.title}</h4>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{risk.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-6 space-y-3">
                    <MagneticButton 
                      variant="primary" 
                      className="w-full justify-center text-sm"
                      onClick={handleFixAll}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      一键修复所有问题
                    </MagneticButton>
                    <MagneticButton 
                      variant="outline" 
                      className="w-full justify-center text-sm"
                      onClick={handleExport}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      导出审查报告
                    </MagneticButton>
                  </div>
                </div>

                {/* Main Content - Risk Detail */}
                <div className="lg:w-2/3 p-6">
                  {selectedRisk ? (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium",
                          selectedRisk.type === 'high' && "bg-red-100 text-red-600",
                          selectedRisk.type === 'medium' && "bg-orange-100 text-orange-600",
                          selectedRisk.type === 'low' && "bg-green-100 text-green-600",
                        )}>
                          {selectedRisk.type === 'high' && '高风险'}
                          {selectedRisk.type === 'medium' && '中风险'}
                          {selectedRisk.type === 'low' && '低风险'}
                        </div>
                        <span className="text-gray-400 text-sm">条款分析</span>
                      </div>

                      <h2 className="text-2xl font-bold text-charcoal mb-4">
                        {selectedRisk.title}
                      </h2>

                      <div className="space-y-6">
                        <div className="bg-gray-50 rounded-xl p-5">
                          <h4 className="font-medium text-charcoal mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            问题描述
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {selectedRisk.description}
                          </p>
                        </div>

                        <div className="bg-lime/5 rounded-xl p-5 border border-lime/20">
                          <h4 className="font-medium text-charcoal mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-lime" />
                            AI 修改建议
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            {selectedRisk.suggestion}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>预计节省 2 小时人工审查时间</span>
                          </div>
                        </div>

                        {/* Original vs Suggested */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-red-50 rounded-xl p-4">
                            <h5 className="text-xs font-medium text-red-600 mb-2">原文</h5>
                            <p className="text-sm text-gray-600 line-through">
                              {selectedRisk.clause || "（未提取到原文）"}
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-xl p-4">
                            <h5 className="text-xs font-medium text-green-600 mb-2">建议修改</h5>
                            <p className="text-sm text-gray-600">
                              {/* 简单起见，这里复用 suggestion，实际可能需要后端返回具体的修改后条款 */}
                              {selectedRisk.suggestion}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <MagneticButton 
                            variant="primary" 
                            className="text-sm"
                            onClick={handleApplyFix}
                          >
                            应用此修改
                          </MagneticButton>
                          <MagneticButton 
                            variant="outline" 
                            className="text-sm"
                            onClick={handleIgnoreRisk}
                          >
                            忽略此问题
                          </MagneticButton>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                      <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <Shield className="w-10 h-10 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-medium text-charcoal mb-2">
                        选择左侧风险项查看详情
                      </h3>
                      <p className="text-gray-400 text-sm">
                        点击任意风险项，查看 AI 的详细分析和修改建议
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Demo info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              这是简化版演示体验，
              <button 
                onClick={() => setStep('upload')}
                className="text-lime hover:underline ml-1"
              >
                注册免费试用
              </button>
              解锁全部功能
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
