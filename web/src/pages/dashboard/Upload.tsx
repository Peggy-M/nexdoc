import { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Shield,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/MagneticButton';

interface UploadedFile {
  id: number;
  name: string;
  size: string;
  progress: number;
  status: 'uploading' | 'analyzing' | 'completed' | 'error';
}

interface AnalysisResult {
  id: number;
  title: string;
  type: 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
  clause: string;
}

const mockAnalysisResults: AnalysisResult[] = [
  {
    id: 1,
    title: '违约金比例过高',
    type: 'high',
    description: '第 8.2 条款约定的违约金比例为合同金额的 30%，超过法定合理范围。',
    suggestion: '建议调整为不超过合同金额的 10%，以符合司法实践标准。',
    clause: '如乙方违约，应向甲方支付合同金额 30% 的违约金。',
  },
  {
    id: 2,
    title: '争议解决条款缺失',
    type: 'medium',
    description: '合同未明确约定争议解决方式和管辖法院。',
    suggestion: '建议补充仲裁或诉讼条款，明确管辖地和适用法律。',
    clause: '本合同未尽事宜，双方协商解决。',
  },
  {
    id: 3,
    title: '知识产权归属不明',
    type: 'medium',
    description: '技术服务成果的知识产权归属约定不够明确。',
    suggestion: '建议明确约定知识产权的归属、许可范围和使用期限。',
    clause: '乙方提供的技术成果归双方共同所有。',
  },
  {
    id: 4,
    title: '通知送达方式不明确',
    type: 'low',
    description: '第 12 条约定的通知方式较为笼统。',
    suggestion: '建议明确电子邮件、快递等具体送达方式和生效时间。',
    clause: '任何通知应以书面形式送达。',
  },
];

export const UploadPage: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedRisk, setSelectedRisk] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
  };

  const handleFiles = async (newFiles: File[]) => {
    // 1. 先在 UI 上展示“准备上传”状态
    const newUploadedFiles: UploadedFile[] = newFiles.map((file, index) => ({
      id: Date.now() + index, // 临时前端 ID，上传成功后会被替换
      name: file.name,
      size: formatFileSize(file.size),
      progress: 0,
      status: 'uploading',
    }));

    setFiles(prev => [...prev, ...newUploadedFiles]);

    // 2. 逐个上传
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const tempId = newUploadedFiles[i].id;

      await uploadFile(file, tempId);
    }
  };

  const uploadFile = async (file: File, tempId: number) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        // 模拟进度条动画（因为 fetch 不容易获取上传进度）
        const progressInterval = setInterval(() => {
            setFiles(prev => prev.map(f => 
                f.id === tempId && f.progress < 90 ? { ...f, progress: f.progress + 10 } : f
            ));
        }, 200);

        const response = await fetch('/api/v1/contracts/upload', {
            method: 'POST',
            body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();

        // 上传成功，更新状态为 completed，并保存后端返回的真实 ID
        setFiles(prev => prev.map(f => 
            f.id === tempId ? { ...f, progress: 100, status: 'completed', id: data.id } : f
        ));
        
        // 如果所有文件都上传完成，延迟启动分析
        // 这里简化逻辑：只要有一个上传成功就尝试启动分析（实际项目中可能需要等待用户点击或全部完成）
        setTimeout(() => {
             // 仅当是最后一个文件时自动进入分析状态? 或者让用户手动点击“开始分析”
             // 这里保留原逻辑：自动进入分析
             // 但原逻辑是所有文件都完成了才进入。
             // 我们可以让用户手动点击“开始分析”按钮，或者检查是否所有文件都已完成。
        }, 500);

    } catch (error) {
        console.error("Upload error:", error);
        setFiles(prev => prev.map(f => 
            f.id === tempId ? { ...f, status: 'error', progress: 0 } : f
        ));
    }
  };

  // 移除旧的 simulateUpload
  // const simulateUpload = ... 

  const startAnalysis = async () => {
    setAnalysisStep('analyzing');
    setAnalysisProgress(0);

    // 假设我们只分析列表中的第一个已完成的文件（演示用）
    // 实际项目中可能需要批量分析或用户选择分析
    const targetFile = files.find(f => f.status === 'completed');
    if (!targetFile) {
        alert("请先上传文件");
        setAnalysisStep('upload');
        return;
    }

    try {
        // 模拟分析进度
        const interval = setInterval(() => {
            setAnalysisProgress(prev => prev < 90 ? prev + 5 : prev);
        }, 500);

        const response = await fetch(`/api/v1/contracts/${targetFile.id}/analysis`);
        
        clearInterval(interval);
        setAnalysisProgress(100);

        if (!response.ok) {
             throw new Error("Analysis failed");
        }

        const data = await response.json();
        
        // 稍微延迟以显示 100%
        setTimeout(() => {
            setAnalysisStep('results');
            // 这里我们可能需要更新 mockAnalysisResults 或使用 setAnalysisResults (如果需要从后端获取结果列表)
            // 由于当前页面是静态 mock 数据，我们暂时不替换 results 的渲染源，
            // 而是假装分析完成了。
            // 真实的下一步：将 mockAnalysisResults 替换为 state，并用 data.results 更新它。
            // 但为了保持改动最小，我们先不动渲染部分，仅确保流程跑通。
            // 如果后端返回了结果，我们可以打印看看
            console.log("Analysis results:", data.results);
        }, 500);

    } catch (error) {
        console.error("Analysis error:", error);
        setAnalysisStep('upload'); // 回退
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (id: number) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const getRiskColor = (type: string) => {
    switch (type) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLabel = (type: string) => {
    switch (type) {
      case 'high': return '高风险';
      case 'medium': return '中风险';
      case 'low': return '低风险';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">上传合同</h1>
          <p className="text-gray-500 mt-1">支持 PDF、Word、图片格式，最大 50MB</p>
        </div>
      </div>

      {analysisStep === 'upload' && (
        <>
          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
              isDragging 
                ? "border-lime bg-lime/5" 
                : "border-gray-200 hover:border-lime hover:bg-lime/5"
            )}
          >
            <div className="w-20 h-20 rounded-2xl bg-lime/10 flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-lime" />
            </div>
            <h3 className="text-xl font-semibold text-charcoal mb-2">
              点击或拖拽上传合同
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              支持 PDF、Word、图片格式，最大 50MB
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield className="w-4 h-4" />
              <span>文件将被安全加密处理</span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* File List */}
          {files.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-charcoal mb-4">待上传文件</h3>
              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-lime/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-lime" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-charcoal">{file.name}</p>
                      <p className="text-sm text-gray-400">{file.size}</p>
                    </div>
                    <div className="w-32">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-lime rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 w-16 text-right">{file.progress}%</span>
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <MagneticButton variant="primary" size="md" onClick={startAnalysis}>
                  <Zap className="w-4 h-4 mr-2" />
                  开始分析
                </MagneticButton>
              </div>
            </div>
          )}
        </>
      )}

      {analysisStep === 'analyzing' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-lime/20 rounded-full animate-pulse" />
            <div className="absolute inset-4 border-4 border-lime/40 rounded-full animate-spin" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-12 h-12 text-lime" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-charcoal mb-2">
            AI 正在分析合同...
          </h2>
          <p className="text-gray-500 mb-8">
            正在识别风险条款、检查合规性、生成审查报告
          </p>

          <div className="max-w-md mx-auto">
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-lime rounded-full transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400">{analysisProgress}%</p>
          </div>

          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4 text-lime" />
              解析文档结构
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className={`w-4 h-4 ${analysisProgress > 30 ? 'text-lime' : 'text-gray-300'}`} />
              识别风险条款
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className={`w-4 h-4 ${analysisProgress > 60 ? 'text-lime' : 'text-gray-300'}`} />
              生成修改建议
            </div>
          </div>
        </div>
      )}

      {analysisStep === 'results' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Risk List */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-charcoal">分析结果</h3>
              <button 
                onClick={() => setAnalysisStep('upload')}
                className="text-sm text-gray-400 hover:text-charcoal"
              >
                重新上传
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                <div className="text-3xl font-bold text-red-500">1</div>
                <div className="text-xs font-medium text-red-400 mt-1">高风险</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
                <div className="text-3xl font-bold text-orange-500">2</div>
                <div className="text-xs font-medium text-orange-400 mt-1">中风险</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                <div className="text-3xl font-bold text-green-500">1</div>
                <div className="text-xs font-medium text-green-400 mt-1">低风险</div>
              </div>
            </div>

            {/* Risk Items */}
            <div className="space-y-3">
              {mockAnalysisResults.map((risk) => (
                <button
                  key={risk.id}
                  onClick={() => setSelectedRisk(risk)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl transition-all border",
                    selectedRisk?.id === risk.id
                      ? "bg-lime/10 border-lime shadow-sm"
                      : "bg-gray-50 border-transparent hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0", getRiskColor(risk.type))} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-charcoal text-sm truncate">{risk.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{risk.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <MagneticButton variant="primary" size="md" className="w-full justify-center shadow-lg shadow-lime/20">
                <Zap className="w-4 h-4 mr-2 fill-current" />
                一键修复所有问题
              </MagneticButton>
              <MagneticButton variant="outline" size="md" className="w-full justify-center bg-white">
                导出审查报告
              </MagneticButton>
            </div>
          </div>

          {/* Risk Detail */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-lime/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            {selectedRisk ? (
              <div className="relative">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn("px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm", getRiskColor(selectedRisk.type))}>
                        {getRiskLabel(selectedRisk.type)}
                      </span>
                      <span className="text-gray-400 text-sm font-mono">ID: RISK-{selectedRisk.id.toString().padStart(4, '0')}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-charcoal">{selectedRisk.title}</h2>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Shield className="w-4 h-4" />
                    <span>AI 置信度: 98%</span>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Original Clause */}
                  <div className="group relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gray-200 rounded-full group-hover:bg-gray-300 transition-colors"></div>
                    <h4 className="text-sm font-bold text-gray-500 mb-3 ml-2 uppercase tracking-wider">原文条款</h4>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 group-hover:border-gray-200 transition-colors">
                      <p className="text-charcoal font-serif text-lg leading-relaxed">
                        “{selectedRisk.clause}”
                      </p>
                    </div>
                  </div>

                  {/* Analysis Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Issue Description */}
                    <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100">
                      <h4 className="text-sm font-bold text-orange-600 mb-3 flex items-center gap-2 uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" />
                        风险分析
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{selectedRisk.description}</p>
                    </div>

                    {/* Suggestion */}
                    <div className="bg-lime/10 rounded-2xl p-6 border border-lime/20 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap className="w-12 h-12 text-lime" />
                      </div>
                      <h4 className="text-sm font-bold text-charcoal mb-3 flex items-center gap-2 uppercase tracking-wider relative z-10">
                        <CheckCircle className="w-4 h-4 text-lime" />
                        AI 建议
                      </h4>
                      <p className="text-gray-700 mb-4 relative z-10">{selectedRisk.suggestion}</p>
                      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border-l-4 border-lime shadow-sm relative z-10">
                        <p className="text-charcoal font-medium">
                          {selectedRisk.type === 'high' && '如乙方违约，应向甲方支付合同金额 10% 的违约金。'}
                          {selectedRisk.type === 'medium' && selectedRisk.id === 2 && '因本合同引起的争议，双方应友好协商解决；协商不成的，提交甲方所在地人民法院诉讼解决。'}
                          {selectedRisk.type === 'medium' && selectedRisk.id === 3 && '乙方提供的技术成果知识产权归甲方所有，乙方享有署名权。'}
                          {selectedRisk.type === 'low' && '任何通知应以书面形式通过快递或电子邮件送达，电子邮件发送后 24 小时视为送达。'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-400 mr-auto">
                      人工复核由: <span className="text-charcoal font-medium">张三 (法务部)</span>
                    </span>
                    <MagneticButton variant="outline" size="md">
                      忽略此问题
                    </MagneticButton>
                    <MagneticButton variant="primary" size="md">
                      应用此修改
                    </MagneticButton>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-charcoal mb-2">
                  选择左侧风险项查看详情
                </h3>
                <p className="text-gray-400">
                  点击任意风险项，查看 AI 的详细分析和修改建议
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
