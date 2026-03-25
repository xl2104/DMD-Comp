
import React, { useState, useEffect } from 'react';
import { Feedback, FeedbackStatus } from '../types';
import { getFeedbacks, submitFeedback, upvoteFeedback } from '../services/feedbackService';
import { X, MessageSquare, ThumbsUp, Camera, Plus, Send, CheckCircle2, Clock, Hammer, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

interface Props {
  username: string;
  onClose: () => void;
}

export const FeedbackModal: React.FC<Props> = ({ username, onClose }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [content, setContent] = useState('');
  const [isBug, setIsBug] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFeedbacks(getFeedbacks());
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Fix: Explicitly type the file as File to avoid 'unknown' type error when calling readAsDataURL
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    await submitFeedback(username, content, images, isBug);
    setFeedbacks(getFeedbacks());
    setContent('');
    setImages([]);
    setIsBug(false);
    setSubmitting(false);
    setView('list');
  };

  const handleUpvote = (id: string) => {
    upvoteFeedback(id);
    setFeedbacks(getFeedbacks());
  };

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case 'replied': 
        return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase"><CheckCircle2 className="w-3 h-3" /> 已回复</span>;
      case 'scheduled': 
        return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase"><Hammer className="w-3 h-3" /> 已安排优化</span>;
      case 'completed': 
        return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase"><CheckCircle2 className="w-3 h-3" /> 已完成优化</span>;
      default: 
        return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold uppercase"><Clock className="w-3 h-3" /> 待处理</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl h-[80vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 rounded-xl">
              <MessageSquare className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">意见反馈与FAQ</h2>
              <p className="text-[10px] text-gray-500">家属们，请提交使用过程中的疑问和改进建议。</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* View Switcher */}
        <div className="flex border-b border-gray-100 shrink-0">
          <button 
            onClick={() => setView('list')}
            className={`flex-1 py-3 text-sm font-bold transition-all ${view === 'list' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/30' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            查看所有反馈
          </button>
          <button 
            onClick={() => setView('create')}
            className={`flex-1 py-3 text-sm font-bold transition-all ${view === 'create' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/30' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            提交新反馈
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {view === 'list' ? (
            <div className="space-y-4">
              {feedbacks.map(fb => (
                <div key={fb.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">{fb.username}</span>
                      <span className="text-gray-300 text-[10px]">•</span>
                      <span className="text-[10px] text-gray-400">{fb.timestamp}</span>
                    </div>
                    {getStatusBadge(fb.status)}
                  </div>
                  
                  <div className="flex items-start gap-3 mb-4">
                    {fb.isBug ? <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> : <Plus className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />}
                    <p className="text-sm text-gray-700 leading-relaxed">{fb.content}</p>
                  </div>

                  {fb.images.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                      {fb.images.map((img, i) => (
                        <img key={i} src={img} alt="Screenshot" className="w-20 h-20 object-cover rounded-lg border border-gray-100 flex-shrink-0" />
                      ))}
                    </div>
                  )}

                  {fb.reply && (
                    <div className="bg-brand-50/50 p-3 rounded-lg border border-brand-100 mb-3 ml-7">
                      <p className="text-xs text-brand-800"><span className="font-bold">后台回复：</span>{fb.reply}</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button 
                      onClick={() => handleUpvote(fb.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-100 text-xs font-medium text-gray-500 hover:border-brand-500 hover:text-brand-600 transition-all bg-white shadow-sm"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      赞同 ({fb.upvotes})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  您的每一个反馈都将帮助我们完善工具。欢迎提出具体的功能改良建议或报告Bug（请附带截屏）。
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">反馈类型</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsBug(false)}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all text-sm font-bold ${!isBug ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-100 text-gray-400'}`}
                  >
                    建议/功能需求
                  </button>
                  <button 
                    onClick={() => setIsBug(true)}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all text-sm font-bold ${isBug ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-100 text-gray-400'}`}
                  >
                    Bug 报告
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">详细描述</label>
                <textarea 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="请输入具体内容..."
                  className="w-full h-32 border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none bg-white shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">图片附件 (截屏)</label>
                <div className="flex flex-wrap gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm" />
                      <button 
                        onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-all">
                    <Plus className="w-6 h-6 text-gray-400" />
                    <span className="text-[10px] text-gray-400">添加图片</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <button 
                disabled={!content.trim() || submitting}
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 disabled:opacity-50 transition-all"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                提交反馈
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
